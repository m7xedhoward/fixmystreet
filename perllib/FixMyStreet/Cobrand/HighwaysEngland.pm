package FixMyStreet::Cobrand::HighwaysEngland;
use parent 'FixMyStreet::Cobrand::UK';

use strict;
use warnings;
use DateTime;

sub council_name { 'National Highways' }

sub council_url { 'highwaysengland' }

sub site_key { 'highwaysengland' }

sub restriction { { cobrand => shift->moniker } }

sub hide_areas_on_reports { 1 }

sub send_questionnaires { 0 }

sub suggest_duplicates { 1 }

sub all_reports_single_body { { name => 'National Highways' } }

# Copying of functions from UKCouncils that are needed here also - factor out to a role of some sort?
sub cut_off_date { '2020-11-09' }
sub problems_restriction { FixMyStreet::Cobrand::UKCouncils::problems_restriction($_[0], $_[1]) }
sub problems_on_map_restriction { $_[0]->problems_restriction($_[1]) }
sub problems_sql_restriction { FixMyStreet::Cobrand::UKCouncils::problems_sql_restriction($_[0], $_[1]) }
sub users_restriction { FixMyStreet::Cobrand::UKCouncils::users_restriction($_[0], $_[1]) }
sub updates_restriction { FixMyStreet::Cobrand::UKCouncils::updates_restriction($_[0], $_[1]) }
sub base_url { FixMyStreet::Cobrand::UKCouncils::base_url($_[0]) }
sub contact_name { FixMyStreet::Cobrand::UKCouncils::contact_name($_[0]) }
sub contact_email { FixMyStreet::Cobrand::UKCouncils::contact_email($_[0]) }

# Make sure any reports made when site was only fully anonymous remain anonymous
my $non_anon = DateTime->new( year => 2022, month => 10, day => 5 );

sub munge_problem_list {
    my ($self, $problem) = @_;
    if ($problem->created < $non_anon) {
        $problem->anonymous(1);
    }
}
sub munge_update_list {
    my ($self, $update) = @_;
    if ($update->created < $non_anon) {
        $update->anonymous(1);
    }
}

sub admin_allow_user {
    my ( $self, $user ) = @_;
    return 1 if $user->is_superuser;
    return undef unless defined $user->from_body;
    return $user->from_body->name eq 'National Highways';
}

sub report_form_extras {
    ( { name => 'where_hear' } )
}

sub enter_postcode_text { 'Enter a location, road name or postcode' }

sub example_places {
    my $self = shift;
    return $self->feature('example_places') || $self->next::method();
}

sub geocode_postcode {
    my ( $self, $s ) = @_;

    if ($s =~ /^\s*[AM]\d+\s*$/i) {
        return {
            error => "Please be more specific about the location of the issue, eg M1, Jct 16 or A5, Towcester"
        };
    }

    return $self->next::method($s);
}

sub lookup_by_ref_regex {
    return qr/^\s*((?:FMS\s*)?\d+)\s*$/i;
}

sub lookup_by_ref {
    my ($self, $ref) = @_;

    if ( $ref =~ s/^\s*FMS\s*//i ) {
        return { 'id' => $ref };
    }

    return 0;
}

sub allow_photo_upload { 0 }

sub allow_anonymous_reports { 'button' }

sub admin_user_domain { ( 'highwaysengland.co.uk', 'nationalhighways.co.uk' ) }

sub abuse_reports_only { 1 }

sub anonymous_account {
    my $self = shift;
    return {
        email => $self->feature('anonymous_account') . '@' . 'highwaysengland.co.uk',
        name => 'Anonymous user',
    };
}

# Bypass photo requirement, we have none
sub recent_photos {
    my ( $self, $area, $num, $lat, $lon, $dist ) = @_;
    return $self->problems->recent if $area eq 'front';
    return [];
}

