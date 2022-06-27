const ytitle = 'Depth to Water (ft BGS)'

const ctx = document.getElementById('graph').getContext('2d');
const yAxis =  {
                    position: "left",
                    reverse: true,
                    beginAtZero: true,
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
const myChart = new Chart(ctx, {type: 'line',
                                    data: {labels: [], datasets:[]},
        options: options
    })

// $(document).on({
//     ajaxStart: function(){
//         console.log('start')
//
//     },
//     ajaxStop: function(){
//         console.log('stop')
//         $("#graphcontainer").removeClass("loading");
//     }
// });
// function getRow(rows, m) {
//     for (const j in rows) {
//         let row = rows[j]
//         if (row.id === m.stid) {
//             return m
//         }
//     }
// }

function filterMap(e, settings){
    let data = $('#wellstable').DataTable()

    for (const i in allmarkers) {
        let m = allmarkers[i]
        map.removeLayer(m)
    }
    let rows = data.rows( { filter : 'applied'} ).data()
    for (const i in allmarkers){
        let m = allmarkers[i]
        let row = rows.filter(function(r){
            return r.id===m.stid
        })[0]
        if (row){
            map.addLayer(m)
        }
    }
        // m.visible = false
        // console.log(m, m.visible)

}

$(document).ready(function (){

    $('#progress').hide()

    $.getJSON(sourceURL)
        .done(function (data) {
            var table = $('#wellstable')
            console.log("got wells")
            let locations = data['locations']
            locations.forEach(function(loc){
                loc['id'] = loc['@iot.id']
                loc['thingname'] = 'Well'

                if(loc.source==='USGS'){
                    $.ajax({url: loc['Things@iot.navigationLink'],
                    async: false,
                    success: function(data){
                        loc['Things'] = data['value']
                        loc['thingname'] = data['value'][0].properties.monitoringLocationName
                    }})
                }
            })
            console.log(locations)
            var dtt = table.DataTable({select: {style: 'multi'},
                            aaData: locations,
                            columns: [
                                      // {data: "id"},
                                      {data: "name"},
                                      {data: "description"},
                                      {data: "thingname"},
                                      {data: "source"}]})
            dtt.on('search', filterMap)
            // add a button to the column
            //{data: null,
            //                                 render: function (data) {
            //                             return `<div class="text-center">
            //                             <a class='btn  btn-primary' onclick="AddToCart(${data})" >
            //                                <i class='far fa-trash-alt'></i> Delete
            //                             </a></div>`}},
            var obstable = $('#obstable')
            var obsdtt = obstable.DataTable({
                        ajax: {url:'https://st2.newmexicowaterdata.org/FROST-Server/v1.1/Observations?$top=1',
                               cache: true,
                               dataSrc: "value"
                        },
                        columns: [{data: 'phenomenonTime'},
                                  {data: 'result'}]
                        });
            dtt.on('deselect', function ( e, dt, type, indexes ){
                if ( type === 'row' ) {
                var iotid = dtt.rows( indexes ).data().pluck( 'id' )[0];
                var name = dtt.rows( indexes ).data().pluck( 'name' )[0];

                deselectLocation(iotid, name)
                }
            });

            dtt.on( 'select', function ( e, dt, type, indexes ) {
                if ( type === 'row' ) {
                var iotid = dtt.rows( indexes ).data().pluck( 'id' )[0];
                var name = dtt.rows( indexes ).data().pluck( 'name' )[0];

                selectLocation(iotid, name)
                }
            });
        })
})
function AddToCart(id){
            alert(id);
            $('#lblID').val(id);
            $('#deleteConfirmationModal').modal('show');
}

function toggleLocation(iotid, name){
    if (myChart.data.datasets.map(function(d){
        return d.label
    }).includes(name)){
        deselectLocation(iotid, name)
    }else{

        selectLocation(iotid, name)

    }

}
function deselectLocation(iotid, name){
    console.log('deselect location')
    var datasets = myChart.data.datasets
    console.log(iotid, name)
    // console.log(datasets.filter(function(d){
    //     return !(d.label === name)
    // }))
    myChart.data.datasets = datasets.filter(function(d){
        return !(d.label === name)
    })
    myChart.update()

    allmarkers.forEach(function (m){
        if (m.stid===iotid){
            m.setStyle({color: m.defaultColor,
                        fillColor: m.defaultColor})
        }
    })
}

const colors = chroma.scale(['#eeee14','#1471a2']).mode('lch').colors(10)

function hashIOTID(iotid) {
  var hash = 0, i, chr;
  if (iotid.length === 0) return hash;
  for (i = 0; i < iotid.length; i++) {
    chr   = iotid.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
function getMarker(iotid){
    return allmarkers.filter(function (m){ return m.stid == iotid})[0]
}

function selectLocation(iotid, name){
    console.log('location selected')

    // hightlight points on the map
    let m = getMarker(iotid)
    if (!m){
        return
    }

    let url;
    let dsname;

    if (m.source=='USGS'){
        url = 'https://labs.waterdata.usgs.gov/sta/v1.1/'
        dsname = ''
        make_id = function(iotid){
        return "'"+iotid+"'"
        }
        makecolor = function(iotid){
            return colors[hashIOTID(iotid)%10]
        }
    }else{
        url = "https://st2.newmexicowaterdata.org/FROST-Server/v1.1/"
        dsname = 'Groundwater Levels'
        make_id = function(iotid){
        return iotid
        }
        makecolor = function(iotid){
            return colors[iotid%10]
        }
    }

    clearInfoTables()
    populateLocationInfoTable(iotid, name, m.properties)
    let locationURL = url+'Locations('+make_id(iotid)+')'
    console.log(locationURL+'?$expand=Things/Datastreams/ObservedProperty,Things/Datastreams/Sensor')
    $.get(locationURL+'?$expand=Things/Datastreams/ObservedProperty,Things/Datastreams/Sensor').then(
                    function (data){
                        // console.log('reload data', data)
                        var thing = data['Things'][0]

                        populateThingInfoTable(thing)
                        openInfo(null, 'Location')
                        populateDatastreamsInfoTable(thing['Datastreams'])

                        let ds;
                        if (dsname){
                            ds = thing['Datastreams'].filter(function (d){
                            return d['name'] == dsname
                            })[0]
                        }else{
                            ds = thing['Datastreams'][0]
                        }

                        var obsdtt =  $('#obstable').DataTable()
                        if (ds){
                            populateDatastreamInfoTable(ds)
                            populateSensorInfoTable(ds['Sensor'])
                            populateObservedPropertyInfoTable(ds['ObservedProperty'])
                            m.setStyle({color: 'red',fillColor: 'red'})
                            m.bringToFront();
                            var obsurl = url+"Datastreams("+make_id(ds["@iot.id"])+")/Observations?$top=1000&$orderby=phenomenonTime desc"
                            obsdtt.ajax.url(obsurl)
                            obsdtt.ajax.reload()
                             var datasets = myChart.data.datasets
                            // console.log(!(datasets.map(function(d){return d.label}).includes(name)),
                            // name, datasets.map(function(d){return d.label}))
                            if (!(datasets.map(function(d){return d.label}).includes(name))){
                                document.getElementById("progress").style.display ="flex"

                                retrieveItems(obsurl, 10000,
                                    function(obs){


                                    let color = makecolor(iotid)

                                    ndata = {
                                            iot: {'Datastream': ds,
                                                  'Thing': thing,
                                                  'Location': {'name': name,
                                                                '@iot.id': iotid,
                                                                'url': locationURL},
                                                  'sourceURL': url,
                                                  'source': m.source},
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

                                    datasets.push(ndata)
                                        let obspropname = ds['ObservedProperty']['name']
                                        if (obspropname==='Depth to Water Below Ground Surface'){
                                            myChart.options.scales.yAxis.reverse = true
                                        }else{
                                            myChart.options.scales.yAxis.reverse = false
                                        }

                                        myChart.options.scales.yAxis.title.text=obspropname
                                      $(obsdtt.column(1).header()).text( obspropname)
                                    myChart.update()
                                    document.getElementById("progress").style.display ="none"
                            }
                         )}
                        }
                    }
    )
}

const retrieveItems = (url, maxitems, callback) => {
    new Promise((resolve, reject) => {
        getItems(url, maxitems, 0, [], resolve, reject)}).then(callback)
}


const getItems = (url, maxitems, i, items, resolve, reject) =>{
    $.get(url).then(response=>{
        let ritems = items.concat(response.value)
        if (maxitems>0){
            if (ritems.length>maxitems){
                ritems = ritems.slice(0,maxitems)
                resolve(ritems)
                return
            }
        }

        if (response['@iot.nextLink']!=null){
            getItems(response['@iot.nextLink'], maxitems, i+1, ritems, resolve, reject)
        }else{
            resolve(ritems)
        }
    })
}

function clearInfoTables(){
    $('#datastreaminfotable').html(makeInfoContent( '', '', null))
    $('#thinginfotable').html(makeInfoContent('', '', null))
    $('#locationinfotable').html(makeInfoContent('', '', null))

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
    // let iotid = ds['@iot.id']
    // let name = ds['name']
    // let properties = ds['properties']
    // $('#datastreaminfotable').html(makeInfoContent( iotid, name, properties))
    populateSTInfoTable(ds, '#datastreaminfotable')
}

function populateThingInfoTable(thing){
    // let iotid = thing['@iot.id']
    // let name = thing['name']
    // let properties = thing['properties']

    // $('#thinginfotable').html(makeInfoContent(iotid, name, properties))
    populateSTInfoTable(thing, '#thinginfotable')
}

function populateLocationInfoTable(iotid, name, properties){
    $('#locationinfotable').html(makeInfoContent(iotid, name, properties ))
}

function openInfo(evt, name) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(name).style.display = "block";
  if (evt){
    evt.currentTarget.className += " active";
  }

}