let currentIndex = 0;
let auditTimeout;
let saveInterval;
let chart;
let nextUpdateAudit = false;
let popups = [];
let specificChannels = [];
let pickingChannels = false;
let quickSelecting = false;
let odometers = [];
function abb(n) {
    let s = Math.sign(n);
    n = Math.abs(n);
    if (n < 1) return 0;
    else return Math.floor(s * Math.floor(n / (10 ** (Math.floor(Math.log10(n)) - 2))) * (10 ** (Math.floor(Math.log10(n)) - 2)))
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
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
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
            textLabels[i].style.color = '#fff';
        }
    } else {
        for (i = 0; i < textLabels.length; i++) {
            textLabels[i].style.color = '#000';
        }
    }
}
let uuid = uuidGen()
let data = {
    "showImages": true,
    "showNames": true,
    "showCounts": true,
    "showRankings": true,
    "showBlankSlots": true,
    "showDifferences": false,
    "bgColor": "#141414",
    "textColor": "#000",
    "boxColor": "#f7f5fe",
    "boxBorder": "#FFF",
    "imageBorder": "0",
    "imageBorderColor": "#000",
    "prependZeros": false,
    "animation": true,
    "abbreviate": false,
    "fastest": true,
    "slowest": true,
    'odometerUp': 'null',
    'odometerDown': 'null',
    'odometerSpeed': 2,
    'theme': 'top50',
    "sort": "num",
    "order": "desc",
    "data": [],
    "gain_min": -10000,
    "gain_max": 10000,
    "updateInterval": 2000,
    "uuid": uuid,
    "hideSettings": 'q',
    'offlineGains': false,
    'lastOnline': new Date().getTime(),
    'visulization': 'default',
    'max': 50,
    'autosave': true,
    'pause': false,
    'audits': false,
    'auditStats': [0, 0, 0, 0],
    "hideSettings": 'q',
    "allowNegative": false,
    'apiUpdates': {
        'enabled': false,
        'url': '',
        'interval': 2000,
        'method': 'GET',
        'body': {},
        'headers': {},
        'custom': false,
        'maxChannelsPerFetch': 'one',
        'response': {
            'loop': 'data',
            'name': {
                'enabled': true,
                'path': 'name',
            },
            'count': {
                'enabled': true,
                'path': 'count',
            },
            'image': {
                'enabled': true,
                'path': 'image',
            },
            'id': {
                'path': 'id',
                'IDIncludes': false
            }
        }
    }
};
let updateInterval;
let apiInterval;

initLoad()
function initLoad(redo) {
    if (!redo) {
        data = localStorage.getItem("data") ? JSON.parse(localStorage.getItem("data")) : data;
    }
    if (!data.apiUpdates) {
        data.apiUpdates = {
            'enabled': false,
            'url': '',
            'interval': 2000,
            'method': 'GET',
            'body': '',
            'headers': '',
            'maxChannelsPerFetch': 'one',
            'response': {
                'loop': 'data',
                'name': {
                    'enabled': true,
                    'path': 'name',
                },
                'count': {
                    'enabled': true,
                    'path': 'count',
                },
                'image': {
                    'enabled': true,
                    'path': 'image',
                },
                'id': {
                    'path': 'id',
                    'IDIncludes': false
                }
            }
        }
    }
    if (data.apiUpdates.enabled) {
        apiInterval = setInterval(function () {
            apiUpdate(true);
        }, parseFloat(data.apiUpdates.interval));
    }
    if (!data.theme) {
        data.theme = 'top50';
    }
    if (data.theme.includes('top100')) {
        data.max = 100;
    } else if (data.theme.includes('top25')) {
        data.max = 25;
    } else if (data.theme.includes('top50')) {
        data.max = 50;
    } else if (data.theme.includes('top10')) {
        data.max = 10;
    } else if (data.theme.includes('top150')) {
        data.max = 150;
    }
    if ((!data.showImages) && (data.showImages !== false)) {
        data.showImages = true;
    }
    if ((!data.showNames) && (data.showNames !== false)) {
        data.showNames = true;
    }
    if ((!data.showCounts) && (data.showCounts !== false)) {
        data.showCounts = true;
    }
    if ((!data.showRankings) && (data.showRankings !== false)) {
        data.showRankings = true;
    }
    if ((!data.showBlankSlots) && (data.showBlankSlots !== false)) {
        data.showBlankSlots = true;
    }
    if ((!data.showDifferences) && (data.showDifferences !== false)) {
        data.showDifferences = true;
    }
    if (!data.imageBorderColor) {
        data.imageBorderColor = '#000';
    }
    if (!data.order) {
        data.order = 'desc';
    }
    data.pause = false;
    data.visulization = 'default';
    if (data.lastOnline && data.offlineGains == true) {
        const interval = data.updateInterval / 1000;
        const secondsPassed = (new Date().getTime() - data.lastOnline) / 1000;
        for (let i = 0; i < data.data.length; i++) {
            if (parseFloat(data.mean_gain) > 0) {
                const gain = randomGaussian(parseFloat(data.data[i].mean_gain), parseFloat(data.data[i].std_gain));
                const gained = gain * (secondsPassed / interval);
                data.data[i].count += gained;
            } else {
                const gain = average(parseFloat(data.data[i].min_gain), parseFloat(data.data[i].max_gain));
                let gained = gain * (secondsPassed / interval);
                data.data[i].count += gained;
            }
        }
        data.lastOnline = new Date().getTime();
    }
    let design = setupDesign();
    document.getElementById('main').innerHTML = design[0].innerHTML;
    document.getElementById('main').style = design[1];
    document.getElementById('designStyles').innerText = design[2];
    if (!data.uuid) {
        data.uuid = uuidGen();
    }
    document.body.style.backgroundColor = data.bgColor;
    document.body.style.color = data.textColor;
    adjustColors();
    fix();
    updateOdo();
    updateInterval = setInterval(update, data.updateInterval);
    if (data.theme.includes('A')) {
        document.getElementById('main').style = "";
        var $grid = $('.main').isotope({
            itemSelector: '.card',
            layoutMode: 'fitRows',
            getSortData: {
                name: '.name',
                number: '.number parseInt',
            },
            updateSortData: {
                number: function (elem) {
                    return parseInt($(elem).find('.number').text(), 10);
                }
            }
        });
    }
}

