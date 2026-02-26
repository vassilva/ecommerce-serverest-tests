Feature: Shopping list - Add Product After Login

  Background:
    Given I am logged in as a registered user
    And my shopping list is empty

  Scenario: Add a product to the shopping list
    When I add the product Intel Core i5 to the shopping list
    Then I see Intel Core i5 in the shopping list with quantity 1
    And I click on the Logout button

  Scenario: Increase quantity of a product
    Given I have Intel Core i5 in the shopping list with quantity 1
    When I increase the quantity of Intel Core i5
    Then I see Intel Core i5 in the shopping list with quantity 2
    And I click on the Logout button

  Scenario: Decrease quantity of a product
    Given I have Intel Core i5 in the shopping list with quantity 2
    When I decrease the quantity of Intel Core i5
    Then I see Intel Core i5 in the shopping list with quantity 1
    And I click on the Logout button

  Scenario: Add another product to the shopping list
    Given I have Intel Core i5 in the shopping list with quantity 1
    When I add the product iPhone 16 to the shopping list
    Then I see Intel Core i5 and iPhone 16 in the shopping list
    And I click on the Logout button

  Scenario: Clear the shopping list
    Given I have products in the shopping list
    When I clear the shopping list
    Then the shopping list is empty
    And I click on the Logout button
