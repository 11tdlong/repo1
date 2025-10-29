*** Settings ***
Resource        ../resources/keywords.robot

*** Variables ***
${API_URL}    https://fireant.vn/ma-chung-khoan/
${HARD_URI}    https://restv2.fireant.vn/symbols/HBC/historical-quotes?startDate=2022-08-08&endDate=2025-12-12&offset=0&limit=30
${URL2}    https://iboard-query.ssi.com.vn/stock/symbol?boardId=MAIN
${PLAYWRIGHT_LOG}    None

*** Test Cases ***
Test number one
	[Timeout]    1 minutes
    [Documentation]    A test to try ui
    [Tags]    done
	Log Many    ${PLAYWRIGHT_LOG}
    Check Title
    Basic Check    HBC

Test API Number One
	[Timeout]    1 minutes
    [Documentation]    A test to try api
    [Tags]    api    done
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
    [Documentation]    Fetches and formats top 10 bid/offer levels like awk output
    [Tags]             api    done

    # Step 0: Set symbol and build final URL
    ${code}=           Set Variable    hbc
    ${final_url}=      Replace String    ${URL2}    symbol    ${code}
    Log                🔗 Requesting: ${final_url}

    # Step 1: Create session with browser-like headers
    Create Session     iboard    https://iboard-query.ssi.com.vn    headers={"User-Agent": "Mozilla/5.0"}    verify=${True}

    # Step 2: Send GET request
    ${response}=       GET On Session    iboard    ${final_url}
    Should Be Equal As Integers    ${response.status_code}    200

    # Step 3: Convert response to string and parse JSON
    ${html}=           Convert To String    ${response.content}
    ${is_html}=        Evaluate    '''${html}'''.startswith('<!DOCTYPE html>')
    Run Keyword If     ${is_html}    Fail    ⚠️ SSI API returned HTML — likely blocked

    ${json}=           Evaluate    json.loads('''${html}''')    json
    ${data}=           Set Variable    ${json['data']}
	${output}=    Set Variable
    # Step 5: Loop through levels 1–10 and format output
    FOR    ${i}    IN RANGE    1    11
    ${bid_key}=        Set Variable    best${i}Bid
    ${bidVol_key}=     Set Variable    best${i}BidVol
    ${offer_key}=      Set Variable    best${i}Offer
    ${offerVol_key}=   Set Variable    best${i}OfferVol

    ${bid}=        Run Keyword If    '${bid_key}' in ${data}    Evaluate    str(${data['${bid_key}']}).rjust(8)    ELSE    Evaluate    '—'.rjust(8)
    ${bidVol}=     Run Keyword If    '${bidVol_key}' in ${data}    Evaluate    str(${data['${bidVol_key}']}).rjust(10)    ELSE    Evaluate    '—'.rjust(10)
    ${offer}=      Run Keyword If    '${offer_key}' in ${data}    Evaluate    str(${data['${offer_key}']}).rjust(8)    ELSE    Evaluate    '—'.rjust(8)
    ${offerVol}=   Run Keyword If    '${offerVol_key}' in ${data}    Evaluate    str(${data['${offerVol_key}']}).rjust(10)    ELSE    Evaluate    '—'.rjust(10)

    ${line}=       Set Variable    ${bid}${SPACE}${bidVol}${SPACE}${offer}${SPACE}${offerVol}
    ${output}=     Catenate    SEPARATOR=\n    ${output}    ${line}
	END
	Log    ${output}
	Log To Console    ${output}