var current = 0;
var current1 = 0;
var current2 = 0;
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
            this.setBanner = function () {
                if (!document.getElementById("options.counter.banner.file").files.length) {
                    if (!document.getElementById("options.counter.banner.url").value) return;
                    else document.getElementById("yt_cover").src = document.getElementById("options.counter.banner.url").value
                } else {
                    document.getElementById("yt_cover").src = URL.createObjectURL(document.getElementById("options.counter.banner.file").files[0])
                }
            },
            this.setAvatar = function () {
                if (!document.getElementById("options.counter.avatar.file").files.length) {
                    if (!document.getElementById("options.counter.avatar.url").value) return;
                    else document.getElementById("yt_profile").src = document.getElementById("options.counter.avatar.url").value
                } else {
                    document.getElementById("yt_profile").src = URL.createObjectURL(document.getElementById("options.counter.avatar.file").files[0])
                }
            }
        this.setTitle = function () {
            document.getElementById("yt_name").innerHTML = document.getElementById("options.counter.title").value
        }
        this.setValue = function () {
            document.getElementById("yt_subs").innerHTML = parseFloat(document.getElementById("options.counter.value").value)
            current = parseFloat(document.getElementById("options.counter.value").value)
        }
        this.setValue1 = function () {
            document.getElementById("yt_views").innerHTML = parseFloat(document.getElementById("options.counter.value1").value)
            current1 = parseFloat(document.getElementById("options.counter.value1").value)
        }
        this.setValue2 = function () {
            document.getElementById("yt_videos").innerHTML = parseFloat(document.getElementById("options.counter.value2").value)
            current2 = parseFloat(document.getElementById("options.counter.value2").value)
        }
        this.setFooter = function () {
            document.getElementById("footer").innerHTML = document.getElementById("options.counter.footer").value
        }
        this.setFooter1 = function () {
            document.getElementById("footer1").innerHTML = document.getElementById("options.counter.footer1").value
        }
        this.setFooter2 = function () {
            document.getElementById("footer2").innerHTML = document.getElementById("options.counter.footer2").value
        }
        var rate1 = 0;
        var rate2 = 0;
        var rate3 = 0;
        var rate4 = 0;
        var rate5 = 0;
        var rate6 = 0;
        var updatetime;
        var updatetime1;
        var updatetime2;
        this.setMin = function () {
            rate1 = document.getElementById("options.counter.rates.basicMinimum").value
        }
        this.setMax = function () {
            rate2 = document.getElementById("options.counter.rates.basicMaximum").value
        }
        this.setMin1 = function () {
            rate3 = document.getElementById("options.counter.rates.basicMinimum1").value
        }
        this.setMax1 = function () {
            rate4 = document.getElementById("options.counter.rates.basicMaximum1").value
        }
        this.setMin2 = function () {
            rate5 = document.getElementById("options.counter.rates.basicMinimum2").value
        }
        this.setMax2 = function () {
            rate6 = document.getElementById("options.counter.rates.basicMaximum2").value
        }
        this.setRate = function () {
            clearInterval(updatetime)
            var t = document.getElementById("options.counter.rates.mode.basic.baseUnit").value
            var e = document.getElementById("options.counter.rates.mode.basic.units").value
            if (e == "") { }
            else {
                if (t == "1") {
                    e = e * 1000
                    updatetime = setInterval(updateManager, e)
                } else if (t == "60") {
                    e = e * 60000
                    updatetime = setInterval(updateManager, e)
                } else if (t == "3600") {
                    e = e * 3.6e+6
                    updatetime = setInterval(updateManager, e)
                } else if (t == "86400") {
                    e = e * 8.64e+7
                    updatetime = setInterval(updateManager, e)
                }
            }
        }
        this.setRate1 = function () {
            clearInterval(updatetime1)
            var t = document.getElementById("options.counter.rates.mode.basic.baseUnit1").value
            var e = document.getElementById("options.counter.rates.mode.basic.units1").value
            if (e == "") { }
            else {
                if (t == "1") {
                    e = e * 1000
                    updatetime1 = setInterval(updateManager1, e)
                } else if (t == "60") {
                    e = e * 60000
                    updatetime1 = setInterval(updateManager1, e)
                } else if (t == "3600") {
                    e = e * 3.6e+6
                    updatetime1 = setInterval(updateManager1, e)
                } else if (t == "86400") {
                    e = e * 8.64e+7
                    updatetime1 = setInterval(updateManager1, e)
                }
            }
        }
        this.setRate2 = function () {
            clearInterval(updatetime2)
            var t = document.getElementById("options.counter.rates.mode.basic.baseUnit2").value
            var e = document.getElementById("options.counter.rates.mode.basic.units2").value
            if (e == "") { }
            else {
                if (t == "1") {
                    e = e * 1000
                    updatetime2 = setInterval(updateManager2, e)
                } else if (t == "60") {
                    e = e * 60000
                    updatetime2 = setInterval(updateManager2, e)
                } else if (t == "3600") {
                    e = e * 3.6e+6
                    updatetime2 = setInterval(updateManager2, e)
                } else if (t == "86400") {
                    e = e * 8.64e+7
                    updatetime2 = setInterval(updateManager2, e)
                }
            }
        }
        function updateManager() {
            var subs = parseFloat(current)
            var rate11 = 0;
            var rate22 = 0;
            if (document.getElementById('options.counter.rates.mode.basic.baseUnitt').value == "1") {
                rate11 = parseFloat(rate1)
                rate22 = parseFloat(rate2)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnitt').value == "60") {
                rate11 = parseFloat(rate1 / 60)
                rate22 = parseFloat(rate2 / 60)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnitt').value == "3600") {
                rate11 = parseFloat(rate1 / 3600)
                rate22 = parseFloat(rate2 / 3600)
            } else {
                rate11 = parseFloat(rate1 / 86400)
                rate22 = parseFloat(rate2 / 86400)
            }
            rate11 = parseFloat(rate11)
            rate22 = parseFloat(rate22)
            subs += random(rate11, rate22)
            if (subs == NaN) {
            } else {
                current = subs
            }
            document.getElementById("yt_subs").innerHTML = Math.floor(subs)

        }
        function updateManager1() {
            var subs = parseFloat(current1)
            var rate11 = 0;
            var rate22 = 0;
            if (document.getElementById('options.counter.rates.mode.basic.baseUnit11').value == "1") {
                rate11 = parseFloat(rate3)
                rate22 = parseFloat(rate4)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnit11').value == "60") {
                rate11 = parseFloat(rate3 / 60)
                rate22 = parseFloat(rate4 / 60)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnit11').value == "3600") {
                rate11 = parseFloat(rate3 / 3600)
                rate22 = parseFloat(rate4 / 3600)
            } else {
                rate11 = parseFloat(rate3 / 86400)
                rate22 = parseFloat(rate4 / 86400)
            }
            rate11 = parseFloat(rate11)
            rate22 = parseFloat(rate22)
            subs += random(rate11, rate22)
            if (subs == NaN) {
            } else {
                current1 = subs
            }
            document.getElementById("yt_views").innerHTML = Math.floor(subs)

        }
        function updateManager2() {
            var subs = parseFloat(current2)
            var rate11 = 0;
            var rate22 = 0;
            if (document.getElementById('options.counter.rates.mode.basic.baseUnit2').value == "1") {
                rate11 = parseFloat(rate5)
                rate22 = parseFloat(rate6)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnit2').value == "60") {
                rate11 = parseFloat(rate5 / 60)
                rate22 = parseFloat(rate6 / 60)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnit2').value == "3600") {
                rate11 = parseFloat(rate5 / 3600)
                rate22 = parseFloat(rate6 / 3600)
            } else {
                rate11 = parseFloat(rate5 / 86400)
                rate22 = parseFloat(rate6 / 86400)
            }
            rate11 = parseFloat(rate11)
            rate22 = parseFloat(rate22)
            subs += random(rate11, rate22)
            if (subs == NaN) {
            } else {
                current2 = subs
            }
            document.getElementById("yt_videos").innerHTML = Math.floor(subs)

        }
    }
}

