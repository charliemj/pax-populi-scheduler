const Regexs = function() {

    const that = Object.create(Regexs.prototype); //TO-DO: Find a better name than "that" for the object all of regex.js' methods belong to.


    that.passwordPattern = function(){
        return "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*\\-_])";
    };

    that.emailPattern = function(){
        return "\\S+@\\S+\\.\\S+";
    };

    that.notAllowedPattern = function(){
        return ".*[<>].*"; 
    };

    Object.freeze(that);
    return that;
};

module.exports = Regexs();
