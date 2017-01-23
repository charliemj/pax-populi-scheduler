$(document).ready(function () {
	$('.tutor').hide();
	$('.student').filter('.tutor').show();
	$('.other').hide();
	$('.in-charge').hide();
	$('.role').on('change', function () {
		var role = $('.role :selected').text().toLowerCase();
		switch(role) {
		    case 'tutor':
		        $('.student').hide();
				$('.admin').hide();
				$('.coordinator').hide();
				$('.tutor').show();
		        break;
		    case 'student':
		        $('.tutor').hide();
				$('.admin').hide();
				$('.coordinator').hide();
				$('.student').show();
		        break;
		    case 'administrator':
		    	$('.tutor').hide();
				$('.student').hide();
				$('.admin').show();
				break;
			case 'coordinator':
				$('.tutor').hide();
				$('.student').hide();
				$('.coordinator').show();
		    default:
		        break;
		}
	});

	$('input:radio[name="in-charge"]').change(
	    function () {
	    	console.log('changed');
	    	var countryHTML = $('.country').clone();
	    	countryHTML.find('select').attr('name', 'countryInCharge');
	    	var regionHTML = $('.region').clone();
	    	regionHTML.find('select').attr('name', 'regionInCharge');
	    	regionHTML = countryHTML.add(regionHTML);
            var schoolHTML = $('#tutor-schools').clone();
            schoolHTML.find('select').attr('name', 'schoolInCharge');

	        if ($(this).is(':checked')) {
	        	var inCharge = $(this).val();
	        	console.log('inCharge', inCharge);
	        	switch (inCharge) {
	        		case 'School':
	        			$('#in-charge-of').html(schoolHTML);
	        			break;
	        		case 'Region':
	        			$('#in-charge-of').html(regionHTML);
	        			break;
	        		case 'Country':
	        			$('#in-charge-of').html(countryHTML);
	        			break;
	        	}
	            
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