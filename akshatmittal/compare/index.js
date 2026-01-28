var current = 0;
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
            this.rickroll = function () {
                window.location.replace('https://youtu.be/dQw4w9WgXcQ')
            },

            this.setBanner = function () {
                if (!document.getElementById("options.counter.banner.file").files.length) {
                    if (!document.getElementById("options.counter.banner.url").value) return;
                    else document.getElementById("yt_cover_vs1").src = document.getElementById("options.counter.banner.url").value
                } else {
                    document.getElementById("yt_cover_vs1").src = URL.createObjectURL(document.getElementById("options.counter.banner.file").files[0])
                }
            },
            this.setAvatar = function () {
                if (!document.getElementById("options.counter.avatar.file").files.length) {
                    if (!document.getElementById("options.counter.avatar.url").value) return;
                    else document.getElementById("yt_profile_vs1").src = document.getElementById("options.counter.avatar.url").value
                } else {
                    document.getElementById("yt_profile_vs1").src = URL.createObjectURL(document.getElementById("options.counter.avatar.file").files[0])
                }
            }
        this.setTitle = function () {
            document.getElementById("yt_name_vs1").innerHTML = document.getElementById("options.counter.title").value
            document.getElementById("yt_brand_vs1").innerHTML = document.getElementById("options.counter.title").value
            document.getElementById("tweet1").innerHTML = document.getElementById("options.counter.title").value
        }
        this.setValue = function () {
            document.getElementById("yt_subs_vs1").innerHTML = parseFloat(document.getElementById("options.counter.value").value)
            current = parseFloat(document.getElementById("options.counter.value").value)
        }
        this.setFooter = function () {
            document.getElementById("count_name_1").innerHTML = document.getElementById("options.counter.footer").value
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
            document.getElementById("yt_subs_vs1").innerHTML = Math.floor(subs)
        }



//2sssssss

        this.setBanner2 = function () {
                if (!document.getElementById("options.counter.banner.file2").files.length) {
                    if (!document.getElementById("options.counter.banner.url2").value) return;
                    else document.getElementById("yt_cover_vs2").src = document.getElementById("options.counter.banner.url2").value
                } else {
                    document.getElementById("yt_cover_vs2").src = URL.createObjectURL(document.getElementById("options.counter.banner.file2").files[0])
                }
            },
            this.setAvatar2 = function () {
                if (!document.getElementById("options.counter.avatar.file2").files.length) {
                    if (!document.getElementById("options.counter.avatar.url2").value) return;
                    else document.getElementById("yt_profile_vs2").src = document.getElementById("options.counter.avatar.url2").value
                } else {
                    document.getElementById("yt_profile_vs2").src = URL.createObjectURL(document.getElementById("options.counter.avatar.file2").files[0])
                }
            }
        this.setTitle2 = function () {
            document.getElementById("yt_name_vs2").innerHTML = document.getElementById("options.counter.title2").value
            document.getElementById("yt_brand_vs2").innerHTML = document.getElementById("options.counter.title2").value
            document.getElementById("tweet2").innerHTML = document.getElementById("options.counter.title2").value
        }
        this.setValue2 = function () {
            document.getElementById("yt_subs_vs2").innerHTML = parseFloat(document.getElementById("options.counter.value2").value)
            current2 = parseFloat(document.getElementById("options.counter.value2").value)
        }
        this.setFooter2 = function () {
            document.getElementById("count_name_2").innerHTML = document.getElementById("options.counter.footer2").value
        }
        var rate12 = 0;
        var rate22 = 0;
        var updatetime2;
        this.setMin2 = function () {
            rate12 = document.getElementById("options.counter.rates.basicMinimum2").value
        }
        this.setMax2 = function () {
            rate22 = document.getElementById("options.counter.rates.basicMaximum2").value
        }
        this.setRate2 = function () {
            clearInterval(updatetime2)
            var t = document.getElementById("options.counter.rates.mode.basic.baseUnit3").value
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
        function updateManager2() {
            var subs = parseFloat(current2)
            var rate3 = 0;
            var rate4 = 0;
            if (document.getElementById('options.counter.rates.mode.basic.baseUnit4').value == "1") {
                rate3 = parseFloat(rate12)
                rate4 = parseFloat(rate22)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnit4').value == "60") {
                rate3 = parseFloat(rate12 / 60)
                rate4 = parseFloat(rate22 / 60)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnit4').value == "3600") {
                rate3 = parseFloat(rate12 / 3600)
                rate4 = parseFloat(rate22 / 3600)
            } else {
                rate3 = parseFloat(rate12 / 86400)
                rate4 = parseFloat(rate22 / 86400)
            }
            rate3 = parseFloat(rate3)
            rate4 = parseFloat(rate4)
            subs += random(rate3, rate4)
            if (subs == NaN) {
            } else {
                current2 = subs
            }
            document.getElementById("yt_subs_vs2").innerHTML = Math.floor(subs)
        }

        this.gaptitle = function () {
            document.getElementById("yt_diff_name").innerHTML = document.getElementById("gap.title").value
        }
        var gaptime = setInterval(gap,2000)
        this.gaptime = function () {
            clearInterval(gaptime)
            var t = document.getElementById("gap.time").value*1000
            gaptime = setInterval(gap,t)
        }
    }
}


