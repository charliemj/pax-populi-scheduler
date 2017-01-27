var mongoose = require("mongoose");
var Registration = require('../model/registration.js');
var User = require('../model/user.js');
var assert = require("assert");
var db = mongoose.connect('mongodb://localhost/testdb');


var availTest = { '0': [ [ '23:00', '24:00' ] ], 
      '1': [],
      '2': [],
      '3': [],
      '4': [],
      '5': [],
      '6': [[ '06:00', '08:30' ] }; 

var userOneJSON = {
    username: 'userOne',
    role: 'Student',
    email: 'emailTest@gmail.com',
    firstName: 'Jane',
    lastName: 'Smith',
    phoneNumber: '8675309',
    gender: 'Female',
    dateOfBirth: new Date('1993-12-12'),
    school: 'schoolOne',
    educationLevel: 'edLevelOne',
    enrolled: 'Yes',
    nationality: 'US',
    country: "United States",
    region: "Michigan",
    timezone: "Europe/Mariehamn",
    interests: "Interests"
}

var earliestTime = new Date.now();

//check that making a reg works
//check that making a reg that is incomplete doesn't work
//check that can only make one reg #is this even implemented in code lol

describe('Registration', function(){
    after(function () {
        // disconnect for clean up
        db.disconnect();
    });

    // drop database before each test
    beforeEach(function (done) {
        mongoose.connection.db.dropDatabase(done);
    });

    describe('createRegistration', function(){
        it('should do the create a registration object with the specified fields', function (done){
            User.signUp(userOneJSON, function(err,testUser){
                Registration.createRegistration(testUser.username, "MALE", availTest, "COURSES_THESE", earliestTime, function(err, registration){
                    assert.equal(registration.availability, availTest);
                    done();
                }
            );
        });
    });

});