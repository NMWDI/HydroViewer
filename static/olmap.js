const PROJECT = 'pvacd_hydroviewer'
const BASE_API_URL = 'https://st2.newmexicowaterdata.org/FROST-Server/v1.1/'
const map = new ol.Map({
  target: 'olmap',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    }),
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([-104.5, 33.5]),
    zoom: 8
  })
});

var select = new ol.interaction.Select({
      // layers: [flickrLayer],
      // style: selectedStyle
    });

const layerSwitcher = new LayerSwitcher({
  reverse: true,
  groupSelectStyle: 'group',
    // activationMode: 'click'
});
map.addControl(layerSwitcher)

map.addInteraction(select);
select.getFeatures().on("add", (evt)=>{
    console.log(evt)
    console.log('asdfasdfsa', evt.element.values_.location)
    selectedLocation = evt.element.values_.location


    populate(evt, evt.element.values_.location)
    // show_location_table(evt, evt.element.values_.location, BASE_API_URL)

})
select.getFeatures().on("remove", (evt)=>{
    // console.log('asdfasdfsa', evt.element.values_.location)
    // show_location_table(evt, evt.element.values_.location, CONFIG.base_api_url)
    document.getElementById("chartoverlay").style.display="none"
})


let CONFIG

const sources = [
        {'name': 'pvacd_hydrovu', 'label': 'PVACD', 'color': 'yellow', 'radius': 5, "zindex": 99},
        {'name': 'nmbgmr', 'label': 'NMBGMR', 'color':'purple', 'radius': 3, "zindex": 2},
        {'name': 'ose_roswell', 'label': 'OSE Roswell', 'color':'blue', 'radius': 3, "zindex": 3},
        {'name': 'isc_seven_rivers', 'label': 'ISC Seven Rivers', 'color':'orange', 'radius': 3, "zindex": 4},
        {'name': 'usgs', 'label': 'USGS', 'color': 'green', 'radius': 3, "zindex": 3},
    ]

// const chartprops = [{'iotid': 9408},
//     {'iotid': 9409},
//     {'iotid': 9410},
// ]


function populate(evt, location){
    clearInfoTables()
    // openInfo(null, 'Location')
    populateLocationInfoTable(location['@iot.id'], location.name, location.properties)
    populateThingInfoTable(location.Things[0])

}

function clearInfoTables(){
    $('#datastreaminfotable').html(makeInfoContent( '', '', null))
    $('#thinginfotable').html(makeInfoContent('', '', null))
    $('#locationinfotable').html(makeInfoContent('', '', null))

}

function populateSTInfoTable(obj, id){
    let iotid = obj['@iot.id']
    let name = obj['name']
    let properties = obj['properties']
    $(id).html(makeInfoContent( iotid, name, properties))
}

function populateSensorInfoTable(obj){
    populateSTInfoTable(obj, '#sensorinfotable')
}

function populateObservedPropertyInfoTable(obj){
    populateSTInfoTable(obj, '#obspropinfotable')
}

function populateDatastreamsInfoTable(dss){
    let table = '';
    for (const di in dss){
        let item = dss[di]
        let content = '<td>'+item['@iot.id'] +'</td>'+
            '<td>'+item['name'] +'</td>'+
            '<td>'+item['unitOfMeasurement']['symbol'] +'</td>'
        let row = '<tr>'+content+'</tr>'
        table+=row
    }

    $('#datastreamsinfotable').html(table)

}
function populateDatastreamInfoTable(ds){
    populateSTInfoTable(ds, '#datastreaminfotable')
}

function populateThingInfoTable(thing){
    populateSTInfoTable(thing, '#thinginfotable')
}

function populateLocationInfoTable(iotid, name, properties){
    $('#locationinfotable').html(makeInfoContent(iotid, name, properties ))
}

