let apiurl = window.location.href.includes('lcedit.com') ? apiurl : 'http://localhost:1112/';
let currentIndex = 0;
let auditTimeout;
let saveInterval;
let chart;
let charts = {}; // Store chart instances by channel ID
const BLANK_IMAGE_URL = new URL('../blank.png', document.baseURI).href;
let nextUpdateAudit = false;
let specificChannels = [];
let pickingChannels = false;
let quickSelecting = false;
let odometers = [];
let iso;
let data = {};
let gainTable = {};

let uuid = uuidGen()
let example_data = {
    "settingsEnabled": ["addSettings", "editSettings"],
    "showImages": true,
    "showNames": true,
    "showCounts": true,
    "showRankings": true,
    "rankingsWidth": '10',
    "showBlankSlots": true,
    "showDifferences": false,
    "differenceThreshold": 100,
    "differenceStyles": {
        "left": "75",
        "top": "60",
        "color": "#008000",
        "imageLeft": "10",
        "imageTop": "60",
        "imageSize": "50",
        "imageEnabled": false,
        "shakingEnabled": true,
        "differenceImage": "",
        "differenceSize": '2',
        "lineEnabled": false,
        "lineColor": "#808080",
        "abbDifferences": false
    },
    "cardStyles": {
        "cardWidth": '19',
        "cardHeight": '3.6',
        "imageSize": '3',
        "nameSize": '1',
        "nameWidth": '10',
        "countSize": '2',
        "rankSize": '15',
        "containerHeight": 95,
        "containerWidth": 100,
        "showChart": true,
        "chartLineColor": "#000000",
    },
    "bgColor": "#141414",
    "textColor": "#000",
    "boxColor": "#f7f5fe",
    "boxBorder": "#FFF",
    "imageBorder": "0",
    "boxBorderRadius": "0",
    "imageBorderColor": "#000",
    "prependZeros": false,
    "boxSpacing": 0.2,
    "animation": true,
    "abbreviate": false,
    "fastest": true,
    "fastestIcon": "🔥",
    "slowest": true,
    "slowestIcon": "⌛️",
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
    'offlineGains': false,
    'lastOnline': new Date().getTime(),
    'max': 50,
    'autosave': true,
    'pause': false,
    'audits': false,
    'auditStats': [0, 0, 0, 0],
    "allowNegative": false,
    "randomCountUpdateTime": false,
    "waterFallCountUpdateTime": false,
    "verticallyCenterRanks": false,
    "boxBGLength": "0",
    "boxBGGain": "#f7f5fe",
    "boxBGLose": "#f7f5fe",
    "headerFont": "Arial",
    "mainFont": "Roboto",
    "importFromGoogleFonts": false,
    "counterFontWeight": "400",
    "intervalCount": 0,
    "gainAverageOf": 1,
    "counterAlignment": "left",
    "animatedCards": {
        "duration": 500,
        "enabled": false
    },
    'fireIcons': {
        'enabled': false,
        'type': 'gain',
        'firePosition': 'above',
        'fireBorderColor': '#000',
        'fireBorderWidth': 0,
        'intervalsPerUpdate': 1,
        'created': []
    },
    'apiUpdates': {
        'enabled': false,
        'url': '',
        'interval': 2000,
        'method': 'GET',
        'body': {},
        'headers': {},
        'custom': false,
        'maxChannelsPerFetch': 'one',
        'customAPIList': [],
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
        },
        'forceUpdates': false
    },
    'headerSettings': {
        'totalSections': 0,
        'headerHeight': 0,
        'boxWidth': '',
        'sectionGap': 0,
        'items': []
    },
    'scripts': [],
    'customCSS': ''
};
let updateInterval;
let apiInterval;

initLoad()
function initLoad(redo, previousTheme) {
    let storedData = localStorage.getItem("data") ? JSON.parse(localStorage.getItem("data")) : null;

    if (!redo) {
        if (storedData) {
            data = mergeWithExampleData(storedData, example_data);
        } else {
            data = example_data;
        }
    }

    // Ensure headerSettings exists and filter out undefined items
    if (!data.headerSettings) {
        data.headerSettings = {
            totalSections: 0,
            headerHeight: 0,
            boxWidth: '',
            sectionGap: 10,
            footerHeight: 0,
            footerGap: 10,
            items: []
        };
    }
    if (data.headerSettings.footerHeight == null) data.headerSettings.footerHeight = 0;
    if (data.headerSettings.footerGap == null) data.headerSettings.footerGap = 10;
    if (!data.headerSettings.items) {
        data.headerSettings.items = [];
    }
    // Filter out items with undefined or "undefined" names; default placement to 'header'
    data.headerSettings.items = data.headerSettings.items.filter(item =>
        item && item.name && item.name !== 'undefined' && item.name !== undefined && item.name.trim() !== ''
    );
    data.headerSettings.items.forEach(item => { if (item.placement == null) item.placement = 'header'; });

    // Reset sizes if switching away from top1
    if (redo && previousTheme && previousTheme.includes('top1') && !data.theme.includes('top1')) {
        const defaultCardWidth = 19;
        const defaultCardHeight = 3.6;
        const defaultImageSize = 3;
        const defaultNameSize = 1;
        const defaultCountSize = 2;
        const defaultRankSize = 15;

        data.cardStyles.cardWidth = String(defaultCardWidth);
        data.cardStyles.cardHeight = String(defaultCardHeight);
        data.cardStyles.imageSize = String(defaultImageSize);
        data.cardStyles.nameSize = String(defaultNameSize);
        data.cardStyles.countSize = String(defaultCountSize);
        data.cardStyles.rankSize = String(defaultRankSize);
    }

    if (data.animatedCards.enabled) {
        document.getElementById('main').style.height = '90vh';
        const container = document.getElementById("main");
        iso = new Isotope(container, {
            itemSelector: '.card',
            layoutMode: 'masonryHorizontal',
            getSortData: {
                number: function (elem) {
                    return parseFloat(elem.getAttribute('data-count')) || 0;
                }
            },
            masonryHorizontal: {
                rowHeight: 1,
            },
            transitionDuration: data.animatedCards.duration
        });
    }

    if (data.apiUpdates.enabled) {
        apiInterval = setInterval(function () {
            apiUpdate(true);
        }, parseFloat(data.apiUpdates.interval));
    }
    if (data.theme.includes('top100')) {
        data.max = 100;
    } else if (data.theme.includes('top150')) {
        data.max = 150;
    } else if (data.theme.includes('top200')) {
        data.max = 200;
    } else if (data.theme.includes('top50')) {
        data.max = 50;
    } else if (data.theme.includes('top25')) {
        data.max = 25;
    } else if (data.theme.includes('top15')) {
        data.max = 15;
    } else if (data.theme.includes('top10')) {
        data.max = 10;
    } else if (data.theme.includes('top1')) {
        data.max = 1;
        // Increase sizes by default for single channel display (only if not already increased)
        // Check if sizes are still at default values (approximately)
        const defaultCardWidth = 19;
        const defaultCardHeight = 3.6;
        const defaultImageSize = 3;
        const defaultNameSize = 1;
        const defaultCountSize = 2;
        const defaultRankSize = 15;

        const currentCardWidth = parseFloat(data.cardStyles.cardWidth || defaultCardWidth);
        const currentCardHeight = parseFloat(data.cardStyles.cardHeight || defaultCardHeight);
        const currentImageSize = parseFloat(data.cardStyles.imageSize || defaultImageSize);
        const currentNameSize = parseFloat(data.cardStyles.nameSize || defaultNameSize);
        const currentCountSize = parseFloat(data.cardStyles.countSize || defaultCountSize);
        const currentRankSize = parseFloat(data.cardStyles.rankSize || defaultRankSize);

        // Only increase if sizes are close to default (within 30% tolerance) and not already increased
        const tolerance = 0.3;
        const isNearDefault = Math.abs(currentCardWidth - defaultCardWidth) / defaultCardWidth < tolerance &&
            Math.abs(currentCardHeight - defaultCardHeight) / defaultCardHeight < tolerance &&
            Math.abs(currentImageSize - defaultImageSize) / defaultImageSize < tolerance &&
            Math.abs(currentNameSize - defaultNameSize) / defaultNameSize < tolerance &&
            Math.abs(currentCountSize - defaultCountSize) / defaultCountSize < tolerance &&
            Math.abs(currentRankSize - defaultRankSize) / defaultRankSize < tolerance;

        // Check if sizes are already increased (more than 2x default)
        const isAlreadyIncreased = currentCardWidth > defaultCardWidth * 2 ||
            currentCardHeight > defaultCardHeight * 2 ||
            currentImageSize > defaultImageSize * 2 ||
            currentNameSize > defaultNameSize * 2 ||
            currentCountSize > defaultCountSize * 2 ||
            currentRankSize > defaultRankSize * 2;

        if (isNearDefault && !isAlreadyIncreased) {
            data.cardStyles.cardWidth = String(defaultCardWidth * 3);
            data.cardStyles.cardHeight = String(defaultCardHeight * 3);
            data.cardStyles.imageSize = String(defaultImageSize * 3);
            data.cardStyles.nameSize = String(defaultNameSize * 3);
            data.cardStyles.countSize = String(defaultCountSize * 3);
            data.cardStyles.rankSize = String(defaultRankSize * 3);
        }
    }
    data.pause = false;
    if (data.lastOnline && data.offlineGains == true) {
        const intervalsPassed = (new Date().getTime() - data.lastOnline) / data.updateInterval;
        for (let i = 0; i < data.data.length; i++) {
            if (isFinite(data.data[i].std_gain) && data.data[i].std_gain != null) {
                const meanGain = parseFloat(data.data[i].mean_gain) || 0;
                const stdGain = parseFloat(data.data[i].std_gain) || 0;

                /*
                    The sum of N normally distributed random variables with mean M and standard deviation S
                    is normally distributed with mean M*N and standard deviation S*sqrt(N).
                 */

                data.data[i].count += randomGaussian(
                    meanGain * intervalsPassed,
                    stdGain * Math.sqrt(intervalsPassed));
            } else {

                /*
                    The sum of N uniformly distributed random variables with minimum A and maximum B
                    is approximately normally distributed with mean (A+B)*N/2 and standard deviation
                    (B-A)*sqrt(N/12).

                    See https://en.wikipedia.org/wiki/Irwin%E2%80%93Hall_distribution#Approximating_a_Normal_distribution
                    for more details.
                */

                const minGain = parseFloat(data.data[i].min_gain) || 0;
                const maxGain = parseFloat(data.data[i].max_gain) || 0;

                data.data[i].count += randomGaussian(
                    (maxGain + minGain) * intervalsPassed / 2,
                    (maxGain - minGain) * Math.sqrt(intervalsPassed / 12)
                )
            }
        }
        data.lastOnline = new Date().getTime();
    }
    let design = setupDesign(redo);
    document.getElementById('main').innerHTML = design[0].innerHTML;
    document.getElementById('main').style = design[1];

    if (data.animatedCards.enabled) {
        document.getElementById('designStyles').innerText = design[2];

        document.querySelectorAll('.card').forEach(item => {
            iso.appended(document.getElementById(item.id));
        })
    }

    if (!data.uuid) {
        data.uuid = uuidGen();
    }
    if (!data.bgColor.startsWith('http') && !data.bgColor.startsWith('data')) {
        document.body.style.backgroundColor = data.bgColor;
    } else {
        document.body.style.backgroundImage = 'url(' + data.bgColor + ')';
    }
    document.body.style.color = data.textColor;
    adjustColors();
    fix();
    updateOdo();
    updateInterval = setInterval(update, data.updateInterval);
    data.settingsEnabled.forEach(item => {
        let element = document.getElementById(item);
        let button = document.getElementById('button_' + item);
        element.classList.remove("hidden");
        button.classList.add("enabled");
    });
    fixSettings();
};

function setupDesign(redo) {
    let c = 1;
    let toReturn = ["", "", ""]
    let main = document.createElement('div');
    let channels = data.data;
    if ((data.theme.includes('top100')) || (data.theme.includes('top150'))) {
        toReturn[1] = "margin-top: 0px; display: grid; grid-template-columns: repeat(10, 1fr);";
    } else if (data.theme.includes('top200')) {
        toReturn[1] = "margin-top: 0px; display: grid; grid-template-columns: repeat(10, 1fr);";
    } else {
        toReturn[1] = "margin-top: 0px; display: grid; grid-template-columns: repeat(5, 1fr);";
    }

    if (data.theme.includes('H') || data.animatedCards.enabled) {
        let cards = parseInt(data.theme.split('H')[0].split('top')[1]);
        toReturn[1] = "margin-top: 0px; display: grid; grid-template-columns: repeat(5, 1fr);";

        if (cards > 50) {
            if (redo) {
                data.cardStyles.cardWidth = '9'
            }
            toReturn[1] = "margin-top: 0px; display: grid; grid-template-columns: repeat(10, 1fr);";
        } else if (cards > 25) {
            if (redo) {
                data.cardStyles.cardWidth = '19'
            }
            toReturn[1] = "margin-top: 0px; display: grid; grid-template-columns: repeat(5, 1fr);";
        } else if (cards === 1) {
            // Single channel - use single column layout
            toReturn[1] = "margin-top: 0px; display: grid; grid-template-columns: repeat(1, 1fr);";
        }

        for (let l = 1; l <= cards; l++) {
            const dataIndex = c - 1;
            const htmlcard = document.createElement('div');
            const cid = channels[dataIndex] ? channels[dataIndex].id : '';
            htmlcard.innerHTML = `<div class="card card_${dataIndex}" id="card_${cid}">
                <div class="num" id="num_${cid}"><div class="num_text">${c}</div></div>
                <img src="../blank.png" alt="" id="image_${cid}" class="image">
                <div>
                    <div class="name" id="name_${cid}">Loading...</div>
                    <div class="count odometer" id="count_${cid}">${getDisplayedCount(Math.floor(channels[dataIndex] ? channels[dataIndex].count : 0))}</div>
                </div>
                <img src="${data.differenceStyles.differenceImage}" class="gapimg">
                <div class="subgap"><span class="text"></span><span class="odometer no_color_transition"></span></div>
                <div class="difference_line"></div>
                <div class="chart" id="chart_${cid}"></div>
            </div>`;

            if (channels[dataIndex]) {
                if (htmlcard.querySelector('.image').src != channels[dataIndex].image) {
                    htmlcard.querySelector('.image').src = channels[dataIndex].image || '../default.png'
                }
                htmlcard.querySelector('.name').innerText = channels[dataIndex].name || 'Loading...'
            }
            c += 1;
            main.innerHTML += htmlcard.innerHTML;
        }
    } else {
        let columns = data.theme == 'top100' ? 10 : 5;
        columns = data.theme == 'top150' ? 10 : columns;
        columns = data.theme == 'top200' ? 10 : columns;
        columns = data.theme == 'top1' ? 1 : columns;
        columns = data.theme == 'top15' ? 5 : columns;

        if (columns === 1) {
            // Single channel - use single column layout
            toReturn[1] = "margin-top: 0px; display: grid; grid-template-columns: repeat(1, 1fr);";
        } else if (columns > 5) {
            if (redo) {
                data.cardStyles.cardWidth = '9'
            }
            toReturn[1] = "margin-top: 0px; display: grid; grid-template-columns: repeat(10, 1fr);";
        } else if (columns > 3) {
            if (redo) {
                data.cardStyles.cardWidth = '19'
            }
            toReturn[1] = "margin-top: 0px; display: grid; grid-template-columns: repeat(5, 1fr);";
        }

        for (let l = 1; l <= columns; l++) {
            const htmlcolumn = document.createElement('div');
            htmlcolumn.classList = `column_${l} column`;
            const maxCards = data.max / columns;
            for (let t = 1; t <= maxCards; t++) {
                const dataIndex = c - 1;
                const htmlcard = document.createElement('div');
                const cid = channels[dataIndex] ? channels[dataIndex].id : '';
                htmlcard.innerHTML = `<div class="card card_${dataIndex}" id="card_${cid}">
                <div class="num" id="num_${cid}"><div class="num_text">${c}</div></div>
                <img src="../blank.png" alt="" id="image_${cid}" class="image">
                <div>
                    <div class="name" id="name_${cid}">Loading...</div>
                    <div class="count odometer" id="count_${cid}">${getDisplayedCount(Math.floor(channels[dataIndex] ? channels[dataIndex].count : 0))}</div>
                </div>
                <img src="${data.differenceStyles.differenceImage}" class="gapimg">
                <div class="subgap"><span class="text"></span><span class="odometer no_color_transition"></span></div>
                <div class="difference_line"></div>
                <div class="chart" id="chart_${cid}"></div>
                </div>`;
                if (channels[dataIndex]) {
                    if (htmlcard.querySelector('.image').src != channels[dataIndex].image) {
                        htmlcard.querySelector('.image').src = channels[dataIndex].image || '../default.png'
                    }
                    htmlcard.querySelector('.name').innerText = channels[dataIndex].name || 'Loading...'
                }
                htmlcolumn.innerHTML += htmlcard.innerHTML;
                c += 1;
            }
            main.appendChild(htmlcolumn);
        }
    }
    toReturn[0] = main;
    document.getElementById('theme').value = data.theme;

    if (data.animatedCards.enabled) {
        toReturn[1] = 'height: 90vh'
        toReturn[2] = '.card {margin: 5px;}'
    }

    document.getElementById('customCSSOverrides').innerHTML = data['customCSS'] || '';
    document.getElementById('customCSS').value = data['customCSS'] || '';

    // Initialize charts if showChart is enabled
    if (data.cardStyles.showChart && typeof Highcharts !== 'undefined') {
        setTimeout(initializeCharts, 200);
    }

    return toReturn;
}

