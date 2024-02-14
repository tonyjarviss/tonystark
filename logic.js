var mpd_url;

document.addEventListener("DOMContentLoaded", function () {
    init();
});

const protData = {
"org.w3.clearkey": {
  "clearkeys": {
    "BOjYSDCWBROtBL1jz6P0mw": "MB1EfDYb5yYCABLSRMia2w" // <kid>:<key>
  }
}
};

var ctx = document.getElementById('chart').getContext('2d');
var myLineChart = new Chart(ctx, {
type: 'line',
data: {
    labels: [0],
    datasets: [{
        label: 'Video Buffer',
        data: [0],
        borderWidth: 1
    }]
},
options: {
    scales: {
        yAxes: [{
            ticks: {
                beginAtZero: true
            }
        }]
    }
}
});

function addData(chart,label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}


function init(){
    var video,
    player,
    mpd_url = "./output/stream.mpd";
    //mpd_url = "https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd"

    function changeSource() {
        var source = document.forms[0];
        var i;
        for (i = 0; i < source.length; i++) {
            if (source[i].checked) {
                mpd_url = source[i].value;
                player.attachSource(mpd_url);
            }
        }
    }

    window.changeSource = changeSource;

    video = document.querySelector("video");
    player = dashjs.MediaPlayer().create();
    player.initialize(video, mpd_url, true);
    player.setProtectionData(protData);
    player.on(dashjs.MediaPlayer.events["PLAYBACK_ENDED"], function() {
        clearInterval(eventPoller);
    });

    var bufferLevelHistory = []
    var counter = 0

    var eventPoller = setInterval(function() {
    var streamInfo = player.getActiveStream().getStreamInfo();
    var dashMetrics = player.getDashMetrics();
    var dashAdapter = player.getDashAdapter();


    if (dashMetrics && streamInfo) {
        const periodIdx = streamInfo.index;
        var repSwitch = dashMetrics.getCurrentRepresentationSwitch('video', true);
        var bufferLevel = dashMetrics.getCurrentBufferLevel('video', true);
        var bitrate = repSwitch ? Math.round(dashAdapter.
        getBandwidthForRepresentation(repSwitch.to,
        periodIdx) / 1000) : NaN;
        document.getElementById('buffer').innerText = bufferLevel;
        document.getElementById('bitrate').innerText = bitrate;
        document.getElementById('representation').innerText = repSwitch.to;
        

        // Visualization
        bufferLevelHistory.push(bufferLevel)
        counter += 0.5
        addData(myLineChart, counter, bufferLevel)
        }
    }, 500);
}