function setupDesign(list, sort, order) {
    let c = 1;
    let toReturn = ["", "", ""]
    let main = document.createElement('div');
    let channels = data.data;
    if (list) {
        channels = list;
    }
    if (sort) {
        channels = channels.sort(function (a, b) {
            return b[sort] - a[sort]
        });
    }
    if (order) {
        if (order == 'asc') {
            channels = channels.reverse();
        }
    }
    if (data.theme.includes('H')) {
        let cards = parseInt(data.theme.split('H')[0].split('top')[1]);
        toReturn[1] = "margin-top: 0px; display: grid; grid-template-columns: repeat(10, 1fr);";
        if (cards == 100) {
            toReturn[2] = `.image { height: ${data.showDifferences ? 1.5 : 2.15}vw; width: ${data.showDifferences ? 1.5 : 2.15}vw; }
            .card { height: 2.15vw; }
            .count { font-size: ${data.showDifferences ? 0.7 : 1}vw; }
            .name { font-size: ${data.showDifferences ? 0.5 : 0.75}vw; }
            .subgap { font-size: 0.7vw;}`;
        } else if (cards == 150) {
            toReturn[2] = `.image { height: ${data.showDifferences ? 1.5 : 2.15}vw; width: ${data.showDifferences ? 1.5 : 2.15}vw; }
            .card { height: 2.15vw; }
            .count { font-size: ${data.showDifferences ? 0.7 : 1}vw; }
            .name { font-size: ${data.showDifferences ? 0.5 : 0.75}vw; }
            .subgap { font-size: 0.7vw;}`;
        } else {
            toReturn[1] = "margin-top: 0px; display: grid; grid-template-columns: repeat(5, 1fr);";
        }
        for (let l = 1; l <= cards; l++) {
            const cc = (c < 10) ? "0" + c : c;
            const dataIndex = c - 1;
            const htmlcard = document.createElement('div');
            const cid = channels[dataIndex] ? channels[dataIndex].id : '';
            htmlcard.innerHTML = `<div class="card card_${dataIndex}" id="card_${cid}">
                <div class="num" id="num_${cid}">${cc}</div>
                <img src="../blank.png" alt="" id="image_${cid}" class="image">
                <div class="name" id="name_${cid}">&ZeroWidthSpace;</div>
                <div class="count odometer" id="count_${cid}">${getDisplayedCount(Math.floor(channels[dataIndex] ? channels[dataIndex].count : 0))}</div>
                <div class="subgap odometer"></div>
            </div>`;

            if (channels[dataIndex]) {
                htmlcard.querySelector('.image').src = channels[dataIndex].image || '../default.png'
                htmlcard.querySelector('.name').innerText = channels[dataIndex].name
            }
            c += 1;
            main.innerHTML += htmlcard.innerHTML
        }
    } else {
        let columns = data.theme == 'top100' ? 10 : 5;
        columns = data.theme == 'top150' ? 10 : columns;
        for (let l = 1; l <= columns; l++) {
            const htmlcolumn = document.createElement('div');
            htmlcolumn.classList = `column_${l} column`;
            const maxCards = data.max / columns;
            for (let t = 1; t <= maxCards; t++) {
                const cc = (c < 10) ? "0" + c : c;
                const dataIndex = c - 1;
                const htmlcard = document.createElement('div');
                const cid = channels[dataIndex] ? channels[dataIndex].id : '';
                htmlcard.innerHTML = `<div class="card card_${dataIndex}" id="card_${cid}">
                    <div class="num" id="num_${cid}">${cc}</div>
                    <img src="../blank.png" alt="" id="image_${cid}" class="image">
                    <div class="name" id="name_${cid}">&ZeroWidthSpace;</div>
                    <div class="count odometer" id="count_${cid}">${getDisplayedCount(Math.floor(channels[dataIndex] ? channels[dataIndex].count : 0))}</div>
                    <div class="subgap odometer"></div>

                </div>`;
                if (channels[dataIndex]) {
                    htmlcard.querySelector('.image').src = channels[dataIndex].image || '../default.png'
                    htmlcard.querySelector('.name').innerText = channels[dataIndex].name
                }
                htmlcolumn.innerHTML += htmlcard.innerHTML;
                c += 1;
            }
            main.appendChild(htmlcolumn);
        }
        if (data.theme == 'top100') {
            toReturn[1] = "margin-top: 0px; display: grid; grid-template-columns: repeat(10, 1fr);";
            toReturn[2] = `.image { height: ${data.showDifferences ? 1.5 : 2.15}vw; width: ${data.showDifferences ? 1.5 : 2.15}vw; }
            .card { height: 2.15vw; }
            .count { font-size: ${data.showDifferences ? 0.7 : 1}vw; }
            .name { font-size: ${data.showDifferences ? 0.5 : 0.75}vw; }
            .subgap { font-size: 0.7vw;}`;
        } else if (data.theme == 'top150') {
            toReturn[1] = "margin-top: 0px; display: grid; grid-template-columns: repeat(10, 1fr);";
            toReturn[2] = `.image { height: ${data.showDifferences ? 1.5 : 2.15}vw; width: ${data.showDifferences ? 1.5 : 2.15}vw; }
            .card { height: 2.15vw; }
            .count { font-size: ${data.showDifferences ? 0.7 : 1}vw; }
            .name { font-size: ${data.showDifferences ? 0.5 : 0.75}vw; }
            .subgap { font-size: 0.7vw;}`;
            toReturn[1] = "margin-top: 0px; display: grid; grid-template-columns: repeat(10, 1fr);";
        } else {
            toReturn[2] = `.image { height: ${data.showDifferences ? 3 : 4.25}vw; width: ${data.showDifferences ? 3 : 4.25}vw; }
            .card { height: 4.25vw; }
            .count { font-size: ${data.showDifferences ? 1.4 : 2}vw; }
            .name { font-size: ${data.showDifferences ? 1.05 : 1.5}vw; }
            .subgap {font-size: 1.25vw;}`;
            toReturn[1] = "margin-top: 0px; display: grid; grid-template-columns: repeat(5, 1fr);";
        }
    }
    toReturn[0] = main;
    return toReturn;
}

function create() {
    let addMinGain = document.getElementById('add_min_gain').value;
    let addMaxGain = document.getElementById('add_max_gain').value;
    let addMeanGain = document.getElementById('add_mean_gain').value;
    let addStdGain = document.getElementById('add_std_gain').value;
    let addCount = document.getElementById('add_count').value;
    let addName = document.getElementById('add_name').value;
    let addImage1 = document.getElementById('add_image1').value;
    let addImage2 = document.getElementById('add_image2');
    if (addMinGain === '') {
        addMinGain = 0;
    }
    if (addMaxGain === '') {
        addMaxGain = 0;
    }
    const min = parseFloat(addMinGain);
    const max = parseFloat(addMaxGain);
    let mean = parseFloat(addMeanGain);
    let std = parseFloat(addStdGain);
    if (!addCount) {
        addCount = 0;
    }
    if (!addName) {
        addName = "Untitled";
    }
    let image = '';
    if (!addImage1) {
        if (addImage2.files.length === 0) {
            image = '../default.png';
            bruh();
            return;
        } else {
            const file = addImage2.files[0];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                image = reader.result;
                bruh();
            };
        }
    } else {
        image = addImage1;
        bruh();
    }
    function bruh() {
        if (!mean) {
            mean = (min + max) / 2;
        }
        const count = parseFloat(addCount);
        const name = addName;
        let id = randomGen();
        if (document.getElementById('add_id').value.length > 0) {
            id = document.getElementById('add_id').value;
        }
        data.data.push({
            name,
            count,
            image,
            min_gain: min,
            mean_gain: mean,
            std_gain: std,
            max_gain: max,
            id,
        });
        fix();
    }
}

function update(doGains = true) {
    let start = new Date().getTime();
    if (data) {
        let fastest = ""
        let fastestCount = -Infinity;
        let slowest = ""
        let slowestCount = Infinity;
        let past = document.getElementById('quickSelect').value;
        document.getElementById('quickSelect').innerHTML = "";
        let selections = ['<option value="select">Select</option>'];
        for (let i = 0; i < data.data.length; i++) {
            selections.push('<option value="' + data.data[i].id + '">' + data.data[i].name + '</option>')
            data.data[i].lastCount = parseFloat(data.data[i].count);
            data.data[i].min_gain = parseFloat(data.data[i].min_gain);
            data.data[i].max_gain = parseFloat(data.data[i].max_gain);
            data.data[i].mean_gain = parseFloat(data.data[i].mean_gain);
            data.data[i].std_gain = parseFloat(data.data[i].std_gain);
            if (doGains) {
                if ((data.data[i].mean_gain && data.data[i].std_gain) && (data.data[i].mean_gain != 0) && (data.data[i].std_gain != 0)) {
                    data.data[i].count = parseFloat(data.data[i].count) + randomGaussian(parseFloat(data.data[i].mean_gain), parseFloat(data.data[i].std_gain))
                } else {
                    data.data[i].count = parseFloat(data.data[i].count) + random(parseFloat(data.data[i].min_gain), parseFloat(data.data[i].max_gain));
                }
            }
            if (data.data.length > 1) {
                if ((data.data[i].count - data.data[i].lastCount >= fastestCount)) {
                    fastestCount = data.data[i].count - data.data[i].lastCount;
                    fastest = data.data[i].id;
                }
                if ((data.data[i].count - data.data[i].lastCount < slowestCount)) {
                    slowestCount = data.data[i].count - data.data[i].lastCount;
                    slowest = data.data[i].id;
                }
            }
            if (nextUpdateAudit == true && doGains) {
                let update = random(data.auditStats[0], data.auditStats[1])
                data.data[i].count = data.data[i].count + update
            }
            if (i == data.data.length - 1) {
                nextUpdateAudit = false
            }
            if (data.data[i].count < 0) {
                if (data.allowNegative == false) {
                    data.data[i].count = 0;
                }
            }
            if (!isFinite(data.data[i].count)) {
                data.data[i].count = 0;
            }
        }
        document.getElementById('quickSelect').innerHTML = selections.join("");
        document.getElementById('quickSelect').value = past || 'select';
        if (document.getElementById('sorter').value == "fastest") {
            data.data = data.data.sort(function (a, b) {
                return avg(b.min_gain, b.max_gain) - avg(a.min_gain, a.max_gain)
            });
        } else if (document.getElementById('sorter').value == "name") {
            data.data = data.data.sort(function (a, b) {
                return a.name.localeCompare(b.name)
            });
        } else if ((!document.getElementById('sorter').value) || (document.getElementById('sorter').value == "num")) {
            data.data = data.data.sort(function (a, b) {
                return b.count - a.count
            });
        } else {
            data.data = data.data.sort(function (a, b) {
                return b.count - a.count
            });
        }
        if (document.getElementById('order').value == "asc") {
            data.data = data.data.reverse();
        }
        if (!data.theme.includes('A')) {
            for (let i = 0; i < data.max; i++) {
                if ((i + 1) < 10) {
                    num = "0" + (i + 1);
                } else {
                    num = (i + 1);
                }
                const currentCard = document.getElementsByClassName("card")[i]
                if (currentCard) {
                    if (data.data[i]) {
                        if (!data.data[i].image) {
                            data.data[i].image = "../default.png";
                        }
                        currentCard.children[1].src = data.data[i].image
                        currentCard.children[2].innerText = data.data[i].name
                        currentCard.children[1].id = "image_" + data.data[i].id
                        currentCard.children[2].id = "name_" + data.data[i].id
                        currentCard.children[0].id = "num_" + data.data[i].id
                        currentCard.id = "card_" + data.data[i].id
                        currentCard.children[3].id = "count_" + data.data[i].id
                        currentCard.children[3].innerText = getDisplayedCount(data.data[i].count)
                        if (data.data[i + 1]) {
                            currentCard.children[4].innerText = getDisplayedCount(data.data[i].count) - getDisplayedCount(data.data[i + 1].count)
                        } else {
                            currentCard.children[4].innerText = getDisplayedCount(data.data[i].count)
                        }
                        if (selected == data.data[i].id) {
                            document.getElementById("card_" + selected).style.border = "0.1em solid red";
                        } else {
                            document.getElementById("card_" + data.data[i].id).style.border = "0.1em solid " + data.boxBorder + "";
                        }
                        if (fastest == data.data[i].id) {
                            if (data.fastest == true) {
                                document.getElementById("card_" + fastest).children[2].innerText = "🔥" + data.data[i].name
                            }
                        }
                        if (slowest == data.data[i].id) {
                            if (data.slowest == true) {
                                document.getElementById("card_" + slowest).children[2].innerText = "⌛️" + data.data[i].name
                            }
                        }
                    } else {
                        currentCard.id = 'card_'
                        currentCard.children[0].id = "num_"
                        currentCard.children[1].id = "image_"
                        currentCard.children[1].src = "../blank.png"
                        currentCard.children[2].id = "name_"
                        currentCard.children[2].innerText = '\u200b'
                        currentCard.children[3].id = "count_"
                        currentCard.children[3].innerText = '0'
                        currentCard.children[4].innerText = '0'
                    }
                }
            }
        } else {
            let lastPlaceSubs = data.data[data.max - 1].count;
            let sortedData = [...data.data];
            sortedData = sortedData.filter(x => x.count >= lastPlaceSubs);
            let filteredData = {};
            for (let i = 0; i < sortedData.length; i++) {
                filteredData[sortedData[i].id] = sortedData[i];
            }
            let ids = Object.keys(filteredData);
            let sortedIds = [...ids].sort((a, b) => filteredData[b].count - filteredData[a].count);
            for (let i = 0; i < ids.length; i++) {
                let id = ids[i];
                let value = filteredData[id];
                let element = $(`.card_${i}`);
                if (element.length == 0) { }
                element.find('.name').text(value.name);
                element.find('.image').attr('src', value.image);
                element.find('.count').text(getDisplayedCount(value.count));
                if (selected == value.id) {
                    element.css('border', '0.1em solid red');
                } else {
                    element.css('border', '0.1em solid ' + data.boxBorder + '');
                }
                if (fastest == value.id) {
                    if (data.fastest == true) {
                        element.find('.name').text("🔥" + value.name);
                    }
                }
                if (slowest == value.id) {
                    if (data.slowest == true) {
                        element.find('.name').text("⌛️" + value.name);
                    }
                }
                try {
                    element.find('.subgap').text(getDisplayedCount(value.count - filteredData[ids[i + 1]].count));
                } catch (e) { }
            }
            $('.main').isotope('updateSortData', $('.card'));
            $('.main').isotope({
                sortBy: 'number',
                sortAscending: true
            });
            for (let q = 0; q < ids.length; q++) {
                let element = $(`.card_${q}`);
                element.find('.num').text(`#${sortedIds.indexOf(ids[q]) + 1}`);
            }

        }
        for (let q = 0; q < popups.length; q++) {
            if ((!popups[q].popup) || (!popups[q].popup.document)) {
                popups.splice(q, 1);
            } else {
                if (popups[q].specificChannels == true) {
                    let data2 = [];
                    for (let i = 0; i < data.data.length; i++) {
                        for (let a = 0; a < popups[q].channels.length; a++) {
                            if (popups[q].channels[a].id == data.data[i].id) {
                                data2.push(data.data[i])
                            }
                        }
                    }
                    popups[q].popup.document.write('<data id="channels" style="display: none;">' + JSON.stringify(data2) + '</data>')
                } else {
                    popups[q].popup.document.write('<data id="channels" style="display: none;">' + JSON.stringify(data.data) + '</data>')
                }
            }
        }
    }
    let end = new Date().getTime();
    let time = end - start;
    console.log('Execution timeS: ' + time / 1000);
}

