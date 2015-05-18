$(document).ready(function() {

	// Blur images on mouse over
	$(".portfolio a").hover( function(){ 
		$(this).children("img").animate({ opacity: 0.75 }, "fast"); 
	}, function(){ 
		$(this).children("img").animate({ opacity: 1.0 }, "slow"); 
	}); 
	
	// Initialize prettyPhoto plugin
	$(".portfolio a[data-rel^='prettyPhoto']").prettyPhoto({
		theme:'pp_default', 
		autoplay_slideshow: false, 
		overlay_gallery: true, 
		show_title: false,
		social_tools: false
	});

	// Clone portfolio items to get a second collection for Quicksand plugin
	var $portfolioClone = $(".portfolio").clone();
	
	// Attempt to call Quicksand on every click event handler
	$(".filter a").click(function(e){			
		$(".filter a").removeClass("current");	
		
		// Get the class attribute value of the clicked link
		var $filterClass =  $(this).parent().attr("class");

		if ( $filterClass == "all" ) {
			var $filteredPortfolio = $portfolioClone.find("li");
		} else {
			var $filteredPortfolio = $portfolioClone.find("li[data-type~=" + $filterClass + "]");
		}		
		// Call quicksand
		$(".portfolio").quicksand( $filteredPortfolio, { 
			duration: 800, 
			easing: 'easeInOutQuad' 
		}, function(){
			
			// Blur newly cloned portfolio items on mouse over and apply prettyPhoto
			$(".portfolio a").hover( function(){ 
				$(this).children("img").animate({ opacity: 0.75 }, "fast"); 
			}, function(){ 
				$(this).children("img").animate({ opacity: 1.0 }, "slow"); 
			}); 
			
			$(".portfolio a[data-rel^='prettyPhoto']").prettyPhoto({
				theme:'pp_default', 
				autoplay_slideshow: false, 
				overlay_gallery: true, 
				show_title: false,
				social_tools: false
			});
		});


		$(this).addClass("current");

		// Prevent the browser jump to the link anchor
		e.preventDefault();
	})
});