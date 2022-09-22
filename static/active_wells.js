const ytitle = "Foo Bar"
const yAxis =  {
                    position: "left",
                    reverse: true,
                    // beginAtZero: true,
                    title: {text: ytitle, display: true}

                }
const xAxis = {
                    position: "bottom",
                    type: "time",
                    title: {text: "Time", display: true}
                }
const options = {scales: {yAxis: yAxis,
                          xAxis: xAxis},
                 animation: {
        duration: 0
    }}

const myChart = new Chart(document.getElementById('chartdiv').getContext('2d'), {type: 'line',
                                    data: {labels: [], datasets:[]},
        options: options
    })
$('#chartprogress').hide()

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

function mapLoad(usgs_locations, nmbgmr_locations, usgs_continuous) {
    loadLayer(usgs_locations, 'circle', 'green', 'USGS')
    loadLayer(usgs_continuous, 'circle', 'orange', 'USGS-Continuous')
    loadLayer(nmbgmr_locations, 'circle', 'red', 'NMBGMR')
}
function loadLayer(locations, shape, color, label){
    let markers = locations.map(function (loc){return loadMarker(loc, shape, color, label)})
    const layer = new L.featureGroup(markers)
    map.addLayer(layer)
    layerControl.addOverlay(layer, '<span class="circle" style="background: ' +
        color+'"></span> ' +
        label)
    layer.on('click', function(e){
        selectLocation(e.layer)
    })
}

// function selectLocation(marker){
//     console.log(marker)
//     let url;
//     if (marker.source==='USGS'){
//         url = 'https://'
//     }else {
//         url = 'https://st2.newmexicowaterdata.org/FROST-Server/v1.1/'
//     }
//
//     url += 'Locations?$filter=name eq \''+marker.sourcedata.Well_ID+'\''
//     console.log(url)
//
//     $.get(url).then(function(data){
//         console.log(data)
//         marker.closePopup()
//
//
//
//
//     })
//
// }

function selectLocation(marker){

    $('#chartprogress').show()

    let url;
    let baseurl;
    let dsname;
    // let iotid = layer.iotid
    let name = marker.sourcedata.Well_ID
    let fname;
    if (marker.source==='USGS' || marker.source=='USGS-Continuous'){
        console.log(marker.sourcedata.Type, marker.sourcedata.Type=='Long-term continuos site')
        if (!(marker.sourcedata.Type==='Long-term continuos site')){
            $('#chartprogress').hide()
            return
        }
        baseurl = 'https://labs.waterdata.usgs.gov/sta/v1.1/'
        fname = 'USGS-'+name
        dsname = ''
        make_id = function(iotid){
        return "'"+iotid+"'"
        }
        makecolor = function(iotid){
            return colors[hashIOTID(iotid)%10]
        }
    }else {
        baseurl = 'https://st2.newmexicowaterdata.org/FROST-Server/v1.1/'
        fname = name
        dsname = 'Groundwater Levels'
        make_id = function(iotid){
        return iotid
        }
        makecolor = function(iotid){
            return colors[iotid%10]
        }
    }
    url =baseurl+ 'Locations?$filter=name eq \''+fname+'\''
    console.log(url)

        marker.closePopup()

        $.get(url+'&$expand=Things/Datastreams/ObservedProperty,Things/Datastreams/Sensor').then(
                        function (data){
                            // console.log('reload data', data)
                            data = data['value'][0]
                            // console.log(data)
                            var thing = data['Things'][0]
                            let ds;
                            if (dsname){
                                ds = thing['Datastreams'].filter(function (d){
                                return d['name'] == dsname
                                })[0]
                            }else{
                                ds = thing['Datastreams'][0]
                            }

                            console.log(ds, dsname, thing)
                            if (ds){
                                // let locurl = 'Locations('+make_id(data['@iot.id'])+')/'
                                const obsurl = baseurl+"Datastreams("+make_id(ds["@iot.id"])+")/Observations?$top=1000&$orderby=phenomenonTime desc"

                                var datasets = myChart.data.datasets
                                if (!(datasets.map(function(d){return d.label}).includes(name))){
                                    // marker.setStyle({color: 'red',fillColor: 'red'})
                                    marker.bringToFront();

                                    retrieveItems(obsurl, 10000,
                                        function(obs){
                                            obs.forEach(o=>{
                                                o['locationname'] = name
                                            })
                                        // ods.push(obs)
                                        // loadYearlyChart(obs)
                                        // updateSliders(obs)
                                        // let color = makecolor(iotid)
                                            let color='black'
                                        ndata = {
                                                iot: {'Datastream': ds,
                                                      'Thing': thing,
                                                      'Location': {'name': name,
                                                                    // '@iot.id': iotid,
                                                                    // 'url': locationURL,
                                                                    'location': data['location']},
                                                      'sourceURL': url,
                                                      // 'source': m.source
                                                },
                                                label: name,
                                                data: obs.map(f=>{
                                                    var d = new Date(f['phenomenonTime'])
                                                    d.setHours(d.getHours()+6)
                                                    return [d, f['result']]
                                                }),
                                                borderColor: color,
                                                backgroundColor: color,
                                                tension: 0.1
                                            }
                                            myChart.data.datasets = [ndata,]
                                            let obspropname = ds['ObservedProperty']['name']
                                            if (obspropname==='Depth to Water Below Ground Surface'){
                                                myChart.options.scales.yAxis.reverse = true
                                            }
                                        myChart.update()
                                        $('#chartprogress').hide()
                                }
                             )}
                            }
                            $('#chartprogress').hide()
                        }
        )

    // })
}
function loadMarker(loc, shape, color, source){
    // console.log(loc)
    let marker;
    if (shape==='circle'){
        marker = L.circleMarker([loc['Latitude'], loc['Longitude']])

    }else{
        marker = L.triangleMarker([loc['Latitude'], loc['Longitude']], {'width': 8, "height": 4})

    }
    marker.source = source
    marker.sourcedata = loc
    marker.setStyle({color: color,
        fillColor: color,
        radius: 4})
    marker.bindPopup("Well ID: "+loc['Well_ID']+'<br/>'+
        'Agency: '+loc['Managing_Agency']+'<br/>'+
        'Type: '+ loc['Type']+'<br/>'+
        'Well Depth(ft): '+loc['Well_Depth'])

     marker.on('mouseover', function(e) {
        marker.openPopup();
    } )
    marker.on('mouseout', function(e) {
        map.closePopup();
    } )
    return marker
}