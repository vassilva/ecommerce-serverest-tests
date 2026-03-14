Feature: Login de Usuários

  @smoke @regressivo
  Scenario: Realizar login com credenciais válidas
    Given que o usuário está na página de login
    When preenche o formulário de login com dados válidos
    And submete o formulário de login
    Then o usuário deve ser redirecionado para a home page e estar logado
