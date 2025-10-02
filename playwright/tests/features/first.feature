@first
Feature: First feature
  @hbc
  Scenario: Go home then search hbc
    Given I navigate to the front page
    When I enter "hbc"
    Then I should see "hbc" is suggested
    And I should see data
  @hbc_log
  Scenario: Open the html log of the above scenario then check around
    Given I open the html log at a predefined location
	When I am sure that the created date is new
	Then I will check the details result
	And the count should be correct
  @fail
  Scenario: Sample test to return failure the point is to get a failed log so we can have various values reflected
    Given I open google
	When I search "hbc"
	Then I click bad stuff to see failure