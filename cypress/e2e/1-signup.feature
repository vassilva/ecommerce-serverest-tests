Feature: Customer sign up

  Scenario: Register a new customer using the "Sign Up" option
    Given I am on the login page
    When I click on the "Sign Up" option
    And I fill in the customer registration form with valid data
      | name            | email       | password |
      | Automation User | qa@test.com | ******** |
    And I submit the registration form
    Then I should see a success message confirming the registration
    And I should be logged in as a customer
    And I click on the Logout button instantly
