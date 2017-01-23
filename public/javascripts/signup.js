$(document).ready(function () {
	$('.tutor').hide();
	$('.student').filter('.tutor').show();
	$('.other').hide();
	$('.role').on('change', function () {
		var role = $('.role :selected').text().toLowerCase();
		if (role === 'tutor') {
			$('.student').hide();
			$('.admin').hide();
			$('.tutor').show();
		} else if (role === 'student') {
			$('.tutor').hide();
			$('.admin').hide();
			$('.student').show();
		} else if (role === 'administrator' || role === 'coordinator') {
			$('.tutor').hide();
			$('.student').hide();
			$('.admin').show();
		}
	});

	$('select').on('change', function () {
		var choice = $(this).find(':selected').text().toLowerCase();
		if (choice === 'other') {
			$(this).closest('.multiple-choice').find('.other').show();
		}
	});

	//makes sure that birthday is not in the future
	var now = new Date(Date.now());
    var timeNow = now.toISOString().substring(0, 10);
    $("#dob-register-box").attr("max", timeNow);

});