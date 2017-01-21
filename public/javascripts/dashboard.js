$(document).ready(function () {
	$('#navbar-dashboard').addClass('active');
    var username = $("#username").val();
    var registrations = $("#reg").val();

    
    regIds = registrations.split(","); //array of reg ids
    
    $.ajax({
        url: '/users/' + username,
        method: 'GET',
        success: function(data) {
          // loads the registrations into #registrations div and sets all controllers
          
          for(var i=0; i<regIds.length; i++){
            id = regIds[i];
            //add buttons for each of these and have on click do a get to the url
            link = "/registrations/update/" + username +"/"+ id;
            $("#registrations").append("<a href="+link+"> Click here to update your registration </a>");
            $("#registrations").append("<br>");
          }
          
          //loadRegistrations(registrations, currentUser, csrfToken);
        },
        error: function(error) {
          console.log('Error fetching registrations');
          console.log(error);
        }
      });
});