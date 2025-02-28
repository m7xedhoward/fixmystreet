use FixMyStreet::TestMech;
my $mech = FixMyStreet::TestMech->new;

# Create test data
my $body = $mech->create_body_ok( 2561, 'Bristol County Council' );


subtest 'cobrand assets includes cobrand assets javascript', sub {
    FixMyStreet::override_config {
        ALLOWED_COBRANDS => [ 'fixmystreet' ],
        MAPIT_URL => 'http://mapit.uk/',
    }, sub {
        $mech->get_ok("/report/new?latitude=51.494885&longitude=-2.602237");
        $mech->content_contains('westminster/assets.js');
    };
};

subtest 'cobrand assets includes not applied on cobrand sites', sub {
    FixMyStreet::override_config {
        ALLOWED_COBRANDS => [ 'bathnes' ],
        MAPIT_URL => 'http://mapit.uk/',
        MAP_TYPE => 'FMS,OSM,BathNES,Buckinghamshire',
        STAGING_FLAGS => { skip_checks => 1 },
    }, sub {
        $mech->get_ok("/report/new?latitude=51.494885&longitude=-2.602237");
        $mech->content_lacks('westminster/assets.js');
        $mech->content_contains('fixmystreet-uk-councils/assets.js');
    };
};

done_testing();
