Feature: Login and Account Creation
  As a new or existing user
  I want to create an account and log in
  So that I can access my e-commerce account

  Background:
    Given I am on the login page

  @register
  Scenario: Successful account creation with dynamic user
    When I navigate to the registration page
    And I register a new valid user
    Then I should see a successful registration message

  @login
  Scenario: Successful login with the newly created user
    Given I have a freshly registered user
    When I log in with that user
    Then I should be redirected to the authenticated area

  @logout
  Scenario: Successful logout from the authenticated area
    Given I have a freshly registered user
    When I log in with that user
    And I log out
    Then I should be redirected to the login page

  @login_failed
  Scenario: Login falha com credenciais inválidas
    Given I am on the login page
    When I try to log in with email "invalid@test.com" and password "wrong123"
    Then I should see a login error message


  

  @login_failed_outline
  Scenario Outline: Login falha em múltiplas combinações
    Given I am on the login page
    When I try to log in with email "<email>" and password "<password>"
    Then I should see a login error message

    Examples:
      | email                 | password   |
      | invalid@test.com      | wrong123   |
      | notfound_user@test.com| P@ssword99 |
      | user_at_test.com      | abc        |
