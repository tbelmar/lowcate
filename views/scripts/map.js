var map, markers = {}, saved_markers, saved_markers_obj = {}, info_windows = [], search_marker;
var editable = false;
$.post('/getlocals', {var: 'saved_markers'},  function(data) {
    for(var i = 0; i < data.length; i++)
        data[i].name = decodeURI(data[i].name);
    saved_markers = data;
    showMarkers();
});

// search location input
$('#locationsInput').keydown(function(e) {
    if(e.keyCode == 13) {
        var input = $('#locationsInput')[0].value;
        getLocation(input, function(location) {
            if(location) {
                var content = "<div id='remoteLocationContent'>" + 
                    "<h1>" + decodeURI(location.name) + "</h1>" +
                    "<p>Address: " + location.address + "</p>" +
                    "<p>Latitude: " + location.lat + "</p>" +
                    "<p>Longitude: " + location.lng + "</p>" +
                    "<br>" +
                    "<div class='maps_icons'>" +
                        "<a target='_blank' href='http://maps.apple.com/?daddr=" + location.lat + "," + location.lng + "'><img src='views/images/external/maps.png'></a>" +
                        "<a target='_blank' href='https://www.google.com/maps/dir/?api=1&destination=" + location.lat + "," + location.lng + "'><img src='views/images/external/google-maps.png'></a>" +
                        "<a target='_blank' href='http://waze.com/ul?ll=" + location.lat + "," + location.lng + "&navigate=yes'><img src='views/images/external/waze.png'></a>" +
                    "</div>" +
                    "</div>";

                var marker = new google.maps.Marker({
                    position: {
                        lat: Number(location.lat),
                        lng: Number(location.lng)
                    },
                    map: map,
                    icon: {
                        url: 'views/images/markers/pink_Marker.png',
                        scaledSize: new google.maps.Size(20,34),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(10, 34)   
                    }
                });

                var infoWindow = new google.maps.InfoWindow({
                    content: content,
                    maxWidth: 300
                });

                marker.addListener('click', function() {
                    info_windows.push(infoWindow);
                    for(var i = 0; i < info_windows.length; i++)
                        info_windows[i].close();
                    infoWindow.open(map, marker); 
                });

                map.panTo(marker.getPosition());
            }
            else
                alert("Location by the name of \"" + decodeURI(input) + "\" does not exist.");
        });
    }
});

// editable button
$('#editableButton').click(function() {
    $(this).toggleClass("green");
    editable = !editable;
});

