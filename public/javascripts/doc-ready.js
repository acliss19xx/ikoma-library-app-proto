$(document).ready(function () {
    var trigger = $('.hamburger'),
    overlay = $('.overlay'),
    isClosed = false;

    trigger.click(function () {
	hamburger_cross();      
    });

    function hamburger_cross() {

	if (isClosed == true) {          
	    overlay.hide();
	    trigger.removeClass('is-open');
	    trigger.addClass('is-closed');
	    isClosed = false;
	} else {   
	    overlay.show();
	    trigger.removeClass('is-closed');
	    trigger.addClass('is-open');
	    isClosed = true;
	}
    }
    
    $('[data-toggle="offcanvas"]').click(function () {
	$('#wrapper').toggleClass('toggled');
    });  

    $('.book-list').slick({
	dots: true,
	speed: 100,
	slidesToShow: 1,
	slidesToScroll: 1,
	autoplay: true,
    });
});
