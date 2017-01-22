var Regexs = function() {

    var that = Object.create(Regexs.prototype);


    that.passwordPattern = function(){
        return "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*\\-_])";
    };

    that.emailPattern = function(){
        return "\\S+@\\S+\\.\\S+";
    };

    that.notAllowedPattern = function(){
        return "<>"; 
    };

    Object.freeze(that);
    return that;
};

module.exports = Regexs();
