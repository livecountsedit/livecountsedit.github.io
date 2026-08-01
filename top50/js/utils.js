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

function formatRank(rank) {
    if (!data.prependZeros) return rank;
    let totalNums = document.querySelectorAll('.num').length;
    if (totalNums < 100) {
        if (rank < 10) return "0" + rank;
        return rank;
    } else {
        if (rank < 10) return "00" + rank;
        if (rank < 100) return "0" + rank;
        return rank;
    }
}

function getGain(counterId) {

    let entry = gainTable[counterId];
    if (!entry || entry.length < 2) return 0;
    let slicedEntry = entry.slice(-(data.gainAverageOf + 1));
    return (slicedEntry[slicedEntry.length - 1] - slicedEntry[0]) / (slicedEntry.length - 1);
}

function getHourlyGain(counterId) {
    if (!data.updateInterval || data.updateInterval === 0) return 0;
    const updatesPerHour = 3600 / (data.updateInterval / 1000);
    return getGain(counterId) * updatesPerHour;
}

function replaceHeaderVariables(text) {
    if (!text || typeof text !== 'string') return text;

    // Get sorted leaderboard by gain (descending - highest first)
    const sortedData = [...data.data].sort((a, b) => getGain(b.id) - getGain(a.id));

    // Helper function to replace variables for a specific rank
    const replaceVariablesForRank = (template, rank) => {
        let result = template;
        const index = rank - 1; // Convert to 0-based index

        // Replace $name (without number) with name at this rank
        result = result.replace(/\$name(?!\d|\(|\()/g, () => {
            if (index >= 0 && index < sortedData.length && sortedData[index]) {
                return escapeHTML(sortedData[index].name || 'N/A');
            }
            return 'N/A';
        });

        // Replace $abbhourly with abbreviated hourly gain
        result = result.replace(/\$abbhourly(?!\d|\(|\()/g, () => {
            if (index >= 0 && index < sortedData.length && sortedData[index]) {
                const hourly = getHourlyGain(sortedData[index].id);
                return abbs(Math.floor(hourly));
            }
            return '0';
        });

        // Replace $hourly (without number) with hourly gain at this rank
        result = result.replace(/\$hourly(?!\d|\(|\()/g, () => {
            if (index >= 0 && index < sortedData.length && sortedData[index]) {
                const hourly = getHourlyGain(sortedData[index].id);
                return formatNumber(Math.floor(hourly));
            }
            return '0';
        });

        // Replace $abbcount with abbreviated count
        result = result.replace(/\$abbcount(?!\d|\(|\()/g, () => {
            if (index >= 0 && index < sortedData.length && sortedData[index]) {
                return abbs(Math.floor(sortedData[index].count || 0));
            }
            return '0';
        });

        // Replace $count (without number) with count at this rank
        result = result.replace(/\$count(?!\d|\(|\()/g, () => {
            if (index >= 0 && index < sortedData.length && sortedData[index]) {
                return formatNumber(Math.floor(sortedData[index].count || 0));
            }
            return '0';
        });

        // Replace $rank with the rank number itself
        result = result.replace(/\$rank(?!\d|\(|\()/g, () => {
            return rank.toString();
        });

        return result;
    };

    let result = text;

    // Process $repeat(start-end, template) first
    result = result.replace(/\$repeat\((\d+)-(\d+),\s*([^)]+)\)/g, (match, start, end, template) => {
        const startNum = parseInt(start);
        const endNum = parseInt(end);
        const parts = [];

        // Parse template - split by commas but preserve quoted strings
        const templateParts = [];
        let currentPart = '';
        let inQuotes = false;

        for (let i = 0; i < template.length; i++) {
            const char = template[i];
            if (char === '"' || char === "'") {
                inQuotes = !inQuotes;
                currentPart += char;
            } else if (char === ',' && !inQuotes) {
                if (currentPart.trim()) {
                    templateParts.push(currentPart.trim());
                }
                currentPart = '';
            } else {
                currentPart += char;
            }
        }
        if (currentPart.trim()) {
            templateParts.push(currentPart.trim());
        }

        // Generate output for each rank in range
        for (let rank = startNum; rank <= endNum; rank++) {
            const rankParts = templateParts.map(part => replaceVariablesForRank(part, rank));
            parts.push(rankParts.join(' ')); // Join parts with spaces
        }

        return parts.join('\n'); // Join each rank's output with newlines
    });

    // Match patterns like $name1 or $name(1), $hourly1 or $hourly(1), $count1 or $count(1)
    // Supports both formats: $name1 and $name(1)
    result = result.replace(/\$name\((\d+)\)|\$name(\d+)/g, (match, rankParen, rankDirect) => {
        const rank = rankParen || rankDirect;
        const index = parseInt(rank) - 1; // Convert to 0-based index
        if (index >= 0 && index < sortedData.length && sortedData[index]) {
            return escapeHTML(sortedData[index].name || 'N/A');
        }
        return 'N/A';
    });

    result = result.replace(/\$abbhourly\((\d+)\)|\$abbhourly(\d+)/g, (match, rankParen, rankDirect) => {
        const rank = rankParen || rankDirect;
        const index = parseInt(rank) - 1;
        if (index >= 0 && index < sortedData.length && sortedData[index]) {
            const hourly = getHourlyGain(sortedData[index].id);
            return abbs(Math.floor(hourly));
        }
        return '0';
    });

    result = result.replace(/\$hourly\((\d+)\)|\$hourly(\d+)/g, (match, rankParen, rankDirect) => {
        const rank = rankParen || rankDirect;
        const index = parseInt(rank) - 1;
        if (index >= 0 && index < sortedData.length && sortedData[index]) {
            const hourly = getHourlyGain(sortedData[index].id);
            return formatNumber(Math.floor(hourly));
        }
        return '0';
    });

    result = result.replace(/\$abbcount\((\d+)\)|\$abbcount(\d+)/g, (match, rankParen, rankDirect) => {
        const rank = rankParen || rankDirect;
        const index = parseInt(rank) - 1;
        if (index >= 0 && index < sortedData.length && sortedData[index]) {
            return abbs(Math.floor(sortedData[index].count || 0));
        }
        return '0';
    });

    result = result.replace(/\$count\((\d+)\)|\$count(\d+)/g, (match, rankParen, rankDirect) => {
        const rank = rankParen || rankDirect;
        const index = parseInt(rank) - 1;
        if (index >= 0 && index < sortedData.length && sortedData[index]) {
            return formatNumber(Math.floor(sortedData[index].count || 0));
        }
        return '0';
    });

    return result;
}

function clearGainData() {
    if (confirm("Are you sure you want to clear the gain data?")) {
        gainTable = {};
    }
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

function getDisplayedCount(n) {
    if (!isFinite(n)) n = 0;
    if (!data.allowNegative && n < 0) n = 0;
    if (data.abbreviate) return abb(n);
    else return Math.floor(n);
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
    return (a + b) / 2
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function adjustColors() {
    let c = document.getElementById("backPicker")?.value || document.body.style.backgroundColor;
    if (!c) return;
    let r, g, b;
    if (c.startsWith('#')) {
        c = c.replace('#', '');
        const color = parseInt(c, 16);
        r = (color >> 16);
        g = (color >> 8) & 0xff;
        b = color & 0xff;
    } else {
        c = c.replace('rgb(', '');
        const color = c.split(',').map(x => parseInt(x, 10));
        r = color[0];
        g = color[1];
        b = color[2];
    }
    const brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const textLabels = document.querySelector(".bottom-stuff").querySelectorAll("label,h1,h2,h3,h4,h5,h6,p,strong,input[type=file]");
    const links = document.querySelector(".bottom-stuff").querySelectorAll("a:link");
    if (brightness < 0.5) {
        for (i = 0; i < textLabels.length; i++) {
            if (!textLabels[i].classList.contains('subgap')) {
                textLabels[i].style.color = '#fff';
            }
        }
        for (i = 0; i < links.length; i++) {
            links[i].style.color = 'cyan';
        }
    } else {
        for (i = 0; i < textLabels.length; i++) {
            if (!textLabels[i].classList.contains('subgap')) {
                textLabels[i].style.color = '#000';
            }
        }
        for (i = 0; i < links.length; i++) {
            links[i].style.color = 'blue';
        }
    }
}

function mergeWithExampleData(imported, example) {
    if (typeof imported !== 'object' || imported === null) return example;
    for (let key in example) {
        if (!imported.hasOwnProperty(key)) {
            imported[key] = example[key];
        } else if (typeof example[key] === 'object' && !Array.isArray(example[key])) {
            imported[key] = mergeWithExampleData(imported[key], example[key]);
        }
    }

    return imported;
}

function saveData(alert2) {
    if (data.debugMode) console.log("Attempting to save...")
    try {
        data.lastOnline = Date.now();
        localStorage.setItem("data", JSON.stringify(data));
        document.getElementById("storage-warning").style.display = "none";
        if (alert2) {
            alert("Saved!");
        }
        if (data.debugMode) console.log("Saved in browser.");
    } catch (error) {
        if (alert2) {
            alert(`Error: ${error}`);
        }
        if (data.debugMode) console.error("Failed to save in browser: " + error)
        document.getElementById("storage-warning").style.display = "block";
    }
}

function saveGainRateOption() {
    data.gainAverageOf = Math.max(1, Math.round(document.getElementById('gainAverageOf').value));
}

function randomGaussian(mean, stdev) {
    let a = 0, b = 0;
    while (!a) a = Math.random();
    while (!b) b = Math.random();
    return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b) * stdev + mean;
}

function average(num1, num2) {
    return (num1 + num2) / 2
}

function getSubs(id) {
    for (let i = 0; i < data.data.length; i++) {
        if (data.data[i].id == id) {
            return data.data[i].count;
        }
    }
    return 0;
}

function getMinGain(id) {
    for (let i = 0; i < data.data.length; i++) {
        if (data.data[i].id == id) {
            return data.data[i].min_gain;
        }
    }
    return 0;
}

function getName(id) {
    for (let i = 0; i < data.data.length; i++) {
        if (data.data[i].id == id) {
            return data.data[i].name;
        }
    }
    return '';
}

function getImage(id) {
    for (let i = 0; i < data.data.length; i++) {
        if (data.data[i].id == id) {
            return data.data[i].image;
        }
    }
    return '../default.png';
}

function getMaxGain(id) {
    for (let i = 0; i < data.data.length; i++) {
        if (data.data[i].id == id) {
            return data.data[i].max_gain;
        }
    }
    return 0;
}

function getRankOf(id) {
    return data.data.findIndex(x => x.id === id) + 1;
}

function randomColor() {
    let color = '#'
    for (let i = 0; i < 6; i++) {
        color += Math.floor(Math.random() * 16).toString(16)
    }
    return color
}

function mean(a, b) {
    return (a + b) / 2
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

function isValidHeaderName(name) {
    return typeof name === 'string' && name && name.trim() && !name.match(/[<>'"&\\]/)
}

function hasDuplicates(arr) {
    const set = new Set();
    for (const item of arr) {
        if (set.has(item)) return true;
        else set.add(item);
    }
    return false;
}

function calculateFires() {
    fires.clear();
    for (let i = 0; i < data.data.length; i++) {
        for (let q = 0; q < data.fireIcons.created.length; q++) {
            let equation = false;
            //either gain or total
            if (data.fireIcons.type == 'total') {
                if (data.fireIcons.created[q].method == '>=') {
                    if (data.data[i].count >= data.fireIcons.created[q].threshold) {
                        equation = true;
                    }
                } else if (data.fireIcons.created[q].method == '==') {
                    if (data.data[i].count == data.fireIcons.created[q].threshold) {
                        equation = true;
                    }
                } else if (data.fireIcons.created[q].method == '<=') {
                    if (data.data[i].count <= data.fireIcons.created[q].threshold) {
                        equation = true;
                    }
                } else {
                    if (data.data[i].count != data.fireIcons.created[q].threshold) {
                        equation = true;
                    }
                }
            } else if (data.fireIcons.type == 'gain') {
                if (data.fireIcons.created[q].method == '>=') {
                    if (getGain(data.data[i].id) >= data.fireIcons.created[q].threshold) {
                        equation = true;
                    }
                } else if (data.fireIcons.created[q].method == '==') {
                    if (getGain(data.data[i].id) == data.fireIcons.created[q].threshold) {
                        equation = true;
                    }
                } else if (data.fireIcons.created[q].method == '<=') {
                    if (getGain(data.data[i].id) <= data.fireIcons.created[q].threshold) {
                        equation = true;
                    }
                } else {
                    if (getGain(data.data[i].id) != data.fireIcons.created[q].threshold) {
                        equation = true;
                    }
                }
            } else if (data.fireIcons.type == 'hour') {
                let subs = getGain(data.data[i].id)

                let updateInterval = data.updateInterval / 1000;
                let updatesPerHour = 3600 / updateInterval;

                let subsPerUpdateThreshold = data.fireIcons.created[q].threshold / updatesPerHour;

                if (data.fireIcons.created[q].method == '>=') {
                    equation = subs >= subsPerUpdateThreshold;
                } else if (data.fireIcons.created[q].method == '==') {
                    equation = subs == subsPerUpdateThreshold;
                } else if (data.fireIcons.created[q].method == '<=') {
                    equation = subs <= subsPerUpdateThreshold;
                } else {
                    equation = subs != subsPerUpdateThreshold;
                }
            }

            if (equation) {
                fires.set(data.data[i].id, q);
                break;
            }
        }
    }
}

function applyFire(currentCard, i, enable) {
    const num = formatRank(i + 1);
    if (data.fireIcons.enabled && enable) {
        let firePosition = data.fireIcons.firePosition;
        if (firePosition == 'before' || firePosition == 'after') {
            document.getElementById("fireStyles").innerHTML = `.num { display: flex; }`;
        } else {
            document.getElementById("fireStyles").innerHTML = ``;
        }

        const fireIcon = i >= 0 ? fires.get(data.data[i].id) : null;

        if (fireIcon != undefined) {
            let icon = data.fireIcons.created[fireIcon].icon;
            let fire = document.createElement('img');
            fire.classList = 'fireIcon';
            fire.style = `height: 1.5em;
                border: solid ${escapeHTML(data.fireIcons.fireBorderWidth)}px ${escapeHTML(data.fireIcons.fireBorderColor)};`;
            fire.src = escapeHTML(icon);

            if (firePosition == 'replace') {
                currentCard.querySelector(".num").innerHTML = fire.outerHTML;
            } else if (firePosition == 'before') {
                currentCard.querySelector(".num").innerHTML = fire.outerHTML + `<div class="num_text">${num}</div>`;
            } else if (firePosition == 'after') {
                currentCard.querySelector(".num").innerHTML = `<div class="num_text">${num}</div>` + fire.outerHTML;
            } else if (firePosition == 'above') {
                currentCard.querySelector(".num").innerHTML = fire.outerHTML + `<br><div class="num_text">${num}</div>`;
            } else if (firePosition == 'below') {
                currentCard.querySelector(".num").innerHTML = `<div class="num_text">${num}</div><br>` + fire.outerHTML;
            } else if (firePosition == 'left') {
                //if (!currentCard.querySelector(".name").innerHTML.includes('<img class="fireIcon"')) {
                if (!Array.from(currentCard.querySelector(".name")).some(x => x.classList.contains("fireIcon"))) {
                    currentCard.querySelector(".name").innerHTML = fire.outerHTML + currentCard.querySelector(".name").innerHTML;
                    currentCard.querySelector(".num").innerHTML = `<div class="num_text">${num}</div>`;
                }
            } else if (firePosition == 'right') {
                if (!Array.from(currentCard.querySelector(".name")).some(x => x.classList.contains("fireIcon"))) {
                    currentCard.querySelector(".name").innerHTML = currentCard.querySelector(".name").innerHTML + fire.outerHTML;
                    currentCard.querySelector(".num").innerHTML = `<div class="num_text">${num}</div>`;
                }
            } else if (firePosition == 'replaceName') {
                currentCard.querySelector(".name").innerHTML = fire.outerHTML;
                currentCard.querySelector(".num").innerHTML = `<div class="num_text">${num}</div>`;
            } else if (firePosition == 'mdm') {
                currentCard.querySelector(".num").style.color = `${data.fireIcons.created[fireIcon].color}`;
                currentCard.querySelector(".num").style.border = `solid ${data.fireIcons.fireBorderColor} ${data.fireIcons.fireBorderWidth}px`
                currentCard.querySelector(".num").style.backgroundImage = `url(${escapeHTML(icon)})`;
                currentCard.querySelector(".num").innerHTML = `<div class="num_text">${num}</div>`;
                currentCard.querySelector(".num_text").style.marginTop = data.fireIcons.created[fireIcon].margin ? data.fireIcons.created[fireIcon].margin + "px" : "";
                currentCard.querySelector(".num_text").style.marginLeft = data.fireIcons.created[fireIcon].marginLeft ? data.fireIcons.created[fireIcon].marginLeft + "px" : "";
            } else {
                currentCard.querySelector(".num").innerHTML = `<div class="num_text">${num}</div>`;
            }
            if (currentCard.querySelector(".num_text")) currentCard.querySelector(".num_text").style.fontWeight = data.fireIcons.created[fireIcon].fontWeight;
        } else {
            if (currentCard.querySelector(".num_text")) currentCard.querySelector(".num_text").style.fontWeight = "";
            currentCard.querySelector(".num").innerHTML = `<div class="num_text">${num}</div>`;
            if (firePosition == 'mdm') {
                currentCard.querySelector(".num").style.backgroundImage = `url('')`;
                currentCard.querySelector(".num").style.color = `${data.textColor}`;
                currentCard.querySelector(".num").style.border = "";
                currentCard.querySelector(".num_text").style.marginTop = "";
                currentCard.querySelector(".num_text").style.marginLeft = "";
            }
        }
    } else {
        document.getElementById("fireStyles").innerHTML = ``;
        currentCard.querySelector(".num").innerHTML = `<div class="num_text">${num}</div>`;
        currentCard.querySelector(".num").style.border = "";
        currentCard.querySelector(".num_text").innerText = num;
        currentCard.querySelector(".num_text").style.fontWeight = "";
        currentCard.querySelector(".num").style.backgroundImage = `url('')`;
        currentCard.querySelector(".num").style.color = `${data.textColor}`;
        currentCard.querySelector(".num_text").style.marginTop = "";
        currentCard.querySelector(".num_text").style.marginLeft = "";
        currentCard.querySelector(".num").style.border = "";
    }
}

function updateFires() {
    for (let i = 0; i < data.max; i++) {
        applyFire(document.getElementsByClassName("card")[i], i, true);
    }
    loadHeader();
}

function parseMinMax(str) {
    if (!str) return [1, Infinity];
    if (str === "" + parseInt(str) && parseInt(str) > 0) {
        return [parseInt(str), parseInt(str)];
    } else if (str.endsWith('+') && parseInt(str) > 0) {
        return [parseInt(str), Infinity]
    } else {
        const min = parseInt(str.split('-')[0]);
        const max = parseInt(str.split('-')[1]);
        if (min > 0 && max > 0) {
            if (min > max) return [max, min];
            else return [min, max];
        } else {
            return [1, Infinity];
        }
    }
}

function getSetGain(channel) {
    return isFinite(channel.mean_gain) && isFinite(channel.std_gain) ? channel.mean_gain 
    : average(channel.min_gain, channel.max_gain);
}

function estimatePassingTime(topChannel, bottomChannel) {
    const topGainSet = getSetGain(topChannel);
    const bottomGainSet = getSetGain(bottomChannel);
    const topGainObserved = getGain(topChannel.id);
    const bottomGainObserved = getGain(bottomChannel.id);
    const diff = getDisplayedCount(topChannel.count) - getDisplayedCount(bottomChannel.count);
    return data.differenceStyles.estimateUsingObservedGains ? diff / (bottomGainObserved - topGainObserved) 
    : diff / (bottomGainSet - topGainSet);
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

initializeCopyButtons();