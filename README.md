# How to set it up

## The database

First, download and install mongo. This step is very error prone, and dependent on your system, so good luck! If you are using Ubuntu, ask help for Renato, if Mac, Mark, if neither, ask Google.

At the end, you should be able to do this:
```bash
$ mongo
```

And see this:
```
$ mongo
MongoDB shell version v4.4.4
connecting to: mongodb://127.0.0.1:27017/?compressors=disabled&gssapiServiceName=mongodb
Implicit session: session { "id" : UUID("f6611da5-f9e0-4f12-9cb8-d75187718569") }
MongoDB server version: 3.6.8
$ > 
````

Now you can create the `redmatter` database by typing, inside mongo shell:
```bash
$ > use redmatter
$ > db.whatever.insert({ any: "new item" })
```

Typing `$ > show dbs`, you should now be able to see this:
```
$ > show dbs
admin       0.000GB
config      0.000GB
local       0.000GB
redmatter   0.000GB
```

You are done here!

## The backend

First, install `nvm` on you machine. [RedMatterAppNodeJSBackend](https://github.com/RedMatterApplication/RedMatterAppNodeJSBackend/) is the one currently being used on branch `integration`.

Current node version in use is `8.16.0`, With nvm, you can open a terminal and type:
```bash
$ nvm install 8.16.0
$ nvm use 8.16.0
```

Now go inside backend folder cloned and install dependencies:
```
$ npm i
```

Most likely, you will encounter a problem involving bcrypt. A few google searches will solve your problem.

Now that you have the back installed, you should be able to run it with:
```
$ nodemon server.js nougly
```

You, most likely, will be able to run the server, but there are still to problems to fix:
1. CORS errors.
2. ENV variables.

The first, you can fix by changing `const corsOpts` in `server.js` to:
```js
const corsOpts = {
  origin: "*",

  methods: ["DELETE", "PUT", "OPTIONS", "GET", "POST"],

  allowedHeaders: ["Content-Type", "Token"],
};
```

The second, the approach I prefer is installing `dotenv` and adding a line to `server.js` like so:
```js
require("dotenv").config();
```

The`.env` file's template here:
```
SEND_IN_BLUE_API_KEY=
EMAIL_FROM=
REPLY_TO=
EMAIL_TO_NAME=
REGISTER_TEMPLATE_ID=
DEV_VERIFY_HOST=
RECAPTCHA_SECRET_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=
BUCKET_NAME=
REDMATTER_API=
DYNAMO_DB_ENDPOINT=
DD_ACCESS_KEY_ID=
DD_SECRET_ACCESS_KEY=
EVENTS_TABLE_NAME=
RECAPTCHA_SECRET_KEY=
```

You'll have to fill those up, talk with us in private and we will help you with that.

After this, backend should be usable. Alongside this tutorial, there is a Postman file with all the endpoints.

## The frontend

Just clone [RedMatterAppFrontend](https://github.com/RedMatterApplication/RedMatterAppFrontend), install and run:
```
$ npm i
$ npm run start:[environment]
```

There are 2 used environments:
- `dev`: For remote connection to current live app (in the future, we hope to have a replica of the backend for development purposes)
- `local`: That connects to localhost:8080, your local backend.

## Users

When you create a new user, either using Postman or frontend, this user has to be verified (email). No emails are sent on local environment, right, then you have to change the database by hand. To do that:

```bash
$ mongo
MongoDB shell version v4.4.4
connecting to: mongodb://127.0.0.1:27017/?compressors=disabled&gssapiServiceName=mongodb
Implicit session: session { "id" : UUID("f6611da5-f9e0-4f12-9cb8-d75187718569") }
MongoDB server version: 3.6.8
$ > use redmatter
$ > db.users.find()
{ "_id" : ObjectId("609ab9c67a4b32d56c349670"), "email" : "renatobritto@protonmail.com", "location" : "AF", "password" : "$2a$10$wI.i5LKN0J.CUf5SzwmSP.ToY8BUkYevDxLcq8g7YrzqmIs93oE4S", "verifyString" : "fc642cbe3133113fe196020b1a2780f7", "totalFilesUploaded" : 0, "totalNumFilesPaidFor" : 2, "monthlyFileCounter" : 1, "subscribed" : false, "isOrganisationAdmin" : true, "isDemoUser" : false, "isAdmin" : false, "createdOn" : ISODate("2021-05-11T17:07:18.233Z"), "verified" : true, "__v" : 0, "organisationId" : ObjectId("609ab9c67a4b32d56c349671"), "currentMonthYearForCounter" : "5/2021" }
$ > db.users.updateOne({ email: 'renatobritto@prontonmail.com'}, { $set: { verified: true }})
{ "acknowledged" : true, "matchedCount" : 0, "modifiedCount" : 0 }
```

### That's it, if you have any more question just ask us!