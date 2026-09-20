Feature: User Login

  Background:
    Given the login API is being intercepted

  @smoke @regression @sanity
  Scenario: Login with valid credentials
    Given the user is on the login page
    When fills in the login form with valid data
    And submits the login form
    Then the login API request should succeed with status 200
    And the login API response should contain a valid authorization token
    And the user should be redirected to the home page and be logged in

  @regression
  Scenario: Logout from an authenticated session
    Given the user is on the login page
    When fills in the login form with valid data
    And submits the login form
    Then the user should be redirected to the home page and be logged in
    When the user performs the logout
    Then the user should be logged out successfully

  @regression @negative
  Scenario: Login with wrong password
    Given the user is on the login page
    When fills in the login form with a valid user but wrong password
    And submits the login form
    Then the login API request should fail with status 401
    And an error message about invalid credentials should be displayed

  @negative
  Scenario: Login with nonexistent email
    Given the user is on the login page
    When fills in the login form with a nonexistent email
    And submits the login form
    Then the login API request should fail with status 401
    And an error message about invalid credentials should be displayed

  @negative
  Scenario: Login with empty email field
    Given the user is on the login page
    When fills in the login form with empty email
    And submits the login form
    Then the email required validation message should be displayed

  @negative
  Scenario: Login with empty password field
    Given the user is on the login page
    When fills in the login form with empty password
    And submits the login form
    Then the password required validation message should be displayed

  @regression @negative
  Scenario: Login with both fields empty
    Given the user is on the login page
    When submits the login form without filling any field
    Then validation messages should be displayed for the required login fields

  @api
  Scenario: Validate login API contracts via API call
    When a login API call is made with valid credentials via API
    Then the login API response should have correct status code body and headers