function initializeCharts() {
    if (typeof Highcharts === 'undefined') {
        console.warn('Highcharts not loaded, charts will not be displayed');
        return;
    }

    data.data.forEach(function (channel) {
        if (!channel || !channel.id) return;

        const chartElement = document.getElementById('chart_' + channel.id);
        if (!chartElement) return;

        // Ensure chart element is visible before creating chart
        if (chartElement.style.display === 'none') {
            return;
        }

        // Destroy existing chart if it exists
        if (charts[channel.id]) {
            try {
                charts[channel.id].destroy();
            } catch (e) {
                // Ignore errors when destroying
            }
        }

        // Initialize chart data from gainTable or create empty array
        let chartData = [];
        if (gainTable[channel.id] && gainTable[channel.id].length > 0) {
            const now = Date.now();
            const dataPoints = gainTable[channel.id];
            chartData = dataPoints.map((value, index) => {
                // Create timestamps going back in time
                const timeOffset = (dataPoints.length - index - 1) * data.updateInterval;
                return [now - timeOffset, parseFloat(value) || 0];
            });
        } else {
            // Start with current count - add at least 2 points so line is visible
            const now = Date.now();
            const count = parseFloat(channel.count) || 0;
            chartData = [
                [now - data.updateInterval, count],
                [now, count]
            ];
        }

        try {
            // Create chart using Highcharts Stock
            charts[channel.id] = Highcharts.stockChart('chart_' + channel.id, {
                chart: {
                    backgroundColor: 'transparent',
                    height: 60,
                    margin: [0, 0, 0, 0]
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: ''
                },
                legend: {
                    enabled: false
                },
                rangeSelector: {
                    enabled: false
                },
                navigator: {
                    enabled: false
                },
                scrollbar: {
                    enabled: false
                },
                xAxis: {
                    labels: {
                        enabled: false
                    },
                    lineWidth: 0,
                    tickWidth: 0
                },
                yAxis: {
                    labels: {
                        enabled: false
                    },
                    gridLineWidth: 0,
                    title: {
                        text: ''
                    }
                },
                series: [{
                    name: 'Count',
                    data: chartData,
                    type: 'line',
                    color: data.cardStyles.chartLineColor || data.textColor || '#000',
                    lineWidth: 2,
                    marker: {
                        enabled: false
                    },
                    enableMouseTracking: false
                }],
                tooltip: {
                    enabled: false
                },
                plotOptions: {
                    series: {
                        animation: false
                    }
                }
            });

            // Ensure chart is properly rendered
            setTimeout(function () {
                if (charts[channel.id]) {
                    try {
                        charts[channel.id].reflow();
                    } catch (e) {
                        // Ignore reflow errors
                    }
                }
            }, 50);
        } catch (e) {
            console.error('Error creating chart for channel ' + channel.id + ':', e);
        }
    });
}

function updateCharts() {
    if (typeof Highcharts === 'undefined' || !data.cardStyles.showChart) return;

    data.data.forEach(function (channel) {
        if (!channel || !channel.id || !charts[channel.id]) return;

        try {
            const chart = charts[channel.id];
            const series = chart.series[0];

            if (series) {
                const now = Date.now();
                const count = parseFloat(channel.count) || 0;

                // Add new point
                series.addPoint([now, count], true, true);

                // Keep only last 50 points for performance
                if (series.data.length > 50) {
                    series.data[0].remove(false);
                }
            }
        } catch (e) {
            // Ignore errors when updating charts
            console.warn('Error updating chart for channel ' + channel.id + ':', e);
        }
    });
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
    let addBgColor = document.getElementById('add_bg_color').value;
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
            bg: addBgColor
        });
        fix();
    }
}

let appendedMDMStyles = false;

function setupMDMStyles() {
    if (data.fireIcons.firePosition !== 'mdm' || !data.fireIcons.enabled) {
        appendedMDMStyles = false;
        document.getElementById('mdm-styles').remove();
        document.querySelectorAll('.num').forEach(item => {
            item.style.backgroundImage = '';
            item.style.border = '';
        })
        return;
    }

    let cardSpacings;

    if (!data.showImages && data.showRankings) {
        cardSpacings = "1fr 7fr";
    } else if (data.showImages && !data.showRankings) {
        cardSpacings = "2fr 6fr";
    } else if (!data.showImages && !data.showRankings) {
        cardSpacings = "8fr";
    } else {
        cardSpacings = "1fr 2fr 5fr";
    }

    let stylesToAppend = `<style id="mdm-styles">
                        .card {
                            display: grid;
                            grid-template-columns: ${cardSpacings};
                        }
    
                        .num {
                            height: 100%;
                            display: flex;
                            ${data.verticallyCenterRanks ? 'flex-direction: column' : ''}
                            align-items: center;
                            border-radius: 5px;
                            background-position: center;
                            background-size: cover;
                            font-size: 1.5em;
                        }

                        .num_text {
                            ${data.verticallyCenterRanks ? 'margin-top: 0.25em;' : 'margin-top: -1.5em;'}
                            z-index: 1000;
                            text-align: center;
                        }

                        .num_text span {
                            font-size: 1.2em;
                        }

                        .num_text span:nth-child(2)
                        }
                            </style>`
    document.body.insertAdjacentHTML('beforeend', stylesToAppend);
    appendedMDMStyles = true;
}

function update(doGains = true) {
    let intervalNumber = data.intervalCount;
    console.time(`Update #${intervalNumber + 1} took`)
    if (data) {
        data.lastOnline = Date.now();
        let fastest = ""
        let fastestCount = -Infinity;
        let slowest = ""
        let slowestCount = Infinity;
        let past = document.getElementById('quickSelect').value;
        document.getElementById('quickSelect').innerHTML = "";
        let selections = ['<option value="select">Select</option>'];
        for (let i = 0; i < data.data.length; i++) {
            if (!data.data[i]) {
                data.data.splice(i, 1);
                i--;
                continue;
            }
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
                if (getGain(data.data[i].id) >= fastestCount) {
                    fastestCount = getGain(data.data[i].id);
                    fastest = data.data[i].id;
                }
                if (getGain(data.data[i].id) < slowestCount) {
                    slowestCount = getGain(data.data[i].id);
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
            if (!gainTable[data.data[i].id]) {
                gainTable[data.data[i].id] = [];
            }
            gainTable[data.data[i].id].push(getDisplayedCount(data.data[i].count));
            gainTable[data.data[i].id] = gainTable[data.data[i].id].slice(-(data.gainAverageOf + 1));
        }
        document.getElementById('quickSelect').innerHTML = selections.join("");
        document.getElementById('quickSelect').value = past || 'select';
        if (!data.animatedCards.enabled) {
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
        }
        if (document.getElementById('order').value == "asc") {
            data.data = data.data.reverse();
        }

        if (data.fireIcons.enabled) {
            if (data.fireIcons.firePosition == 'mdm') {
                if (!appendedMDMStyles) {
                    setupMDMStyles();
                }
            }
        }
        for (let i = 0; i < data.max; i++) {
            let extraTimeTillUpdate = 0;
            const interval = data.updateInterval;
            if (data.randomCountUpdateTime == true) {
                extraTimeTillUpdate = random(0, interval);
            }
            if (data.waterFallCountUpdateTime == true) {
                extraTimeTillUpdate = i * 100;
            }
            setTimeout(function () {
                num = formatRank(i + 1);
                const currentCard = document.getElementsByClassName("card")[i];
                if (currentCard) {
                    if (data.animatedCards.enabled) {
                        num = currentCard.children[0].children[0].innerText
                    }
                    if (data.data[i]) {
                        if (!data.data[i].image) {
                            data.data[i].image = "../default.png";
                        }
                        if ((data.data[i].bg) && (boxBGLength !== '1')) {
                            currentCard.style.background = data.data[i].bg;
                        } else {
                            currentCard.style.backgroundColor = data.boxColor;
                        }
                        currentCard.id = "card_" + data.data[i].id
                        currentCard.children[0].id = "num_" + data.data[i].id

                        const absoluteUrl = new URL(data.data[i].image, window.location.href).href;

                        if (!(currentCard.children[1].src === absoluteUrl)) {
                            currentCard.children[1].src = data.data[i].image;
                        }

                        currentCard.children[1].id = "image_" + data.data[i].id

                        currentCard.children[2].children[0].innerText = data.data[i].name
                        currentCard.children[2].children[0].id = "name_" + data.data[i].id

                        currentCard.children[2].children[1].id = "count_" + data.data[i].id
                        currentCard.children[2].children[1].innerText = getDisplayedCount(data.data[i].count)
                        currentCard.setAttribute('data-count', data.data[i].count)
                        //HERE
                        if (data.data[i + 1]) {
                            if (data.data[i].count - data.data[i + 1].count < parseInt(data.differenceThreshold)) {
                                currentCard.children[4].querySelector(".text").innerText = abbs(getDisplayedCount(data.data[i].count) - getDisplayedCount(data.data[i + 1].count));
                                currentCard.children[4].querySelector(".odometer").innerText = getDisplayedCount(data.data[i].count) - getDisplayedCount(data.data[i + 1].count)
                                currentCard.children[3].style.visibility = 'visible';
                                currentCard.children[4].style.visibility = 'visible';
                                currentCard.children[5].style.visibility = 'visible';
                            } else {
                                currentCard.children[3].style.visibility = 'hidden';
                                currentCard.children[4].style.visibility = 'hidden';
                                currentCard.children[5].style.visibility = 'hidden';
                            }
                        } else {
                            currentCard.children[3].style.visibility = 'hidden';
                            currentCard.children[4].style.visibility = 'hidden';
                            currentCard.children[5].style.visibility = 'hidden';
                        }
                        if (selected !== data.data[i].id) {
                            document.getElementById("card_" + data.data[i].id).style.border = "0.1em solid " + data.boxBorder + "";
                        }
                        if (fastest == data.data[i].id) {
                            if (data.fastest == true) {
                                document.getElementById("card_" + fastest).children[2].children[0].innerText = "" + data.fastestIcon + " " + data.data[i].name
                            }
                        }
                        if (slowest == data.data[i].id) {
                            if (data.slowest == true) {
                                document.getElementById("card_" + slowest).children[2].children[0].innerText = "" + data.slowestIcon + " " + data.data[i].name
                            }
                        }
                        if (data.fireIcons.enabled && data.intervalCount % data.fireIcons.intervalsPerUpdate === 0) {
                            let firePosition = data.fireIcons.firePosition;
                            if (firePosition == 'before' || firePosition == 'after') {
                                document.getElementById("styles").innerHTML = `.num { display: flex; }`;
                            } else {
                                document.getElementById("styles").innerHTML = ``;
                            }
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
                                    let icon = data.fireIcons.created[q].icon;
                                    let fire = document.createElement('img');
                                    fire.classList = 'fireIcon';
                                    fire.style = `height: 1.5vw; width: 1.5vw;
                                        border: solid ${escapeHTML(data.fireIcons.fireBorderWidth)}px ${escapeHTML(data.fireIcons.fireBorderColor)};`;
                                    fire.src = escapeHTML(icon);

                                    if (firePosition == 'replace') {
                                        currentCard.children[0].innerHTML = fire.outerHTML;
                                    } else if (firePosition == 'before') {
                                        currentCard.children[0].innerHTML = fire.outerHTML + `<div class="num_text">${num}</div>`;
                                    } else if (firePosition == 'after') {
                                        currentCard.children[0].innerHTML = `<div class="num_text">${num}</div>` + fire.outerHTML;
                                    } else if (firePosition == 'above') {
                                        currentCard.children[0].innerHTML = fire.outerHTML + `<br><div class="num_text">${num}</div>`;
                                    } else if (firePosition == 'below') {
                                        currentCard.children[0].innerHTML = `<div class="num_text">${num}</div><br>` + fire.outerHTML;
                                    } else if (firePosition == 'left') {
                                        if (!currentCard.children[2].children[0].innerHTML.includes('<img class="fireIcon"')) {
                                            currentCard.children[2].children[0].innerHTML = fire.outerHTML + currentCard.children[2].children[0].innerHTML;
                                            currentCard.children[0].innerHTML = `<div class="num_text">${num}</div>`;
                                        }
                                    } else if (firePosition == 'right') {
                                        if (!currentCard.children[2].children[0].innerHTML.includes('<img class="fireIcon"')) {
                                            currentCard.children[2].children[0].innerHTML = currentCard.children[2].children[0].innerHTML + fire.outerHTML;
                                            currentCard.children[0].innerHTML = `<div class="num_text">${num}</div>`;
                                        }
                                    } else if (firePosition == 'replaceName') {
                                        currentCard.children[2].children[0].innerHTML = fire.outerHTML;
                                        currentCard.children[0].innerHTML = `<div class="num_text">${num}</div>`;
                                    } else if (firePosition == 'mdm') {
                                        currentCard.children[0].style.color = `${data.fireIcons.created[q].color}`;
                                        currentCard.children[0].style.border = `solid ${data.fireIcons.fireBorderColor} ${data.fireIcons.fireBorderWidth}px`
                                        currentCard.children[0].style.backgroundImage = `url(${escapeHTML(icon)})`;
                                        currentCard.children[0].innerHTML = `<div class="num_text">${num}</div>`;
                                        currentCard.children[0].children[0].style.marginTop = data.fireIcons.created[q].margin ? data.fireIcons.created[q].margin + "px" : "";
                                        currentCard.children[0].children[0].style.marginLeft = data.fireIcons.created[q].marginLeft ? data.fireIcons.created[q].marginLeft + "px" : "";
                                    } else {
                                        currentCard.children[0].innerHTML = `<div class="num_text">${num}</div>`;
                                    }
                                    break;
                                } else {
                                    currentCard.children[0].innerHTML = `<div class="num_text">${num}</div>`;
                                    if (firePosition == 'mdm') {
                                        currentCard.children[0].style.backgroundImage = `url('')`;
                                        currentCard.children[0].style.color = `${data.textColor}`;
                                        currentCard.children[0].children[0].style.marginTop = "";
                                        currentCard.children[0].children[0].style.marginLeft = "";
                                    }
                                }
                            }
                        } else {
                            currentCard.children[0].children[0].innerText = num;
                        }
                        if (data.boxBGLength !== '0') {
                            if (getDisplayedCount(data.data[i].count) > getDisplayedCount(data.data[i].lastCount)) {
                                currentCard.style.backgroundColor = `${data.boxBGGain}`;
                            } else if (getDisplayedCount(data.data[i].count) < getDisplayedCount(data.data[i].lastCount)) {
                                currentCard.style.backgroundColor = `${data.boxBGLose}`;
                            }
                            let user = data.data[i]
                            setTimeout(function (currentCard, user) {
                                let bgColor = user.bg ? user.bg : data.boxColor;
                                currentCard.style.backgroundColor = bgColor;
                            }, parseInt(data.boxBGLength * 1000), currentCard, user);
                        }
                    } else {
                        currentCard.id = 'card_'
                        currentCard.children[0].id = "num_"
                        currentCard.children[1].id = "image_"
                        if (currentCard.children[1].src !== BLANK_IMAGE_URL) {
                            currentCard.children[1].src = BLANK_IMAGE_URL
                        }
                        currentCard.children[2].children[0].id = "name_"
                        currentCard.children[2].children[0].innerText = 'Loading...'
                        currentCard.children[2].children[1].id = "count_"
                        currentCard.children[2].children[1].innerText = '0'
                        currentCard.children[4].querySelector(".odometer").innerText = 0;
                        currentCard.children[4].querySelector(".text").innerText = 0;
                        currentCard.children[0].innerHTML = `<div class="num_text">${num}</div>`;
                        currentCard.children[0].style.backgroundImage = `url('')`;
                        currentCard.children[0].style.color = `${data.textColor}`;
                        currentCard.children[0].children[0].style.marginTop = "";
                        currentCard.children[0].children[0].style.marginLeft = "";
                    }
                }
            }, extraTimeTillUpdate);
        }

        if (data.animatedCards.enabled) {
            iso.updateSortData();
            iso.arrange({
                sortBy: 'number',
                sortAscending: false
            });

            setTimeout(function () {
                const allCards = Array.from(document.getElementsByClassName("card"));

                // Filter out cards that don't have data (the empty/loading ones)
                const validCards = allCards.filter(card => card.getAttribute('data-count') !== null);

                // Sort by data-count value (highest to lowest), then by name for ties
                validCards.sort((a, b) => {
                    const countA = parseFloat(a.getAttribute('data-count')) || 0;
                    const countB = parseFloat(b.getAttribute('data-count')) || 0;

                    // First sort by count (highest to lowest)
                    if (countB !== countA) {
                        return countB - countA;
                    }

                    // If counts are equal, sort by name alphabetically as tiebreaker
                    const nameA = a.children[2]?.children[0]?.innerText || '';
                    const nameB = b.children[2]?.children[0]?.innerText || '';
                    return nameA.localeCompare(nameB);
                });

                // Update rank numbers based on sorted order
                validCards.forEach((card, index) => {
                    if (card.children[0] && card.children[0].children[0]) {
                        const newRank = formatRank(index + 1);
                        card.children[0].children[0].innerText = newRank;
                    }
                });
            }, 100); // Small delay to ensure isotope has finished arranging
        }
    }
    data.intervalCount++;

    // Update charts if enabled
    if (data.cardStyles.showChart) {
        updateCharts();
    }

    console.timeEnd(`Update #${intervalNumber + 1} took`);
}

