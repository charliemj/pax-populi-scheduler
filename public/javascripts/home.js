$(document).ready(function () {
	 $('#navbar-dashboard').addClass('active');
	var html = $.parseHTML('<center>' + $('.login-warning').text() + '</center>');
	$('.login-warning').html(html);
});