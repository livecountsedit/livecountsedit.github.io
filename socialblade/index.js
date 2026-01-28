var current = 0;
class LivecountseditInterface {
    constructor() {
        this.suffixValues = {
            'k': 1e3,
            'm': 1e6,
            'b': 1e9,
            't': 1e12,
            'q': 1e15,
        },
            this.openTab = function (e, f) {
                var a, b, c;
                b = document.getElementsByClassName('tab-content');
                for (a = 0; a < b.length; a++) {
                    b[a].style.display = 'none';
                }
                c = document.getElementsByClassName('tab-link');
                for (a = 0; a < c.length; a++) {
                    c[a].className = c[a].className.replace(' active', '');
                }
                document.getElementById(f).style.display = 'block';
                e.currentTarget.className += ' active'
            },
            this.rickroll = function () {
                window.location.replace('https://youtu.be/dQw4w9WgXcQ')
            },
            this.setAvatar = function () {
                if (!document.getElementById("options.counter.avatar.file").files.length) {
                    if (!document.getElementById("options.counter.avatar.url").value) return;
                    else document.getElementById("userimg").src = document.getElementById("options.counter.avatar.url").value
                } else {
                    document.getElementById("userimg").src = URL.createObjectURL(document.getElementById("options.counter.avatar.file").files[0])
                }
            }
        this.setTitle = function () {
            document.getElementById("userName").innerHTML = document.getElementById("options.counter.title").value
        }
        this.setValue = function () {
            document.getElementById("counter").innerHTML = parseFloat(document.getElementById("options.counter.value").value)
            current = parseFloat(document.getElementById("options.counter.value").value)
            if (chart.series[0].points.length == 1500) chart.series[0].data[0].remove();
            chart.series[0].addPoint([Date.now(), Math.floor(current)])
        }
        var rate1 = 0;
        var rate2 = 0;
        var updatetime;
        this.setMin = function () {
            rate1 = document.getElementById("options.counter.rates.basicMinimum").value
        }
        this.setMax = function () {
            rate2 = document.getElementById("options.counter.rates.basicMaximum").value
        }
        this.setRate = function () {
            clearInterval(updatetime)
            var t = document.getElementById("options.counter.rates.mode.basic.baseUnit").value
            var e = document.getElementById("options.counter.rates.mode.basic.units").value
            if (e == "") { }
            else {
                if (t == "1") {
                    e = e * 1000
                    var a = e / 2
                    updatetime = setInterval(updateManager, e)
                    updatetime2 = setInterval(graphManager, a)
                } else if (t == "60") {
                    e = e * 60000
                    updatetime = setInterval(updateManager, e)
                    updatetime2 = setInterval(graphManager, a)
                } else if (t == "3600") {
                    e = e * 3.6e+6
                    updatetime = setInterval(updateManager, e)
                    updatetime2 = setInterval(graphManager, a)
                } else if (t == "86400") {
                    e = e * 8.64e+7
                    updatetime = setInterval(updateManager, e)
                    updatetime2 = setInterval(graphManager, a)
                }
            }
        }
        function updateManager() {
            var subs = parseFloat(current)
            var rate3 = 0;
            var rate4 = 0;
            if (document.getElementById('options.counter.rates.mode.basic.baseUnit2').value == "1") {
                rate3 = parseFloat(rate1)
                rate4 = parseFloat(rate2)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnit2').value == "60") {
                rate3 = parseFloat(rate1 / 60)
                rate4 = parseFloat(rate2 / 60)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnit2').value == "3600") {
                rate3 = parseFloat(rate1 / 3600)
                rate4 = parseFloat(rate2 / 3600)
            } else {
                rate3 = parseFloat(rate1 / 86400)
                rate4 = parseFloat(rate2 / 86400)
            }

            rate3 = parseFloat(rate3)
            rate4 = parseFloat(rate4)
            subs += random(rate3, rate4)
            if (subs == NaN) {
            } else {
                current = subs
            }
            document.getElementById("counter").innerHTML = Math.floor(subs)
        }
    }
}

function graphManager() {
    console.log(current)
    if (chart.series[0].points.length == 1500) chart.series[0].data[0].remove();
    chart.series[0].addPoint([Date.now(), Math.floor(current)])
}
const Interface = new LivecountseditInterface()
function submit() {
    Interface.setValue()
}

