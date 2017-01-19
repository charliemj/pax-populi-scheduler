$(document).ready(function () {
	$('#navbar-register').addClass('active');

    $('select').on('change', function () {
        var choice = $(this).find(':selected').text().toLowerCase();
        if (choice === 'other') {
            console.log('hiii', $(this).closest('.multiple-choice').find('.other'));
            $(this).closest('.multiple-choice').find('.other').show();
        }
    });
    
});