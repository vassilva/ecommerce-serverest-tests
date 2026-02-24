@regression 
Feature: Shopping list - Add Product - Search Path

  Background:
    Given I am logged in as a registered user
    And my shopping list is empty

  Scenario: Search a product and manage it in the shopping list
    Given I am on the Home page
    When I search for product "Intel Core i5"
    And I add the product to the shopping list from the product details page
    Then I see Intel Core i5 in the shopping list with quantity 1

    When I increase the quantity of Intel Core i5
    Then I see Intel Core i5 in the shopping list with quantity 2

    When I decrease the quantity of Intel Core i5
    Then I see Intel Core i5 in the shopping list with quantity 1

    When I clear the shopping list
    Then the shopping list is empty
    And I click on the Logout button
