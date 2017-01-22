$(document).ready(function () {
	$('#navbar-register').addClass('active');
	$(".dropdown-toggle").dropdown();
    
    var now = new Date(Date.now());

    var timeNow = now.toISOString().substring(0, 10);
    $("#earliestStartTime").attr("min", timeNow);

    //TO DO validate registration form -- don't allow submit if requried fields missing

});