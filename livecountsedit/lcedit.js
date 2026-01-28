let chart;
const saveType = 1;

defaultCounter = Object.assign(defaultCounter, {
    bannerURL: "https://lcedit.com/default_banner.png",
    bgColor: "#222233",
    chartCreditsEnabled: true,
    counterColor: "#ffffff",
    downColor: "#ffffff",
    footer: "Subscribers",
    footerColor: "#ffffff",
    imageURL: "https://lcedit.com/default.png",
    showBanner: true,
    showChart: true,
    showChartGrid: true,
    showFooter: true,
    titleColor: "#ffffff",
    upColor: "#ffffff"
})

let odometers = [];

let saveData = new Save(saveType)
saveData.counters.push(new Counter(1))
counter = saveData.counters[0];

window.onload = function () {
    chart = new Highcharts.chart(getChartOptions());
    if (localStorage.getItem('lcedit-lcedit')) {
        importFromJSON(localStorage.getItem('lcedit-lcedit'), true)
    }
    async function initMenu() {
        const r = await fetch("./lcedit.json");
        const data = await r.json();
        drawMenu(data, document.querySelector(".tab-buttons"), document.querySelector(".tab-stuff"));
    }
    initMenu().then(() => {
        if (document.getElementById('tab-link-0')) document.getElementById('tab-link-0').click();
        fillForms();
        refreshCount();
        updateGainType(counter.settings.gainType);
        document.querySelector('#gainType').addEventListener('input', event => {
            updateGainType(event.target.value);
        })
        updateFontType(counter.settings.fontType);
        document.querySelector('#fontType').addEventListener('input', event => {
            updateFontType(event.target.value);
        })
        let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
        let tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        })
        loadAPIUpdates();
        if (saveData.apiUpdates && saveData.apiUpdates.enabled) {
            apiInterval = setInterval(() => { apiUpdate(true); }, saveData.apiUpdates.interval);
        }
        updateStuff();
    }).catch(error => {
        console.error(error);
        alert("There was an error when loading the options menu.");
    })
}

document.querySelector('#import-data-v7').addEventListener('input', () => {
    if (document.querySelector('#import-data-v7').files[0]) {
        document.querySelector('#import-data-v7').files[0].text().then(data => {
            importFromJSON(data)
            document.querySelector('#import-data-v7').value = null;
        })
    }
})

function fillForms() {
    LCEDIT.util.fillForms(document.querySelectorAll("form.counter-form"), counter.settings)
    LCEDIT.util.fillForms(document.querySelectorAll("form.api-form"), saveData.api)
}

function submit() {
    const result = LCEDIT.util.submitForms(document.querySelectorAll("form.counter-form"), defaultCounter)
    if (result.success) {
        if (result.data.updateInterval) saveData.updateInterval = result.data.updateInterval;
        let ready = 0;
        if (!result.files) {
            saveData.counters[0].updateSettings(result.data);
            updateStuff()
        } else {
            addEventListener('fileReady', () => {
                ready++
                if (ready === result.files) {
                    saveData.counters[0].updateSettings(result.data);
                    updateStuff()
                }
            })
        }
        saveInBrowser()
    } else {
        document.getElementById(result.problematicForm.id.replace('settingsForm','tab-link')).click();
        result.problematicForm.reportValidity()
    }
}

