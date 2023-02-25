it('loads the Shropshire FMS Pro front page', function() {
    cy.visit('http://shropshire.localhost:3001/');
    cy.contains('Enter a Shropshire postcode');
});
it('does not allow typing alphabetic characters in the phone field', function() {
    cy.server();
    cy.route('/report/new/ajax*').as('report-ajax');
    cy.route('**mapserver/shropshire*Street_Gazetteer*', 'fixture:shropshire.xml').as('salop-roads-layer');
    cy.visit('http://shropshire.localhost:3001/report/new?latitude=52.855684&longitude=-2.723877');
    cy.wait('@report-ajax');
    cy.wait('@salop-roads-layer');
    cy.pickCategory('Flytipping');
    cy.nextPageReporting();
    // photos page
    cy.nextPageReporting();
    cy.get('input#form_title').type('A case of fly tipping');
    cy.get('textarea#form_detail').type('Van load of domestic refuse.');
    cy.nextPageReporting();
    // about you page
    cy.get('input#form_name').type('John Smith');
    var phone_string = "tel no: 0123 4567890";
    cy.get('input#form_phone').type(phone_string);
    cy.get('input#form_username_register').type("john.smith@example.com");
    cy.get('form#mapForm').submit();
    cy.contains("Please enter a valid UK phone number");
});
it('does accept a correctly formatted UK phone number', function() {
    // carry straight on from above
    var valid_phone_num = "01234 567890";
    cy.get('input#form_phone').focus().clear();
    cy.get('input#form_phone').type(valid_phone_num);
    cy.get('form#mapForm').submit();
    cy.contains("Nearly done! Now check your email…");
});
