Feature: Search product

  Background:
    Given I am logged in as a registered user

  Scenario: Open product details via search
    Given I am on the Home page
    When I search for product "Intel Core i5"
    Then the product details page for "Intel Core i5" is displayed
    And I click on the Logout button

  Scenario: Product details page - Home Page
    Given I am on the Home page
    When I open the product "Intel Core i5" from the product list
    Then the product details page for "Intel Core i5" is displayed
    And I click on the Logout button
