var map, info_windows = [], path = window.location.pathname.split('/');

if(path[2]) {
    var input = path[2];
    getLocation(decodeURI(input), function(location) {
        if(location) {
            var content = "<div id='remoteLocationContent'>" + 
                "<h1>" + decodeURI(location.name) + "</h1>" +
                "<p>Address: " + location.address + "</p>" +
                "<p>Latitude: " + location.lat + "</p>" +
                "<p>Longitude: " + location.lng + "</p>" +
                "<br>" +
                "<div class='maps_icons'>" +
                    "<a target='_blank' href='http://maps.apple.com/?daddr=" + location.lat + "," + location.lng + "'><img src='../views/images/external/maps.png'></a>" +
                    "<a target='_blank' href='https://www.google.com/maps/dir/?api=1&destination=" + location.lat + "," + location.lng + "'><img src='../views/images/external/google-maps.png'></a>" +
                    "<a target='_blank' href='http://waze.com/ul?ll=" + location.lat + "," + location.lng + "&navigate=yes'><img src='../views/images/external/waze.png'></a>" +
                "</div>" +
                "</div>";

            var marker = new google.maps.Marker({
                position: {
                    lat: Number(location.lat),
                    lng: Number(location.lng)
                },
                map: map,
                icon: {
                    url: '../views/images/markers/red_Marker.png',
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
                        "<a target='_blank' href='http://maps.apple.com/?daddr=" + location.lat + "," + location.lng + "'><img src='../views/images/external/maps.png'></a>" +
                        "<a target='_blank' href='https://www.google.com/maps/dir/?api=1&destination=" + location.lat + "," + location.lng + "'><img src='../views/images/external/google-maps.png'></a>" +
                        "<a target='_blank' href='http://waze.com/ul?ll=" + location.lat + "," + location.lng + "&navigate=yes'><img src='../views/images/external/waze.png'></a>" +
                    "</div>" +
                    "</div>";

                var marker = new google.maps.Marker({
                    position: {
                        lat: Number(location.lat),
                        lng: Number(location.lng)
                    },
                    map: map,
                    icon: {
                        url: '../views/images/markers/red_Marker.png',
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

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34, lng: 150},
        zoom: 6,
        mapTypeControl: false,
        keyboardShortcuts: false
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
                url: '../views/images/markers/blue_MarkerHome.png',
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