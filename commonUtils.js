const AUTOSAVE_INTERVAL = 15000;
const DB_TABLES = ['socialblade', 'top50', 'akshatmittal'];
const DB_VERSION = 3;

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
    if (partialExportOptions.length) {
        const div = document.createElement('div');
        div.className = 'partial-export-option-wrapper';
        partialExportOptions[0].parentElement.parentElement.parentElement.insertBefore(div, partialExportOptions[0].parentElement.parentElement.parentElement.firstElementChild.nextElementSibling);
        partialExportOptions.forEach(x => div.appendChild(x.parentElement.parentElement));
    }

    document.getElementById('fileImport')?.addEventListener('change', async () => {
    const importedFile = document.getElementById('fileImport').files[0];
        if (importedFile && confirm('Are you sure you want to import this save?\nMake sure you trust the source of the save! If you import a save with malicious or offensive content, it\'s on YOU!')) {
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

async function saveDataInBrowser(table, data_) {
    const db = await initDB();
    await db.put(table, data_);
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