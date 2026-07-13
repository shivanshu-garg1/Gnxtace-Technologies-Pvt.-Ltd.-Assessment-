Bug 1: Incorrect Register API Endpoint

Layer: Frontend (API Integration)

Severity: High

Symptom

Clicking the Register button resulted in a 404 Not Found error.

Root Cause

The frontend called:

POST /auth/register

while the backend exposed the route as:

POST /api/auth/register
Fix

Updated the frontend API endpoint to:

/api/auth/register
Bug 2: Incorrect Login API Endpoint

Layer: Frontend (API Integration)

Severity: High

Symptom

Login requests would fail because the frontend called an incorrect endpoint.

Root Cause

Frontend requested:

/auth/login

instead of

/api/auth/login
Fix

Updated the login endpoint to:

/api/auth/login
Bug 3: Missing API Base URL Configuration

Layer: Frontend

Severity: High

Symptom

API requests were sent to:

http://localhost:5173

instead of the backend server.

Root Cause

Axios used:

baseURL: import.meta.env.VITE_APP_API_URL

but no .env file existed.

Fix

Configured the correct backend URL:

baseURL: "http://localhost:3000/"
Bug 4: Incorrect CORS Origin

Layer: Backend

Severity: High

Symptom

Frontend requests could be blocked due to CORS configuration.

Root Cause

The origin contained a typo:

http://localhast:5173
Fix

Corrected it to:

http://localhost:5173
Bug 5: Missing Password Confirmation Validation (Frontend)

Layer: Frontend

Severity: Medium

Symptom

Users could submit the registration form even if Password and Confirm Password were different.

Root Cause

No validation was performed before calling the API.

Fix

Added client-side validation to compare both password fields before submitting.

Bug 6: Confirm Password Not Sent to API

Layer: Frontend

Severity: Medium

Symptom

The Confirm Password field existed in the UI but was never included in the API request.

Root Cause

The request body only contained:

{
  name,
  email,
  password
}
Fix

Included:

confirmPassword

in the request payload.

Bug 7: Backend Does Not Validate Confirm Password

Layer: Backend

Severity: Medium

Symptom

Users could bypass frontend validation and register with mismatched passwords.

Root Cause

The register controller ignored the confirmPassword field.

Fix

Added backend validation:

if (password !== confirmPassword) {
    return error;
}

before creating the user.

Bug 8: Missing Required Field Validation

Layer: Backend

Severity: Medium

Symptom

The API relied only on frontend validation for required fields.

Root Cause

The controller did not verify whether required fields were present.

Fix

Added validation to ensure Name, Email, Password, and Confirm Password are provided before processing the request.

Bug 9: Invalid Authorization Header

Layer: Frontend

Severity: Low

Symptom

Requests sent:

Authorization: Bearer null

when the user was not logged in.

Root Cause

Authorization header was always attached regardless of token availability.

Fix

Added a condition to attach the Authorization header only when a valid token exists.

Bug 10: Incorrect Request Header

Layer: Frontend

Severity: Low

Symptom

Axios included:

Access-Control-Allow-Origin

as a request header.

Root Cause

This header is a response header and should only be set by the backend.

Fix

Removed it from the frontend request headers.

Bug 11: Producer Search Payload Typo

Layer: Frontend

Severity: Low

Symptom

Producer filtering/search could fail.

Root Cause

Payload contained:

naame

instead of

name
Fix

Corrected the property name to name.


Bug 12: Repeated Producer API Calls in Producers.jsx

File: Producers.jsx

Layer: Frontend

Severity: High

Symptom

The Producers page continuously sent requests to fetch the producer list, resulting in multiple unnecessary API calls, slower page performance, and increased backend load.

Root Cause

The useEffect hook in Producers.js was missing a dependency array.

Before:

useEffect(() => {
  fetchProducers();
});

Since no dependency array was provided, fetchProducers() executed after every render, causing repeated API requests.

Fix

Added an empty dependency array so the API is called only once when the component mounts.

After:

useEffect(() => {
  fetchProducers();
}, []);


Bug 13: Inefficient Movie Search Implementation

File: Movies.jsx

Layer: Frontend

Severity: Medium

Symptom

Searching for movies caused unnecessary API requests and introduced an artificial delay, resulting in slower search performance and increased backend load.

Root Cause

The search functionality fetched the entire movie list from the server every time a search was performed and also added a random delay before making the request.

Before:

const handleSearch = async () => {
  setFilter({ name: searchText });

  try {
    const delay = Math.random() * 1000 + 500;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const res = await GetMovie();

    const list =
      res?.data?.map((item) => ({ ...item, key: item.id })) || [];

    const searchedList = list.filter((m) =>
      m.name?.toLowerCase().includes(searchText.toLowerCase()),
    );

    updateMovies(searchedList);
  } catch (err) {
    console.error(err);
  }
};
Fix