let selected = null;
document.getElementById('quickSelectButton').addEventListener('change', function (e) {
    if (!pickingChannels) {
        if (quickSelecting) {
            quickSelecting = false;
            document.getElementById('quickSelectButton').style.border = ""
            document.getElementById('main').removeEventListener('click', selectorFunction, { once: true })
        } else {
            quickSelecting = true;
            document.getElementById('quickSelectButton').style.border = "solid 0.2em green"
            document.getElementById('main').addEventListener('click', selectorFunction, { once: true })
        }
    }
})

document.getElementById('order').addEventListener('change', function (e) {
    data.order = document.getElementById('order').value
    fix();
})

document.getElementById('sorter').addEventListener('change', function (e) {
    data.sort = document.getElementById('sorter').value
    fix();
})

document.getElementById('quickSelect').addEventListener('change', function (e) {
    if (document.getElementById('quickSelect').value !== 'select') {
        let newForm = {
            target: { id: "image_" + document.getElementById('quickSelect').value }
        }
        selectorFunction(newForm)
    } else {
        selectorFunction({
            target: { id: null }
        })
    }
})

function edit() {
    if (selected !== null) {
        let id = selected;
        let name = document.getElementById('edit_name').value;
        let count = document.getElementById('edit_count').value;
        let image;
        if (document.getElementById('edit_image_check').checked) {
            if (document.getElementById('edit_image1').value !== "") {
                image = document.getElementById('edit_image1').value;
                bruh()
            } else if (document.getElementById('edit_image2').files.length !== 0) {
                let file = document.getElementById('edit_image2').files[0];
                let reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function () {
                    image = reader.result;
                    bruh()
                }
            }
        } else {
            bruh()
        }
        function bruh() {
            let min = document.getElementById('edit_min_gain').value;
            let max = document.getElementById('edit_max_gain').value;
            document.getElementById('edit_image2').value = "";
            let card = document.getElementById('card_' + id);
            for (let i = 0; i < data.data.length; i++) {
                if (data.data[i].id == id) {
                    if (document.getElementById('edit_min_gain_check').checked) {
                        data.data[i].min_gain = min;
                    }
                    if (document.getElementById('edit_max_gain_check').checked) {
                        data.data[i].max_gain = max;
                    }
                    if (document.getElementById('edit_mean_gain_check').checked) {
                        if (document.getElementById('edit_mean_gain').value !== "") {
                            data.data[i].mean_gain = parseFloat(document.getElementById('edit_mean_gain').value)
                        } else {
                            data.data[i].mean_gain = undefined;
                        }
                    }
                    if (document.getElementById('edit_std_gain_check').checked) {
                        if (document.getElementById('edit_std_gain').value !== "") {
                            data.data[i].std_gain = parseFloat(document.getElementById('edit_std_gain').value)
                        } else {
                            data.data[i].std_gain = undefined;
                        }
                    }
                }
            }
            if (document.getElementById('edit_name_check').checked) {
                if (card.querySelector('.name').innerText !== name && name !== "") {
                    card.querySelector('.name').innerText = name;
                    for (let i = 0; i < data.data.length; i++) {
                        if (data.data[i].id == id) {
                            data.data[i].name = name;
                        }
                    }
                }
            }
            if (document.getElementById('edit_count_check').checked) {
                if (card.querySelector('.odometer').innerText !== count && count !== "") {
                    card.querySelector('.odometer').innerText = getDisplayedCount(count);
                    for (let i = 0; i < data.data.length; i++) {
                        if (data.data[i].id == id) {
                            data.data[i].count = count;
                        }
                    }
                }
            }
            if (card.querySelector('.image').src !== image && image !== "") {
                card.querySelector('.image').src = image;
                for (let i = 0; i < data.data.length; i++) {
                    if (data.data[i].id == id) {
                        data.data[i].image = image;
                    }
                }
            }
        }
    } else {
        alert("Please select a card by clicking it.");
    }
}

function save() {
    localStorage.setItem("data", JSON.stringify(data));
    alert("Saved!");
}

function saveData2() {
    localStorage.setItem("data", JSON.stringify(data));
}

document.getElementById('loadData1').addEventListener('change', function () {
    load();
});

document.getElementById('loadData2').addEventListener('change', function () {
    load1();
});

function load1() {
    if (document.getElementById('loadData2').files[0]) {
        document.getElementById('loadData2').files[0].text().then(function (data2) {
            data.data.push(JSON.parse(data2))
        })
    }
}

