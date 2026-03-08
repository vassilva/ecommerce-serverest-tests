Feature: Signup smoke test 
 
   As a visitor 
   I want to create a new account 
   So that I can access the application 
 
   Scenario: Register a new customer using the Sign Up option 
     Given the user is on the sign up page 
     When the user fills in valid registration data 
     And submits the sign up form 
     Then the account should be created successfully 