Removed the unnecessary API call and artificial delay. The search now updates the filter state, allowing filtering to be performed on the already loaded movie list.

After:

const handleSearch = () => {
  setFilter({
    name: searchText,
  });
};
Why this fix is better
Eliminates unnecessary API requests.
Removes the artificial delay.
Improves search responsiveness.
Reduces backend load.
Uses the already available movie data for filtering.

Bug 14: Movie Creation Failed Due to Uncommitted Database Transaction

File: Movie.js

Layer: Backend (Database)

Severity: High

Symptom

When creating a new movie, the request failed with the following error:

KnexTimeoutError: Knex: Timeout acquiring a connection.
The pool is probably full.

As a result, the movie was not saved to the database.

Root Cause

A database transaction was started but never committed or rolled back. After inserting the movie and actor relationships, the code immediately called findById() while the transaction was still holding the database connection. Since SQLite has a limited connection pool, this caused a connection timeout.

Before:

async create(data) {
  const { actors, producer, ...movieData } = data;

  const trx = await db.transaction();

  if (producer) {
    movieData.producer_id = producer;
  }

  const [movieId] = await trx("movies").insert(movieData);

  if (actors && actors.length > 0) {
    const actorRelations = actors.map((actorId) => ({
      movie_id: movieId,
      actor_id: actorId,
    }));

    await trx("movie_actors").insert(actorRelations);
  }

  return this.findById(movieId);
}
Fix

Wrapped the transaction in a try...catch block and ensured that it is either committed on success or rolled back on failure before retrieving the created movie.

After:

async create(data) {
  const { actors, producer, ...movieData } = data;

  const trx = await db.transaction();

  try {
    if (producer) {
      movieData.producer_id = producer;
    }

    const actorIds = Array.isArray(actors)
      ? actors
      : actors
        ? [actors]
        : [];

    const [movieId] = await trx("movies").insert(movieData);

    if (actorIds.length > 0) {
      await trx("movie_actors").insert(
        actorIds.map((actorId) => ({
          movie_id: movieId,
          actor_id: actorId,
        }))
      );
    }

    await trx.commit();

    return this.findById(movieId);
  } catch (err) {
    await trx.rollback();
    throw err;
  }
}
Why this fix is better
Prevents database connection leaks.
Eliminates the Knex connection timeout.
Ensures transactions are completed correctly.
Guarantees data consistency by rolling back on failure.
Successfully saves the movie and its actor relationships.
Bug 15: Newly Created Movie Not Displayed on the UI

File: AddMovie.jsx

Layer: Frontend

Severity: Medium

Symptom

After successfully creating a movie, the success message was displayed and the movie was saved in the database, but the newly created movie did not appear in the movie list until the page was manually refreshed.

Root Cause

The Redux store was updated with the entire API response object instead of the created movie object contained in the data field.

Before:

const res = await CreateMovie(data);

if (res.status == "success") {
  const list = [res, ...movies];
  updateMovies(list);
}
Fix

Updated the Redux state using the movie object returned by the API.

After:

const res = await CreateMovie(data);

if (res.status == "success") {
  const list = [res.data, ...movies];
  updateMovies(list);
}
Why this fix is better
Immediately displays the newly created movie.
Keeps the Redux state in the expected format.
Eliminates the need to refresh the page.
Improves the user experience by keeping the UI synchronized with the backend.


Bug 16: Missing Input Validation While Creating Actors

File: actorController.js

Layer: Backend

Severity: Medium

Symptom

The application accepted invalid actor information such as empty names, invalid genders, future dates of birth, short biographies, and duplicate actor records.

Root Cause

The controller directly inserted request data into the database without validating or sanitizing user input.

Fixes Implemented

Added required field validation.
Added actor name length validation.
Validated gender against supported values.
Prevented future dates of birth.
Added biography length validation.
Prevented duplicate actor names.
Validated uploaded image type and size.

Why this fix is better

Prevents invalid and inconsistent data from being stored.
Improves data quality and integrity.
Enhances application security by validating uploaded files.
Provides users with clear validation messages before database operations.

Validation bugs you can mention in your report
Bug 16: Missing Input Validation During User Registration

File: authController.js

Layer: Backend

Severity: Medium

Issues Fixed:

Added email format validation.
Enforced password strength requirements.
Added name length validation.
Trimmed whitespace from name and email.
Normalized email to lowercase before checking duplicates.

Why this fix is better

Prevents invalid user data.
Improves security by enforcing stronger passwords.
Avoids duplicate accounts caused by email casing.
Enhances data consistency and user experience.


Bug 17: Missing Input Validation While Creating Movies

File: movieController.js

Layer: Backend

Severity: Medium

Symptom

The application allowed users to create movies with invalid or incomplete data, such as:

Empty movie names
Invalid year of release
Empty plot
Missing producer
No actors selected
Invalid poster files
Root Cause

The controller only checked for duplicate movie names and did not validate the incoming request before inserting data into the database.