var GlobalContent = function GlobalContent(){
    this.geocoder = new google.maps.Geocoder();
    this.current_marker = null;

    this.initialize_map = function(self){
        map.initialize();

        sliderFilter.initialize();

        listingManager.get(utility.convert_miliSec_to_date(utility.oneMthAgo), utility.convert_miliSec_to_date(utility.today));

        this.add_zoom_event();

        google.maps.event.addListener(map.map, 'bounds_changed',function(){
            google.maps.event.trigger(map.map, 'resize');
        });
    };

    this.add_zoom_event = function(){
        google.maps.event.addListener(map.map, 'zoom_changed', function(){
            var no_of_zoom_steps = map.map.getZoom() - map.ini_zoom_lvl;
            heatMap.heatMap.set('radius', parseInt(heatMap.radius * Math.pow(2, no_of_zoom_steps)));
        });
    };

    this.initialize_events = function(){

        $('.heatmap-trans').click(function(){
            heatMap.btn_click();
        });

        $(".btn-fix-width").each(function(){
            $(this).css('width','169px');
        });

        $(".service-type").each(function(){
            var service_type= $(this).val();
            var color = "#"+service.color_list[service_type][1];
            $(this).css('background-color',color);
        });

        $("#listing").click(function(){
            listingManager.click_btn();
        });

        heatMap.initialize();

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
            map.initialize();
        });

        $(".service-type").click(function(){
            var service_type = $(this).val();
            var centerloc = map.map.getCenter();
            $(".service-type").removeClass('active');
            $(this).addClass('active');
            service.searchService(service_type,centerloc);
        });

        $(".trans-property-filter").change(function(){
            propertyFilter.change(this);
        });

        $('#current-locator').click(function(){
            navigator.geolocation.getCurrentPosition(function(position){
                var latitude = position.coords.latitude;
                var longitude = position.coords.longitude;
                var currentLatLng = new google.maps.LatLng(latitude,longitude);
                geocoder.geocode({'latLng': currentLatLng}, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        if (results[1]) {
                            map.map.setZoom(16);
                            map.map.setCenter(currentLatLng);
                        };
                        if (current_marker) {
                            current_marker.setMap(null);
                        };
                        marker = new google.maps.Marker({
                            position: currentLatLng
                        });
                        current_marker = marker;
                        marker.setIcon('https://maps.google.com/mapfiles/ms/icons/green-dot.png');
                        marker.setMap(map.map);
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
                    map.map.setZoom(16);
                    map.map.setCenter(results[0].geometry.location);
                    if (current_marker) {
                          current_marker.setMap(null);
                    };
                    marker = new google.maps.Marker({
                        position: results[0].geometry.location
                    });

                    current_marker = marker;
                    marker.setIcon('https://maps.google.com/mapfiles/ms/icons/green-dot.png');
                    marker.setMap(map.map);
                    searchService('school',results[0].geometry.location);
                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                };
            });
        });

        $('#scatter-plot').click(function(){
            listingManager.previous_info.close();
            listingManager.open_scatter_window();
        });
    };
};

var Utility = function Utility(){
    this.months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    this.today = (new Date()).getTime();
    this.oneMthAgo = (new Date(this.today - 2592000000)).getTime();
    this.threeMthAgo = (new Date(this.today - 7776000000)).getTime();

    this.add_commas_to_price = function (price) {
        price += '';
        var pattern = /(\d+)(\d{3})/;//pattern
        while (pattern.test(price)) {
            price = price.replace(pattern, '$1' + ',' + '$2');
        }
        return price;
    };

    this.convert_miliSec_to_date = function(miliSec){
        return new Date(miliSec);
    };
};

var Service = function Service(){
    this.markers = [];
    this.color_list = {
        "None":["none","190001"],
        "Schools":["school","4A0004"],
        "Banks":["bank", "D07777"],
        "Medical":["doctor","AA3939"],
        "Shopping":["store","780208"],
        "Post Office":["post_office","E51919"]
    };

    this.searchService = function(service_type, currentloc){
        infowindow = new google.maps.InfoWindow();
        var service_name = this.color_list[service_type][0];
        var service_color = this.color_list[service_type][1];
        var request = {
            location:currentloc,
            radius:500,
            types:[service_name]
        };
        if (service_name=='none') {

            if (this.markers) {
                  for (i=0;i<this.markers.length;i++) {
                      this.markers[i].setMap(null);
                  };
                  this.markers = [];
              };
        } else {
            var service = new google.maps.places.PlacesService(map.map);
            service.nearbySearch(request, this.callbackwrapper(service_color, this));
        };

    };

    this.callbackwrapper = function(iconcolor, self){
        return function callback(results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                if (self.markers) {
                      for (i=0;i<self.markers.length;i++) {
                          self.markers[i].setMap(null);
                      };
                      self.markers = [];
                  };
                for (var i = 0; i < results.length; i++) {
                    self.createServiceMarker(results[i], iconcolor);
                };
            }else {
                if (self.markers) {
                      for (i=0;i<self.markers.length;i++) {
                          self.markers[i].setMap(null);
                      };
                      self.markers = [];
                  };
            };
        };
    };

    this.createServiceMarker = function(place, iconcolor) {
        var placeLoc = place.geometry.location;
        var pinImage = new google.maps.MarkerImage("https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + iconcolor,
                                                    new google.maps.Size(21, 34),
                                                    new google.maps.Point(0,0),
                                                    new google.maps.Point(10, 34));
        var marker = new google.maps.Marker({
            map: map.map,
            position: place.geometry.location,
            icon:pinImage
        });
        this.markers.push(marker);
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent(place.name);
            infowindow.open(map.map, this);
        });
    };

};

