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
                          xAxis: xAxis}}
const myChart = new Chart(ctx, {type: 'line',
                                    data: {labels: [], datasets:[]},
        options: options
    })


$(document).ready(function (){
    $.getJSON(sourceURL)
        .done(function (data) {
            var table = $('#wellstable')
            console.log("got wells")
            let locations = data['locations']
            locations.forEach(function(loc){
                loc['id'] = loc['@iot.id']
            })
            var dtt = table.DataTable({select: {style: 'multi'},
                            aaData: locations,
                            columns: [
                                      {data: "id"},
                                      {data: "name"},
                                      {data: "description"}]})

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
    var datasets = myChart.data.datasets
    console.log(iotid, name)
    console.log(datasets.filter(function(d){
        return !(d.label === name)
    }))
    myChart.data.datasets = datasets.filter(function(d){
        return !(d.label === name)
    })
    myChart.update()

    ose_roswell_markers.forEach(function (m){
        if (m.stid===iotid){
            m.setStyle({color: 'blue',
                              fillColor: 'blue'})
            m.bringToFront();
        }
    })
    usgs_pvacd_markers.forEach(function (m){
        if (m.stid===iotid){
            m.setStyle({color: 'blue',
                              fillColor: 'blue'})
            m.bringToFront();
        }
    })
}

const colors = chroma.scale(['#eeee14','#1471a2']).mode('lch').colors(10)

function selectLocation(iotid, name){
    // hightlight points on the map

    var url = '';
    console.log('adf', allmarkers)
    allmarkers.forEach(function (m){
        if (m.stid===iotid){
            m.setStyle({color: 'red',
                                fillColor: 'red'})
            m.bringToFront();

            if (m.source=='USGS'){
                url = 'https://labs.waterdata.usgs.gov/sta/v1.1/'
                make_id = function(iotid){
                return "'"+iotid+"'"
                }
            }else{
                url = "https://st2.newmexicowaterdata.org/FROST-Server/v1.1/"
                make_id = function(iotid){
                return iotid
                }
            }


        }
    })


    $.get(url+'Locations('+make_id(iotid)+')?$expand=Things/Datastreams').then(
                    function (data){
                        console.log('reload data', data)
                        var thing = data['Things'][0]
                        var ds = thing['Datastreams'][0]
                        var obsdtt =  $('#obstable').DataTable()
                        var obsurl = url+"Datastreams("+make_id(ds["@iot.id"])+")/Observations?$orderby=phenomenonTime desc"
                        obsdtt.ajax.url(obsurl)
                        obsdtt.ajax.reload()

                        var datasets = myChart.data.datasets
                        console.log(!(datasets.map(function(d){return d.label}).includes(name)),
                            name, datasets.map(function(d){return d.label}))
                        if (!(datasets.map(function(d){return d.label}).includes(name))){
                            $.get(obsurl).then(
                            function(obs){
                                console.log(obs)
                                ndata = {
                                        label: name,
                                        data: obs['value'].map(f=>{
                                            var d = new Date(f['phenomenonTime'])
                                            d.setHours(d.getHours()+6)
                                            return [d, f['result']]
                                        }),
                                        borderColor: colors[iotid%10],
                                        backgroundColor: colors[iotid%10],
                                        tension: 0.1
                                    }


                                datasets.push(ndata)
                                myChart.update()
                            }
                )}})
}