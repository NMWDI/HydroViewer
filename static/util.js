
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
