const AUTOSAVE_INTERVAL = 15000;
const DB_TABLES = ['socialblade', 'top50', 'akshatmittal'];
const DB_VERSION = 3;
const VERSION = '7.8.2';
const SAVE_VERSION = 8;

function escapeHTML(text) {
    if (text != null) {
        text = text.toString();
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    return "";
}

function abb(n) {
    let s = Math.sign(n);
    n = Math.abs(n);
    if (n < 1) return 0;
    else return Math.floor(s * Math.floor(n / (10 ** (Math.floor(Math.log10(n)) - 2))) * (10 ** (Math.floor(Math.log10(n)) - 2)))
}

function abbs(n) {
    let s = Math.sign(n);
    n = Math.abs(n);
    if (n < 1) return '0';
    let l = Math.floor(Math.log10(n) / 3);
    let d = 10 ** Math.floor(Math.log10(n) - 2);
    let r = Math.floor(n / d) * d;
    let result = formatNumber((s * r) / (1000 ** l)) + (l > 5 ? "?" : " KMBTQ"[l]);
    if (result.endsWith(" ")) return result.slice(0, -1);
    return result;
}

const uuidGen = function () {
    if (self && self.crypto && typeof self.crypto.randomUUID === 'function') {
        return self.crypto.randomUUID();
    }
    let a = function () {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };
    return a() + a() + '-' + a() + '-' + a() + '-' + a() + '-' + a() + a() + a();
}

function avg(a, b) {
    return (a + b) / 2;
}

function random(min, max) {
    return min + Math.random() * (max - min);
}

function mergeWithExampleData(imported, example, deleteExtras = false) {
    if (typeof imported !== 'object' || imported === null) return structuredClone(example);
    if (deleteExtras) {
        for (const key in imported) {
            if (!example.hasOwnProperty(key)) {
                delete imported[key];
            }
        }
    }
    for (let key in example) {
        if (!imported.hasOwnProperty(key)) {
            imported[key] = structuredClone(example[key]);
        } else if (typeof example[key] === 'object' && !Array.isArray(example[key])) {
            imported[key] = mergeWithExampleData(imported[key], example[key], deleteExtras);
        }
    }
    return imported;
}

function includesAtLeastOneOf(str, ...substrs) {
    for (const substr of substrs) {
        if (str.includes(substr)) return true;
    }
    return false;
}

function initializeCopyButtons() {
    document.querySelectorAll('[copy]').forEach(x => {
        x.onclick = () => {
            const elem = document.getElementById(x.getAttribute("copy"));
            if (elem && elem.value) {
                navigator.clipboard.writeText(elem.value);
                alert("Copied!")
            }
        }
    })
}

function hasDuplicates(arr) {
    const set = new Set();
    for (const item of arr) {
        if (set.has(item)) return true;
        else set.add(item);
    }
    return false;
}

function searchSettings(str) {
    results = []
    const settingContainers = document.getElementsByClassName("settings-container");
    for (const container of settingContainers) {
        const labels = container.querySelectorAll("label");
        l: for (const label of labels) {
            let elem = label;
            while (elem) {
                if (elem.classList.contains('no-search')) continue l;
                elem = elem.parentElement; 
            }
            let hasInputChild = !!label.querySelectorAll("input,textarea,select").length;
            if (hasInputChild) {
                const labelText = Array.from(label.childNodes)
                    .filter(node => node.nodeType === Node.TEXT_NODE || node.nodeName === 'ABBR' || node.classList.contains('show-in-search'))
                    .map(node => node.textContent)
                    .join('').replace(/\s+/g, ' ');
                if (labelText.toLowerCase().includes(str.toLowerCase())) {
                    results.push([labelText, container.parentElement.id || container.parentElement.parentElement.id]);
                }
            }
        }
    }
    return results;
}

function afterDrawingMenu() {

    document.getElementById('settingsSearch')?.addEventListener('input', (e) => {
        const query = e.target.value;
        const searchResultsDiv = document.querySelector(".search-results")
        searchResultsDiv.replaceChildren()
        searchResultsDiv.innerText = "";
        if (query) {
            const results = searchSettings(query);
            if (results.length) {
                for (const result of results) {
                    const p = document.createElement('p');
                    p.innerText = result[0].replace(/\s+/g, ' ');
                    const id = result[1];
                    const button = document.getElementById('button_' + id).cloneNode(true);
                    button.classList.add("enabled");
                    button.id = "";
                    p.appendChild(button);
                    searchResultsDiv.appendChild(p);
                }
            } else {
                searchResultsDiv.innerHTML = "<p>No results found.</p>";
            }
        }
        adjustColors();
    });

    document.getElementById('runSnippet')?.addEventListener('click', () => {
        const result = prompt("⚠️ PLEASE READ!!! Make sure you know what you're doing before using this. NEVER paste in code from an untrusted source. If anything happens because of something you pasted in here IT IS 100% ON YOU! Please type I UNDERSTAND in all caps before proceeding.");
        if (result === "I UNDERSTAND") {
            const code = prompt("Paste in your code here. ⚠️ NEVER EVER paste in code from an untrusted source!");
            if (code) {
                const response = prompt("Are you REALLY sure you wanna run this? Type YES in all caps to confirm. Again, if anything happens cause of what you pasted in here, IT'S 100% ON YOU!");
                if (response === "YES") {
                    try {
                        eval(code);
                        alert("Success!")
                    } catch (err) {
                        alert(`An error occurred: ${err}`)
                    }
                } else {
                    alert("Action cancelled.");
                }
            } else {
                alert("Action cancelled.")
            }
        } else {
            alert("Action cancelled.")
        }
    })

    const partialExportOptions = document.querySelectorAll('.partial-export-option');
    if (partialExportOptions.length && window.COUNTER_THEME !== 'top50') {
        const div = document.createElement('div');
        div.className = 'partial-export-option-wrapper';
        partialExportOptions[0].parentElement.parentElement.parentElement.insertBefore(div, partialExportOptions[0].parentElement.parentElement.parentElement.firstElementChild.nextElementSibling);
        partialExportOptions.forEach(x => div.appendChild(x.parentElement.parentElement));
    }

    document.getElementById('fileImport')?.addEventListener('change', async () => {
    const importedFile = document.getElementById('fileImport').files[0];
        if (importedFile && confirm('Are you sure you want to import this save? You will lose your current data for all imported options.\nMake sure you trust the source of the save! If you import a save with malicious or offensive content, it\'s on YOU!')) {
            try {
                const importedText = await importedFile.text();
                const imported = JSON.parse(importedText);
                await importData(imported);
            } catch (err) {
                console.error(err);
                alert(`There was an error loading your save file: ${err}`);
            }
        }
    })

    if (document.getElementById('pauseB') && data.pause) {
        document.getElementById('pauseB').innerText = 'Resume';
    }

    document.getElementById('updateInterval')?.addEventListener('change', () => {
        data.updateInterval = clamp(document.getElementById('updateInterval').value * 1000 || 2000, 4, 2147483647);
        changeUpdateInterval();
    })

    document.querySelectorAll('[url-destination]').forEach(x => x.addEventListener('change', () => {
        const destinationElem = document.getElementById(x.getAttribute('url-destination'));
        if (destinationElem && x.files[0]) {
            const reader = new FileReader();
            reader.readAsDataURL(x.files[0]);
            reader.onload = function () {
                destinationElem.value = reader.result;
                destinationElem.dispatchEvent(new Event('change'))
            }
        }
    }))

    document.getElementById('apiSourcePreset')?.addEventListener('change', () => {
        const val = document.getElementById('apiSourcePreset').value;
        if (!val || val === 'custom') return;
        data.apiUpdates.url = 'https://mixerno.space/api/youtube-channel-counter/user/';
        data.apiUpdates.headers = {};
        data.apiUpdates.body = {};
        data.apiUpdates.response.loop = 'data';
        data.apiUpdates.response.name.enabled = true;
        data.apiUpdates.response.name.path = 'user[0].count';
        data.apiUpdates.response.count.enabled = true;
        data.apiUpdates.response.count.path = val === 'mixerno1' ? 'counts[2].count' : 'counts[0].count';
        data.apiUpdates.response.image.enabled = true;
        data.apiUpdates.response.image.path = 'user[1].count'
        data.apiUpdates.response.id.IDIncludes = true;
        data.apiUpdates.response.id.path = 'user[2].count';

        if (data.apiUpdates.response.banner) {
            data.apiUpdates.response.banner.enabled = true;
            data.apiUpdates.response.banner.path = 'user[2].count';
        }

        if (data.apiUpdates.response.views) {
            data.apiUpdates.response.views.enabled = true;
            data.apiUpdates.response.views.path = 'counts[3].count';
        }

        if (data.apiUpdates.response.videos) {
            data.apiUpdates.response.videos.enabled = true;
            data.apiUpdates.response.videos.path = 'counts[5].count';
        }
        fillMenus();
    })

    afterDrawingMenu2();
}

function adjustColors() {
    // only here for compatibility with Top 50
}

// up to individual counters to implement
function afterDrawingMenu2() {
}

function clamp(num, min, max) {
    if (isNaN(num)) num = 0;
    return Math.min(Math.max(num, min), max);
}


async function initDB() {
    const db = await idb.openDB('LCEDIT', DB_VERSION, {
        upgrade(db) {
            for (const table of DB_TABLES) {
                if (!db.objectStoreNames.contains(table)) {
                    db.createObjectStore(table, {
                        keyPath: 'index',
                        autoIncrement: true
                    })
                }
            }
        }
    })
    return db;
}

async function retrieveDataFromBrowser(table, index) {
    const db = await initDB();
    try {
        const result = await db.get(table, index);
        return result;
    } catch (err) {
        return null;
    }
}

async function saveDataInBrowser(table, dat) {
    const db = await initDB();
    await db.put(table, dat);
}

async function saveInBrowser(table, shouldAlert = false) {
    try {
        data.lastOnline = Date.now();
        await saveDataInBrowser(table, data);
        if (shouldAlert) {
            if (navigator.storage && navigator.storage.persist && navigator.storage.persisted) {
                const isPersistent = await navigator.storage.persisted();
                if (!isPersistent) {
                    if (confirm('Saved!\nWould you like to grant permission to our site to store data persistently? It prevents your browser from deleting saved data automatically when disk space is low.')) {
                        const permissionGranted = await navigator.storage.persist();
                        if (permissionGranted) {
                            alert('Your browser approved persistent storage permissions.')
                        } else {
                            alert('Your browser denied persistent storage permissions. If this was done automatically, you may need to convince your browser that this site is trustworthy (e.g. by bookmarking it).')
                        }
                    }
                } else {
                    alert('Saved!');
                }
            } else {
                alert('Saved!');
            }
        }
        if (data.debugMode) console.log('Saved in browser');
    } catch (err) {
        if (data.debugMode) console.error(err);
    }
}

async function deleteDataInBrowser(table, index) {
    const db = await initDB();
    return await db.delete(table, index);
}

function updateStreamerMode() {
    if (data.streamerMode) {
        document.getElementById("streamerModeB").innerText = "Disable Streamer Mode";
        document.querySelectorAll('.streamer-mode').forEach(x => x.style.display = 'flex');
    } else {
        document.getElementById("streamerModeB").innerText = "Enable Streamer Mode";
        document.querySelectorAll('.streamer-mode').forEach(x => x.style.display = 'none');
    }
}

function toggleStreamerMode() {
    if (!data.streamerMode) {
        data.streamerMode = true;
        updateStreamerMode();
        alert('Streamer Mode enabled.')
    } else {
        if (confirm('Are you sure you want to disable Streamer Mode?')) {
            data.streamerMode = false;
            updateStreamerMode();
            alert('Streamer Mode disabled.')
        } else {
            alert('Action cancelled.')
        }
    }
}

function randomGaussian(mean, stdev) {
    let a = 0, b = 0;
    while (!a) a = Math.random();
    while (!b) b = Math.random();
    return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b) * stdev + mean;
}

