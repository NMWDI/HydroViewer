
const ctx = document.getElementById('mygraph').getContext('2d');
const yAxis =  {
                    position: "left",
                    reverse: true,
                    beginAtZero: true,
                    title: {text: 'Depth To Water Below Ground Surface', display: true}

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
const chart = new Chart(ctx, {type: 'line',
                                    data: {labels: [], datasets:[]},
        options: options
    })

function chartSubmit(event) {
    event.preventDefault();
    let dsiot = document.getElementById('dsiot').value;
    // console.log(event.target)
    // let dsiot = event.target[0].value
    let url = "https://st2.newmexicowaterdata.org/FROST-Server/v1.1/"
    let obsurl = url+"Datastreams("+dsiot+")/Observations?$top=1000&$orderby=phenomenonTime desc"
    console.log(obsurl)
    $('#mychartprogress').show()
    retrieveItems(obsurl, 1000,
        function(obs){
            ndata = {
                label: dsiot,
                data: obs.map(f=>{var d = new Date(f['phenomenonTime'])
                                                d.setHours(d.getHours()+6)
                                                return [d, f['result']]
                                            }),
            }
            chart.data.datasets.push(ndata)
            chart.update()
            $('#mychartprogress').hide()
        })

  // // log.textContent = `Form Submitted! Time stamp: ${event.timeStamp}`;

}
function chartClear(){
    chart.data.datasets=[];
    chart.update();
}

$(document).ready(function () {
    $('#mychartprogress').hide()
    const submit = document.getElementById('submit');
    // const log = document.getElementById('log');
    submit.addEventListener('click', chartSubmit);
    const clear = document.getElementById('clear');
    clear.addEventListener('click', chartClear);
})

