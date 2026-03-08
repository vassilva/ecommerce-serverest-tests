Feature: Signup exploratory coverage 
 
   As a visitor 
   I want to explore the sign up flow 
   So that I can validate different registration behaviors 
 
   Scenario: Register a new customer with valid data 
     Given the user is on the sign up page 
     When the user fills in valid registration data 
     And submits the sign up form 
     Then the account should be created successfully 
 
   Scenario: Try to register with an existing email 
     Given the user is on the sign up page 
     When the user fills in registration data with an existing email 
     And submits the sign up form 
     Then an email already exists message should be displayed 
 
   Scenario: Try to register with required fields empty 
     Given the user is on the sign up page 
     When the user submits the sign up form without filling required fields 
     Then validation messages should be displayed for the required fields 