function enableAllPartialExports() {
    document.querySelectorAll('.partial-export-option').forEach(x => { if (!x.checked) x.click() })
}

function disableAllPartialExports() {
    document.querySelectorAll('.partial-export-option').forEach(x => { if (x.checked) x.click() })
}

function toggleAllPartialExports() {
    document.querySelectorAll('.partial-export-option').forEach(x => x.click());
}

function processData(dat) {
    if (dat.partialExports) {
        if (!dat.partialExports.state) {
            delete dat.autosave;
            delete dat.debugMode;
            delete dat.editorShowsExactCount;
            delete dat.intervalCount;
            delete dat.pause;
            delete dat.streamerMode;
            delete dat.settingsTab;
        }
        if (!dat.partialExports.audits) {
            delete dat.audits;
            delete dat.auditStats;
        }
        if (!dat.partialExports.counters) {
            delete dat.data;
        } else {
            if (!dat.partialExports.names) {
                for (i = 0; i < dat.data.length; i++) {
                    delete dat.data[i].name;
                }
            }
            if (!dat.partialExports.counts) {
                for (i = 0; i < dat.data.length; i++) {
                    delete dat.data[i].count;
                }
            }
            if (!dat.partialExports.avatars) {
                for (i = 0; i < dat.data.length; i++) {
                    delete dat.data[i].image;
                }
            }
            if (!dat.partialExports.banners) {
                for (i = 0; i < dat.data.length; i++) {
                    delete dat.data[i].banner;
                }
            }
            if (!dat.partialExports.gains) {
                for (i = 0; i < dat.data.length; i++) {
                    delete dat.data[i].min_gain;
                    delete dat.data[i].max_gain;
                    delete dat.data[i].mean_gain;
                    delete dat.data[i].std_gain;
                    delete dat.data[i].mean_gain_value;
                    delete dat.data[i].std_gain_value;
                    delete dat.data[i].gain_type;
                    delete dat.data[i].gain_per;
                }
            }
            if (!dat.partialExports.backgrounds) {
                for (i = 0; i < dat.data.length; i++) {
                    delete dat.data[i].bg;
                }
            }

            if (!dat.partialExports.viewAndVideoCounts && dat.saveType === 'akshatmittal') {
                dat.data = dat.data.slice(0, 1);
            }
        }
        if (!dat.partialExports.charts) {
            if (dat.cardStyles) {
                delete dat.cardStyles.showChart;
                delete dat.cardStyles.chartLineColor;
            }
            delete dat.liveGraph;
            delete dat.maxChartValues;
            delete dat.saveChartData;
        }
        if (!dat.partialExports.designSettings) {
            delete dat.showImages;
            delete dat.showNames;
            delete dat.showCounts;
            delete dat.showRankings;
            delete dat.rankingsWidth;
            if (dat.cardStyles) {
                delete dat.cardStyles.cardWidth;
                delete dat.cardStyles.cardHeight;
                delete dat.cardStyles.imageSize;
                delete dat.cardStyles.nameSize;
                delete dat.cardStyles.nameWidth;
                delete dat.cardStyles.countSize;
                delete dat.cardStyles.rankSize;
                delete dat.cardStyles.containerHeight;
                delete dat.cardStyles.containerWidth;
                if (!Object.keys(dat.cardStyles).length) {
                    delete dat.cardStyles;
                }
            }
            delete dat.prependZeros;
            delete dat.boxSpacing;
            delete dat.fastest;
            delete dat.fastestIcon;
            delete dat.slowest;
            delete dat.slowestIcon;
            delete dat.theme;
            delete dat.sort;
            delete dat.order;
            delete dat.max;
            delete dat.numberFormat;
            delete dat.verticallyCenterRanks;
            delete dat.animationType;
            delete dat.reverseAnimation;
            delete dat.showBlankSlots;
        }
        if (!dat.partialExports.styles) {
            delete dat.boxBGLength;
            delete dat.boxBGGain;
            delete dat.boxBGLose;
            delete dat.bgColor;
            delete dat.textColor;
            delete dat.boxColor;
            delete dat.boxBorder;
            delete dat.imageBorder;
            delete dat.boxBorderRadius;
            delete dat.imageBorderColor;
            delete dat.odometerUp;
            delete dat.odometerDown;
            delete dat.useOdometerColors;
            delete dat.mainFont;
            delete dat.counterFontWeight;
            delete dat.counterAlignment;
        }
        if (!dat.partialExports.technicalSettings) {
            delete dat.abbreviate;
            delete dat.allowNegative;
            delete dat.odometerSpeed;
            delete dat.offlineGains;
            delete dat.updateInterval;
            delete dat.randomCountUpdateTime;
            delete dat.waterFallCountUpdateTime;
            delete dat.gainAverageOf;
            delete dat.animatedCards;
        }
        if (!dat.partialExports.apiUpdates) {
            delete dat.apiUpdates;
        }
        if (!dat.partialExports.streamSettings) {
            delete dat.gain_min;
            delete dat.gain_max;
            delete dat.uuid;
        }
        if (!dat.partialExports.fireSettings) {
            delete dat.fireIcons;
        }
        if (!dat.partialExports.differenceSettings) {
            delete dat.showDifferences;
            delete dat.differenceStyles;
        }
        if (!dat.partialExports.headerSettings) {
            delete dat.headerFont;
            delete dat.headerSettings;
        }
        if (!dat.partialExports.scripts) {
            delete dat.scripts;
        }
        if (!dat.partialExports.customCSS) {
            delete dat.customCSS;
        }
        if (!dat.partialExports.socialBladeSettings) {
            delete dat.socialBladeSettings;
        }

        if (!dat.partialExports.akshatmittalSettings) {
            delete dat.akshatmittalSettings;
        }
    }
    return dat;
}