const Interface = new LivecountseditInterface()
function submit() {
    Interface.setValue()
}
function submit1() {
    Interface.setValue1()
}
function submit2() {
    Interface.setValue2()
}
document.getElementById("options.counter.banner.file").addEventListener('input', Interface.setBanner)
document.getElementById("options.counter.avatar.file").addEventListener('input', Interface.setAvatar)
document.getElementById("options.counter.banner.url").addEventListener('input', Interface.setBanner)
document.getElementById("options.counter.avatar.url").addEventListener('input', Interface.setAvatar)
document.getElementById("options.counter.title").addEventListener('input', Interface.setTitle)
document.getElementById("options.counter.footer").addEventListener('input', Interface.setFooter)
document.getElementById("options.counter.footer1").addEventListener('input', Interface.setFooter1)
document.getElementById("options.counter.footer2").addEventListener('input', Interface.setFooter2)

document.getElementById("options.counter.rates.basicMinimum").addEventListener('input', Interface.setMin)
document.getElementById("options.counter.rates.basicMaximum").addEventListener('input', Interface.setMax)
document.getElementById("options.counter.rates.basicMinimum1").addEventListener('input', Interface.setMin1)
document.getElementById("options.counter.rates.basicMaximum1").addEventListener('input', Interface.setMax1)
document.getElementById("options.counter.rates.basicMinimum2").addEventListener('input', Interface.setMin2)
document.getElementById("options.counter.rates.basicMaximum2").addEventListener('input', Interface.setMax2)
document.getElementById("options.counter.rates.mode.basic.units").addEventListener('input', Interface.setRate)
document.getElementById("options.counter.rates.mode.basic.units1").addEventListener('input', Interface.setRate1)
document.getElementById("options.counter.rates.mode.basic.units2").addEventListener('input', Interface.setRate2)
document.getElementById("options.counter.rates.mode.basic.baseUnit").addEventListener('change', Interface.setRate)
document.getElementById("options.counter.rates.mode.basic.baseUnitt").addEventListener('change', Interface.setRate)
document.getElementById("options.counter.rates.mode.basic.baseUnit1").addEventListener('change', Interface.setRate1)
document.getElementById("options.counter.rates.mode.basic.baseUnit11").addEventListener('change', Interface.setRate1)
document.getElementById("options.counter.rates.mode.basic.baseUnit2").addEventListener('change', Interface.setRate2)
document.getElementById("options.counter.rates.mode.basic.baseUnit22").addEventListener('change', Interface.setRate2)
function random(min, max) {
    return Math.random() * (max - min) + min
}

