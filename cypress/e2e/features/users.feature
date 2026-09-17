Feature: User Registration

  Background:
    Given the user registration API is being intercepted

  @smoke @regression
  Scenario: Register a new user successfully
    Given the user is on the registration page
    When fills in the registration data with valid information
    And submits the registration form
    Then the user registration API request should succeed with status 201
    And the user registration API response should contain a valid user ID
    And the account should be created successfully

  @regression @negative
  Scenario: Try to register a user with an existing email
    Given the user is on the registration page
    When fills in the registration data with an existing email
    And submits the registration form
    Then the user registration API request should fail with status 400
    And a message should be displayed stating the email is already in use

  @regression @negative
  Scenario: Validate required fields in registration
    Given the user is on the registration page
    When submits the registration form without filling required fields
    Then validation messages should be displayed for the required fields

  @regression @negative
  Scenario: Try to register with empty password
    Given the user is on the registration page
    When fills in the registration data with empty password
    And submits the registration form
    Then the user registration API request should fail with status 400
    And a validation message about password should be displayed

  @regression @negative
  Scenario: Try to register with empty name
    Given the user is on the registration page
    When fills in the registration data with empty name
    And submits the registration form
    Then the user registration API request should fail with status 400
    And a validation message about name should be displayed

  @negative @regression
  Scenario: Try to register with an invalid email format
    Given the user is on the registration page
    When fills in the registration data with an invalid email format
    And submits the registration form
    Then the registration form should reject the invalid email format

  @regression @api
  Scenario: Validate user registration and listing API contracts
    When a new user is created via API call
    Then the user creation API response should have correct status and headers
    When the users list is fetched via API call
    Then the users list API response should have correct structure and status
