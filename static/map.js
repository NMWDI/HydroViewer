
//========================================================================================
// Configuration variables
const PROJECT = 'pvacd_hydroviewer'
const sources = [
        {'name': 'nmbgmr', 'label': 'NMBGMR', 'color':'purple'},
        {'name': 'ose_roswell', 'label': 'OSE Roswell', 'color':'blue'},
        {'name': 'isc_seven_rivers', 'label': 'ISC Seven Rivers', 'color':'orange'},
        {'name': 'usgs', 'label': 'USGS', 'color': 'green'},
        {'name': 'pvacd_hydrovu', 'label': 'PVACD', 'color': 'yellow'},
    ]
//========================================================================================


const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

const macrostrat = L.tileLayer('http://tiles.macrostrat.org/carto/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://macrostrat.org">MacroStrat</a> contributors'
})

const opentopo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)\''
})

const esri_wi = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'})
const map = L.map('map', {
        preferCanvas: true,
        updateWhenZooming: false,
        updateWhenIdle: true,
        layers: [osm]
    }
)

const layerControl = L.control.layers({"OpenStreetMap": osm,
    'MacroStrat': macrostrat,
    'OpenTopo': opentopo,
    "ESRI World Imagery": esri_wi
    }, null).addTo(map);

new L.Control.Draw({
    draw: {
        rectangle: true,
        polyline: false,
        circle: false,
        polygon: false,
        circlemarker: false,
        marker: false
    },
    edit: false
}).addTo(map);

const allmarkers = [];

L.Rectangle.include({
    contains: function (latLng) {
        return this.getBounds().contains(latLng);
    }
});

map.on(L.Draw.Event.CREATED, function (e) {
    let selected = allmarkers.filter(function(marker){
        return map.hasLayer(marker) && e.layer.contains(marker.getLatLng())
    })

    if (selected.length>20){
        alert('You have selected '+ selected.length +' locations. The maximum number is 20')
        return
    }

    selected.forEach(function(s){
        selectLocation(s.stid, s.name)
    })

});

let MAP_CFG;
function ResetSelection(){
     myChart.data.datasets = [];
     myChart.update()
    allmarkers.forEach(function (m){
            m.setStyle({color: m.defaultColor,
                             fillColor: m.defaultColor})
    })

}

function mapInit(cfg){
    MAP_CFG = cfg;
    map.setView([cfg.center_lat, cfg.center_lon], cfg.zoom);
    $.ajaxSetup({
    async: false
    });
    function loadSource(s){
        const url = 'https://raw.githubusercontent.com/NMWDI/VocabService/main/'+PROJECT+'/'+s.name+'.json'
        $.getJSON(url).done(
            function(data){
                let ls = data['locations']
                console.debug('loading source', s)
                loadLayer(ls, s.color, s.label)
            }
        )

    }
    sources.forEach(loadSource)
    loadLegend()

    $.ajaxSetup({
        async: true
    });
}
function loadLegend(){
    let legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend');
        let lines = ['<strong>Sources</strong>']
        sources.forEach(s=>{
            lines.push(
                '<i class="circle" style="background: ' + s.color + '"></i> ' + s.label)
        })

        div.innerHTML = '<div style="background: white; padding: 5px">'+ lines.join('<br>') +'</div>';
        console.log(div.innerHTML)
        return div;
    };

    legend.addTo(map);

}
function loadLayer(ls, color, label, load_things){
    console.debug('load layer')

    let mywell_id = MAP_CFG.mywell_id
    let markers = ls.map(function (loc){return loadMarker(loc, color, load_things, mywell_id
    )})

    const layer = new L.featureGroup(markers)
    map.addLayer(layer)
    layerControl.addOverlay(layer, '<span class="circle" style="background: ' +
        color+'"></span> ' +
        label)

    layer.on('click', function(e){
        toggleLocation(e.layer.stid, e.layer.name)
    })
}
function loadMarker(loc, color, load_things, mywell_id){
    var marker = L.circleMarker([loc['location']['coordinates'][1], loc['location']['coordinates'][0], ],)

    if (mywell_id && loc['@iot.id'] == mywell_id){
        marker.defaultColor = 'black'
        color = 'black'
        marker.setStyle({color: color,
        fillColor: color,
        radius: 10})
    }
    else{
        marker.defaultColor = color
        marker.setStyle({color: color,
        fillColor: color,
        radius: 4})
    }
    marker.stid = loc['@iot.id']
    marker.name = loc['name']
    // console.log('lasdfasdf', loc['source'], loc)
    marker.source = loc['source']
    marker.properties = loc['properties']
    if (load_things){
        $.get(loc['Things@iot.navigationLink']).then(function(data){
              let things = data['value']
            marker.bindPopup(loc['name']+'<br/>'+ things[0]['properties']['monitoringLocationName'])
        })
    }else{
        marker.bindPopup(loc['name']+'<br/>'+ loc['source'])
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



