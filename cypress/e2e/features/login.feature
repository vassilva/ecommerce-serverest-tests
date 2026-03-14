Feature: Login de Usuários

  @smoke @regressivo
  Scenario: Realizar login com credenciais válidas
    Given que o usuário está na página de login
    When preenche o formulário de login com dados válidos
    And submete o formulário de login
    Then o usuário deve ser redirecionado para a home page e estar logado
    And o usuário realiza o logout do sistema
    Then o usuário deve ser deslogado com sucesso
