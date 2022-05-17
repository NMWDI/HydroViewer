
var sourceURL = 'https://raw.githubusercontent.com/NMWDI/VocabService/main/ose_roswell.json';
$(document).ready(function (){

    const ctx = document.getElementById('hydrograph').getContext('2d');
    const myChart = new Chart(ctx, {type: 'line',
                                    data: {labels: [], datasets:[]}})
    $.getJSON(sourceURL)
        .done(function (data) {
            var table = $('#wellstable')
            console.log("got wells")
            locations = data['locations']
            locations.forEach(function(loc){
                loc['id'] = loc['@iot.id']
            })
            var dtt = table.DataTable({select: true,
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

            dtt.on( 'select', function ( e, dt, type, indexes ) {
            if ( type === 'row' ) {
                var iotid = dtt.rows( indexes ).data().pluck( 'id' )[0];
                var name = dtt.rows( indexes ).data().pluck( 'name' )[0];

                $.get("https://st2.newmexicowaterdata.org/FROST-Server/v1.1/Locations("+iotid+')?$expand=Things/Datastreams').then(
                    function (data){
                        console.log('reload data', data)
                        var thing = data['Things'][0]
                        var ds = thing['Datastreams'][0]
                        obsdtt.ajax.url("https://st2.newmexicowaterdata.org/FROST-Server/v1.1/Datastreams("+ds["@iot.id"]+")/Observations?$orderby=phenomenonTime desc")
                        obsdtt.ajax.reload()

                        $.get("https://st2.newmexicowaterdata.org/FROST-Server/v1.1/Datastreams("+ds["@iot.id"]+")/Observations?$orderby=phenomenonTime desc").then(
                            function(obs){
                                console.log(obs)
                                var nobs = obs['value'].map(function(o){return [o['phenomenonTime'], o['result']]})
                                
                                myChart.data.datasets.push({data: nobs, label: name})
                                myChart.update()

                            }
                        )

                        })
                }
            });
    })
})