document.getElementById("options.counter.avatar.file").addEventListener('input', Interface.setAvatar)
document.getElementById("options.counter.avatar.url").addEventListener('input', Interface.setAvatar)
document.getElementById("options.counter.title").addEventListener('input', Interface.setTitle)
document.getElementById("options.counter.rates.basicMinimum").addEventListener('input', Interface.setMin)
document.getElementById("options.counter.rates.basicMaximum").addEventListener('input', Interface.setMax)
document.getElementById("options.counter.rates.mode.basic.units").addEventListener('input', Interface.setRate)
document.getElementById("options.counter.rates.mode.basic.baseUnit").addEventListener('change', Interface.setRate)
document.getElementById("options.counter.rates.mode.basic.baseUnit2").addEventListener('change', Interface.setRate)
document.getElementById("options-counter-type").addEventListener("change", () => {
    switch (document.getElementById("options-counter-type").value) {
        case "youtube":
            document.querySelector(".platform-icon").style.display = "inline";
            document.querySelector(".platform-icon").src = "youtube-icon.png";
            document.getElementById("SearchInput").placeholder = "Enter YouTube Username";
            document.getElementById("realtime-title").innerText = "Real Time YouTube Subscriber Count";
            document.getElementById("live-count-watermark").innerText = "YouTube Live Subscriber Count";
            document.getElementById("live-count-watermark").style.color = "#d64e33";
            document.getElementById("platform-plus-sign").style.backgroundColor = "#e62117";
            document.getElementById("userimg").style.border = "1px solid #e62117";
            break;
        case "twitch":
            document.querySelector(".platform-icon").style.display = "inline";
            document.querySelector(".platform-icon").src = "twitch-icon.png";
            document.getElementById("SearchInput").placeholder = "Enter Twitch Username";
            document.getElementById("realtime-title").innerText = "Real Time Twitch Follower Count";
            document.getElementById("live-count-watermark").innerText = "Twitch Live Follower Count";
            document.getElementById("live-count-watermark").style.color = "#3a0070";
            document.getElementById("platform-plus-sign").style.backgroundColor = "#7a31b3";
            document.getElementById("userimg").style.border = "1px solid #7a31b3";
            break;
        case "twitter":
            document.querySelector(".platform-icon").style.display = "inline";
            document.querySelector(".platform-icon").src = "twitter-icon.png";
            document.getElementById("SearchInput").placeholder = "Enter Twitter Username";
            document.getElementById("realtime-title").innerText = "Real Time Twitter Follower Count";
            document.getElementById("live-count-watermark").innerText = "Twitter Live Follower Count";
            document.getElementById("live-count-watermark").style.color = "#003a70";
            document.getElementById("platform-plus-sign").style.backgroundColor = "#317db3";
            document.getElementById("userimg").style.border = "1px solid #317db3";
            break;
        case "tiktok":
            document.querySelector(".platform-icon").style.display = "none";
            document.getElementById("SearchInput").placeholder = "Enter TikTok Username";
            document.getElementById("realtime-title").innerText = "Real Time TikTok Follower Count";
            document.getElementById("live-count-watermark").innerText = "TikTok Live Follower Count";
            document.getElementById("live-count-watermark").style.color = "#703d00";
            document.getElementById("platform-plus-sign").style.backgroundColor = "#ff4c74";
            document.getElementById("userimg").style.border = "1px solid #ff4c74";
            break;
        default:
            document.querySelector(".platform-icon").style.display = "none";
            document.getElementById("SearchInput").placeholder = "Enter Username";
            document.getElementById("realtime-title").innerText = "Real Time Count";
            document.getElementById("live-count-watermark").innerText = "Live Count";
            document.getElementById("live-count-watermark").style.color = "#703d00";
            document.getElementById("platform-plus-sign").style.backgroundColor = "#333333";
            document.getElementById("userimg").style.border = "1px solid #333333";
    }
})
document.getElementById("options-chart").addEventListener("change", () => {
    if (document.getElementById("options-chart").checked) {
        document.getElementById("chart").style.display = "block";
    } else {
        document.getElementById("chart").style.display = "none";
    }
})

function resetgraph() {

    chart = new Highcharts.chart({
        chart: {
            renderTo: 'chart',
            type: 'spline',
            zoomType: 'x',
            backgroundColor: 'transparent',
            plotBorderColor: 'transparent'
        },
        title: {
            text: ' '
        },
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 500,
            gridLineColor: textBright,
            labels: {
                style: {
                    color: textBright
                }
            },
            lineColor: lineColor,
            minorGridLineColor: '#bdbdbd',
            tickColor: lineColor,
            title: {
                style: {
                    color: textBright
                }
            }
        },
        yAxis: {
            enabled: false,
        },
        credits: {
            enabled: true,
            text: "Livecountsedit"
        },
        series: [{
            showInLegend: false,
            name: 'Subscribers',
            marker: { enabled: false },
            color: '#000000',
            lineColor: "#b3382c"
        }]
    });

}

