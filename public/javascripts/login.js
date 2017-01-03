$(document).ready(function () {
    $('#verify-button').click(function () {
        var username = $('#username').val();
        var verificationToken = $('#verificationToken').val();
        var csrf = $('#csrf').val();

        $.ajax({
            url: '/verify/'+username+'/'+verificationToken,
            type: 'PUT',
            data: {username: username, verificationToken: verificationToken, _csrf: csrf},
            success: function(data) {
                if (data.success) {
                    addMessage('Verification succeeded! Redirecting you to the homepage...', 'success', false, true);
                    if (typeof data.redirect === 'string') {
                        setTimeout(function(){
                            window.location = data.redirect;
                        }, 1000);   
                    }
                } else {
                    addMessage('Verification failed!', 'danger', false, true);
                }
            },
            error: function(err) {
                addMessage('A network error might have occurred. Please try again.', 'danger', false, true);
            }
        });
    });

    $('#register-modal').on('shown.bs.modal', function() {
        // when user fills in username and password in the main page
        // then clicks sign up, help them fill up the sign up page
        $('#username-register-box').val($('#username-box').val());
        $('#password-register-box').val($('#password-box').val());

        $('#username-register-box').focus();
    });
});
