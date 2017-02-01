var assert = require('assert');

var expect = require('chai').expect;
var mongoose = require("mongoose");
var Registration = require('../models/registration.js');
var User = require('../models/user.js');
var db = mongoose.connect('mongodb://localhost/testdb');


var availTest = { '0':[[ '23:00', '24:00' ] ], '1': [],'2': [],'3': [],'4': [],'5': [],'6': [[ '06:00', '08:30' ]] }; 
var TEST_USER = { "_id" : "588b9d45b3aada3ec847430c", "username" : "user1", "password" : "$2a$10$rNXfY2VdUZ2eCRVVOwjS2.4uagb1rbTaQRUMrQH3/uO5CIs9KDv9q", "role" : "Tutor", "email" : "email1+osiusj@gmail.com", "firstName" : "Jane", "lastName" : "Doe", "phoneNumber" : "5458675309", "gender" : "Female", "interests" : [ "Business", "International Relations" ], "nationality" : "United States", "timezone" : "America/Whitehorse", "region" : "Guam", "country" : "United States", "major" : "Management", "enrolled" : "false", "educationLevel" : "University Freshman", "school" : "Harvard University", "skypeId" : "Karleigh Moore", "dateOfBirth" : "1993-12-19T00:00:00Z", "nickname" : "", "middleName" : "", "alternativeEmail" : "email19@gmail.com", "archived" : false, "onHold" : false, "inPool" : false, "requestToken" : "8iEdNNABYi6NhDZfiPsdDKGSvvujN4LL", "rejected" : false, "approved" : true, "verificationToken" : "sEw6IlUVt4lUu2leyEVWftUtb8NIaOLOL", "verified" : true, "__v" : 0 };
var earliestTime = "2017-01-01";

var TEST_USER_2 = { "_id" : "699b9d45b3aada3ec847430e", "username" : "user2", "password" : "$2a$10$rNXfY2VdUZ2eCRVVOwjS2.4uagb1rbTaQRUMrQH3/uO5CIs9KDlol", "role" : "Student", "email" : "email2+osiusj@gmail.com", "firstName" : "John", "lastName" : "Smith", "phoneNumber" : "6166166167", "gender" : "Male", "interests" : [ "Business" ], "nationality" : "Canada", "timezone" : "America/Whitehorse", "region" : "Michigan", "country" : "United States", "major" : "Management", "enrolled" : "false", "educationLevel" : "University Freshman", "school" : "Harvard University", "skypeId" : "Karleigh Moore", "dateOfBirth" : "1993-12-19T00:00:00Z", "nickname" : "", "middleName" : "", "alternativeEmail" : "karleighmoore19@gmail.com", "archived" : false, "onHold" : false, "inPool" : false, "requestToken" : "8iEdNNABYi6NhDZfiPsdDKGSvvujN4Lo", "rejected" : false, "approved" : true, "verificationToken" : "sEw6IlUVt4lUu2leyEVWftUtb8NIaOCH", "verified" : true, "__v" : 0 };


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

    describe('getUnmatchedRegistrationsForUser', function(){
        it('should get one unmatched registration', function (done){
            Registration.createRegistration(TEST_USER, "NONE", availTest, "COURSES_THESE", earliestTime, function(err, registration){
                assert.equal(err, null);
                Registration.getUnmatchedRegistrationsForUser(TEST_USER, function(err, registration){
                    assert.equal(registration.length, 1);
                    done();
                });
            }); 
        });
    });


    describe('findRegistration', function(){
        it('should find the one unmatched registration we just made by its id', function (done){
            Registration.createRegistration(TEST_USER, "NONE", availTest, "COURSES_THESE", earliestTime, function(err, registration){
                assert.equal(err, null);
                var reg1 = registration;
                var regId1 = registration._id;
                Registration.findRegistration(regId1, TEST_USER, function(err, registration2){
                    assert.equal(regId1.toString(), registration2._id.toString());
                    done();
                });
            }); 
        });
    });

    describe('findRegistration', function(){
        it('should return an error because it looks up a registration made by another user', function (done){
            Registration.createRegistration(TEST_USER, "NONE", availTest, "COURSES_THESE", earliestTime, function(err, registration){
                assert.equal(err, null);
                var reg1 = registration;
                var regId1 = registration._id;
                Registration.findRegistration(regId1, TEST_USER_2, function(err, registration2){
                    assert(err);
                    done();
                });
            }); 
        });
    });

    describe('deleteRegistration', function(){
        it('should sucessfully delete the registration since the registration belongs to the user (will raise an error because we search for a deleted reg)', function (done){
            Registration.createRegistration(TEST_USER, "NONE", availTest, "COURSES_THESE", earliestTime, function(err, registration){
                assert.equal(err, null);
                var reg1 = registration;
                var regId1 = registration._id;
                Registration.deleteRegistration(regId1, TEST_USER, function(err, registration2){
                    Registration.findRegistration(regId1, TEST_USER, function(err, registration3){
                        assert(err);
                        done();
                    });
                    
                });
            }); 
        });
    });

    describe('deleteRegistration', function(){
        it('should fail to delete the registration since the registration belongs to another user', function (done){
            Registration.createRegistration(TEST_USER, "NONE", availTest, "COURSES_THESE", earliestTime, function(err, registration){
                assert.equal(err, null);
                var reg1 = registration;
                var regId1 = registration._id;
                Registration.deleteRegistration(regId1, TEST_USER_2, function(err, registration2){
                    Registration.findRegistration(regId1, TEST_USER, function(err, registration3){
                        assert.equal(regId1.toString(), registration3._id.toString());
                        done();
                    });
                    
                });
            }); 
        });
    });


    // describe('markAsMatched', function(){
    //     it('should return no unmatched registrations', function (done){
    //         Registration.createRegistration(TEST_USER, "NONE", availTest, "COURSES_THESE", earliestTime, function(err, reg1){
    //             var regId1 = reg1._id;
    //             Registration.createRegistration(TEST_USER_2, "NONE", availTest, "COURSES_THESE", earliestTime, function(err, reg2){
    //                 var regId2 = reg2._id;
    //                 Registration.markAsMatched([reg1, reg2], function(err, registration){
    //                     Registration.getUnmatchedRegistrations(function(err, registrations){
    //                         assert.equal(length.registrations, 0);
    //                         //console.log(registrations);
    //                         done();
    //                     });
    //                 });

    //             });
    //         }); 
    //     });
    // });

    describe('getUnmatchedRegistrations', function(){
        it('should return 2 unmatched registrations', function (done){
            Registration.createRegistration(TEST_USER, "NONE", availTest, "COURSES_THESE", earliestTime, function(err, reg1){
                var regId1 = reg1._id;
                Registration.createRegistration(TEST_USER_2, "FEMALE", availTest, "COURSES_THESE", earliestTime, function(err, reg2){
                    var regId2 = reg2._id;
                    Registration.getUnmatchedRegistrations(function(err, registrations){
                        assert.equal(registrations.length, 2);
                        done();
                    });
                });
            }); 
        });
    });

});

describe('User', function(){
    after(function () {
        // disconnect for clean up
        db.disconnect();
    });

    // drop database before each test
    beforeEach(function (done) {
        mongoose.connection.db.dropDatabase(done);
    });

    describe('verifyAccount', function(){
        it('should sucessfully verify account', function (done){
            User.verifyAccount(username, token, function(err, user){
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

});


