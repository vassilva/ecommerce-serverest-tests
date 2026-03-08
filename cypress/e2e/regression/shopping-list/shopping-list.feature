Feature: Shopping list - Add Product After Login 
 
   As a logged in customer 
   I want to manage products in my shopping list 
   So that I can prepare my purchase 
 
   Background: 
     Given the user is logged in 
     And the user is on the home page 
 
   Scenario: Add a product to the shopping list 
     When the user adds a product to the shopping list 
     Then the product should be displayed in the shopping list 
 
   Scenario: Increase quantity of a product 
     Given a product has been added to the shopping list 
     When the user increases the quantity of the product 
     Then the product quantity should be updated 
 
   Scenario: Decrease quantity of a product 
     Given a product has been added to the shopping list with quantity greater than one 
     When the user decreases the quantity of the product 
     Then the product quantity should be reduced 
 
   Scenario: Add another product to the shopping list 
     Given a product has already been added to the shopping list 
     When the user adds another different product to the shopping list 
     Then both products should be displayed in the shopping list 
 
   Scenario: Clear the shopping list 
     Given products have been added to the shopping list 
     When the user clears the shopping list 
     Then the shopping list should be empty 
