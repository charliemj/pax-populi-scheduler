$(document).ready(function () {
	$('#navbar-dashboard').addClass('active');
	$('#master-schedule-table').hide();

	$('.hideLink').on('click', function () {
	  	var state = $(this).text().toLowerCase().trim();
	  	console.log('state', state);
	  	var newState = state === 'hide' ? 'Unhide': 'Hide'
	  	$(this).text(newState);
	});

	$('.approve-schedule-button, .reject-schedule-button').click(function () {
		console.log('clicked')
        var id = $(this).attr('id').split('-').slice(-1)[0];
        var username = $('#username').val();
        var csrf = $('#csrf').val();
        var action = $(this).attr('id').split('-')[0];
        // console.log($('#courseInput-' + id).html());
        // console.log($("#scheduleOptions-" + id).html());
        var course = $('#courseInput-' + id + ' option:selected').text();
        console.log('course', course);
        var radioButtons = $("#scheduleOptions-" + id + " input:radio");
		var selectedIndex = radioButtons.index(radioButtons.filter(':checked'));
		console.log('index', selectedIndex);

        $.ajax({
            url: '/schedules/'+action+'/'+username+'/'+ id,
            type: 'PUT',
            data: {scheduleId: id, course: course, scheduleIndex: selectedIndex, username: username, _csrf: csrf},
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


	// Source: http://stackoverflow.com/a/16203218
    function exportTableToCSV($table, filename) {

        var $rows = $table.find('tr:has(td),tr:has(th)');

            // Temporary delimiter characters unlikely to be typed by keyboard
            // This is to avoid accidentally splitting the actual contents
            tmpColDelim = String.fromCharCode(11), // vertical tab character
            tmpRowDelim = String.fromCharCode(0), // null character

            // actual delimiter characters for CSV format
            colDelim = '","',
            rowDelim = '"\r\n"',

            // Grab text from table into CSV formatted string
            csv = '"' + $rows.map(function (i, row) {
                var $row = $(row),
                    $cols = $row.find('td,th');;

                return $cols.map(function (j, col) {
                    var $col = $(col),
                        text = $col.text();

                    return text.replace(/"/g, '""'); // escape double quotes

                }).get().join(tmpColDelim);

            }).get().join(tmpRowDelim)
                .split(tmpRowDelim).join(rowDelim)
                .split(tmpColDelim).join(colDelim) + '"';

        console.log('rows', $rows);
        console.log('csv', csv)

				// Deliberate 'false', see comment below
        if (false && window.navigator.msSaveBlob) {

						var blob = new Blob([decodeURIComponent(csv)], {
	              type: 'text/csv;charset=utf8'
            });
            
            // Crashes in IE 10, IE 11 and Microsoft Edge
            // See MS Edge Issue #10396033: https://goo.gl/AEiSjJ
            // Hence, the deliberate 'false'
            // This is here just for completeness
            // Remove the 'false' at your own risk
            window.navigator.msSaveBlob(blob, filename);
            
        } else if (window.Blob && window.URL) {
			// HTML5 Blob    
            var blob = new Blob([csv], { type: 'text/csv;charset=utf8' });
            var csvUrl = URL.createObjectURL(blob);
            $(this).attr({
                		'download': filename,
                		'href': csvUrl
		            });
		} else {
			// Data URI
			//csvData = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv), //old way
			blob = new Blob([csv], { type: 'text/csv' }); //new way
			var csvUrl = URL.createObjectURL(blob);

			$(this).attr({
			    		'download': filename,
			    		'href': csvUrl
						});
        }
    }

    // This must be a hyperlink
    $(".export").on('click', function (event) {
        // CSV
        var args = [$('#master-schedule-table'), 'master_schedule.csv'];
        
        exportTableToCSV.apply(this, args);
        
        // If CSV, don't do event.preventDefault() or return false
        // We actually need this to be a typical hyperlink
    });

});