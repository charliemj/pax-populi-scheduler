$(document).ready(function () {
	$('#navbar-settings').addClass('active');

	$('.archive-button').click(function () {
        var id = $(this).attr('id').split('-').slice(-1)[0] 
        console.log('id', id)
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
                        }, 2500);   
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

	$('.match-button').click(function () {
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
                        }, 2500);   
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
    	if (!$(this).attr('aria-expanded')) {
    		$(this).addClass('pressed');
    	} else {
    		$(this).removeClass('pressed');
    	}
    });

    var max_fields      = 10; //maximum input boxes allowed
    var wrapper         = $(".input-fields-wrap"); //Fields wrapper
    var add_button      = $(".add-field-button"); //Add button ID
    
    var x = 1; //initlal text box count
    $(add_button).click(function(e){ //on add input button click
        e.preventDefault();
        if(x < max_fields){ //max input box allowed
            x++; //text box increment
            $(wrapper).append('<div class="form-group"><input type="text" name="mytext[]"/><a href="#" class="remove_field">Remove</a></div>'); //add input box
        }
    });
    
    $(wrapper).on("click",".remove_field", function(e){ //user click on remove text
        e.preventDefault(); $(this).parent('div').remove(); x--;
    });

});