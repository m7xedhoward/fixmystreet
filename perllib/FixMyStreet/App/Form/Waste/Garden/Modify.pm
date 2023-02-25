package FixMyStreet::App::Form::Waste::Garden::Modify;

use utf8;
use HTML::FormHandler::Moose;
extends 'FixMyStreet::App::Form::Waste';

has_page intro => (
    title => 'Modify your green garden waste subscription',
    template => 'waste/garden/modify_pick.html',
    fields => ['task', 'continue'],
    next => 'alter',
);

has_page alter => (
    title => 'Modify your green garden waste subscription',
    template => 'waste/garden/modify.html',
    fields => ['current_bins', 'bins_wanted', 'name', 'phone', 'email', 'continue_review'],
    field_ignore_list => sub {
        my $page = shift;
        return ['phone', 'email'] unless $page->form->c->stash->{is_staff};
        return [];
    },
    update_field_list => sub {
        my $form = shift;
        my $c = $form->c;
        my $data = $c->stash->{garden_form_data};
        my $current_bins = $c->get_param('current_bins') || $form->saved_data->{current_bins} || $data->{bins};
        my $bins_wanted = $c->get_param('bins_wanted') || $form->saved_data->{bins_wanted} || $data->{bins};
        my $new_bins = $bins_wanted - $current_bins;

        my $edit_current_allowed = $c->cobrand->call_hook('waste_allow_current_bins_edit');
        my $cost_pa = $c->cobrand->garden_waste_cost_pa($bins_wanted);
        my $cost_now_admin = $c->cobrand->garden_waste_new_bin_admin_fee($new_bins);
        $c->stash->{cost_pa} = $cost_pa / 100;
        $c->stash->{cost_now_admin} = $cost_now_admin / 100;

        $c->stash->{new_bin_count} = 0;
        $c->stash->{pro_rata} = 0;
        if ($new_bins > 0) {
            $c->stash->{new_bin_count} = $new_bins;
            my $cost_pro_rata = $c->cobrand->waste_get_pro_rata_cost($new_bins, $data->{end_date});
            $c->stash->{pro_rata} = ($cost_now_admin + $cost_pro_rata) / 100;
        }
        my $max_bins = $data->{max_bins};
        my %bin_params = ( default => $data->{bins}, range_end => $max_bins );
        return {
            name => { default => $c->stash->{is_staff} ? '' : $c->user->name },
            current_bins => { %bin_params, $edit_current_allowed ? (disabled=>0) : () },
            bins_wanted => { %bin_params },
        };
    },
    next => 'summary',
);

with 'FixMyStreet::App::Form::Waste::AboutYou';

has_page summary => (
    fields => ['tandc', 'submit'],
    title => 'Modify your green garden waste subscription',
    template => 'waste/garden/modify_summary.html',
    update_field_list => sub {
        my $form = shift;
        my $c = $form->{c};
        my $data = $form->saved_data;
        my $current_bins = $data->{current_bins};
        my $bin_count = $data->{bins_wanted};
        my $new_bins = $bin_count - $current_bins;
        my $pro_rata = $c->cobrand->waste_get_pro_rata_cost( $new_bins, $c->stash->{garden_form_data}->{end_date});
        my $cost_pa = $c->cobrand->garden_waste_cost_pa($bin_count);
        my $cost_now_admin = $c->cobrand->garden_waste_new_bin_admin_fee($new_bins);
        my $total = $cost_pa;
        $pro_rata += $cost_now_admin;

        $data->{payment_method} = $c->stash->{garden_form_data}->{payment_method};
        $data->{cost_now_admin} = $cost_now_admin / 100;
        $data->{display_pro_rata} = $pro_rata < 0 ? 0 : $pro_rata / 100;
        $data->{display_total} = $total / 100;

        unless ( $c->stash->{is_staff} ) {
            $data->{name} ||= $c->user->name;
            $data->{email} = $c->user->email;
            $data->{phone} ||= $c->user->phone;
        }
        my $button_text = 'Continue to payment';
        if ( $data->{payment_method} eq 'credit_card' || $data->{payment_method} eq 'csc' ) {
            if ( $new_bins <= 0 ) {
                $button_text = 'Confirm changes';
            }
        } elsif ( $data->{payment_method} eq 'direct_debit' ) {
            $button_text = 'Amend Direct Debit';
        }
        return {
            submit => { default => $button_text },
        };
    },
    finished => sub {
        return $_[0]->wizard_finished('process_garden_modification');
    },
    next => 'done',
);

has_page done => (
    title => 'Subscription amended',
    template => 'waste/garden/amended.html',
);

has_field task => (
    type => 'Select',
    label => 'What do you want to do?',
    required => 1,
    widget => 'RadioGroup',
    options => [
        { value => 'modify', label => 'Increase or reduce the number of bins in your subscription' },
        { value => 'cancel', label => 'Cancel your green garden waste subscription' },
    ],
);

has_field current_bins => (
    type => 'Integer',
    label => 'Number of bins currently on site',
    tags => { number => 1 },
    required => 1,
    disabled => 1,
    range_start => 1,
);

has_field bins_wanted => (
    type => 'Integer',
    label => 'How many bins to be emptied (including bins already on site)',
    tags => { number => 1 },
    required => 1,
    range_start => 1,
    tags => {
        hint => 'We will deliver, or remove, bins if this is different from the number of bins already on the property',
    }
);

has_field tandc => (
    type => 'Checkbox',
    required => 1,
    label => 'Terms and conditions',
    option_label => FixMyStreet::Template::SafeString->new(
        'I agree to the <a href="/about/garden_terms" target="_blank">terms and conditions</a>',
    ),
);

has_field continue => (
    type => 'Submit',
    value => 'Continue',
    element_attr => { class => 'govuk-button' },
);

has_field continue_review => (
    type => 'Submit',
    value => 'Review subscription',
    element_attr => { class => 'govuk-button' },
);

has_field submit => (
    type => 'Submit',
    value => 'Continue to payment',
    element_attr => { class => 'govuk-button' },
    order => 999,
);

1;