let selected = null;
document.getElementById('quickSelectButton').addEventListener('click', function (e) {
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
                for (let i = 0; i < data.data.length; i++) {
                    if (data.data[i].id == id) {
                        data.data[i].name = name;
                    }
                }
                try {
                    card.querySelector('.name').innerText = name;
                } catch { }
            }
            if (document.getElementById('edit_bg_color_check').checked) {
                for (let i = 0; i < data.data.length; i++) {
                    if (data.data[i].id == id) {
                        data.data[i].bg = document.getElementById('edit_bg_color').value;
                    }
                }
                try {
                    card.style.background = document.getElementById('edit_bg_color').value;
                } catch { }
            }
            if (document.getElementById('edit_count_check').checked) {
                for (let i = 0; i < data.data.length; i++) {
                    if (data.data[i].id == id) {
                        data.data[i].count = count;
                    }
                }
                try {
                    card.querySelector('.odometer').innerText = getDisplayedCount(count);
                } catch { }
            }
            if (document.getElementById('edit_image_check').checked) {
                for (let i = 0; i < data.data.length; i++) {
                    if (data.data[i].id == id) {
                        data.data[i].image = image;
                    }
                }
                try {
                    card.querySelector('.image').src = image;
                } catch { }
            }
        }
    } else {
        alert("Please select a card by clicking it.");
    }
}

document.getElementById('loadData1').addEventListener('change', function () {
    if (confirm('Are you sure you want to import a new save? Your current data will be erased')) {
        load();
    }
});

document.getElementById('loadData2').addEventListener('change', function () {
    if (confirm('Are you sure you want to import a new save? Your current data will be erased')) {
        load1();
    }
});

document.getElementById('loadData3').addEventListener('change', function () {
    if (confirm('Are you sure you want to add these new channels?')) {
        addNewChannels();
    }
});

function addNewChannels() {
    let stats = {
        success: 0,
        failed: 0
    }
    if (document.getElementById('loadData3').files[0]) {
        document.getElementById('loadData3').files[0].text().then(function (data2) {
            const newChannels = JSON.parse(data2).data;
            newChannels.forEach((item, index) => {
                const has = data.data.some(channel => channel.id === item.id);
                if (has) {
                    stats.failed++;
                } else {
                    stats.success++;
                    data.data.push(item);
                }
                if (index == newChannels.length - 1) {
                    alert('Imported ' + stats.success + " channels! (" + stats.failed + " duplicates)")
                }
            })
        })
    }
}

function load1() {
    if (document.getElementById('loadData2').files[0]) {
        document.getElementById('loadData2').files[0].text().then(function (data2) {
            data.data.push(JSON.parse(data2))
        })
    }
}

function load() {
    var data3 = {};
    if (document.getElementById('loadData1').files[0]) {
        document.getElementById('loadData1').files[0].text().then(function (data2) {
            data3 = JSON.parse(data2);
            if (data3.data) {
                clearInterval(updateInterval);
                clearInterval(auditTimeout);
                data = JSON.parse(data2);
                if (!data.uuid) {
                    data.uuid = uuidGen();
                }
                try {
                    localStorage.setItem("data", JSON.stringify(data));
                } catch (error) {
                    console.error(error);
                }
                document.getElementById('main').innerHTML = "";
                window.location.reload()
            }
        });
    } else {
        alert('No save file found!')
    }
}
function save2(public = false) {
    let data2;
    if (public) {
        data2 = structuredClone(data);
        data2.apiUpdates.enabled = false;
        data2.apiUpdates.url = '';
        data2.apiUpdates.body = Object.create(null);
        data2.apiUpdates.headers = Object.create(null);
        data2.uuid = null;
    } else {
        data2 = data;
    }
    if (public || confirm("PLEASE READ: You are exporting a private save file. This means that the save file will include things like any API keys you have put in. If you do not wish for this data to be in your save file, export a public save that is safe to share publicly instead. Be sure to NEVER share the private save file with anyone you do not trust!")) {
        let data3 = JSON.stringify(data2);
        let a = document.createElement('a');
        let file = new Blob([data3], { type: 'text/plain' });
        a.href = URL.createObjectURL(file);
        a.download = public ? 'data.json' : 'data-PRIVATE.json';
        a.click();
    }
}

