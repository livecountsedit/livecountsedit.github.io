let odometers = [];
const saveType = 2;

defaultCounter = Object.assign(defaultCounter, {
    bgColor: "#d0e4fe",
    imageURL: "https://lcedit.com/default.png",
    lcNetSubButton: true,
    max: 1e10-1
});

let saveData = new Save(saveType)
saveData.counters.push(new Counter(1))
counter = saveData.counters[0];

function calculateNextGoal(n) {
    if (n < 10) return 10;
    else return (Math.floor(n/(10**Math.floor(Math.log10(n)))) + 1)*(10**Math.floor(Math.log10(n)));
}

function formatNumber(n) {
    n = n.toLocaleString("en-US");
    switch (counter.settings.numberFormat) {
        case 'd':
            n = n.replaceAll(',', '');
            break;
        case '.ddd':
            n = n.replaceAll(',', '.');
            break;
        case ' ddd':
            n = n.replaceAll(',', ' ');
            break;
        default:
    }
    return n;
}

window.onload = function () {
    if (localStorage.getItem('lcedit-lcnet')) {
        importFromJSON(localStorage.getItem('lcedit-lcnet'), true)
    }
    async function initMenu() {
        const r = await fetch("./lcnet.json");
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
    let opts = {
        animation: ['default','byDigit','count', 'minimal'][counter.settings.animationType],
        downColor: counter.settings.downColor,
        duration: counter.settings.animationDuration * 1000,
        removeLeadingZeros: counter.settings.animationType === 1,
        reverseAnimation: counter.settings.reverseAnimation,
        format: counter.settings.numberFormat || ",ddd",
        upColor: counter.settings.upColor
    }
    odometers[0].options = opts;
    odometers[1].options = opts;
    document.querySelector('#lcnet-avatar').src = counter.settings.imageURL;
    saveData.allowHTML ? document.querySelector('#lcnet-name').innerHTML = counter.settings.title : document.querySelector('#lcnet-name').innerText = counter.settings.title
    document.querySelector('.counter-content').style.color = counter.settings.titleColor;
    document.querySelector('#lcnet-count').innerText = counter.getApparentCount();
    document.querySelector('.counter-container').style.color = counter.settings.counterColor;
    document.querySelector('.counter-container-2').style.color = counter.settings.counterColor;
    document.body.style.backgroundColor = counter.settings.bgColor;
    LCEDIT.util.setVisibleKeepSpace(document.querySelector('#lcnet-avatar'), counter.settings.showImage)
    loadMyFont();
    updateCounter();
    document.querySelector('#lcnet-update-text').innerText = `updated every ${saveData.updateInterval} second${saveData.updateInterval === 1 ? "" : "s"}`;
    if (!saveData.paused) saveData.updater = setInterval(updateCounter, saveData.updateInterval * 1000)
}

function updateCounter(addGain = true) {
    counter.update(addGain);
    console.log('Counter updated')
    document.querySelector('#lcnet-small-count').innerText = calculateNextGoal(counter.getApparentCount()) - counter.getApparentCount();
    document.querySelector('#lcnet-count').innerText = counter.getApparentCount();
    document.querySelector('#lcnet-small-text').innerText = `subscribers to ${formatNumber(calculateNextGoal(counter.getApparentCount()))}`;
}

function reset(bypass = false) {
    if (bypass || confirm("Are you sure you want to reset everything?")) {
        clearInterval(saveData.updater);
        clearInterval(saveData.api.updater);
        document.querySelector("#apiStatusIndicator").innerText = "--"
        document.querySelector("#apiStatusIndicator").style.color = "#ffffff"
        saveData = new Save(saveType)
        saveData.counters[0] = counter = new Counter(1);
        fillForms()
        updateStuff()
        setPaused(false)
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
    document.querySelector(".counter-container-2").style.fontWeight = counter.settings.fontWeight;
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
        data.saveType = saveType;
        if (data.private) {
            if (!bypass && !confirm("You are importing a private save file. Please make sure you trust the author before importing!")) return;
        } else {
            data = LCEDIT.util.removePrivateData(data);
            data.private = true;
        }
        try {
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
            updateStuff()
            fillForms();
        } catch (e) {
            console.error(e);
            return alert('Error')
        }
    }
}

function setCountManually() {
    if (isFinite(parseFloat(document.getElementById("lcnet-input-count").value))) {
        counter.setCount(parseFloat(document.getElementById("lcnet-input-count").value));
        updateCounter(false);
    }
}

function livecountsNetSubscribe() {
    if (counter.settings.lcNetSubButton) {
        counter.setCount(counter.settings.count + 1);
        updateCounter(false);
    }
}

function saveInBrowser() {
    saveData.lastSaved = Date.now();
    localStorage.setItem('lcedit-lcnet', saveToJSON(true));
    console.log('Saved in browser')
}

setInterval(saveInBrowser, 10000)