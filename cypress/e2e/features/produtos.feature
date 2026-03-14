Feature: Busca e Detalhes de Produtos

  Background:
    Given que o usuário está logado no sistema
    And que o usuário está na página inicial

  @smoke @regressivo
  Scenario: Buscar um produto válido com sucesso
    When o usuário busca por um produto válido na barra de pesquisa
    Then o produto correspondente deve ser exibido nos resultados
    And o usuário realiza o logout do sistema
    Then o usuário deve ser deslogado com sucesso

  @regressivo
  Scenario: Visualizar detalhes de um produto a partir da lista
    When o usuário seleciona o produto Intel Core i5 diretamente da lista na home
    Then a página de detalhes do produto deve ser exibida
    And o usuário realiza o logout do sistema
    Then o usuário deve ser deslogado com sucesso

  @regressivo
  Scenario: Adicionar produto ao carrinho/lista de compras
    When o usuário adiciona um produto à lista de compras
    Then o produto deve ser exibido na lista de compras
    And o usuário realiza o logout do sistema
    Then o usuário deve ser deslogado com sucesso

  @regressivo
  Scenario: Adicionar múltiplos produtos à lista de compras
    Given que um produto já foi adicionado à lista de compras
    When o usuário adiciona outro produto diferente à lista de compras
    Then ambos os produtos devem ser exibidos na lista de compras
    And o usuário realiza o logout do sistema
    Then o usuário deve ser deslogado com sucesso

  @regressivo
  Scenario: Limpar a lista de compras
    Given que produtos foram adicionados à lista de compras
    When o usuário limpa a lista de compras
    Then a lista de compras deve estar vazia
    And o usuário realiza o logout do sistema
    Then o usuário deve ser deslogado com sucesso

  @regressivo
  Scenario: Aumentar a quantidade de um produto na lista
    Given que um produto foi adicionado à lista de compras
    When o usuário aumenta a quantidade do produto
    Then a quantidade do produto deve ser atualizada
    And o usuário realiza o logout do sistema
    Then o usuário deve ser deslogado com sucesso

  @regressivo
  Scenario: Diminuir a quantidade de um produto na lista
    Given que um produto foi adicionado à lista de compras com quantidade maior que um
    When o usuário diminui a quantidade do produto
    Then a quantidade do produto deve ser reduzida para um
    And o usuário realiza o logout do sistema
    Then o usuário deve ser deslogado com sucesso