function reset() {
    if (confirm("Are you sure you want to reset?")) {
        localStorage.removeItem("data");
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
            for (let i = 0; i < data.data.length; i++) {
                if (data.data[i].id == id) {
                    data.data.splice(i, 1);
                }
            }
            selected = null;
            const selectedCard = document.querySelector(".selected");
            if (selectedCard) selectedCard.classList.remove("selected");
            selectedCard.style.border = "solid 0.1em " + data.boxBorder;
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
                let file = new Blob([data2], { type: 'text/plain' });
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

document.getElementById('backPickerUrl').addEventListener('change', function () {
    document.body.style.backgroundColor = 'url(' + this.value + ')';
    data.bgColor = this.value;
    adjustColors();
});

function saveImageForBG() {
    let image = document.getElementById('backgroundImgPicker').files[0];
    if (image) {
        let url = URL.createObjectURL(image);
        let reader = new FileReader();
        reader.onload = function (e) {
            let base64 = e.target.result;
            document.body.style.backgroundImage = 'url(' + base64 + ')';
            data.bgColor = base64;
            document.getElementById('backgroundImgPicker').value = '';
        };
        reader.readAsDataURL(image);
        URL.revokeObjectURL(url);
    }
};

document.getElementById('containerHeight').addEventListener('change', function () {
    data.cardStyles.containerHeight = this.value;
    fix();
});

document.getElementById('containerWidth').addEventListener('change', function () {
    data.cardStyles.containerWidth = this.value;
    fix();
});

document.getElementById('boxSpacing').addEventListener('change', function () {
    document.getElementById('main').children = Array.from(document.getElementById('main').children).forEach(child => {
        Array.from(child.children).forEach(child2 => {
            child2.style.margin = this.value + 'vw';
        });
    });

    data.boxSpacing = this.value;
    adjustColors();
});

document.getElementById('textPicker').addEventListener('change', function () {
    document.getElementById('main').style.color = this.value;
    data.textColor = this.value;
});

document.getElementById('rankSize').addEventListener('change', function () {
    data.cardStyles.rankSize = this.value;
    fix();
});

document.getElementById('differenceSize').addEventListener('change', function () {
    data.differenceStyles.differenceSize = this.value;
    fix();
});

document.getElementById('cardWidth').addEventListener('change', function () {
    data.cardStyles.cardWidth = this.value;
    fix();
});

document.getElementById('cardHeight').addEventListener('change', function () {
    data.cardStyles.cardHeight = this.value;
    fix();
});

document.getElementById('imageSize').addEventListener('change', function () {
    data.cardStyles.imageSize = this.value;
    fix();
});

document.getElementById('nameSize').addEventListener('change', function () {
    data.cardStyles.nameSize = this.value;
    fix();
});

document.getElementById('nameWidth').addEventListener('change', function () {
    data.cardStyles.nameWidth = this.value;
    fix();
});

document.getElementById('countSize').addEventListener('change', function () {
    data.cardStyles.countSize = this.value;
    fix();
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

document.getElementById('animatedCardChanges').addEventListener('change', function () {
    if (confirm('This will refresh the page')) {
        if (this.checked) {
            data.animatedCards.enabled = true;
        } else {
            data.animatedCards.enabled = false;
        }
        saveData(true);
        location.reload();
    }
});

document.getElementById('allowNegative').addEventListener('change', function () {
    if (this.checked) {
        data.allowNegative = true;
    } else {
        data.allowNegative = false;
    }
});

document.getElementById('randomCountUpdateTime').addEventListener('change', function () {
    if (this.checked) {
        data.randomCountUpdateTime = true;
    } else {
        data.randomCountUpdateTime = false;
    }
});

document.getElementById('waterFallCountUpdateTime').addEventListener('change', function () {
    if (this.checked) {
        data.waterFallCountUpdateTime = true;
    } else {
        data.waterFallCountUpdateTime = false;
    }
});

function loadMyFont() {
    if (!document.getElementById('font-' + data.headerFont)) {
        const fontStuff = document.createElement('link');
        fontStuff.href = `https://fonts.googleapis.com/css?family=${encodeURIComponent(data.headerFont).replaceAll("%20", "+")}:100,200,300,400,500,600,700,800,900&display=swap`;
        fontStuff.className = 'font';
        fontStuff.rel = 'stylesheet';
        fontStuff.id = 'font-' + data.headerFont;
        document.head.appendChild(fontStuff);
    }

    if (!document.getElementById('font-' + data.mainFont)) {
        const fontStuff = document.createElement('link');
        fontStuff.href = `https://fonts.googleapis.com/css?family=${encodeURIComponent(data.mainFont).replaceAll("%20", "+")}:100,200,300,400,500,600,700,800,900&display=swap`;
        fontStuff.className = 'font';
        fontStuff.rel = 'stylesheet';
        fontStuff.id = 'font-' + data.mainFont;
        document.head.appendChild(fontStuff);
    }
}

document.getElementById('importFromGoogleFonts').addEventListener('change', function () {
    data.importFromGoogleFonts = this.checked;
    fix();
})

document.getElementById('intervalsPerUpdate').addEventListener('change', function () {
    data.fireIcons.intervalsPerUpdate = Math.max(1, Math.round(this.value));
})

document.getElementById('headerFont').addEventListener('input', function () {
    data.headerFont = this.value;
    fix();
})

document.getElementById('mainFont').addEventListener('input', function () {
    data.mainFont = this.value;
    fix();
})

document.getElementById('counterFontWeight').addEventListener('change', function () {
    data.counterFontWeight = this.value;
    fix();
})

document.getElementById('counterAlignment').addEventListener('change', function () {
    data.counterAlignment = this.value;
    fix();
})

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

document.getElementById('boxBorderRadius').addEventListener('change', function () {
    let num = this.value;
    data.boxBorderRadius = num;
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

document.getElementById('verticallyCenterRanks').addEventListener('change', function () {
    if (document.getElementById('verticallyCenterRanks').checked) {
        data.verticallyCenterRanks = true;
    } else {
        data.verticallyCenterRanks = false;
    }
    fix();
    setupMDMStyles()
});

document.getElementById('topDifferencePlacing').addEventListener('change', function () {
    data.differenceStyles.top = this.value;
    fix();
});

document.getElementById('leftDifferencePlacing').addEventListener('change', function () {
    data.differenceStyles.left = this.value;
    fix();
});

document.getElementById('differenceThreshold').addEventListener('change', function () {
    data.differenceThreshold = this.value;
    fix();
});

document.getElementById('enableImageShakes').addEventListener('change', function () {
    data.differenceStyles.shakingEnabled = this.checked;
    fix();
});

document.getElementById('differenceColor').addEventListener('change', function () {
    data.differenceStyles.color = this.value;
    fix();
});

document.getElementById('showDifferenceLines').addEventListener('change', function () {
    data.differenceStyles.lineEnabled = this.checked;
    fix();
});

document.getElementById('abbDifferences').addEventListener('change', function () {
    data.differenceStyles.abbDifferences = this.checked;
    fix();
});

document.getElementById('differenceLineColor').addEventListener('change', function () {
    data.differenceStyles.lineColor = this.value;
    fix();
});

document.getElementById('enableDifferenceImages').addEventListener('change', function () {
    data.differenceStyles.imageEnabled = this.checked;
    fix();
});

document.getElementById('leftDifferenceImagePlacing').addEventListener('change', function () {
    data.differenceStyles.imageLeft = this.value;
    fix();
});

document.getElementById('topDifferenceImagePlacing').addEventListener('change', function () {
    data.differenceStyles.imageTop = document.getElementById('topDifferenceImagePlacing').value;
    fix();
});

document.getElementById('differenceImageSize').addEventListener('change', function () {
    data.differenceStyles.imageSize = document.getElementById('differenceImageSize').value;
    fix();
});

document.getElementById('differenceImageUrl').addEventListener('change', function () {
    data.differenceStyles.differenceImage = document.getElementById('differenceImageUrl').value;
    document.querySelectorAll('.gapimg').forEach(item => {
        item.src = data.differenceStyles.differenceImage;
    });
});

function saveImageForDiffs() {
    let image = document.getElementById('differenceImageFile').files[0];
    if (image) {
        let url = URL.createObjectURL(image);
        let reader = new FileReader();
        reader.onload = function (e) {
            let base64 = e.target.result;
            data.differenceStyles.differenceImage = base64;
            document.getElementById('differenceImageFile').value = '';
            document.querySelectorAll('.gapimg').forEach(item => {
                item.src = base64;
            });
        };
        reader.readAsDataURL(image);
        URL.revokeObjectURL(url);
    }
};

document.getElementById('showDifferences').addEventListener('change', function () {
    if (document.getElementById('showDifferences').checked) {
        data.showDifferences = true;
    } else {
        data.showDifferences = false;
    }
    fix()
});

document.getElementById('showRankings').addEventListener('change', function () {
    data.showRankings = document.getElementById('showRankings').checked;
    fix()
    setupMDMStyles();
});

document.getElementById('showChart').addEventListener('change', function () {
    data.cardStyles.showChart = document.getElementById('showChart').checked;
    if (data.cardStyles.showChart) {
        // Initialize charts when enabled
        if (typeof Highcharts !== 'undefined') {
            setTimeout(initializeCharts, 200);
        }
    } else {
        // Destroy all charts when disabled
        Object.keys(charts).forEach(function (channelId) {
            if (charts[channelId]) {
                charts[channelId].destroy();
                delete charts[channelId];
            }
        });
    }
    fix()
});

document.getElementById('chartLineColor').addEventListener('change', function () {
    data.cardStyles.chartLineColor = this.value;
    // Update all existing charts with the new color
    if (typeof Highcharts !== 'undefined' && data.cardStyles.showChart) {
        Object.keys(charts).forEach(function (channelId) {
            if (charts[channelId] && charts[channelId].series && charts[channelId].series[0]) {
                try {
                    charts[channelId].series[0].update({
                        color: data.cardStyles.chartLineColor || data.textColor || '#000'
                    }, false);
                } catch (e) {
                    console.warn('Error updating chart color for channel ' + channelId + ':', e);
                }
            }
        });
    }
});

document.getElementById('rankingsWidth').addEventListener('change', function () {
    data.rankingsWidth = document.getElementById('rankingsWidth').value;
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
    setupMDMStyles();
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
    document.getElementById('main').style.height = data.cardStyles.containerHeight + "vh";
    document.getElementById('main').style.width = data.cardStyles.containerWidth + "vw";
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
    if (data.animatedCards.enabled == true) {
        document.getElementById('animatedCardChanges').checked = true;
    } else {
        document.getElementById('animatedCardChanges').checked = false;
    }
    if (data.randomCountUpdateTime == true) {
        document.getElementById('randomCountUpdateTime').checked = true;
    } else {
        document.getElementById('randomCountUpdateTime').checked = false;
    }
    if (data.waterFallCountUpdateTime == true) {
        document.getElementById('waterFallCountUpdateTime').checked = true;
    } else {
        document.getElementById('waterFallCountUpdateTime').checked = false;
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
        saveInterval = setInterval(saveData(false), 15000);
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
    if (data.cardStyles.showChart == true) {
        document.getElementById('showChart').checked = true;
        document.querySelectorAll('.chart').forEach(function (card) {
            card.style.display = "block";
        })
        // Initialize charts if Highcharts is available
        if (typeof Highcharts !== 'undefined') {
            setTimeout(initializeCharts, 200);
        }
    } else {
        document.getElementById('showChart').checked = false;
        document.querySelectorAll('.chart').forEach(function (card) {
            card.style.display = "none";
        })
        // Destroy all charts when disabled
        Object.keys(charts).forEach(function (channelId) {
            if (charts[channelId]) {
                charts[channelId].destroy();
                delete charts[channelId];
            }
        });
    }
    if (data.showBlankSlots) {
        document.getElementById('showBlankSlots').checked = true;
        document.getElementById('hideBlanks').innerText = '';
    } else {
        document.getElementById('showBlankSlots').checked = false;
        document.getElementById('hideBlanks').innerText = '#card_ * {display: none;}';
    }

    if (data.verticallyCenterRanks) {
        document.getElementById('verticallyCenterRanks').checked = true;
        document.getElementById("centerRanks").innerText = ".num { align-items: center; display: flex; };"
    } else {
        document.getElementById('verticallyCenterRanks').checked = false;
        document.getElementById("centerRanks").innerText = "";
    }

    if (data.showDifferences) {
        document.getElementById('showDifferences').checked = true;
        document.getElementById('hideDifferences').innerText = '';
    } else {
        document.getElementById('showDifferences').checked = false;
        document.getElementById('hideDifferences').innerText = '.subgap {display: none;}';
    }

    document.getElementById('leftDifferencePlacing').value = data.differenceStyles.left;
    document.getElementById('topDifferencePlacing').value = data.differenceStyles.top;
    document.getElementById('differenceThreshold').value = data.differenceThreshold;
    document.getElementById('differenceColor').value = data.differenceStyles.color;
    document.getElementById('showDifferenceLines').checked = data.differenceStyles.lineEnabled;
    document.getElementById('abbDifferences').checked = data.differenceStyles.abbDifferences;
    document.getElementById('differenceLineColor').value = data.differenceStyles.lineColor;

    const diffs = document.getElementsByClassName("subgap");
    for (const diff of diffs) {
        if (data.differenceStyles.abbDifferences) {
            diff.querySelector(".odometer").style.display = "none";
            diff.querySelector(".text").style.display = "block";
        } else {
            diff.querySelector(".odometer").style.display = "block";
            diff.querySelector(".text").style.display = "none";
        }
    }

    document.getElementById('enableDifferenceImages').checked = data.differenceStyles.imageEnabled;
    document.getElementById('leftDifferenceImagePlacing').value = data.differenceStyles.imageLeft;
    document.getElementById('topDifferenceImagePlacing').value = data.differenceStyles.imageTop;
    ;
    document.getElementById('differenceImageSize').value = data.differenceStyles.imageSize;
    document.getElementById('enableImageShakes').checked = data.differenceStyles.shakingEnabled;

    if (!data.differenceStyles.differenceImage.startsWith('data:image')) {
        document.getElementById('differenceImageUrl').value = data.differenceStyles.differenceImage;
    }

    document.getElementById('differenceStyling').innerText = `
        .subgap {
            top: ${data.differenceStyles.top}%;
            z-index: 100;
            position: absolute;
            float: none;
            left: ${data.differenceStyles.left}%;
            font-size: ${data.differenceStyles.differenceSize}vw;
            color: ${data.differenceStyles.color};
            visibility: hidden;
        }

        .gapimg {
            width: ${data.differenceStyles.imageSize}px;
            height: ${data.differenceStyles.imageSize}px;
            ${data.differenceStyles.imageEnabled ? "" : "display: none"};
            left: ${data.differenceStyles.imageLeft}%;
            top: ${data.differenceStyles.imageTop}%;
            visibility: hidden;
            ${data.differenceStyles.shakingEnabled ? "animation: shake 1s infinite;" : ""}
        }

        .difference_line {
            left: -${data.boxSpacing / 2}vw;
            background-color: ${data.differenceStyles.lineColor};
            ${data.differenceStyles.lineEnabled ? "" : "display: none"};
            width: calc(100% + ${data.boxSpacing}vw);
            visibility: hidden;
        }`;

    document.getElementById('cardStyles').innerText = `
            .name {
                font-size: ${data.cardStyles.nameSize}vw;
                max-width: ${data.cardStyles.nameWidth}vw;
            }
            .count {
                font-size: ${data.cardStyles.countSize}vw;
            }
            .image {
                height: ${data.cardStyles.imageSize}vw;
                width: ${data.cardStyles.imageSize}vw;
            }
            .card {
                height: ${data.cardStyles.cardHeight}vw;
                width: ${data.cardStyles.cardWidth}vw;
            }
        `

    if (data.prependZeros) {
        document.getElementById('prependZeros').checked = true;
        let index = 1;
        document.querySelectorAll('.num').forEach(function (card) {
            if (index < 10) {
                card.firstChild.innerText = formatRank(index);
            }
            index++;
        })

    } else {
        document.getElementById('prependZeros').checked = false;
        let index = 1;
        document.querySelectorAll('.num').forEach(function (card) {
            card.firstChild.innerText = index
            index++;
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

    document.querySelectorAll('.card').forEach(function (card) {
        card.style.backgroundColor = data.boxColor;
        if (card.className.split(' ').includes('selected') == false) {
            card.style.border = "solid 0.1em " + data.boxBorder;
        }
        if (["top100", "top150", "top200", "top100H", "top150H", "top200H"].includes(data.theme)) {
            card.style.borderRadius = (((parseFloat(data.boxBorderRadius) || 0) / 200) * 2.15) + "vw " + (((parseFloat(data.boxBorderRadius) || 0) / 200) * 2.15) + "vw";
        } else {
            card.style.borderRadius = (((parseFloat(data.boxBorderRadius) || 0) / 200) * 4.25) + "vw " + (((parseFloat(data.boxBorderRadius) || 0) / 200) * 4.25) + "vw";
        }
    });
    document.querySelectorAll('.image').forEach(function (card) {
        card.style.borderRadius = data.imageBorder + "%";
        card.style.borderColor = data.imageBorderColor;
    });
    document.getElementById('main').children = Array.from(document.getElementById('main').children).forEach(child => {
        if (data.theme.includes('H')) {
            child.style.margin = data.boxSpacing + 'vw';
        } else {
            Array.from(child.children).forEach(child2 => {
                child2.style.margin = data.boxSpacing + 'vw';
            });
        }
    });
    document.getElementById('rankSizeStyles').innerText = `
        .num_text {
        font-size: ${data.cardStyles.rankSize}px;
        }

        .num {
          width: ${data.rankingsWidth}px;
        }
        
        `;
    if (data.bgColor.startsWith('http')) {
        document.getElementById('backPickerUrl').value = (data.bgColor);
    } else if (!data.bgColor.startsWith('data')) {
        document.getElementById('backPicker').value = convert3letterhexto6letters(data.bgColor);
    }
    document.getElementById('boxSpacing').value = data.boxSpacing;
    document.getElementById('containerHeight').value = data.cardStyles.containerHeight;
    document.getElementById('containerWidth').value = data.cardStyles.containerWidth;
    document.getElementById('rankSize').value = data.cardStyles.rankSize;
    document.getElementById('differenceSize').value = data.differenceStyles.differenceSize;
    document.getElementById('cardWidth').value = data.cardStyles.cardWidth;
    document.getElementById('cardHeight').value = data.cardStyles.cardHeight;
    document.getElementById('nameSize').value = data.cardStyles.nameSize;
    document.getElementById('nameWidth').value = data.cardStyles.nameWidth;
    document.getElementById('countSize').value = data.cardStyles.countSize;
    document.getElementById('imageSize').value = data.cardStyles.imageSize;
    document.getElementById('textPicker').value = convert3letterhexto6letters(data.textColor);
    document.getElementById('boxPicker').value = convert3letterhexto6letters(data.boxColor);
    document.getElementById('borderPicker').value = convert3letterhexto6letters(data.boxBorder);
    document.getElementById('odometerUp').value = data.odometerUp;
    document.getElementById('odometerDown').value = data.odometerDown;
    document.getElementById('chartLineColor').value = convert3letterhexto6letters(data.cardStyles.chartLineColor || data.textColor || '#000000');
    document.getElementById('odometerSpeed').value = data.odometerSpeed;
    document.getElementById('animatedCardChangesDuration').value = data.animatedCards.duration;
    document.getElementById('imageBorder').value = data.imageBorder;
    document.getElementById('imageBorderColor').value = data.imageBorderColor;
    document.getElementById('rankingsWidth').value = data.rankingsWidth;

    document.getElementById('boxBGGain').value = data.boxBGGain;
    document.getElementById('boxBGLose').value = data.boxBGLose;
    document.getElementById('boxBGLength').value = data.boxBGLength;

    document.getElementById('headerFont').value = data.headerFont;
    document.getElementById('mainFont').value = data.mainFont;
    document.getElementById('importFromGoogleFonts').checked = data.importFromGoogleFonts;
    document.getElementById('intervalsPerUpdate').value = data.fireIcons.intervalsPerUpdate || 1;
    document.getElementById('gainAverageOf').value = data.gainAverageOf || 1;
    document.getElementById('counterFontWeight').value = data.counterFontWeight || "400";
    document.getElementById('counterAlignment').value = data.counterAlignment;

    const subCounters = document.getElementById('main').getElementsByClassName("count");
    for (const subCounter of subCounters) {
        subCounter.style.textAlign = data.counterAlignment;
    }

    document.getElementById('header').style.fontFamily = data.headerFont || "Arial";
    const footerEl = document.getElementById('footer');
    if (footerEl) footerEl.style.fontFamily = data.headerFont || "Arial";
    document.getElementById('main').style.fontFamily = data.mainFont || "Roboto";

    const counters = document.getElementById('main').getElementsByClassName('odometer');
    for (const counter of counters) {
        counter.style.fontWeight = data.counterFontWeight;
    }

    if (data.importFromGoogleFonts) {
        loadMyFont();
    } else {
        const fonts = document.getElementsByClassName('font');
        for (const font of fonts) {
            font.remove();
        }
    }

    document.getElementById('boxBorderRadius').value = data.boxBorderRadius;
    document.getElementById('fastestIcon').value = data.fastestIcon || '🔥';
    document.getElementById('slowestIcon').value = data.slowestIcon || '⌛️';
    if (data.updateInterval) {
        document.getElementById('updateint').value = (data.updateInterval / 1000).toString()
    }
    let odometerStyles = document.getElementById('odometerStyles')
    odometerStyles.innerText = '';
    odometerStyles.innerText += `
    .odometer.odometer-auto-theme.odometer-animating-up .odometer-ribbon-inner,
    .odometer.odometer-theme-default.odometer-animating-up .odometer-ribbon-inner {
        -webkit-transition: -webkit-transform ${data.odometerSpeed}s;
        -moz-transition: -moz-transform ${data.odometerSpeed}s;
        -ms-transition: -ms-transform ${data.odometerSpeed}s;
        -o-transition: -o-transform ${data.odometerSpeed}s;
        transition: transform ${data.odometerSpeed}s;
        animation: ${data.odometerSpeed}s linear up;
        animation-iteration-count: 1;
    }

    .odometer.odometer-auto-theme.odometer-animating-down.odometer-animating .odometer-ribbon-inner,
    .odometer.odometer-theme-default.odometer-animating-down.odometer-animating .odometer-ribbon-inner {
        -webkit-transition: -webkit-transform ${data.odometerSpeed}s;
        -moz-transition: -moz-transform ${data.odometerSpeed}s;
        -ms-transition: -ms-transform ${data.odometerSpeed}s;
        -o-transition: -o-transform ${data.odometerSpeed}s;
        transition: transform ${data.odometerSpeed}s;
        animation: ${data.odometerSpeed}s linear down;
        animation-iteration-count: 1;
    }

    .odometer.odometer-auto-theme.odometer-animating-up.no_color_transition .odometer-ribbon-inner,
    .odometer.odometer-theme-default.odometer-animating-up.no_color_transition .odometer-ribbon-inner,
    .odometer.odometer-auto-theme.odometer-animating-down.no_color_transition .odometer-ribbon-inner,
    .odometer.odometer-theme-default.odometer-animating-down.no_color_transition .odometer-ribbon-inner {
        animation: none;
    }

@keyframes up {
  0% {
    color: ${data.textColor};
  }
  25% {
  color: ${data.odometerUp};
  }
  75% {
  color: ${data.odometerUp};
  }
  100% {
    color: ${data.textColor};
  }
}

@keyframes down {
  0% {
    color: ${data.textColor};
  }
  25% {
    color: ${data.odometerDown};
  }
  75% {
    color: ${data.odometerDown};
  }
  100% {
    color: ${data.textColor};
  }
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
        saveData(false)
        window.location.href = window.location.href + "?code=" + code;
    }
}
let update2Hold;
if (connected == true) {
    update2()
    update2Hold = setInterval(update2, 2500);
    document.getElementById('isconnected').innerText = "Yes";
    document.getElementById('toConnect').innerText = "Disconnect";
}

function update2() {
    fetch(apiurl + code + '')
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
                                .then(response => response.text())
                                .then(json2 => {
                                    let id = json.users[i].id;
                                    let min = json.users[i].min;
                                    let max = json.users[i].max; if (min > data.gain_max) {
                                        min = data.gain_max;
                                    } else if (min < data.gain_min) {
                                        min = data.gain_min;
                                    }
                                    if (max > data.gain_max) {
                                        max = data.gain_max;
                                    } else if (max < data.gain_min) {
                                        max = data.gain_min;
                                    }

                                    if (json2 == "null") {
                                        data.data.push({
                                            "name": 'User ' + (data.data.length + 1),
                                            "count": 0,
                                            "image": BLANK_IMAGE_URL,
                                            "min_gain": min,
                                            "max_gain": max,
                                            "id": id,
                                            "lastCount": 0
                                        });
                                        fix();
                                    } else {
                                        json2 = JSON.parse(json2);
                                        let name = json2.user[0].count;
                                        let image = json2.user[1].count;
                                        data.data.push({
                                            "name": name,
                                            "count": 0,
                                            "image": image,
                                            "min_gain": min,
                                            "max_gain": max,
                                            "id": id,
                                            "lastCount": 0
                                        });
                                        fix();
                                    }
                                })
                        }
                    }
                }
                if (json.events.length > 0) {
                    for (let i = 0; i < json.events.length; i++) {
                        if (json.events[i].values) {
                            if (json.events[i].rates == true) {
                                let id = json.events[i].id;
                                let min = parseFloat(json.events[i].values[0])
                                let max = parseFloat(json.events[i].values[1])
                                for (let i = 0; i < data.data.length; i++) {
                                    if (data.data[i].id == id) {
                                        let num = Math.floor(Math.random() * (max - min + 1)) + min;
                                        data.data[i].min_gain += num;
                                        data.data[i].max_gain += num;
                                    }
                                }
                            } else {
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
                            fetch(apiurl + code + '/' + json.system[i].id + '/user?subs=' + set + '&name=' + username + '')
                        }
                        if (json.system[i].type == "gains") {
                            let username = "";
                            let gains = [];
                            for (let a = 0; a < data.data.length; a++) {
                                if (data.data[a].id == json.system[i].id) {
                                    username = data.data[a].name;
                                    gains[0] = data.data[a].min_gain;
                                    gains[1] = data.data[a].max_gain;
                                }
                            }
                            fetch(apiurl + code + '/' + json.system[i].id + '/gains?gains=' + gains[0] + ',' + gains[1] + '&name=' + username + '')
                        }
                        if (json.system[i].type == "rank") {
                            let username = "";
                            let rank = 0;
                            for (let a = 0; a < data.data.length; a++) {
                                if (data.data[a].id == json.system[i].id) {
                                    username = data.data[a].name;
                                    rank = a + 1;
                                }
                            }
                            fetch(apiurl + code + '/' + json.system[i].id + '/rank?rank=' + rank + '&name=' + username + '')
                        }
                    }
                }
            } else {
                alert("You are no longer connected.");
                clearInterval(update2Hold);
                document.getElementById('isconnected').innerText = "No";
                fetch(apiurl + 'create?code=' + code + '', {
                    method: 'POST'
                })
                    .then(response => response.text())
                    .then(json => {
                        if (json == "done") {
                            saveData(false)
                            location.reload();
                        }
                    })
            }
        });
}

document.getElementById('autosave').addEventListener('change', function () {
    if (document.getElementById('autosave').checked == true) {
        saveInterval = setInterval(saveData(false), 15000);
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
    let type = prompt("1 or 2 - (1) The channel should gain instant subs OR (2) the channel should have their rate changed.")
    if (type == "1") {
        let min = prompt("What is the minimum amount of subscribers the channel can gain?")
        if (!min || isNaN(min)) {
            alert("Please enter a number.")
            return;
        }
        let max = prompt("What is the maximum amount of subscribers the channel can gain?")
        if (!max || isNaN(max)) {
            alert("Please enter a number.")
            return;
        }
        let returnText = prompt("What should the commands response be? (use $(user) for the name and $(query) for any additional text)")
        if (returnText) {
            returnText = '&returnText=' + returnText;
        }

        alert('$(urlfetch ' + apiurl + '' + code + '/$(userid)?values=' + min + ',' + max + returnText + ')')
    } else if (type == "2") {
        let min = prompt("What is the minimum amount the channel's rate should gain? (we recommend less than 1 (0.1, 0.2, etc))");
        if (!min || isNaN(min)) {
            alert("Please enter a number.");
            return;
        }
        let max = prompt("What is the maximum amount the channel's rate should gain? (we recommend less than 1 (0.1, 0.2, etc))");
        if (!max || isNaN(max)) {
            alert("Please enter a number.");
            return;
        }
        let returnText = prompt("What should the commands response be? (use $(user) for the name and $(query) for any additional text)")
        if (returnText) {
            returnText = '&returnText=' + returnText;
        }

        alert('$(urlfetch ' + apiurl + '' + code + '/$(userid)?values=' + min + ',' + max + returnText + ')&rate=true');
    } else {
        alert("Please enter type (1 or 2)");
        return;
    }
}

document.getElementById('connect').innerHTML = '$(urlfetch ' + apiurl + '' + code + '/$(userid)/$(query)?returnText=Added $(user)!)';
document.getElementById('connect2').innerHTML = '$(urlfetch ' + apiurl + '' + code + '/$(userid)?values=10,20&returnText=$(user) uploaded $(query)!)';
document.getElementById('connect3').innerHTML = '$(urlfetch ' + apiurl + '' + code + '/$(userid)/$(query)?value=edit&returnText=Edited $(user)!)';
document.getElementById('connect4').innerHTML = '$(urlfetch ' + apiurl + '' + code + '/$(userid)/user)';
document.getElementById('connect5').innerHTML = '$(urlfetch ' + apiurl + '' + code + '/$(userid)/gains)';
document.getElementById('connect6').innerHTML = '$(urlfetch ' + apiurl + '' + code + '/$(userid)/rank)';

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
    // Store previous theme before changing
    const previousTheme = data.theme;
    data.theme = document.getElementById('theme').value;
    themeChanger(previousTheme);
})

function themeChanger(previousTheme) {
    if (confirm('Are you sure you want to change the theme?') == true) {
        clearInterval(updateInterval);
        clearInterval(auditTimeout);
        document.getElementById('main').innerHTML = "";
        initLoad('redo', previousTheme);
    } else {
        // Revert theme selection if user cancels
        data.theme = previousTheme;
        document.getElementById('theme').value = previousTheme;
    }
}

document.getElementById('fastest').addEventListener('click', function () {
    if (document.getElementById('fastest').checked == true) {
        data.fastest = true;
    } else {
        data.fastest = false;
    }
})

document.getElementById('fastestIcon').addEventListener('change', function () {
    let icon = document.getElementById('fastestIcon').value;
    data.fastestIcon = icon;
})

document.getElementById('slowestIcon').addEventListener('change', function () {
    let icon = document.getElementById('slowestIcon').value;
    data.slowestIcon = icon;
})

document.getElementById('slowest').addEventListener('click', function () {
    if (document.getElementById('slowest').checked == true) {
        data.slowest = true;
    } else {
        data.slowest = false;
    }
})

if (data.offlineGains == true) {
    document.getElementById('offline').checked = true;
} else {
    document.getElementById('offline').checked = false;
}

document.getElementById('offline').addEventListener('click', function () {
    if (document.getElementById('offline').checked == true) {
        data.offlineGains = true;
    } else {
        data.offlineGains = false;
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

document.getElementById('animatedCardChangesDuration').addEventListener('change', function () {
    if (confirm('This will refresh the page.')) {
        data.animatedCards.duration = document.getElementById('animatedCardChangesDuration').value;
        saveData(true);
        location.reload();
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

function createDummyChannels(count, min, max) {
    for (let i = 0; i < count; i++) {
        data.data.push({
            name: "Channel " + i,
            count: Math.round(randomGaussian(1000, 100)),
            min_gain: min,
            max_gain: max,
            image: '../default.png',
            id: uuidGen()
        })
    }
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

    let url = data.apiUpdates.url;
    let groups = []
    let channels = ''

    // Check for customAPIList filter
    let customList = data.apiUpdates.customAPIList || [];
    let allChannels = data.data.map(item => item.id);

    // Filter channels if customAPIList is not empty
    let targetChannels = (customList.length > 0)
        ? allChannels.filter(id => customList.includes(id))
        : allChannels;

    channels = targetChannels.join(',');

    // Handle "one" fetch mode
    if (data.apiUpdates.maxChannelsPerFetch == 'one') {
        groups = targetChannels.map(item => [item]);
    } else {
        groups = [targetChannels];
    }

    // Build and fetch URLs
    for (let i = 0; i < groups.length; i++) {
        let newUrl = url.includes('{{channels}}')
            ? url.replace('{{channels}}', groups[i])
            : url + groups[i];
        fetchNext(newUrl);
    }

    function fetchNext(url) {
        if (data.apiUpdates.method == 'GET') {
            if (Object.keys(data.apiUpdates.headers).filter(x => x).length) {
                fetch(url, {
                    method: data.apiUpdates.method,
                    headers: data.apiUpdates.headers,
                }).then(response => response.json())
                    .then(json => { doStuff(json) });
            } else {
                fetch(url, {
                    method: data.apiUpdates.method
                }).then(response => response.json())
                    .then(json => { doStuff(json) });
            }
        } else {
            fetch(url, {
                method: data.apiUpdates.method,
                headers: data.apiUpdates.headers,
                body: JSON.stringify(data.apiUpdates.body)
            }).then(response => response.json())
                .then(json => { doStuff(json) });
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

        for (let i = 0; i < channels.length; i++) {
            let nameUpdate, countUpdate, imageUpdate, idUpdate;

            if (data.apiUpdates.response.name.enabled === true) {
                let propertyNames = data.apiUpdates.response.name.path.split('.').map(prop => {
                    if (prop.includes('[')) {
                        const split = prop.split('[');
                        const index = parseInt(split[1].split(']')[0]);
                        return [split[0], index];
                    }
                    return prop;
                }).flat();

                let result = channels[i];
                for (const propName of propertyNames) {
                    console.log(propName)
                    result = result[propName];
                }
                nameUpdate = result;

            }

            if (data.apiUpdates.response.count.enabled === true) {
                let propertyNames = data.apiUpdates.response.count.path.split('.').map(prop => {
                    if (prop.includes('[')) {
                        const split = prop.split('[');
                        const index = parseInt(split[1].split(']')[0]);
                        return [split[0], index];
                    }
                    return prop;
                }).flat();
                let result = channels[i];
                for (const propName of propertyNames) result = result[propName];
                countUpdate = result;
            }

            if (data.apiUpdates.response.image.enabled === true) {
                let propertyNames = data.apiUpdates.response.image.path.split('.').map(prop => {
                    if (prop.includes('[')) {
                        const split = prop.split('[');
                        const index = parseInt(split[1].split(']')[0]);
                        return [split[0], index];
                    }
                    return prop;
                }).flat();
                let result = channels[i];
                for (const propName of propertyNames) result = result[propName];
                imageUpdate = result;
            }

            let propertyNames = data.apiUpdates.response.id.path.split('.').map(prop => {
                if (prop.includes('[')) {
                    const split = prop.split('[');
                    const index = parseInt(split[1].split(']')[0]);
                    return [split[0], index];
                }
                return prop;
            }).flat();
            let result = channels[i];
            for (const propName of propertyNames) result = result[propName];
            idUpdate = result;

            for (let r = 0; r < data.data.length; r++) {
                if (data.apiUpdates.response.id.IDIncludes === true) {
                    if (idUpdate.includes(data.data[r].id)) {
                        if (nameUpdate !== undefined) data.data[r].name = nameUpdate;
                        if (imageUpdate !== undefined) data.data[r].image = imageUpdate;
                        if (countUpdate !== undefined) {
                            if (data.apiUpdates.forceUpdates || abb(countUpdate) !== abb(data.data[r].count)) {
                                data.data[r].count = countUpdate;
                            }
                        }
                    }
                } else {
                    if (data.data[r].id === idUpdate) {
                        if (nameUpdate !== undefined) data.data[r].name = nameUpdate;
                        if (imageUpdate !== undefined) data.data[r].image = imageUpdate;
                        if (countUpdate !== undefined) {
                            if (data.apiUpdates.forceUpdates || abb(countUpdate) !== abb(data.data[r].count)) {
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
    data.apiUpdates.maxChannelsPerFetch = (document.getElementById('apiType').value == 'none') ? 'one' : document.getElementById('apiType').value;
    data.apiUpdate.customAPIList = document.getElementById('customAPIList').value.split(',');
    data.apiUpdates.method = document.getElementById('apiMethod').value;
    data.apiUpdates.forceUpdates = document.getElementById('forceUpdates').checked;
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
    data.apiUpdates.interval = parseFloat(document.getElementById('apiUpdateInt').value) * 1000;
    data.apiUpdates.enabled = document.getElementById('enableApiUpdate').innerText == 'Disable API Updates' ? true : false;
    alert('API Update Settings Saved')
}

function loadAPIUpdates() {
    document.getElementById('apiLink').value = data.apiUpdates.url
    document.getElementById('apiType').value = data.apiUpdates.maxChannelsPerFetch
    document.getElementById('customAPIList').value = data.apiUpdates.customAPIList.join(',')
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
    let id = target.id?.split('_').slice(1).join('_')
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
            try {
                document.getElementById('card_' + selected + '').classList.remove('selected');
                document.getElementById('card_' + selected + '').style.border = "solid 0.1em " + data.boxBorder + "";
            } catch { }
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
                document.getElementById('edit_bg_color').value = "";
                document.getElementById('edit_count').value = "";
                document.getElementById('edit_image1').value = "";
            }
        } else {
            selected = id;
            document.getElementById('quickSelect').value = selected || 'select';
            if (document.getElementById('card_' + selected + '')) {
                document.getElementById('card_' + selected + '').classList.add('selected');
                document.getElementById('card_' + selected + '').style.border = "";
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
                        document.getElementById('edit_bg_color').value = data.data[q].bg ? data.data[q].bg : '';
                        document.getElementById('edit_count').value = data.data[q].count;
                        document.getElementById('edit_image1').value = data.data[q].image;
                        document.getElementById('edit_channel_id').innerText = 'ID: ' + data.data[q].id;
                    }
                }
            }
            refresh();
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
        document.getElementById('edit_bg_color').value = "";
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
                document.getElementById('edit_bg_color').value = data.data[q].bg ? data.data[q].bg : '';
                document.getElementById('edit_count').value = data.data[q].count;
                document.getElementById('edit_image1').value = data.data[q].image;
                document.getElementById('edit_channel_id').innerText = 'ID: ' + data.data[q].id;
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
            'customAPIList': [],
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
                    'path': 'user[2].count'
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
            'customAPIList': [],
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
                    'path': 'user[2].count'
                }
            }
        }
    }
    loadAPIUpdates();
})

const addFireIcon = () => {
    if (document.getElementById('fireIconCreate')) {
        document.getElementById('fireIconCreate').remove();
    } else {
        let div = document.createElement('div');
        div.id = 'fireIconCreate';
        div.style.color = '#FFF';
        div.innerHTML = `
            <label>Fire Icon Name: </label><input type="text" id="fireIcon" placeholder="Fire Icon 1"><br>
            <label>Fire Icon Threshold: </label><input type="number" step="any" id="fireIconThreshold" placeholder="1000"><br>
            <label>Fire Icon Threshold Method: </label><select id="fireIconMethod" name="fireIconMethod">
                <option value=">=">Greater Than (>=)</option>
                <option value="==">Equal To (==)</option>
                <option value="<=">Less Than (<=)</option>
                <option value="!=">Not Equal To (!=)</option>
            </select><br>
            <label>Fire Icon:</label><input type="text" id="fireIconUrl" placeholder="https://example.com/image.png"><label> or </label><input type="file" id="fireIconFile"><br>
            <label>Rank Color: </label><input type="color" id="fireIconRankColor"><br>
            <label>Rank Margin Top (px):</label><input type="number" step="any" id="fireIconRankMargin" placeholder="Default"><br>
            <label>Rank Margin Left (px):</label><input type="number" step="any" id="fireIconRankMarginLeft" placeholder="Default"><br>
            <button onclick="saveFireIcon()">Add</button>
        `
        document.getElementById('fireIconsCreate').appendChild(div);
    }
}

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

const saveFireIcon = async () => {
    let file = document.getElementById('fireIconFile').files[0];
    if (file) {
        file = await getBase64(file);
    } else {
        file = document.getElementById('fireIconUrl').value;
    }
    if (!file || !document.getElementById('fireIcon').value || !document.getElementById('fireIconThreshold').value || !document.getElementById('fireIconMethod').value || !document.getElementById('fireIconRankColor').value) {
        alert('Please fill out all fields.');
        return;
    }
    if (!data.fireIcons) {
        data.fireIcons = {
            'enabled': false,
            'type': 'gain',
            'firePosition': 'above',
            'fireBorderColor': '#000',
            'fireBorderWidth': 0,
            'intervalsPerUpdate': 1,
            'averageOf': 1,
            'created': []
        };
    }
    // Make sure the name isn't already used
    let used = data.fireIcons.created.some(icon => icon.name === document.getElementById('fireIcon').value);

    if (used) {
        alert('Fire emojis must have unique names!');
        return;
    }

    data.fireIcons.created.push({
        name: document.getElementById('fireIcon').value,
        threshold: parseFloat(document.getElementById('fireIconThreshold').value),
        icon: file,
        color: document.getElementById('fireIconRankColor').value,
        method: document.getElementById('fireIconMethod').value,
        margin: document.getElementById('fireIconRankMargin').value,
        marginLeft: document.getElementById('fireIconRankMarginLeft').value,
    });

    document.getElementById('fireIconCreate').remove();
    loadFireIcons();
};

function reOrderFire(type, index) {
    if (type === 'up' && index > 0) {
        // Swap with the previous item
        [data.fireIcons.created[index], data.fireIcons.created[index - 1]] =
            [data.fireIcons.created[index - 1], data.fireIcons.created[index]];
    } else if (type === 'down' && index < data.fireIcons.created.length - 1) {
        // Swap with the next item
        [data.fireIcons.created[index], data.fireIcons.created[index + 1]] =
            [data.fireIcons.created[index + 1], data.fireIcons.created[index]];
    } else if (type === 'top' && index > 0) {
        // Move to the top
        const item = data.fireIcons.created.splice(index, 1)[0];
        data.fireIcons.created.unshift(item);
    } else if (type === 'bottom' && index < data.fireIcons.created.length - 1) {
        // Move to the bottom
        const item = data.fireIcons.created.splice(index, 1)[0];
        data.fireIcons.created.push(item);
    }
    loadFireIcons();
}

const loadFireIcons = () => {
    let div = document.getElementById('fireIcons');
    div.innerHTML = '';
    for (let i = 0; i < data.fireIcons.created.length; i++) {
        let fireIcon = data.fireIcons.created[i];
        let icon = fireIcon.icon;
        if (icon) {
            icon = `<img src="${escapeHTML(icon)}" style="height: 1.5em; width: 1.5em;">`
        }
        let html = `
            <div style="display: flex; color: #FFF; padding: 0.5em; margin: 0.5em 0; border-radius: 0.2em;">
                <div style="align-items: center;">
                    <div style="color: #FFF; padding: 0.2em; border-radius: 0.2em;">${icon}</div><br>
                    <label>Name</label>
                    <input style="width: 70%;" placeholder="Name" value="${escapeHTML(fireIcon.name)}" id="new_fire_name_${i}"><br>
                    <label>Condition</label>
                    <select id="new_fire_method_${i}" class="medium_input">
                        <option ${fireIcon.method == '>=' ? 'selected' : ''} value=">=">Count >=</option>
                        <option ${fireIcon.method == '==' ? 'selected' : ''} value="==">Count ==</option>
                        <option ${fireIcon.method == '<=' ? 'selected' : ''} value="<=">Count <=</option>
                        <option ${fireIcon.method == '!=' ? 'selected' : ''} value="!=">Count !=</option>
                    </select>
                    <input type="number" step="any" id="new_fire_threshold_${i}" class="small_input" value="${escapeHTML(fireIcon.threshold)}"><br>
                    <label>Rank Color</label>
                    <input type="color" id="new_fire_color_${i}" class="medium_input" value="${escapeHTML(fireIcon.color)}"><br>
                    <label>Rank Margin Top (px)</label>
                    <input type="number" id="new_fire_margin_${i}" class="small_input" placeholder="Default" value="${escapeHTML(fireIcon.margin)}"><br>
                    <label>Rank Margin Left (px)</label>
                    <input type="number" id="new_fire_marginLeft_${i}" class="small_input" placeholder="Default" value="${escapeHTML(fireIcon.marginLeft)}">
                </div><br>
                <div>
                    <div><button onclick="saveFireEdits(${i})">Save</button></div>
                    <div><button onclick="deleteFireIcon(${i})">Delete</button></div>
                    <div><button onclick="reOrderFire('up',${i})">Up</button></div>
                    <div><button onclick="reOrderFire('down',${i})">Down</button></div>
                    <div><button onclick="reOrderFire('top',${i})">Top</button></div>
                    <div><button onclick="reOrderFire('bottom',${i})">Bottom</button></div>
                </div>
            </div>`
        div.innerHTML += html;
    }
    if (data.fireIcons.created.length == 0) {
        div.innerHTML = 'No fire icons created.'
    }
    document.getElementById('fireEnabled').checked = data.fireIcons.enabled || false;
    document.getElementById('fireType').value = data.fireIcons.type || 'gain';
    document.getElementById('firePosition').value = data.fireIcons.firePosition || 'above';
    document.getElementById('fireBorderColor').value = data.fireIcons.fireBorderColor || '#FFF';
    document.getElementById('fireBorderWidth').value = data.fireIcons.fireBorderWidth || 0;
    adjustColors();
}
loadFireIcons();

const deleteFireIcon = (index) => {
    data.fireIcons.created.splice(index, 1);
    loadFireIcons();
}

const saveFireEdits = (index) => {
    let used = data.fireIcons.created.some(icon => icon.name === document.getElementById('new_fire_name_' + index).value);

    if (used) {
        if (document.getElementById('new_fire_name_' + index).value != data.fireIcons.created[index].name) {
            alert('Fire emojis must have unique names!');
            return;
        }
    }

    data.fireIcons.created[index] = {
        name: document.getElementById('new_fire_name_' + index).value,
        threshold: parseFloat(document.getElementById('new_fire_threshold_' + index).value),
        icon: data.fireIcons.created[index].icon,
        method: document.getElementById('new_fire_method_' + index).value,
        color: document.getElementById('new_fire_color_' + index).value,
        margin: document.getElementById('new_fire_margin_' + index).value,
        marginLeft: document.getElementById('new_fire_marginLeft_' + index).value
    };
};

document.getElementById('fireEnabled').addEventListener('click', function () {
    data.fireIcons.enabled = document.getElementById('fireEnabled').checked;
});

document.getElementById('fireType').addEventListener('change', function () {
    data.fireIcons.type = document.getElementById('fireType').value;
});

document.getElementById('firePosition').addEventListener('change', function () {
    data.fireIcons.firePosition = document.getElementById('firePosition').value;
    setupMDMStyles();
});

document.getElementById('fireBorderColor').addEventListener('change', function () {
    data.fireIcons.fireBorderColor = document.getElementById('fireBorderColor').value;
});

document.getElementById('fireBorderWidth').addEventListener('change', function () {
    data.fireIcons.fireBorderWidth = document.getElementById('fireBorderWidth').value;
});

document.getElementById('boxBGGain').addEventListener('change', function () {
    data.boxBGGain = document.getElementById('boxBGGain').value;
});

document.getElementById('boxBGLose').addEventListener('change', function () {
    data.boxBGLose = document.getElementById('boxBGLose').value;
});

document.getElementById('boxBGLength').addEventListener('change', function () {
    data.boxBGLength = document.getElementById('boxBGLength').value;
});


document.getElementById('disableBoxBorderColor').addEventListener('click', function () {
    data.boxBorder = 'transparent';
    fix();
});

document.getElementById('disableImageBorderColor').addEventListener('click', function () {
    data.imageBorderColor = 'transparent';
    fix();
});

let headerIntervals = [];
function loadHeader() {
    headerIntervals.forEach(interval => {
        clearInterval(interval);
    });
    headerIntervals = [];
    const headerEl = document.getElementById('header');
    const footerEl = document.getElementById('footer');
    headerEl.innerHTML = '';
    if (footerEl) footerEl.innerHTML = '';

    // Ensure headerSettings exists and has required properties
    if (!data.headerSettings) {
        data.headerSettings = {
            totalSections: 0,
            headerHeight: 0,
            boxWidth: '',
            sectionGap: 10,
            footerHeight: 0,
            footerGap: 10,
            items: []
        };
    }
    if (!data.headerSettings.items) {
        data.headerSettings.items = [];
    }

    // Filter out items with undefined or "undefined" names
    data.headerSettings.items = data.headerSettings.items.filter(item =>
        item && item.name && item.name !== 'undefined' && item.name !== undefined && item.name.trim() !== ''
    );

    headerEl.style.height = (data.headerSettings.headerHeight || 0) + 'px';
    if (data.headerSettings.boxWidth && data.headerSettings.boxWidth.trim() !== '') {
        headerEl.style.gridTemplateColumns = data.headerSettings.boxWidth.split(',').map(x => x.trim() + 'fr').join(' ');
    }
    headerEl.style.gap = (data.headerSettings.sectionGap || 10) + "px";

    if (footerEl) {
        footerEl.style.height = (data.headerSettings.footerHeight ?? 0) + 'px';
        if (data.headerSettings.boxWidth && data.headerSettings.boxWidth.trim() !== '') {
            footerEl.style.gridTemplateColumns = data.headerSettings.boxWidth.split(',').map(x => x.trim() + 'fr').join(' ');
        }
        footerEl.style.gap = (data.headerSettings.footerGap ?? 10) + "px";
    }

    for (let i = 0; i < data.headerSettings.items.length; i++) {
        const item = data.headerSettings.items[i];
        const placement = item.placement || 'header';
        const container = (placement === 'footer' && footerEl) ? footerEl : headerEl;
        // Skip items without valid names
        if (!item || !item.name || item.name === 'undefined' || item.name === undefined) {
            continue;
        }
        const div = document.createElement('div');
        div.classList.add('header_child')
        div.id = 'header_' + item.name;
        if (item.type == 'text') {
            let displayText = replaceHeaderVariables(item.attributes.text || '');
            div.style.color = item.attributes.color;
            div.style.fontSize = item.attributes.size + "px";
            div.style.fontWeight = item.attributes.fontWeight || "400";

            // Function to update the displayed text
            const updateDisplayText = () => {
                displayText = replaceHeaderVariables(item.attributes.text || '');
                if (item.attributes.scrollTime > 0 && parseFloat(item.attributes.scrollTime) > 0) {
                    const scrollDirection = item.attributes.scrollDirection || 'left';
                    const directionClass = scrollDirection === 'right' ? 'scroll-right' : 'scroll-left';
                    // Calculate animation duration: scrollTime is in seconds, convert to milliseconds
                    const animationDuration = parseFloat(item.attributes.scrollTime) * 1000;
                    // Duplicate content for seamless scrolling - duplicate multiple times for smooth loop
                    const separator = ' • ';
                    const duplicatedText = `${displayText}${separator}${displayText}${separator}`;
                    div.innerHTML = `<div class="header-scrolling-text ${directionClass}"><span class="scroll-content" style="animation-duration: ${animationDuration}ms; animation-name: ${directionClass === 'scroll-left' ? 'scroll-left' : 'scroll-right'}; animation-timing-function: linear; animation-iteration-count: infinite;">${duplicatedText}${duplicatedText}</span></div>`;
                } else {
                    div.innerHTML = `<p class="header-text">${displayText}</p>`;
                }
            };

            // Initial display
            updateDisplayText();

            // Update text with variables periodically if variables are used
            if (item.attributes.text && (item.attributes.text.includes('$name') || item.attributes.text.includes('$hourly') || item.attributes.text.includes('$count') || item.attributes.text.includes('$rank') || item.attributes.text.includes('$repeat'))) {
                const updateInterval = (item.attributes.updateInterval || data.updateInterval || 2) * 1000;
                headerIntervals.push(setInterval(updateDisplayText, updateInterval));
            }

            if (item.attributes.valueFrom && item.attributes.valueFrom != 'none') {
                if (item.attributes.updateInterval != 0) {
                    headerIntervals.push(setInterval(function () {
                        let string = "";
                        let array = [];
                        let sourceData = [...data.data];
                        if (item.attributes.idList && item.attributes.idList !== '') {
                            let idList = item.attributes.idList.split(',');
                            for (let i = 0; i < idList.length; i++) {
                                array.push(sourceData.find(x => x.id == idList[i].trim()));
                            }
                        }
                        if (item.attributes.valueFrom == 'gains') {
                            array = sourceData.sort((a, b) => getGain(a.id) - getGain(b.id));
                        } else if (item.attributes.valueFrom == 'counts') {
                            array = sourceData.sort((a, b) => (a.count) - (b.count));
                        }
                        if (item.attributes.sortOrder == 'asc') {
                            array = array.reverse();
                        }
                        array = array.slice(0, item.attributes.length);
                        if (item.attributes.valueFrom == 'counts') {
                            string = array.map(x => {
                                return `${x.name}: ${Math.floor(x.count).toLocaleString('en-US')}`
                            });
                        } else if (item.attributes.valueFrom == 'gains') {
                            string = array.map(x => {
                                return `${x.name}: ${Math.floor(getGain(x.id)).toLocaleString('en-US')}`
                            });
                        } else {
                            for (let i = 0; i < array.length; i += 2) {
                                let endComma = ', '
                                if (!array[i + 1] || !array[i + 2]) {
                                    endComma = '';
                                }
                                string += `${array[i].name} vs ${array[i + 1].name}: ${Math.floor(array[i].count - array[i + 1].count).toLocaleString('en-US')}${endComma}`
                            }
                        }
                        if (item.attributes.scrollTime != '0' && item.attributes.scrollTime > 0) {
                            const scrollText = string.join(', ');
                            const scrollDirection = item.attributes.scrollDirection || 'left';
                            const directionClass = scrollDirection === 'right' ? 'scroll-right' : 'scroll-left';
                            const animationDuration = item.attributes.scrollTime * 1000;
                            // Duplicate content for seamless scrolling
                            const duplicatedText = `${scrollText} • ${scrollText} • `;
                            div.innerHTML = `<div class="header-scrolling-text ${directionClass}"><span class="scroll-content" style="animation-duration: ${animationDuration}ms;">${duplicatedText}${duplicatedText}</span></div>`;
                        } else {
                            div.innerHTML = `<p class="header-text">${string.join(', ')}</p>`;
                        }
                    }, item.attributes.updateInterval * 1000));
                }
            }
        }
        if (item.type == 'battle') {
            div.innerHTML = `<div class="battle-container" style="background-color: ${item.attributes.bgColor}; height: ${item.attributes.boxHeight}px;">
                <div class="battle_container">
                    <img style="float: left; border-radius: ${item.attributes.roundAvatars ? 50 : data.imageBorder}%; height: ${item.attributes.imageSize}mm; width: ${item.attributes.imageSize}mm;" src="../default.png" id="battle_image1_${item.name}"></img>
                    <div class="battle_info">
                        <p id="battle_name1_${item.name}" class="name" style="font-size: ${item.attributes.fontSize}px;">Loading...</p>
                        <p class="odometer count ${item.attributes.odometerColors ? "" : "no_color_transition"}" id="battle_count1_${item.name}" style="font-size: ${item.attributes.fontSize}px;">0</p>
                    </div>
                </div>
                <div>
                    <p style="font-size: ${item.attributes.fontSize}px; ${item.attributes.battleAlign ? "text-align: center;" : ""}">Difference:</p>
                    <p class="odometer battle_difference count no_color_transition" id="battle_difference_${item.name}" style="font-size: ${item.attributes.fontSize}px; ${item.attributes.battleAlign ? "text-align: center;" : ""}">0</p>
                </div>
                <div class="reverse battle_container">
                <div class="battle_info">
                        <p id="battle_name2_${item.name}" class="name" style="font-size: ${item.attributes.fontSize}px;">Loading...</p>
                        <p class="odometer count ${item.attributes.odometerColors ? "" : "no_color_transition"}" id="battle_count2_${item.name}" style="font-size: ${item.attributes.fontSize}px; ${item.attributes.battleAlign ? "text-align: right;" : ""}">0</p>
                    </div>
                    <img style="float: right; border-radius: ${item.attributes.roundAvatars ? 50 : data.imageBorder}%; height: ${item.attributes.imageSize}mm; width: ${item.attributes.imageSize}mm;" src="../default.png" id="battle_image2_${item.name}"></img>
                </div>
                </div>`;
            div.style.fontWeight = item.attributes.fontWeight || "400";
            div.style.color = item.attributes.color;
            headerIntervals.push(setInterval(function () {
                let user1 = null;
                let user2 = null;
                if (item.attributes.type == 'custom') {
                    user1 = data.data.find(u => u.id == item.attributes.id1);
                    user2 = data.data.find(u => u.id == item.attributes.id2);
                } else {
                    let users = findClosestBattle();
                    user1 = users?.channels[0];
                    user2 = users?.channels[1];
                }

                let count1 = user1 ? getDisplayedCount(user1.count) : 0;
                let count2 = user2 ? getDisplayedCount(user2.count) : 0;

                document.getElementById('battle_name1_' + item.name).innerText = user1 ? user1.name : "Loading...";
                document.getElementById('battle_count1_' + item.name).innerText = getDisplayedCount(user1 ? user1.count : 0);
                if (user1 && document.getElementById('battle_image1_' + item.name).src !== user1.image) {
                    document.getElementById('battle_image1_' + item.name).src = user1.image;
                } else if (!user1) {
                    document.getElementById('battle_image1_' + item.name).src = "../default.png";
                }

                document.getElementById('battle_name2_' + item.name).innerText = user2 ? user2.name : "Loading...";
                document.getElementById('battle_count2_' + item.name).innerText = getDisplayedCount(user2 ? user2.count : 0);
                if (user1 && document.getElementById('battle_image2_' + item.name).src !== user2.image) {
                    document.getElementById('battle_image2_' + item.name).src = user2.image;
                } else if (!user2) {
                    document.getElementById('battle_image2_' + item.name).src = "../default.png";
                }
                document.getElementById('battle_difference_' + item.name).innerText = Math.floor(count1 - count2);
            }, item.attributes.updateInterval * 1000));
        }
        if (item.type == 'user') {
            div.innerHTML = `<div class="battle-container" style="background-color: ${item.attributes.bgColor}; height: ${item.attributes.boxHeight}px;">
                <div class="battle_container">
                    <img style="float: left; border-radius: ${item.attributes.roundAvatars ? 50 : data.imageBorder}%; height: ${item.attributes.imageSize};" src="../default.png" id="user_image1_${item.name}"></img>
                    <div class="battle_info">
                        <p id="user_name1_${item.name}" class="name" style="font-size: ${item.attributes.fontSize}px;">Loading...</p>
                        <p class="odometer count ${item.attributes.odometerColors ? "" : "no_color_transition"}" id="user_count1_${item.name}" style="font-size: ${item.attributes.fontSize}px;">0</p>
                    </div>
                </div>`;
            div.style.fontWeight = item.attributes.fontWeight || "400";
            div.style.color = item.attributes.color;
            headerIntervals.push(setInterval(function () {
                let user1 = null;
                if (item.attributes.type == 'custom') {
                    user1 = data.data.find(u => u.id == item.attributes.id1);
                } else {
                    user1 = findFastestChannel();
                }

                document.getElementById('user_name1_' + item.name).innerText = user1 ? user1.name : "Loading...";
                document.getElementById('user_count1_' + item.name).innerText = getDisplayedCount(user1 ? user1.count : 0);
                if (user1 && document.getElementById('user_image1_' + item.name).src !== user1.image) {
                    document.getElementById('user_image1_' + item.name).src = user1.image;
                } else if (!user1) {
                    document.getElementById('user_image1_' + item.name).src = "../default.png";
                }
            }, item.attributes.updateInterval * 1000));
        }
        if (!item.childOf) {
            container.appendChild(div);
        } else {
            const parent = document.getElementById('header_' + item.childOf);
            if (parent && container.contains(parent)) {
                parent.appendChild(div);
            } else {
                container.appendChild(div);
            }
        }
    }
    if (footerEl) {
        footerEl.style.fontFamily = data.headerFont || "Arial";
    }
    updateOdo()
}

function findClosestBattle() {
    let pairs = [];
    for (let i = 0; i < data.data.length - 1; i++) {
        pairs.push({
            diff: Math.abs(data.data[i].count - data.data[i + 1].count),
            channels: [data.data[i], data.data[i + 1]]
        });
    }
    pairs.sort((a, b) => a.diff - b.diff);
    return pairs[0];
}

function findFastestChannel() {
    let toReturn = [...data.data].sort((a, b) => getGain(a.id) - getGain(b.id));
    return toReturn[0];
}

function saveTopSettings() {
    let items = [];
    Array.from(document.querySelector("#sections").children).forEach(parent => {
        let item = {
            "attributes": {}
        };
        // Use querySelectorAll to find all header_option elements within the parent, not just direct children
        const options = parent.querySelectorAll(".header_option");
        options.forEach(child => {
            if (child.classList && child.classList.contains("header_option")) {
                const className = child.classList[0];
                if (className && className.includes('attribute')) {
                    const attrName = className.split('_')[2];
                    if (attrName) {
                        if (child.type === 'number') {
                            item['attributes'][attrName] = child.value ? parseInt(child.value) : 0;
                        } else if (child.type === 'checkbox') {
                            item['attributes'][attrName] = child.checked;
                        } else {
                            // Handles text, textarea, select, etc.
                            item['attributes'][attrName] = child.value || '';
                        }
                    }
                } else if (className && className.includes('option')) {
                    const optionName = className.split('_')[2];
                    if (optionName) {
                        item[optionName] = child.value || '';
                    }
                }
            }
        });
        // Only add items with valid names
        if (item.name && item.name !== 'undefined' && item.name.trim() !== '') {
            items.push(item);
        }
    });
    data.headerSettings = {
        totalSections: document.getElementById("totalSections").value || 0,
        headerHeight: document.getElementById("heightSections").value || 0,
        boxWidth: document.getElementById("sizeSections").value || '',
        sectionGap: document.getElementById("gapSections").value || 10,
        footerHeight: document.getElementById("footerHeightSections") ? (document.getElementById("footerHeightSections").value || 0) : 0,
        footerGap: document.getElementById("footerGapSections") ? (document.getElementById("footerGapSections").value || 10) : 10,
        items: items
    }
    saveData(true);
    loadHeader()
}

function loadTopSettings(itemName, itemType) {
    if (!itemType) {
        document.getElementById("totalSections").value = data.headerSettings.totalSections || '';
        document.getElementById("heightSections").value = data.headerSettings.headerHeight || 0;
        document.getElementById("sizeSections").value = data.headerSettings.boxWidth || '';
        document.getElementById("gapSections").value = data.headerSettings.sectionGap || 10;
        if (document.getElementById("footerHeightSections")) {
            document.getElementById("footerHeightSections").value = data.headerSettings.footerHeight ?? 0;
        }
        if (document.getElementById("footerGapSections")) {
            document.getElementById("footerGapSections").value = data.headerSettings.footerGap ?? 10;
        }
    }
    document.getElementById("sections").innerHTML = ``;
    // Filter out items with undefined or "undefined" names
    if (!data.headerSettings.items) {
        data.headerSettings.items = [];
    }
    data.headerSettings.items = data.headerSettings.items.filter(item =>
        item && item.name && item.name !== 'undefined' && item.name !== undefined && item.name.trim() !== ''
    );
    data.headerSettings.items.forEach(item => {
        if (item.name == itemName) {
            item.type = itemType;
        }

        let div = document.createElement("div");
        div.className = "headerItem";
        div.id = `headerItem_${item.name}`;
        let textSettings = `
            <div class="section-basic-options">
                <div style="grid-column: 1 / -1;"><label><strong>Text Content:</strong></label><br>
                <textarea rows="3" class="section_attribute_text header_option" placeholder="Enter text here. Use variables like $name1 or $name(1), $hourly1 or $hourly(1), $count1 or $count(1), or $repeat(1-50, $name, hi, $rank)">${item.attributes.text || ''}</textarea>
                <p style="font-size: 12px; color: #666; margin-top: 5px;">
                    <strong>Variables:</strong> $name(rank), $hourly(rank), $count(rank), $rank<br>
                    <strong>Repeat:</strong> $repeat(start-end, part1, part2, ...) - Repeats template for each rank in range<br>
                    <strong>Example:</strong> "$name(1) gains $hourly(1) per hour" or "$repeat(1-10, $rank. $name - $count)"
                </p></div>
                <div><label><strong>Text Color:</strong></label><br>
                <input type="color" value="${item.attributes.color || '#ffffff'}" class="section_attribute_color header_option" /></div>
                <div><label><strong>Font Size:</strong></label><br>
                <input type="number" value="${item.attributes.size || '20'}" class="section_attribute_size header_option small_input" placeholder="20" /></div>
            </div>
            <details class="section-advanced-options" style="margin-top: 10px;">
                <summary><strong>Advanced Options</strong></summary>
                <div style="margin-top: 10px;">
                    <label>Font Weight:</label>
                    <select class="section_attribute_fontWeight header_option small_input">
                        <option value="400" ${!item.attributes.fontWeight || item.attributes.fontWeight == "400" ? 'selected' : ''}>Regular</option>
                        <option value="700" ${item.attributes.fontWeight == "700" ? 'selected' : ''}>Bold</option>
                        <option value="300" ${item.attributes.fontWeight == "300" ? 'selected' : ''}>Light</option>
                        <option value="500" ${item.attributes.fontWeight == "500" ? 'selected' : ''}>Medium</option>
                        <option value="600" ${item.attributes.fontWeight == "600" ? 'selected' : ''}>Semibold</option>
                    </select><br>
                    <label>Auto-scroll Duration (0 = disabled):</label>
                    <input type="number" value="${item.attributes.scrollTime || '0'}" class="section_attribute_scrollTime header_option small_input" /><br>
                    <label>Scroll Direction:</label>
                    <select class="section_attribute_scrollDirection header_option small_input">
                        <option value="left" ${!item.attributes.scrollDirection || item.attributes.scrollDirection === 'left' ? 'selected' : ''}>Left</option>
                        <option value="right" ${item.attributes.scrollDirection === 'right' ? 'selected' : ''}>Right</option>
                    </select><br>
<br>
                    <label>List Length:</label>
                    <input type="number" value="${item.attributes.length || 0}" class="section_attribute_length header_option small_input" /><br>
                    <label>Sort Order:</label>
                    <select class="section_attribute_sortOrder header_option small_input">
                        <option value="asc" ${item.attributes.sortOrder === 'asc' ? 'selected' : ''}>Ascending</option>
                        <option value="desc" ${item.attributes.sortOrder === 'desc' ? 'selected' : ''}>Descending</option>
                    </select><br>
                    <label>Update Interval (seconds):</label>
                    <input type="number" value="${item.attributes.updateInterval || 0}" class="section_attribute_updateInterval header_option small_input" /><br>
                </div>
            </details>
        `;
        let battleSettings = `
            <div class="section-basic-options">
                <div><label><strong>Battle Type:</strong></label><br>
                <select class="section_attribute_type header_option">
                    <option value="closest" ${item.attributes.type === 'closest' ? 'selected' : ''}>Closest Battle (auto)</option>
                    <option value="custom" ${item.attributes.type === 'custom' ? 'selected' : ''}>Custom Users</option>
                </select></div>
                <div><label><strong>Update Every:</strong></label><br>
                <input type="number" value="${item.attributes.updateInterval || 2}" class="section_attribute_updateInterval header_option small_input" placeholder="2" /> seconds</div>
            </div>
            <div style="margin-top: 10px;">
                <label><strong>User 1 ID:</strong></label><br>
                <input value="${item.attributes.id1 || ""}" class="section_attribute_id1 header_option" placeholder="Leave blank for closest battle" /><br>
                <label><strong>User 2 ID:</strong></label><br>
                <input value="${item.attributes.id2 || ""}" class="section_attribute_id2 header_option" placeholder="Leave blank for closest battle" />
            </div>
            <details class="section-advanced-options" style="margin-top: 10px;">
                <summary><strong>Styling Options</strong></summary>
                <div style="margin-top: 10px;">
                    <div><label>Background Color:</label>
                    <input type="color" value="${item.attributes.bgColor || '#000000'}" class="section_attribute_bgColor header_option" /></div>
                    <div><label>Text Color:</label>
                    <input type="color" value="${item.attributes.color || '#ffffff'}" class="section_attribute_color header_option" /></div>
                    <div><label>Height:</label>
                    <input type="number" value="${item.attributes.boxHeight || '20'}" class="section_attribute_boxHeight header_option small_input" /></div>
                    <div><label>Image Size:</label>
                    <input type="number" value="${item.attributes.imageSize || '15'}" class="section_attribute_imageSize header_option small_input" /></div>
                    <div><label>Font Size:</label>
                    <input type="number" value="${item.attributes.fontSize || '15'}" class="section_attribute_fontSize header_option small_input" /></div>
                    <div><label>Font Weight:</label>
                    <select class="section_attribute_fontWeight header_option small_input">
                        <option value="400" ${!item.attributes.fontWeight || item.attributes.fontWeight == "400" ? 'selected' : ''}>Regular</option>
                        <option value="700" ${item.attributes.fontWeight == "700" ? 'selected' : ''}>Bold</option>
                        <option value="300" ${item.attributes.fontWeight == "300" ? 'selected' : ''}>Light</option>
                    </select></div>
                    <div><input type="checkbox" ${item.attributes.odometerColors ? "checked" : ""} class="section_attribute_odometerColors header_option"><label>Use odometer colors</label></div>
                    <div><input type="checkbox" ${item.attributes.roundAvatars ? "checked" : ""} class="section_attribute_roundAvatars header_option"><label>Round avatars</label></div>
                    <div><input type="checkbox" ${item.attributes.battleAlign ? "checked" : ""} class="section_attribute_battleAlign header_option"><label>Align counters to sides</label></div>
                </div>
            </details>
        `;
        let userSettings = `
            <div class="section-basic-options">
                <div><label><strong>User Type:</strong></label><br>
                <select class="section_attribute_type header_option">
                    <option value="closest" ${item.attributes.type === 'fastest' ? 'selected' : ''}>Fastest Growing</option>
                    <option value="custom" ${item.attributes.type === 'custom' ? 'selected' : ''}>Specific User</option>
                </select></div>
                <div><label><strong>Update Every:</strong></label><br>
                <input type="number" value="${item.attributes.updateInterval || 2}" class="section_attribute_updateInterval header_option small_input" placeholder="2" /> seconds</div>
            </div>
            <div style="margin-top: 10px;">
                <label><strong>User ID:</strong></label><br>
                <input value="${item.attributes.id1 || ""}" class="section_attribute_id1 header_option" placeholder="Leave blank for fastest growing" />
            </div>
            <details class="section-advanced-options" style="margin-top: 10px;">
                <summary><strong>Styling Options</strong></summary>
                <div style="margin-top: 10px;">
                    <div><label>Background Color:</label>
                    <input type="color" value="${item.attributes.bgColor || '#000000'}" class="section_attribute_bgColor header_option" /></div>
                    <div><label>Text Color:</label>
                    <input type="color" value="${item.attributes.color || '#ffffff'}" class="section_attribute_color header_option" /></div>
                    <div><label>Height:</label>
                    <input type="number" value="${item.attributes.boxHeight || '20'}" class="section_attribute_size header_option small_input" /></div>
                    <div><label>Image Size:</label>
                    <input type="number" value="${item.attributes.imageSize || '15'}" class="section_attribute_imageSize header_option small_input" /></div>
                    <div><label>Font Size:</label>
                    <input type="number" value="${item.attributes.fontSize || '15'}" class="section_attribute_fontSize header_option small_input" /></div>
                    <div><label>Font Weight:</label>
                    <select class="section_attribute_fontWeight header_option small_input">
                        <option value="400" ${!item.attributes.fontWeight || item.attributes.fontWeight == "400" ? 'selected' : ''}>Regular</option>
                        <option value="700" ${item.attributes.fontWeight == "700" ? 'selected' : ''}>Bold</option>
                        <option value="300" ${item.attributes.fontWeight == "300" ? 'selected' : ''}>Light</option>
                    </select></div>
                    <div><input type="checkbox" ${item.attributes.odometerColors ? "checked" : ""} class="section_attribute_odometerColors header_option"><label>Use odometer colors</label></div>
                    <div><input type="checkbox" ${item.attributes.roundAvatars ? "checked" : ""} class="section_attribute_roundAvatars header_option"><label>Round avatar</label></div>
                </div>
            </details>
        `;
        let boxSettings = `
            <div class="section-basic-options">
                <div><label><strong>Number of Rows:</strong></label><br>
                <input type="number" value="${item.attributes.rows || 0}" class="section_attribute_rows header_option small_input" placeholder="0" /></div>
            </div>
            <p style="margin-top: 10px; color: #666;">Boxes are containers that can hold other sections. Use "Child of" below to nest sections inside boxes.</p>
        `;
        div.innerHTML = `
            <div style="padding: 15px; margin-bottom: 15px; border-radius: 5px; border: 2px solid #ddd;">
                <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 15px; flex-wrap: wrap;">
                    <div><label><strong>Section Name:</strong></label><br>
                    <input type="text" value="${item.name}" class="section_option_name header_option" placeholder="My Section" /></div>
                    <div><label><strong>Place in:</strong></label><br>
                    <select class="section_option_placement header_option">
                        <option value="header" ${(item.placement || 'header') === 'header' ? 'selected' : ''}>Header</option>
                        <option value="footer" ${(item.placement || 'header') === 'footer' ? 'selected' : ''}>Footer</option>
                    </select></div>
                    <div><label><strong>Section Type:</strong></label><br>
                    <select class="section_option_type header_option" value="${item.type}" onchange="loadTopSettings('${item.name}', this.value)">
                        <option value="text" ${item.type === "text" ? "selected" : ""}>Text</option>
                        <option value="battle" ${item.type === "battle" ? "selected" : ""}>Battle</option>
                        <option value="user" ${item.type === "user" ? "selected" : ""}>User</option>
                        <option value="box" ${item.type === "box" ? "selected" : ""}>Box (Container)</option>
                    </select></div>
                </div>
                <details class="section-nesting-option" style="margin-bottom: 10px;">
                    <summary><strong>Nesting (Advanced)</strong></summary>
                    <div style="margin-top: 10px;">
                        <label>Parent Box Name:</label>
                        <input type="text" value="${item.childOf || ""}" class="section_option_childOf header_option" placeholder="Leave blank for top level" />
                        <p style="font-size: 12px; color: #666; margin-top: 5px;">Enter the name of a box section to nest this inside it.</p>
                    </div>
                </details>
                <hr style="margin: 15px 0;">
                ${item.type == 'text' ? textSettings : item.type == 'battle' ? battleSettings : item.type == 'user' ? userSettings : item.type == 'box' ? boxSettings : ''}
                <hr style="margin: 15px 0;">
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button type="button" onclick="removeTopSetting('${item.name}')" style="background-color: #dc3545;">Delete</button>
                    <button type="button" onclick="reorderTopSetting('${item.name}', 'up')">↑ Move Up</button>
                    <button type="button" onclick="reorderTopSetting('${item.name}', 'down')">↓ Move Down</button>
                </div>
            </div>
            `;
        document.getElementById("sections").appendChild(div);
    });
    adjustColors();
    loadHeader();
};
loadTopSettings();

function removeTopSetting(name) {
    if (confirm("Are you sure you want to delete this setting?")) {
        let itemToRemove = data.headerSettings.items.find(item => item.name === name);
        if (itemToRemove) {
            data.headerSettings.items.splice(data.headerSettings.items.indexOf(itemToRemove), 1);
            loadTopSettings();
        }
    }
}

function createNewSection() {
    let item = {
        "attributes": {
            "text": "Text",
            "color": "#ffffff",
            "size": 30,
            "scrollTime": 0,
            "valueFrom": "none",
            "length": 0,
            "sortOrder": "asc",
            "updateInterval": 2,
            "roundAvatars": false,
            "battleAlign": false,
            "odometerColors": true,
            "fontWeight": "400",
            "id1": "",
            "id2": ""
        },
        "name": "Item " + data.headerSettings.items.length,
        "type": "text",
        "childOf": "",
        "placement": "header"
    }
    data.headerSettings.items.unshift(item);
    loadTopSettings();
}

function displaySetting(id, item) {
    let div = item;
    if (div.classList.contains("enabled")) {
        div.classList.remove("enabled");
        document.getElementById(id).classList.add("hidden");
        data.settingsEnabled.splice(data.settingsEnabled.indexOf(id), 1);
    } else {
        div.classList.add("enabled");
        document.getElementById(id).classList.remove("hidden");
        data.settingsEnabled.push(id);
    }
    fixSettings();
}

function reorderTopSetting(item, direction) {
    let element = data.headerSettings.items.find(setting => setting.name === item);
    let index = data.headerSettings.items.indexOf(element);
    if (direction === 'up') {
        if (element && index > 0) {
            let previousElement = data.headerSettings.items[index - 1];
            if (previousElement) {
                //swap elements
                data.headerSettings.items.splice(index, 1);
                data.headerSettings.items.splice(index - 1, 0, element);
            }
        }
    } else if (direction === 'down') {
        if (element && index < data.headerSettings.items.length - 1) {
            let nextElement = data.headerSettings.items[index + 1];
            if (nextElement) {
                //swap elements
                data.headerSettings.items.splice(index, 1);
                data.headerSettings.items.splice(index + 1, 0, element);
            }
        }
    }
    loadTopSettings();
}

function fixSettings() {
    Array.from(document.getElementById('container').children).forEach(child => {
        let isActive = !child.classList.contains('hidden');
        if (isActive) {
            let place = data.settingsEnabled.indexOf(child.id);
            child.style.order = place + 1;
        } else {
            child.style.order = 'auto';
        }
    });
}

function saveCustomCSS() {
    const css = document.getElementById('customCSS').value;
    document.getElementById('customCSSOverrides').innerHTML = css;
    data['customCSS'] = css;
}