*** Settings ***
Suite Setup     Open Default Page
Suite Teardown  Close Browser
Library         Browser
Resource        ../resources/keywords.robot

*** Keywords ***
Set Suite Variables    ${TITLE1}    HBC - CTCP Tập đoàn Xây dựng Hòa Bình
