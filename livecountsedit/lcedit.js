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

function submitAPI() {
    const result = LCEDIT.util.submitForms(document.querySelectorAll("form.api-form"), new Save().api);
    if (result.success) {
        clearInterval(saveData.api.updater);
        saveData.api = result.data;
        saveInBrowser();
        if (saveData.api.ytAPIEnabled) {
            saveData.api.updater = setInterval(() => {updateAPI(true)}, saveData.api.apiInterval * 1000);
            updateAPI(true);
        } else {
            clearInterval(saveData.api.updater);
            counter.lastAPICount = null;
            document.querySelector("#apiStatusIndicator").innerText = "--"
            document.querySelector("#apiStatusIndicator").style.color = "#ffffff"
        }
    } else {
        document.getElementById(result.problematicForm.id.replace('settingsForm','tab-link')).click();
        result.problematicForm.reportValidity()
    }
}

async function updateAPI(bypass = false) {
    if (saveData.api.ytAPIEnabled) {
        try {
            const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&key=${saveData.api.ytAPIKey}&id=${saveData.api.ytChannelID}`;
            const a = await fetch(url);
            const b = await a.json();
            const apiCount = parseInt(b.items[0].statistics.subscriberCount);
            counter.leeway = saveData.api.leeway;
            counter.lastAPICount = apiCount;
            console.log("API updated")
            document.querySelector("#apiStatusIndicator").innerText = "OK"
            document.querySelector("#apiStatusIndicator").style.color = "#00ff00"
        } catch (e) {
            console.error(e);
            document.querySelector("#apiStatusIndicator").innerText = "Error"
            document.querySelector("#apiStatusIndicator").style.color = "#ff0000"
        }
    } else {
        if (!bypass) return alert("You need to enable API updates first. Make sure you press the Save API settings button after checking the box.")
    }
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
        clearInterval(saveData.api.updater);
        document.querySelector("#apiStatusIndicator").innerText = "--"
        document.querySelector("#apiStatusIndicator").style.color = "#ffffff"
        resetChart(true)
        saveData = new Save(saveType)
        saveData.counters[0] = counter = new Counter(1);
        fillForms()
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
        clearInterval(saveData.api.updater)
        document.querySelector("#apiStatusIndicator").innerText = "--"
        document.querySelector("#apiStatusIndicator").style.color = "#ffffff"
    } else {
        saveData.paused = false;
        document.querySelector('#pause-button').innerText = 'Pause'
        updateStuff();
        if (saveData.api.ytAPIEnabled) {
            saveData.api.updater = setInterval(() => { updateAPI(true) }, saveData.api.apiInterval * 1000);
            updateAPI(true);
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
            clearInterval(saveData.api.updater);
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