// import * as nmbg_locations from './nmbg_locations.json'

var PROJECT = 'pvacd_hydroviewer'

var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

var map = L.map('map', {
        preferCanvas: true,
        updateWhenZooming: false,
        updateWhenIdle: true,
        layers: [osm]
    }
)
map.setView([33.5, -104.5], 7);


var layerControl = L.control.layers({"osm": osm}, null).addTo(map);

var use_cluster = false;
var allmarkers = [];


var sources = [
        {'name': 'usgs', 'label': 'USGS', 'color': 'green'},
        {'name': 'ose_roswell', 'label': 'OSE Roswell', 'color':'blue'},
        {'name': 'nmbgmr', 'label': 'NMBGMR', 'color':'purple'},
        {'name': 'isc_seven_rivers', 'label': 'ISC Seven Rivers', 'color':'orange'},
    ]

//
// $.getJSON(sourceURL).done(
//     function (data){
//         var locations=data['locations']
//         // var layer = new L.LayerGroup();
//         // let usgs = locations.filter(function(l){return l['source']=='USGS'})
//         // let ose = locations.filter(function(l){return l['source']=='OSE-Roswell'})
//         // let isc_seven_rivers = locations.filter(function(l){return l['source']=='isc_seven_rivers'})
//         // let nmgbmr = locations.filter(function(l){return l['source']=='NMBGMR'})
//         loadLayer(ose, 'blue', 'OSE Roswell');
//         loadLayer(nmgbmr, 'purple', 'NMBGMR');
//         loadLayer(usgs, 'green', 'USGS');
//         loadLayer(isc_seven_rivers, 'orange', 'ISC Seven Rivers');
//     }
// )

function loadSource(s){
    let url = 'https://raw.githubusercontent.com/NMWDI/VocabService/main/'+PROJECT+'/'+s.name+'.json'
    $.getJSON(url).done(
        function(data){
            let ls = data['locations']
            loadLayer(ls, s.color, s.label)
        }
    )

}
sources.forEach(loadSource)



function loadLayer(ls, color, label, load_things){
    console.log('load late')
    let markers = ls.map(function (loc){return loadMarker(loc, color, load_things)})

    var layer = new L.featureGroup(markers)
    map.addLayer(layer)
    layerControl.addOverlay(layer, label)

    layer.on('click', function(e){
        toggleLocation(e.layer.stid, e.layer.name)
    })
}
function loadMarker(loc, color, load_things){
    var marker = L.circleMarker([loc['location']['coordinates'][1], loc['location']['coordinates'][0], ],)
    marker.setStyle({color: color,
        fillColor: color,
        radius: 4})
    marker.stid = loc['@iot.id']
    marker.name = loc['name']
    // console.log('lasdfasdf', loc['source'], loc)
    marker.source =loc['source']
    marker.defaultColor = color
    marker.properties = loc['properties']
    if (load_things){
        $.get(loc['Things@iot.navigationLink']).then(function(data){
              let things = data['value']
            marker.bindPopup(loc['name']+'<br/>'+ things[0]['properties']['monitoringLocationName'])
        })
    }else{
        marker.bindPopup(loc['name'])
    }

    // console.log(loc, loc['Things'])
    marker.on('mouseover', function(e) {
        marker.openPopup();
    } )
    marker.on('mouseout', function(e) {
        map.closePopup();
    } )

    allmarkers.push(marker)
    return marker
    // markers.push(marker)
}
// var sourceURL = 'https://raw.githubusercontent.com/NMWDI/VocabService/main/ose_roswell.json';
// var ose_roswell_markers = []
// loadSource(sourceURL, ose_roswell_markers, 'blue', 'OSE Roswell');

// var sourceURL = 'https://raw.githubusercontent.com/NMWDI/VocabService/main/usgs_pvacd.json';
// var usgs_pvacd_markers = []
// loadSource(sourceURL, usgs_pvacd_markers, 'green', 'USGS');



//
// $.getJSON("st2locations").then(
//     function (data) {
//         var options=data['options'];
//         var fuzzy_options=data['fuzzy_options'];
//         var markers=data['markers'];
//         var fuzzy_markers=data['fuzzy_markers'];
//         var markers_layer = L.geoJson(markers, {
//             pointToLayer: function (feature, latln){
//                 var marker = L.circleMarker(latln, options)
//                 return marker
//             }
//         })
//
//             if (use_cluster){
//                 var cluster= L.markerClusterGroup();
//                 cluster.addLayer(markers_layer)
//             }else{
//                 cluster = markers_layer
//             }
//
//             map.addLayer(cluster)
//             layerControl.addOverlay(cluster, 'ST2')
//
//
//             var fuzzy_layer = L.geoJson(fuzzy_markers, fuzzy_options)
//             layerControl.addOverlay(fuzzy_layer, 'OSE RealTime')
//     })
//
// $.getJSON("nmenvlocations").then(
// function (data) {
// var options=data['options'];
// var markers=data['markers'];
// var layer = L.geoJson(markers, {
//     pointToLayer: function (feature, latln){
//         var marker = L.circleMarker(latln, options)
//         return marker
//     }
// })
//     if (use_cluster){
//         var cluster= L.markerClusterGroup();
//         cluster.addLayer(layer)
//     }else{
//         cluster = layer
//     }
//     map.addLayer(cluster)
//     layerControl.addOverlay(cluster, 'NMENV')
//
//
// })
//
// $.getJSON("oselocations").then(
// function (data) {
// var options=data['options'];
// var markers=data['markers'];
// var layer = L.geoJson(markers, {
//     pointToLayer: function (feature, latln){
//         var marker = L.circleMarker(latln, options)
//         return marker
//     }
// })
//         if (use_cluster){
//             var cluster= L.markerClusterGroup({'chunkedLoading': true});
//             cluster.addLayers(layer)
//
//         }else{
//             cluster = layer
//         }
//
//         map.addLayer(cluster)
//         layerControl.addOverlay(cluster, 'OSE PODS')
// })