function random(min, max) {
    return Math.random() * (max - min) + min
}
var textBright = "#bdbdbd"
var lineColor = "#000000"
var maxPoints = 20000;
var chart = new Highcharts.chart({
    chart: {
        renderTo: 'chart',
        type: 'spline',
        zoomType: 'x',
        backgroundColor: 'transparent',
        plotBorderColor: 'transparent'
    },
    title: {
        text: ' '
    },
    xAxis: {
        type: 'datetime',
        tickPixelInterval: 500,
        gridLineColor: textBright,
        labels: {
            style: {
                color: textBright
            }
        },
        lineColor: lineColor,
        minorGridLineColor: '#bdbdbd',
        tickColor: lineColor,
        title: {
            style: {
                color: textBright
            }
        }
    },
    yAxis: {
        visible: false,
    },
    credits: {
        enabled: true,
        text: "Livecountsedit"
    },

    series: [{
        showInLegend: false,
        name: 'Subscribers',
        marker: { enabled: false },
        color: '#b3382c',
        lineColor: '#b3382c'
    }]
});

function openmenu() {
    if (document.getElementById('settingsMenu').style.visibility == "visible") {
        document.getElementById('settingsMenu').style.visibility = "hidden"
    } else {
        document.getElementById('settingsMenu').style.visibility = "visible"
    }
}
document.getElementById('close').onclick = function () {
    document.getElementById('settingsMenu').style.visibility = "hidden"
}

// API Updates
let apiInterval;
let apiUpdates = localStorage.getItem('socialblade-apiUpdates') ? JSON.parse(localStorage.getItem('socialblade-apiUpdates')) : {
    enabled: false,
    url: '',
    interval: 10000,
    method: 'GET',
    body: {},
    headers: {},
    channelID: '',
    response: {
        loop: 'data',
        name: { enabled: false, path: '' },
        count: { enabled: false, path: '' },
        image: { enabled: false, path: '' },
        id: { path: 'id', IDIncludes: false }
    },
    forceUpdates: false
};

function abb(count) {
    const negative = count < 0;
    count = Math.round(Math.abs(count));
    if (count < 1000) {
        return negative ? `-${count}` : count.toString();
    } else {
        const abbreviations = "KMBT";
        const a = Math.floor(Math.log10(count)/3);
        return (negative ? "-" : "") + (count / (1000 ** a)).toFixed(1) + abbreviations[a-1];
    }
}

function saveAPIUpdates() {
    apiUpdates.channelID = document.getElementById('api-channelID').value;
    apiUpdates.url = document.getElementById('api-url').value;
    apiUpdates.method = document.getElementById('api-method').value;
    apiUpdates.forceUpdates = document.getElementById('api-forceUpdates').checked;
    
    let headers = document.getElementById('api-headers').value.toString().split(';').filter(x => x.trim());
    let newHeaders = {};
    for (let i = 0; i < headers.length; i++) {
        let header = headers[i].split(':').map(x => x.trim());
        if (header[1]) {
            newHeaders[header[0]] = header[1];
        }
    }
    apiUpdates.headers = newHeaders;
    
    let body = document.getElementById('api-body').value.toString().split(';').filter(x => x.trim());
    let newBody = {};
    for (let i = 0; i < body.length; i++) {
        let b = body[i].split(':').map(x => x.trim());
        if (b[1]) {
            newBody[b[0]] = b[1];
        }
    }
    apiUpdates.body = newBody;
    
    apiUpdates.response = {
        loop: document.getElementById('api-loop').value || 'data',
        name: {
            enabled: document.getElementById('api-updateName').checked,
            path: document.getElementById('api-pathName').value
        },
        count: {
            enabled: document.getElementById('api-updateCount').checked,
            path: document.getElementById('api-pathCount').value
        },
        image: {
            enabled: document.getElementById('api-updateImage').checked,
            path: document.getElementById('api-pathImage').value
        },
        id: {
            IDIncludes: document.getElementById('api-IDIncludes').checked,
            path: document.getElementById('api-pathID').value
        }
    };
    
    const intervalValue = parseFloat(document.getElementById('api-interval').value);
    apiUpdates.interval = intervalValue ? intervalValue * 1000 : 10000;
    
    localStorage.setItem('socialblade-apiUpdates', JSON.stringify(apiUpdates));
    alert('API Update Settings Saved');
    loadAPIUpdates();
}

