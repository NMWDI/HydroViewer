
// var dates = dates_as_int.map(function(dateStr) {
//     return new Date(dateStr).getTime();
// });

function updateSliders(obs){
    let mi;
    let ma;
    for (let i=0; i<obs.length; i++){
        // console.log(obs[i].phenomenonTime)
        let nt = new Date(obs[i].phenomenonTime).getTime()
        if (!mi){
            mi = nt
            ma = nt
        }else{
            mi = Math.min(mi, nt)
            ma = Math.max(ma, nt)

        }
    }

    $('#minSlider').prop('min', mi)
    $('#minSlider').prop('max', ma)
    $('#maxSlider').prop('min', mi)
    $('#maxSlider').prop('max', ma)
    $('#maxSlider')[0].value = ma
    $('#minSlider')[0].value = mi

}
function updateMin(range){
    $('#maxSlider').prop('min', range.value)
    $('#minSliderLabel').html(new Date(parseInt(range.value)).toLocaleString())
    filterDatasets();
}


function updateMax(range){
    $('#minSlider').prop('max', range.value)
    $('#maxSliderLabel').html(new Date(parseInt(range.value)).toLocaleString())
    filterDatasets()
}

function filterDatasets(){

    // let d =new Date(parseInt(range.value))
    // console.log($('#maxSlider'))
    let mat = parseInt($('#maxSlider')[0].value)
    let mit = parseInt($('#minSlider')[0].value)

    // console.log(range.value, d);
    for (let i=0; i<myChart.data.datasets.length; i++){
        let nobs = ods[i].filter(f=>{
            const dt = new Date(f['phenomenonTime']).getTime()
            return mit<=dt && dt<=mat
        }).map(f=>{let d = new Date(f['phenomenonTime'])
                                                d.setHours(d.getHours()+6)
                                                return [d, f['result']]
                                            })

        myChart.data.datasets[i].data = nobs

    }
    // myChart.options.scales.xAxis.min = d
    myChart.update()
}