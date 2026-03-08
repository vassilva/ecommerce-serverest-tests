Feature: Search product 
 
   As a customer 
   I want to search for products 
   So that I can find what I need quickly 
 
   Scenario: Open product details via search 
     Given the user is logged in 
     And the user is on the home page 
     When the user searches for a valid product 
     And selects a product from the search results 
     Then the product details page should be displayed 
 
   Scenario: Product details page from home page list 
     Given the user is logged in 
     And the user is on the home page 
     When the user selects the product Intel Core i5 from the home page list
     Then the product details page should be displayed 
