function downloadWellMetaDataAll(){
    console.log('donwload all')

    var sourceURL = 'https://raw.githubusercontent.com/NMWDI/VocabService/main/ose_roswell.json';

    $.getJSON(sourceURL).done(function (data){
        var rows = data['locations']

        content = "@iot.id,name,description,latitude,longitude\r\n"
        rows.forEach(function(loc){
            let row = [loc['@iot.id'], loc['name'], loc['description'],
                loc['location']['coordinates'][1], loc['location']['coordinates'][0], ]
            content+= row +"\r\n"
            }
        )
        downloadFile('AllWellMetaData.csv', content)
    })


}

function downloadSelectedObservations(){
    console.log(myChart.data.datasets);
    content = "label, locationID, locationName, Latitude, Longitude, thingID, thingName, datastreamID," +
        " datastreamName,datetime,result,source,LocationURL\r\n"
    myChart.data.datasets.forEach(function(dataset){
        let rows = dataset.data
        let iot = dataset.iot
        console.log(iot)
        rows.forEach(function(obs){
            let row = [dataset.label,
                iot['Location']['@iot.id'],
                iot['Location']['name'],
                iot['Location']['location']['coordinates'][1],
                iot['Location']['location']['coordinates'][0],
                iot['Thing']['@iot.id'],
                iot['Thing']['name'],
                iot['Datastream']['@iot.id'],
                iot['Datastream']['name'],
                obs[0].toISOString(), obs[1],
                iot['source'],
                iot['Location']['url']]
            content+=row+"\r\n"
        })

    })
    console.log(content)
    downloadFile('Results.csv', content)
}



function downloadFile(filename, text){
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);

}