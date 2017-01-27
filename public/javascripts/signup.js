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

		$("#incharge").hide();
	    
	});

	$('input:radio[name="in-charge"]').change(
	    function () {

            
            var schoolHTML = $('#tutor-schools').clone();
            schoolHTML.find('select').attr('name', 'schoolInCharge');

	        if ($(this).is(':checked')) {
	        	var inCharge = $(this).val();
	        	switch (inCharge) {
	        		case 'School':
	        			$("#incharge").hide();
	        			$("#regionHere2").hide();
	        			$('#in-charge-of').html(schoolHTML);
	        			break;
	        		case 'Region':
	     				$('#in-charge-of').html(schoolHTML).empty();
	        			$("#incharge").show();
	        			$("#regionHere2").show();
	        			break;
	        		case 'Country':
	        			$('#in-charge-of').html(schoolHTML).empty();
	        			$("#incharge").show();
	        			$("#regionHere2").hide();
	        			$("#regionLabel").hide();
	        			$("#regionHere2").val("--"); //no region selected
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