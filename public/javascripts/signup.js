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
		} else if (role === 'administrator') {
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

	//doesn't allow user to select birthdays that are in the future on the UI
	var now = new Date(Date.now());
    var timeNow = now.toISOString().substring(0, 10);
    $("#dob-register-box").attr("max", timeNow);

});