function loadAPIUpdates() {
    if (document.getElementById('api-channelID')) document.getElementById('api-channelID').value = apiUpdates.channelID || '';
    if (document.getElementById('api-url')) document.getElementById('api-url').value = apiUpdates.url || '';
    if (document.getElementById('api-method')) document.getElementById('api-method').value = apiUpdates.method || 'GET';
    if (document.getElementById('api-loop')) document.getElementById('api-loop').value = apiUpdates.response.loop || 'data';
    if (document.getElementById('api-updateName')) document.getElementById('api-updateName').checked = apiUpdates.response.name.enabled || false;
    if (document.getElementById('api-pathName')) document.getElementById('api-pathName').value = apiUpdates.response.name.path || '';
    if (document.getElementById('api-updateCount')) document.getElementById('api-updateCount').checked = apiUpdates.response.count.enabled || false;
    if (document.getElementById('api-pathCount')) document.getElementById('api-pathCount').value = apiUpdates.response.count.path || '';
    if (document.getElementById('api-updateImage')) document.getElementById('api-updateImage').checked = apiUpdates.response.image.enabled || false;
    if (document.getElementById('api-pathImage')) document.getElementById('api-pathImage').value = apiUpdates.response.image.path || '';
    if (document.getElementById('api-pathID')) document.getElementById('api-pathID').value = apiUpdates.response.id.path || 'id';
    if (document.getElementById('api-IDIncludes')) document.getElementById('api-IDIncludes').checked = apiUpdates.response.id.IDIncludes || false;
    if (document.getElementById('api-forceUpdates')) document.getElementById('api-forceUpdates').checked = apiUpdates.forceUpdates || false;
    
    let headers = '';
    for (let key in apiUpdates.headers) {
        headers += key + ': ' + apiUpdates.headers[key] + ';\n';
    }
    if (document.getElementById('api-headers')) document.getElementById('api-headers').value = headers;
    
    let body = '';
    for (let key in apiUpdates.body) {
        body += key + ': ' + apiUpdates.body[key] + ';\n';
    }
    if (document.getElementById('api-body')) document.getElementById('api-body').value = body;
    
    if (document.getElementById('api-interval')) {
        document.getElementById('api-interval').value = apiUpdates.interval ? (apiUpdates.interval / 1000) : 10;
    }
    
    if (document.getElementById('enableApiUpdate')) {
        document.getElementById('enableApiUpdate').innerText = apiUpdates.enabled ? 'Disable API Updates' : 'Enable API Updates';
    }
}

function enableApiUpdate() {
    clearInterval(apiInterval);
    if (!apiUpdates.enabled) {
        if (!apiUpdates.channelID || !apiUpdates.url) {
            alert('Please configure API settings and channel ID first!');
            return;
        }
        apiUpdates.enabled = true;
        if (document.getElementById('enableApiUpdate')) {
            document.getElementById('enableApiUpdate').innerText = 'Disable API Updates';
        }
        apiInterval = setInterval(() => { apiUpdate(true); }, apiUpdates.interval);
        apiUpdate(true);
    } else {
        apiUpdates.enabled = false;
        if (document.getElementById('enableApiUpdate')) {
            document.getElementById('enableApiUpdate').innerText = 'Enable API Updates';
        }
        if (document.getElementById('apiStatusIndicator')) {
            document.getElementById('apiStatusIndicator').innerText = '--';
            document.getElementById('apiStatusIndicator').style.color = '#ffffff';
        }
    }
    localStorage.setItem('socialblade-apiUpdates', JSON.stringify(apiUpdates));
}

