Feature: Shopping list - Add Product - Search Path 
 
   As a logged in customer 
   I want to search a product and manage it in the shopping list 
   So that I can add items from the search results 
 
   Scenario: Search a product and manage it in the shopping list 
     Given the user is logged in 
     And the user is on the home page 
     When the user searches for a valid product 
     And adds the product to the shopping list from the search results 
     Then the product should be displayed in the shopping list 