function makeInfoContent(iotid, name, properties){

    let infocontent=`<thead>
                        <tr>
                            <th>Property</th>
                            <th>Value</th>
                        </tr>
                    </thead>`
    infocontent+=`<tr>
    <td>ID</td>
    <td>`+iotid+`</td>
    </tr>
    <tr>
    <td>Name</td>
    <td>`+name+`</td>
    </tr>`

     for (const key in properties){
         let value = properties[key]
         if (value instanceof Object){
             value = JSON.stringify(value)
         }
        let row='<tr>'+
            '<td>'+key+'</td>'+
            '<td>'+value+'</td>'+
            '</tr>'
        infocontent+=row
    }
     return infocontent
}
//
// function openInfo(evt, name) {
//   // Declare all variables
//   var i, tabcontent, tablinks;
//
//   // Get all elements with class="tabcontent" and hide them
//   tabcontent = document.getElementsByClassName("tabcontent");
//   for (i = 0; i < tabcontent.length; i++) {
//     tabcontent[i].style.display = "none";
//   }
//
//   // Get all elements with class="tablinks" and remove the class "active"
//   tablinks = document.getElementsByClassName("tablinks");
//   for (i = 0; i < tablinks.length; i++) {
//     tablinks[i].className = tablinks[i].className.replace(" active", "");
//   }
//
//   // Show the current tab, and add an "active" class to the button that opened the tab
//   document.getElementById(name).style.display = "block";
//   if (evt){
//     evt.currentTarget.className += " active";
//   }
//
// }

function mapInit(cfg){
    CONFIG = cfg
    sources.forEach(loadSource)
    clearInfoTables()
    loadPVACDMonitorWells(sources[0])


    // let v = map.getView()
    // v.setZoom(7)
    // v.setCenter(ol.proj.fromLonLat([-104.5, 33.5]),)

}
function loadChart(c){
    console.log('ccc', c)

    let locationURL = BASE_API_URL+'Locations('+c.iotid+')'
    console.log(locationURL+'?$expand=Things/Datastreams/ObservedProperty,Things/Datastreams/Sensor')
    $.get(locationURL+'?$expand=Things/Datastreams/ObservedProperty,Things/Datastreams/Sensor').then(
        function (data){
            // console.log('reload data', data)
            var thing = data['Things'][0]

            // populateThingInfoTable(thing)
            // openInfo(null, 'Location')
            // populateDatastreamsInfoTable(thing['Datastreams'])
            let dsname ='Groundwater Levels'
            let ds;
            if (dsname){
                ds = thing['Datastreams'].filter(function (d){
                return d['name'] == dsname
                })[0]
            }else{
                ds = thing['Datastreams'][0]
            }
            if (ds){
                // populateDatastreamInfoTable(ds)
                // populateSensorInfoTable(ds['Sensor'])
                // populateObservedPropertyInfoTable(ds['ObservedProperty'])
                // m.setStyle({color: 'red',fillColor: 'red'})
                // m.bringToFront();
                var obsurl = BASE_API_URL+"Datastreams("+ds["@iot.id"]+")/Observations?$top=1000&$orderby=phenomenonTime desc"
                // obsdtt.ajax.url(obsurl)
                // obsdtt.ajax.reload()
                var datasets = c.chart.data.datasets
                // console.log(!(datasets.map(function(d){return d.label}).includes(name)),
                // name, datasets.map(function(d){return d.label}))
                document.getElementById(c.progressid).style.display ="flex"
                retrieveItems(obsurl, 2000,
                        function(obs){
                        let color = 'black'
                        ndata = {
                                iot: {'Datastream': ds,
                                      'Thing': thing,
                                      'Location': {'name': c.name,
                                                    '@iot.id': c.iotid,
                                                    'url': locationURL},
                                      // 'sourceURL': url,
                                      // 'source': m.source
                                },
                                label: c.name,
                                data: obs.map(f=>{
                                    var d = new Date(f['phenomenonTime'])
                                    d.setHours(d.getHours()+6)
                                    return [d, f['result']]
                                }),

                                borderColor: color,
                                backgroundColor: color,
                                tension: 0.1
                            }

                        datasets.push(ndata)

                            let trend=calculate_trend(ndata.data)
                            let elem =  document.getElementById(c.trendid)
                            // elem.innerHTML = trend
                            elem.className=trend
                            // elem.classList.add(trend)
                            elem.children[0].className=trend=='increase'?'triangle-up':'triangle-down'
                        c.chart.update()
                        document.getElementById(c.progressid).style.display ="none"
                }
             )
            }
        }
    )
}
function calculate_trend(obs){
    obs = obs.slice(0,50)
    let y = obs.map((o)=>o[1])
    let x = Array.from(Array(y.length).keys())
    console.log(y)
    // sum((x-xmean) * (y-ymean))/sum(x-xmean)**2
    let xmean = x.reduce((p,a)=>p+a)/x.length
    let ymean = y.reduce((p,a)=>p+a)/y.length

    let sx = x.map((xi)=>xi-xmean)
    let sy = y.map((yi)=>yi-ymean)
    let ssx = x.map((xi)=>(xi-xmean)**2)
    let st = x.map((xi, i)=>xi*sy[i])
    st = st.reduce((p, a)=>p+a)
    ssx = ssx.reduce((p,a)=>p+a)
    let trend = st/ssx
    console.log(trend)
    return trend<0?'increase': 'decrease'
}
function loadSource(s){
    const url = 'https://raw.githubusercontent.com/NMWDI/VocabService/main/'+PROJECT+'/'+s.name+'.json'
    $.getJSON(url).done(
        function(data){
            let ls = data['locations']
            console.debug('loading source', s)
            loadLayer(ls, s.color, s.radius, s.label, s.zindex)
        }
    )
}