var Map = function Map(lat, lng, ini_zoom_lvl){
    this.map = null;
    this.ini_zoom_lvl = ini_zoom_lvl;
    this.map_options = {
        zoom: this.ini_zoom_lvl,
        center: new google.maps.LatLng(lat, lng)
    };

    this.initialize = function(){
        this.map = new google.maps.Map(document.getElementById('map-canvas'), this.map_options);
    };
};

var HeatMap = function HeatMap(radius, max_intensity){
    this.show = true;
    this.radius = radius;
    this.max_intensity = max_intensity;
    this.dict = [];
    this.pointArray = [];
    this.heatMap = null;

    this.initialize = function(){
        this.heatMap = new google.maps.visualization.HeatmapLayer({
            data: [],
            maxIntensity: this.max_intensity
        });
    };

    this.update = function(){
        var self = this;
        self.dict = [];
        if(this.show){
            $.each(listingManager.marker_list, function(i, v){
                if(v.is_marker_visible()){
                    var ll = new google.maps.LatLng(v['lat'],v['lng']);
                    self.dict.push({location:ll, weight:v['psf']});
                }
            });
            self.pointArray = new google.maps.MVCArray(self.dict);
            heatMap.heatMap.set('data', self.pointArray);
            heatMap.heatMap.set('opacity', 0.7);
            heatMap.heatMap.set('maxIntensity', self.max_intensity);
            heatMap.heatMap.setMap(map.map);
            self.update_radius();
        }
        else{
            heatMap.heatMap.setMap(null);
        }
    };

    this.update_radius = function(){
        heatMap.heatMap.set('radius', parseInt(this.radius * Math.pow(2, (map.map.getZoom() - map.ini_zoom_lvl))));
    };

    this.btn_click = function(){
        this.show = !this.show;
        this.update();
        this.toggle_btn();
    };

    this.toggle_btn = function(){
        console.log(this.show);
        if(this.show){
            $('.heatmap-trans').css("background-color", "rgb(255, 147, 58)");
            $('.heatmap-trans').css("color", "#ffffff")
        }else{
            $('.heatmap-trans').css("background-color", "#e0e0e0");
            $('.heatmap-trans').css("color", "#000000")
        }
    }
};

var PropertyTypeFilter = function PropertyTypeFilter(){
    this.show_res_landed = true;
    this.show_res_non_landed = true;
    this.show_com = true;
    this.show_ind = true;

    this.change = function(target){
        var target_element = $(target);
        var property_type = target_element.val();

        if(property_type == 'landed'){
            this.show_res_landed = target_element.is(':checked');
        }else if(property_type == 'non-landed'){
            this.show_res_non_landed = target_element.is(':checked');
        }else if(property_type == 'commercial'){
            this.show_com = target_element.is(':checked');
        }else if(property_type == 'industry'){
            this.show_ind = target_element.is(':checked');
        }

        listingManager.update_markers();
        heatMap.update();
    };
};

var SliderFilter = function SliderFilter(today, threeMthAgo, oneMthAgo){
    this.min = threeMthAgo;
    this.max = today;
    this.med = oneMthAgo;

    this.initialize = function(){
        var self = this;
        self.set_display(utility.convert_miliSec_to_date(utility.oneMthAgo), utility.convert_miliSec_to_date(utility.today));
        $( "#slider-range" ).slider({
            range: true,
            min: self.min,
            max: self.max,
            values: [ self.med, self.max ],//one month,
            change: function( event, ui ) {
                var start_mili = $(event.target).slider("values", 0);
                var end_mili = $(event.target).slider("values", 1);
                var start_date = utility.convert_miliSec_to_date(start_mili);
                var end_date = utility.convert_miliSec_to_date(end_mili);
                self.set_display(start_date, end_date);
                listingManager.get(start_date, end_date);
                listingManager.update_markers();
                heatMap.update();
            }
        });
    };

    this.set_display = function(start_date, end_date){
        $('#start_date').html("(" + start_date.getDate() + "-" + utility.months[start_date.getMonth()] + "-" + start_date.getFullYear() + ")");
        $('#end_date').html("(" + end_date.getDate() + "-" + utility.months[end_date.getMonth()] + "-" + end_date.getFullYear() + ")");
    };
};

