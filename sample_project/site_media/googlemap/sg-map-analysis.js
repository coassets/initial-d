$( document ).ready(function(){
    //global
    var months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    var today = (new Date()).getTime();
    var oneMthAgo = (new Date(today - 2592000000)).getTime();
    var threeMthAgo = (new Date(today - 7776000000)).getTime();
    var trans_show_res_non_landed = true;
    var trans_show_res_landed = true;
    var trans_show_com = true;
    var trans_show_ind = true;
    var list_show_res_non_landed = true;
    var list_show_res_landed = true;
    var list_show_com = true;
    var list_show_ind = true;

    var map;
    var original_zoom_level = 11;
    var heatmap_redius = 15;
    var transactions = [];
    var trans_markers = [];
    var listing_markers = [];
    var show_trans_heatmap = true;
    var ini_heatmap_max_intensity = 10000;
    var heatmap_max_intensity = ini_heatmap_max_intensity;
    var show_trans_marker = false;
    var show_listing_marker = false;
    var geocoder;
    var current_marker;
    var service_markers=[];
    var selLatlng = new google.maps.LatLng(1.3000, 103.8000); //KL
    var scatter_marker;
    var serviceColor = {
        "None":["none","190001"],
        "Schools":["school","394caa"],
        "Banks":["bank", "aa8939"],
        "Medical":["doctor","AA3939"],
        "Shopping":["store","39aa44"],
        "Post Office":["post_office","E51919"]
    };

    var heatmap = new google.maps.visualization.HeatmapLayer({
        data: [],
        maxIntensity: heatmap_max_intensity
    });

    var previous_info = false;


    $(".btn-fix-width").each(function(){
        $(this).css('width','112px');
    });

    $(".service-type").each(function(){
        var service_type= $(this).val();
        var color = "#"+serviceColor[service_type][1];
        $(this).css('background-color',color);
    });

    google.maps.event.addDomListener(window, 'load', initialize);

    $( "#slider-range" ).slider({
        range: true,
        min: threeMthAgo,
        max: today,
        values: [ oneMthAgo, today ],//one month,
        change: function( event, ui ) {
            var start_mili = $(event.target).slider("values", 0);
            var end_mili = $(event.target).slider("values", 1);
            var diff_in_month = Math.round((end_mili - start_mili) / (1000 * 60 * 60 * 24 * 30));
            if (diff_in_month == 0){
                diff_in_month = 1;
            }
            heatmap_max_intensity = ini_heatmap_max_intensity * diff_in_month;
            var start_date = convertMiliSecToDate(start_mili);
            var end_date = convertMiliSecToDate(end_mili);
            setSliderDisplayDate(start_date, end_date);
            getTransactions(start_date, end_date);
            update_transaction_markers(show_trans_marker);
            getListigs(start_date, end_date);
            update_listing_markers(show_listing_marker);
        }
    });

    $('#scatter-plot').click(function(){
        previous_info.close();
        open_scatter_window();
    });

    $("#listing").click(function(){
        show_listing_marker = !show_listing_marker;
        if (listing_markers.length <= 0){
            var start_mili = $("#slider-range").slider("values", 0);
            var end_mili = $("#slider-range").slider("values", 1);
            var start_date = convertMiliSecToDate(start_mili);
            var end_date = convertMiliSecToDate(end_mili);
            getListigs(start_date, end_date);
        }
        update_listing_markers(show_listing_marker);
        toggle_list_btn();
    });

    $("#fullscreen").click(function(){
        var is_fullscreen = $("#map-container").attr("value");
        if (is_fullscreen == "no") {
            $("#map-container").css("position","fixed").css("height","")
                    .css("top","0").css("bottom","0")
                    .css("left","0").css("right","0")
                    .css("margin","0").css("padding","0").css("z-index","1000");
            $("#map-container").attr("value", "yes");
        } else {
            $("#map-container").attr("value", "no");
            $("#map-container").css("position","relative")
                    .css("top","").css("bottom","")
                    .css("left","").css("right","")
                    .css("margin","").css("padding","").css("z-index","")
                    .css("height","700px");

        };
        initialize();
    });

    $(".trans-property-filter").change(function(){
        var this_element = $(this);
        var property_type = this_element.val();

        if(property_type == 'trans:landed'){
            trans_show_res_landed = $(this).is(':checked');
        }else if(property_type == 'trans:non-landed'){
            trans_show_res_non_landed = $(this).is(':checked');
        }else if(property_type == 'trans:commercial'){
            trans_show_com = $(this).is(':checked');
        }else if(property_type == 'trans:industry'){
            trans_show_ind = $(this).is(':checked');
        }else if(property_type == 'list:landed'){
            list_show_res_landed = $(this).is(':checked');
        }else if(property_type == 'list:non-landed'){
            list_show_res_non_landed = $(this).is(':checked');
        }else if(property_type == 'list:commercial'){
            list_show_com = $(this).is(':checked');
        }else if(property_type == 'list:industry'){
            list_show_ind = $(this).is(':checked');
        }

        update_transaction_markers(show_trans_marker);
        update_listing_markers(show_listing_marker);
        update_heatmap(show_trans_heatmap);
    });

    $(".service-type").click(function(){
        var service_type = $(this).val();
        var centerloc = map.getCenter();
        $(".service-type").removeClass('active');
        $(this).addClass('active');
        searchService(service_type,centerloc);
    });

    $('#current-locator').click(function(){
        navigator.geolocation.getCurrentPosition(function(position){
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            var currentLatLng = new google.maps.LatLng(latitude,longitude);
            geocoder.geocode({'latLng': currentLatLng}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        map.setZoom(16);
                        map.setCenter(currentLatLng);
                    };
                    if (current_marker) {
                        current_marker.setMap(null);
                    };
                    marker = new google.maps.Marker({
                        position: currentLatLng
                    });
                    current_marker = marker;
                    marker.setIcon('https://maps.google.com/mapfiles/ms/icons/green-dot.png');
                    marker.setMap(map);
                    $("#geo-address").val(results[1].formatted_address);
                    searchService('school',currentLatLng);
                } else {
                    alert("Geocoder failed due to: " + status);
                };
            });
        })
    });

    $('#geocoder').click(function(){
        address = $('#geo-address').val();
        geocoder = new google.maps.Geocoder();

        geocoder.geocode( { 'address': address}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                map.setZoom(16);
                map.setCenter(results[0].geometry.location);
                if (current_marker) {
                      current_marker.setMap(null);
                };
                marker = new google.maps.Marker({
                    position: results[0].geometry.location
                });

                current_marker = marker;
                marker.setIcon('https://maps.google.com/mapfiles/ms/icons/green-dot.png');
                marker.setMap(map);
                searchService('school',results[0].geometry.location);
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            };
        });
    });

    $('.heatmap-trans').click(function(){
        show_trans_heatmap = !show_trans_heatmap;
        update_heatmap(show_trans_heatmap);
        toggle_heatmap_btn();
    });

    $('.trans-marker').click(function(){
        show_trans_marker = !show_trans_marker;
        update_transaction_markers(show_trans_marker);
        toggle_trans_btn();
    });

    function initialize(location) {

        var mapOptions = {
                zoom: original_zoom_level,
                center: selLatlng
                };
        geocoder = new google.maps.Geocoder();
        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

        setSliderDisplayDate(convertMiliSecToDate(oneMthAgo), convertMiliSecToDate(today));

        getTransactions(convertMiliSecToDate(oneMthAgo), convertMiliSecToDate(today));

        add_zoom_event();

        google.maps.event.addListener(map, 'bounds_changed',function(){
            google.maps.event.trigger(map, 'resize');
        });
    }

    function getTransactions(start_date, end_date){
        clearTransMarkers();
        var start = start_date.getFullYear() + "-" + (start_date.getMonth() + 1) + "-" + start_date.getDate();
        var end = end_date.getFullYear() + "-" + (end_date.getMonth() + 1) + "-" + end_date.getDate();
        $.get('/research/sg-transactions/?start_date=' + start + '&end_date=' + end, function(data){
            transactions = data['trans_list'];//to update heatmap
            $.each(data['trans_list'], function(i, v){
                latlng = new google.maps.LatLng(v['lat'],v['lng']);
                var marker = new google.maps.Marker({
                      position: latlng,
                      map: map,
                      icon: "https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|3983aa",
                      title: 'transaction' + i.toString(),
                      p_type: 'trans:' + v['property_type']
                });
                trans_markers.push(marker);
                var contentString = '<b>Location:</b> ' + v['location']
                    + '<br><b>Transacted Price</b> : SGD ' + addCommasToPrice(v['price'])
                    + '<br><b>Price per SqFt</b> : SGD ' + addCommasToPrice(v['psf'])
                    + '<br><b>Building Type:</b> ' + v['building_type']
                    + '<br><b>Build Up Area: </b>' + v['build_up_area'] + ' sq-ft'
                    + '<br><b>Date: </b>' + v['transaction_date'];
                var infowindow = new google.maps.InfoWindow({
                    content: contentString
                });

                google.maps.event.addListener(marker, 'click', function() {
                    if (previous_info) {
                        previous_info.close();
                    }
                    previous_info = infowindow;
                    infowindow.open(map,marker);

                    update_summary(v['district'], data['summary'][v['district']], "Transaction Summary");
                });
            });
            update_transaction_markers(show_trans_marker);
            update_heatmap(show_trans_heatmap);
        });
    }

    function getListigs(start_date, end_date){
        clearListingMarkers();
        var start = start_date.getFullYear() + "-" + (start_date.getMonth() + 1) + "-" + start_date.getDate();
        var end = end_date.getFullYear() + "-" + (end_date.getMonth() + 1) + "-" + end_date.getDate();
        $.get('/research/listing/?city=Singapore&start_date=' + start + '&end_date=' + end, function(data){
            $.each(data['listing_list'], function(i, v){
                latlng = new google.maps.LatLng(v['lat'],v['lng']);
                var marker = new google.maps.Marker({
                      position: latlng,
                      map: map,
                      icon: "https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|7baa39",
                      title: 'transaction' + i.toString(),
                      p_type: 'list:' + v['property_type']
                });
                listing_markers.push(marker);
                var contentString = '<br><b>Location: District </b> ' + v['district'] + '<br><b>Asking Price</b> : SGD ' + addCommasToPrice(v['price']) + '<br><b>Build Up Area: </b>' + (v['area_sqf']).toFixed(0) + ' sq-ft' + '<br><b>Price per SqFt</b> : SGD ' + addCommasToPrice(v['psf']) + '<br><b>Post Date: </b>' + v['post_date'] + '<br><a target="_blank" href="' + v['url'] + '">View</a>';
                var infowindow = new google.maps.InfoWindow({
                    content: contentString
                });

                google.maps.event.addListener(marker, 'click', function() {
                    if (previous_info) {
                        previous_info.close();
                    }
                    previous_info = infowindow;
                    infowindow.open(map,marker);

                    update_summary(v['district'], data['summary'][v['district']], "Listing Summary");
                    scatter_marker = marker;
                });
            });
            update_listing_markers(show_listing_marker);
        });
    }

    function update_summary(district, summary, type){
        $('#summary-district').html('<b>' + type + ' For District: ' + '</b>' + district);
        $('#summary-psf').html('<b>Avg PSF: </b>' + summary['avg_psf'].toFixed(2));
        $('#summary-count').html('<b>Listing Count: </b>' + summary['no_of_list']);
        $('#scatter-plot').html('<a>Scatter Plot</a>');
        $('#summary-district-info').val(district);
    }

    function clearTransMarkers(){
        $.each(trans_markers, function(i, v){
            v.setMap(null);
            heatmap.setMap(null);
        });
        trans_markers = [];
    }

    function clearListingMarkers(){
        $.each(listing_markers, function(i, v){
            v.setMap(null);
        });
        listing_markers = [];
    }

    function open_scatter_window(){
        var district = $('#summary-district-info').val();
        var iframelink = "'/research/headless_scatter/RES/" + district + "/all/--all--/100000/1000/'"
        var scatter_window = new google.maps.InfoWindow({
            maxWidth: 600,
            maxHeight: 500,
            content: "<br/><iframe width='600px' height='450px' src=" + iframelink + "></iframe>"
        });
        scatter_window.open(map, scatter_marker);
    }

    function searchService(service_type, currentloc) {

        infowindow = new google.maps.InfoWindow();
        var service_name = serviceColor[service_type][0];
        var service_color = serviceColor[service_type][1];
        var request = {
            location:currentloc,
            radius:500,
            types:[service_name]
        };
        if (service_name=='none') {
            if (service_markers) {
                  for (i=0;i<service_markers.length;i++) {
                      service_markers[i].setMap(null);
                  };
                  service_markers = [];
              };
        } else {
            var service = new google.maps.places.PlacesService(map);
            service.nearbySearch(request, callbackwrapper(service_color));
        };

    }

    function callbackwrapper(iconcolor){
        return function callback(results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                if (service_markers) {
                      for (i=0;i<service_markers.length;i++) {
                          service_markers[i].setMap(null);
                      };
                      service_markers = [];
                  };
                for (var i = 0; i < results.length; i++) {
                    createMarker(results[i], iconcolor);
                };
            }else {
                if (service_markers) {
                      for (i=0;i<service_markers.length;i++) {
                          service_markers[i].setMap(null);
                      };
                      service_markers = [];
                  };
            };
        };
    }

    function createMarker(place, iconcolor) {
        var placeLoc = place.geometry.location;
        var marker_list = [];
        var pinImage = new google.maps.MarkerImage("https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + iconcolor,
                                                    new google.maps.Size(21, 34),
                                                    new google.maps.Point(0,0),
                                                    new google.maps.Point(10, 34));
        var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            icon:pinImage
        });
        service_markers.push(marker);
        google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(place.name);
        infowindow.open(map, this);
        });
    }

    function update_heatmap(action){
        var heatmapdict = [];
        var pointArray = [];
        var count = 0;
        if(action){
            $.each(transactions, function(i, v){
                if(is_marker_visible("trans:" + v['property_type'])){
                    var ll = new google.maps.LatLng(v['lat'],v['lng']);
                    heatmapdict.push({location:ll, weight:v['psf']});
                }
            });
            pointArray = new google.maps.MVCArray(heatmapdict);
            heatmap.set('data', pointArray);
            heatmap.set('opacity', 0.7);
            heatmap.set('maxIntensity', heatmap_max_intensity);
            heatmap.setMap(map);
            update_heatmap_radius();
        }
        else{
            heatmap.setMap(null);
        }
    }

    function update_transaction_markers(action){
        if(action){
            for (var i=0;i<trans_markers.length;i++) {
                trans_markers[i].setVisible(is_marker_visible(trans_markers[i].p_type));
            }
        }else{
            for (var i=0;i<trans_markers.length;i++) {
                trans_markers[i].setVisible(action);
            }
        }
    }

    function update_listing_markers(action){
        if(action){
            for (var i=0;i<listing_markers.length;i++) {
                listing_markers[i].setVisible(is_marker_visible(listing_markers[i].p_type));
            }
        }else{
            for (var i=0;i<listing_markers.length;i++) {
                listing_markers[i].setVisible(action);
            }
        }
    }

    function toggle_list_btn(){
        if(show_listing_marker){
            $('.list-marker').css("background-color", "#7baa39");
            $('.list-marker').css("color", "#ffffff")
        }else{
            $('.list-marker').css("background-color", "#e0e0e0");
            $('.list-marker').css("color", "#000000")
        }
    }

    function toggle_trans_btn(){
        if(show_trans_marker){
            $('.trans-marker').css("background-color", "#3983aa");
            $('.trans-marker').css("color", "#ffffff")
        }else{
            $('.trans-marker').css("background-color", "#e0e0e0");
            $('.trans-marker').css("color", "#000000")
        }
    }

    function toggle_heatmap_btn(){
        if(show_trans_heatmap){
            $('.heatmap-trans').css("background-color", "rgb(255, 147, 58)");
            $('.heatmap-trans').css("color", "#ffffff")
        }else{
            $('.heatmap-trans').css("background-color", "#e0e0e0");
            $('.heatmap-trans').css("color", "#000000")
        }
    }

    function is_marker_visible(p_type){
        var visibility = false;
        if(p_type=="trans:Commercial"){
            if(trans_show_com){
                visibility = true;
            }
        }else if(p_type=="trans:Industry"){
            if(trans_show_ind){
                visibility = true;
            }
        }else if(p_type.indexOf('trans:Landed') > -1){
            if(trans_show_res_landed){
                visibility = true;
            }
        }else if(p_type.indexOf('trans:') > -1 && p_type.indexOf('Non-Landed')){
            if(trans_show_res_non_landed){
                visibility = true;
            }
        }else if(p_type=="list:Commercial"){
            if(list_show_com){
                visibility = true;
            }
        }else if(p_type=="list:Industry"){
            if(list_show_ind){
                visibility = true;
            }
        }else if(p_type.indexOf('list:Landed') > -1){
            if(list_show_res_landed){
                visibility = true;
            }
        }else if(p_type.indexOf('list:') > -1 && p_type.indexOf('Apartment')){
            if(list_show_res_non_landed){
                visibility = true;
            }
        }
        return visibility;
    }

    function add_zoom_event(){
        google.maps.event.addListener(map, 'zoom_changed', function(){
            update_heatmap_radius();
        });
    }

    function update_heatmap_radius(){
        heatmap.set('radius', parseInt(heatmap_redius * Math.pow(2, (map.getZoom() - original_zoom_level))));
    }

    function addCommasToPrice(price) {
        price += '';
        var pattern = /(\d+)(\d{3})/;//pattern
        while (pattern.test(price)) {
            price = price.replace(pattern, '$1' + ',' + '$2');
        }
        return price;
    }

    function convertMiliSecToDate(miliSec){
        return new Date(miliSec);
    }

    function setSliderDisplayDate(start_date, end_date){
        $('#start_date').html("(" + start_date.getDate() + "-" + months[start_date.getMonth()] + "-" + start_date.getFullYear() + ")");
        $('#end_date').html("(" + end_date.getDate() + "-" + months[end_date.getMonth()] + "-" + end_date.getFullYear() + ")");
    }
});

