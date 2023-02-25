describe('National Highways tests', function() {
    it('report as defaults to body', function() {
        cy.server();
        cy.route('**/mapserver/highways*', 'fixture:highways.xml').as('highways-tilma');
        cy.route('**/report/new/ajax*', 'fixture:highways-ajax.json').as('report-ajax');
        cy.visit('/');
        cy.contains('Go');
        cy.get('[name=pc]').type(Cypress.env('postcode'));
        cy.get('[name=pc]').parents('form').submit();
        cy.url().should('include', '/around');
        cy.get('#map_box').click(240, 249);
        cy.wait('@report-ajax');
        cy.wait('@highways-tilma');

        cy.get('#highways').should('contain', 'M6');
        cy.get('#js-councils_text').should('contain', 'National Highways');
        cy.get('#single_body_only').should('have.value', 'National Highways');
        cy.nextPageReporting();
        cy.get('#subcategory_NationalHighways').should('be.visible');
        cy.go('back');

        cy.get('#js-not-highways').click();
        cy.get('#js-councils_text').should('contain', 'Borsetshire');
        cy.get('#single_body_only').should('have.value', '');
        cy.nextPageReporting();
        cy.get('#form_category_fieldset').should('be.visible');
        cy.get('#form_category_fieldset input[value="National Highways"]').should('not.be.visible');
        cy.go('back');

        cy.get('#js-highways').click({ force: true });
        cy.get('#js-councils_text').should('contain', 'National Highways');
        cy.get('#single_body_only').should('have.value', 'National Highways');
        cy.nextPageReporting();
        cy.pickSubcategory('National Highways', 'Sign issue');
    });
});
