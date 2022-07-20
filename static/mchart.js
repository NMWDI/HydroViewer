function loadObsChart(name, data, locationURL, url,
                      m,
                      thing, ds, obs, iotid, color){

    ndata = {
            iot: {'Datastream': ds,
                  'Thing': thing,
                  'Location': {'name': name,
                                '@iot.id': iotid,
                                'url': locationURL,
                                'location': data['location']},
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
    let obspropname = ds['ObservedProperty']['name']
    if (obspropname==='Depth to Water Below Ground Surface'){
        myChart.options.scales.yAxis.reverse = true
    }else{
        myChart.options.scales.yAxis.reverse = false
    }

    myChart.options.scales.yAxis.title.text=obspropname
    myChart.data.datasets.push(ndata)
    myChart.update()

    return obspropname
}

var groupBy = function(xs, func) {
  return xs.reduce(function(rv, x) {
    (rv[func(x)] = rv[func(x)] || []).push(x);
    return rv;
  }, {});
};

function loadYearlyChart(obs){

    let years = groupBy(obs, f=>{
        var d = new Date(f['phenomenonTime'])
        d.setHours(d.getHours()+6)
        return d.getFullYear()
    })
    let ndata = []
    console.log(years, years.type)
    let keys = Object.keys(years)
    keys.sort()
    for (const key in keys){
        let label = keys[key]
        let item = years[label]
        // console.log(item, key, keys[key])
    // for (const item in grps){
        let color = 'red'
        if (label==new Date().getFullYear()){
             color = 'green'
        }

        let data =  { label: label,
                borderColor: color,
                backgroundColor: color,
                data: item.map(f=>{
                const d = new Date(f['phenomenonTime']);
                d.setFullYear(new Date().getFullYear())
                d.setHours(d.getHours()+6)
                                                return [d, f['result']]
                                            })}
        ndata.push(data)
    }

    // todo. calculate the yearly average
    let months = groupBy(obs, f=>{
        var d = new Date(f['phenomenonTime'])
        d.setHours(d.getHours()+6)
        return d.getMonth()
    })

    console.log(months)
    avg_months = []
    for (const k in months){
        let month = months[k]
        let sum=0
        for (let n of month){
            sum+=n['result']
        }
        sum/=month.length
        let d = new Date().setMonth(k)

        avg_months.push([d, sum])
    }
    ndata.push({label: 'Average',
        data: avg_months,
        borderColor: 'blue',
        backgroundColor: 'blue',
    })

    // let avg_months = months.map(f=>{
    //     return f.reduce((a,b)=>a+b)/f.length
    // })
    console.log(avg_months)
    ndata.reverse()
    yearChart.data.datasets = ndata
}