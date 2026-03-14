Feature: Cadastro de Usuários

  @smoke @regressivo
  Scenario: Realizar cadastro de novo usuário com sucesso
    Given que o usuário está na página de cadastro
    When preenche os dados de cadastro com informações válidas
    And submete o formulário de cadastro
    Then a conta deve ser criada com sucesso

  @regressivo
  Scenario: Tentar cadastrar usuário com e-mail já existente
    Given que o usuário está na página de cadastro
    When preenche os dados de cadastro com um e-mail já existente
    And submete o formulário de cadastro
    Then deve ser exibida uma mensagem informando que o e-mail já está em uso

  @regressivo
  Scenario: Validar campos obrigatórios no cadastro
    Given que o usuário está na página de cadastro
    When submete o formulário de cadastro sem preencher os campos obrigatórios
    Then devem ser exibidas mensagens de validação para os campos obrigatórios
