Feature: Product Search and Details

  Background:
    Given the products search API is being intercepted

  @smoke @regression
  Scenario: Search for a valid product successfully
    Given the user is logged into the system
    And the user is on the home page
    When the user searches for a valid product in the search bar
    Then the products search API request should succeed with status 200
    And the products search API response should contain the searched product
    And the matching product should be displayed in the results

  @regression @negative
  Scenario: Search for a nonexistent product
    Given the user is logged into the system
    And the user is on the home page
    When the user searches for a nonexistent product in the search bar
    Then the nonexistent product search API response should confirm zero results
    And a message indicating no products found should be displayed

  @regression
  Scenario: View product details from the list
    Given the user is logged into the system
    And the user is on the home page
    When the user selects the product Intel Core i5 directly from the list on the home page
    Then the product details page should be displayed

  @regression
  Scenario: Add product to the shopping list
    Given the user is logged into the system
    And the user is on the home page
    When the user adds a product to the shopping list
    Then the product should be displayed in the shopping list

  @regression
  Scenario: Add multiple products to the shopping list
    Given the user is logged into the system
    And a product has already been added to the shopping list
    When the user adds another different product to the shopping list
    Then both products should be displayed in the shopping list

  @regression
  Scenario: Clear the shopping list
    Given the user is logged into the system
    And a product has already been added to the shopping list
    When the user clears the shopping list
    Then the shopping list should be empty

  @regression
  Scenario: Increase product quantity in the list
    Given the user is logged into the system
    And a product has already been added to the shopping list
    When the user increases the product quantity
    Then the product quantity should be updated

  @regression
  Scenario: Decrease product quantity in the list
    Given the user is logged into the system
    And a product has been added to the shopping list with quantity greater than one
    When the user decreases the product quantity
    Then the product quantity should be reduced to one

  @regression @api
  Scenario: Validate products listing and creation API contracts
    When an admin creates a new product via API call
    Then the product creation API response should have correct status and headers
    When the products list is fetched via API call
    Then the products list API response should have correct structure and status

  @regression @api @negative
  Scenario: Reject product creation with invalid data
    Given an authenticated admin user is available via the API
    When invalid product data is submitted through the product API
    Then product creation should be rejected with validation errors for name, price and quantity
