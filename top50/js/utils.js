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
    return (entry[entry.length - 1] - entry[0]) / (entry.length - 1);
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
        
        // Replace $hourly (without number) with hourly gain at this rank
        result = result.replace(/\$hourly(?!\d|\(|\()/g, () => {
            if (index >= 0 && index < sortedData.length && sortedData[index]) {
                const hourly = getHourlyGain(sortedData[index].id);
                return Math.floor(hourly).toLocaleString('en-US');
            }
            return '0';
        });
        
        // Replace $count (without number) with count at this rank
        result = result.replace(/\$count(?!\d|\(|\()/g, () => {
            if (index >= 0 && index < sortedData.length && sortedData[index]) {
                return Math.floor(sortedData[index].count || 0).toLocaleString('en-US');
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
    
    result = result.replace(/\$hourly\((\d+)\)|\$hourly(\d+)/g, (match, rankParen, rankDirect) => {
        const rank = rankParen || rankDirect;
        const index = parseInt(rank) - 1;
        if (index >= 0 && index < sortedData.length && sortedData[index]) {
            const hourly = getHourlyGain(sortedData[index].id);
            return Math.floor(hourly).toLocaleString('en-US');
        }
        return '0';
    });
    
    result = result.replace(/\$count\((\d+)\)|\$count(\d+)/g, (match, rankParen, rankDirect) => {
        const rank = rankParen || rankDirect;
        const index = parseInt(rank) - 1;
        if (index >= 0 && index < sortedData.length && sortedData[index]) {
            return Math.floor(sortedData[index].count || 0).toLocaleString('en-US');
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
    let result = (s * r) / (1000 ** l) + (l > 5 ? "?" : " KMBTQ"[l]);
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
    let a = function () {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };
    return a() + a() + '-' + a() + '-' + a() + '-' + a() + '-' + a() + a() + a();
}

function randomGen() {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    retu
    rn (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
function avg(a, b) {
    return (a + b) / 2
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function adjustColors() {
    let c = document.body.style.backgroundColor;
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
    const textLabels = document.querySelectorAll("label,h1,h2,h3,h4,h5,h6,p,strong,input[type=file]");
    if (brightness < 0.5) {
        for (i = 0; i < textLabels.length; i++) {
            if (!textLabels[i].classList.contains('subgap')) {
                textLabels[i].style.color = '#fff';
            }
        }
    } else {
        for (i = 0; i < textLabels.length; i++) {
            if (!textLabels[i].classList.contains('subgap')) {
                textLabels[i].style.color = '#000';
            }
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
    try {
        data.lastOnline = Date.now();
        localStorage.setItem("data", JSON.stringify(data));
        document.getElementById("storage-warning").style.display = "none";
        if (alert2) {
            alert("Saved!");
        }
    } catch (error) {
        if (alert2) {
            alert(`Error: ${error}`);
        }
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