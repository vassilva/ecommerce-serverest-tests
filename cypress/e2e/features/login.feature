Feature: User Login

  @smoke @regression
  Scenario: Login with valid credentials
    Given the user is on the login page
    When fills in the login form with valid data
    And submits the login form
    Then the user should be redirected to the home page and be logged in
    And the user performs the logout
    Then the user should be logged out successfully
