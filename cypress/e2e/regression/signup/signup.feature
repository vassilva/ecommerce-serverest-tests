Feature: Customer sign up 
 
   As a visitor 
   I want to register in the application 
   So that I can use its features as a customer 
 
   Scenario: Register a new customer using the Sign Up option 
     Given the user is on the sign up page 
     When the user fills in valid registration data 
     And submits the sign up form 
     Then the account should be created successfully 