function exportData(shouldAlert = true) {
    const data_ = processData(structuredClone(data));
    
    if (shouldAlert) {
        if (!data_.partialExports || data_.partialExports.apiUpdates) {
            alert('NOTICE: API update settings are included in this export. Be careful not to share any sensitive data or credentials with people you don\'t trust!');
        }

        if (!data_.partialExports || data_.partialExports.streamSettings) {
            alert('NOTICE: Stream settings are included in this save. This will include the code used for Nightbot commands, so DO NOT share if you ever plan on using Nightbot!')
        }
    }
    const jsonData = JSON.stringify(data_);
    const file = new Blob([jsonData], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = 'export.json';
    a.click();
    delete a;
}

class Channel {
    constructor(options = {}) {
        this.id = options.id || uuidGen();
        this.name = options.name || 'User';
        this.count = parseFloat(options.count) || 0;
        this.image = options.image || '/default.png'
        this.min_gain = parseFloat(options.min_gain) || 0;
        this.max_gain = parseFloat(options.max_gain) || 0;
        this.mean_gain = parseFloat(options.mean_gain);
        this.std_gain = parseFloat(options.std_gain);
        this.mean_gain_value = parseFloat(options.mean_gain_value) || 0;
        this.std_gain_value = parseFloat(options.std_gain_value) || 0;
        this.gain_type = isFinite(this.mean_gain) && isFinite(this.std_gain) ? 'gaussian' : 'uniform';
        this.bg = options.bg || '';
        this.banner = options.banner || '/default_banner.png';
        this.gain_per = options.gain_per || 'updateInterval';
        this.last_api_count = parseFloat(options.last_api_count);
    }

    getDisplayedCount() {
        if (!data.allowNegative && this.count < 0) this.count = 0;
        if (data.abbreviate) return abb(this.count);
        else return isFinite(this.count) ? Math.floor(this.count) : 0;
    }

    getGainMultiplier() {
        switch (this.gain_per) {
            case 'second':
                return data.updateInterval / 1_000;
            case 'minute':
                return data.updateInterval / 60_000;
            case 'hour':
                return data.updateInterval / 3_600_000;
            case 'day':
                return data.updateInterval / 86_400_000;
            default:
                return 1;
        }
    }

    gain() {

        // Ignore gains if using a real sub count
        if (data.apiUpdates.enabled && data.apiUpdates.forceUpdates) return;

        let multiplier = this.getGainMultiplier();
        let gain = 0;
        if (this.gain_type === 'gaussian') {
            gain = randomGaussian(this.mean_gain * multiplier, this.std_gain * Math.sqrt(multiplier));
            // With normally distributed gains, this results in the variability being accurate
            // This is possible because normal distribution + normal distribution = normal distribution
        } else {
            gain = random(this.min_gain, this.max_gain) * multiplier;
            // With uniform (min/max) gains the long term result is a normal distribution.
            // if gain rate is not per update interval, then the variability can't be accurate.
            // e.g. 10k to 20k per hour = will cluster around 15k
        }
        if (!isFinite(gain)) gain = 0;
        if (isFinite(gain + this.count)) {
            this.count += gain;
        }

        // Prevent gains from going over API constraints
        // (For users making their own estimation)
        if (data.apiUpdates.enabled && !data.apiUpdates.forceUpdates) {
            if (this.last_api_count >= 0) {
                this.adjustForAPI(this.last_api_count);
            }
        }
    }

    // Get the mean gain per update interval
    getUnitMeanGain() {
        if (this.gain_type === 'gaussian') {
            return this.mean_gain * this.getGainMultiplier();
        } else {
            return avg(this.min_gain, this.max_gain) * this.getGainMultiplier();
        }
    }

    // Get to standard deviation of gain per update interval
    getUnitStDevGain() {
        if (this.gain_type === 'gaussian') {
            return this.std_gain * Math.sqrt(this.getGainMultiplier());
        } else {
            // The standard deviation of a uniform distribution is (max - min) / sqrt(12)
            // https://en.wikipedia.org/wiki/Continuous_uniform_distribution
            return Math.abs(this.max_gain - this.min_gain) * this.getGainMultiplier() / Math.sqrt(12);
        }
    }

    // Offline gains are gains added to compensate for the time the save wasn't loaded in the browser
    // e.g. when tab is closed. It DOES NOT refer to gains for users that are not active on stream.
    offlineGain() {
        // Don't do offline gains if disabled or paused, or if the last saved time isn't set
        // or if API updates are enabled and force updated
        if (data.pause || !data.offlineGains || typeof data.lastOnline !== 'number' 
            || !isFinite(data.lastOnline) || (data.apiUpdates.enabled && data.apiUpdates.forceUpdates)) return;
        
        const intervalsElapsed = (Date.now() - data.lastOnline) / data.updateInterval;

        // Only do offline gains if at least 5 update intervals have passed
        if (intervalsElapsed < 5) return;

        if (data.debugMode) console.log('Intervals passed for offline gains: ' + intervalsElapsed)

        // The total gain will be approximately normally distributed
        let gain = randomGaussian(this.getUnitMeanGain() * intervalsElapsed, 
            this.getUnitStDevGain() * Math.sqrt(intervalsElapsed));

        if (data.debugMode) console.log('Offline gains: ' + gain)
        if (!isFinite(gain)) gain = 0;
        if (isFinite(gain + this.count)) {
            this.count += gain;
        }

        // Prevent gains from going over API constraints
        // (For users making their own estimation)
        if (data.apiUpdates.enabled && !data.apiUpdates.forceUpdates) {
            if (this.last_api_count >= 0) {
                this.adjustForAPI(this.last_api_count);
            }
        }
    }

    adjustForAPI(apiCount) {
        // If real sub count is used:
        if (data.apiUpdates.forceUpdates) {
            this.count = apiCount;
        } else {
            const abbAPICount = abb(apiCount);
            this.last_api_count = abbAPICount;
            const nextMilestone = Channel.calculateNextAbbreviationMilestone(abbAPICount);
            // Adjust for API count if the user is making their own estimates
            if (this.getUnitMeanGain() >= 0) {
                if (abbAPICount > abb(this.count)) {
                    // Count increasing, API count is ahead
                    this.count = apiCount; // Jump to new milestone
                } else if (abbAPICount < abb(this.count)) {
                    // Count increasing, API count is behind (estimation is ahead)                    
                    // Make sure overestimation leeway is between 0 and 100%
                    data.apiUpdates.leeway = clamp(data.apiUpdates.leeway, 0, 100)
                    let newCount = nextMilestone - (nextMilestone - abbAPICount) * data.apiUpdates.leeway / 100;
                    // For 0 leeway, keep count at 1 less than the next abbreviation milestone (e.g. 100,999,999)
                    if (data.apiUpdates.leeway === 0) newCount--;
                    this.count = newCount;
                }
            } else {
                if (abbAPICount < abb(this.count)) {
                    // Count decreasing, API count is ahead (as in decreased faster)
                    // e.g. abbreviated count goes from 101M -> 100M, display 100,999,999.
                    this.count = nextMilestone - 1;
                } else if (abbAPICount > abb(this.count)) {
                    // Count decreasing, API count is behind (as in hasn't gone under yet)
                    // Make sure overestimation leeway is between 0 and 100%
                    data.apiUpdates.leeway = clamp(data.apiUpdates.leeway, 0, 100)
                    let newCount = abbAPICount + (nextMilestone - abbAPICount) * data.apiUpdates.leeway / 100;
                    if (data.apiUpdates.leeway === 100) newCount--;
                    this.count = newCount;
                }
            }
        }
    }

    static doGains() {
        data.data.forEach(x => x.gain());
    }

    static doOfflineGains() {
        data.data.forEach(x => x.offlineGain());
    }

    // Calculates the next abbreviation milestone
    // e.g. for 12,345 it is 12,400, for 100,000 it is 101,000
    static calculateNextAbbreviationMilestone(count) {
        if (count < 0) return 0;
        if (count < 1000) return Math.floor(count) + 1;
        return abb(count) + 10 ** (Math.floor(Math.log10(count) - 2));
    }
}

async function importData(imported) {

    if (typeof imported.saveType === 'number') {
        return alert('Saves from v7 Livecountsedit and Livecounts.net themes are not supported yet.')
    }

    const partialImports = structuredClone(data.partialExports);
    if (imported.partialExports) {
        for (const key in partialImports) {
            if (!imported.partialExports[key]) partialImports[key] = false;
        }
    }
    imported.partialExports = partialImports;
    imported = processData(imported);

    imported.saveType = COUNTER_THEME;
    imported.versionLastOpened = example_data.versionLastOpened;

    if (Object.keys(imported.partialExports).some(x => !imported.partialExports[x])) {
        imported.partialExports = data.partialExports;
        const action = prompt('Either this save is a partial export/from an old version, or you have decided to only partially import this save.\nType 1 to use DEFAULT settings for unimported settings.\nType 2 to KEEP your current settings for unimported settings.\nType anything else or leave blank to cancel.');
        if (action == '1') {
            data = mergeWithExampleData(imported, example_data, true);
        } else if (action == '2') {
            data = mergeWithExampleData(imported, data, true);
        } else {
            return;
        }
    } else {
        data = mergeWithExampleData(imported, example_data, true);
    }
    if (!data.data) data.data = [];
    data.data = data.data.map(x => new Channel(x));
    await processImport(imported);
    fillMenus();
}

// needs to be implemented by individual counters
async function processImport(imported) {
    return imported;
}