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

function downloadFile(filename, text){
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);

}