function load() {
    var data3 = {};
    document.getElementById('main').innerHTML = "";
    if (document.getElementById('loadData1').files[0]) {
        document.getElementById('loadData1').files[0].text().then(function (data2) {
            data3 = JSON.parse(data2);
            if (data3.data) {
                data = JSON.parse(data2);
                for (let i = 0; i < data.data.length; i++) {
                    let id = data.data[i].id;
                    let image = data.data[i].image;
                    let name = data.data[i].name;
                    let count = data.data[i].count;
                    if (currentIndex < 10) {
                        num = "0" + (currentIndex).toString();
                    } else {
                        num = currentIndex;
                    }
                    let card = document.createElement('div');
                    card.className = "card";
                    card.id = "card_" + currentIndex;
                    card.setAttribute("cid", id);
                    let div = document.createElement('div');
                    div.className = "num";
                    div.id = "num_" + currentIndex;
                    div.innerHTML = num;
                    div.setAttribute("cid", id);
                    let img = document.createElement('img');
                    img.className = "img";
                    img.id = "img_" + currentIndex;
                    img.src = image;
                    img.setAttribute("cid", id);
                    let nameDiv = document.createElement('h1');
                    nameDiv.className = "name";
                    nameDiv.id = "name_" + currentIndex;
                    nameDiv.innerText = name;
                    nameDiv.setAttribute("cid", id);
                    let countDiv = document.createElement('h2');
                    countDiv.classList = "odometer";
                    countDiv.id = "count_" + currentIndex;
                    countDiv.innerText = getDisplayedCount(count);
                    countDiv.setAttribute("cid", id);
                    odo = new Odometer({
                        el: countDiv
                    });
                    card.appendChild(div);
                    card.appendChild(img);
                    card.appendChild(nameDiv);
                    card.appendChild(countDiv);
                    document.getElementById('main').appendChild(card);
                    currentIndex++;
                }
                document.body.style.backgroundColor = data.bgColor;
                document.body.style.color = data.textColor;
                adjustColors();
                if (!data.uuid) {
                    data.uuid = uuidGen();
                }
                localStorage.setItem("data", JSON.stringify(data));
                location.reload();
            }
        });
    }
}
function save2() {
    let data2 = JSON.stringify(data);
    let a = document.createElement('a');
    let file = new Blob([data2], { type: 'text/json' });
    a.href = URL.createObjectURL(file);
    a.download = 'data.json';
    a.click();
}

function reset() {
    if (confirm("Are you sure you want to reset?")) {
        localStorage.clear();
        location.reload();
    }
}

function zero() {
    if (confirm("Are you sure you want to zero all the counters?")) {
        for (i = 0; i < data.data.length; i++) {
            data.data[i].count = 0;
        }
        update(false)
    }
}

function deleteChannel() {
    if (selected !== null) {
        if (confirm("Are you sure you want to delete this channel?")) {
            let id = selected;
            /*
            let image = document.getElementById('image_' + id).src = "../default.png"
            let name = document.getElementById('name_' + id).innerText = "Loading";
            let count = document.getElementById('count_' + id).innerText = "0";
            name.innerText = "";
            count.innerText = "";
            image.src = "";
            */
            for (let i = 0; i < data.data.length; i++) {
                if (data.data[i].id == id) {
                    data.data.splice(i, 1);
                }
            }
            selected = null;
            document.getElementById('quickSelect').value = 'select';
            refresh()
        }
    } else {
        alert("Please select a card by clicking it.");
    }
}

function downloadChannel() {
    if (selected !== null) {
        let id = selected;
        for (let i = 0; i < data.data.length; i++) {
            if (data.data[i].id == id) {
                let data2 = JSON.stringify(data.data[i]);
                let a = document.createElement('a');
                let file = new Blob([data2], { type: 'text/json' });
                a.href = URL.createObjectURL(file);
                a.download = data.data[i].id + '.json';
                a.click();
            }
        }
    } else {
        alert("Please select a card by clicking it.");
    }
}

document.getElementById('backPicker').addEventListener('change', function () {
    document.body.style.backgroundColor = this.value;
    data.bgColor = this.value;
    adjustColors();
});

document.getElementById('textPicker').addEventListener('change', function () {
    document.getElementById('main').style.color = this.value;
    data.textColor = this.value;
});

document.getElementById('boxPicker').addEventListener('change', function () {
    let color = this.value;
    data.boxColor = color;
    fix()
});

document.getElementById('borderPicker').addEventListener('change', function () {
    let color = this.value;
    data.boxBorder = color;
    fix()
});

document.getElementById('allowNegative').addEventListener('change', function () {
    if (this.checked) {
        data.allowNegative = true;
    } else {
        data.allowNegative = false;
    }
});

document.getElementById('imageBorder').addEventListener('change', function () {
    let num = this.value;
    data.imageBorder = num;
    fix()
});

document.getElementById('imageBorderColor').addEventListener('change', function () {
    let color = this.value;
    data.imageBorderColor = color;
    fix()
});

document.getElementById('prependZeros').addEventListener('change', function () {
    if (this.checked) {
        data.prependZeros = true;
    } else {
        data.prependZeros = false;
    }
    fix()
});

document.getElementById('showBlankSlots').addEventListener('change', function () {
    if (document.getElementById('showBlankSlots').checked) {
        data.showBlankSlots = true;
    } else {
        data.showBlankSlots = false;
    }
    fix()
});

document.getElementById('showDifferences').addEventListener('change', function () {
    if (document.getElementById('showDifferences').checked) {
        data.showDifferences = true;
    } else {
        data.showDifferences = false;
    }
    fix()
});

document.getElementById('showRankings').addEventListener('change', function () {
    if (document.getElementById('showRankings').checked) {
        data.showRankings = true;
    } else {
        data.showRankings = false;
    }
    fix()
});

document.getElementById('showNames').addEventListener('change', function () {
    if (document.getElementById('showNames').checked) {
        data.showNames = true;
    } else {
        data.showNames = false;
    }
    fix()
});
document.getElementById('showImages').addEventListener('change', function () {
    if (document.getElementById('showImages').checked) {
        data.showImages = true;
    } else {
        data.showImages = false;
    }
    fix()
});
document.getElementById('showCounts').addEventListener('change', function () {
    if (document.getElementById('showCounts').checked) {
        data.showCounts = true;
    } else {
        data.showCounts = false;
    }
    fix()
});