function gap() {
    var diff = Math.floor(current - current2);
    document.getElementById("yt_diff").innerHTML = diff;

    var iconPath = "trophy-icon.png";
    var ytNameVs1 = document.getElementById("yt_name_vs1");
    var ytNameVs2 = document.getElementById("yt_name_vs2");

    if (ytNameVs1.querySelector("img.trophy-icon")) ytNameVs1.querySelector("img.trophy-icon").remove();
    if (ytNameVs2.querySelector("img.trophy-icon")) ytNameVs2.querySelector("img.trophy-icon").remove();

    if (diff > 0) {
        var img = document.createElement("img");
        img.src = iconPath;
        img.className = "trophy-icon";
        ytNameVs1.style.position = "relative";
        ytNameVs1.appendChild(img);
    } else if (diff < 0) {
        var img = document.createElement("img");
        img.src = iconPath;
        img.className = "trophy-icon";
        ytNameVs2.style.position = "relative";
        ytNameVs2.appendChild(img);
    }
}

const Interface = new LivecountseditInterface()
window.onload = function () {
    if (document.getElementById('tabs.0')) document.getElementById('tabs.0').click();
}
function submit() {
    Interface.setValue()
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
document.getElementById("options.counter.rates.basicMinimum").addEventListener('input', Interface.setMin)
document.getElementById("options.counter.rates.basicMaximum").addEventListener('input', Interface.setMax)
document.getElementById("options.counter.rates.mode.basic.units").addEventListener('input', Interface.setRate)
document.getElementById("options.counter.rates.mode.basic.baseUnit").addEventListener('change', Interface.setRate)
document.getElementById("options.counter.rates.mode.basic.baseUnit2").addEventListener('change', Interface.setRate)

document.getElementById("options.counter.banner.file2").addEventListener('input', Interface.setBanner2)
document.getElementById("options.counter.avatar.file2").addEventListener('input', Interface.setAvatar2)
document.getElementById("options.counter.banner.url2").addEventListener('input', Interface.setBanner2)
document.getElementById("options.counter.avatar.url2").addEventListener('input', Interface.setAvatar2)
document.getElementById("options.counter.title2").addEventListener('input', Interface.setTitle2)
document.getElementById("options.counter.footer2").addEventListener('input', Interface.setFooter2)
document.getElementById("options.counter.rates.basicMinimum2").addEventListener('input', Interface.setMin2)
document.getElementById("options.counter.rates.basicMaximum2").addEventListener('input', Interface.setMax2)
document.getElementById("options.counter.rates.mode.basic.units2").addEventListener('input', Interface.setRate2)
document.getElementById("options.counter.rates.mode.basic.baseUnit3").addEventListener('change', Interface.setRate2)
document.getElementById("options.counter.rates.mode.basic.baseUnit4").addEventListener('change', Interface.setRate2)

document.getElementById("gap.title").addEventListener('change', Interface.gaptitle)
document.getElementById("gap.time").addEventListener('change', Interface.gaptime)

function random(min, max) {
    return Math.random() * (max - min) + min
}

// API Updates - updates one channel (left or right) from API
let apiInterval;
let apiUpdates = localStorage.getItem('akshatmittal-compare-apiUpdates') ? JSON.parse(localStorage.getItem('akshatmittal-compare-apiUpdates')) : {
    enabled: false,
    url: '',
    interval: 10000,
    method: 'GET',
    body: {},
    headers: {},
    channelID: '',
    updateSide: '1',
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
    apiUpdates.updateSide = document.getElementById('api-updateSide').value;
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

    localStorage.setItem('akshatmittal-compare-apiUpdates', JSON.stringify(apiUpdates));
    alert('API Update Settings Saved');
    loadAPIUpdates();
}

function loadAPIUpdates() {
    if (document.getElementById('api-updateSide')) document.getElementById('api-updateSide').value = apiUpdates.updateSide || '1';
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
    localStorage.setItem('akshatmittal-compare-apiUpdates', JSON.stringify(apiUpdates));
}

function applyAPIUpdateToSide(nameUpdate, countUpdate, imageUpdate) {
    var side = apiUpdates.updateSide === '2' ? 2 : 1;
    if (side === 1) {
        if (nameUpdate !== undefined) {
            document.getElementById("options.counter.title").value = nameUpdate;
            Interface.setTitle();
        }
        if (imageUpdate !== undefined) {
            document.getElementById("options.counter.avatar.url").value = imageUpdate;
            Interface.setAvatar();
        }
        if (countUpdate !== undefined) {
            current = countUpdate;
            document.getElementById("options.counter.value").value = countUpdate;
            document.getElementById("yt_subs_vs1").innerHTML = Math.floor(countUpdate);
        }
    } else {
        if (nameUpdate !== undefined) {
            document.getElementById("options.counter.title2").value = nameUpdate;
            Interface.setTitle2();
        }
        if (imageUpdate !== undefined) {
            document.getElementById("options.counter.avatar.url2").value = imageUpdate;
            Interface.setAvatar2();
        }
        if (countUpdate !== undefined) {
            current2 = countUpdate;
            document.getElementById("options.counter.value2").value = countUpdate;
            document.getElementById("yt_subs_vs2").innerHTML = Math.floor(countUpdate);
        }
    }
    gap();
}

async function apiUpdate(bypass) {
    if (!apiUpdates.enabled && !bypass) {
        alert("You need to enable API updates first.");
        return;
    }
    if (!apiUpdates.channelID || !apiUpdates.url) {
        if (!bypass) alert("Please configure API URL and Channel ID first!");
        return;
    }

    try {
        var url = apiUpdates.url;
        url = url.indexOf('{{channelID}}') !== -1 ? url.replace('{{channelID}}', apiUpdates.channelID) : url + apiUpdates.channelID;

        var fetchOptions = {
            method: apiUpdates.method || 'GET'
        };

        if (Object.keys(apiUpdates.headers).length > 0) {
            fetchOptions.headers = apiUpdates.headers;
        }
        if (apiUpdates.method === 'POST' && Object.keys(apiUpdates.body).length > 0) {
            fetchOptions.body = JSON.stringify(apiUpdates.body);
        }

        var response = await fetch(url, fetchOptions);
        var json = await response.json();

        var data = json;
        if (apiUpdates.response.loop !== 'data') {
            var loopPath = apiUpdates.response.loop.split('data.')[1];
            if (loopPath) {
                var parts = loopPath.split('.');
                for (var i = 0; i < parts.length; i++) {
                    data = data[parts[i]];
                }
            }
        }

        if (!Array.isArray(data)) {
            data = [data];
        }
        if (data.length === 0) {
            throw new Error('No data returned from API');
        }

        var item = data[0];
        var nameUpdate, countUpdate, imageUpdate, idUpdate;

        if (apiUpdates.response.name.enabled && apiUpdates.response.name.path) {
            var pathParts = apiUpdates.response.name.path.split('.');
            var result = item;
            for (var p = 0; p < pathParts.length; p++) {
                var part = pathParts[p];
                if (part.indexOf('[') !== -1) {
                    var arrName = part.split('[')[0];
                    var idx = parseInt(part.split('[')[1].split(']')[0]);
                    result = result[arrName][idx];
                } else {
                    result = result[part];
                }
            }
            nameUpdate = result;
        }

        if (apiUpdates.response.count.enabled && apiUpdates.response.count.path) {
            pathParts = apiUpdates.response.count.path.split('.');
            result = item;
            for (p = 0; p < pathParts.length; p++) {
                part = pathParts[p];
                if (part.indexOf('[') !== -1) {
                    arrName = part.split('[')[0];
                    idx = parseInt(part.split('[')[1].split(']')[0]);
                    result = result[arrName][idx];
                } else {
                    result = result[part];
                }
            }
            countUpdate = parseFloat(result);
        }

        if (apiUpdates.response.image.enabled && apiUpdates.response.image.path) {
            pathParts = apiUpdates.response.image.path.split('.');
            result = item;
            for (p = 0; p < pathParts.length; p++) {
                part = pathParts[p];
                if (part.indexOf('[') !== -1) {
                    arrName = part.split('[')[0];
                    idx = parseInt(part.split('[')[1].split(']')[0]);
                    result = result[arrName][idx];
                } else {
                    result = result[part];
                }
            }
            imageUpdate = result;
        }

        pathParts = apiUpdates.response.id.path.split('.');
        result = item;
        for (p = 0; p < pathParts.length; p++) {
            part = pathParts[p];
            if (part.indexOf('[') !== -1) {
                arrName = part.split('[')[0];
                idx = parseInt(part.split('[')[1].split(']')[0]);
                result = result[arrName][idx];
            } else {
                result = result[part];
            }
        }
        idUpdate = result;

        var match = apiUpdates.response.id.IDIncludes ? (idUpdate && idUpdate.indexOf(apiUpdates.channelID) !== -1) : (idUpdate === apiUpdates.channelID);
        if (match) {
            var currentVal = apiUpdates.updateSide === '2' ? current2 : current;
            if (countUpdate !== undefined && !apiUpdates.forceUpdates && abb(countUpdate) === abb(currentVal)) {
                if (document.getElementById('apiStatusIndicator')) {
                    document.getElementById('apiStatusIndicator').innerText = 'OK';
                    document.getElementById('apiStatusIndicator').style.color = '#00ff00';
                }
                return;
            }
            applyAPIUpdateToSide(nameUpdate, countUpdate, imageUpdate);
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

loadAPIUpdates();
if (apiUpdates.enabled) {
    apiInterval = setInterval(function () { apiUpdate(true); }, apiUpdates.interval);
}