sub area_check {
    my ( $self, $params, $context ) = @_;

    my $areas = $params->{all_areas};
    $areas = {
        map { $_->{id} => $_ }
        # If no country, is prefetched area and can assume is E
        grep { ($_->{country} || 'E') eq 'E' }
        values %$areas
    };
    return $areas if %$areas;

    my $error_msg = 'Sorry, this site only covers England.';
    return ( 0, $error_msg );
}

sub fetch_area_children {
    my $self = shift;

    my $areas = FixMyStreet::MapIt::call('areas', $self->area_types);
    $areas = {
        map { $_->{id} => $_ }
        grep { ($_->{country} || 'E') eq 'E' }
        values %$areas
    };
    return $areas;
}

sub report_new_munge_after_insert {
    my ($self, $report) = @_;

    my %new = (
        title => _redact($report->title),
        detail => _redact($report->detail),
    );

    # Data used by report_moderate_audit
    my $c = $self->{c};
    $c->stash->{history} = $report->new_related( moderation_original_data => {
        title => $report->title,
        detail => $report->detail,
        photo => $report->photo,
        anonymous => $report->anonymous,
        longitude => $report->longitude,
        latitude => $report->latitude,
        category => $report->category,
        $report->extra ? (extra => $report->extra) : (),
    });
    $c->stash->{problem} = $report;
    $c->stash->{moderation_reason} = 'Automatic data redaction';
    $c->stash->{moderation_no_email} = 1;

    my @types;
    foreach (qw(title detail)) {
        if ($report->$_ ne $new{$_}) {
            $report->$_($new{$_});
            push @types, $_;
        }
    }

    $c->forward( '/moderate/report_moderate_audit', \@types );
}

