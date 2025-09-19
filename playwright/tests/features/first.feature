@first
Feature: First feature
  @hbc
  Scenario: Go home then search hbc
    Given I navigate to the front page
    When I enter "hbc"
    Then I should see "hbc" is suggested
