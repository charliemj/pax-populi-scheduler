var assert = require('assert');

var expect = require('chai').expect;
var mongoose = require("mongoose");
var Registration = require('../models/registration.js');
var User = require('../models/user.js');
var db = mongoose.connect('mongodb://localhost/testdb');


var availTest = { '0':[[ '23:00', '24:00' ] ], '1': [],'2': [],'3': [],'4': [],'5': [],'6': [[ '06:00', '08:30' ]] }; 
var TEST_USER = { "_id" : "588b9d45b3aada3ec847430c", "username" : "kjmoore21", "password" : "$2a$10$rNXfY2VdUZ2eCRVVOwjS2.4uagb1rbTaQRUMrQH3/uO5CIs9KDv9q", "role" : "Tutor", "email" : "karleighmoore19+osiusj@gmail.com", "firstName" : "Karleigh", "lastName" : "Moore", "phoneNumber" : "6173888354", "gender" : "Male", "interests" : [ "Business", "International Relations" ], "nationality" : "United States", "timezone" : "America/Whitehorse", "region" : "Guam", "country" : "United States", "major" : "Management", "enrolled" : "false", "educationLevel" : "University Freshman", "school" : "Harvard University", "skypeId" : "Karleigh Moore", "dateOfBirth" : "1993-12-19T00:00:00Z", "nickname" : "", "middleName" : "", "alternativeEmail" : "karleighmoore19@gmail.com", "archived" : false, "onHold" : false, "inPool" : false, "requestToken" : "8iEdNNABYi6NhDZfiPsdDKGSvvujN4Lo", "rejected" : false, "approved" : true, "verificationToken" : "sEw6IlUVt4lUu2leyEVWftUtb8NIaOCH", "verified" : true, "__v" : 0 };
var earliestTime = "2017-01-01";


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
        it('should do the create a registration object with the specified fields (in this test, all required fields are filled out)', function (done){
            Registration.createRegistration(TEST_USER, "MALE", availTest, "COURSES_THESE", earliestTime, function(err, registration){
                if (err){console.log(err);}
                
                else{
                    assert.equal(registration.availability, availTest);
                    assert.equal(registration.genderPref, "MALE");
                    assert.equal(registration.courses, "COURSES_THESE");
                    assert.equal(registration.isMatched, false);
                    done();}
                }
            );
        });
    });

    describe('createRegistration', function(){
        it('should do the create a registration object with the specified fields (in this test, all required fields are filled out)', function (done){
            Registration.createRegistration(TEST_USER, "MALE", availTest, "COURSES_THESE", earliestTime, function(err, registration){
                
                assert.equal(registration.availability, availTest);
                assert.equal(registration.genderPref, "MALE");
                assert.equal(registration.courses, "COURSES_THESE");
                assert.equal(registration.isMatched, false);
                done();}
                
            );
        });
    });

    describe('createRegistration', function(){
        it('should fail to create registration object since all fields are not filled out in a valid way', function (done){
            Registration.createRegistration(TEST_USER, "INVALID OPTION", availTest, "COURSES_THESE", earliestTime, function(err, registration){
                assert(err);
                done();

            }); 
        });
    });

    describe('createRegistration', function(){
        it('should fail to create a second registration after making one sucessfully', function (done){
            Registration.createRegistration(TEST_USER, "NONE", availTest, "COURSES_THESE", earliestTime, function(err, registration){
                assert.equal(err, null);
                Registration.createRegistration(TEST_USER, "MALE", availTest, "COURSES_THESE", earliestTime, function(err, registration){
                    assert(err);
                    done();
                });
            }); 
        });
    });



});



