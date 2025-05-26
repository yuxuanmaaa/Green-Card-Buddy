# USCIS API Testing Documentation

## Overview
The API testing system is designed to validate the USCIS Case Status API functionality by running a series of test cases that cover both successful and error scenarios. Tests run automatically daily and can also be triggered manually through the settings page.

## Test Cases
The system tests 7 different scenarios using various receipt numbers:

1. **Success Test** (`IOE1234567890`)
   - Expected: Returns case status successfully
   - Response: 200 OK

2. **Invalid Format Tests** (2 cases)
   - Test 1: `IOE123456`
   - Test 2: `IOE123456789`
   - Expected: Returns format validation error
   - Response: 400 Bad Request
   - Error: "Invalid receipt number format. Expected format: ABC1234567890"

3. **Not Found Tests** (2 cases)
   - Test 1: `IOE0000000000`
   - Test 2: `IOE9999999999`
   - Expected: Returns case not found error
   - Response: 404 Not Found
   - Error: "Case not found. Please check your receipt number"

4. **Authentication Test** (`IOE1234567890`)
   - Method: Temporarily removes authentication token
   - Expected: Returns unauthorized error
   - Response: 401 Unauthorized
   - Error: "Unauthorized: Invalid or missing authentication token"

5. **Service Availability Test** (`IOE1234567890`)
   - Method: Simulates non-working hours
   - Expected: Returns service unavailable error
   - Response: 503 Service Unavailable
   - Error: "Service Unavailable: USCIS API is currently not available"

## Test Process

1. **Connection Test**
   - First checks if the API is accessible
   - Must succeed before running other tests
   - Marked with ✅ or ❌ in logs

2. **Query Tests**
   - Runs all 7 test cases in sequence
   - Adds 1-second delay between requests to avoid rate limiting
   - Records success/error counts and response codes

3. **Results Logging**
   - Records test date and time
   - Tracks total queries, successes, and errors
   - Maintains counts of each response code (200, 400, 401, 404, 429, 503)
   - Stores detailed error messages for each failed test

## Test Results Format

```
Date: YYYY-MM-DD
HH:MM:SS
✅Connection Test
Total Queries: 7
Successful: 1
Errors: 6
Response Codes:
200: 1
400: 2
401: 1
404: 2
429: 0
503: 1

[Detailed error messages for each failed test]
```

## Production Requirements

The system tracks requirements for production API access:
1. Must have 5+ days of testing history
2. Must demonstrate handling of both successful and error responses
3. Tests run automatically daily to build this history

## Running Tests

Tests can be run in two ways:
1. **Automatic**: Tests run daily automatically
2. **Manual**: Click "Run Test Now" in the settings page

## Viewing Results

Test results can be viewed in the settings page:
1. Immediate results appear after running tests
2. Historical test logs can be viewed by clicking "Show Test Logs"
3. Production readiness status is displayed based on test history 