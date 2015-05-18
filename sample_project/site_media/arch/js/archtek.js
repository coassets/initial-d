/*
 * Archtek - Responsive Modern HTML Template
 * By UXbarn
 * Themeforest Profile: http://themeforest.net/user/UXbarn?ref=UXbarn
 * Demo URL: http://themes.uxbarn.com/redirect.php?theme=archtek_html
 * Created: May 19, 2013
 */

jQuery(document).ready(function($) {
    /* #DEMO
     ================================================== */
    //$.getScript('demo/demo.js');
    /* END: DEMO */
   
    // ---------------------------------------------- //
    // Configuration Options
    // ---------------------------------------------- //
    var useFixedHeader = true;
    var showScrollToTopButton = false;
    
    var homeSliderAutoAnimated = true;
    var homeSliderAutoAnimatedDelay = 8000;
    var homeSliderAnimation = 'directscroll';
    var homeSliderAnimationSpeed = 1000;
    
    var testimonialSliderAutoAnimated = true;
    var testimonialSliderAutoAnimatedDelay = 10000;
    var testimonialSliderAnimationSpeed = 600;
    
    var imageSliderAutoAnimated = true;
    var imageSliderAutoAnimatedDelay = 5000;
    var imageSliderAnimation = 'directscroll';
    var imageSliderAnimationSpeed = 600;
    
    var portfolioImageSliderAutoAnimated = true;
    var portfolioImageSliderAutoAnimatedDelay = 5000;
    var portfolioImageSliderAnimation = 'directscroll';
    var portfolioImageSliderAnimationSpeed = 1000;





    // ---------------------------------------------- //
    // Global Variables (DO NOT CHANGE!)
    // ---------------------------------------------- //
    var isHeaderCollapsed = false;
    var isSearchDisplayed = false;
    
    // ---------------------------------------------- //
    
    
    
    
    
    // ---------------------------------------------- //
    // Core Scripts
    // ---------------------------------------------- //
    
    // Initialize custom functions
    renderGoogleMaps();
    initMobileMenu();
    
    // Initialize Foundation framework
    $(document).foundation();
    
    // ScrollUp plugin
    if(showScrollToTopButton) {
        $.scrollUp({
            animation: 'slide',
            topDistance: '1000',
            topSpeed: 700,
            scrollText: '',
            animationInSpeed: 700,
            animationOutSpeed: 300,
        });
        $('#scrollUp').append('<i class="icon-angle-up"></i>');
    }
    
    // Stretch the image within the container using Backstretch plugin
    var width = parseInt($('.content-width').css('width').replace('px', ''));
    // Run only for small mobile and tablet size like iPad
    if(width <= 479 || (width >= 768 && width <= 959)) {
        if($('.stretch-image').length > 0) {
            $('.stretch-image').each(function() {
                var originalImg = $(this);
                var parentTag = $(this).parent();
                
                parentTag.backstretch(originalImg.attr('src'));
                parentTag.find('div.backstretch').find('img').attr('alt', originalImg.attr('alt'));
                    
                originalImg.remove();
            });
        }
    }
    
    // Stretch the home slider's images and header images (always stretch on all resolutions by default)
    if($('.home-slider-item, #header-image').length > 0) {
        $('.home-slider-item, #header-image').each(function() {
            var originalImg = $(this).find('img');
            var parentTag = $(this);
            parentTag.backstretch(originalImg.attr('src'));
            parentTag.find('div.backstretch').find('img').attr('alt', originalImg.attr('alt'));
            originalImg.remove();
        });
    }
    
    // Stretch the slider's images on portfolio single page (always stretch on all resolutions by default)
    if($('#portfolio-item-images').length > 0) {
        $('#portfolio-item-images img').each(function() {
            var originalImg = $(this);
            var parentTag = $(this).parent();
            // Anchor tag, 1st-level parent of the image
            var anchorTagAttributes = $(this).parent().prop('attributes');
            
            // Check real containing tag of the image
            if($(this).parent().prop('tagName').toLowerCase() == 'a') {
                
                parentTag = $(this).parent().parent();
                parentTag.backstretch(originalImg.attr('src'));
                  
                // Set "alt" tag from original image to backstretch image
                var alteredImg = parentTag.find('div.backstretch').find('img');
                alteredImg.attr('alt', originalImg.attr('alt'));
                
                // Declare new anchor tag
                var newAnchor = $('<a />');
                
                // Loop throught anchor tag's attributes and add them to the new anchor tag
                $.each(anchorTagAttributes, function() {
                    newAnchor.attr(this.name, this.value);
                });
                
                parentTag.find('div.backstretch').append(newAnchor.append(alteredImg));
                
                // Remove original set
                $(this).parent().remove();
                
            } else if($(this).parent().prop('tagName').toLowerCase() == 'div') {
                
                parentTag = $(this).parent();
                parentTag.backstretch(originalImg.attr('src'));
                
                // Remove original set
                originalImg.remove();
                
            }
          
        });
    }
    
    
    // FancyBox for Image Modal
    $('.image-box').fancybox({
        centerOnScroll : false,
        overlayOpacity : '0.9',
        overlayColor : '#222',
        showNavArrows : true
    });
    
    
    // Twitter API
    if($('.twitter-widget-content').length > 0) {
        $('.twitter-widget-content').jtwt({
            username: 'envato',
            image_size : 20,
            count : 2,
        });
    }
    
    // Validation Engine
    if ($('form.validate').length > 0) {
        $('form.validate').validationEngine('attach', {
            autoHidePrompt : 'false',
            autoHideDelay : '7000',
            fixed : true,
            scroll : false,
            binded : false,
            promptPosition : 'centerRight'
        });
    }
    // Always initialize contact form "after" Validation Engine plugin
    initContactForm();
    
    
    // Accordion/Toggle
    var icons = {
        header: 'ui-accordion-header-icon',
        activeHeader: 'ui-accordion-header-icon-active'
    };
    var animateObj = {
        animate: 'easeOutQuint',
        duration: 600,
    };
    
    if ($('.accordion').length > 0) {
        
        $('.accordion').each(function() {
           $(this).accordion({
                autoHeight: false,
                heightStyle: 'content', // jQuery UI 1.10.x
                collapsible: false,
                //icons: icons,
                animate: animateObj,
                active: parseInt($(this).attr('data-active-index'))
           });
        });
        
    }
    
    if ($('.toggle').length > 0) {
        
        $('.toggle').accordion({
            autoHeight: false,
            heightStyle: 'content', // jQuery UI 1.10.x
            //icons: icons,
            collapsible: true,
            animate: animateObj,
            active: false,
        });
        
        if($('.toggle').hasClass('active')) {
            $('.toggle.active').accordion({
                heightStyle: 'content',
                autoHeight: false,
                //icons: icons,
                collapsible: true,
                animate: animateObj,
                active: 0,
            });
            
            $('body').scrollTop(0);
        }
        
    }
    
    // "placeholder" attribute fix for all browsers
    $('[placeholder]').focus(function() {
      var input = $(this);
      if (input.val() == input.attr('placeholder')) {
        input.val('');
        input.removeClass('placeholder');
      }
    }).blur(function() {
      var input = $(this);
      if (input.val() == '' || input.val() == input.attr('placeholder')) {
        input.addClass('placeholder');
        input.val(input.attr('placeholder'));
      }
    }).blur();
    $('[placeholder]').parents('form').submit(function() {
      $(this).find('[placeholder]').each(function() {
        var input = $(this);
        if (input.val() == input.attr('placeholder')) {
          input.val('');
        }
      })
    });
    
    // If there is no "p" tag on page intro, remove margin-bottom for h1 or h2 tag
    if($('#intro').length > 0) {
        if($('#intro').find('p').length == 0) {
            $('#intro').find('h1, h2').css('margin-bottom', 0);
        }
    }
    
    // Tabs
    if($('html').hasClass('lt-ie9')) {
        $('.auto').addClass('tabs').removeClass('auto').attr('data-section', 'tabs');
    }
    var tabs = $('.vertical-tabs p.title > a, .tabs p.title > a, .auto p.title > a');
    tabs.click(function() {
        
        // Force hiding any content that contains Google Map
        $(this).parents('.section-container').find('.content').each(function() {
            if($(this).find('.google-map').length > 0) {
                $(this).css('display', 'none');
            }
        });
        
        var map = $(this).parents('section').find('.content').find('.google-map');
        if(map.length > 0) {
            // Re-render Google Map for tab content and display the content
            $(this).parents('section').find('.content').css({'display': 'block', 'width': '100%'});
            renderGoogleMaps();
        }
    });
    
    // Menu
    var subs = $('ul.sf-menu').supersubs({
        minWidth: 15,
        maxWidth: 25,
        extraWidth: 2
    });
    
    subs.superfish({
        animation : {
            opacity: 'show',
            height: 'show'
        },
        delay : 150,
        speed : 'fast'
    });
    
    // Header Search Button
    $('#header-search-button').click(function() {
        if(!isSearchDisplayed) {
            // Display search input
            $('#header-search-input-wrapper').css('display', 'block').stop().animate({
                opacity: 1
            }, 300);
            
            $('#header-search-button').addClass('cancel').find('i').removeClass().addClass('icon-reply');
            $('#header-search-input').focus();
            
            isSearchDisplayed = true;
        } else {
            // Hide search input
            $('#header-search-input-wrapper').stop().animate({
                opacity: 0
            }, 300, function() {
                $(this).css('display', 'none');
            });
            
            $('#header-search-button').removeClass('cancel').find('i').removeClass().addClass('icon-search');
            
            isSearchDisplayed = false;
        }
        
    });
    
    // Function for reducing header when scrolling down
    if(useFixedHeader) {
        
        $('#header-container').removeClass('no-fixed');
        
        $(window).bind('scroll', function() {
             var header = $('#header-container');
             var logo = $('#logo-wrapper');
             var search = $('#header-search');
             
             // Once scrolled below 150, do the followings
             if ($(window).scrollTop() > 150) {
                 var width = parseInt($('.content-width').css('width').replace('px', ''));
                 
                 if(width > 959) {
                     
                     if(!isHeaderCollapsed) {
                         header.stop().animate({
                             top: -84, // Collapse header size
                         }, 800, function() {
                             search.css('right', -60).stop().animate({
                                 top: 84 // Move search button to new position
                             });
                         });
                         
                         logo.find('p').hide(); // Hide tagline
                         logo.find('img').css('height', 30);
                         logo.css({
                            position: 'absolute',
                            paddingBottom: 0, 
                         });
                         logo.stop().animate({
                             bottom: 0, // Set new position for logo
                         });
                         
                         $('#header-search-input').addClass('small');
                         
                         isHeaderCollapsed = true;
                     }
                     
                 } else { // <= 959px (Tablet and below)
                     
                     if(width >= 768) {
                         if(!isHeaderCollapsed) {
                             header.stop().animate({
                                 top: -12, // Collapse header size
                             }, 800);
                             
                             search.stop().animate({
                                top: 33 // Move search button to new position
                             }, 800);
                             
                             logo.find('p').hide(); // Hide tagline
                             logo.find('img').css('height', 30);
                             logo.css({
                                //position: 'absolute',
                                paddingBottom: 0, 
                             });
                             logo.stop().animate({
                                 bottom: 0, // Set new position for logo
                             });
                             
                             $('#header-search-input').addClass('small');
                             
                             isHeaderCollapsed = true;
                         }
                     }
                 }
             } else {
                 header.stop().animate({
                     top: 0,
                 });
                 
                 logo.find('img').removeAttr('style'); 
                 logo.css({
                    position: 'static',
                    paddingBottom: 17, // Reset position for logo
                 });
                 logo.find('p').show(); // Show tagline
                 search.stop().animate({
                    top: 0
                 }, function() {
                    $(this).animate({
                        'right': 0 // Reset search button to default position
                    });  
                 })
                 
                 $('#header-search-input').removeClass('small');
                 
                 isHeaderCollapsed = false;
             }
        });
        
    } else {
        $('#header-container').addClass('no-fixed');
    }
    
    // Home Slider
    if($('#home-slider').length > 0) {
        $('#home-slider').carouFredSel({
            responsive: true,
            swipe: true,
            width: '100%',
            onCreate: function(data) {
                $('#home-slider .home-slider-item').stop().animate({
                    opacity: 1
                }, 800, function() {
                    $('.slider-caption').stop().animate({
                        opacity: 1
                    }, 500, function() {
                        $('#slider-controller').stop().animate({
                            opacity: 1
                        }, 800);
                    });
                });
                
            },
            scroll: {
                fx: homeSliderAnimation,
                duration: homeSliderAnimationSpeed,
            },
            auto: {
                play: homeSliderAutoAnimated,
                pauseOnHover: 'resume',
                timeoutDuration: homeSliderAutoAnimatedDelay,
            },
            prev: {
                button: '#slider-prev',
            },
            next: {
                button: '#slider-next',
            },
        },
        {
            transition: true,
        });
    }
    
    
    // Portfolio 
    var container = $('.portfolio-wrapper');
    $(container).imagesLoaded(function() {
        $(container).isotope({
            itemSelector : '.portfolio-item',
            masonry: {
                //cornerStampSelector: '.fixed-box',
                columnWidth: 255
            }
        });
    });
                
    $('#portfolio-filter').change(function() {
        var selector = $(this).val();
        $(container).isotope({
            filter : selector + ', .fixed-box'
        });
        
        return false;
    });
    
    // Portfolio Item on Hover
    $('.portfolio-item').not('.fixed-box').each(function() { 
        $(this).hoverdir({
            hoverDelay : 75,
            selector : '.portfolio-item-hover',
        });
    });
    
    // Portfolio Images on Single Page
    if($('#portfolio-item-images').length > 0) {
        $('#portfolio-item-images').carouFredSel({
            responsive: true,
            swipe: true,
            scroll: {
                fx: portfolioImageSliderAnimation,
                duration: portfolioImageSliderAnimationSpeed,
            },
            auto: {
                play: portfolioImageSliderAutoAnimated,
                pauseOnHover: 'resume',
                timeoutDuration: portfolioImageSliderAutoAnimatedDelay,
            },
            prev: {
                button: '#portfolio-item-images-prev',
            },
            next: {
                button: '#portfolio-item-images-next',
            },
        },
        {
            transition: true,
        });
    }    
    
    
    // Testimonial Slider
    if($('.testimonial-list').length > 0) {
        var testimonialList = $('.testimonial-list');
        testimonialList.each(function() {
                
            $(this).carouFredSel({
                responsive: true,
                swipe: true,
                pagination: {
                    container: $(this).parent().parent().find('.testimonial-bullets'),
                    anchorBuilder: function(nr, item) {
                        return '<a href="#'+nr+'"></a>';
                    }
                },
                scroll: {
                    fx: 'crossfade',
                    duration: testimonialSliderAnimationSpeed,
                },
                auto: {
                    play: testimonialSliderAutoAnimated,
                    pauseOnHover: 'resume',
                    timeoutDuration: testimonialSliderAutoAnimatedDelay,
                },
            },
            {
                transition: true,
            });
            
        });
    }
    
    // General Image Slider
    if($('.image-slider').length > 0) {
        var imageSlider = $('.image-slider');
        imageSlider.each(function() {
            $(this).carouFredSel({
                responsive: true,
                swipe: true,
                scroll: {
                    fx: imageSliderAnimation,
                    duration: imageSliderAnimationSpeed,
                },
                auto: {
                    play: imageSliderAutoAnimated,
                    pauseOnHover: 'resume',
                    timeoutDuration: imageSliderAutoAnimatedDelay,
                },
                prev: {
                    button: $(this).parent().find('.image-slider-prev'),
                },
                next: {
                    button: $(this).parent().find('.image-slider-next'),
                },
            },
            {
                transition: true,
            });
        });
        
    }    
    
    
    
    
    
    
    function initContactForm() {
        // Hide status on contact page
        $('#success, #error').css('display', 'none');
        
        // Submitting contact form
        if ($('form#contact-form').length > 0) {
    
            var contactForm = $('form#contact-form');
            contactForm.submit(function() {
                
                $('#success').css('display', 'none');
                $('#error').css('display', 'none');
                
                if (contactForm.validationEngine('validate')) {
                    
                    $submitButton = $(this).find('input[type="submit"]');
                    $submitButton.removeClass().addClass('medium gray button disabled');
                    $submitButton.attr('value', 'Submitting...');
                    $submitButton.attr('disabled', 'disabled');
                    
                    $.ajax({
                        type : 'POST',
                        url : 'php/sendmail.php',
                        data : contactForm.serialize(),
                        success : function(result) {
    
                            if (result == 'true') {
                                contactForm.stop().animate({
                                    opacity : '0'
                                }, 400, function() {
                                    contactForm.css('display', 'none');
                                    $('#success').css('display', 'block');
                                    $('#success').stop().animate({
                                        opacity : '1'
                                    }, 900);
                                });
    
                            } else {
                                $('#error').css('display', 'block');
                                $('#error').stop().animate({
                                    opacity : '1'
                                }, 1000);
    
                                alert('Error Message: ' + result);
                            }
    
                        },
                        error : function(xmlHttpRequest, textStatus, errorThrown) {
                            $('#error').css('display', 'block');
                            $('#error').stop().animate({
                                opacity : '1'
                            }, 1000);
    
                            alert(errorThrown);
                        }
                    });
                    return false;
                }
            });
    
        }
    }
    
    function renderGoogleMaps() {
        var elements = $('.google-map');
        
        elements.each(function() {
            
            var latlng = $(this).attr('data-latlng').split(',');
            var lat = jQuery.trim(latlng[0]);
            var lng = jQuery.trim(latlng[1]);
            var address = $(this).attr('data-address');
            var displayType = $(this).attr('data-display-type');
            var zoomLevel = parseInt($(this).attr('data-zoom-level'));
            $(this).css('height', $(this).attr('data-height'));
            
            switch(displayType.toUpperCase()) {
                case 'ROADMAP' : displayType = google.maps.MapTypeId.ROADMAP; break;
                case 'SATELLITE' : displayType = google.maps.MapTypeId.SATELLITE; break;
                case 'HYBRID' : displayType = google.maps.MapTypeId.HYBRID; break;
                case 'TERRAIN' : displayType = google.maps.MapTypeId.TERRAIN; break;
                default : displayType = google.maps.MapTypeId.ROADMAP; break;
            }
            
            var geocoder = new google.maps.Geocoder();
            var latlng = new google.maps.LatLng(lat, lng);
            var myOptions = {
                scrollwheel : false,
                zoom : zoomLevel,
                center : latlng,
                mapTypeId : displayType
            }
            
            var map = new google.maps.Map($(this)[0], myOptions);
            
            geocoder.geocode({
                'address' : address,
                'latLng' : latlng,
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    
                    if(jQuery.trim(address).length > 0) {
                        var marker = new google.maps.Marker({
                            map : map,
                            position : results[0].geometry.location
                        });
        
                        map.setCenter(results[0].geometry.location);
                    
                    } else {
                        var marker = new google.maps.Marker({
                            map : map,
                            position : latlng
                        });
        
                        marker.setPosition(latlng); map.setCenter(latlng);
                        
                    }
    
                } else {
                    alert("Geocode was not successful for the following reason: " + status);
                }
            });
            
        });
    }
    
    function initMobileMenu() {
        var defaultMenuList = $('#root-menu');
        var mobileMenuList = $('<ul />').appendTo($('#mobile-menu .top-bar-section'));
        
        var clonedList = $('#root-menu > li').clone();
        clonedList = getGeneratedSubmenu(clonedList);
        clonedList.appendTo(mobileMenuList);
        
    }
    
    // Recursive function for generating submenus
    function getGeneratedSubmenu(list) {
        list.each(function() {
            //$(this).append('<li class="divider"></li>');
            
            if($(this).find('ul').length > 0) {
                var submenu = $(this).find('ul');
                
                $(this).addClass('has-dropdown');
                submenu.addClass('dropdown'); 
                
                getGeneratedSubmenu(submenu.find('li'));
            }
        });
        
        return list;
    }
    
});