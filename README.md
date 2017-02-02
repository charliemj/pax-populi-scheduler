# 6.S187 Pax Populi Scheduler

This app uses [Node.js](https://nodejs.org/en/), [MongoDB](https://www.mongodb.com/) (using [Mongoose](mongoosejs.com)), [Express.js](expressjs.com), [Angular.js](https://angularjs.org/), and [handlebars](handlebarsjs.com) templating.

## Installation

To run this locally, make sure you have Node and MongoDB installed on your machine. The scheduler script is in python and requires several pip packages. Therefore, please run the commands below to setup the virtual environment.
```
$ conda install python=2.7.9
$ virtualenv -p /Users/cmao18/anaconda2/bin/python .env/
$ source ./.env/bin/activate
$ pip install -r requirements.txt
```

Start a mongo server in one terminal. Next, in a separate terminal by running `mongo`, enter the directory housing the app, and run `npm install` to install the required node packages. Additionally, make sure you have [bower](https://bower.io/) and run `bower install` to install all the required javascript packages.

## Defining environment variables

The app is defaulted to create a super admin account when it is first launched with an empty database (presumably belongs to Robert McNulty, the founder of Pax Populi Academy). It also needs an email address (must be gmail or one might need to change the setting in `/javascripts/email.js`) that it can send emails to users from. Thus, there are a few environment variables one needs to set in order to get this app to run. The environment variables are `GMAIL_ADDRESS, GMAIL_PASSWORD, PRODUCTION_URL, SUPER_ADMIN_USERNAME, SUPER_ADMIN_FIRST_NAME, SUPER_ADMIN_LAST_NAME, SUPER_ADMIN_ADDRESS, SUPER_ADMIN_PHONE_NUMBER, and SUPER_ADMIN_PASSWORD`. 
 
To start the app, run `npm start` (or `node app.js`). The app will be available on [`http://localhost:3000`](http://localhost:3000).


