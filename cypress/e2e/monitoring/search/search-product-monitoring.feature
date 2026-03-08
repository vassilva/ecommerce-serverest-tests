Feature: Product search monitoring 
 
   As a QA team 
   I want to monitor the core search flow 
   So that I can quickly detect production or QA environment issues 
 
   Scenario: Search remains available for a valid product 
     Given the user is logged in 
     And the user is on the home page 
     When the user searches for a valid product 
     Then the matching products should be displayed 