async function apiUpdate(bypass = false) {
    if (!apiUpdates.enabled) {
        if (!bypass) return alert("You need to enable API updates first.");
        return;
    }
    
    if (!apiUpdates.channelID || !apiUpdates.url) {
        if (!bypass) return alert("Please configure API URL and Channel ID first!");
        return;
    }
    
    try {
        let url = apiUpdates.url;
        url = url.includes('{{channelID}}') ? url.replace('{{channelID}}', apiUpdates.channelID) : url + apiUpdates.channelID;
        
        let fetchOptions = {
            method: apiUpdates.method || 'GET'
        };
        
        if (Object.keys(apiUpdates.headers).length > 0) {
            fetchOptions.headers = apiUpdates.headers;
        }
        
        if (apiUpdates.method === 'POST' && Object.keys(apiUpdates.body).length > 0) {
            fetchOptions.body = JSON.stringify(apiUpdates.body);
        }
        
        const response = await fetch(url, fetchOptions);
        const json = await response.json();
        
        let data = json;
        if (apiUpdates.response.loop !== 'data') {
            const loopPath = apiUpdates.response.loop.split('data.')[1];
            if (loopPath) {
                const parts = loopPath.split('.');
                for (const part of parts) {
                    data = data[part];
                }
            }
        }
        
        if (!Array.isArray(data)) {
            data = [data];
        }
        
        if (data.length === 0) {
            throw new Error('No data returned from API');
        }
        
        const item = data[0];
        let nameUpdate, countUpdate, imageUpdate, idUpdate;
        
        if (apiUpdates.response.name.enabled) {
            const pathParts = apiUpdates.response.name.path.split('.');
            let result = item;
            for (const part of pathParts) {
                if (part.includes('[')) {
                    const [arrName, index] = part.split('[');
                    const idx = parseInt(index.split(']')[0]);
                    result = result[arrName][idx];
                } else {
                    result = result[part];
                }
            }
            nameUpdate = result;
        }
        
        if (apiUpdates.response.count.enabled) {
            const pathParts = apiUpdates.response.count.path.split('.');
            let result = item;
            for (const part of pathParts) {
                if (part.includes('[')) {
                    const [arrName, index] = part.split('[');
                    const idx = parseInt(index.split(']')[0]);
                    result = result[arrName][idx];
                } else {
                    result = result[part];
                }
            }
            countUpdate = parseFloat(result);
        }
        
        if (apiUpdates.response.image.enabled) {
            const pathParts = apiUpdates.response.image.path.split('.');
            let result = item;
            for (const part of pathParts) {
                if (part.includes('[')) {
                    const [arrName, index] = part.split('[');
                    const idx = parseInt(index.split(']')[0]);
                    result = result[arrName][idx];
                } else {
                    result = result[part];
                }
            }
            imageUpdate = result;
        }
        
        const idPathParts = apiUpdates.response.id.path.split('.');
        let idResult = item;
        for (const part of idPathParts) {
            if (part.includes('[')) {
                const [arrName, index] = part.split('[');
                const idx = parseInt(index.split(']')[0]);
                idResult = idResult[arrName][idx];
            } else {
                idResult = idResult[part];
            }
        }
        idUpdate = idResult;
        
        if (apiUpdates.response.id.IDIncludes) {
            if (idUpdate && idUpdate.includes(apiUpdates.channelID)) {
                if (nameUpdate !== undefined) {
                    document.getElementById("options.counter.title").value = nameUpdate;
                    Interface.setTitle();
                }
                if (imageUpdate !== undefined) {
                    document.getElementById("options.counter.avatar.url").value = imageUpdate;
                    Interface.setAvatar();
                }
                if (countUpdate !== undefined) {
                    if (apiUpdates.forceUpdates || abb(countUpdate) !== abb(current)) {
                        current = countUpdate;
                        document.getElementById("counter").innerHTML = Math.floor(current);
                    }
                }
            }
        } else {
            if (idUpdate === apiUpdates.channelID) {
                if (nameUpdate !== undefined) {
                    document.getElementById("options.counter.title").value = nameUpdate;
                    Interface.setTitle();
                }
                if (imageUpdate !== undefined) {
                    document.getElementById("options.counter.avatar.url").value = imageUpdate;
                    Interface.setAvatar();
                }
                if (countUpdate !== undefined) {
                    if (apiUpdates.forceUpdates || abb(countUpdate) !== abb(current)) {
                        current = countUpdate;
                        document.getElementById("counter").innerHTML = Math.floor(current);
                    }
                }
            }
        }
        
        if (document.getElementById('apiStatusIndicator')) {
            document.getElementById('apiStatusIndicator').innerText = 'OK';
            document.getElementById('apiStatusIndicator').style.color = '#00ff00';
        }
    } catch (e) {
        console.error(e);
        if (document.getElementById('apiStatusIndicator')) {
            document.getElementById('apiStatusIndicator').innerText = 'Error';
            document.getElementById('apiStatusIndicator').style.color = '#ff0000';
        }
    }
}

// Load API updates on page load
window.onload = function () {
    if (document.getElementById('tabs.0')) document.getElementById('tabs.0').click();
    loadAPIUpdates();
    if (apiUpdates.enabled) {
        apiInterval = setInterval(() => { apiUpdate(true); }, apiUpdates.interval);
    }
}