let apiInterval;

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
    if (!saveData.apiUpdates) {
        saveData.apiUpdates = {
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
    }
    
    saveData.apiUpdates.channelID = document.getElementById('channelID').value;
    saveData.apiUpdates.url = document.getElementById('apiURL').value;
    saveData.apiUpdates.method = document.getElementById('apiMethod').value;
    saveData.apiUpdates.forceUpdates = document.getElementById('forceUpdates').checked;
    
    let headers = document.getElementById('extraCred').value.toString().split(';').filter(x => x.trim());
    let newHeaders = {};
    for (let i = 0; i < headers.length; i++) {
        let header = headers[i].split(':').map(x => x.trim());
        if (header[1]) {
            newHeaders[header[0]] = header[1];
        }
    }
    saveData.apiUpdates.headers = newHeaders;
    
    let body = document.getElementById('body').value.toString().split(';').filter(x => x.trim());
    let newBody = {};
    for (let i = 0; i < body.length; i++) {
        let b = body[i].split(':').map(x => x.trim());
        if (b[1]) {
            newBody[b[0]] = b[1];
        }
    }
    saveData.apiUpdates.body = newBody;
    
    saveData.apiUpdates.response = {
        loop: document.getElementById('apiLoop').value || 'data',
        name: {
            enabled: document.getElementById('updateName').checked,
            path: document.getElementById('pathName').value
        },
        count: {
            enabled: document.getElementById('updateCount').checked,
            path: document.getElementById('pathCount').value
        },
        image: {
            enabled: document.getElementById('updateImage').checked,
            path: document.getElementById('pathImage').value
        },
        id: {
            IDIncludes: document.getElementById('IDIncludes').checked,
            path: document.getElementById('pathID').value
        }
    };
    
    const intervalValue = parseFloat(document.getElementById('apiUpdateInt').value);
    saveData.apiUpdates.interval = intervalValue ? intervalValue * 1000 : 10000;
    
    saveInBrowser();
    alert('API Update Settings Saved');
    loadAPIUpdates();
}