// initialize map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34, lng: 150},
        zoom: 6,
        mapTypeControl: false,
        keyboardShortcuts: false
    });

    // make places searchbox
    var placesInput = document.getElementById("placesInput");
    var placesSearchBox = new google.maps.places.SearchBox(placesInput);

    map.addListener('bounds_changed', function() {
        placesSearchBox.setBounds(map.getBounds());    
    });

    placesSearchBox.addListener('places_changed', function() {
        var places = placesSearchBox.getPlaces();

        if(places.length == 0)
            return;

        var place = places[0];

        var bounds = new google.maps.LatLngBounds();
        if(!place.geometry) {
            console.log("Place contains no geometry! Oh no!");
            return;
        }
        var icon = {
            url: 'views/images/markers/paleblue_Marker.png',
            scaledSize: new google.maps.Size(20,34),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(10, 34)
        }

        var tempPlaceContent = "<div id='tempPlaceForm'>" +
            "<h1>Temporary Location</h1>" +
            "<p>Name: " + place.name + "</p>" +
            "<p>Address: " + place.formatted_address + "</p>" +
            "<p>Latitude: " + place.geometry.location.lat() + "</p>" +
            "<p>Longitude: " + place.geometry.location.lng() + "</p>" +
            "<button id='tempAddLocation' class='left' onclick='addMarker()'>Save</button>" + "<button id='tempCancelLocation' class='right' onclick='cancelLocation()'>Cancel</button>" +
            "</div>";

        var infoWindow = new google.maps.InfoWindow({
            content: tempPlaceContent,
            maxWidth: 300
        });

        search_marker = new google.maps.Marker({
            map: map,
            icon: icon,
            position: place.geometry.location,
        });

        for(var i = 0; i < info_windows.length; i++)
            info_windows[i].close();
        info_windows.push(infoWindow);
        infoWindow.open(map, search_marker);

        search_marker.addListener('click', function() {
            for(var i = 0; i < info_windows.length; i++)
                info_windows[i].close();
            infoWindow.open(map, search_marker); 
        });

        map.panTo(place.geometry.location);
        map.setZoom(8);
    });

    // add marker on click
    google.maps.event.addListener(map, 'click', function(event) {
        if(editable) {
            var latLng = event.latLng;
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({latLng}, function(result, status) {
                $.post("/getname", { lat: event.latLng.lat(), lng: event.latLng.lng(), address: result[0].formatted_address }, function(markerName) {
                    var markerID = event.latLng.lat() + "_" + event.latLng.lng(); 
                    var editingContent = 
                        "<div id='editingForm'>" +
                            "<h3 class='name_taken' id='taken_" + markerID + "'>Name Taken.</h3>" +
                            "<h1 contenteditable=true class='editable' id='name_" + markerID + "'>" + markerName + "</h1>" +
                            "<p>Address: " + result[0].formatted_address + "</p>" +
                            "<p>Latitude: " + event.latLng.lat() + "</p>" +
                            "<p>Longitude: " + event.latLng.lng() + "</p>" +
                            "<button id='" + markerID + "' onclick='delMarker(\"" + markerID + "\")'>Remove</button>" +
                            "<br>" +
                            "<div class='maps_icons'>" +
                                "<a target='_blank' href='http://maps.apple.com/?daddr=" + event.latLng.lat() + "," + event.latLng.lng() + "'><img src='views/images/external/maps.png'></a>" +
                                "<a target='_blank' href='https://www.google.com/maps/dir/?api=1&destination=" + event.latLng.lat() + "," + event.latLng.lng() + "'><img src='views/images/external/google-maps.png'></a>" +
                                "<a target='_blank' href='http://waze.com/ul?ll=" + event.latLng.lat() + "," + event.latLng.lng() + "&navigate=yes'><img src='views/images/external/waze.png'></a>" +
                            "</div>" +
                        "</div>";

                    for(var i = 0; i < info_windows.length; i++)
                        info_windows[i].close();

                    var infoWindow = new google.maps.InfoWindow({
                        content: editingContent,
                        maxWidth: 300
                    });

                    info_windows.push(infoWindow);

                    var marker = new google.maps.Marker({
                        position: event.latLng,
                        map: map,
                        icon: {
                            url: 'views/images/markers/red_Marker.png',
                            scaledSize: new google.maps.Size(20, 34),
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(10, 34)
                        }
                    });

                    markers[markerID] = marker;

                    addMarkerListener(marker, infoWindow, markerID, doNothing);
                });  
            });
        }
        else {
            for(var i = 0; i < info_windows.length; i++)
                info_windows[i].close();
        }
    });
}

// get and manage location of user
if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        map.setCenter(pos);
        var geoMarker = new google.maps.Marker({
            position: pos,
            map: map,
            icon: {
                url: 'views/images/markers/blue_MarkerHome.png',
                scaledSize: new google.maps.Size(20, 34),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(10, 34)
            }
        });

        var contentStr = 
            '<div id="geoMarkerContent"> ' +
            '<h1>Current Location</h1>' +
            '<p>Latitude: ' + pos.lat + '</p>' +
            '<p>Longitude: ' + pos.lng + '<p>' +
            '</div>'

        var infoWindow = new google.maps.InfoWindow({
            content: contentStr,
            maxWidth: 300
        });

        info_windows.push(infoWindow);

        geoMarker.addListener('click', function() {
            for(var i = 0; i < info_windows.length; i++)
                info_windows[i].close();
            infoWindow.open(map, geoMarker);
            info_windows.push(infoWindow);
        });                    
    }, function(error) {
        console.log(error);
        var pos = {
            lat: 38.7687440,
            lng: -9.3806936
        }
        map.setCenter(pos);
    }); 
    
} else {
    var pos = {
        lat: 38.7687440,
        lng: -9.3806936
    };
    map.setCenter(pos);
}

// mobile press menu bar
$("#openMenuContent").click(function() {
    $("#openMenuContent").hide();
    $('#closeMenuContent').show();
    $('#content').show();
});

// mobile close menu bar
$('#closeMenuContent').click(function() {
    $('#closeMenuContent').hide();
    $('#openMenuContent').show();
    $('#content').hide();
});


var prevWidth = $(window).width();

// changing what shows when screen is resized
$(window).resize(function() {
    if($(window).width() > 600 && prevWidth <= 600) {
        // up to desktop version
        $("#openMenuContent").hide();
        $('#closeMenuContent').hide();
        $('#content').show();
        prevWidth = $(window).width();
    }
    else if($(window).width() <= 600 && prevWidth > 600) {
        // down to mobile version
        $('#openMenuContent').show();
        $('#content').hide();
        prevWidth = $(window).width();
    }
});