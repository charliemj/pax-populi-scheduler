var mongoose = require("mongoose");
var Registration = require('../model/registration.js');
var User = require('../model/user.js');
var assert = require("assert");
var db = mongoose.connect('mongodb://localhost/testdb');

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

    describe('FN_NAME', function(){
        it('should do the following', function (done){
            Registration
        })
    });

});