let PVACD_LOCATIONS;
function loadPVACDMonitorWells(s){
    const url = 'https://raw.githubusercontent.com/NMWDI/VocabService/main/'+PROJECT+'/'+s.name+'.json'
    $.getJSON(url).done(
        function(data){
            let ls = data['locations']
            PVACD_LOCATIONS = ls
            let html='';
            let shtml='<table><tr><th>Well</th><th>Depth to Water Trend</th></tr>';
            let cnt=0
            for (li of ls){
                html+=`<div class="depthtowaterchart">
                        <div id="chartprogress`+cnt+`">
                            <div class="w-flex h-flex justify-content-center align-items-center">
                                <div class="spinner"></div>
                            </div>
                        </div>
                        <canvas  id="depthtowaterchart`+cnt+`"></canvas>
                        </div>`
                shtml+=`<tr><td>`+li['name']+`</td><td id=trend`+cnt+`><div></div>
</td></tr>`
                cnt+=1;
            }
            shtml+='</table>'
            $('#chartcontainer').html(html)
            $('#summarytable').html(shtml)

            const charts = ls.map((location, i)=>{
                console.log(i, )
                const ctx = document.getElementById('depthtowaterchart'+i).getContext('2d');
                console.log(ctx)
                const yAxis =  {
                                    position: "left",
                                    reverse: true,
                                    beginAtZero: true,
                                    title: {text: 'Depth To Water (bgs ft)', display: true}

                                }
                const xAxis = {
                                    position: "bottom",
                                    type: "time",
                                    title: {text: "Time", display: true}
                                }
                const options = {scales: {yAxis: yAxis,
                                          xAxis: xAxis},
                    maintainAspectRatio: false,
                     responsive: true,
                                 animation: {
                                duration: 0
                    }}
                return {"chart": new Chart(ctx, {type: 'line',
                                       data: {labels: [], datasets:[]},
                        options: options,
                    }),
                    "name": location["name"],
                    "trendid": "trend"+i,
                    "progressid": "chartprogress"+i,
                    "iotid": location['@iot.id']}
            })
            charts.forEach(loadChart)
            console.log(charts)
        }
    )

}

function loadLayer(locations, color, radius, label, zindex){
    let features =locations.map((l)=>{
        let lon =l['location']['coordinates'][0]
        let lat = l['location']['coordinates'][1]
        f = new ol.Feature({location: l,
                            geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))})
        return f
    })
    const vectorSource = new ol.source.Vector(
        {features: features}
    );

    const style = new ol.style.Style({image: new ol.style.Circle({radius: radius,
            stroke: new ol.style.Stroke({color: 'black'}),
            fill: new ol.style.Fill({color: color})})})
    const vectorLayer = new ol.layer.Vector({
        title: label,
          source: vectorSource,
        style: style
        });

    vectorLayer.setZIndex(zindex);
    map.addLayer(vectorLayer)
}