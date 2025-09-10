*** Settings ***
Resource        ../resources/keywords.robot

*** Variables ***
${API_URL}    https://fireant.vn/ma-chung-khoan/
${HARD_URI}    https://restv2.fireant.vn/symbols/HBC/historical-quotes?startDate=2022-08-08&endDate=2025-12-12&offset=0&limit=30
${URL2}    https://finance.vietstock.vn/IJC-ctcp-phat-trien-ha-tang-ky-thuat.htm
*** Test Cases ***
Test number one
    Check Title
    Basic Check    HBC

Test API Number One
    [Documentation]    A test to test
    [Tags]    api
    ${fullURL}    Set Variable    ${API_URL}HBC
    Create Session    jsonplaceholder    ${fullURL}
    ${response}=    GET    ${fullURL}
    ${pattern}=    Set Variable    "accessToken\":\"([^\"]+)"
    ${token}=      Get Regexp Matches    ${response.text}    ${pattern}
    ${parts}=    Split String    ${token[0]}    ":"
    ${token}=    Replace String    ${parts[1]}    "\""    ${EMPTY}
	${token}=    Replace String    ${token}    "    ${EMPTY}
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
	${response}=   GET    ${HARD_URI}    headers=${headers}
	Log    ${response.text}
    Should Be Equal As Strings    ${response.status_code}    200
    Should Contain    '${response.text}'    HBC
	${first}         Get From List    ${response.json()}    0
	${vol}          Get From Dictionary    ${first}    totalVolume
	${val}          Get From Dictionary    ${first}    totalValue
	${direct}       Get From Dictionary    ${first}    priceAverage
	${result}=      Evaluate    float(${val} / ${vol})
	Log    ${val} / ${vol} => ${result}
	Log To Console    \n${val} / ${vol} => ${result} vs ${direct}

Test API Number Two
	[Documentation]    Another test to test
    [Tags]    api2
    Create Session    vietstock    ${URL2}    headers={"User-Agent": "Mozilla/5.0"}
    ${response}=    GET On Session    vietstock    ${URL2}
    Should Be Equal As Integers    ${response.status_code}    200

    ${html}=    Convert To String    ${response.content}
    ${cookie_token}=    Get Cookie Token From HTML    ${html}
	Log    ${cookie_token}
    ${body_token}=      Get Body Token From HTML      ${html}
	Log    ${body_token}
	
	${session}=    Evaluate    getattr(__import__('robot.libraries.BuiltIn', fromlist=['BuiltIn']), 'BuiltIn')().get_library_instance("RequestsLibrary")._cache.get_connection("vietstock")
	
	${type}=    Evaluate    (lambda s: type(s))(${session})
	Log    ${type}

	${cookie_string}=    Evaluate    "; ".join(["%s=%s" % (c.name, c.value) for c in ${session}.cookies])


    ${headers}=    Create Dictionary
    ...    Content-Type=application/x-www-form-urlencoded
    ...    Cookie=${cookie_string}
    ...    Referer=${URL2}
    ...    X-Requested-With=XMLHttpRequest

    ${payload}=    Set Variable    type=2&__RequestVerificationToken=${body_token}

    ${post_response}=    POST On Session    vietstock    ${POST_ENDPOINT}    data=${payload}    headers=${headers}
    Log    ${post_response.status_code}
    Log    ${post_response.content}
