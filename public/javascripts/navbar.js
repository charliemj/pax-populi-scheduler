$(document).ready(function() {
    $('.logout-button').click(function() {
        var csrf = $(this).parent().parent().find('#csrf').val();
        $.post('/logout', {_csrf: csrf}, function() {
            window.location.replace('/');
        });
    });
});