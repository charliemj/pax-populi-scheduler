/**
 * Adds the message message to the area with id messages or class modal-messages.
 * @param {String}  message  The message
 * @param {String}  type     The type of message: success, warning, info, or danger
 * @param {Boolean} isModal  if true, adds the message to modal-messages instead of messages
 * @param {Boolean} clearOld if true, clears old messages
 */
var addMessage = function(message, success) {
    $('#messages').empty();
    $('.modal-content').addClass(success ? 'success': 'error');
    $('#messages').text(message);
    console.log($('#messages').html());
    console.log($('#message-modal').html());
    console.log($().jquery);
    try {
    	$('#message-modal').modal('show');
    } catch (err) {
    	$j('#message-modal').modal('show');
    }
    
};
