// document.addEventListener('DOMContentLoaded', () => {
//     var map;
//     function initMap() {
//         map = new google.maps.Map(document.getElementById('map'), {
//             center: {lat: 30, lng: 20},
//             zoom: 3
//
//         });
//     }
// });

// the map
var map;

function initialize() {
    var myOptions = {
        zoom: 2,
        center: new google.maps.LatLng(30, 20),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    // initialize the map
    map = new google.maps.Map(document.getElementById('map'),
        myOptions);

    // these are the map styles
    var styles = [
        {
            stylers: [
                { hue: "#00ffe6" },
                { saturation: -20 }
            ]
        },
        {
            featureType: "landscape",
            stylers: [
                { hue: "#ffff66" },
                { saturation: 100 }
            ]
        },{
            featureType: "road",
            stylers: [
                { visibility: "off" }
            ]
        },{
            featureType: "administrative.land_parcel",
            stylers: [
                { visibility: "off" }
            ]
        },{
            featureType: "administrative.locality",
            stylers: [
                { visibility: "off" }
            ]
        },{
            featureType: "administrative.neighborhood",
            stylers: [
                { visibility: "off" }
            ]
        },{
            featureType: "administrative.province",
            stylers: [
                { visibility: "off" }
            ]
        },{
            featureType: "landscape.man_made",
            stylers: [
                { visibility: "off" }
            ]
        },{
            featureType: "landscape.natural",
            stylers: [
                { visibility: "off" }
            ]
        },{
            featureType: "poi",
            stylers: [
                { visibility: "off" }
            ]
        },{
            featureType: "transit",
            stylers: [
                { visibility: "off" }
            ]
        }
    ];

    map.setOptions({styles: styles});

    // Initialize JSONP request
    var script = document.createElement('script');
    var url = ['https://www.googleapis.com/fusiontables/v1/query?'];
    url.push('sql=');
    var query = 'SELECT name, kml_4326 FROM ' +
        '1foc3xO9DyfSIF6ofvN0kp2bxSfSeKog5FbdWdQ';
    var encodedQuery = encodeURIComponent(query);
    url.push(encodedQuery);
    url.push('&callback=drawMap');
    url.push('&key=AIzaSyAm9yWCV7JPCTHCJut8whOjARd7pwROFDQ');
    script.src = url.join('');
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(script);
}

function drawMap(data) {
    var rows = data['rows'];
    for (var i in rows) {
        if (rows[i][0] !=='Antarctica') {
            var newCoordinates = [];
            var geometries = rows[i][1]['geometries'];
            if (geometries) {
                for (var j in geometries) {
                    newCoordinates.push(constructNewCoordinates(geometries[j]));
                }
            } else {
                newCoordinates = constructNewCoordinates(rows[i][1]['geometry']);
            }
            var country = new google.maps.Polygon({
                paths: newCoordinates,
                strokeColor: '#ff9900',
                strokeOpacity: 1,
                strokeWeight: 0.3,
                fillColor: '#ffff66',
                fillOpacity: 0,
                name: rows[i][0]
            });
            google.maps.event.addListener(country, 'mouseover', function() {
                this.setOptions({fillOpacity: 0.4});
            });
            google.maps.event.addListener(country, 'mouseout', function() {
                this.setOptions({fillOpacity: 0});
            });
            google.maps.event.addListener(country, 'click', async function() {
                const url = 'https://www.googleapis.com/youtube/v3/search?part=snippet\n' +
                    '                     &q=top+tracks+' + this.name + '&type=playlistId\n' +
                    '                     &key=AIzaSyATcDyZ8d0Tk2Xa10uDW9sTrWALE3DLfXM';

                let response = await fetch(url);
                let playlistAll = await response.json();
                let playlistId = playlistAll.items[1].id.playlistId;

                let videos = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=' +
                    `${playlistId}` + '&key=AIzaSyATcDyZ8d0Tk2Xa10uDW9sTrWALE3DLfXM';

                let resVideos = await fetch(videos);
                let videoAll = await resVideos.json();
                // console.log(videoAll);
                let videoArr = [];
                for (let i = 0; i < videoAll.items.length; i++) {
                    videoArr.push(videoAll.items[i].snippet.resourceId.videoId);
                }

                let player = document.getElementsByTagName('iframe')[1];

                let randomNum = Math.floor(Math.random() * 50) + 1;
                let currentVideo = videoArr[randomNum];
                player.src = 'https://www.youtube.com/embed/' + `${currentVideo}`;
                // player.src = 'https://www.youtube.com/embed/NVIbCvfkO3E';

                player.style.display = 'block'
            });

            country.setMap(map);
        }
    }
}


function constructNewCoordinates(polygon) {
    var newCoordinates = [];
    var coordinates = polygon['coordinates'][0];
    for (var i in coordinates) {
        newCoordinates.push(
            new google.maps.LatLng(coordinates[i][1], coordinates[i][0]));
    }
    return newCoordinates;
}

// google.maps.event.addDomListener(window, 'load', initialize);