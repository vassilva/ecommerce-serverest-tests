import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import RegisterPage from '../pages/RegisterPage';
import LoginPage from '../pages/LoginPage';
import { randomEmail } from '../../support/helpers';

function createDynamicUser() {
  const email = randomEmail('serverest_user');
  const password = 'P@ssword123';
  const name = 'Test User';
  Cypress.env('user', { email, password, name });
  return { email, password, name };
}

Given('I am on the login page', () => {
  LoginPage.navigate();
});

When('I navigate to the registration page', () => {
  RegisterPage.navigate();
});

When('I register a new valid user', () => {
  const { email, password, name } = createDynamicUser();
  RegisterPage.fillName(name);
  RegisterPage.fillEmail(email);
  RegisterPage.fillPassword(password);
  RegisterPage.submit();
});

Then('I should see a successful registration message', () => {
  RegisterPage.expectSuccessToast();
});

Given('I have a freshly registered user', () => {
  const user = Cypress.env('user');
  if (!user) {
    RegisterPage.navigate();
    const { email, password, name } = createDynamicUser();
    RegisterPage.fillName(name);
    RegisterPage.fillEmail(email);
    RegisterPage.fillPassword(password);
    RegisterPage.submit();
    RegisterPage.expectSuccessToast();
  }
});

When('I log in with that user', () => {
  const { email, password } = Cypress.env('user');
  LoginPage.navigate();
  LoginPage.fillEmail(email);
  LoginPage.fillPassword(password);
  LoginPage.submit();
});

Then('I should be redirected to the authenticated area', () => {
  LoginPage.expectLoggedIn();
});

When('I log out', () => {
  LoginPage.logout();
});

Then('I should be redirected to the login page', () => {
  LoginPage.expectLoggedOut();
});

When('I try to log in with invalid credentials', () => {
  const email = randomEmail('invalid_user');
  const password = 'wrong123';
  LoginPage.navigate();
  LoginPage.fillEmail(email);
  LoginPage.fillPassword(password);
  LoginPage.submit();
});

When('I try to log in with email {string} and password {string}', (email, password) => {
  LoginPage.navigate();
  LoginPage.fillEmail(email);
  LoginPage.fillPassword(password);
  LoginPage.submit();
});

Then('I should see a login error message', () => {
  LoginPage.expectInvalidOrStayOnLogin();
});
