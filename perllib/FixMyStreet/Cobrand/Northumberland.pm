package FixMyStreet::Cobrand::Northumberland;


#use base 'FixMyStreet::Cobrand::Default';
use base 'FixMyStreet::Cobrand::UKCouncils';
use strict;
use warnings;
use Moo;

with 'FixMyStreet::Roles::Open311Alloy';


#use LWP::Simple;
#use URI;
#use Try::Tiny;
#use JSON::MaybeXS;

sub council_area_id { return 1740; }
#sub council_area_id { 2248 }

sub council_area { return 'Northumberland Council'; }
sub council_name { return 'Northumberland County Council';}
sub council_url { return 'www'; }
#sub site_key { return 'maply.co.uk'; }
sub default_zoom { 16; }

sub allow_anonymous_reports { 'button' }
sub anonymous_account { { email => 'anon@maply.co.uk', name => 'Anonymous' } }

sub enter_postcode_text { 'Enter a Northumberland postcode, street name and area, or check an existing report number' }

sub disambiguate_location {
    my $self    = shift;
    my $string  = shift;

    return {
        %{ $self->SUPER::disambiguate_location() },
        centre => '55.30769080650276,-1.8647071378799923',
        bounds => [ <54.7824>,<-2.6898>,<55.8117>,<-1.4599> ],
    };
}

#sub categories_restriction {
#    my ($self, $rs) = @_;
#    return $rs->search( { 'body.name' => [ "Northumberland County Council" ] } );
#}


sub problems_on_map_restriction {
    my ($self, $rs) = @_;
    # Northamptonshire don't want to show district/borough reports
    # on the site
    return $self->problems_restriction($rs);
}
sub send_questionnaires { 0 }

#sub on_map_default_status { 'open' }

sub report_sent_confirmation_email { 'id' }

sub admin_user_domain { '' }

has body_obj => (
    is => 'lazy',
    default => sub {
        FixMyStreet::DB->resultset('Body')->find({ name => 'Northumberland County Council' });
    },
);

#has body_obj => (
#    is => 'lazy',
#    default => sub {
#        FixMyStreet::DB->resultset('Body')->find({ name => 'Northumberland Council' });
#    },
#);

#sub updates_disallowed {
#    my $self = shift;
#    my ($problem) = @_;

    # Only open reports
#    return 1 if $problem->is_fixed || $problem->is_closed;
    # Not on reports made by the body user
#    return 1 if $problem->user_id == $self->body_obj->comment_user_id;
#
#    return $self->next::method(@_);
#}

sub is_defect {
    my ($self, $p) = @_;
    return $p->user_id == $self->body_obj->comment_user_id;
}

sub pin_colour {
    my ($self, $p, $context) = @_;
    return 'blue' if $self->is_defect($p);
    return $self->SUPER::pin_colour($p, $context);
}

#sub pin_colour {
#    my ( $self, $p, $context ) = @_;
#    return 'grey' unless $self->owns_problem( $p );
#    return 'grey' if $p->is_closed;
#    return 'green' if $p->is_fixed;
#    return 'yellow' if $p->state eq 'confirmed';
#    return 'orange'; # all the other `open_states` like "in progress"
#}

#sub problems_on_map_restriction {
#    my ($self, $rs) = @_;
#    # Northumberland don't want to show district/borough reports
    # on the site
#    return $self->problems_restriction($rs);
#}

#sub privacy_policy_url {
#    ''
#}

sub is_two_tier { 0 }

sub get_geocoder { 'OSM' }

sub map_type { 'FMS' }


sub open311_get_update_munging {
    my ($self, $comment) = @_;

    # If we've received an update via Open311, let us always take its state change
    my $state = $comment->problem_state;
    my $p = $comment->problem;
    if ($state && $p->state ne $state && $p->is_visible) {
       $p->state($state);
   }
}

sub open311_config {
    my ($self, $row, $h, $params) = @_;

    $params->{multi_photos} = 1;
    $params->{extended_description} = 'northumberland';
    $params->{upload_files} = 1;
    
}


sub report_validation {
    my ($self, $report, $errors) = @_;

   if ( length( $report->title ) > 120 ) {
      $errors->{title} = sprintf( _('Summaries are limited to %s characters in length. Please shorten your summary'), 120 );
  }
}



1;
