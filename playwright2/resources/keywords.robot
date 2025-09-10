*** Settings ***
Library        Browser
Library        RequestsLibrary
Library	       String
Library           Collections

*** Variables ***
${BASE_URL}    https://fireant.vn
${TITLE2}    FireAnt
${CLOSE}    //div[@id='dialogPortal']/following-sibling::button
${HEADLESS}    ${True}

*** Keywords ***
Login With Credentials
    [Arguments]    ${username}    ${password}
    Type Text    id=username    ${username}
    Type Secret  id=password    ${password}
    Click        text=Login

Open Default Page
    ${headless_bool}=    Convert To Boolean    ${HEADLESS}
    New Browser    chromium    headless=${headless_bool}
    New Context    viewport={'width': 1880, 'height': 940}
    Set Browser Timeout    30000
    New Page    ${BASE_URL}    wait_until=load

Check Title
    ${title}    Get Title
    Should Be Equal   ${title}  ${TITLE2}

Basic Check
    [Arguments]    ${code}
    Click    xpath=${CLOSE}
    Fill Text      xpath=//div[@data-value]//input    ${code}
    ${RESULT}    Set Variable    '//div[@tabindex="-1"]//div[contains(text(),"${code}")]'
    Click    xpath=//div[@data-value]
    FOR    ${kw}    IN RANGE    1    4
    ${status}    ${msg} =    Run Keyword And Ignore Error    Click    xpath=${RESULT}
    Run Keyword If    '${status}' == 'PASS'    Exit For Loop
    Run Keyword If    '${status}' != 'PASS'    Click    xpath=//div[@data-value]
    END

Get Cookie Token From HTML
    [Arguments]    ${html}
	${cookie_pattern}=    Set Variable    <form[^>]*id=form1[^>]*>.*?<input[^>]*name=__RequestVerificationToken[^>]*value=([^>\\s]+)
    ${matches}=    Get Regexp Matches    ${html}    ${cookie_pattern}
    ${token}=    Set Variable    ${matches[0]}
    RETURN   ${token}

Get Body Token From HTML
    [Arguments]    ${html}
    ${body_pattern}=    Set Variable    <form[^>]*id=form0[^>]*>.*?<input[^>]*name=__RequestVerificationToken[^>]*value=([^>\\s]+)
    ${matches}=    Get Regexp Matches    ${html}    ${body_pattern}
    ${token}=    Set Variable    ${matches[0]}
    RETURN    ${token}