function fix() {
    if (data.audits == true) {
        auditTimeout = setTimeout(audit, (random(data.auditStats[2], data.auditStats[3])) * 1000)
    }
    document.getElementById('auditMin').value = data.auditStats[0]
    document.getElementById('auditMax').value = data.auditStats[1]
    document.getElementById('auditTimeMin').value = data.auditStats[2]
    document.getElementById('auditTimeMax').value = data.auditStats[3]
    document.getElementById('sorter').value = data.sort;
    document.getElementById('order').value = data.order;
    if ((!data.fastest) && (data.fastest !== false)) {
        data.fastest = true;
    }
    if ((!data.slowest) && (data.slowest !== false)) {
        data.slowest = true;
    }
    if (!data.hideSettings) {
        data.hideSettings = 'q';
    }
    if (data.animation == true) {
        document.getElementById('animation').checked = true;
    } else {
        document.getElementById('animation').checked = false;
    }
    if (data.allowNegative == true) {
        document.getElementById('allowNegative').checked = true;
    } else {
        document.getElementById('allowNegative').checked = false;
    }
    if (data.fastest == true) {
        document.getElementById('fastest').checked = true;
    } else {
        document.getElementById('fastest').checked = false;
    }
    if (data.slowest == true) {
        document.getElementById('slowest').checked = true;
    } else {
        document.getElementById('slowest').checked = false;
    }
    if (data.abbreviate == true) {
        document.getElementById('abbreviate').checked = true;
    } else {
        document.getElementById('abbreviate').checked = false;
    }
    if (data.offlineGains == true) {
        document.getElementById('offline').checked = true;
    } else {
        document.getElementById('offline').checked = false;
    }
    if (data.autosave == true) {
        document.getElementById('autosave').checked = true;
        saveInterval = setInterval(saveData2, 15000);
    } else {
        document.getElementById('autosave').checked = false;
    }
    if (data.showRankings == true) {
        document.getElementById('showRankings').checked = true;
        document.querySelectorAll('.num').forEach(function (card) {
            card.style.display = "";
        })
    } else {
        document.getElementById('showRankings').checked = false;
        document.querySelectorAll('.num').forEach(function (card) {
            card.style.display = "none";
        })
    }
    if (data.showBlankSlots) {
        document.getElementById('showBlankSlots').checked = true;
        document.getElementById('hideBlanks').innerText = '';
    } else {
        document.getElementById('showBlankSlots').checked = false;
        document.getElementById('hideBlanks').innerText = '#card_ * {display: none;}';
    }

    if (data.showDifferences) {
        document.getElementById('showDifferences').checked = true;
        const s = document.getElementById('hideDifferencesCSS');
        document.getElementById('hideDifferences').innerText = '';
    } else {
        document.getElementById('showDifferences').checked = false;
        document.getElementById('hideDifferences').innerText = '.subgap * {display: none;}';
    }

    let design = setupDesign()
    document.getElementById('designStyles').innerText = design[2];

    if (data.prependZeros == true) {
        document.getElementById('prependZeros').checked = true;
        let index = 1;
        let totalNums = document.querySelectorAll('.num').length;
        if (totalNums < 100) {
            document.querySelectorAll('.num').forEach(function (card) {
                if (index < 10) {
                    card.innerText = "0" + index
                }
                index += 1;
            })
        } else {
            document.querySelectorAll('.num').forEach(function (card) {
                if (index < 10) {
                    card.innerText = "00" + index
                } else if (index < 100) {
                    card.innerText = "0" + index
                }
                index += 1;
            })
        }
    } else {
        document.getElementById('prependZeros').checked = false;
        let index = 1;
        document.querySelectorAll('.num').forEach(function (card) {
            card.innerText = index
            index += 1;
        })
    }
    if (data.showNames == true) {
        document.getElementById('showNames').checked = true;
        document.querySelectorAll('.name').forEach(function (card) {
            card.style.display = "";
        })
    } else {
        document.getElementById('showNames').checked = false;
        document.querySelectorAll('.name').forEach(function (card) {
            card.style.display = "none";
        })
    }
    if (data.showImages == true) {
        document.getElementById('showImages').checked = true;
        document.querySelectorAll('.image').forEach(function (card) {
            card.style.display = "";
        })
    } else {
        document.getElementById('showImages').checked = false;
        document.querySelectorAll('.image').forEach(function (card) {
            card.style.display = "none";
        })
    }
    if (data.showCounts == true) {
        document.getElementById('showCounts').checked = true;
        document.querySelectorAll('.count').forEach(function (card) {
            card.style.display = "";
        })
    } else {
        document.getElementById('showCounts').checked = false;
        document.querySelectorAll('.count').forEach(function (card) {
            card.style.display = "none";
        })
    }

    document.getElementById('theme').value = data.theme;
    document.getElementById('setting').innerText = "Current: " + data.hideSettings + ""
    document.querySelectorAll('.card').forEach(function (card) {
        card.style.backgroundColor = data.boxColor;
        if (card.className.split(' ').includes("selected") == false) {
            card.style.border = "solid 0.1em " + data.boxBorder;
        }
    });
    document.querySelectorAll('.image').forEach(function (card) {
        card.style.borderRadius = data.imageBorder + "%";
        card.style.borderColor = data.imageBorderColor;
    });
    document.getElementById('backPicker').value = convert3letterhexto6letters(data.bgColor);
    document.getElementById('textPicker').value = convert3letterhexto6letters(data.textColor);
    document.getElementById('boxPicker').value = convert3letterhexto6letters(data.boxColor);
    document.getElementById('borderPicker').value = convert3letterhexto6letters(data.boxBorder);
    document.getElementById('odometerUp').value = data.odometerUp;
    document.getElementById('odometerDown').value = data.odometerDown;
    document.getElementById('odometerSpeed').value = data.odometerSpeed;
    document.getElementById('imageBorder').value = data.imageBorder;
    document.getElementById('imageBorderColor').value = data.imageBorderColor;
    if (data.updateInterval) {
        document.getElementById('updateint').value = (data.updateInterval / 1000).toString()
    }
    let odometerStyles = document.getElementById('odometerStyles')
    odometerStyles.innerText = '';
    odometerStyles.innerText += `.odometer.odometer-auto-theme.odometer-animating-up.odometer-animating .odometer-inside, .odometer.odometer-theme-default.odometer-animating-up.odometer-animating .odometer-inside {
        color: ${data.odometerUp};
        }`
    odometerStyles.innerText += `.odometer.odometer-auto-theme.odometer-animating-down.odometer-animating .odometer-inside, .odometer.odometer-theme-default.odometer-animating-down.odometer-animating .odometer-ribbon-inner {
        color: ${data.odometerDown};
        }`

    odometerStyles.innerText += `.odometer.odometer-auto-theme.odometer-animating-up .odometer-ribbon-inner,
    .odometer.odometer-theme-default.odometer-animating-up .odometer-ribbon-inner {
        -webkit-transition: -webkit-transform ${data.odometerSpeed}s;
        -moz-transition: -moz-transform ${data.odometerSpeed}s;
        -ms-transition: -ms-transform ${data.odometerSpeed}s;
        -o-transition: -o-transform ${data.odometerSpeed}s;
        transition: transform ${data.odometerSpeed}s;
    }

    .odometer.odometer-auto-theme.odometer-animating-down.odometer-animating .odometer-ribbon-inner,
    .odometer.odometer-theme-default.odometer-animating-down.odometer-animating .odometer-ribbon-inner {
        -webkit-transition: -webkit-transform ${data.odometerSpeed}s;
        -moz-transition: -moz-transform ${data.odometerSpeed}s;
        -ms-transition: -ms-transform ${data.odometerSpeed}s;
        -o-transition: -o-transform ${data.odometerSpeed}s;
        transition: transform ${data.odometerSpeed}s;
    }`
}

function convert3letterhexto6letters(hex) {
    hex = hex.replace('#', '');
    if (hex.length == 3) {
        hex = "#" + hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    } else {
        hex = "#" + hex;
    }
    return hex;
}
let code = data.uuid
let connected = false;
if (window.location.href.includes('?code=')) {
    code = window.location.href.split('?code=')[1];
    connected = true;
}

function connect() {
    if (window.location.href.includes('?code=')) {
        window.location.href = window.location.href.split('?code=')[0];
    } else {
        saveData2()
        window.location.href = window.location.href + "?code=" + code;
    }
}
let update2Hold;
if (connected == true) {
    update2()
    update2Hold = setInterval(update2, 5000);
    document.getElementById('isconnected').innerText = "Yes";
    document.getElementById('toConnect').innerText = "Disconnect";
}

function update2() {
    if (!data.gain_min) {
        data.gain_min = -10000;
    }
    if (!data.gain_max) {
        data.gain_max = 10000;
    }
    fetch('https://api.lcedit.com/' + code + '')
        .then(response => response.json())
        .then(json => {
            if (json.users) {
                if (json.users.length > 0) {
                    for (let i = 0; i < json.users.length; i++) {
                        let hasID = false;
                        for (let r = 0; r < data.data.length; r++) {
                            if (data.data[r].id == json.users[i].id) {
                                min = parseInt(json.users[i].min);
                                max = parseInt(json.users[i].max);
                                if (min > data.gain_max) {
                                    min = data.gain_max;
                                } else if (min < data.gain_min) {
                                    min = data.gain_min;
                                }
                                if (max > data.gain_max) {
                                    max = data.gain_max;
                                } else if (max < data.gain_min) {
                                    max = data.gain_min;
                                }
                                data.data[r].min_gain = min;
                                data.data[r].max_gain = max;
                                hasID = true;
                            }
                        }
                        if (hasID == false) {
                            fetch('https://mixerno.space/api/youtube-channel-counter/user/' + json.users[i].id + '')
                                .then(response => response.json())
                                .then(json2 => {
                                    let count = 0;
                                    let name = json2.user[0].count;
                                    let image = json2.user[1].count;
                                    let min = json.users[i].min;
                                    let max = json.users[i].max;
                                    if (min > data.gain_max) {
                                        min = data.gain_max;
                                    } else if (min < data.gain_min) {
                                        min = data.gain_min;
                                    }
                                    if (max > data.gain_max) {
                                        max = data.gain_max;
                                    } else if (max < data.gain_min) {
                                        max = data.gain_min;
                                    }
                                    let id = json.users[i].id
                                    data.data.push({
                                        "name": name,
                                        "count": parseFloat(count),
                                        "image": image,
                                        "min_gain": min,
                                        "max_gain": max,
                                        "id": id,
                                        "lastCount": 0
                                    });
                                    fix()
                                })
                        }
                    }
                }
                if (json.events.length > 0) {
                    for (let i = 0; i < json.events.length; i++) {
                        if (json.events[i].values) {
                            let id = json.events[i].id;
                            let min = parseFloat(json.events[i].values[0])
                            let max = parseFloat(json.events[i].values[1])
                            for (let i = 0; i < data.data.length; i++) {
                                if (data.data[i].id == id) {
                                    let num = Math.floor(Math.random() * (max - min + 1)) + min;
                                    data.data[i].count += num;
                                }
                            }
                        }
                    }
                }
                if (json.system.length > 0) {
                    for (let i = 0; i < json.system.length; i++) {
                        if (json.system[i].type == "user") {
                            let username = "";
                            let set = 0;
                            for (let a = 0; a < data.data.length; a++) {
                                if (data.data[a].id == json.system[i].id) {
                                    username = data.data[a].name;
                                    set = data.data[a].count;
                                }
                            }
                            fetch('https://api.lcedit.com/' + code + '/' + json.system[i].id + '/user?subs=' + set + '&name=' + username + '')
                        }
                    }
                }
            } else {
                alert("You are no longer connected.");
                clearInterval(update2Hold);
                document.getElementById('isconnected').innerText = "No";
                fetch('https://api.lcedit.com/create?code=' + code + '', {
                    method: 'POST'
                })
                    .then(response => response.text())
                    .then(json => {
                        if (json == "done") {
                            saveData2()
                            location.reload();
                        }
                    })
            }
        });
}

document.getElementById('autosave').addEventListener('change', function () {
    if (document.getElementById('autosave').checked == true) {
        saveInterval = setInterval(saveData2, 15000);
        data.autosave = true;
    } else {
        clearInterval(saveInterval);
        data.autosave = false;
    }
})

