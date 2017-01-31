$(document).ready(function () {
	$('#navbar-settings').addClass('active');

	$('.archive-button').click(function () {
        var id = $(this).attr('id').split('-').slice(-1)[0] ;
        console.log('id', id);
        var username = $('#username-' + id).val();
        var csrf = $('#csrf').val();
        var action = $(this).attr('id').split('-')[0];
        console.log('username', username);

        $.ajax({
            url: '/'+action+'/'+username,
            type: 'PUT',
            data: {username: username, _csrf: csrf},
            success: function(data) {
                if (data.success) {
                    addMessage(data.message, true);
                    if (typeof data.redirect === 'string') {
                        setTimeout(function(){
                            window.location = data.redirect;
                        }, 1500);   
                    }
                } else {
                    addMessage(data.message, false);
                }
            },
            error: function(err) {
                addMessage('A network error might have occurred. Please try again.', false);
            }
        });
    });

	$('.match-button').unbind('click').click(function () {
		var csrf = $('#csrf').val();
        $.ajax({
            url: '/schedules/match',
            type: 'PUT',
            data: {_csrf: csrf},
            success: function(data) {
                if (data.success) {
                    addMessage(data.message, true);
                    if (typeof data.redirect === 'string') {
                        setTimeout(function(){
                            window.location = data.redirect;
                        }, 1500);   
                    }
                } else {
                    addMessage(data.message, false);
                }
            },
            error: function(err) {
                addMessage('A network error might have occurred. Please try again.', false);
            }
        });
    });

	$('#scheduler-switch').click(function () {
		var csrf = $('#csrf').val();
        $.ajax({
            url: '/schedules/toggleSwitch',
            type: 'PUT',
            data: {_csrf: csrf},
            success: function(data) {
                if (data.success) {
                    addMessage(data.message, true);
                    console.log('redirecting to ', data.redirect);
                    if (typeof data.redirect === 'string') {
                        setTimeout(function(){
                            window.location = data.redirect;
                        }, 1500);   
                    }
                } else {
                    addMessage(data.message, false);
                }
            },
            error: function(err) {
                addMessage('A network error might have occurred. Please try again.', false);
            }
        });
	});

    $('.default-button').click(function (e) {
    	var target = $($(this).attr('data-target'));
    	var classes = target.attr('class').split(' ');
    	if (classes.indexOf('in') > -1) {
    		$(this).removeClass('pressed');
    	} else {
    		$(this).addClass('pressed');
    	}
    });
 
    var addButton = $(".add-field-button");
    
    $(addButton).click( function (e) {
        e.preventDefault();
        var thisWrapper = $(this).parent().find(".input-fields-wrap");
        console.log(thisWrapper);
        var name = $(thisWrapper).find('.form-control').attr('name');
        $(thisWrapper).append('<div class="form-group"><input class="form-control" type="text" name="'+ name + '"/><a href="#" class="remove-field">Remove</a></div>'); //add input box
    });

    var wrapper = $('.input-fields-wrap');
    $(wrapper).on("click",".remove-field", function (e) { //user click on remove text
        e.preventDefault();
        console.log($(this).parent('div').html());
        $(this).parent('div').remove();
    });

});