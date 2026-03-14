Feature: User Registration

  @smoke @regression
  Scenario: Register a new user successfully
    Given the user is on the registration page
    When fills in the registration data with valid information
    And submits the registration form
    Then the account should be created successfully
    And the user performs the logout
    Then the user should be logged out successfully

  @regression
  Scenario: Try to register a user with an existing email
    Given the user is on the registration page
    When fills in the registration data with an existing email
    And submits the registration form
    Then a message should be displayed stating the email is already in use

  @regression
  Scenario: Validate required fields in registration
    Given the user is on the registration page
    When submits the registration form without filling required fields
    Then validation messages should be displayed for the required fields
