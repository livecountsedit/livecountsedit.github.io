let chart;

function openTab(e, f) {
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
}

defaultCounter = Object.assign(defaultCounter, {
    bannerURL: "https://lcedit.com/default_banner.png",
    bgColor: "#222233",
    counterColor: "#ffffff",
    downColor: "#ffffff",
    footer: "Subscribers",
    footerColor: "#ffffff",
    imageURL: "https://lcedit.com/default.png",
    showBanner: true,
    showChart: true,
    showFooter: true,
    titleColor: "#ffffff",
    upColor: "#ffffff"
})

let odometers = [];

class Save {
    constructor() {
        this.allowHTML = false,
        this.saveType = 1,
        this.version = LCEDIT.saveVersion,
        this.updateInterval = 2,
        this.updater = 0,
        this.title = 'save',
        this.paused = false,
        this.lastSaved = 0,
        this.counters = []
    }
}

let saveData = new Save()
saveData.counters.push(new Counter(1))
counter = saveData.counters[0];

window.onload = function () {
    if (document.getElementById('tab-link-0')) document.getElementById('tab-link-0').click();
    if (localStorage.getItem('lcedit-lcedit')) {
        importFromJSON(localStorage.getItem('lcedit-lcedit'), true)
    }
    LCEDIT.util.fillForms(document.querySelectorAll("form.counter-form"), counter.settings)
    updateGainType(counter.settings.gainType)
    updateStuff()
}

chart = new Highcharts.chart(getChartOptions());

document.querySelector('#import-data-v7').addEventListener('input', () => {
    if (document.querySelector('#import-data-v7').files[0]) {
        document.querySelector('#import-data-v7').files[0].text().then(data => {
            importFromJSON(data)
            delete document.querySelector('#import-data-v7').files[0];
        })
    }
})

function submit() {
    const result = LCEDIT.util.submitForms(document.querySelectorAll("form.counter-form"))
    if (result.success) {
        if (result.data.updateInterval) saveData.updateInterval = result.data.updateInterval;
        let ready = 0;
        if (!result.files) {
            saveData.counters[0].updateSettings(result.data);
            updateStuff()
        } else {
            addEventListener('fileReady', () => { // this took forever to fix brUHHHHHHHHH
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

function updateStuff() {
    clearInterval(saveData.updater);
    odometers = Odometer.init();
    odometers[0].options = {
        animation: ['default','byDigit','count'][counter.settings.animationType],
        downColor: counter.settings.downColor,
        duration: counter.settings.animationDuration * 1000,
        removeLeadingZeros: counter.settings.animationType === 1,
        upColor: counter.settings.upColor
    }
    document.querySelector('#counter-banner').src = counter.settings.bannerURL;
    document.querySelector('#counter-avatar').src = counter.settings.imageURL;
    saveData.allowHTML ? document.querySelector('#counter-title').innerHTML = counter.settings.title : document.querySelector('#counter-title').innerText = counter.settings.title
    document.querySelector('#counter-title').style.color = counter.settings.titleColor;
    saveData.allowHTML ? document.querySelector('#counter-footer').innerHTML = counter.settings.footer : document.querySelector('#counter-footer').innerText = counter.settings.footer
    document.querySelector('#counter-footer').style.color = counter.settings.footerColor;
    document.querySelector('#counter-counter').innerText = counter.getApparentCount();
    document.querySelector('#counter-counter').style.color = counter.settings.counterColor;
    document.querySelector('.counter-container').style.backgroundColor = counter.settings.bgColor;
    LCEDIT.util.setVisible(document.querySelector('#counter-banner'), counter.settings.showBanner)
    LCEDIT.util.setVisible(document.querySelector('#counter-avatar'), counter.settings.showImage, 'inline-block')
    LCEDIT.util.setVisible(document.querySelector('#counter-chart'), counter.settings.showChart)
    LCEDIT.util.setVisible(document.querySelector('#counter-footer'), counter.settings.showFooter)
    document.querySelector('#counter-banner').style.filter = `blur(${counter.settings.bannerBlur}px)`
    chart.update(getChartOptions())
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
            gridLineColor: "#bdbdbd",
            lineColor: "#000000",
            minorGridLineColor: "#bdbdbd",
            tickColor: "#000000",
            title: {
                text: ""
            }
        },
        yAxis: {
            grindLineColor: "#bdbdbd",
            lineColor: "#000000",
            minorGridLineColor: "#bdbdbd",
            tickColor: "#000000",
            title: {
                text: ""
            }
        },
        credits: {
            enabled: true,
            text: "lcedit.com"
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
        resetChart(true)
        saveData = new Save()
        saveData.counters[0] = counter = new Counter(1);
        LCEDIT.util.fillForms(document.querySelectorAll("form.counter-form"), counter.settings)
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
            const k = g[j].querySelector('input')
            if (k) k.disabled = (i != v)
        }
    }
} 

document.querySelector('#gainType').addEventListener('input', event => {
    updateGainType(event.target.value)
})

function setPaused(paused) {
    if (paused) {
        saveData.paused = true
        document.querySelector('#pause-button').innerText = 'Unpause'
    } else {
        saveData.paused = false;
        document.querySelector('#pause-button').innerText = 'Pause'
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

function saveToJSON() {
    return JSON.stringify(saveData);
}

function exportToJSON() {
    const a = document.createElement('a');
    saveData.lastSaved = Date.now()
    const file = new Blob([saveToJSON()], { type: 'text/json' });
    a.href = URL.createObjectURL(file);
    a.download = `${saveData.title}.json`;
    a.click();
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
        try {
            saveData = Object.assign(saveData, data);
            setPaused(saveData.paused)
            saveData.counters = [];
            for (i = 0; i < data.counters.length; i++) {
                saveData.counters.push(new Counter().fromJSON(data.counters[i]))
            }
            counter = saveData.counters[0];   
            chart.update(getChartOptions()) 
        } catch (e) {
            return alert('Error')
        }
    }
}

function saveInBrowser() {
    saveData.lastSaved = Date.now();
    localStorage.setItem('lcedit-lcedit', saveToJSON());
    console.log('Saved in browser')
}

setInterval(saveInBrowser, 10000)