var ListingManager = function ListingManager(){
    this.previous_info = false;
    this.marker_list = [];
    this.show_all_markers = false;
    this.scatter_marker = null;

    this.get = function (start_date, end_date){
        var self = this;
        self.clear_marker_list();
        var start = start_date.getFullYear() + "-" + (start_date.getMonth() + 1) + "-" + start_date.getDate();
        var end = end_date.getFullYear() + "-" + (end_date.getMonth() + 1) + "-" + end_date.getDate();
        $.get('/research/listing/?city=KL&start_date=' + start + '&end_date=' + end, function(data){
            $.each(data['listing_list'], function(i, v){
                latlng = new google.maps.LatLng(v['lat'],v['lng']);
                var marker = new google.maps.Marker({
                      position: latlng,
                      map: map.map,
                      icon: "https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|7baa39",
                      title: 'transaction' + i.toString()
                });
                var contentString = '<br><b>Location: </b> ' + v['district'] + '<br><b>Asking Price</b> : RM ' + utility.add_commas_to_price(v['price']) + '<br><b>Build Up Area: </b>' + (v['area_sqf']).toFixed(0) + ' sq-ft' + '<br><b>Price per SqFt</b> : RM ' + utility.add_commas_to_price(v['psf']) + '<br><b>Post Date: </b>' + v['post_date'] + '<br><a target="_blank" href="' + v['url'] + '">View</a>';

                var  listing = new Listing(v, marker, new google.maps.InfoWindow({content: contentString}));
                self.marker_list.push(listing);

                google.maps.event.addListener(listing.marker, 'click', function() {
                    if (self.previous_info) {
                        self.previous_info.close();
                    }
                    self.previous_info = listing.infowindow;
                    listing.infowindow.open(map.map,listing.marker);

                    self.update_summary(v['district'], data['summary'][v['district']]);
                    self.scatter_marker = marker;
                });
            });
            self.update_markers();
            heatMap.update();
        });
    };

    this.clear_marker_list = function(){
        $.each(this.marker_list, function(i, v){
            v.marker.setMap(null);
        });
        this.marker_list = [];
    };

    this.update_markers = function(){
        if(this.show_all_markers){
            for (var i=0;i<this.marker_list.length;i++) {
                this.marker_list[i].marker.setVisible(this.marker_list[i].is_marker_visible());
            }
        }else{
            for (var i=0;i<this.marker_list.length;i++) {
                this.marker_list[i].marker.setVisible(this.show_all_markers);
            }
        }
    };

    this.click_btn = function(){
        this.show_all_markers = !this.show_all_markers;
        this.update_markers(this.show_all_markers);
        this.toggle_list_btn();
    };

    this.open_scatter_window = function(){
        var district = $('#summary-district-info').val();
        var iframelink = "'/research/malaysia/headless_va/1/1/KL/" + district.replace(' ', '_') + "/Condominium/'"
        var scatter_window = new google.maps.InfoWindow({
            maxWidth: 600,
            maxHeight: 500,
            content: "<br/><iframe width='600px' height='450px' src=" + iframelink + "></iframe>"
        });
        scatter_window.open(map.map, this.scatter_marker);
    };

    this.toggle_list_btn = function(){
        if(this.show_all_markers){
            $('.list-marker').css("background-color", "#7baa39");
            $('.list-marker').css("color", "#ffffff")
        }else{
            $('.list-marker').css("background-color", "#e0e0e0");
            $('.list-marker').css("color", "#000000")
        }
    };

    this.update_summary = function(district, summary){
        $('#summary-district').html('<b>' +'Listing Summary For District: ' + '</b>' + district);
        $('#summary-psf').html('<b>Avg PSF: </b>' + summary['avg_psf'].toFixed(2));
        $('#summary-count').html('<b>Listing Count: </b>' + summary['no_of_list']);
        $('#scatter-plot').html('<a>Scatter Plot</a>');
        $('#summary-district-info').val(district);
    };
};

var Listing = function ListingMarker(listing, google_marker, google_info_window){
    this.show = false;
    this.p_type = listing['property_type'];
    this.psf = listing['psf'];
    this.lat = listing['lat'];
    this.lng = listing['lng'];
    this.marker = google_marker;
    this.infowindow = google_info_window;

    this.is_marker_visible = function(){
        this.show = false;
        if(this.p_type=="Commercial"){
            if(propertyFilter.show_com){
                this.show = true;
            }
        }else if(this.p_type=="Industry"){
            if(propertyFilter.show_ind){
                this.show = true;
            }
        }else if((this.p_type.indexOf('Land') > -1) || (this.p_type.indexOf('Bungalow') > -1) || (this.p_type.indexOf('Terrace') > -1) ){
            if(propertyFilter.show_res_landed){
                this.show = true;
            }
        }else if((this.p_type.indexOf('Apartment') > -1) || (this.p_type.indexOf('Condominium') > -1)){
            if(propertyFilter.show_res_non_landed){
                this.show = true;
            }
        }
        return this.show;
    };
};

var global = new GlobalContent();
var utility = new Utility();
var map = new Map(3.1357, 101.688, 12);
var service = new Service();
var heatMap = new HeatMap(16, 20000);
var listingManager = new ListingManager();
var sliderFilter = new SliderFilter(utility.today, utility.threeMthAgo, utility.oneMthAgo);
var propertyFilter = new PropertyTypeFilter();

$( document ).ready(function(){
    global.initialize_map();
    global.initialize_events();
});

