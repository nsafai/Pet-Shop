# Simple Search
A Node.js implementation of a search form using simple search, pagination, and autocomplete

[Try the live app!](https://nicos-pet-shop.herokuapp.com/)

## How to run
- clone repo
- run the following commands
```
npm install
npm install -g node-mongo-seeds
seed
nodemon
```

## Tests
- Tests are written using BDD.
- To run tests locally: (1) Once the repository is installed locally, and you've installed `mocha` globally, you can `cd` to the project repo and run `mocha` to test`

## Technologies
Node.js, Express.js, Mocha, PUG Views, Seeds (seeding DB), Heroku, Mailgun API, Stripe API, AWS S3 File Uploads.

## Features / Milestones
- [x] Simple Search: Add a search bar in the navbar to search pets.
- [x] Pagination: Paginate the results.
- [x] Adding Validations: Add validations to protect against unsanitary data getting into your db.
- [x] Error and success messages: When a user attempts to perform a forbidden action or the server has an issue,
gracefully show an error message to the user
- [x] Uploading images and files: Upload pictures of pets from new and edit forms
- [x] Adding payment gateways like Stripe: Buy pets using Stripe.
- [x] Sending emails: Send an email when a pet is purchased.
- [x] Full Text Search: Fuzzy and full-text search on multiple criteria
- [x] Respond to JSON: Make your project into a full API

## Approach
This app will be built from the 'outside-in', meaning each step, the views or templates will be built before the backend functionality, using mock data.

## Credits
This is largely inspired from [this tutorial](https://www.makeschool.com/academy/track/pete-s-pet-emporium---advanced-web-recipes/tutorial/getting-started-V4Q=).
