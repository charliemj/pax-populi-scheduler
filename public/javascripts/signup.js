$(document).ready(function () {
	$('.tutor').hide();
	$('.student').filter('.tutor').show();
	$('.other').hide();
	$('.in-charge').hide();
	$('.role').on('change', function () {
		var role = $('.role :selected').text().toLowerCase();
		$('.coordinator').hide();
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
	    	$('#in-charge-of').empty();
	    	$('.other').hide();
	    	var countryHTML = $('<div class="form-group country" ><label class="control-label">Country*</label><div><!--Source: https://github.com/benkeen/country-region-selector--><select name="countryInCharge" class="form-control signup-input crs-country" data-region-id="regionHere2" required></select></div></div>')
	    	countryHTML.find('select').attr('name', 'countryInCharge');
	    	var regionHTML = $('<div class="form-group region"><label class="control-label">Region*</label><div><select name="regionInCharge" class="form-control signup-input" id="regionHere2"></select></div></div>');
	    	regionHTML = countryHTML.add(regionHTML);
            var schoolHTML = $('#tutor-schools').clone();

	        if ($(this).is(':checked')) {
	        	var inCharge = $(this).val();
	        	switch (inCharge) {
	        		case 'School':
	        			$('#in-charge-of').html(schoolHTML);
	        			break;
	        		case 'Region':
	        			$('#in-charge-of').html(regionHTML);
	        			// $.getScript('/javascripts/vendor/crs.min.js');
	        			window.crs.init();
	        			break;
	        		case 'Country':
	        			$('#in-charge-of').html(countryHTML);
	        			break;
	        	}  
	        }
    });

	$(document).on('change', 'select', function () {
		var choice = $(this).find(':selected').text().toLowerCase().trim();
		var other = $(this).closest('.multiple-choice').find('.other');
		if (other.length === 0) {
			other = $('#in-charge-of-container').find('.other');
		}
		if (choice === 'other') {
			other.show();
		} else {
			other.hide();
		}
	});

	//doesn't allow user to select birthdays that are in the future on the UI
	var now = new Date(Date.now());
    var timeNow = now.toISOString().substring(0, 10);
    $("#dob-register-box").attr("max", timeNow);

});