sub _redact {
    my $s = shift;

    my $atext = "[A-Za-z0-9!#\$%&'*+\-/=?^_`{|}~]";
    my $atom = "$atext+";
    my $local_part = "$atom(\\s*\\.\\s*$atom)*";
    my $sub_domain = '[A-Za-z0-9][A-Za-z0-9-]*';
    my $domain = "$sub_domain(\\s*\\.\\s*$sub_domain)*";
    $s =~ s/$local_part\@$domain/[email removed]/g;

    $s =~ s/\(?\+?[0-9](?:[\s()-]*[0-9]){9,}/[phone removed]/g;
    return $s;
}

sub munge_report_new_bodies {
    my ($self, $bodies) = @_;
    # On the cobrand there is only the HE body
    %$bodies = map { $_->id => $_ } grep { $_->name eq 'National Highways' } values %$bodies;
}

# Want to remove the group our categories are all in
sub munge_report_new_contacts {
    my ($self, $contacts) = @_;
    foreach (@$contacts) {
        $_->unset_extra_metadata("group");
    }
}

sub munge_mixed_category_groups {
    my ($self, $list) = @_;

    for my $cat_item (@$list) {
        my $clean_name = $cat_item->category_display;
        $clean_name =~ s/ \(NH\)//;
        $cat_item->set_extra_metadata('display_name', $clean_name);
    }
}

sub national_highways_cleaning_groups {
    my ($self, $category_groups) = @_;

    # We only care if there is a National Highways group
    my ($nh_group) = grep { ($_->{name} || '') eq $self->council_name } @$category_groups;
    return unless $nh_group;

    my $c = $self->{c};
    my $not_he_litter = $c->stash->{report_new_is_on_he_road_not_litter};
    if (!defined $not_he_litter) {
        # We delayed working it out because every /around page calls
        # report_new_is_on_he_road but do it now we need to know
        my ($x, $y) = ($c->stash->{longitude}, $c->stash->{latitude});
        $not_he_litter = $self->_report_new_is_on_he_road_not_litter($x, $y);
    }

    for my $cat_item (@{$nh_group->{categories}}) {
        my $clean_name = $cat_item->category_display;
        $clean_name =~ s/ \(NH\)//;
        $cat_item->set_extra_metadata('display_name', $clean_name);
    }

    # Don't change anything else unless we're on a HE non-litter road
    return unless $not_he_litter;

    # NH do not want flytipping or litter reports on these roads, take them out
    if (defined $c->stash->{he_referral}) {
        @{$nh_group->{categories}} = ();
    } else {
        @{$nh_group->{categories}} = grep { $_->category_display !~ /Flytipping|Litter/ } @{$nh_group->{categories}};
    }
    # Put any council street cleaning categories we can find into the NH group,
    # so they'll still appear if "on the HE road" is picked
    my %cleaning_cats = map { $_ => 1 } @{ $self->_cleaning_categories };
    for my $cat (@$category_groups) {
        if ($cat->{name}) {
            next if $cat->{name} eq $self->council_name;
            foreach my $c (@{$cat->{categories}}) {
                if ($cleaning_cats{$cat->{name}}) {
                    my $full_title = "$cat->{name}: " . $c->category_display;
                    $c->set_extra_metadata(display_name => $full_title);
                    push @{$nh_group->{categories}}, $c;
                } elsif ($cleaning_cats{$c->category_display}) {
                    push @{$nh_group->{categories}}, $c;
                }
            }
        } elsif ($cleaning_cats{$cat->category_display}) {
            push @{$nh_group->{categories}}, $cat;
        }
    }
    @{$nh_group->{categories}} = sort {$a->category_display cmp $b->category_display } @{$nh_group->{categories}};
}

sub report_new_is_on_he_road {
    my ( $self ) = @_;

    return if FixMyStreet->test_mode eq 'cypress';

    my ($x, $y) = (
        $self->{c}->stash->{longitude},
        $self->{c}->stash->{latitude},
    );

    my $cfg = {
        url => "https://tilma.mysociety.org/mapserver/highways",
        srsname => "urn:ogc:def:crs:EPSG::4326",
        typename => "Highways",
        filter => "<Filter><DWithin><PropertyName>geom</PropertyName><gml:Point><gml:coordinates>$x,$y</gml:coordinates></gml:Point><Distance units='m'>15</Distance></DWithin></Filter>",
        accept_feature => sub { 1 },
    };

    my $ukc = FixMyStreet::Cobrand::UKCouncils->new;
    my $features = $ukc->_fetch_features($cfg, $x, $y);
    my $nearest = $ukc->_nearest_feature($cfg, $x, $y, $features);
    # National Highways responsible for litter on Motorways and AM roads
    # And doesn't matter if we are not on a NH road
    if ($nearest && $nearest->{properties}->{'ROA_NUMBER'} =~ /^(M|A\d+M)/) {
        $self->{c}->stash->{report_new_is_on_he_road_not_litter} = 0;
    } elsif (!scalar @$features) {
        $self->{c}->stash->{report_new_is_on_he_road_not_litter} = 0;
    }
    return scalar @$features ? 1 : 0;
}

sub _report_new_is_on_he_road_not_litter {
    my ( $self, $x, $y ) = @_;

    my $cfg = {
        url => "https://tilma.mysociety.org/mapserver/highways",
        srsname => "urn:ogc:def:crs:EPSG::4326",
        typename => "highways_litter_pick",
        filter => "<Filter><DWithin><PropertyName>geom</PropertyName><gml:Point><gml:coordinates>$x,$y</gml:coordinates></gml:Point><Distance units='m'>15</Distance></DWithin></Filter>",
    };
    my $ukc = FixMyStreet::Cobrand::UKCouncils->new;
    my $features = $ukc->_fetch_features($cfg, $x, $y);
    # If we've matched then litter is their responsibility, so return reverse of that
    return scalar @$features ? 0 : 1;
}

sub dashboard_export_problems_add_columns {
    my ($self, $csv) = @_;

    $csv->modify_csv_header( Ward => 'Council' );

    $csv->objects_attrs({
        '+columns' => ['comments.text', 'comments.extra', 'user.name'],
        join => { comments => 'user' },
    });

    $csv->add_csv_columns(
        area_name => 'Area name',
        where_hear => 'How you found us',
    );
    for (my $i=1; $i<=5; $i++) {
        $csv->add_csv_columns(
            "update_text_$i" => "Update $i",
            "update_date_$i" => "Update $i date",
            "update_name_$i" => "Update $i name",
        );
    }

    $csv->csv_extra_data(sub {
        my $report = shift;

        my $fields = {
            area_name => $report->get_extra_field_value('area_name'),
            where_hear => $report->get_extra_metadata('where_hear'),
        };

        my $i = 1;
        for my $update ($report->comments->search(undef, { order_by => ['confirmed', 'id'] })) {
            next unless $update->state eq 'confirmed';
            last if $i > 5;
            $fields->{"update_text_$i"} = $update->text;
            $fields->{"update_date_$i"} = $update->confirmed;
            my $staff = $update->get_extra_metadata('contributed_by') || $update->get_extra_metadata('is_body_user') || $update->get_extra_metadata('is_superuser');
            $fields->{"update_name_$i"} = $staff ? $update->user->name : 'public';
            $i++;
        }

        return $fields;
    });
}

# select distinct category from contacts where category ilike '%litter%' or category ilike '%clean%' or category ilike '%fly%tip%';
# search to find categories in all contacts and then manually edited
sub _cleaning_categories { [
    'Accumulated Litter',
    'Cleanliness Issue',
    'Cleanliness Sub Standard',
    'Cleansing',
    'Excessive or dangerous littering',
    'Fly Tipping on a road, footway, verge or open space',
    'Fly Tipping',
    'Fly tipping',
    'Fly-Tipping',
    'Fly-tipping',
    'Flytipping and dumped rubbish',
    'Flytipping',
    'Flytipping/flyposting',
    'General (Cleanliness)',
    'General Litter / Rubbish Collection',
    'General fly tipping',
    'Hazardous fly tipping',
    'Litter On Road/Street Cleaning',
    'Litter and Bins',
    'Litter in Parks & Open spaces',
    'Litter in the street',
    'Litter removal',
    'Litter',
    'Littering',
    'Littering and cleanliness',
    'Rubbish or fly tipping on the roads',
    'Street Cleaning',
    'Street Cleansing',
    'Street cleaning and litter',
    'Street cleaning',
    'Street cleansing',
    'Sweeping & Cleansing Hazard',
    #Bench/cycle rack/litter bin/planter,
    #Bus Station Cleaning - Floor,
    #Bus Station Cleaning - General,
    #Bus Station Cleaning - Toilets,
    #Bus Station Cleaning - Windows,
    #Car Park Cleansing,
    #Damage Public Litter Bin,
    #Damage to litter bin,
    #Dog and litter bins,
    #Fly Tipping on a public right of way,
    #Fly tipping - Enforcement Request,
    #Flytipping (TfL),
    #'Flytipping (off-road)',
    #'Litter bin damaged',
    #'Litter bin full',
    #'Litter bin',
    #Litter Bin Overflowing,
    #Litter Bin on a verge or open space,
    #Litter Bin overflow in Parks & Open spaces,
    #Litter Bin overflow,
    #Litter Bin,
    #Litter Bins Full/Damaged/Missing,
    #Litter Bins,
    #Litter bins,
    #Litter or flytipping in a woodland,
    #Overflowing Litter Bin / Dog Bin,
    #Overflowing Street Litter Bin,
    #Overflowing litter bin,
    #Pavement cleaning,
    #Planter not Clean and Tidy,
    #River Piers - Cleaning,
    #Shelter needs cleaning (hazardous waste),
    #Shelter needs cleaning (not including litter),
    #Street Cleaning Enquiry,
] }

1;
