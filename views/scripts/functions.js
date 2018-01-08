// function to add temp marker
function addMarker() {
    if(!search_marker)
        return;
    var latLng = search_marker.position;
    var lat = latLng.lat();
    var lng = latLng.lng();
    var geocoder = new google.maps.Geocoder();
    cancelLocation();
    geocoder.geocode({latLng}, function(results, status) {
        $.post("/getname", { lat: lat, lng: lng, address: results[0].formatted_address }, function(markerName) {
            var markerID = lat + "_" + lng;
            var editingContent = "<div id='editingForm'>" +
                "<h3 class='name_taken' id='taken_" + markerID + "'>Name Taken.</h3>" +
                "<h1 contenteditable=true class='editable' id='name_" + markerID + "'>" + markerName + "</h1>" +
                "<p>Address: " + results[0].formatted_address + "</p>" +
                "<p>Latitude: " + lat + "</p>" +
                "<p>Longitude: " + lng + "</p>" +
                "<button id='" + markerID + "' onclick='delMarker(\"" + markerID + "\")'>Remove</button>" + 
                "<div class='maps_icons'>" +
                    "<a target='_blank' href='http://maps.apple.com/?daddr=" + lat + "," + lng + "'><img src='views/images/external/maps.png'></a>" +
                    "<a target='_blank' href='https://www.google.com/maps/dir/?api=1&destination=" + lat + "," + lng + "'><img src='views/images/external/google-maps.png'></a>" +
                    "<a target='_blank' href='http://waze.com/ul?ll=" + lat + "," + lng + "&navigate=yes'><img src='views/images/external/waze.png'></a>" +
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
                position: {
                    lat: lat,
                    lng: lng
                },
                map: map,
                icon: {
                    url: 'views/images/markers/red_Marker.png',
                    scaledSize: new google.maps.Size(20, 34),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(10, 34)
                }
            });

            infoWindow.open(map, marker);

            markers[markerID] = marker;
            addMarkerListener(marker, infoWindow, markerID, function() {
                google.maps.event.trigger(marker, 'click');   
            });
        });
    });
}

// function to get marker based on name
function getLocation(name, callback) {
    $.post("/getlocation", {name: name}, function(location) {
        if(location)
            callback(location);
        else
            callback(null);
    });
}

// function to cancel temp marker
function cancelLocation() {
    search_marker.setMap(null); 
}
            
// function to delete markers
function delMarker(markerUniqueID, saved) {
    var marker, lat, lng;
    if(!saved) {
        marker = markers[markerUniqueID];
        lat = marker.getPosition().lat();
        lng = marker.getPosition().lng();
        
        $.post('/deletelocation', {'lat': lat, 'lng': lng}, function(data) {
            marker.setMap(null);
        });
    }
    else {
        marker = saved_markers_obj[markerUniqueID];
        lat = marker.position.lat();
        lng = marker.position.lng();
        
        $.post('/deletelocation', {'lat': lat, 'lng': lng}, function() {
            marker.setMap(null);   
        });
    }
}
            
// function to show saved markers
function showMarkers(callback) {
    for(var i = 0; i < saved_markers.length; i++) {
        var pos = {
            lat: Number(saved_markers[i].lat),
            lng: Number(saved_markers[i].lng)
        }
        var marker = new google.maps.Marker({
            position: pos,
            map: map,
            icon: {
                url: 'views/images/markers/green_Marker.png',
                scaledSize: new google.maps.Size(20, 34),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(10, 34)
            }
        });
                    
        var editingContent = "<div id='editingForm'>" +
            "<h3 class='name_taken' id='taken_" + saved_markers[i]._id + "'>Name Taken.</h3>" +
            "<h1 contenteditable='true' class='editable' id='name_" + saved_markers[i]._id + "'>" + saved_markers[i].name + "</h1>" +
            "<p>Address: " + saved_markers[i].address + "</p>" + 
            "<p>Latitude: " + saved_markers[i].lat + "</p>" +
            "<p>Longitude: " + saved_markers[i].lng + "</p>" +
            "<button id='" + saved_markers[i]._id + "' onclick='delMarker(\"" + saved_markers[i]._id + "\", true)'>Remove</button>" + 
            "<div class='maps_icons'>" +
                "<a target='_blank' href='http://maps.apple.com/?daddr=" + saved_markers[i].lat + "," + saved_markers[i].lng + "'><img src='views/images/external/maps.png'></a>" +
                "<a target='_blank' href='https://www.google.com/maps/dir/?api=1&destination=" + saved_markers[i].lat + "," + saved_markers[i].lng + "'><img src='views/images/external/google-maps.png'></a>" +
                "<a target='_blank' href='http://waze.com/ul?ll=" + saved_markers[i].lat + "," + saved_markers[i].lng + "&navigate=yes'><img src='views/images/external/waze.png'></a>" +
            "</div>" +
            "</div>";
        
        var infoWindow = new google.maps.InfoWindow({
            content: editingContent,
            maxWidth: 300
        });
        
        addMarkerListener(marker, infoWindow, saved_markers[i]._id, doNothing);
        saved_markers_obj[saved_markers[i]._id] = marker;
    }
}
            
function addInfoWindow(marker, editingContent, callback) {
    var infoWindow = new google.maps.InfoWindow({
        content: editingContent,
        maxWidth: 300
    })
        
    google.maps.event.addListener(marker, 'click', function() {
        for(var i = 0; i < info_windows.length; i++)
            info_windows[i].close();
        infoWindow.open(map, marker); 
        info_windows.push(infoWindow);
        $('.editable').keydown(function(e) {
            if(e.keyCode == 32)
                e.preventDefault();
            if(e.keyCode == 13) {
                e.preventDefault();
                $('.editable').blur();
            }
        }); 
    });
}

// function to handle clicking in markers
function addMarkerListener(marker, infoWindow, markerID, callback) {
    marker.addListener('click', function() {
        for(var i = 0; i < info_windows.length; i++)
            info_windows[i].close();
        infoWindow.open(map, marker);
        info_windows.push(infoWindow);
        markerName = document.getElementById('name_' + markerID);
        originalText = markerName.innerHTML;
        $(markerName).keydown(function(e) {
            if(e.keyCode == 13) {
                e.preventDefault();
                $(markerName).blur();
            }
        });
        $(markerName).blur(function(e) {
            console.log(e);
            $.post('/nametaken', {name: markerName.innerHTML}, function(taken) {
                if(!taken) {
                    document.getElementById('taken_' + markerID).style.visibility = 'hidden';
                    document.getElementById('taken_' + markerID).style.position = 'absolute';
                    originalText = markerName.innerHTML;
                    if(markerID.indexOf('_') == -1) {
                        $.post('/modifylocation', {saved: true, id: markerID, modifying: "name", modifyingTo: markerName.innerHTML});
                    }
                    else {
                        var lat = markerID.substring(0, markerID.indexOf("_"));
                        var lng = markerID.substring(markerID.indexOf("_") + 1);
                        $.post('/modifylocation', {saved: false, location: {lat: lat, lng: lng}, modifying: "name", modifyingTo: markerName.innerHTML});
                    }
                }
                else {
                    document.getElementById('taken_' + markerID).style.visibility = 'visible';
                    document.getElementById('taken_' + markerID).style.position = 'static';
                    markerName.innerHTML = originalText;
                    console.log(originalText);
                }
            });   
        })
    });
    callback();
}

function doNothing() {}