function hidenav() {
    if (document.querySelector("#main-wrapper > aside").style.visibility == "hidden") {
        document.querySelector("#main-wrapper > aside").style.visibility = "visible"
    } else {
        document.querySelector("#main-wrapper > aside").style.visibility = "hidden"
    }
}

// API Updates
let apiInterval;
let apiUpdates = localStorage.getItem('akshatmittal-apiUpdates') ? JSON.parse(localStorage.getItem('akshatmittal-apiUpdates')) : {
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
    
    localStorage.setItem('akshatmittal-apiUpdates', JSON.stringify(apiUpdates));
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
    localStorage.setItem('akshatmittal-apiUpdates', JSON.stringify(apiUpdates));
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
                        document.getElementById("yt_subs").innerHTML = Math.floor(current);
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
                        document.getElementById("yt_subs").innerHTML = Math.floor(current);
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
if (window.onload) {
    const originalOnload = window.onload;
    window.onload = function() {
        originalOnload();
        loadAPIUpdates();
        if (apiUpdates.enabled) {
            apiInterval = setInterval(() => { apiUpdate(true); }, apiUpdates.interval);
        }
    };
} else {
    window.onload = function() {
        if (document.getElementById('tabs.0')) document.getElementById('tabs.0').click();
        loadAPIUpdates();
        if (apiUpdates.enabled) {
            apiInterval = setInterval(() => { apiUpdate(true); }, apiUpdates.interval);
        }
    };
}