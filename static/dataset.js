function submitQuery1(){
    $('#downloadprogress').show()
    let url = $("#stsource")[0].value  +'/Locations?$expand=Things&$filter=properties/agency eq '+'\''+$("#agency")[0].value+'\''

    retrieveItems(url, -1, items=>{
        let content = "@iot.id,name,description,latitude,longitude,altitude,geologicFormation\r\n"
        items.forEach(function(loc){
            let row = [loc['@iot.id'], loc['name'], loc['description'],
                loc['location']['coordinates'][1], loc['location']['coordinates'][0],
                loc['properties']['Altitude'], loc['Things'][0]['properties']['GeologicFormation']]
            content+= row +"\r\n"
            }
        )
        downloadFile("myquery.csv", content)
        $('#downloadprogress').hide()
    })
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
    console.log('asdf', q, url)

    retrieveItems(url, -1, items=>{
        let content = "@iot.id,name,description,latitude,longitude,altitude,geologicFormation\r\n"
        items.forEach(function(loc){
            let row = [loc['@iot.id'], loc['name'], loc['description'],
                loc['location']['coordinates'][1], loc['location']['coordinates'][0],
                loc['properties']['Altitude'], loc['Things'][0]['properties']['GeologicFormation']]
            content+= row +"\r\n"
            }
        )
        downloadFile("myquery.csv", content)
        $('#downloadprogress').hide()
    })
}