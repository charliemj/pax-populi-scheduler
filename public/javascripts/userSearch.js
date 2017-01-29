$(document).ready(function () {
    $('#navbar-userSearch').addClass('active');

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
});