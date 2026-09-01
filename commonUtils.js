const AUTOSAVE_INTERVAL = 15000;
const DB_TABLES = ['socialblade', 'top50', 'akshatmittal', 'livecountsnet', 'livecountsedit', 'studio', 'livecountseditvideo', 'akshatmittalvideo', 'livecountseditcompare','akshatmittalcompare'];
const DB_VERSION = 11;
const VERSION = '7.10.5';
const SAVE_VERSION = 10;
let obsMode;

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
    let result = formatNumber((s * r) / (1000 ** l)) + (l > 7 ? "?" : ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx'][l]);
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
    if (deleteExtras && Object.keys(example).length) {
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
        const isVideo = (COUNTER_THEME && COUNTER_THEME.includes('video'));
        if (!val || val === 'custom') return;
        data.apiUpdates.url = isVideo ? 'https://mixerno.space/api/youtube-video-counter/user/' : 'https://mixerno.space/api/youtube-channel-counter/user/';
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
            data.apiUpdates.response.videos.enabled = !isVideo;
            data.apiUpdates.response.videos.path = isVideo ? 'counts[4].count' : 'counts[5].count';
        }

        if (data.apiUpdates.response.comments) {
            data.apiUpdates.response.comments.enabled = true;
            data.apiUpdates.response.comments.path = 'counts[5].count'
        }
        fillMenus();
    })

    document.getElementById('obsImportFile')?.addEventListener('change', async () => {
        const importedFile = document.getElementById('obsImportFile').files[0];
        if (importedFile) {
            try {
                try {
                    clearInterval(saveInterval);
                } catch (err) {
                    clearInterval(updaters.get('autosave'));
                }
                const importedText = await importedFile.text();
                const imported = JSON.parse(importedText);
                imported.streamerMode = true;
                imported.index = 1;
                localStorage.setItem('obs-' + COUNTER_THEME, '1');
                await saveDataInBrowser(COUNTER_THEME, imported);
                window.location.reload();
            } catch (err) {
                showDialog('There was an error in importing your save.');
                console.error(err);
            }
        }
    })

    loadOBSMode();
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
        },

        blocked(current, blocked) {
            alert('The database has been updated. Please close all other Livecountsedit tabs to continue.')
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
        console.error(err);
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

function randomFromCustomDistribution(dist) {
    if (typeof dist != 'object' || !dist.entries || !dist.entries.length || !dist.totalWeight || dist.totalWeight < 0) return 0;
    const a = Math.random() * dist.totalWeight;
    let i = 0;
    while (a > dist.entries[i]?.cutoff && dist.entries[i]) {
        i++;
    }
    return random(dist.entries[i].min, dist.entries[i].max);
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
                    delete dat.data[i].gain_per_number;
                    if (dat.data[i].custom_counter_data) {
                        delete dat.data[i].custom_counter_data.custom_rate;
                        delete dat.data[i].custom_counter_data.custom_distribution;
                    }
                }
            }
            if (!dat.partialExports.backgrounds) {
                for (i = 0; i < dat.data.length; i++) {
                    delete dat.data[i].bg;
                }
            }

            if (!dat.partialExports.technicalSettings) {
                for (i = 0; i < dat.data.length; i++) {
                    if (dat.data[i].custom_counter_data) {
                        delete dat.data[i].custom_counter_data.max;
                        delete dat.data[i].custom_counter_data.min;
                        delete dat.data[i].custom_counter_data.updateProbability;
                        if (!Object.keys(dat.data[i].custom_counter_data).length) {
                            delete dat.data[i].custom_counter_data;
                        }
                    }
                }
            }

            if (!dat.partialExports.apiUpdates) {
                for (i = 0; i < dat.data.length; i++) {
                    delete dat.data[i].last_api_count;
                }
            }

            if (!dat.partialExports.viewAndVideoCounts && ['livecountsnet', 'akshatmittal', 'livecountseditvideo', 'akshatmittalvideo'].includes(dat.saveType)) {
                dat.data = dat.data.slice(0, 1);
            }
        }

        if (!dat.partialExports.viewAndVideoCounts && ['livecountsnet', 'akshatmittal', 'livecountseditvideo', 'akshatmittalvideo'].includes(dat.saveType)) {
            delete dat.viewCounters;
        }
        if (!dat.partialExports.charts) {
            if (dat.cardStyles) {
                delete dat.cardStyles.showChart;
                delete dat.cardStyles.chartLineColor;
                delete dat.cardStyles.chartGridColor;
                delete dat.cardStyles.chartCreditsEnabled;
                delete dat.cardStyles.showChartGrid;
                delete dat.cardStyles.chartBaseColor;
            }
            delete dat.liveGraph;
            delete dat.liveGraph2;
            delete dat.maxChartValues;
            delete dat.saveChartData;
            delete dat.graphDates;
            delete dat.graphValues;
            delete dat.useStaticGraph;
        }
        if (!dat.partialExports.designSettings) {
            delete dat.showImages;
            delete dat.showNames;
            delete dat.showCounts;
            delete dat.showRankings;
            delete dat.showBanners;
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
            delete dat.footerText;
            delete dat.footerText2;
            delete dat.gapText;
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
            delete dat.nameColor;
            delete dat.footerColor;
            delete dat.fadeName;
            delete dat.fadeNameLength;
            delete dat.nameAlignment;
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
            delete dat.gapMethod;
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
            if (!dat.partialExports.styles) {
                delete dat.importFromGoogleFonts;
            }
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

        if (!dat.partialExports.lceditThemeSettings) {
            delete dat.lceditThemeSettings;
        }

        if (!dat.partialExports.lcnetSettings) {
            delete dat.lcnetSettings;
        }

        if (!dat.partialExports.ytStudioSettings) {
            delete dat.ytStudioSettings;
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
    a.download = (COUNTER_THEME || 'export') + '.json';
    a.click();
    delete a;
}

class Channel {
    constructor(options = {}) {
        this.id = options.id || uuidGen();
        this.name = options.name || 'User';
        this.count = parseFloat(options.count) || 0;
        this.image = options.image || '/default.png'
        if (COUNTER_THEME && COUNTER_THEME.includes('video')) {
            this.name = 'Video';
            this.image = '/default_thumbnail.jpg';
        }
        this.min_gain = parseFloat(options.min_gain) || 0;
        this.max_gain = parseFloat(options.max_gain) || 0;
        this.mean_gain = parseFloat(options.mean_gain);
        this.std_gain = parseFloat(options.std_gain);
        this.mean_gain_value = parseFloat(options.mean_gain_value) || 0;
        this.std_gain_value = parseFloat(options.std_gain_value) || 0;
        this.gain_type = options.gain_type || (isFinite(this.mean_gain) && isFinite(this.std_gain) ? 'gaussian' : 'uniform');
        this.bg = options.bg || '';
        this.banner = options.banner || '/default_banner.png';
        this.gain_per = options.gain_per || 'updateInterval';
        this.last_api_count = parseFloat(options.last_api_count);
        this.gain_per_number = parseFloat(options.gain_per_number) || 1;
        if (options.custom_counter_data && typeof options.custom_counter_data === 'object' && !Array.isArray(options.custom_counter_data)) {
            this.custom_counter_data = structuredClone(options.custom_counter_data);
        } else {
            this.custom_counter_data = Object.create(null);
        }
    }

    getDisplayedCount(index = 0) {
        if (data.abbreviate && this.isSubCounter()) return abb(this.getUnabbreviatedCount());
        else return this.getUnabbreviatedCount();
    }

    getUnabbreviatedCount() {
        if (!data.allowNegative && this.count < 0) this.count = 0;
        this.count = clamp(this.count, -Channel.MAX_MAGNITUDE, Channel.MAX_MAGNITUDE);
        return isFinite(this.count) ? Math.floor(this.count) : 0;
    }

    getGainMultiplier() {
        let gainPerNumber = this.gain_per_number;
        if (!gainPerNumber) gainPerNumber = 1;
        gainPerNumber = clamp(gainPerNumber, 0.001, Number.MAX_VALUE);
        this.gain_per_number = gainPerNumber;

        let updateProbability = this.custom_counter_data.updateProbability;
        if (!isFinite(updateProbability)) {
            this.custom_counter_data.updateProbability = 100;
            updateProbability = 100;
        }
        updateProbability = clamp(updateProbability, 0, 100);
        updateProbability /= 100;

        switch (this.gain_per) {
            case 'second':
                return data.updateInterval / 1_000 / gainPerNumber / updateProbability;
            case 'minute':
                return data.updateInterval / 60_000 / gainPerNumber / updateProbability;
            case 'hour':
                return data.updateInterval / 3_600_000 / gainPerNumber / updateProbability;
            case 'day':
                return data.updateInterval / 86_400_000 / gainPerNumber / updateProbability;
            default:
                return 1 / gainPerNumber / updateProbability;
        }
    }

    gain() {

        // Ignore gains if using a real sub count
        if (data.apiUpdates.enabled) {
            const index = this.getIndex();
            if (data.apiUpdates.forceUpdates) {
                const shouldFetchFirst = !COUNTER_THEME.includes('compare') || data.apiUpdates.updateSide != '2';
                const shouldFetchSecond = COUNTER_THEME.includes('compare') && data.apiUpdates.updateSide != '1';
                if (shouldFetchFirst && index === 0) return;
                if (shouldFetchSecond && index === 1) return;
            }
            if (!this.isSubCounter() && data.apiUpdates.response.count.enabled && index === 0) return;
            if (!this.isSubCounter() && data.apiUpdates.response.views?.enabled && index === 1) return;
            if (!this.isSubCounter() && data.apiUpdates.response.videos?.enabled && index === 2) return;
            if (!this.isSubCounter() && data.apiUpdates.response.comments?.enabled && index === 3) return;
        }

        if (!isFinite(this.custom_counter_data.updateProbability)) {
            this.custom_counter_data.updateProbability = 100;
        }

        this.custom_counter_data.updateProbability = clamp(this.custom_counter_data.updateProbability, 0, 100);
        if (Math.random() >= (this.custom_counter_data.updateProbability / 100)) return;

        let multiplier = this.getGainMultiplier();
        let gain = 0;
        if (this.gain_type === 'gaussian') {
            gain = randomGaussian(this.mean_gain * multiplier, this.std_gain * Math.sqrt(multiplier));
            // With normally distributed gains, this results in the variability being accurate
            // This is possible because normal distribution + normal distribution = normal distribution
        } else if (this.gain_type === 'custom') {
            gain = randomFromCustomDistribution(this.custom_counter_data.custom_distribution) * multiplier;
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

        if (this.custom_counter_data.min != undefined && isFinite(this.custom_counter_data.min) && this.count < this.custom_counter_data.min) {
            this.count = this.custom_counter_data.min;
        }

        if (this.custom_counter_data.max != undefined && isFinite(this.custom_counter_data.max) && this.count > this.custom_counter_data.max) {
            this.count = this.custom_counter_data.max;
        }
    }

    calculateMeanOfCustomDistribution() {
        try {
            // The formula for calculating the average for a custom distribution is:
            // sum of (min + max) / 2 * probability for each entry
            const totalWeight = this.custom_counter_data.custom_distribution.totalWeight;
            let avg = 0;
            for (const row of this.custom_counter_data.custom_distribution.entries) {
                avg += (row.min + row.max) * row.weight;
            }
            avg /= (totalWeight + totalWeight);
            if (!isFinite(avg)) avg = 0;
            return avg;
        } catch (err) {
            return 0;
        }
    }

    // Get the mean gain per update interval
    getUnitMeanGain() {
        const multiplier = this.getGainMultiplier();
        if (this.gain_type === 'gaussian') {
            return this.mean_gain * multiplier;
        } else if (this.gain_type === 'custom') {
            return this.calculateMeanOfCustomDistribution() * multiplier;
        } else {
            return avg(this.min_gain, this.max_gain) * multiplier;
        }
    }

    // Get to standard deviation of gain per update interval
    getUnitStDevGain() {
        const multiplier = this.getGainMultiplier();
        if (this.gain_type === 'gaussian') {
            /*
                The number of update intervals in "gain per" is 1 / multiplier.
                We want the standard deviation after this "gain per" duration to be std_gain.
                Sum of n i.i.d. normal random variables with standard deviation 
                s / sqrt(n) or variance s^2 / n will have variance s^2 or standard deviation s.
            */
            return this.std_gain * Math.sqrt(multiplier);
        } else if (this.gain_type === 'custom') {
            /*
                For a custom distribution we use the statistical formula for variance:
                variance = mean of X^2 - (mean of X)^2.
                
                The mean of X^2 for each piece is the second moment of the uniform distribution
                From https://en.wikipedia.org/wiki/Continuous_uniform_distribution:
                mean of X^2 = (b^3-a^3)/(3*(b-a))
                This simplifies to (a^2+ab+b^2)/3, the formula used here.
                We multiply the contribution from each piece by its probability (w / totalWeight).
            */
            let variance = 0;
            const avg = this.calculateMeanOfCustomDistribution();
            try {
                const totalWeight = this.custom_counter_data.custom_distribution.totalWeight;
                for (const row of this.custom_counter_data.custom_distribution.entries) {
                    const a = row.min, b = row.max, w = row.weight;
                    variance += (a * a + a * b + b * b) * w / totalWeight / 3;
                }
                variance -= avg * avg;
                return Math.sqrt(Math.max(0, variance));
            } catch (err) {
                return 0;
            }
        } else {
            // The standard deviation of a uniform distribution is (max - min) / sqrt(12)
            // https://en.wikipedia.org/wiki/Continuous_uniform_distribution
            return Math.abs(this.max_gain - this.min_gain) * multiplier / Math.sqrt(12);
        }
    }

    // Offline gains are gains added to compensate for the time the save wasn't loaded in the browser
    // e.g. when tab is closed. It DOES NOT refer to gains for users that are not active on stream.
    offlineGain(gainImmediately = true) {
        // Don't do offline gains if disabled or paused, or if the last saved time isn't set
        // or if API updates are enabled and force updated
        if (data.pause || !data.offlineGains || typeof data.lastOnline !== 'number' 
            || !isFinite(data.lastOnline) || (data.apiUpdates.enabled && data.apiUpdates.forceUpdates)) return;
        
        let intervalsElapsed = (Date.now() - data.lastOnline) / data.updateInterval;

        // Subtract 1 if the counter gains immediately after adjusting for offline gains.
        if (gainImmediately) intervalsElapsed--;

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

        if (this.custom_counter_data.min != undefined && isFinite(this.custom_counter_data.min) && this.count < this.custom_counter_data.min) {
            this.count = this.custom_counter_data.min;
        }

        if (this.custom_counter_data.max != undefined && isFinite(this.custom_counter_data.max) && this.count > this.custom_counter_data.max) {
            this.count = this.custom_counter_data.max;
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

    getIndex() {
        return data.data.findIndex(x => x.id === this.id);
    }

    isSubCounter() {
        const index = this.getIndex();
        return COUNTER_THEME === 'top50' || (COUNTER_THEME.includes('compare') ? index <= 1 : (COUNTER_THEME.includes('video') ? false : index === 0));
    }

    static doGains() {
        data.data.forEach(x => x.gain());
    }

    static doOfflineGains() {
        data.data.forEach(x => x.offlineGain());
    }

    // Prevents counter from crashing with too many digits
    static MAX_MAGNITUDE = 999999999999999900000;

    // Calculates the next abbreviation milestone
    // e.g. for 12,345 it is 12,400, for 100,000 it is 101,000
    static calculateNextAbbreviationMilestone(count) {
        if (count < 0) return 0;
        if (count < 1000) return Math.floor(count) + 1;
        return abb(count) + 10 ** (Math.floor(Math.log10(count) - 2));
    }
}

async function importData(imported) {
    // v7 Livecountsedit and Livecounts.net saves
    if (typeof imported.saveType === 'number') {
        try {
            imported = convert_lcedit_7_0_to_top_50(imported);
            console.log()
        } catch (err) {
            alert('An error occurred while converting your save file.')
            console.error(err);
            imported = {};
        }
        //return alert('Saves from v7 Livecountsedit and Livecounts.net themes are not supported yet.')
    } else if ('graphDates' in imported && Array.isArray(imported.graphDates)) {
        // YT Studio saves
        try {
            imported = convert_yt_studio_to_top_50(imported);
            console.log()
        } catch (err) {
            alert('An error occurred while converting your save file.')
            console.error(err);
            imported = {};
        }
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
        const action = confirm("You are doing a partial import, so not all settings are included. Do you want to merge the partial import with what you already have? If not, press Cancel and everything that isn't imported will be reset!");
        if (!action) {
            data = mergeWithExampleData(imported, example_data, true);
        } else {
            data = mergeWithExampleData(imported, data, true);
        }
    } else {
        data = mergeWithExampleData(imported, example_data, true);
    }
    if (!data.data) data.data = [];
    data.data = data.data.map(x => new Channel(x));
    await processImport(imported);
    fillMenus();
    saveAPISettings(false);
}

function saveAPISettings(shouldAlert = false) {
    // for compatibility with top 50. do not delete
} 

// needs to be implemented by individual counters
async function processImport(imported) {
    return imported;
}

function promptOBSMode() {
    const dialog = document.createElement('dialog');
    const div = document.createElement('div');
    div.innerHTML = 'Are you sure you want to enable OBS Browser Mode?<br>You cannot disable this without refreshing.<br>Be sure to read our <a href="https://github.com/livecountsedit/livecountsedit.github.io/wiki/OBS-Browser-Tutorial">OBS Browser tutorial</a> first to make sure you know what you\'re doing!'
    div.style.maxWidth = '500px';
    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.textAlign = 'center';
    const yesButton = document.createElement('button')
    yesButton.innerText = 'Yes';
    yesButton.style.backgroundColor = 'lightgreen';
    yesButton.style.marginRight = '150px';
    yesButton.onclick = () => {
        dialog.close();
        dialog.remove();
        delete dialog;
        enableOBSMode();
    }
    const noButton = document.createElement('button');
    noButton.innerText = 'No';
    noButton.style.backgroundColor = 'pink';
    noButton.onclick = () => {
        dialog.close();
        dialog.remove();
        delete dialog;
    }
    buttonsDiv.append(yesButton, noButton);
    dialog.append(div, buttonsDiv);
    document.body.appendChild(dialog);
    dialog.showModal();
}

function enableOBSMode() {
    document.getElementById('obsModeB').disabled = true;
    document.getElementById('obsModeB').innerText = 'OBS Browser Mode Enabled';
    // disable OBS browser-incompatible prompts
    window.alert = function () {};
    window.confirm = function () { return true; };
    window.prompt = function () { return ''; };

    document.querySelectorAll('.no-obs-mode').forEach(x => x.style.display = 'none');
    document.querySelectorAll('.obs-mode').forEach(x => x.classList.remove('obs-mode'));
}

function obsImport() {
    document.getElementById('obsImportFile').click();
}

function obsExport() {
    try {
        navigator.clipboard.writeText(JSON.stringify(data));
        showDialog('Data copied to clipboard.<br>Be sure to read our <a href="https://github.com/livecountsedit/livecountsedit.github.io/wiki/OBS-Browser-Tutorial">OBS Browser tutorial</a> so you know how to get the data out of the browser source!')
    } catch (err) {
        showDialog('An error occurred while trying to export data :(')
        console.error(err);
    }

}

function showDialog(html) {
    const dialog = document.createElement('dialog');
    const div = document.createElement('div');
    div.innerHTML = html;
    const buttonDiv = document.createElement('div');
    buttonDiv.style.textAlign = 'right';
    const button = document.createElement('button');
    button.innerText = 'OK';
    button.style.marginRight = '10px';
    button.onclick = () => {
        dialog.close();
        dialog.remove();
        delete dialog;
    }
    buttonDiv.append(button);
    dialog.append(div, buttonDiv);
    document.body.append(dialog);
    dialog.showModal();
}

function loadOBSMode() {
    const obsMode = localStorage.getItem('obs-' + COUNTER_THEME);
    localStorage.removeItem('obs-' + COUNTER_THEME);
    if (obsMode) enableOBSMode();
}

function loadMyFont() {
    if (data.headerFont && !document.getElementById('font-' + data.headerFont)) {
        const fontStuff = document.createElement('link');
        fontStuff.href = `https://fonts.googleapis.com/css?family=${encodeURIComponent(data.headerFont).replaceAll("%20", "+")}:100,200,300,400,500,600,700,800,900&display=swap`;
        fontStuff.className = 'font';
        fontStuff.rel = 'stylesheet';
        fontStuff.id = 'font-' + data.headerFont;
        document.head.appendChild(fontStuff);
    }

    if (data.mainFont && !document.getElementById('font-' + data.mainFont)) {
        const fontStuff = document.createElement('link');
        fontStuff.href = `https://fonts.googleapis.com/css?family=${encodeURIComponent(data.mainFont).replaceAll("%20", "+")}:100,200,300,400,500,600,700,800,900&display=swap`;
        fontStuff.className = 'font';
        fontStuff.rel = 'stylesheet';
        fontStuff.id = 'font-' + data.mainFont;
        document.head.appendChild(fontStuff);
    }
}

function formatNumber(num, options) {
    switch (data.numberFormat) {
        case 'dot':
            return num.toLocaleString('de-DE', options);
        case 'space':
            return num.toLocaleString('en-US', options).replace(/,/g, '\u00a0');
        case 'spaceComma':
            return num.toLocaleString('de-DE', options).replace(/\./g, '\u00a0');
        case 'indian':
            return num.toLocaleString('hi-IN', options);
        case 'apo':
            return num.toLocaleString('en-US', options).replace(/,/g, "'");
        case 'apoComma':
            return num.toLocaleString('de-DE', options).replace(/\./g, "'");
        case 'noSep':
            if (!options) options = {};
            options.useGrouping = false;
            return num.toLocaleString('US', options);
        case 'noSepComma':
            if (!options) options = {};
            options.useGrouping = false;
            return num.toLocaleString('DE', options);
        default:
            return num.toLocaleString('en-US', options);
    }
}

function updateOdo() {
    
    odometers = Odometer.init();

    for (const odometer of odometers) {

        odometer.options.duration = parseFloat(data.odometerSpeed) * 1000 || 2000;
        if (data.animationType === 'counting') {
            odometer.options.animation = 'count';
        } else if (data.animationType === 'ytstudio') {
            odometer.options.animation = 'byDigit';
        } else if (data.animationType === 'minimal') {
            odometer.options.animation = 'minimal';
        } else {
            delete odometer.options.animation;
        }

        if (window.COUNTER_THEME !== 'top50' && data.useOdometerColors) {
            odometer.options.upColor = data.odometerUp;
            odometer.options.downColor = data.odometerDown;
        } else {
            delete odometer.options.upColor;
            delete odometer.options.downColor;
        }

        odometer.options.removeLeadingZeros = data.animationType === 'ytstudio';
        odometer.options.reverseAnimation = data.reverseAnimation;
        odometer.options.formatFunction = formatNumber;
        odometer.render();
    }
}

function download(fileData, fileName = 'export.json') {
    const file = new Blob([typeof fileData === 'object' ? JSON.stringify(fileData) : fileData], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    delete a;
}