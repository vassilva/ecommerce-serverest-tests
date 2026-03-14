Feature: Product Search and Details

  Background:
    Given the user is logged into the system
    And the user is on the home page

  @smoke @regression
  Scenario: Search for a valid product successfully
    When the user searches for a valid product in the search bar
    Then the matching product should be displayed in the results
    And the user performs the logout
    Then the user should be logged out successfully

  @regression
  Scenario: View product details from the list
    When the user selects the product Intel Core i5 directly from the list on the home page
    Then the product details page should be displayed
    And the user performs the logout
    Then the user should be logged out successfully

  @regression
  Scenario: Add product to the shopping list
    When the user adds a product to the shopping list
    Then the product should be displayed in the shopping list
    And the user performs the logout
    Then the user should be logged out successfully

  @regression
  Scenario: Add multiple products to the shopping list
    Given a product has already been added to the shopping list
    When the user adds another different product to the shopping list
    Then both products should be displayed in the shopping list
    And the user performs the logout
    Then the user should be logged out successfully

  @regression
  Scenario: Clear the shopping list
    Given products have been added to the shopping list
    When the user clears the shopping list
    Then the shopping list should be empty
    And the user performs the logout
    Then the user should be logged out successfully

  @regression
  Scenario: Increase product quantity in the list
    Given a product has been added to the shopping list
    When the user increases the product quantity
    Then the product quantity should be updated
    And the user performs the logout
    Then the user should be logged out successfully

  @regression
  Scenario: Decrease product quantity in the list
    Given a product has been added to the shopping list with quantity greater than one
    When the user decreases the product quantity
    Then the product quantity should be reduced to one
    And the user performs the logout
    Then the user should be logged out successfully
