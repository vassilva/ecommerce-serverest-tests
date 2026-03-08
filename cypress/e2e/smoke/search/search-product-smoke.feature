Feature: Product search smoke test 
 
   As a customer 
   I want to search for a product 
   So that I can quickly find an item in the catalog 
 
   Scenario: Open product details via search 
     Given the user is logged in 
     And the user is on the home page 
     When the user searches for a valid product 
     And selects a product from the search results 
     Then the product details page should be displayed 
