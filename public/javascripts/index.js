
var checkSignUpForm = function () {
    $("#username-register-box").blur(function(){
        console.log("clicked out of username box!");
    });   
};
/**
 * Adds the message message to the area with id messages or class modal-messages.
 * @param {String}  message  The message
 * @param {String}  type     The type of message: success, warning, info, or danger
 * @param {Boolean} isModal  if true, adds the message to modal-messages instead of messages
 * @param {Boolean} clearOld if true, clears old messages
 */
var addMessage = function(message, type, isModal, clearOld) {
    var divSelector = isModal ? '.modal-messages' : '#messages';
    if (clearOld) $(divSelector).empty();
    var messageDiv = $('<div/>');
    messageDiv.addClass('alert alert-dismissible alert-'+type);
    messageDiv.attr('role', 'alert');
    messageDiv.text(message);
    // dismiss button. code from bootstrap
    messageDiv.append('<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
    $(messageDiv).appendTo($(divSelector)).hide().slideDown(1000);
};