document.getElementById('updateint').addEventListener('change', function () {
    let int = document.getElementById('updateint').value;
    if (isNaN(int)) {
        alert("Please enter a number.")
        return;
    }
    clearInterval(updateInterval);
    int = int * 1000;
    updateInterval = setInterval(update, int);
    data.updateInterval = int;
})

document.getElementById('min_gain_global').addEventListener('change', function () {
    let min = document.getElementById('min_gain_global').value;
    if (isNaN(min)) {
        alert("Please enter a number.")
        return;
    }
    data.gain_min = min;
});

document.getElementById('max_gain_global').addEventListener('change', function () {
    let max = document.getElementById('max_gain_global').value;
    if (isNaN(max)) {
        alert("Please enter a number.")
        return;
    }
    data.gain_max = max;
});

function custom() {
    prompt("What is the command name?")
    let min = prompt("What is the minimum amount of subscribers the channel can gain?")
    if (isNaN(min)) {
        alert("Please enter a number.")
        return;
    }
    let max = prompt("What is the maximum amount of subscribers the channel can gain?")
    if (isNaN(max)) {
        alert("Please enter a number.")
        return;
    }
    let returnText = prompt("What should the commands response be? (use $(user) for the name and $(query) for any additional text)")
    alert('$(urlfetch https://api.lcedit.com/' + code + '/$(userid)?values=' + min + ',' + max + '&returnText=' + returnText + ')')
}

document.getElementById('connect').innerHTML = '$(urlfetch https://api.lcedit.com/' + code + '/$(userid)/$(query)?returnText=Added $(user)!)';
document.getElementById('connect2').innerHTML = '$(urlfetch https://api.lcedit.com/' + code + '/$(userid)?values=10,20&returnText=$(user) uploaded $(query)!)';
document.getElementById('connect3').innerHTML = '$(urlfetch https://api.lcedit.com/' + code + '/$(userid)/$(query)?value=edit&returnText=Edited $(user)!)';
document.getElementById('connect4').innerHTML = '$(urlfetch https://api.lcedit.com/' + code + '/$(userid)/user)';

document.getElementById('animation').addEventListener('click', function (event) {
    if (event.target.checked) {
        data.animation = true;
    } else {
        data.animation = false;
    }
    updateOdo();
})

function updateOdo() {
    odometers = Odometer.init();
    for (i = 0; i < odometers.length; i++) {
        if (data.animation) {
            delete odometers[i].options.animation
        } else {
            odometers[i].options.animation = 'count'
        }
    }
}

document.getElementById('abbreviate').addEventListener('click', function () {
    if (document.getElementById('abbreviate').checked == true) {
        data.abbreviate = true;
    } else {
        data.abbreviate = false;
    }
})

document.getElementById('theme').addEventListener('change', function () {
    let theme = document.getElementById('theme').value;
    data.theme = theme;
    themeChanger();
})

function themeChanger() {
    if (confirm('Are you sure you want to change the theme?') == true) {
        clearInterval(updateInterval);
        clearInterval(auditTimeout);
        document.getElementById('main').innerHTML = "";
        initLoad('redo');
    }
}

document.getElementById('fastest').addEventListener('click', function () {
    if (document.getElementById('fastest').checked == true) {
        data.fastest = true;
    } else {
        data.fastest = false;
    }
})

document.getElementById('slowest').addEventListener('click', function () {
    if (document.getElementById('slowest').checked == true) {
        data.slowest = true;
    } else {
        data.slowest = false;
    }
})

let offlineInterval;

function offlineCheck() {
    data.lastOnline = new Date().getTime();
}

if (data.offlineGains == true) {
    document.getElementById('offline').checked = true;
    offlineInterval = setInterval(offlineCheck, 1000);
} else {
    document.getElementById('offline').checked = false;
}

document.getElementById('offline').addEventListener('click', function () {
    if (document.getElementById('offline').checked == true) {
        data.offlineGains = true;
        offlineInterval = setInterval(offlineCheck, 1000);
    } else {
        data.offlineGains = false;
        clearInterval(offlineInterval);
    }
})

document.getElementById('odometerUp').addEventListener('change', function () {
    let animation = document.getElementById('odometerUp').value;
    data.odometerUp = animation;
    fix()
})

document.getElementById('odometerDown').addEventListener('change', function () {
    let animation = document.getElementById('odometerDown').value;
    data.odometerDown = animation;
    fix()
})

document.getElementById('odometerSpeed').addEventListener('change', function () {
    data.odometerSpeed = document.getElementById('odometerSpeed').value;
    fix()
})

function hideSettings() {
    alert("Click what key you want after this alert.")
    document.addEventListener('keydown', function (e) {
        data.hideSettings = e.key;
        alert("Key set to " + e.key)
        document.getElementById('setting').innerText = "Current: " + e.key + ""
        this.removeEventListener('keydown', arguments.callee, false);
    })
}

document.addEventListener('keydown', function (e) {
    if (e.target && e.target.tagName === 'INPUT') return;
    if (e.key == data.hideSettings) {
        if (document.getElementById('settings').style.display == "none") {
            document.getElementById('settings').style.display = "block";
        } else {
            document.getElementById('settings').style.display = "none";
        }
    }
})

