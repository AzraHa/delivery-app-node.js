function restoranMap() {
    const koordinateRestorana = document.getElementById("koordinateRestorana").value;
    const koordinateRest = koordinateRestorana.replace("(","").replace(")","");
    const koordinate = koordinateRest.split(",");
    var latitude = parseFloat(koordinate[0]);
    var longitude = parseFloat(koordinate[1]);
    var adresa = document.getElementById("address").value;

    const adrese =[];
    adrese.push([latitude,longitude,adresa]);

    var mapProp= {
        center:new google.maps.LatLng(latitude,longitude),
        zoom:18,
    };
    var map = new google.maps.Map(document.getElementById("googleMap"),mapProp);

    var z = document.getElementById("restaurantName").value;

    if (adrese[0][0].length !== '' && adrese[0][1].length !== '') {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(adrese[0][0], adrese[0][1]),
            map: map
        });
        var contentString = z +" "+ adrese[0][2];
        var infowindow = new google.maps.InfoWindow({
            content: contentString,
            maxWidth: 160
        });
        infowindow.open(map, marker);
        marker.addListener("click", () => {
            var contentString = z +" "+ adrese[0][2];
            infowindow.setContent(contentString);
            infowindow.open(map, marker);
        });
    }
}
function korisnikMap(){
    const koordinateKorisnika = document.getElementById("koordinate").value;
    const koordinateK = koordinateKorisnika.replace("(","").replace(")","");
    const koordinate = koordinateK.split(",");
    var latitude = parseFloat(koordinate[0]);
    var longitude = parseFloat(koordinate[1]);
    var adresa = document.getElementById("address").value;
    const adrese =[];
    adrese.push([latitude,longitude,adresa]);
    let markers = [];
    var mapProp= {
        center:new google.maps.LatLng(latitude,longitude),
        zoom:18,
    };

    var map = new google.maps.Map(document.getElementById("googleMap"),mapProp);
    const geocoder = new google.maps.Geocoder();
    if (adrese[0][0].length !== '' && adrese[0][1].length !== '') {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(adrese[0][0], adrese[0][1]),
            map: map
        });
        markers.push(marker);
        var infowindow = new google.maps.InfoWindow({
            content: adresa,
            maxWidth: 160
        });
        infowindow.open(map, marker);
        marker.addListener("click", () => {
            infowindow.setContent(adresa);
            infowindow.open(map, marker);
        });
    }
    infoWindow = new google.maps.InfoWindow();

    const locationButton = document.getElementById("dugme"); //dugme za lociranje

    var x = document.getElementById("address");
    var y = document.getElementById("koordinate");
    locationButton.addEventListener("click", () => {
        clearMarkers(); // 'ocistimo' sve prethodne markere ukoliko postoje
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: parseFloat(position.coords.latitude),
                        lng:parseFloat( position.coords.longitude),
                    };
                    infoWindow.setPosition(pos);
                    geocoder.geocode({ location: pos }, (results, status) => {
                        if (status === "OK") {
                            if (results[0]) {
                                map.setZoom(15);
                                const marker = new google.maps.Marker({
                                    position: pos,
                                    map: map,
                                });
                                markers.push(marker); //ubacujemo marker u niz
                                x.value = results[0].formatted_address; //x- naziv
                                y.value = results[0].geometry.location; //y-koordinate
                                infoWindow.setContent(results[0].formatted_address);
                                infoWindow.open(map,marker);
                                map.setCenter(pos);
                            } else {
                                window.alert("No results found");
                            }
                        } else {
                            window.alert("Geocoder failed due to: " + status);
                        }
                    });
                },
                () => {
                    handleLocationError(true, infoWindow, map.getCenter());
                } ,{timeout: 10000}
            );
        } else {
            handleLocationError(false, infoWindow, map.getCenter());
        }
    });
    //ukoliko browser ne podrzava geolociranje
    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(
            browserHasGeolocation
                ? "Error: The Geolocation service failed."
                : "Error: Your browser doesn't support geolocation."
        );
        infoWindow.open(map);
    }
    // Adds a marker to the map and push to the array.
    function setMapOnAll(map) {
        for (let i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }
    }
    function clearMarkers() {
        setMapOnAll(null);
    }
    let Mar;

    function placeMarker(location) {
        Mar = new google.maps.Marker({
            position: location,
            map: map
        });
        Mar.setPosition(location);
        markers.push(Mar);
        geocoder.geocode({ location }, (results, status) => {
            if (status === "OK") {
                if (results[0]) {
                    infoWindow.setContent(results[0].formatted_address);
                    infoWindow.open(map,Mar);
                    map.setCenter(location);
                    x.value = results[0].formatted_address;
                    y.value = results[0].geometry.location;
                } else {
                    window.alert("No results found");
                }
            } else {
                window.alert("Geocoder failed due to: " + status);
            }
        });
    }

    // This event listener will call addMarker() when the map is clicked.
    map.addListener("click", (event) => {
        clearMarkers();
        placeMarker(event.latLng);
    });

    document.getElementById("submit").addEventListener("click", () => {
        geocodeAddress(geocoder, map);
    });
    function geocodeAddress(geocoder, map) {
        const address = document.getElementById("address").value;
        geocoder.geocode({ address: address }, (results, status) => {
            if (status === "OK") {
                map.setZoom(15);
                map.setCenter(results[0].geometry.location);
                y.value = results[0].geometry.location;
                console.log(y);
                placeMarker(results[0].geometry.location)
            } else {
                alert("Geocode was not successful for the following reason: " + status);
            }
        });
    }

}
function myMap() {
    var mapProp= {
        center:new google.maps.LatLng(43.8575738,18.4098533),
        zoom:14,
    };

    var map = new google.maps.Map(document.getElementById("googleMap"),mapProp);
    const geocoder = new google.maps.Geocoder();

    var x = document.getElementById("address");
    var y = document.getElementById("koordinate");

    let markers = []; //smjestamo sve markere u niz tako da ih kasnije klikom 'smaknemo' sa mape

    infoWindow = new google.maps.InfoWindow();

    const locationButton = document.getElementById("dugme"); //dugme za lociranje

    locationButton.addEventListener("click", () => {
        clearMarkers(); // 'ocistimo' sve prethodne markere ukoliko postoje
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: parseFloat(position.coords.latitude),
                        lng:parseFloat( position.coords.longitude),
                    };
                    infoWindow.setPosition(pos);
                    geocoder.geocode({ location: pos }, (results, status) => {
                        if (status === "OK") {
                            if (results[0]) {
                                map.setZoom(15);
                                const marker = new google.maps.Marker({
                                    position: pos,
                                    map: map,
                                });
                                markers.push(marker); //ubacujemo marker u niz
                                x.value = results[0].formatted_address; //x- naziv
                                y.value = results[0].geometry.location; //y-koordinate
                                infoWindow.setContent(results[0].formatted_address);
                                infoWindow.open(map,marker);
                                map.setCenter(pos);
                            } else {
                                window.alert("No results found");
                            }
                        } else {
                            window.alert("Geocoder failed due to: " + status);
                        }
                    });
                },
                () => {
                    handleLocationError(true, infoWindow, map.getCenter());
                } ,{timeout: 10000}
            );
        } else {
            handleLocationError(false, infoWindow, map.getCenter());
        }
    });
    //ukoliko browser ne podrzava geolociranje
    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(
            browserHasGeolocation
                ? "Error: The Geolocation service failed."
                : "Error: Your browser doesn't support geolocation."
        );
        infoWindow.open(map);
    }
    // Adds a marker to the map and push to the array.
    function setMapOnAll(map) {
        for (let i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }
    }
    function clearMarkers() {
        setMapOnAll(null);
    }
    let Mar;

    function placeMarker(location) {
        Mar = new google.maps.Marker({
            position: location,
            map: map
        });
        Mar.setPosition(location);
        markers.push(Mar);
        geocoder.geocode({ location }, (results, status) => {
            if (status === "OK") {
                if (results[0]) {
                    infoWindow.setContent(results[0].formatted_address);
                    infoWindow.open(map,Mar);
                    map.setCenter(location);
                    x.value = results[0].formatted_address;
                    y.value = results[0].geometry.location;
                } else {
                    window.alert("No results found");
                }
            } else {
                window.alert("Geocoder failed due to: " + status);
            }
        });
    }

    // This event listener will call addMarker() when the map is clicked.
    map.addListener("click", (event) => {
        clearMarkers();
        placeMarker(event.latLng);
    });

    document.getElementById("submit").addEventListener("click", () => {
        geocodeAddress(geocoder, map);
    });
    function geocodeAddress(geocoder, map) {
        const address = document.getElementById("address").value;
        geocoder.geocode({ address: address }, (results, status) => {
            if (status === "OK") {
                map.setZoom(15);
                map.setCenter(results[0].geometry.location);
                y.value = results[0].geometry.location;
                console.log(y);
                placeMarker(results[0].geometry.location)
            } else {
                alert("Geocode was not successful for the following reason: " + status);
            }
        });
    }
    x.addEventListener("keyup", function(event) {
        clearMarkers();
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            geocodeAddress(geocoder, map);
        }
    });
}
