$(document).ready(function () {
	$('.tutor').hide();
	$('.other').hide();
	$('.status').on('change', function () {
		var status = $('.status :selected').text().toLowerCase();
		if (status === 'tutor') {
			$('.student').hide();
			$('.tutor').show();
		} else if (status === 'student') {
			$('.tutor').hide();
			$('.student').show();
		}
	});

	$('select').on('change', function () {
		var choice = $(this).find(':selected').text().toLowerCase();
		if (choice === 'other') {
			console.log('hiii', $(this).closest('.multiple-choice').find('.other'));
			$(this).closest('.multiple-choice').find('.other').show();
		}
	});

	//makes sure that birthday is not in the future
	var now = new Date(Date.now());
    var timeNow = now.toISOString().substring(0, 10);
    $("#dob-register-box").attr("max", timeNow);

});