function loadAPIUpdates() {
    if (!saveData.apiUpdates) {
        saveData.apiUpdates = {
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
    }
    
    if (document.getElementById('channelID')) document.getElementById('channelID').value = saveData.apiUpdates.channelID || '';
    if (document.getElementById('apiURL')) document.getElementById('apiURL').value = saveData.apiUpdates.url || '';
    if (document.getElementById('apiMethod')) document.getElementById('apiMethod').value = saveData.apiUpdates.method || 'GET';
    if (document.getElementById('apiLoop')) document.getElementById('apiLoop').value = saveData.apiUpdates.response.loop || 'data';
    if (document.getElementById('updateName')) document.getElementById('updateName').checked = saveData.apiUpdates.response.name.enabled || false;
    if (document.getElementById('pathName')) document.getElementById('pathName').value = saveData.apiUpdates.response.name.path || '';
    if (document.getElementById('updateCount')) document.getElementById('updateCount').checked = saveData.apiUpdates.response.count.enabled || false;
    if (document.getElementById('pathCount')) document.getElementById('pathCount').value = saveData.apiUpdates.response.count.path || '';
    if (document.getElementById('updateImage')) document.getElementById('updateImage').checked = saveData.apiUpdates.response.image.enabled || false;
    if (document.getElementById('pathImage')) document.getElementById('pathImage').value = saveData.apiUpdates.response.image.path || '';
    if (document.getElementById('pathID')) document.getElementById('pathID').value = saveData.apiUpdates.response.id.path || 'id';
    if (document.getElementById('IDIncludes')) document.getElementById('IDIncludes').checked = saveData.apiUpdates.response.id.IDIncludes || false;
    if (document.getElementById('forceUpdates')) document.getElementById('forceUpdates').checked = saveData.apiUpdates.forceUpdates || false;
    
    let headers = '';
    for (let key in saveData.apiUpdates.headers) {
        headers += key + ': ' + saveData.apiUpdates.headers[key] + ';\n';
    }
    if (document.getElementById('extraCred')) document.getElementById('extraCred').value = headers;
    
    let body = '';
    for (let key in saveData.apiUpdates.body) {
        body += key + ': ' + saveData.apiUpdates.body[key] + ';\n';
    }
    if (document.getElementById('body')) document.getElementById('body').value = body;
    
    if (document.getElementById('apiUpdateInt')) {
        document.getElementById('apiUpdateInt').value = saveData.apiUpdates.interval ? (saveData.apiUpdates.interval / 1000) : 10;
    }
    
    if (document.getElementById('enableApiUpdate')) {
        document.getElementById('enableApiUpdate').innerText = saveData.apiUpdates.enabled ? 'Disable API Updates' : 'Enable API Updates';
    }
}

function enableApiUpdate() {
    clearInterval(apiInterval);
    if (!saveData.apiUpdates || !saveData.apiUpdates.enabled) {
        if (!saveData.apiUpdates || !saveData.apiUpdates.channelID || !saveData.apiUpdates.url) {
            alert('Please configure API settings and channel ID first!');
            return;
        }
        saveData.apiUpdates.enabled = true;
        if (document.getElementById('enableApiUpdate')) {
            document.getElementById('enableApiUpdate').innerText = 'Disable API Updates';
        }
        apiInterval = setInterval(() => { apiUpdate(true); }, saveData.apiUpdates.interval);
        apiUpdate(true);
    } else {
        saveData.apiUpdates.enabled = false;
        if (document.getElementById('enableApiUpdate')) {
            document.getElementById('enableApiUpdate').innerText = 'Enable API Updates';
        }
        if (document.getElementById('apiStatusIndicator')) {
            document.getElementById('apiStatusIndicator').innerText = '--';
            document.getElementById('apiStatusIndicator').style.color = '#ffffff';
        }
    }
    saveInBrowser();
}

async function apiUpdate(bypass = false) {
    if (!saveData.apiUpdates || !saveData.apiUpdates.enabled) {
        if (!bypass) return alert("You need to enable API updates first.");
        return;
    }
    
    if (!saveData.apiUpdates.channelID || !saveData.apiUpdates.url) {
        if (!bypass) return alert("Please configure API URL and Channel ID first!");
        return;
    }
    
    try {
        let url = saveData.apiUpdates.url;
        url = url.includes('{{channelID}}') ? url.replace('{{channelID}}', saveData.apiUpdates.channelID) : url + saveData.apiUpdates.channelID;
        
        let fetchOptions = {
            method: saveData.apiUpdates.method || 'GET'
        };
        
        if (Object.keys(saveData.apiUpdates.headers).length > 0) {
            fetchOptions.headers = saveData.apiUpdates.headers;
        }
        
        if (saveData.apiUpdates.method === 'POST' && Object.keys(saveData.apiUpdates.body).length > 0) {
            fetchOptions.body = JSON.stringify(saveData.apiUpdates.body);
        }
        
        const response = await fetch(url, fetchOptions);
        const json = await response.json();
        
        let data = json;
        if (saveData.apiUpdates.response.loop !== 'data') {
            const loopPath = saveData.apiUpdates.response.loop.split('data.')[1];
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
        
        if (saveData.apiUpdates.response.name.enabled) {
            const pathParts = saveData.apiUpdates.response.name.path.split('.');
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
        
        if (saveData.apiUpdates.response.count.enabled) {
            const pathParts = saveData.apiUpdates.response.count.path.split('.');
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
        
        if (saveData.apiUpdates.response.image.enabled) {
            const pathParts = saveData.apiUpdates.response.image.path.split('.');
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
        
        const idPathParts = saveData.apiUpdates.response.id.path.split('.');
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
        
        if (saveData.apiUpdates.response.id.IDIncludes) {
            if (idUpdate && idUpdate.includes(saveData.apiUpdates.channelID)) {
                if (nameUpdate !== undefined) counter.settings.title = nameUpdate;
                if (imageUpdate !== undefined) counter.settings.imageURL = imageUpdate;
                if (countUpdate !== undefined) {
                    if (saveData.apiUpdates.forceUpdates || abb(countUpdate) !== abb(counter.getApparentCount())) {
                        counter.setCount(countUpdate);
                    }
                }
            }
        } else {
            if (idUpdate === saveData.apiUpdates.channelID) {
                if (nameUpdate !== undefined) counter.settings.title = nameUpdate;
                if (imageUpdate !== undefined) counter.settings.imageURL = imageUpdate;
                if (countUpdate !== undefined) {
                    if (saveData.apiUpdates.forceUpdates || abb(countUpdate) !== abb(counter.getApparentCount())) {
                        counter.setCount(countUpdate);
                    }
                }
            }
        }
        
        updateStuff();
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

function submitAPI() {
    saveAPIUpdates();
}

function updateStuff() {
    clearInterval(saveData.updater);
    odometers = Odometer.init();
    odometers[0].options = {
        animation: ['default','byDigit','count', 'minimal'][counter.settings.animationType],
        downColor: counter.settings.downColor,
        duration: counter.settings.animationDuration * 1000,
        removeLeadingZeros: counter.settings.animationType === 1,
        reverseAnimation: counter.settings.reverseAnimation,
        format: counter.settings.numberFormat || ",ddd",
        upColor: counter.settings.upColor
    }
    odometers[0].render();
    document.querySelector('#counter-banner').src = counter.settings.bannerURL;
    document.querySelector('#counter-avatar').src = counter.settings.imageURL;
    saveData.allowHTML ? document.querySelector('#counter-title').innerHTML = counter.settings.title : document.querySelector('#counter-title').innerText = counter.settings.title
    document.querySelector('#counter-title').style.color = counter.settings.titleColor;
    saveData.allowHTML ? document.querySelector('#counter-footer').innerHTML = counter.settings.footer : document.querySelector('#counter-footer').innerText = counter.settings.footer
    document.querySelector('#counter-footer').style.color = counter.settings.footerColor;
    document.querySelector('#counter-counter').innerText = counter.getApparentCount();
    document.querySelector('.counter-container').style.color = counter.settings.counterColor;
    document.querySelector('.counter-content').style.backgroundColor = counter.settings.bgColor;
    document.querySelector('.counter-area').style.backgroundColor = counter.settings.bgColor;
    LCEDIT.util.setVisibleKeepSpace(document.querySelector('#counter-banner'), counter.settings.showBanner)
    LCEDIT.util.setVisible(document.querySelector('#counter-avatar'), counter.settings.showImage, 'inline-block')
    LCEDIT.util.setVisible(document.querySelector('#counter-chart'), counter.settings.showChart)
    LCEDIT.util.setVisible(document.querySelector('#counter-footer'), counter.settings.showFooter)
    document.querySelector('#counter-banner').style.filter = `blur(${counter.settings.bannerBlur}px)`
    loadMyFont();
    toggleFullScreen(saveData.isFullScreen);
    if (counter.settings.showChart) chart.update(getChartOptions());
    updateCounter();
    if (!saveData.paused) saveData.updater = setInterval(updateCounter, saveData.updateInterval * 1000)
}

function getCounterData() {
    return counter.chartData
}

function getChartOptions() {
    return {
        chart: {
            renderTo: "counter-chart",
            type: "spline",
            zoomType: "x",
            backgroundColor: "transparent",
            plotBorderColor: "transparent"
        },
        title: {
            text: ""
        },
        xAxis: {
            type: "datetime",
            visible: counter.settings.showChartGrid,
            gridLineColor: counter.settings.chartGridColor,
            lineColor: counter.settings.chartGridColor,
            minorGridLineColor: counter.settings.chartGridColor,
            minorTickColor: counter.settings.chartGridColor,
            tickColor: counter.settings.chartGridColor,
            title: {
                text: ""
            },
            labels: {
                style: {
                    color: counter.settings.chartGridColor
                }
            }
        },
        yAxis: {
            gridLineColor: counter.settings.chartGridColor,
            visible: counter.settings.showChartGrid,
            lineColor: counter.settings.chartGridColor,
            minorGridLineColor: counter.settings.chartGridColor,
            minorTickColor: counter.settings.chartGridColor,
            tickColor: counter.settings.chartGridColor,
            title: {
                text: ""
            },
            labels: {
                style: {
                    color: counter.settings.chartGridColor
                }
            }
        },
        credits: {
            enabled: counter.settings.chartCreditsEnabled,
            text: "lcedit.com",
            style: {
                color: counter.settings.chartGridColor
            }
        },
        series: [{
            showInLegend: false,
            name: counter.settings.footer,
            marker: { enabled: false },
            color: counter.settings.chartColor,
            lineColor: counter.settings.chartColor,
            data: getCounterData()
        }]
    }
}

function updateCounter() {
    counter.update();
    console.log('Counter updated')
    document.querySelector('#counter-counter').innerText = counter.getApparentCount();
    while (chart.series[0].data.length >= counter.settings.maxChartValues) {
        chart.series[0].removePoint(0)
    }
    chart.series[0].addPoint([Date.now(), counter.getApparentCount()]);
    counter.chartData = chart.series[0].data.map(x => [x.x, x.y])
}

function reset(bypass = false) {
    if (bypass || confirm("Are you sure you want to reset everything?")) {
        clearInterval(saveData.updater);
        clearInterval(apiInterval);
        if (document.getElementById('apiStatusIndicator')) {
            document.getElementById('apiStatusIndicator').innerText = "--"
            document.getElementById('apiStatusIndicator').style.color = "#ffffff"
        }
        resetChart(true)
        saveData = new Save(saveType)
        saveData.counters[0] = counter = new Counter(1);
        fillForms()
        loadAPIUpdates()
        updateStuff()
        setPaused(false)
    }
}

function resetChart(bypass = false) {
    if (bypass || confirm("Are you sure you want to reset the chart?")) {
        chart.series[0].setData([]);
    }
}

function updateGainType(v) {
    for (i = 0; i < 3; i++) {
        const g = document.querySelectorAll(`.gain-${i}`)
        for (j = 0; j < g.length; j++) {
            LCEDIT.util.setVisible(g[j], i == v);
            const k = g[j].querySelector('input,textarea')
            if (k) k.disabled = (i != v)
        }
    }
}

function updateFontType(v) {
    LCEDIT.util.setVisible(document.querySelector(".custom-font-input"), (v == 5 || v == 6));
}

function loadMyFont() {
    let font;
    switch (counter.settings.fontType) {
        case 1:
            font = "serif";
            break;
        case 2:
            font = "sans-serif";
            break;
        case 3:
            font = "monospace";
            break;
        case 4:
            font = "math";
            break;
        case 5:
            font = counter.settings.font;
            break;
        case 6:
            if (!document.getElementById(`font-${counter.settings.font}`)) {
                const fontStuff = document.createElement("link");
                fontStuff.href = `https://fonts.googleapis.com/css?family=${encodeURIComponent(counter.settings.font).replaceAll("%20","+")}:100,200,300,400,500,600,700,800,900&display=swap`;
                fontStuff.rel = "stylesheet";
                fontStuff.id = `font-${counter.settings.font}`
                document.head.appendChild(fontStuff);
            }
            font = counter.settings.font;
            break;
        default:
            font = "none";
    }
    document.querySelector(".counter-content").style.fontFamily = font;
    document.querySelector(".counter-container").style.fontWeight = counter.settings.fontWeight;
}

function setPaused(paused) {
    if (paused) {
        saveData.paused = true
        document.querySelector('#pause-button').innerText = 'Unpause'
        clearInterval(saveData.updater)
        clearInterval(apiInterval)
        if (document.getElementById('apiStatusIndicator')) {
            document.getElementById('apiStatusIndicator').innerText = "--"
            document.getElementById('apiStatusIndicator').style.color = "#ffffff"
        }
    } else {
        saveData.paused = false;
        document.querySelector('#pause-button').innerText = 'Pause'
        updateStuff();
        if (saveData.apiUpdates && saveData.apiUpdates.enabled) {
            apiInterval = setInterval(() => { apiUpdate(true) }, saveData.apiUpdates.interval);
            apiUpdate(true);
        }
    }
}

function togglePause() {
    if (!saveData.paused) {
        setPaused(true)
    } else {
        setPaused(false)
    }
}

function refreshCount() {
    document.querySelector('#count').value = counter.getApparentCount()
}

function importFromJSON(data, bypass=false) {
    if (bypass || confirm("Are you sure? This will overwrite your current data.")) {
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data)
            } catch (e) {
                return alert('Error parsing JSON data')
            }
        }
        if (!data.version || data.version > LCEDIT.saveVersion) return alert('Incompatible version');
        if (data.saveType !== saveType) {
            if (!bypass && !confirm("You are importing a save from a different counter. The styles from that counter will be applied if possible. Are you sure you want to import it here?")) return;
        }
        if (data.private) {
            if (!bypass && !confirm("You are importing a private save file. Please make sure you trust the author before importing!")) return;
        } else {
            data = LCEDIT.util.removePrivateData(data);
            data.private = true;
        }
        try {
            data.saveType = saveType;
            data.version = LCEDIT.saveVersion;
            clearInterval(saveData.updater);
            clearInterval(apiInterval);
            for (i = 0; i < Object.keys(data).length; i++) {
                let key = Object.keys(data)[i]
                if (saveData[key] != undefined) {
                    if (typeof saveData[key] === 'object' && typeof data[key] === 'object') {
                        for (j = 0; j < Object.keys(data[key]).length; j++) {
                            if (saveData[key][Object.keys(data[key])[j]] != undefined) {
                                saveData[key][Object.keys(data[key])[j]] = data[key][Object.keys(data[key])[j]];
                            }
                        }
                    } else {
                        saveData[key] = data[key];
                    }
                }
            }
            setPaused(saveData.paused)
            saveData.counters = [];
            for (i = 0; i < data.counters.length; i++) {
                saveData.counters.push(new Counter().fromJSON(data.counters[i]))
            }
            counter = saveData.counters[0];   
            if (counter.settings.showChart) chart.update(getChartOptions())
            loadAPIUpdates();
            if (saveData.apiUpdates && saveData.apiUpdates.enabled) {
                apiInterval = setInterval(() => { apiUpdate(true); }, saveData.apiUpdates.interval);
            }
            updateStuff();
            fillForms();
            if (!bypass) {
                updateGainType(counter.settings.gainType);
                updateFontType(counter.settings.fontType);
                refreshCount();
            }
        } catch (e) {
            console.error(e);
            return alert('Error')
        }
    }
}

function toggleFullScreen(value) {
    if (value !== undefined) {
        saveData.isFullScreen = value;
    } else {
        saveData.isFullScreen = !saveData.isFullScreen;
    }
    LCEDIT.util.setVisible(document.querySelector(".tabs"), !saveData.isFullScreen);
    LCEDIT.util.setVisible(document.querySelector(".tab-stuff"), !saveData.isFullScreen);
    if (saveData.isFullScreen) {
        document.querySelector(".counter-content").style.width = "100%";
        document.querySelector(".counter-content").style.border = "none";
        document.body.style.backgroundColor = counter.settings.bgColor;
    } else {
        document.querySelector(".counter-content").style.width = "50%";
        document.querySelector(".counter-content").style.border = "1px solid var(--border-color, #ddd)";
        document.body.style.backgroundColor = "var(--bg-color, #1a1a20)";
    }
    if (chart) chart.reflow();
}

function saveInBrowser() {
    saveData.lastSaved = Date.now();
    localStorage.setItem('lcedit-lcedit', saveToJSON(true));
    console.log('Saved in browser')
}

setInterval(saveInBrowser, 10000)