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

The app is defaulted to create a super admin account when it is first launched with an empty database. This is because every account needs to be approved by an admin so without a starter admin account, no-one can get to use the app. We recommend that after the app is first launched, Bob signs up for an account and use that super admin account to approve his account. Then he can log in and archive the super admin account.

In addition to that, the app also needs an email address (must be gmail or one might need to change the setting in `/javascripts/email.js`) that it can send emails to users from. 

Thus, there are a few environment variables one needs to set in order to get this app to run in production. The environment variables are `GMAIL_ADDRESS, GMAIL_PASSWORD, PRODUCTION_URL, SUPER_ADMIN_USERNAME, SUPER_ADMIN_FIRST_NAME, SUPER_ADMIN_LAST_NAME, SUPER_ADMIN_ADDRESS, SUPER_ADMIN_PHONE_NUMBER, and SUPER_ADMIN_PASSWORD`. When running locally, please fill in `/javascripts/config.js` with appropriate information.
 
To start the app locally, run `npm start` (or `node app.js`). The app will be available on [`http://localhost:3000`](http://localhost:3000).

## TODO

We had to implement many features during this four-week period. We have unittested all of the code for our python scheduling algorithm and however only got to unittest some of our javascript code. We tried our best to test our code using the user interface so hopefully have prevented bugs that might get triggered by common user interaction with the app that we can think of. However, we hope that developers who take over this project can test the remaining files in `models/` that we have not tested and `javascripts/`. The latter consists of very simple functions that should not be the source of any bugs.