function pause() {
    if (data.pause == false) {
        data.pause = true;
        document.getElementById('pauseB').innerText = "Resume"
        clearInterval(updateInterval);
    } else {
        data.pause = false;
        document.getElementById('pauseB').innerText = "Pause"
        updateInterval = setInterval(update, data.updateInterval);
        update()
    }
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

function create50dummychannels() {
    for (let i = 0; i < 50; i++) {
        data.data[i] = {
            name: "Channel " + i,
            count: Math.round(randomGaussian(1000, 100)),
            min_gain: 1,
            max_gain: 2,
            image: '../default.png',
            id: uuidGen()
        }
    }
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

function audit() {
    nextUpdateAudit = true;
    auditTimeout = setTimeout(audit, (random(data.auditStats[2], data.auditStats[3])) * 1000)
}

function saveAuditSettings() {
    data.auditStats[0] = parseFloat(document.getElementById('auditMin').value)
    data.auditStats[1] = parseFloat(document.getElementById('auditMax').value)
    data.auditStats[2] = parseFloat(document.getElementById('auditTimeMin').value)
    data.auditStats[3] = parseFloat(document.getElementById('auditTimeMax').value)
}

function audit2() {
    if (data.audits == false) {
        data.audits = true
        auditTimeout = setTimeout(audit, (random(data.auditStats[2], data.auditStats[3])) * 1000)
        document.getElementById('audit').innerText = "Disable Audits"
    } else {
        data.audits = false
        clearTimeout(auditTimeout)
        document.getElementById('audit').innerText = "Enable Audits"
    }
}

function apiUpdate(interval) {
    if (interval) {
        if (data.apiUpdates.enabled == false) {
            clearInterval(apiInterval)
            document.getElementById('enableApiUpdate').innerText = "Enable API Updates"
        }
    }
    let url = data.apiUpdates.url
    let groups = []
    let channels = ''
    for (let i = 0; i < data.data.length; i++) {
        channels += data.data[i].id + ','
    }
    channels = channels.slice(0, -1)
    if ((data.apiUpdates.maxChannelsPerFetch == 'one')) {
        groups = channels.split(',').map(function (item) {
            return [item];
        });
    } else if ((data.apiUpdates.maxChannelsPerFetch == 'ten')) {
        groups = channels.split(',').map(function (item, index) {
            return index % 10 === 0 ? channels.slice(index, index + 10) : null;
        }).filter(function (item) {
            return item;
        });
    } else if ((data.apiUpdates.maxChannelsPerFetch == 'twentyfive')) {
        groups = channels.split(',').map(function (item, index) {
            return index % 25 === 0 ? channels.slice(index, index + 25) : null;
        }).filter(function (item) {
            return item;
        });
    } else if ((data.apiUpdates.maxChannelsPerFetch == 'fifty')) {
        groups = channels.split(',').map(function (item, index) {
            return index % 50 === 0 ? channels.slice(index, index + 50) : null;
        }).filter(function (item) {
            return item;
        });
    } else if ((data.apiUpdates.maxChannelsPerFetch == 'onehundred')) {
        groups = channels.split(',').map(function (item, index) {
            return index % 100 === 0 ? channels.slice(index, index + 100) : null;
        }).filter(function (item) {
            return item;
        });
    }
    console
    if (url.includes('{{channels}}')) {
        for (let i = 0; i < groups.length; i++) {
            let newUrl = url.replace('{{channels}}', groups[i])
            fetchNext(newUrl)
        }
    } else {
        for (let i = 0; i < groups.length; i++) {
            let newUrl = url + groups[i]
            fetchNext(newUrl)
        }
    }
    function fetchNext(url) {
        if (data.apiUpdates.method == 'GET') {
            if (Object.keys(data.apiUpdates.headers).filter(x => x).length) {
                fetch(url, {
                    method: data.apiUpdates.method,
                    headers: data.apiUpdates.headers,
                }).then(response => response.json())
                    .then(json => {
                        doStuff(json)
                    })
            } else {
                fetch(url, {
                    method: data.apiUpdates.method
                }).then(response => response.json())
                    .then(json => {
                        doStuff(json)
                    })
            }
        } else {
            fetch(url, {
                method: data.apiUpdates.method,
                headers: data.apiUpdates.headers,
                body: JSON.stringify(data.apiUpdates.body)
            }).then(response => response.json())
                .then(json => {
                    doStuff(json)
                })
        }
    }
    function doStuff(json) {
        let channels = json;
        if (data.apiUpdates.response.loop !== 'data') {
            channels = channels[data.apiUpdates.response.loop.split('data.')[1]];
        }
        if (!Array.isArray(channels)) {
            channels = [channels];
        }
        //example data: /*{"t":1715539737408,"counts":[{"value":"subscribers","count":257503920},{"value":"goal","count":496080},{"value":"apisubscribers","count":257000000},{"value":"views","count":48482055846},{"value":"apiviews","count":48459903570},{"value":"videos","count":793}],"user":[{"value":"name","count":"MrBeast"},{"value":"pfp","count":"http://www.banner.yt/UCX6OQ3DkcsbYNE6H8uQQuVA/avatar"},{"value":"banner","count":"http://www.banner.yt/UCX6OQ3DkcsbYNE6H8uQQuVA"}]}*/
        for (let i = 0; i < channels.length; i++) {
            let nameUpdate = undefined;
            let countUpdate = undefined;
            let imageUpdate = undefined;
            let idUpdate = undefined;
            if (data.apiUpdates.response.name.enabled === true) {
                let propertyNames = data.apiUpdates.response.name.path.split('.');
                propertyNames = propertyNames.map(prop => {
                    if (prop.includes('[')) {
                        const split = prop.split('[');
                        const index = parseInt(split[1].split(']')[0]);
                        return [split[0], index];
                    }
                    return prop;
                }).flat();
                let result = channels[i];
                for (const propName of propertyNames) {
                    result = result[propName];
                }
                nameUpdate = result;
            }
            if (data.apiUpdates.response.count.enabled === true) {
                let propertyNames = data.apiUpdates.response.count.path.split('.');
                propertyNames = propertyNames.map(prop => {
                    if (prop.includes('[')) {
                        const split = prop.split('[');
                        const index = parseInt(split[1].split(']')[0]);
                        return [split[0], index];
                    }
                    return prop;
                }).flat();
                let result = channels[i];
                for (const propName of propertyNames) {
                    result = result[propName];
                }
                countUpdate = result;
            }
            if (data.apiUpdates.response.image.enabled === true) {
                let propertyNames = data.apiUpdates.response.image.path.split('.');
                propertyNames = propertyNames.map(prop => {
                    if (prop.includes('[')) {
                        const split = prop.split('[');
                        const index = parseInt(split[1].split(']')[0]);
                        return [split[0], index];
                    }
                    return prop;
                }).flat();
                let result = channels[i];
                for (const propName of propertyNames) {
                    result = result[propName];
                }
                imageUpdate = result;
            }
            let propertyNames = data.apiUpdates.response.id.path.split('.');
            propertyNames = propertyNames.map(prop => {
                if (prop.includes('[')) {
                    const split = prop.split('[');
                    const index = parseInt(split[1].split(']')[0]);
                    return [split[0], index];
                }
                return prop;
            }).flat();
            let result = channels[i];
            for (const propName of propertyNames) {
                result = result[propName];
            }
            idUpdate = result;

            for (let r = 0; r < data.data.length; r++) {
                if (data.apiUpdates.response.id.IDIncludes === true) {
                    if (idUpdate.includes(data.data[r].id)) {
                        if (nameUpdate !== undefined) {
                            data.data[r].name = nameUpdate;
                        }
                        if (imageUpdate !== undefined) {
                            data.data[r].image = imageUpdate;
                        }
                        if (countUpdate !== undefined) {
                            if (abb(countUpdate) !== abb(data.data[r].count)) {
                                data.data[r].count = countUpdate;
                            }
                        }
                    }
                } else {
                    if (data.data[r].id === idUpdate) {
                        if (nameUpdate !== undefined) {
                            data.data[r].name = nameUpdate;
                        }
                        if (imageUpdate !== undefined) {
                            data.data[r].image = imageUpdate;
                        }
                        if (countUpdate !== undefined) {
                            if (abb(countUpdate) !== abb(data.data[r].count)) {
                                data.data[r].count = countUpdate;
                            }
                        }
                    }
                }
            }
        }
    }

}

function enableApiUpdate() {
    clearInterval(apiInterval)
    if (data.apiUpdates.enabled == false) {
        data.apiUpdates.enabled = true
        document.getElementById('enableApiUpdate').innerText = "Disable API Updates"
        apiInterval = setInterval(function () {
            apiUpdate(true)
        }, data.apiUpdates.interval)
        apiUpdate(true)
    } else {
        data.apiUpdates.enabled = false
        document.getElementById('enableApiUpdate').innerText = "Enable API Updates"
    }
}

function saveAPIUpdates() {
    data.apiUpdates.url = document.getElementById('apiLink').value
    data.apiUpdates.maxChannelsPerFetch = (document.getElementById('apiType').value == 'none') ? 'one' : document.getElementById('apiType').value
    data.apiUpdates.method = document.getElementById('apiMethod').value
    let headers = document.getElementById('extraCred').value.toString().split(';&#10;').join(';\n').split(';\n')
    let newHeaders = {}
    for (let i = 0; i < headers.length; i++) {
        let header = headers[i].split(': ')
        if (header[1]) {
            newHeaders[header[0]] = header[1]
        }
    }
    data.apiUpdates.headers = newHeaders
    let body = document.getElementById('body').value.toString().split(';&#10;').join(';\n').split(';\n')
    let newBody = {}
    for (let i = 0; i < body.length; i++) {
        let header = body[i].split(':')
        newBody[header[0]] = header[1]
    }
    data.apiUpdates.body = newBody
    data.apiUpdates.response = {
        'loop': document.getElementById('apiLoop').value,
        'name': {
            'enabled': document.getElementById('updateName').checked,
            'path': document.getElementById('pathName').value
        },
        'count': {
            'enabled': document.getElementById('updateCount').checked,
            'path': document.getElementById('pathCount').value
        },
        'image': {
            'enabled': document.getElementById('updateImage').checked,
            'path': document.getElementById('pathImage').value
        },
        'id': {
            'IDIncludes': document.getElementById('IDIncludes').checked,
            'path': document.getElementById('pathID').value
        }
    }
    data.apiUpdates.interval = parseFloat(document.getElementById('apiUpdateInt').value) * 1000
    data.apiUpdates.enabled = document.getElementById('enableApiUpdate').innerText == 'Disable API Updates' ? true : false
    alert('API Update Settings Saved')
}

function loadAPIUpdates() {
    document.getElementById('apiLink').value = data.apiUpdates.url
    document.getElementById('apiType').value = data.apiUpdates.maxChannelsPerFetch
    document.getElementById('apiMethod').value = data.apiUpdates.method
    let headers = ''
    for (let i = 0; i < Object.keys(data.apiUpdates.headers).length; i++) {
        headers += Object.keys(data.apiUpdates.headers)[i] + ': ' + Object.values(data.apiUpdates.headers)[i] + ';\n'
    }
    document.getElementById('extraCred').value = headers
    let body = ''
    for (let i = 0; i < Object.keys(data.apiUpdates.body).length; i++) {
        body += Object.keys(data.apiUpdates.body)[i] + ': ' + Object.values(data.apiUpdates.body)[i] + ';\n'
    }
    document.getElementById('body').value = body
    document.getElementById('apiLoop').value = data.apiUpdates.response.loop
    document.getElementById('updateName').checked = data.apiUpdates.response.name.enabled
    document.getElementById('pathName').value = data.apiUpdates.response.name.path
    document.getElementById('updateCount').checked = data.apiUpdates.response.count.enabled
    document.getElementById('pathCount').value = data.apiUpdates.response.count.path
    document.getElementById('updateImage').checked = data.apiUpdates.response.image.enabled
    document.getElementById('pathImage').value = data.apiUpdates.response.image.path
    document.getElementById('IDIncludes').checked = data.apiUpdates.response.id.IDIncludes
    document.getElementById('pathID').value = data.apiUpdates.response.id.path
    document.getElementById('apiUpdateInt').value = data.apiUpdates.interval / 1000;
    document.getElementById('enableApiUpdate').innerText = data.apiUpdates.enabled == true ? 'Disable API Updates' : 'Enable API Updates'
}
loadAPIUpdates()

function popupList() {
    let sort = data.sort;
    let order = data.order;
    let theme = data.theme;
    let id = uuidGen();
    let channels = data.data;
    if (specificChannels.length > 0) {
        channels = [];
        for (let i = 0; i < data.data.length; i++) {
            if (specificChannels.includes(data.data[i].id)) {
                channels.push(data.data[i]);
            }
        }
    }
    let popup = window.open('http://localhost/top50/popup.html', 'FYSC', 'width=1000,height=500');
    console.log(channels)
    popups.push({
        'sort': sort,
        'order': order,
        'theme': theme,
        'channels': channels,
        'id': id,
        'popup': popup,
        'specificChannels': true
    })
    let design = setupDesign(channels, sort, order);
    let designStuff = {
        "showImages": data.showImages,
        "showNames": data.showNames,
        "showCounts": data.showCounts,
        "showRankings": data.showRankings,
        "showBlankSlots": data.showBlankSlots,
        "showDifferences": data.showDifferences,
        "bgColor": data.bgColor,
        "textColor": data.textColor,
        "boxColor": data.boxColor,
        "boxBorder": data.boxBorder,
        "imageBorder": data.imageBorder,
        "imageBorderColor": data.imageBorderColor,
        "prependZeros": data.prependZeros,
        "animation": data.animation,
        "abbreviate": data.abbreviate,
        "fastest": data.fastest,
        "slowest": data.slowest,
        'odometerUp': data.odometerUp,
        'odometerDown': data.odometerDown,
        'odometerSpeed': data.odometerSpeed,
        'theme': data.theme,
        'sort': data.sort,
        'order': data.order,
        'max': data.max,
        'data': data.data,
        'visulization': data.visulization
    }
    popup.document.write('<link href="./index.css" rel="stylesheet" type="text/css">')
    popup.document.write('<link href="./odometer.css" rel="stylesheet" type="text/css">')
    popup.document.write('<script src="./odometer.js"></script>')
    popup.document.write(`<style>${design[2]}</style>`)
    popup.document.write(`<div id="main" class="main" style="${design[1]}">${design[0].innerHTML}</div>`)
    popup.document.write(`<script>
    let data = ${JSON.stringify(designStuff)};
    let observer = new MutationObserver(mutationRecords => {
        if (document.getElementById('channels')) {
            data.data = JSON.parse(document.getElementById('channels').innerHTML);
            document.getElementById('channels').remove();
            update();
        }
      });
      const abb = ${abb}
      const updateOdo = ${updateOdo}</script>`)
    popup.document.write(`<script src="./popup.js"></script>`);
}

function selectSpecificChannels() {
    if (pickingChannels == true) {
        pause()
        document.getElementById('selectSpecific').innerText = 'Select Specific Channels'
        document.getElementById('main').removeEventListener('click', selectorFunction)
        pickingChannels = false;
        alert("Saved")
    } else {
        if (confirm('This will reset the previous list of SELECTED channels.')) {
            quickSelecting = false;
            document.getElementById('quickSelectButton').style.border = ""
            document.getElementById('main').removeEventListener('click', selectorFunction, { once: true })
            specificChannels = [];
            alert('Click on the channels you want to add to the list. Click the button again to stop. Counters will pause while selecting channels.')
            document.getElementById('main').addEventListener('click', selectorFunction)
            document.getElementById('selectSpecific').innerText = 'Stop Selecting Channels'
            pause()
            pickingChannels = true;

        }
    }
}

function selectorFunction(e) {
    let target = e.target;
    if (quickSelecting || pickingChannels) {
        while (target && !target.id?.startsWith('card_') && target.nodeName !== 'BODY') {
            target = target.parentElement
        }
        if (!target) return;
    }
    let id = target.id?.split('_')[1]
    if (pickingChannels == true) {
        if (specificChannels.includes(id)) {
            specificChannels.splice(specificChannels.indexOf(id), 1)
            document.getElementById('card_' + id).style.border = 'solid 0.1em ' + data.boxBorder
        } else {
            if (id) {
                specificChannels.push(id)
                document.getElementById('card_' + id).style.border = 'solid 0.1em blue'
            }
        }
    } else {
        if (selected != null) {
            document.getElementById('card_' + selected + '').classList.remove('selected');
            document.getElementById('card_' + selected + '').style.border = "solid 0.1em " + data.boxBorder + "";
        }
        if (!id || id == selected) {
            document.getElementById('quickSelect').value = 'select';
            if (selected != null) {
                document.getElementById('card_' + selected + '').classList.remove('selected');
                document.getElementById('card_' + selected + '').style.border = "solid 0.1em " + data.boxBorder + "";
                selected = null;
                document.getElementById('edit_min_gain').value = "";
                document.getElementById('edit_mean_gain').value = "";
                document.getElementById('edit_std_gain').value = "";
                document.getElementById('edit_max_gain').value = "";
                document.getElementById('edit_name').value = "";
                document.getElementById('edit_count').value = "";
                document.getElementById('edit_image1').value = "";
            }
        } else {
            selected = id;
            document.getElementById('quickSelect').value = selected || 'select';
            if (document.getElementById('card_' + selected + '')) {
                document.getElementById('card_' + selected + '').classList.add('selected');
                document.getElementById('card_' + selected + '').style.border = "solid 0.1em red"
                for (let q = 0; q < data.data.length; q++) {
                    if (data.data[q].id == id) {
                        if ((data.data[q].mean_gain) && (data.data[q].std_gain) && (data.data[q].mean_gain != 0) && (data.data[q].std_gain != 0)) {
                            document.getElementById('edit_mean_gain').value = data.data[q].mean_gain;
                            document.getElementById('edit_mean_gain_check').checked = true;
                            document.getElementById('edit_std_gain').value = data.data[q].mean_gain;
                            document.getElementById('edit_std_gain_check').checked = true;
                        } else {
                            document.getElementById('edit_mean_gain').value = "";
                            document.getElementById('edit_mean_gain_check').checked = false;
                            document.getElementById('edit_std_gain_check').checked = false;
                        }
                        document.getElementById('edit_min_gain').value = data.data[q].min_gain;
                        document.getElementById('edit_max_gain').value = data.data[q].max_gain;
                        document.getElementById('edit_name').value = data.data[q].name;
                        document.getElementById('edit_count').value = data.data[q].count;
                        document.getElementById('edit_image1').value = data.data[q].image;
                    }
                }
            }
        }
    }
    quickSelecting = false;
    document.getElementById('quickSelectButton').style.border = ""
}

function refresh() {
    const currentChannel = document.getElementById('quickSelect').value;
    if (!currentChannel || currentChannel == 'select') {
        document.getElementById('edit_min_gain').value = "";
        document.getElementById('edit_mean_gain').value = "";
        document.getElementById('edit_std_gain').value = "";
        document.getElementById('edit_max_gain').value = "";
        document.getElementById('edit_name').value = "";
        document.getElementById('edit_count').value = "";
        document.getElementById('edit_image1').value = "";
    } else {
        for (let q = 0; q < data.data.length; q++) {
            if (data.data[q].id == currentChannel) {
                if ((data.data[q].mean_gain) && (data.data[q].std_gain) && (data.data[q].mean_gain != 0) && (data.data[q].std_gain != 0)) {
                    document.getElementById('edit_mean_gain').value = data.data[q].mean_gain;
                    document.getElementById('edit_mean_gain_check').checked = true;
                    document.getElementById('edit_std_gain').value = data.data[q].mean_gain;
                    document.getElementById('edit_std_gain_check').checked = true;
                } else {
                    document.getElementById('edit_mean_gain').value = "";
                    document.getElementById('edit_mean_gain_check').checked = false;
                    document.getElementById('edit_std_gain_check').checked = false;
                }
                document.getElementById('edit_min_gain').value = data.data[q].min_gain;
                document.getElementById('edit_max_gain').value = data.data[q].max_gain;
                document.getElementById('edit_name').value = data.data[q].name;
                document.getElementById('edit_count').value = data.data[q].count;
                document.getElementById('edit_image1').value = data.data[q].image;
            }
        }
    }
}

document.getElementById("apiSource").addEventListener('change', function () {
    if (document.getElementById("apiSource").value == 'mixerno1') {
        data.apiUpdates = {
            'enabled': false,
            'url': 'https://mixerno.space/api/youtube-channel-counter/user/{{channels}}',
            'interval': 10000,
            'method': 'GET',
            'body': '',
            'headers': '',
            'maxChannelsPerFetch': 'one',
            'custom': false,
            'response': {
                'loop': 'data',
                'name': {
                    'enabled': true,
                    'path': 'user[0].count'
                },
                'count': {
                    'enabled': true,
                    'path': 'counts[0].count'
                },
                'image': {
                    'enabled': true,
                    'path': 'user[1].count'
                },
                'id': {
                    'IDIncludes': true,
                    'path': 'user[1].count'
                }
            }
        }
    } else if (document.getElementById("apiSource").value == 'mixerno2') {
        data.apiUpdates = {
            'enabled': false,
            'url': 'https://mixerno.space/api/youtube-channel-counter/user/{{channels}}',
            'interval': 10000,
            'method': 'GET',
            'body': '',
            'headers': '',
            'maxChannelsPerFetch': 'one',
            'custom': false,
            'response': {
                'loop': 'data',
                'name': {
                    'enabled': true,
                    'path': 'user[0].count'
                },
                'count': {
                    'enabled': true,
                    'path': 'counts[2].count'
                },
                'image': {
                    'enabled': true,
                    'path': 'user[1].count'
                },
                'id': {
                    'IDIncludes': true,
                    'path': 'user[1].count'
                }
            }
        }
    }
    loadAPIUpdates();
})