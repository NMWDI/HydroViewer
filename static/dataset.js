$(document).ready(function(){
    $('#downloadlocationstable').DataTable(
        {columns:[{data: loc=>{return loc['@iot.id']}},
                {data: 'name'},
                {data: 'description'},
                {data: 'location.coordinates.1'},
                {data: 'location.coordinates.0'},
                {data: loc=>{return loc.properties.Altitude ? loc.properties.Altitude:""}},
                {data: loc=>{return loc.properties.project_name ? loc.properties.project_name:""}},
                {data: 'Things.0.name'},
                {data: 'Things.0.description'},
                {data: loc=>{return loc['Things'][0]['properties']['GeologicFormation'] ? loc['Things'][0]['properties']['GeologicFormation']: "" }},

            ]
        }
    )


})

function submitQuery1(){
    $('#downloadprogress').show()
    let url = $("#stsource")[0].value  +'/Locations?$expand=Things&$filter=properties/agency eq '+'\''+$("#agency")[0].value+'\''

    populateTable(url)
}

function submitQuery2(){
    $('#downloadprogress').show()

    let name = $('#filterstr')[0].value
    let comp = $('#filtercomp')[0].value
    let q =''
    if (comp=='equals'){
        q = 'name eq \''+name +'\''
    }else if (comp=='startswith'){
        q = 'startswith(name, \''+name+'\')'
    }else if (comp=='endswith'){
        q = 'endswith(name, \''+name+'\')'
    }

    let url = $("#stsource")[0].value  +'/Locations?$expand=Things&$filter='+ q
    populateTable(url)
}

function populateTable(url){
    $('#downloadprogress').show()

    retrieveItems(url, -1, items=>{
        let dt = $('#downloadlocationstable').DataTable()
        dt.clear()
        dt.rows.add(items).draw()
        $('#downloadprogress').hide()
    })

}

function submitQuery3(){

    let name = $('#projectname')[0].value.toLowerCase()
    let comp = $('#projectnamecomp')[0].value
    let q ='tolower(properties/project_name)'
    if (comp=='equals'){
        q += ' eq \''+name +'\''
    }else if (comp=='startswith'){
        q = 'startswith('+ q +',\''+name+'\')'
    }else if (comp=='endswith'){
        q = 'endswith('+ q +',\''+name+'\')'
    }

    let url = $("#stsource")[0].value  +'/Locations?$expand=Things&$filter='+ q
    console.log(url)
    populateTable(url)
}

function downloadQueryResults(){
    let dtf = $('#downloadlocationstable').DataTable()
    // console.log(dtf, dtf.rows())
    let content = '@iot.id,location.name,location.description,location.latitude,location.longitude,location.altitude' +
        'thing.name,thing.description,thing.geologic_formation\r\n'
    // console.log(dtf, dtf.rows(), dtf.rows().data())
    dtf.rows().data().each(function (v, i){
        let nrow=[v['@iot.id'], v['name'], v['description'],
            v['location']['coordinates'][1],
            v['location']['coordinates'][0],
            v['properties']['Altitude'],
            v['properties']['project_name'],
            v['Things'][0]['name'],
            v['Things'][0]['description'],
            v['Things'][0]['properties']['GeologicFormation']
        ]
        content+=nrow+'\r\n'
    })

    downloadFile('queryresults.csv', content)

}