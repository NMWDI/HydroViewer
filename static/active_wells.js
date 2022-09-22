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

const usgs = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}',
    {attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'})

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
    "ESRI World Imagery": esri_wi,
    'USGS National Basemap': usgs
    }, null).addTo(map);

let MAP_CFG;

function mapInit(cfg){
    MAP_CFG = cfg;
    map.setView([cfg.center_lat, cfg.center_lon], cfg.zoom);

    $.ajaxSetup({
    async: false
    });

    // function loadSource(s){
    //     const url = 'https://raw.githubusercontent.com/NMWDI/VocabService/main/'+PROJECT+'/'+s.name+'.json'
    //     $.getJSON(url).done(
    //         function(data){
    //             let ls = data['locations']
    //             console.debug('loading source', s)
    //             loadLayer(ls, s.color, s.label)
    //         }
    //     )
    //
    // }
    // sources.forEach(loadSource)
    // loadLegend()

    $.ajaxSetup({
        async: true
    });
}

function mapLoad(usgs_locations, nmbgmr_locations) {
    loadLayer(usgs_locations, 'circle', 'green', 'USGS')
    loadLayer(nmbgmr_locations, 'circle', 'red', 'NMBGMR')
}
function loadLayer(locations, shape, color, label){
    let markers = locations.map(function (loc){return loadMarker(loc, shape, color)})
    const layer = new L.featureGroup(markers)
    map.addLayer(layer)
    layerControl.addOverlay(layer, '<span class="circle" style="background: ' +
        color+'"></span> ' +
        label)
}

function loadMarker(loc, shape, color){
    console.log(loc)
    let marker = L.circleMarker([loc['Latitude'], loc['Longitude']])
    marker.setStyle({color: color,
        fillColor: color,
        radius: 4})
    return marker
}