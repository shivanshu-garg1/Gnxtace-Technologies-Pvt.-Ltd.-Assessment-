Technical Assessment Bug Report
Summary
Category	Count
Frontend Bugs	9
Backend Bugs	6
Database Bugs	1
Total Bugs Fixed	16
1. Frontend Bugs
1.1 Incorrect Register API Endpoint
Severity: High
Layer: Frontend (API Integration)
Issue

Frontend called:

POST /auth/register

instead of

POST /api/auth/register
Impact
Registration always returned 404 Not Found.
Fix

Updated endpoint to:

POST /api/auth/register
1.2 Incorrect Login API Endpoint
Severity: High
Layer: Frontend (API Integration)
Issue

Login API pointed to:

/auth/login

instead of

/api/auth/login
Fix

Updated the endpoint to:

/api/auth/login
1.3 Missing API Base URL Configuration
Severity: High
Layer: Frontend
Issue

Axios used:

baseURL: import.meta.env.VITE_APP_API_URL

No .env variable existed, causing requests to go to the Vite server instead of the backend.

Fix

Configured:

baseURL: "http://localhost:3000"
1.4 Password Confirmation Validation Missing
Severity: Medium
Layer: Frontend
Issue

Users could submit different Password and Confirm Password values.

Fix

Added client-side validation before sending the request.

1.5 Confirm Password Not Sent to Backend
Severity: Medium
Layer: Frontend
Issue

The request body excluded:

confirmPassword
Fix

Included it in the registration payload.

1.6 Invalid Authorization Header
Severity: Low
Layer: Frontend
Issue

Requests contained:

Authorization: Bearer null
Fix

Attach the Authorization header only when a valid token exists.

1.7 Incorrect Request Header
Severity: Low
Layer: Frontend
Issue

Frontend incorrectly sent:

Access-Control-Allow-Origin

This is a response header.

Fix

Removed it from Axios request headers.

1.8 Producer Search Payload Typo
Severity: Low
Layer: Frontend
Issue

Payload used:

naame

instead of

name
Fix

Corrected the property name.

1.9 Repeated Producer API Calls
Severity: High
File: Producers.jsx
Issue

useEffect() executed after every render.

Root Cause

Missing dependency array.

Before
useEffect(() => {
    fetchProducers();
});
After
useEffect(() => {
    fetchProducers();
}, []);
Benefits
Eliminates repeated API calls
Reduces backend load
Improves performance
1.10 Inefficient Movie Search
Severity: Medium
File: Movies.jsx
Issue

Every search:

called the backend
introduced a random delay
filtered results on the client afterwards
Fix

Search now filters the already loaded movie list.

Benefits
Faster search
No unnecessary API calls
Better user experience
1.11 Newly Created Movie Not Displayed
Severity: Medium
File: AddMovie.jsx
Issue

Redux stored the entire API response instead of the created movie object.

Before
updateMovies([res, ...movies]);
After
updateMovies([res.data, ...movies]);
Benefits
Movie appears instantly
No page refresh required
2. Backend Bugs
2.1 Incorrect CORS Origin
Severity: High
Issue

Configured origin:

http://localhast:5173
Fix

Changed to:

http://localhost:5173
2.2 Missing Confirm Password Validation
Severity: Medium
Issue

Backend ignored the confirmPassword field.

Fix

Added:

if (password !== confirmPassword) {
    return error;
}
2.3 Missing Required Field Validation
Severity: Medium
Issue

Controller trusted frontend validation.

Fix

Validated:

Name
Email
Password
Confirm Password

before processing.

2.4 Missing User Registration Validation
Severity: Medium
File: authController.js
Improvements
Email validation
Password strength validation
Name length validation
Trim whitespace
Convert email to lowercase
Benefits
Stronger security
Better data consistency
2.5 Missing Actor Validation
Severity: Medium
File: actorController.js
Added Validations
Required fields
Name length
Gender validation
Future DOB prevention
Biography length
Duplicate actors
Image validation
Benefits
Better data quality
Improved security
2.6 Missing Movie Validation
Severity: Medium
File: movieController.js
Added Validations
Movie name
Release year
Plot
Producer
Actors
Poster file
Benefits
Prevents invalid movie records
Improves database integrity
3. Database Bug
3.1 Uncommitted Transaction During Movie Creation
Severity: High
File: Movie.js
Issue

A transaction was started but never committed or rolled back.

This caused:

KnexTimeoutError

because the database connection remained locked.

Fix

Wrapped the transaction inside a try...catch block.

Commit on success
Rollback on failure
Benefits
Prevents connection leaks
Eliminates timeout errors
Ensures transactional consistency
Severity Summary
Severity	Count
High	6
Medium	8
Low	3