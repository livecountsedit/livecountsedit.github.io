const BLANK_IMAGE_URL = new URL('../blank.png', document.baseURI).href;
const DEFAULT_AVATAR = '../default.png';
const COUNTER_THEME = "top50";
window.COUNTER_THEME = "top50";
const ZERO_WIDTH_SPACE = '\u200b';
const FONT_WEIGHTS = `
<option value="100">Thin</option>
<option value="200">Extra Light</option>
<option value="300">Light</option>
<option value="400">Regular</option>
<option value="500">Medium</option>
<option value="600">Semibold</option>
<option value="700">Bold</option>
<option value="800">Extra Bold</option>
<option value="900">Black</option>
`

let apiurl = window.location.href.includes('lcedit.com') ? "https://api.lcedit.com/" : 'http://localhost:1112/';
let currentIndex = 0;
let auditTimeout;
let saveInterval;
let chart;
let code;
let charts = {}; // Store chart instances by channel ID
let nextUpdateAudit = false;
let specificChannels = [];
let pickingChannels = false;
let quickSelecting = false;
let odometers = [];
let iso;
let data = {};
let gainTable = {};
let glowingCards = [];
let fires = new Map();
let appendedMDMStyles = false;

// override function in importData
function fillMenus() {
    return;
}

let uuid = uuidGen()
let example_data = {
    "settingsTab": "addSettings",
    "showImages": true,
    "showNames": true,
    "showCounts": true,
    "showRankings": true,
    "rankingsWidth": '10',
    "showBlankSlots": true,
    "showDifferences": false,
    "differenceStyles": {
        "left": "75",
        "top": "60",
        "imageLeft": "10",
        "imageTop": "60",
        "imageSize": "50",
        "differenceSize": '2',
        "lineEnabled": false,
        "lineColor": "#808080",
        "abbDifferences": false,
        "alignDifferences": "left",
        "estimateUsingObservedGains": false,
        "created": []
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
        "showChart": false,
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
    "nameAlignment": "left",
    "fadeName": false,
    "fadeNameLength": 30,
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
        'fireObservedGains': true,
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
    'customCSS': '',
    'debugMode': false,
    'streamerMode': false,
    'editorShowsExactCount': false,
    'useOdometerColors': true,
    'maxChartValues': 50,
    'numberFormat': 'comma',
    'animationType': 'default',
    'reverseAnimation': false,
    'saveType': COUNTER_THEME,
    'index': 1,
    'showScrollbars': true,
    partialExports: {
        state: true,
        counters: true,
        names: true,
        counts: true,
        avatars: true,
        backgrounds: true,
        gains: true,
        charts: true,
        audits: true,
        designSettings: true,
        styles: true,
        customCSS: true,
        technicalSettings: true,
        fireSettings: true,
        differenceSettings: true,
        apiUpdates: true,
        streamSettings: true,
        headerSettings: true,
        scripts: true
    },
    saveVersion: SAVE_VERSION,
    versionCreated: VERSION,
    versionLastOpened: VERSION
};
let updateInterval;
let apiInterval;

initLoad()
async function initLoad(redo, previousTheme) {
    let storedData;

    const oldData = localStorage.getItem('data');

    if (oldData && !obsMode) {
        try {
            const oldSave = JSON.parse(oldData);
            oldSave.saveType = COUNTER_THEME;
            if (confirm('Livecountsedit has upgraded to a better browser storage method. You have old data stored in your browser, would you like to save a backup just in case?')) {
                const file = new Blob([JSON.stringify(oldSave)], { type: 'text/plain' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(file);
                a.download = 'data.json';
                a.click();
            }
            storedData = oldSave;
        } catch (err) {
            console.error(err);
        }
        localStorage.removeItem('data');
    } else {
        storedData = await retrieveDataFromBrowser(COUNTER_THEME, 1);
    }
    //let storedData = localStorage.getItem("data") ? JSON.parse(localStorage.getItem("data")) : null;

    if (!redo) {
        if (storedData) {

            // fix stupid typo
            if (storedData.partialExports.fireIcons && typeof storedData.partialExports.fireIcons === 'boolean') {
                storedData.partialExports.fireSettings = storedData.partialExports.fireIcons;
                delete storedData.partialExports.fireIcons;
            }
            
            data = mergeWithExampleData(storedData, example_data);
            data.data = data.data.map(x => new Channel(x));
            data.saveType = COUNTER_THEME;
            data.versionLastOpened = VERSION;
        } else {
            data = structuredClone(example_data);
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
    // default placement to 'header'
    // rename items with invalid names
    data.headerSettings.items.forEach(item => { 
        if (item.placement == null) item.placement = 'header'; 
        if (!isValidHeaderName(item.name)) item.name = uuidGen();
    });

    // Old difference settings
    if ('imageEnabled' in data.differenceStyles || 
        'shakingEnabled' in data.differenceStyles || 
        'differenceImage' in data.differenceStyles || 
        'showDifferenceWhen' in data.differenceStyles ||
        'color' in data.differenceStyles ||
        'differenceThreshold' in data
    ) {
        data.differenceStyles.created.push({
            name: 'Difference',
            threshold: parseFloat(data.differenceThreshold) || 0,
            icon: data.differenceStyles.imageEnabled ? (data.differenceStyles.differenceImage || '') : '',
            color: data.differenceStyles.color || '',
            method: '<=',
            iconShaking: !!data.differenceStyles.shakingEnabled,
            glowColor: '',
            glow: 'none',
            showWhen: data.differenceStyles.showDifferenceWhen || 'always'
        });
        delete data.differenceStyles.imageEnabled;
        delete data.differenceStyles.shakingEnabled;
        delete data.differenceStyles.differenceImage;
        delete data.differenceStyles.showDifferenceWhen;
        delete data.differenceStyles.color;
        delete data.differenceThreshold;
    }

    // Old menu
    if ('settingsEnabled' in data) {
        delete data.settingsEnabled;
    }

    // Old animation value
    if ('animation' in data) {
        data.animationType = data.animation ? 'default' : 'counting';
        delete data.animation;
    }

    if (typeof data.apiUpdates.headers === 'string') {
        data.apiUpdates.headers = {};
    }

    if (typeof data.apiUpdates.body === 'string') {
        data.apiUpdates.headers = {};
    }

    data.fireIcons.created.forEach(x => { if (!x.fontWeight) x.fontWeight = 900;})

    // Reset sizes if switching away from top1
    if (redo && previousTheme && previousTheme === 'top1' && data.theme !== 'top1') {
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
        data.apiUpdates.interval = clamp(data.apiUpdates.interval, 1000, 2147483647);
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
    updateStreamerMode();
    if (data.lastOnline && data.offlineGains) {
        // Subtract 1 since the counter also updates immediately upon load.
        const intervalsPassed = (new Date().getTime() - data.lastOnline) / data.updateInterval - 1;
        // Only do offline gains if at least 5 intervals have passed
        if (intervalsPassed >= 5) {
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
    updateOdo();
    fix();
    document.querySelectorAll("#container,#settings").forEach(x => x.style.backgroundColor = document.getElementById("backPicker").value);
    adjustColors();
    if (!data.pause) {
        updateInterval = setInterval(update, data.updateInterval);
        update();
    }
    let element = document.getElementById(data.settingsTab);
    let button = document.getElementById('button_' + data.settingsTab);
    element.classList.remove("hidden");
    button.classList.add("enabled");

    if (!redo) {
        loadAPIUpdates();
        loadFireIcons();
        loadDifferenceEffects();
        loadTopSettings();
        afterDrawingMenu();
        await loadScripts();
        initScripts();
        code = data.uuid
        document.getElementById('connect').innerText = '$(urlfetch ' + apiurl + '' + code + '/$(userid)/$(query)?returnText=Added $(user)!)';
        document.getElementById('connect2').innerText = '$(urlfetch ' + apiurl + '' + code + '/$(userid)?values=10,20&returnText=$(user) uploaded $(query)!)';
        document.getElementById('connect3').innerText = '$(urlfetch ' + apiurl + '' + code + '/$(userid)/$(query)?value=edit&returnText=Edited $(user)!)';
        document.getElementById('connect4').innerText = '$(urlfetch ' + apiurl + '' + code + '/$(userid)/user)';
        document.getElementById('connect5').innerText = '$(urlfetch ' + apiurl + '' + code + '/$(userid)/gains)';
        document.getElementById('connect6').innerText = '$(urlfetch ' + apiurl + '' + code + '/$(userid)/rank)';
        let connected = false;
        if (window.location.href.includes('?code=')) {
            code = window.location.href.split('?code=')[1];
            connected = true;
        }

        let update2Hold;
        if (connected) {
            update2()
            update2Hold = setInterval(update2, 2500);
            document.getElementById('isconnected').innerText = "Yes";
            document.getElementById('toConnect').innerText = "Disconnect";
        }
    }
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

    function createCard(dataIndex) {
        const htmlcard = document.createElement('div');
        const cid = channels[dataIndex] ? channels[dataIndex].id : '';

        const cardDiv = document.createElement('div');
        cardDiv.className = `card card_${dataIndex}`;
        cardDiv.id = `card_${cid}`;

        const numDiv = document.createElement('div');
        numDiv.className = 'num';
        numDiv.id = `num_${cid}`;
        const numText = document.createElement('div');
        numText.className = 'num_text';
        numText.innerText = formatRank(dataIndex + 1);
        numDiv.appendChild(numText);

        const image = document.createElement('img');
        image.src = channels[dataIndex] ? (channels[dataIndex].image || DEFAULT_AVATAR) : '../blank.png';
        image.id = `image_${cid}`;
        image.className = 'image';

        const nameCountDiv = document.createElement('div');
        const nameDiv = document.createElement('div');
        nameDiv.className = 'name';
        nameDiv.id = `name_${cid}`;
        nameDiv.innerText = channels[dataIndex] ? channels[dataIndex].name : ZERO_WIDTH_SPACE;
        const countDiv = document.createElement('div');
        countDiv.id = `count_${cid}`;
        countDiv.className = 'count odometer';
        countDiv.innerText = channels[dataIndex] ? getDisplayedCount(channels[dataIndex]) : 0;
        nameCountDiv.append(nameDiv, countDiv);

        const gapImage = document.createElement('img');
        gapImage.className = 'gapimg';

        const subGap = document.createElement('div');
        subGap.className = 'subgap';
        const subGapText = document.createElement('span');
        subGapText.className = 'text';
        const subGapOdometer = document.createElement('span');
        subGapOdometer.className = 'odometer no_color_transition';
        subGap.append(subGapText, subGapOdometer);

        const differenceLine = document.createElement('div');
        differenceLine.className = 'difference_line';

        const chart = document.createElement('div');
        chart.className = 'chart';
        chart.id = `chart_${cid}`;

        cardDiv.append(numDiv, image, nameCountDiv, gapImage, subGap, differenceLine, chart);
        htmlcard.appendChild(cardDiv);
        return htmlcard;
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

        for (let dataIndex = 0; dataIndex < cards; dataIndex++) {
            const htmlcard = createCard(dataIndex);
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
                const htmlcard = createCard(dataIndex);
                htmlcolumn.innerHTML += htmlcard.innerHTML;
                c++;
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

    document.getElementById('customCSSOverrides').innerText = data['customCSS'] || '';
    document.getElementById('customCSS').value = data['customCSS'] || '';

    // Initialize charts if showChart is enabled
    if (data.cardStyles.showChart && typeof Highcharts !== 'undefined') {
        setTimeout(initializeCharts, 200);
    }

    return toReturn;
}

function initializeCharts() {
    if (typeof Highcharts === 'undefined') {
        if (data.debugMode) console.warn('Highcharts not loaded, charts will not be displayed');
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
            const dataPoints = gainTable[channel.id].slice(-(data.maxChartValues+1), -1);
            chartData = dataPoints.map((value, index) => {
                // Create timestamps going back in time
                const timeOffset = (dataPoints.length - index) * data.updateInterval;
                return [now - timeOffset, getDisplayedCount(value) || 0];
            });
        } else {
            // Start with current count - add at least 2 points so line is visible
            const now = Date.now();
            const count = getDisplayedCount(channel.count) || 0;
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
            if (data.debugMode) console.error('Error creating chart for channel ' + channel.id + ':', e);
        }
    });
}

function updateCharts() {
    if (typeof Highcharts === 'undefined' || !data.cardStyles.showChart) return;
    initializeCharts();

    data.data.forEach(function (channel) {
        if (!channel || !channel.id || !charts[channel.id]) return;

        try {
            const chart = charts[channel.id];
            const series = chart.series[0];

            if (series) {

                const now = Date.now();
                const count = getDisplayedCount(channel.count) || 0;

                //Add new point
                series.addPoint([now, count], true, series.data.length === data.maxChartValues);

            }
        } catch (e) {
            // Ignore errors when updating charts
            if (data.debugMode) console.warn('Error updating chart for channel ' + channel.id + ':', e);
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
            image = DEFAULT_AVATAR;
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
        let id = uuidGen();
        if (document.getElementById('add_id').value.length > 0) {
            id = document.getElementById('add_id').value;
        }
        if (data.data.some(x => x.id === id)) {
            return alert('That ID is already in use.')
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

function setupMDMStyles() {
    if (data.fireIcons.firePosition !== 'mdm' || !data.fireIcons.enabled) {
        appendedMDMStyles = false;
        const mdmStyles = document.getElementById('mdm-styles');
        if (mdmStyles) mdmStyles.remove();
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
                            ${data.verticallyCenterRanks ? 'flex-direction: column;' : ''}
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

function updateQuickSelectMenu() {
    let past = document.getElementById('quickSelect').value;
    document.getElementById('quickSelect').innerHTML = '<option value="">Select</option>';
    for (const channel of data.data) {
        const opt = document.createElement('option');
        opt.value = channel.id;
        opt.innerText = channel.name;
        document.getElementById('quickSelect').appendChild(opt);
    }
    document.getElementById('quickSelect').value = past || '';
}

function update(doGains = true) {
    let intervalNumber = data.intervalCount;
    if (data.debugMode) console.time(`Update #${intervalNumber + 1} took`)
    if (data) {
        data.lastOnline = Date.now();
        let fastest = ""
        let fastestCount = -Infinity;
        let slowest = ""
        let slowestCount = Infinity;
        for (let i = 0; i < data.data.length; i++) {
            if (!data.data[i]) {
                data.data.splice(i, 1);
                i--;
                continue;
            }
            data.data[i].lastCount = parseFloat(data.data[i].count);
            data.data[i].min_gain = parseFloat(data.data[i].min_gain);
            data.data[i].max_gain = parseFloat(data.data[i].max_gain);
            data.data[i].mean_gain = parseFloat(data.data[i].mean_gain);
            data.data[i].std_gain = parseFloat(data.data[i].std_gain);
            if (doGains) {
                if (isFinite(data.data[i].mean_gain) && isFinite(data.data[i].std_gain)) {
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
            if (nextUpdateAudit && doGains) {
                let update = random(data.auditStats[0], data.auditStats[1])
                data.data[i].count = data.data[i].count + update
            }
            if (i == data.data.length - 1) {
                nextUpdateAudit = false
            }
            if (data.data[i].count < 0) {
                if (!data.allowNegative) {
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
            gainTable[data.data[i].id] = gainTable[data.data[i].id].slice(-(Math.max(data.maxChartValues, data.gainAverageOf) + 1));
        }
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
                    return getDisplayedCount(b.count) - getDisplayedCount(a.count)
                });
            } else {
                data.data = data.data.sort(function (a, b) {
                    return getDisplayedCount(b.count) - getDisplayedCount(a.count)
                });
            }
        }
        if (document.getElementById('order').value == "asc") {
            data.data = data.data.reverse();
        }
        updateQuickSelectMenu();
        if (data.fireIcons.enabled) {
            if (data.fireIcons.firePosition == 'mdm') {
                if (!appendedMDMStyles) {
                    setupMDMStyles();
                }
            }
        }
        for (let i = 0; i < data.max; i++) {
            glowingCards = [];
            let extraTimeTillUpdate = 0;
            const interval = data.updateInterval;
            if (data.randomCountUpdateTime) {
                extraTimeTillUpdate = random(0, interval);
            }
            if (data.waterFallCountUpdateTime) {
                extraTimeTillUpdate = i * 100;
            }

            if (data.intervalCount % data.fireIcons.intervalsPerUpdate === 0) {
                calculateFires();
            }
            setTimeout(function () {
                num = formatRank(i + 1);
                const currentCard = document.getElementsByClassName("card")[i];
                if (currentCard) {
                    if (data.animatedCards.enabled) {
                        num = currentCard.querySelector(".num_text").innerText
                    }
                    if (data.data[i]) {
                        if (!data.data[i].image) {
                            data.data[i].image = DEFAULT_AVATAR;
                        }
                        if (data.data[i].bg) {
                            currentCard.style.background = data.data[i].bg;
                        } else {
                            currentCard.style.background = '';
                            currentCard.style.backgroundColor = data.boxColor;
                        }
                        currentCard.id = "card_" + data.data[i].id
                        currentCard.querySelector(".num").id = "num_" + data.data[i].id

                        const absoluteUrl = new URL(data.data[i].image, window.location.href).href;

                        if (!(currentCard.querySelector(".image").src === absoluteUrl)) {
                            currentCard.querySelector(".image").src = data.data[i].image;
                        }

                        currentCard.querySelector(".image").id = "image_" + data.data[i].id

                        currentCard.querySelector(".name").innerText = data.data[i].name
                        currentCard.querySelector(".name").id = "name_" + data.data[i].id

                        currentCard.querySelector(".count").id = "count_" + data.data[i].id
                        currentCard.querySelector(".count").innerText = getDisplayedCount(data.data[i].count)
                        currentCard.setAttribute('data-count', data.data[i].count)
                        //HERE
                        if (data.data[i + 1]) {
                            const topGainSet = getSetGain(data.data[i]);
                            const bottomGainSet = getSetGain(data.data[i+1]);
                            const topGainObserved = getGain(data.data[i].id);
                            const bottomGainObserved = getGain(data.data[i+1].id);
                            const diff = getDisplayedCount(data.data[i].count) - getDisplayedCount(data.data[i + 1].count);
                            const time = estimatePassingTime(data.data[i], data.data[i+1]);
                            const hours = time / 3.6e6 * data.updateInterval;
                            let effectDisplayed = false;

                            for (let j = 0; j < data.differenceStyles.created.length; j++) {
                                const diffEffect = data.differenceStyles.created[j];
                                switch (diffEffect.showWhen) {
                                    case 'bottomFasterSet':
                                        if (bottomGainSet < topGainSet) continue;
                                        break;
                                    case 'topFasterSet':
                                        if (topGainSet < bottomGainSet) continue;
                                        break;
                                    case 'bottomFasterObserved':
                                        if (bottomGainObserved < topGainObserved) continue;
                                        break;
                                    case 'topFasterObserved':
                                        if (topGainObserved < bottomGainObserved) continue;
                                        break;
                                } 

                                let condition = false;
                                switch (diffEffect.method) {
                                    case '<=':
                                        condition = (diff <= diffEffect.threshold);
                                        break;
                                    case '==':
                                        condition = (diff == diffEffect.threshold);
                                        break;
                                    case '>=':
                                        condition = (diff >= diffEffect.threshold);
                                        break;
                                    case '!=':
                                        condition = (diff != diffEffect.threshold);
                                        break;
                                    case 'h<=':
                                        condition = (isFinite(hours) && hours >= 0 && hours <= diffEffect.threshold);
                                        break;
                                    case 'h>=':
                                        condition = (isFinite(hours) && hours >= Math.max(0, diffEffect.threshold));
                                        break;
                                }

                                if (condition) {
                                    effectDisplayed = true;
                                    let thisCardGlows = false;
                                    let nextCardGlows = false;
                                    currentCard.querySelector(".subgap").style.color = diffEffect.color;
                                    if (diffEffect.icon) {
                                        currentCard.querySelector(".gapimg").src = diffEffect.icon;
                                        currentCard.querySelector(".gapimg").style.visibility = 'visible';
                                        currentCard.querySelector(".gapimg").style.animation = diffEffect.iconShaking ? "shake 1s infinite" : "";
                                    } else {
                                        currentCard.querySelector(".gapimg").style.visibility = 'hidden';
                                    }
                                    currentCard.querySelector(".subgap").querySelector(".text").innerText = abbs(getDisplayedCount(data.data[i].count) - getDisplayedCount(data.data[i + 1].count));
                                    currentCard.querySelector(".subgap").querySelector(".odometer").innerText = getDisplayedCount(data.data[i].count) - getDisplayedCount(data.data[i + 1].count)
                                    currentCard.querySelector(".subgap").style.visibility = 'visible';
                                    currentCard.querySelector(".difference_line").style.visibility = 'visible';

                                    switch (diffEffect.glow) {
                                        case 'bottom':
                                            nextCardGlows = true;
                                            break;
                                        case 'top':
                                            thisCardGlows = true;
                                            break;
                                        case 'both':
                                            thisCardGlows = true;
                                            nextCardGlows = true;
                                            break;
                                        case 'fasterSet':
                                            bottomGainSet < topGainSet ? thisCardGlows = true : nextCardGlows = true;
                                            break;
                                        case 'slowerSet':
                                            bottomGainSet > topGainSet ? thisCardGlows = true : nextCardGlows = true;
                                            break;
                                        case 'fasterObserved':
                                            bottomGainObserved < topGainObserved ? thisCardGlows = true : nextCardGlows = true;
                                            break;
                                        case 'slowerObserved':
                                            bottomGainObserved > topGainObserved ? thisCardGlows = true : nextCardGlows = true;
                                            break;                                       
                                    }

                                    if (thisCardGlows) {
                                        if (!glowingCards[i] || glowingCards[i] > j + 1) {
                                            glowingCards[i] = j + 1;
                                        }
                                    }

                                    if (nextCardGlows) {
                                        glowingCards[i + 1] = j + 1;
                                    }

                                    break;
                                }
                            }

                            if (!effectDisplayed) {
                                currentCard.querySelector(".gapimg").style.visibility = 'hidden';
                                currentCard.querySelector(".subgap").style.visibility = 'hidden';
                                currentCard.querySelector(".difference_line").style.visibility = 'hidden';
                            }

                        } else {
                            currentCard.querySelector(".gapimg").style.visibility = 'hidden';
                            currentCard.querySelector(".subgap").style.visibility = 'hidden';
                            currentCard.querySelector(".difference_line").style.visibility = 'hidden';
                        }

                        if (glowingCards[i]) {
                            currentCard.style.background = '';
                            currentCard.style.backgroundColor = data.differenceStyles.created[glowingCards[i] - 1].glowColor;
                            if (!currentCard.classList.contains("glowing")) {
                                currentCard.classList.add("glowing");
                            }
                        } else {
                            currentCard.style.background = data.data[i].bg || '';
                            currentCard.style.backgroundColor = data.data[i].bg || data.boxColor;
                            currentCard.classList.remove("glowing");
                        }
                        currentCard.querySelector(".chart").id = "chart_" + data.data[i].id;
                        if (selected !== data.data[i].id) {
                            document.getElementById("card_" + data.data[i].id).style.border = "0.1em solid " + data.boxBorder + "";
                        }
                        if (fastest == data.data[i].id) {
                            if (data.fastest) {
                                document.getElementById("card_" + fastest).querySelector(".name").innerText = "" + data.fastestIcon + " " + data.data[i].name
                            }
                        }
                        if (slowest == data.data[i].id) {
                            if (data.slowest) {
                                document.getElementById("card_" + slowest).querySelector(".name").innerText = "" + data.slowestIcon + " " + data.data[i].name
                            }
                        }
                        applyFire(currentCard, i, true);
                        if (data.boxBGLength !== '0' && !currentCard.classList.contains('glowing')) {
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
                        const id = currentCard.id;
                        currentCard.id = 'card_'
                        currentCard.querySelector(".num").id = "num_"
                        currentCard.querySelector(".image").id = "image_"
                        if (currentCard.querySelector(".image").src !== BLANK_IMAGE_URL) {
                            currentCard.querySelector(".image").src = BLANK_IMAGE_URL
                        }
                        currentCard.querySelector(".name").id = "name_"
                        currentCard.querySelector(".name").innerText = ZERO_WIDTH_SPACE
                        currentCard.querySelector(".count").id = "count_"
                        currentCard.querySelector(".count").innerText = '0'
                        currentCard.querySelector(".subgap").querySelector(".odometer").innerText = 0;
                        currentCard.querySelector(".subgap").querySelector(".text").innerText = 0;
                        currentCard.querySelector(".num").innerHTML = `<div class="num_text">${num}</div>`;
                        currentCard.querySelector(".num").style.backgroundImage = `url('')`;
                        currentCard.querySelector(".num").style.color = data.textColor;
                        currentCard.querySelector(".num_text").style.marginTop = "";
                        currentCard.querySelector(".num_text").style.marginLeft = "";
                        if (charts[id]) {
                            charts[id].destroy();
                            delete charts[id];
                        }
                        currentCard.querySelector(".chart").id = "chart_";
                        applyFire(currentCard, i, false);
                        currentCard.querySelector(".gapimg").style.visibility = 'hidden';
                        currentCard.querySelector(".subgap").style.visibility = 'hidden';
                        currentCard.querySelector(".difference_line").style.visibility = 'hidden';
                        currentCard.style.backgroundColor = data.boxColor;
                        currentCard.classList.remove("glowing");
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
                    const nameA = a.querySelector(".name")?.innerText || '';
                    const nameB = b.querySelector(".name")?.innerText || '';
                    return nameA.localeCompare(nameB);
                });

                // Update rank numbers based on sorted order
                validCards.forEach((card, index) => {
                    if (card.querySelector(".num_text")) {
                        const newRank = formatRank(index + 1);
                        card.querySelector(".num_text").innerText = newRank;
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

    if (data.debugMode) console.timeEnd(`Update #${intervalNumber + 1} took`);
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
    if (document.getElementById('quickSelect').value) {
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
                if (card) card.querySelector('.name').innerText = name;
            }
            if (document.getElementById('edit_bg_color_check').checked) {
                for (let i = 0; i < data.data.length; i++) {
                    if (data.data[i].id == id) {
                        data.data[i].bg = document.getElementById('edit_bg_color').value;
                        if (card) card.style.background = data.data[i].bg || data.boxColor;
                    }
                }
            }
            if (document.getElementById('edit_count_check').checked) {
                for (let i = 0; i < data.data.length; i++) {
                    if (data.data[i].id == id) {
                        data.data[i].count = count;
                    }
                }
                if (card) card.querySelector('.odometer').innerText = getDisplayedCount(count);
            }
            if (document.getElementById('edit_image_check').checked) {
                for (let i = 0; i < data.data.length; i++) {
                    if (data.data[i].id == id) {
                        data.data[i].image = image;
                    }
                }
                if (card) card.querySelector('.image').src = image;
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
            data2 = JSON.parse(data2);
            let newChannels = data2.data;
            if (!newChannels && 'name' in data2 && 'count' in data2) {
                newChannels = [data2];
            }

            // old Livecountsedit v7.0 save
            if (typeof data2.saveType === 'number') {
                return alert('Saves must be converted before you can import channels.');
            }
            newChannels.forEach((item, index) => {
                if (!item.id) item.id = uuidGen();
                const has = data.data.some(channel => channel.id === item.id);
                if (has) {
                    stats.failed++;
                } else {
                    stats.success++;
                    data.data.push(new Channel(item));
                }
                if (index == newChannels.length - 1) {
                    alert('Imported ' + stats.success + " channels! (" + stats.failed + " duplicates)")
                }
            })
        })
    }
}

function load() {
    var data3 = {};
    if (document.getElementById('loadData1').files[0]) {
        document.getElementById('loadData1').files[0].text().then(async function (data2) {
            clearInterval(updateInterval);
            clearInterval(auditTimeout);
            data3 = JSON.parse(data2);
            try {
                await importData(data3);
                if (!data.uuid) {
                    data.uuid = uuidGen();
                }
                if (data.index !== 1) {
                    data.index = 1;
                }
                //console.log(data);
                await saveDataInBrowser(COUNTER_THEME, data);
                //localStorage.setItem("data", JSON.stringify(data));
            } catch (error) {
                console.error(error);
            }
            document.getElementById('main').innerHTML = "";
            window.location.reload();
        });
    } else {
        alert('No save file found!')
    }
}

async function reset() {
    if (confirm("Are you sure you want to reset?")) {
        await deleteDataInBrowser(COUNTER_THEME, 1)
        location.reload();
    }
}

function zero() {
    if (confirm("Are you sure you want to zero all the counters?")) {
        for (i = 0; i < data.data.length; i++) {
            data.data[i].count = 0;
        }
        update(false);
    }
}

function deleteAllChannels() {
    if (confirm("Are you sure you want to delete all channels?")) {
        data.data = [];
        const selectedCard = document.querySelector(".selected");
        if (selectedCard) {
            selectedCard.classList.remove("selected");
            selectedCard.style.border = "solid 0.1em " + data.boxBorder;
            document.getElementById('quickSelect').value = '';
        }
        refresh();
        for (const key of Object.keys(charts)) {
            charts[key].destroy();
            delete charts[key];
        }
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
            document.getElementById('quickSelect').value = '';
            updateQuickSelectMenu();
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
                let data2 = JSON.stringify({
                    data: [data.data[i]]
                });
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
    document.querySelectorAll("#container,#settings").forEach(x => x.style.backgroundColor = this.value);
    data.bgColor = this.value;
    adjustColors();
});

document.getElementById('backPickerUrl').addEventListener('change', function () {
    document.body.style.backgroundImage = 'url(' + this.value + ')';
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
    } else {
        data.bgColor = document.getElementById('backPicker').value;
        document.body.style.backgroundImage = '';
    }
    document.querySelectorAll("#container,#settings").forEach(x => x.style.backgroundColor = document.getElementById("backPicker").value);
    adjustColors();
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
    fix();
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

document.getElementById('animatedCardChanges').addEventListener('change', async function () {
    if (confirm('This will refresh the page')) {
        data.animatedCards.enabled = this.checked;
        await saveInBrowser(COUNTER_THEME, false);
        if (obsMode) localStorage.setItem('obs-' + COUNTER_THEME, '1');
        location.reload();
    }
});

document.getElementById('allowNegative').addEventListener('change', function () {
    data.allowNegative = this.checked;
});

document.getElementById('randomCountUpdateTime').addEventListener('change', function () {
    data.randomCountUpdateTime = this.checked;
});

document.getElementById('waterFallCountUpdateTime').addEventListener('change', function () {
    data.waterFallCountUpdateTime = this.checked;
});

document.getElementById('importFromGoogleFonts').addEventListener('change', function () {
    data.importFromGoogleFonts = this.checked;
    fix();
})

document.getElementById('intervalsPerUpdate').addEventListener('change', function () {
    data.fireIcons.intervalsPerUpdate = Math.max(1, Math.round(this.value));
})

document.getElementById('headerFont').addEventListener('change', function () {
    data.headerFont = this.value;
    fix();
})

document.getElementById('mainFont').addEventListener('change', function () {
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

document.getElementById('nameAlignment').addEventListener('change', function () {
    data.nameAlignment = this.value;
    fix();
})

document.getElementById('fadeName').addEventListener('change', function () {
    data.fadeName = this.checked;
    fix();
})

document.getElementById('fadeNameLength').addEventListener('change', function () {
    data.fadeNameLength = Math.max(0, Number(this.value) || 0);
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

document.getElementById('leftDifferenceImagePlacing').addEventListener('change', function () {
    data.differenceStyles.imageLeft = this.value;
    fix();
});

document.getElementById('topDifferenceImagePlacing').addEventListener('change', function () {
    data.differenceStyles.imageTop = this.value;
    fix();
});

document.getElementById('differenceImageSize').addEventListener('change', function () {
    data.differenceStyles.imageSize = this.value;
    fix();
});

document.getElementById('showDifferences').addEventListener('change', function () {
    data.showDifferences = this.checked;
    fix()
});

document.getElementById('showRankings').addEventListener('change', function () {
    data.showRankings = this.checked;
    fix()
    setupMDMStyles();
});

document.getElementById('showChart').addEventListener('change', function () {
    data.cardStyles.showChart = this.checked;
    if (data.cardStyles.showChart) {
        // Initialize charts when enabled
        fix()
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
        fix()
    }
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
                    if (data.debugMode) console.warn('Error updating chart color for channel ' + channelId + ':', e);
                }
            }
        });
    }
});

document.getElementById('rankingsWidth').addEventListener('change', function () {
    data.rankingsWidth = this.value;
    fix()
});
document.getElementById('showNames').addEventListener('change', function () {
    data.showNames = this.checked;
    fix()
});
document.getElementById('showImages').addEventListener('change', function () {
    data.showImages = this.checked;
    fix()
    setupMDMStyles();
});
document.getElementById('showCounts').addEventListener('change', function () {
    data.showCounts = this.checked;
    fix()
});

document.getElementById('fireObservedGains').addEventListener('change', function () {
    data.fireIcons.fireObservedGains = this.checked;  
    fix();
})

document.getElementById('estimateUsingObservedGains').addEventListener('change', function () {
    data.differenceStyles.estimateUsingObservedGains = this.checked;  
    fix();
})

document.getElementById('alignDifferences').addEventListener('change', function () {
    data.differenceStyles.alignDifferences = this.value;
    fix();
})

document.getElementById('editorShowsExactCount').addEventListener('click', function () {
    data.editorShowsExactCount = this.checked;
    refresh();
})

document.getElementById('useOdometerColors').addEventListener('click', function () {
    data.useOdometerColors = this.checked;
    fix();
})

document.getElementById('maxChartValues').addEventListener('change', function () {
    let value = parseInt(this.value);
    if (!isFinite(value)) value = 50;
    value = Math.max(2, Math.min(value, 50));
    data.maxChartValues = value;
    fix();
})

document.getElementById('numberFormat').addEventListener('change', function () {
    data.numberFormat = this.value;
    updateAddHourlyEstimates();
    updateEditHourlyEstimates();
    updateOdo();
})

document.getElementById('animationType').addEventListener('change', function () {
    data.animationType = this.value;
    updateOdo();
})

document.getElementById('showScrollbars').addEventListener('click', function () {
    data.showScrollbars = this.checked;
    updateScrollbars();
})

function fix() {
    document.getElementById('main').style.height = data.cardStyles.containerHeight + "vh";
    document.getElementById('main').style.width = data.cardStyles.containerWidth + "vw";
    if (data.audits) {
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

    document.getElementById('reverseAnimation').checked = data.reverseAnimation;
    document.getElementById('allowNegative').checked = data.allowNegative;
    document.getElementById('animatedCardChanges').checked = data.animatedCards.enabled;
    document.getElementById('randomCountUpdateTime').checked = data.randomCountUpdateTime;
    document.getElementById('waterFallCountUpdateTime').checked = data.waterFallCountUpdateTime;
    document.getElementById('fastest').checked = data.fastest;
    document.getElementById('slowest').checked = data.slowest;
    document.getElementById('abbreviate').checked = data.abbreviate;
    document.getElementById('offline').checked = data.offlineGains;
    document.getElementById('autosave').checked = data.autosave;

    if (data.autosave) {
        clearInterval(saveInterval);
        saveInBrowser(COUNTER_THEME, false);
        saveInterval = setInterval(async () => { await saveInBrowser(COUNTER_THEME, false) }, 15000);
    }

    document.getElementById('showRankings').checked = data.showRankings;

    document.querySelectorAll('.num').forEach(function (card) {
        card.style.display = data.showRankings ? "" : "none";
    })

    document.getElementById('showChart').checked = data.cardStyles.showChart;

    if (data.cardStyles.showChart) {
        document.querySelectorAll('.chart').forEach(function (card) {
            card.style.display = "block";
        })
        // Initialize charts if Highcharts is available
        if (typeof Highcharts !== 'undefined') {
            setTimeout(initializeCharts, 200);
        }
    } else {
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

    document.getElementById('showBlankSlots').checked = data.showBlankSlots;
    document.getElementById('hideBlanks').innerText = data.showBlankSlots ? '' : '#card_ * {display: none;}';

    document.getElementById('verticallyCenterRanks').checked = data.verticallyCenterRanks;
    document.getElementById("centerRanks").innerText = data.verticallyCenterRanks ? ".num { align-items: center; display: flex; };" : "";
    document.getElementById('showDifferences').checked = data.showDifferences;
    document.getElementById('hideDifferences').innerText = data.showDifferences ? '' : '.subgap, .gapimg {display: none;}';


    document.getElementById('leftDifferencePlacing').value = data.differenceStyles.left;
    document.getElementById('topDifferencePlacing').value = data.differenceStyles.top;
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

    document.getElementById('leftDifferenceImagePlacing').value = data.differenceStyles.imageLeft;
    document.getElementById('topDifferenceImagePlacing').value = data.differenceStyles.imageTop;
    document.getElementById('differenceImageSize').value = data.differenceStyles.imageSize;
    document.getElementById('estimateUsingObservedGains').checked = data.differenceStyles.estimateUsingObservedGains;
    document.getElementById('fireObservedGains').checked = data.fireIcons.fireObservedGains;
    document.getElementById('alignDifferences').value = data.differenceStyles.alignDifferences;

    let gapAlignment = `left: ${data.differenceStyles.left}%;`;
    switch (data.differenceStyles.alignDifferences) {
        case 'right':
            document.getElementById('differenceAlignmentDirection').innerText = ', right';
            document.getElementById('differenceAlignmentTooltip').setAttribute("title", 
                "The position of the difference counter, in percent of card height and width offset from the top right corner of the card.");
            document.getElementById('differenceAlignmentComma').style.display = '';
            document.getElementById('leftDifferencePlacing').style.display = '';
            gapAlignment = `right: ${data.differenceStyles.left}%;`;
            break;
        case 'center':
            document.getElementById('differenceAlignmentDirection').innerText = '';
            document.getElementById('differenceAlignmentTooltip').setAttribute("title", 
                "The position of the difference counter, in percent of card height offset from the top of the card.");
            document.getElementById('differenceAlignmentComma').style.display = 'none';
            document.getElementById('leftDifferencePlacing').style.display = 'none';
            gapAlignment = `left: 50%;\ntransform: translateX(-50%);`;
            break;
        default:
            document.getElementById('differenceAlignmentDirection').innerText = ', left';
            document.getElementById('differenceAlignmentTooltip').setAttribute("title", 
                "The position of the difference counter, in percent of card height and width offset from the top left corner of the card.");
            document.getElementById('differenceAlignmentComma').style.display = '';
            document.getElementById('leftDifferencePlacing').style.display = '';
    }

    document.getElementById('differenceStyling').innerText = `
        .subgap {
            top: ${data.differenceStyles.top}%;
            z-index: 100;
            position: absolute;
            float: none;
            ${gapAlignment}
            font-size: ${data.differenceStyles.differenceSize}vw;
            visibility: hidden;
        }

        .gapimg {
            height: ${data.differenceStyles.imageSize}px;
            left: ${data.differenceStyles.imageLeft}%;
            top: ${data.differenceStyles.imageTop}%;
            visibility: hidden;
        }

        .difference_line {
            left: -${data.boxSpacing / 2}vw;
            background-color: ${data.differenceStyles.lineColor};
            ${data.differenceStyles.lineEnabled ? "" : "display: none"};
            width: calc(100% + ${data.boxSpacing}vw);
            visibility: hidden;
        }
            
        .subgap .text {
            display: ${data.differenceStyles.abbDifferences ? 'block' : 'none'};
        }

        .subgap .odometer {
            display: ${data.differenceStyles.abbDifferences ? 'none' : 'block'};
        }
        
        `;

    document.getElementById('cardStyles').innerText = `
            .main .name {
                font-size: ${data.cardStyles.nameSize}vw;
                line-height: ${data.cardStyles.nameSize * 1.15}vw;
                max-width: ${data.cardStyles.nameWidth}vw;
            }
            .main .count {
                font-size: ${data.cardStyles.countSize}vw;
            }
            .main .image {
                height: ${data.cardStyles.imageSize}vw;
                width: ${data.cardStyles.imageSize}vw;
            }
            .card {
                height: ${data.cardStyles.cardHeight}vw;
                width: ${data.cardStyles.cardWidth}vw;
            }
        `

    document.getElementById('prependZeros').checked = data.prependZeros;
    if (data.prependZeros) {
        let index = 1;
        document.querySelectorAll('.num').forEach(function (card) {
            if (index < 10) {
                card.firstChild.innerText = formatRank(index);
            }
            index++;
        })
    } else {
        let index = 1;
        document.querySelectorAll('.num').forEach(function (card) {
            card.firstChild.innerText = index
            index++;
        })
    }

    document.getElementById('showNames').checked = data.showNames;
    document.querySelectorAll('.name').forEach(function (card) {
        card.style.display = data.showNames ? "" : "none";
    })

    document.getElementById('showImages').checked = data.showImages;
    document.querySelectorAll('.image').forEach(function (card) {
        card.style.display = data.showImages ? "" : "none";
    })
    
    document.getElementById('showCounts').checked = data.showCounts;
    document.querySelectorAll('.count').forEach(function (card) {
        card.style.display = data.showCounts ? "" : "none";
    })

    document.querySelectorAll('.card').forEach(function (card) {
        card.style.backgroundColor = data.boxColor;
        if (!card.className.split(' ').includes('selected')) {
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
    if (data.bgColor.startsWith('http') || data.bgColor.startsWith('data:')) {
        document.getElementById('backPickerUrl').value = (data.bgColor);
    } else {
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
    document.getElementById('animatedCardChangesDuration').value = data.animatedCards.duration / 1000;
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
    document.getElementById('nameAlignment').value = data.nameAlignment || 'left';
    document.getElementById('fadeName').checked = !!data.fadeName;
    document.getElementById('fadeNameLength').value = data.fadeNameLength ?? 30;
    document.getElementById('useOdometerColors').checked = data.useOdometerColors;
    document.getElementById('maxChartValues').value = data.maxChartValues || 50;
    document.getElementById('numberFormat').value = data.numberFormat;
    document.getElementById('animationType').value = data.animationType;

    const subCounters = document.getElementById('main').getElementsByClassName("count");
    for (const subCounter of subCounters) {
        subCounter.style.textAlign = data.counterAlignment;
    }

    const nameEls = document.querySelectorAll('.name');
    for (const nameEl of nameEls) {
        nameEl.style.textAlign = data.nameAlignment || 'left';
        nameEl.classList.toggle('fade-name', !!data.fadeName);

        if (!data.fadeName) {
            nameEl.style.webkitMaskImage = '';
            nameEl.style.maskImage = '';
            continue;
        }

        const align = data.nameAlignment || 'left';
        const fadeSize = `${Math.max(0, Number(data.fadeNameLength) || 0)}px`;
        let gradient = `linear-gradient(to right, rgba(0,0,0,1) 0, rgba(0,0,0,1) calc(100% - ${fadeSize}), rgba(0,0,0,0) 100%)`;

        if (align === 'right') {
            gradient = `linear-gradient(to right, rgba(0,0,0,0) 0, rgba(0,0,0,1) ${fadeSize}, rgba(0,0,0,1) 100%)`;
        } else if (align === 'center') {
            gradient = `linear-gradient(to right, rgba(0,0,0,0) 0, rgba(0,0,0,1) 12%, rgba(0,0,0,1) 50%, rgba(0,0,0,1) 88%, rgba(0,0,0,0) 100%)`;
        }

        nameEl.style.webkitMaskImage = gradient;
        nameEl.style.maskImage = gradient;
    }

    document.getElementById('header').style.fontFamily = data.headerFont || "Arial";
    const footerEl = document.getElementById('footer');
    if (footerEl) footerEl.style.fontFamily = data.headerFont || "Arial";
    document.getElementById('main').style.fontFamily = data.mainFont || "Roboto";

    const counters = document.getElementById('main').getElementsByClassName('count');
    for (const counter of counters) {
        if (data.useOdometerColors) {
            counter.classList.remove('no_color_transition');
        } else if (!counter.classList.contains('no_color_transition')) {
            counter.classList.add('no_color_transition');
        }
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
    document.getElementById('debugMode').checked = !!data.debugMode;
    document.getElementById('showScrollbars').checked = !!data.showScrollbars;
    updateScrollbars();

    document.querySelectorAll(".partial-export-option").forEach(x => {
        const part = x.getAttribute("partial-export");
        x.checked = data.partialExports[part];
    })

    if (data.updateInterval) {
        document.getElementById('updateint').value = (data.updateInterval / 1000).toString()
    }
    let odometerStyles = document.getElementById('odometerStyles')
    odometerStyles.innerText = '';
    odometerStyles.innerText += `

    .main .count {
        font-weight: ${data.counterFontWeight};
    }

    .main .odometer.odometer-auto-theme.odometer-counting-up.odometer-animating .odometer-ribbon-inner,
    .main .odometer.odometer-theme-default.odometer-counting-up.odometer-animating .odometer-ribbon-inner {
        animation: ${data.odometerSpeed}s linear up;
        animation-iteration-count: 1;
    }

    .main .odometer.odometer-auto-theme.odometer-counting-down.odometer-animating .odometer-ribbon-inner,
    .main .odometer.odometer-theme-default.odometer-counting-down.odometer-animating .odometer-ribbon-inner {
        animation: ${data.odometerSpeed}s linear down;
        animation-iteration-count: 1;
    }

    .no_color_transition .odometer-ribbon-inner {
        animation: none !important;
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

async function connect() {
    if (window.location.href.includes('?code=')) {
        window.location.href = window.location.href.split('?code=')[0];
    } else {
        if (!data.streamerMode) toggleStreamerMode();
        await saveInBrowser(COUNTER_THEME, false)
        window.location.href = window.location.href + "?code=" + code;
    }
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
                        if (!hasID) {
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
                            if (json.events[i].rates) {
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
                    .then(async json => {
                        if (json == "done") {
                            await saveInBrowser(COUNTER_THEME, false)
                            if (obsMode) localStorage.setItem('obs-' + COUNTER_THEME, '1');
                            location.reload();
                        }
                    })
            }
        });
}

document.getElementById('autosave').addEventListener('change', async function () {
    if (document.getElementById('autosave').checked) {
        clearInterval(saveInterval);
        await saveInBrowser(COUNTER_THEME, false)
        saveInterval = setInterval(async () => { await saveInBrowser(COUNTER_THEME, false) }, 15000);
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

        const result = '$(urlfetch ' + apiurl + '' + code + '/$(userid)?values=' + min + ',' + max + returnText + ')'
        navigator.clipboard.writeText(result);
        alert("Copied command to clipboard!")
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

        const result = '$(urlfetch ' + apiurl + '' + code + '/$(userid)?values=' + min + ',' + max + returnText + ')&rates=true';
        navigator.clipboard.writeText(result);
        alert("Copied command to clipboard!")
    } else {
        alert("Please enter type (1 or 2)");
        return;
    }
}

document.getElementById('reverseAnimation').addEventListener('click', function () {
    data.reverseAnimation = this.checked;
    updateOdo();
})

document.querySelectorAll(".partial-export-option").forEach(x => {
    const part = x.getAttribute("partial-export");
    x.addEventListener('click', function () {
        data.partialExports[part] = x.checked;
    })
})

document.getElementById('abbreviate').addEventListener('click', function () {
    data.abbreviate = document.getElementById('abbreviate').checked;
})

document.getElementById('theme').addEventListener('change', function () {
    // Store previous theme before changing
    const previousTheme = data.theme;
    data.theme = document.getElementById('theme').value;
    themeChanger(previousTheme);
})

function themeChanger(previousTheme) {
    if (confirm('Are you sure you want to change the theme?')) {
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
    data.fastest = this.checked;
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
    data.slowest = this.checked;
})

document.getElementById('offline').checked = data.offlineGains;

document.getElementById('offline').addEventListener('click', function () {
    data.offlineGains = this.checked;
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
    updateOdo();
    fix();
})

document.getElementById('animatedCardChangesDuration').addEventListener('change', async function () {
    if (confirm('This will refresh the page.')) {
        data.animatedCards.duration = document.getElementById('animatedCardChangesDuration').value * 1000;
        await saveInBrowser(COUNTER_THEME, false)
        if (obsMode) localStorage.setItem('obs-' + COUNTER_THEME, '1');
        location.reload();
    }
})

function pause() {
    if (!data.pause) {
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
            image: DEFAULT_AVATAR,
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
    if (!data.audits) {
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
        if (!data.apiUpdates.enabled) {
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

    // Limit API requests to 90,000 per hour
    // (thanks Dapohca for your API tracked top 10,000 insta crasher lol)
    // Enough for an entire Top 50 to update once every 2s
    const HOURLY_REQUEST_LIMIT = 90000;
    const hourlyRequests = groups.length * 3.6e6 / data.apiUpdates.interval;
    const probability = HOURLY_REQUEST_LIMIT / hourlyRequests;

    // Build and fetch URLs
    for (let i = 0; i < groups.length; i++) {
        let newUrl = url.includes('{{channels}}')
            ? url.replace('{{channels}}', groups[i])
            : url + groups[i];

        // Spread the requests out evenly throughout the update interval so they don't all come at once
        const throttleTime = (i / groups.length) * data.apiUpdates.interval;

        // Randomly skip some API requests if it goes over the limit
        if (probability >= 1 || Math.random() < probability) {
            setTimeout(() => {fetchNext(newUrl)}, throttleTime);
        }
    }

    function fetchNext(url) {
        if (data.apiUpdates.method == 'GET') {
            if (Object.keys(data.apiUpdates.headers).filter(x => x).length) {
                fetch(url, {
                    method: data.apiUpdates.method,
                    headers: data.apiUpdates.headers,
                }).then(response => response.json())
                    .then(json => { doStuff(json) })
                    .catch(() => { });
            } else {
                fetch(url, {
                    method: data.apiUpdates.method
                }).then(response => response.json())
                    .then(json => { doStuff(json) })
                    .catch(() => { });
            }
        } else {
            fetch(url, {
                method: data.apiUpdates.method,
                headers: data.apiUpdates.headers,
                body: JSON.stringify(data.apiUpdates.body)
            }).then(response => response.json())
                .then(json => { doStuff(json) })
                .catch(() => { });
        }
    }

    function doStuff(json) {
        if (!json) return;
        let channels = json;
        if (data.apiUpdates.response.loop !== 'data') {
            channels = channels[data.apiUpdates.response.loop.split('data.')[1]];
        }
        if (!Array.isArray(channels)) {
            channels = [channels];
        }

        for (let i = 0; i < channels.length; i++) {
            let nameUpdate, countUpdate, imageUpdate, idUpdate;

            if (data.apiUpdates.response.name.enabled) {
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
                    result = result[propName];
                }
                nameUpdate = result;

            }

            if (data.apiUpdates.response.count.enabled) {
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

            if (data.apiUpdates.response.image.enabled) {
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
                if (data.apiUpdates.response.id.IDIncludes) {
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
    if (!data.apiUpdates.enabled) {
        data.apiUpdates.enabled = true
        document.getElementById('enableApiUpdate').innerText = "Disable API Updates"
        data.apiUpdates.interval = clamp(data.apiUpdates.interval, 1000, 2147483647);
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
    data.apiUpdates.customAPIList = document.getElementById('customAPIList').value ? document.getElementById('customAPIList').value.split(',') : [];
    data.apiUpdates.method = document.getElementById('apiMethod').value;
    data.apiUpdates.forceUpdates = document.getElementById('forceUpdates').checked;

    let headers = document.getElementById('extraCred').value.toString().split(';').filter(x => x.trim());
    let newHeaders = {};
    for (let i = 0; i < headers.length; i++) {
        let header = headers[i].split(':').map(x => x.trim());
        if (header[1]) {
            newHeaders[header[0]] = header[1];
        }
    }
    data.apiUpdates.headers = newHeaders;
    
    let body = document.getElementById('body').value.toString().split(';').filter(x => x.trim());
    let newBody = {};
    for (let i = 0; i < body.length; i++) {
        let b = body[i].split(':').map(x => x.trim());
        if (b[1]) {
            newBody[b[0]] = b[1];
        }
    }
    data.apiUpdates.body = newBody;

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
    data.apiUpdates.interval = clamp((parseFloat(document.getElementById('apiUpdateInt').value) * 1000) || 10000, 1000, 2147483647);
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
    document.getElementById('forceUpdates').checked = data.apiUpdates.forceUpdates;
    document.getElementById('enableApiUpdate').innerText = data.apiUpdates.enabled ? 'Disable API Updates' : 'Enable API Updates'
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
    if (pickingChannels) {
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
            document.getElementById('quickSelect').value = '';
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
                document.getElementById('edit_channel_id').innerText = 'ID: '
            }
        } else {
            selected = id;
            document.getElementById('quickSelect').value = selected || '';
            if (document.getElementById('card_' + selected + '')) {
                document.getElementById('card_' + selected + '').classList.add('selected');
                document.getElementById('card_' + selected + '').style.border = "";
                for (let q = 0; q < data.data.length; q++) {
                    if (data.data[q].id == id) {
                        if (isFinite(data.data[q].mean_gain) && isFinite(data.data[q].std_gain)) {
                            document.getElementById('edit_mean_gain').value = data.data[q].mean_gain;
                            document.getElementById('edit_mean_gain_check').checked = true;
                            document.getElementById('edit_std_gain').value = data.data[q].std_gain;
                            document.getElementById('edit_std_gain_check').checked = true;
                            document.getElementById('edit_min_gain').value = "";
                            document.getElementById('edit_min_gain_check').checked = false;
                            document.getElementById('edit_max_gain').value = "";
                            document.getElementById('edit_max_gain_check').checked = false;
                        } else {
                            document.getElementById('edit_mean_gain').value = "";
                            document.getElementById('edit_mean_gain_check').checked = false;
                            document.getElementById('edit_std_gain').value = "";
                            document.getElementById('edit_std_gain_check').checked = false;
                            document.getElementById('edit_min_gain').value = data.data[q].min_gain;
                            document.getElementById('edit_min_gain_check').checked = true;
                            document.getElementById('edit_max_gain').value = data.data[q].max_gain;
                            document.getElementById('edit_max_gain_check').checked = true;
                        }
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
    updateEditHourlyEstimates();
}

function refresh() {
    const currentChannel = document.getElementById('quickSelect').value;
    if (!currentChannel) {
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
                if (isFinite(data.data[q].mean_gain) && isFinite(data.data[q].std_gain)) {
                    document.getElementById('edit_mean_gain').value = data.data[q].mean_gain;
                    document.getElementById('edit_mean_gain_check').checked = true;
                    document.getElementById('edit_std_gain').value = data.data[q].std_gain;
                    document.getElementById('edit_std_gain_check').checked = true;
                    document.getElementById('edit_min_gain').value = "";
                    document.getElementById('edit_min_gain_check').checked = false;
                    document.getElementById('edit_max_gain').value = "";
                    document.getElementById('edit_max_gain_check').checked = false;
                } else {
                    document.getElementById('edit_mean_gain').value = "";
                    document.getElementById('edit_mean_gain_check').checked = false;
                    document.getElementById('edit_std_gain').value = "";
                    document.getElementById('edit_std_gain_check').checked = false;
                    document.getElementById('edit_min_gain').value = data.data[q].min_gain;
                    document.getElementById('edit_min_gain_check').checked = true;
                    document.getElementById('edit_max_gain').value = data.data[q].max_gain;
                    document.getElementById('edit_max_gain_check').checked = true;
                }
                document.getElementById('edit_name').value = data.data[q].name;
                document.getElementById('edit_bg_color').value = data.data[q].bg ? data.data[q].bg : '';
                document.getElementById('edit_count').value = data.editorShowsExactCount ? data.data[q].count : getDisplayedCount(data.data[q].count);
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
            'interval': parseFloat(document.getElementById('apiUpdateInt').value) * 1000 || 10000,
            'method': 'GET',
            'body': {},
            'headers': {},
            'maxChannelsPerFetch': 'one',
            'customAPIList': document.getElementById('customAPIList').value ? document.getElementById('customAPIList').value.split(',') : [],
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
            'interval': parseFloat(document.getElementById('apiUpdateInt').value) * 1000 || 10000,
            'method': 'GET',
            'body': {},
            'headers': {},
            'maxChannelsPerFetch': 'one',
            'customAPIList': document.getElementById('customAPIList').value ? document.getElementById('customAPIList').value.split(',') : [],
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

function addFireIcon() {
    if (document.getElementById('fireIconCreate')) {
        document.getElementById('fireIconCreate').remove();
        document.getElementById('fireIconCreateButton').innerText = 'Add Fire Icon';
    } else {
        document.getElementById('fireIconCreateButton').innerText = 'Cancel Adding Fire Icon'
        let div = document.createElement('div');
        div.id = 'fireIconCreate';
        div.innerHTML = `
            <label>Fire icon name:<br><input type="text" class="l-width" id="fireIcon" placeholder="Fire Icon 1"></label>
            <label>Fire icon threshold: </label><input type="number" class="s-width" step="any" id="fireIconThreshold" placeholder="1000"><br>
            <label>Fire icon threshold method: <select class="m-width" id="fireIconMethod" name="fireIconMethod">
                <option value=">=">Greater than (≥)</option>
                <option value="==">Equal to (=)</option>
                <option value="<=">Less than (≤)</option>
                <option value="!=">Not equal to (≠)</option>
            </select></label>
            <label>Fire icon: <input type="text" id="fireIconUrl" placeholder="https://example.com/image.png"><label> or </label><input type="file" id="fireIconFile"></label>
            <label>Rank color: <input type="color" id="fireIconRankColor"></label>
            <label>Rank margin (top, left) in pixels:<br><span class="no-wrap"><input class="s-width" type="number" step="any" id="fireIconRankMargin" placeholder="Default">, 
            <input class="s-width" type="number" step="any" id="fireIconRankMarginLeft" placeholder="Default"></span></label>
            <label>Rank font weight: <select class="s-width" id="fireIconRankFontWeight">
                ${FONT_WEIGHTS}
            </select></label>
            <button onclick="saveFireIcon()">Add</button>
        `
        div.querySelector('option[value="900"]').setAttribute('selected', true);
        document.getElementById('addFireMenu').appendChild(div);
        adjustColors();
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

async function saveFireIcon() {
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
        alert('Fire icons must have unique names!');
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
        fontWeight: document.getElementById('fireIconRankFontWeight').value
    });

    document.getElementById('fireIconCreate').remove();
    document.getElementById('fireIconCreateButton').innerText = 'Add Fire Icon';
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

function loadFireIcons() {
    let div = document.getElementById('fireIcons');
    div.innerHTML = '';
    for (let i = 0; i < data.fireIcons.created.length; i++) {
        let fireIcon = data.fireIcons.created[i];
        if (i != 0) {
            div.innerHTML += "<hr>";
        }

        const iconDiv = document.createElement('div');
        iconDiv.className = 'effect-menu-div';

        const iconInnerDiv1 = document.createElement('div');
        iconInnerDiv1.className = 'effect-menu-div-inner-1';

        const iconInnerDiv2 = document.createElement('div');
        iconInnerDiv2.className = 'effect-menu-div-inner-2';
        const iconImage = document.createElement('img');
        iconImage.className = 'fireIcon';
        iconImage.src = fireIcon.icon;
        iconInnerDiv2.append(iconImage);

        const nameLabel = document.createElement('label');
        nameLabel.innerText = 'Name:';
        const nameInput = document.createElement('input');
        nameInput.className = 'm-width';
        nameInput.placeholder = 'Name';
        nameInput.setAttribute('value', fireIcon.name);
        nameInput.id = `new_fire_name_${i}`;
        nameLabel.append(document.createElement('br'), nameInput);
        
        const conditionLabel = document.createElement('label');
        conditionLabel.innerText = 'Condition:';
        const span1 = document.createElement('span');
        span1.className = 'no-wrap';
        const methodSelect = document.createElement('select');
        methodSelect.className = 's-width';
        methodSelect.id = `new_fire_method_${i}`;
        const cleanComparisonOperators = {
            '>=': '≥',
            '==': '=',
            '<=': '≤',
            '!=': '≠'
        }
        for (x in cleanComparisonOperators) {
            const opt = document.createElement('option');
            opt.value = x;
            if (fireIcon.method == x) {
                opt.setAttribute('selected', true);
            }
            opt.innerText = `Count ${cleanComparisonOperators[x]}`
            methodSelect.append(opt);
        }
        const thresholdInput = document.createElement('input');
        thresholdInput.type = 'number';
        thresholdInput.step = 'any';
        thresholdInput.id = `new_fire_threshold_${i}`;
        thresholdInput.className = 's-width';
        thresholdInput.setAttribute('value', fireIcon.threshold);
        span1.append(methodSelect, thresholdInput, document.createElement('br'));
        conditionLabel.append(document.createElement('br'), span1);

        const rankColorLabel = document.createElement('label');
        rankColorLabel.innerText = 'Rank color: ';
        const rankColorInput = document.createElement('input');
        rankColorInput.type = 'color';
        rankColorInput.id = `new_fire_color_${i}`;
        rankColorInput.className = 's-width';
        rankColorInput.setAttribute('value', fireIcon.color);
        rankColorLabel.append(rankColorInput);

        const rankMarginLabel = document.createElement('label');
        rankMarginLabel.innerText = 'Rank margin (top, left) (px):';
        const span2 = document.createElement('span');
        span2.className = 'no-wrap';
        const rankMarginTopInput = document.createElement('input');
        rankMarginTopInput.type = 'number';
        rankMarginTopInput.step = 'any';
        rankMarginTopInput.id = `new_fire_margin_${i}`;
        rankMarginTopInput.className = 's-width';
        rankMarginTopInput.placeholder = 'Default';
        rankMarginTopInput.setAttribute('value', fireIcon.margin);
        span2.append(rankMarginTopInput);
        span2.innerHTML += ', ';
        const rankMarginLeftInput = document.createElement('input');
        rankMarginLeftInput.type = 'number';
        rankMarginLeftInput.step = 'any';
        rankMarginLeftInput.id = `new_fire_marginLeft_${i}`;
        rankMarginLeftInput.className = 's-width';
        rankMarginLeftInput.placeholder = 'Default';
        rankMarginLeftInput.setAttribute('value', fireIcon.marginLeft);
        span2.append(rankMarginLeftInput);
        rankMarginLabel.append(document.createElement('br'), span2);

        const rankFontWeightLabel = document.createElement('label');
        rankFontWeightLabel.innerText = 'Rank font weight: ';
        const rankFontWeightSelect = document.createElement('select');
        rankFontWeightSelect.className = 'ms-width';
        rankFontWeightSelect.id = `new_fire_font_weight_${i}`;
        const fontWeights = ['Thin', 'Extra Light', 'Light', 'Regular', 'Medium', 'Semibold', 'Bold', 'Extra Bold', 'Black'];
        for (let j = 0; j < 9; j++) {
            const opt = document.createElement('option');
            opt.value = j * 100 + 100;
            if (fireIcon.fontWeight == (j * 100 + 100)) {
                opt.setAttribute('selected', true);
            }
            opt.innerText = fontWeights[j];
            rankFontWeightSelect.append(opt);
        }
        rankFontWeightLabel.append(rankFontWeightSelect);

        iconInnerDiv1.append(iconInnerDiv2, nameLabel, conditionLabel, rankColorLabel, rankMarginLabel, rankFontWeightLabel);
        iconDiv.append(iconInnerDiv1);
        iconDiv.innerHTML += `<br>
        <div class="fire-list-controls">
            <div><button onclick="saveFireEdits(${i})" title="Save"><span class="material-symbols-outlined">save</span></button></div>
            <div><button onclick="deleteFireIcon(${i})" title="Delete" ><span class="material-symbols-outlined">delete</span></button></div>
            <div><button onclick="reOrderFire('up',${i})" title="Move up"><span class="material-symbols-outlined">keyboard_arrow_up</span></button></div>
            <div><button onclick="reOrderFire('down',${i})" title="Move down"><span class="material-symbols-outlined">keyboard_arrow_down</span></button></button></div>
            <div><button onclick="reOrderFire('top',${i})" title="Move to top"><span class="material-symbols-outlined">keyboard_double_arrow_up</span></button></button></div>
            <div><button onclick="reOrderFire('bottom',${i})" title="Move to bottom"><span class="material-symbols-outlined">keyboard_double_arrow_down</span></button></button></div>
        </div>`;

        div.append(iconDiv);
    }
    if (data.fireIcons.created.length == 0) {
        div.innerHTML = '<p>No fire icons created.</p>'
    }
    document.getElementById('fireEnabled').checked = data.fireIcons.enabled || false;
    document.getElementById('fireType').value = data.fireIcons.type || 'gain';
    document.getElementById('firePosition').value = data.fireIcons.firePosition || 'above';
    document.getElementById('fireBorderColor').value = data.fireIcons.fireBorderColor || '#FFF';
    document.getElementById('fireBorderWidth').value = data.fireIcons.fireBorderWidth || 0;
    adjustColors();
}

const deleteFireIcon = (index) => {
    data.fireIcons.created.splice(index, 1);
    loadFireIcons();
}

const saveFireEdits = (index) => {
    const newName = document.getElementById('new_fire_name_' + index).value;
    if (!newName) {
        alert('You must specify a name.');
        document.getElementById('new_fire_name_' + index).value = data.fireIcons.created[index].name;
        return;
    }

    const newThreshold = parseFloat(document.getElementById('new_fire_threshold_' + index).value);
    if (!isFinite(newThreshold)) {
        alert('You must specify a valid threshold.');
        document.getElementById('new_fire_threshold_' + index).value = data.fireIcons.created[index].threshold;
        return;
    }

    let used = false;
    for (let i = 0; i < data.fireIcons.created.length; i++) {
        if (i == index) continue;
        if (data.fireIcons.created[i].name === newName) {
            used = true;
            break;
        }
    }

    if (used) {
        if (document.getElementById('new_fire_name_' + index).value != data.fireIcons.created[index].name) {
            alert('Fire icons must have unique names!');
            document.getElementById('new_fire_name_' + index).value = data.fireIcons.created[index].name;
            return;
        }
    }

    data.fireIcons.created[index] = {
        name: newName,
        threshold: newThreshold,
        icon: data.fireIcons.created[index].icon,
        method: document.getElementById('new_fire_method_' + index).value,
        color: document.getElementById('new_fire_color_' + index).value,
        margin: document.getElementById('new_fire_margin_' + index).value,
        marginLeft: document.getElementById('new_fire_marginLeft_' + index).value,
        fontWeight: document.getElementById('new_fire_font_weight_' + index).value
    };
};

function addDifferenceEffect() {
    if (document.getElementById('differenceEffectCreate')) {
        document.getElementById('differenceEffectCreate').remove();
        document.getElementById('addDifferenceEffectButton').innerText = 'Add Difference Effect';
    } else {
        document.getElementById('addDifferenceEffectButton').innerText = 'Cancel Adding Difference Effect';
        let div = document.createElement('div');
        div.id = 'differenceEffectCreate';
        div.innerHTML = `
            <label>Difference effect name:<br><input type="text" class="l-width" id="diffEffectName" placeholder="Difference"></label>
            <label>Difference threshold: </label><input type="number" class="s-width" step="any" id="diffEffectThreshold" placeholder="1000"><br>
            <label>Difference threshold method: <select class="m-width" id="diffMethod" name="diffMethod">
                <option value="<=">Less than (≤)</option>    
                <option value="==">Equal to (=)</option>
                <option value=">=">Greater than (≥)</option>
                <option value="!=">Not equal to (≠)</option>
                <option value="h<=">Passing in ≤X hrs</option>
                <option value="h>=">Passing in ≥X hrs</option>
            </select></label>
            <label>Difference icon (leave blank for none):<br><input type="text" id="diffIconUrl" placeholder="https://example.com/image.png"><label> or </label><input type="file" id="diffIconFile"></label>
            <label>Difference icon shaking: <input type="checkbox" id="diffShaking"></label>
            <label>Difference color: <input type="color" id="diffColor" value="#008000"></label>
            <label>Channel glow: </label><select class="l-width" id="diffGlow">
                <option value="none">No glow</option>
                <option value="bottom">Bottom glows</option>
                <option value="top">Top glows</option>
                <option value="fasterSet">Faster (set gain) glows</option>
                <option value="slowerSet">Slower (set gain) glows</option>
                <option value="fasterObserved">Faster (observed gain) glows</option>
                <option value="slowerObserved">Slower (observed gain) glows</option>
                <option value="both">Both glow</option>
            </select>
            <label>Channel glow color: <input type="color" id="diffGlowColor" value="#00ff00"></label>
            <label>Show difference when: </label><select class="l-width" id="diffShowWhen">
                <option value="always">Always</option>
                <option value="bottomFasterSet">Bottom faster (set gain)</option>
                <option value="bottomFasterObserved">Bottom faster (observed gain)</option>
                <option value="topFasterSet">Top faster (set gain)</option>
                <option value="topFasterObserved">Top faster (observed gain)</option>
            </select><br><br>
            <button onclick="saveDifferenceEffect()">Add</button>
        `
        document.getElementById('addDifferenceMenu').appendChild(div);
        adjustColors();
    }
}

async function saveDifferenceEffect() {
    let file = document.getElementById('diffIconFile').files[0];
    if (file) {
        file = await getBase64(file);
    } else {
        file = document.getElementById('diffIconUrl').value;
    }

    const name = document.getElementById('diffEffectName').value;
    const threshold = parseFloat(document.getElementById('diffEffectThreshold').value);
    if (!name || !isFinite(threshold)) {
        alert('Please fill out all required fields.');
        return;
    }

    if (!data.differenceStyles.created) {
        data.differenceStyles.created = [];
    }

    if (data.differenceStyles.created.some(i => i.name === name)) {
        alert('Difference effects must have unique names.');
        return;
    }

    data.differenceStyles.created.push({
        name: name,
        threshold: threshold,
        icon: file,
        color: document.getElementById('diffColor').value,
        method: document.getElementById('diffMethod').value,
        iconShaking: document.getElementById('diffShaking').checked,
        glowColor: document.getElementById('diffGlowColor').value,
        glow: document.getElementById('diffGlow').value,
        showWhen: document.getElementById('diffShowWhen').value
    });
    document.getElementById('differenceEffectCreate').remove();
    document.getElementById('addDifferenceEffectButton').innerText = 'Add Difference Effect';
    loadDifferenceEffects();
}

function reOrderDiff(type, index) {
    if (type === 'up' && index > 0) {
        // Swap with the previous item
        [data.differenceStyles.created[index], data.differenceStyles.created[index - 1]] =
            [data.differenceStyles.created[index - 1], data.differenceStyles.created[index]];
    } else if (type === 'down' && index < data.differenceStyles.created.length - 1) {
        // Swap with the next item
        [data.differenceStyles.created[index], data.differenceStyles.created[index + 1]] =
            [data.differenceStyles.created[index + 1], data.differenceStyles.created[index]];
    } else if (type === 'top' && index > 0) {
        // Move to the top
        const item = data.differenceStyles.created.splice(index, 1)[0];
        data.differenceStyles.created.unshift(item);
    } else if (type === 'bottom' && index < data.differenceStyles.created.length - 1) {
        // Move to the bottom
        const item = data.differenceStyles.created.splice(index, 1)[0];
        data.differenceStyles.created.push(item);
    }
    loadDifferenceEffects();
}

function loadDifferenceEffects () {
    let div = document.getElementById('differenceEffects');
    div.innerHTML = '';
    for (let i = 0; i < data.differenceStyles.created.length; i++) {
        let diffEffect = data.differenceStyles.created[i];
        if (i != 0) {
            div.innerHTML += "<hr>";
        }

        const iconDiv = document.createElement('div');
        iconDiv.className = 'effect-menu-div';

        const iconInnerDiv1 = document.createElement('div');
        iconInnerDiv1.className = 'effect-menu-div-inner-1';

        const iconInnerDiv2 = document.createElement('div');
        iconInnerDiv2.className = 'effect-menu-div-inner-2';
        const iconImage = document.createElement('img');
        iconImage.className = 'fireIcon';
        iconImage.src = diffEffect.icon;
        iconInnerDiv2.append(iconImage);

        const nameLabel = document.createElement('label');
        nameLabel.innerText = 'Name:';
        const nameInput = document.createElement('input');
        nameInput.className = 'm-width';
        nameInput.placeholder = 'Name';
        nameInput.setAttribute('value', diffEffect.name);
        nameInput.id = `new_diff_name_${i}`;
        nameLabel.append(document.createElement('br'), nameInput);

        const conditionLabel = document.createElement('label');
        conditionLabel.innerText = 'Condition:';
        const span1 = document.createElement('span');
        span1.className = 'no-wrap';
        const methodSelect = document.createElement('select');
        methodSelect.className = 's-width';
        methodSelect.id = `new_diff_method_${i}`;
        const cleanComparisonOperators = {
            '<=': 'Gap ≤',
            '==': 'Gap =',
            '>=': 'Gap ≥',
            '!=': 'Gap ≠',
            'h<=': 'Hours ≤',
            'h>=': 'Hours ≥'
        }
        for (x in cleanComparisonOperators) {
            const opt = document.createElement('option');
            opt.value = x;
            if (diffEffect.method == x) {
                opt.setAttribute('selected', true);
            }
            opt.innerText = cleanComparisonOperators[x]
            methodSelect.append(opt);
        }
        const thresholdInput = document.createElement('input');
        thresholdInput.type = 'number';
        thresholdInput.step = 'any';
        thresholdInput.id = `new_diff_threshold_${i}`;
        thresholdInput.className = 's-width';
        thresholdInput.setAttribute('value', diffEffect.threshold);
        span1.append(methodSelect, thresholdInput, document.createElement('br'));
        conditionLabel.append(document.createElement('br'), span1);
        
        const shakingLabel = document.createElement('label');
        shakingLabel.innerText = 'Icon shaking: ';
        const shakingCheckbox = document.createElement('input');
        shakingCheckbox.type = 'checkbox';
        shakingCheckbox.id = `new_diff_shaking_${i}`;
        if (diffEffect.iconShaking) shakingCheckbox.setAttribute('checked', true);
        shakingLabel.append(shakingCheckbox);

        const diffColorLabel = document.createElement('label');
        diffColorLabel.innerText = 'Color: ';
        const diffColorInput = document.createElement('input');
        diffColorInput.type = 'color';
        diffColorInput.id = `new_diff_color_${i}`;
        diffColorInput.className = 's-width';
        diffColorInput.setAttribute('value', diffEffect.color);
        diffColorLabel.append(diffColorInput);

        const glowLabel = document.createElement('label');
        glowLabel.innerText = 'Glow:';
        const glowSelect = document.createElement('select');
        glowSelect.id = `new_diff_glow_${i}`;
        const cleanGlowNames = {
            none: 'No glow',
            bottom: 'Bottom glows',
            top: 'Top glows',
            fasterSet: 'Faster (set gain) glows',
            fasterObserved: 'Faster (observed gain) glows',
            slowerSet: 'Slower (set gain) glows',
            slowerObserved: 'Slower (observed gain) glows',
            both: 'Both glow'
        }
        for (x in cleanGlowNames) {
            const opt = document.createElement('option');
            opt.value = x;
            if (diffEffect.glow == x) {
                opt.setAttribute('selected', true);
            }
            opt.innerText = cleanGlowNames[x];
            glowSelect.append(opt);
        }
        glowLabel.append(document.createElement('br'), glowSelect);

        const glowColorLabel = document.createElement('label');
        glowColorLabel.innerText = 'Glow color: ';
        const glowColorInput = document.createElement('input');
        glowColorInput.type = 'color';
        glowColorInput.id = `new_diff_glow_color_${i}`;
        glowColorInput.className = 's-width';
        glowColorInput.setAttribute('value', diffEffect.glowColor);
        glowColorLabel.append(glowColorInput);

        const showWhenLabel = document.createElement('label');
        showWhenLabel.innerText = 'Show when:';
        const showWhenSelect = document.createElement('select');
        showWhenSelect.id = `new_diff_show_when_${i}`;
        showWhenSelect.className = 'l-width';
        const cleanShowWhenNames = {
            always: 'Always',
            bottomFasterSet: 'Bottom faster (set gain)',
            bottomFasterObserved: 'Bottom faster (observed gain)',
            topFasterSet: 'Top faster (set gain)',
            topFasterObserved: 'Top faster (observed gain)'
        }
        for (x in cleanShowWhenNames) {
            const opt = document.createElement('option');
            opt.value = x;
            if (diffEffect.showWhen == x) {
                opt.setAttribute('selected', true);
            }
            opt.innerText = cleanShowWhenNames[x];
            showWhenSelect.append(opt);
        }
        showWhenLabel.append(document.createElement('br'), showWhenSelect);
        
        iconInnerDiv1.append(iconInnerDiv2, nameLabel, conditionLabel, shakingLabel, diffColorLabel, glowLabel, glowColorLabel, showWhenLabel)
        div.append(iconDiv);
        iconDiv.append(iconInnerDiv1);
        iconDiv.innerHTML += `<br>
        <div class="fire-list-controls">
            <div><button onclick="saveDiffEdits(${i})" title="Save"><span class="material-symbols-outlined">save</span></button></div>
            <div><button onclick="deleteDiffEffect(${i})" title="Delete" ><span class="material-symbols-outlined">delete</span></button></div>
            <div><button onclick="reOrderDiff('up',${i})" title="Move up"><span class="material-symbols-outlined">keyboard_arrow_up</span></button></div>
            <div><button onclick="reOrderDiff('down',${i})" title="Move down"><span class="material-symbols-outlined">keyboard_arrow_down</span></button></button></div>
            <div><button onclick="reOrderDiff('top',${i})" title="Move to top"><span class="material-symbols-outlined">keyboard_double_arrow_up</span></button></button></div>
            <div><button onclick="reOrderDiff('bottom',${i})" title="Move to bottom"><span class="material-symbols-outlined">keyboard_double_arrow_down</span></button></button></div>
        </div>`;

        div.append(iconDiv);
    }
    if (!data.differenceStyles.created.length) {
        div.innerHTML = '<p>No difference effects created.</p>';
    }
    adjustColors();
}

function deleteDiffEffect(index) {
    data.differenceStyles.created.splice(index, 1);
    loadDifferenceEffects();
}

function saveDiffEdits(index) {
    const newName = document.getElementById('new_diff_name_' + index).value;
    if (!newName) {
        alert('You must specify a name.');
        document.getElementById('new_diff_name_' + index).value = data.differenceStyles.created[index].name;
        return;
    }

    const newThreshold = parseFloat(document.getElementById('new_diff_threshold_' + index).value);
    if (!isFinite(newThreshold)) {
        alert('You must specify a valid threshold.');
        document.getElementById('new_diff_threshold_' + index).value = data.differenceStyles.created[index].threshold;
        return;
    }

    let used = false;
    for (let i = 0; i < data.differenceStyles.created.length; i++) {
        if (i == index) continue;
        if (data.differenceStyles.created[i].name === newName) {
            used = true;
            break;
        }
    }

    if (used) {
        alert('Difference effects must have unique names!');
        document.getElementById('new_diff_name_' + index).value = data.differenceStyles.created[index].name;
        return;
    }

    data.differenceStyles.created[index] = {
        name: newName,
        threshold: newThreshold,
        icon: data.differenceStyles.created[index].icon,
        color: document.getElementById('new_diff_color_' + index).value,
        method: document.getElementById('new_diff_method_' + index).value,
        iconShaking: document.getElementById('new_diff_shaking_' + index).checked,
        glowColor: document.getElementById('new_diff_glow_color_' + index).value,
        glow: document.getElementById('new_diff_glow_' + index).value,
        showWhen: document.getElementById('new_diff_show_when_' + index).value
    };
}
//     if (data.differenceStyles.created.some(i => i.name === document.getElementBy))
// }

document.getElementById('fireEnabled').addEventListener('click', function () {
    data.fireIcons.enabled = document.getElementById('fireEnabled').checked;
    updateFires();
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

document.getElementById('debugMode').addEventListener('click', function () {
    data.debugMode = document.getElementById('debugMode').checked;
})

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
        let func;
        const item = data.headerSettings.items[i];
        const placement = item.placement || 'header';
        const container = (placement === 'footer' && footerEl) ? footerEl : headerEl;
        // Skip items without valid names
        if (!item || !item.name) {
            continue;
        }
        const div = document.createElement('div');
        div.classList.add('header_child')
        div.id = 'header_' + item.name;

        if ((item.type == 'battle' || item.type == 'user') && item.attributes.odometerColors) {
            if (!document.getElementById('headerStyles_' + item.name)) {
                const elem = document.createElement('style');
                elem.id = 'headerStyles_' + item.name;
                document.head.insertBefore(elem, document.head.lastElementChild);
            }
        } else {
            if (document.getElementById('headerStyles_' + item.name)) {
                document.getElementById('headerStyles_' + item.name).remove();
            }
        }
        if (item.type == 'text') {
            let displayText = replaceHeaderVariables(item.attributes.text || '');
            div.style.color = item.attributes.color;
            div.style.fontSize = item.attributes.size + "px";
            div.style.fontWeight = item.attributes.fontWeight || "400";
            

            // Function to update the displayed text
            const updateDisplayText = () => {
                div.replaceChildren();
                displayText = replaceHeaderVariables(item.attributes.text || '');
                if (item.attributes.scrollTime > 0 && parseFloat(item.attributes.scrollTime) > 0) {
                    const scrollDirection = item.attributes.scrollDirection || 'left';
                    const directionClass = scrollDirection === 'right' ? 'scroll-right' : 'scroll-left';
                    // Duplicate content for seamless scrolling - duplicate multiple times for smooth loop
                    const separator = ' • ';
                    const duplicatedText = `${displayText}${separator}${displayText}${separator}`;
                    
                    const headerScrollingText = document.createElement('div');
                    headerScrollingText.className = `header-scrolling-text ${directionClass}`;
                    const span = document.createElement('span');
                    span.className = 'scroll-content';
                    span.style.animationDuration = `${item.attributes.scrollTime}s`;
                    span.innerText = duplicatedText + duplicatedText;
                    headerScrollingText.append(span);
                    div.append(headerScrollingText);
                } else {
                    const p = document.createElement('p');
                    p.className = 'header-text';
                    p.innerText = displayText;
                    div.append(p);
                }
            };

            // Initial display
            updateDisplayText();

            // Update text with variables periodically if variables are used
            
            if (item.attributes.text && includesAtLeastOneOf(item.attributes.text, '$name', '$hourly', '$count', '$rank', '$repeat', '$abbhourly', '$abbcount')) {
                const updateInterval = (item.attributes.updateInterval || data.updateInterval || 2) * 1000;
                headerIntervals.push(setInterval(updateDisplayText, updateInterval));
            }

            if (item.attributes.valueFrom && item.attributes.valueFrom != 'none') {
                if (item.attributes.updateInterval > 0) {
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
                            array = sourceData.sort((a, b) => getDisplayedCount(a.count) - getDisplayedCount(b.count));
                        }
                        if (item.attributes.sortOrder == 'asc') {
                            array = array.reverse();
                        }
                        array = array.slice(0, item.attributes.length);
                        if (item.attributes.valueFrom == 'counts') {
                            string = array.map(x => {
                                return `${x.name}: ${formatNumber(Math.floor(x.count))}`
                            });
                        } else if (item.attributes.valueFrom == 'gains') {
                            string = array.map(x => {
                                return `${x.name}: ${formatNumber(Math.floor(getGain(x.id)))}`
                            });
                        } else {
                            for (let i = 0; i < array.length; i += 2) {
                                let endComma = ', '
                                if (!array[i + 1] || !array[i + 2]) {
                                    endComma = '';
                                }
                                string += `${array[i].name} vs ${array[i + 1].name}: ${formatNumber(getDisplayedCount(array[i].count) - getDisplayedCount(array[i + 1].count))}${endComma}`
                            }
                        }
                        if (parseFloat(item.attributes.scrollTime) > 0) {
                            const scrollText = string;
                            const scrollDirection = item.attributes.scrollDirection || 'left';
                            const directionClass = scrollDirection === 'right' ? 'scroll-right' : 'scroll-left';
                            // Duplicate content for seamless scrolling
                            const duplicatedText = `${scrollText} • ${scrollText} • `;
                            const headerScrollingText = document.createElement('div');
                            headerScrollingText.className = `header-scrolling-text ${directionClass}`;
                            const span = document.createElement('span');
                            span.className = 'scroll-content';
                            span.style.animationDuration = `${item.attributes.scrollTime}s`;
                            span.innerText = duplicatedText + duplicatedText;
                            headerScrollingText.append(span);
                            div.append(headerScrollingText);
                        } else {
                            const p = document.createElement('p');
                            p.className = 'header-text';
                            p.innerText = string;
                            div.append(p);
                        }
                    }, item.attributes.updateInterval * 1000));
                }
            }
        }
        if (item.type == 'battle') {
            const battleContainer = document.createElement('div');
            battleContainer.className = 'battle-container battle';
            battleContainer.style.backgroundColor = item.attributes.bgColor;
            battleContainer.style.height = item.attributes.boxHeight;
            
            const battleContainerLeft = document.createElement('div');
            battleContainerLeft.className = 'battle_container battle_container_left';
            
            const leftImage = document.createElement('img');
            leftImage.style.float = 'left';
            leftImage.style.borderRadius = item.attributes.roundAvatars ? '50%' : (data.imageBorder + '%');
            leftImage.style.height = leftImage.style.width = item.attributes.imageSize + 'mm';
            leftImage.src = DEFAULT_AVATAR;
            leftImage.id = `battle_image1_${item.name}`;
            const leftBattleInfo = document.createElement('div');
            leftBattleInfo.className = 'battle_info';
            leftBattleInfo.style.fontSize = item.attributes.fontSize + 'px';
            const leftName = document.createElement('p');
            leftName.id = `battle_name1_${item.name}`;
            leftName.className = 'name';
            leftName.style.lineHeight = item.attributes.fontSize * 1.2 + 'px';
            leftName.innerText = ZERO_WIDTH_SPACE;
            const leftCount = document.createElement('p');
            leftCount.id = `battle_count1_${item.name}`;
            leftCount.className = `odometer count ${item.attributes.odometerColors ? "" : "no_color_transition"}`;
            leftCount.innerText = 0;
            leftBattleInfo.append(leftName, leftCount);

            battleContainerLeft.append(leftImage, leftBattleInfo);

            const diffContainer = document.createElement('div');
            diffContainer.style.fontSize = item.attributes.fontSize + 'px';
            if (item.attributes.battleAlign) diffContainer.style.textAlign = 'center';
            const p = document.createElement('p');
            p.innerText = 'Difference';
            const diffCount = document.createElement('p');
            diffCount.className = 'odometer battle_difference count no_color_transition';
            diffCount.id = `battle_difference_${item.name}`;
            diffCount.innerText = 0;
            diffContainer.append(p, diffCount);

            const battleContainerRight = document.createElement('div');
            battleContainerRight.className = 'reverse battle_container battle_container_right';

            const rightBattleInfo = document.createElement('div');
            rightBattleInfo.className = 'battle_info';
            rightBattleInfo.style.fontSize = item.attributes.fontSize + 'px';
            if (item.attributes.battleAlign) rightBattleInfo.style.textAlign = 'right';
            const rightName = document.createElement('p');
            rightName.id = `battle_name2_${item.name}`;
            rightName.className = 'name';
            rightName.style.lineHeight = item.attributes.fontSize * 1.2 + 'px';
            rightName.innerText = ZERO_WIDTH_SPACE;
            const rightCount = document.createElement('p');
            rightCount.id = `battle_count2_${item.name}`;
            rightCount.className = `odometer count ${item.attributes.odometerColors ? "" : "no_color_transition"}`;
            rightCount.innerText = 0;
            rightBattleInfo.append(rightName, rightCount);
            const rightImage = document.createElement('img');
            rightImage.style.float = 'right';
            rightImage.style.borderRadius = item.attributes.roundAvatars ? '50%' : (data.imageBorder + '%');
            rightImage.style.height = rightImage.style.width = item.attributes.imageSize + 'mm';
            rightImage.src = DEFAULT_AVATAR;
            rightImage.id = `battle_image2_${item.name}`;
            
            if (!item.attributes.roundAvatars) {
                battleContainer.style.borderRadius = 0;
                battleContainerLeft.style.borderRadius = 0;
                battleContainerRight.style.borderRadius = 0;
            }
            
            battleContainerRight.append(rightBattleInfo, rightImage);
            battleContainer.append(battleContainerLeft, diffContainer, battleContainerRight);
            div.append(battleContainer);
            div.style.fontWeight = item.attributes.fontWeight || "400";
            div.style.color = item.attributes.color;
            headerIntervals.push(setInterval(func = function () {
                const rankRange = parseMinMax(item.attributes.restrictRanks);

                let user1 = null;
                let user2 = null;
                if (item.attributes.type == 'custom') {
                    user1 = data.data.find(u => u.id == item.attributes.id1);
                    user2 = data.data.find(u => u.id == item.attributes.id2);
                } else {
                    let users = findClosestBattle(item.attributes.ranking || 1, rankRange, item.attributes.threshold, item.attributes.thresholdType, item.attributes.type);
                    user1 = users?.channels[0];
                    user2 = users?.channels[1];
                }

                const rank1 = user1 ? getRankOf(user1.id) : 0
                const rank2 = user2 ? getRankOf(user2.id) : 0
                if (rank1 < rankRange[0] || rank1 > rankRange[1]) user1 = null;
                if (rank2 < rankRange[0] || rank2 > rankRange[1]) user2 = null;

                let left1 = left2 = right1 = right2 = '';
                switch (item.attributes.battleRankPos) {
                    case 'before':
                        left1 = '#' + formatRank(rank1) + ' ';
                        left2 = '#' + formatRank(rank2) + ' ';
                        break;
                    case 'after': 
                        right1 = ' #' + formatRank(rank1);
                        right2 = ' #' + formatRank(rank2);
                        break;
                    case 'outsideName':
                        left1 = '#' + formatRank(rank1) + ' ';
                        right2 = ' #' + formatRank(rank2);
                        break;
                    case 'insideName':
                        right1 = ' #' + formatRank(rank1);
                        left2 = '#' + formatRank(rank2) + ' ';
                        break;
                }

                if (['left', 'right', 'outside', 'inside'].includes(item.attributes.battleRankPos)) {
                    let rankBox1 = div.querySelector('.battle_container_left').querySelector(".num");
                    if (rankBox1 && ((rankBox1.classList.contains("rank_battle_left")
                        && ['right', 'inside'].includes(item.attributes.battleRankPos)) || 
                        (rankBox1.classList.contains('rank_battle_right')
                        && ['left', 'outside'].includes(item.attributes.battleRankPos))
                    )) {
                        rankBox1.remove();
                    }

                    if (!rankBox1) {
                        rankBox1 = document.createElement("div");
                        rankBox1.className = "num";
                        if (['left','outside'].includes(item.attributes.battleRankPos)) {
                            rankBox1.classList.add('rank_battle_left');
                            div.querySelector(".battle_container_left").prepend(rankBox1);
                        } else {
                            rankBox1.classList.add('rank_battle_right');
                            div.querySelector(".battle_container_left").appendChild(rankBox1);
                        }
                    }

                    rankBox1.innerHTML = `
                        <div class="num_text">${rank1}</div>
                    `

                    let rankBox2 = div.querySelector('.battle_container_right').querySelector(".num");
                    if (rankBox2 && ((rankBox2.classList.contains("rank_battle_left")
                        && ['right', 'outside'].includes(item.attributes.battleRankPos)) || 
                        (rankBox2.classList.contains('rank_battle_right')
                        && ['left', 'inside'].includes(item.attributes.battleRankPos))
                    )) {
                        rankBox2.remove();
                    }

                    if (!rankBox2) {
                        rankBox2 = document.createElement("div");
                        rankBox2.className = "num";
                        if (['left','inside'].includes(item.attributes.battleRankPos)) {
                            rankBox2.classList.add('rank_battle_left');
                            div.querySelector(".battle_container_right").prepend(rankBox2);
                        } else {
                            rankBox2.classList.add('rank_battle_right');
                            div.querySelector(".battle_container_right").appendChild(rankBox2);
                        }
                    }

                    rankBox2.innerHTML = `
                        <div class="num_text">${rank2}</div>
                    `

                    applyFire(div.querySelector(".battle_container_left"), rank1 - 1, item.attributes.applyFire);
                    applyFire(div.querySelector(".battle_container_right"), rank2 - 1, item.attributes.applyFire);

                } else {
                    div.querySelectorAll(".num").forEach(x => x.remove());
                    if (data.fireIcons.enabled && item.attributes.applyFire) {
                        const fire1 = user1 ? fires.get(user1.id) : undefined;
                        const fire2 = user2 ? fires.get(user2.id) : undefined;

                        if (fire1 != undefined) {
                            div.querySelector(".battle_container_left").style.backgroundImage = `url("${data.fireIcons.created[fire1].icon}")`
                            div.querySelector(".battle_container_left .battle_info").style.color = data.fireIcons.created[fire1].color;
                            div.querySelector(".battle_container_left .battle_info").style.fontWeight = data.fireIcons.created[fire1].fontWeight;
                        } else {
                            div.querySelector(".battle_container_left").style.backgroundImage = '';
                            div.querySelector(".battle_container_left .battle_info").style.color = '';
                            div.querySelector(".battle_container_left .battle_info").style.fontWeight = '';
                        }
                        if (fire2 != undefined) {
                            div.querySelector(".battle_container_right").style.backgroundImage = `url("${data.fireIcons.created[fire2].icon}")`
                            div.querySelector(".battle_container_right .battle_info").style.color = data.fireIcons.created[fire2].color;
                            div.querySelector(".battle_container_right .battle_info").style.fontWeight = data.fireIcons.created[fire2].fontWeight;
                        } else {
                            div.querySelector(".battle_container_right").style.backgroundImage = '';
                            div.querySelector(".battle_container_right .battle_info").style.color = '';
                            div.querySelector(".battle_container_right .battle_info").style.fontWeight = '';
                        }
                    }
                }

                let count1 = user1 ? getDisplayedCount(user1.count) : 0;
                let count2 = user2 ? getDisplayedCount(user2.count) : 0;

                document.getElementById('battle_name1_' + item.name).innerText = user1 ? (left1 + user1.name + right1) : ZERO_WIDTH_SPACE;
                document.getElementById('battle_count1_' + item.name).innerText = getDisplayedCount(user1 ? user1.count : 0);
                if (user1 && document.getElementById('battle_image1_' + item.name).src !== user1.image) {
                    document.getElementById('battle_image1_' + item.name).src = user1.image;
                } else if (!user1) {
                    document.getElementById('battle_image1_' + item.name).src = DEFAULT_AVATAR;
                }

                document.getElementById('battle_name2_' + item.name).innerText = user2 ? (left2 + user2.name + right2) : ZERO_WIDTH_SPACE;
                document.getElementById('battle_count2_' + item.name).innerText = getDisplayedCount(user2 ? user2.count : 0);
                if (user2 && document.getElementById('battle_image2_' + item.name).src !== user2.image) {
                    document.getElementById('battle_image2_' + item.name).src = user2.image;
                } else if (!user2) {
                    document.getElementById('battle_image2_' + item.name).src = DEFAULT_AVATAR;
                }
                document.getElementById('battle_difference_' + item.name).innerText = Math.floor(count1 - count2);

                if (item.attributes.hideInvalid && (!user1 || !user2)) {
                    div.style.visibility = 'hidden';
                } else {
                    div.style.visibility = 'visible';
                }

                const styles = document.getElementById('headerStyles_' + item.name);
                if (styles) {
                    styles.innerText = `
                        .header_child#${CSS.escape('header_' + item.name)} .odometer.odometer-auto-theme.odometer-counting-up.odometer-animating#battle_count1_${CSS.escape(item.name)} .odometer-ribbon-inner,
                        .header_child#${CSS.escape('header_' + item.name)} .odometer.odometer-theme-default.odometer-counting-up.odometer-animating#battle_count1_${CSS.escape(item.name)} .odometer-ribbon-inner {
                            animation: ${data.odometerSpeed}s linear up1;
                            animation-iteration-count: 1;
                        }

                        .header_child#${CSS.escape('header_' + item.name)} .odometer.odometer-auto-theme.odometer-counting-down.odometer-animating#battle_count1_${CSS.escape(item.name)} .odometer-ribbon-inner,
                        .header_child#${CSS.escape('header_' + item.name)} .odometer.odometer-theme-default.odometer-counting-down.odometer-animating#battle_count1_${CSS.escape(item.name)} .odometer-ribbon-inner {
                            animation: ${data.odometerSpeed}s linear down1;
                            animation-iteration-count: 1;
                        }

                        .header_child#${CSS.escape('header_' + item.name)} .odometer.odometer-auto-theme.odometer-counting-up.odometer-animating#battle_count2_${CSS.escape(item.name)} .odometer-ribbon-inner,
                        .header_child#${CSS.escape('header_' + item.name)} .odometer.odometer-theme-default.odometer-counting-up.odometer-animating#battle_count2_${CSS.escape(item.name)} .odometer-ribbon-inner {
                            animation: ${data.odometerSpeed}s linear up2;
                            animation-iteration-count: 1;
                        }

                        .header_child#${CSS.escape('header_' + item.name)} .odometer.odometer-auto-theme.odometer-counting-down.odometer-animating#battle_count2_${CSS.escape(item.name)} .odometer-ribbon-inner,
                        .header_child#${CSS.escape('header_' + item.name)} .odometer.odometer-theme-default.odometer-counting-down.odometer-animating#battle_count2_${CSS.escape(item.name)} .odometer-ribbon-inner {
                            animation: ${data.odometerSpeed}s linear down2;
                            animation-iteration-count: 1;
                        }

                        @keyframes up1 {
                            0% { color: ${getComputedStyle(div.querySelector(".battle_container_left .count")).color}; }
                            25% { color: ${data.odometerUp}; }
                            75% { color: ${data.odometerUp}; }
                            100%: { color: ${getComputedStyle(div.querySelector(".battle_container_left .count")).color}; }
                        }

                        @keyframes down1 {
                            0% { color: ${getComputedStyle(div.querySelector(".battle_container_left .count")).color}; }
                            25% { color: ${data.odometerDown}; }
                            75% { color: ${data.odometerDown}; }
                            100%: { color: ${getComputedStyle(div.querySelector(".battle_container_left .count")).color}; }
                        }

                        @keyframes up2 {
                            0% { color: ${getComputedStyle(div.querySelector(".battle_container_right .count")).color}; }
                            25% { color: ${data.odometerUp}; }
                            75% { color: ${data.odometerUp}; }
                            100%: { color: ${getComputedStyle(div.querySelector(".battle_container_right .count")).color}; }
                        }

                        @keyframes down2 {
                            0% { color: ${getComputedStyle(div.querySelector(".battle_container_right .count")).color}; }
                            25% { color: ${data.odometerDown}; }
                            75% { color: ${data.odometerDown}; }
                            100%: { color: ${getComputedStyle(div.querySelector(".battle_container_right .count")).color}; }
                        }
                    `;
                }

            }, item.attributes.updateInterval * 1000));
        }
        if (item.type == 'user') {
            const battleContainer = document.createElement('div');
            battleContainer.className = 'battle-container';
            battleContainer.style.backgroundColor = item.attributes.bgColor;
            battleContainer.style.height = item.attributes.boxHeight + 'px';

            const innerBattleContainer = document.createElement('div');
            innerBattleContainer.className = 'battle_container';
            innerBattleContainer.style.maxHeight = item.attributes.boxHeight + 'px';
            if (!item.attributes.roundAvatars) {
                battleContainer.style.borderRadius = 0;
                innerBattleContainer.style.borderRadius = 0;
            }
            const avatar = document.createElement('img');
            avatar.style.float = 'left';
            avatar.style.borderRadius = item.attributes.roundAvatars ? '50%' : (data.imageBorder + '%');
            avatar.style.height = item.attributes.imageSize + 'mm';
            avatar.src = DEFAULT_AVATAR;
            avatar.id = `user_image1_${item.name}`;
            const battleInfo = document.createElement('div');
            battleInfo.className = 'battle_info';
            battleInfo.style.fontSize = item.attributes.fontSize + 'px';
            const name = document.createElement('p');
            name.id = `user_name1_${item.name}`;
            name.className = 'name';
            name.style.lineHeight = item.attributes.fontSize * 1.2 + 'px';
            name.innerText = ZERO_WIDTH_SPACE;
            const count = document.createElement('p');
            count.className = `odometer count ${item.attributes.odometerColors ? "" : "no_color_transition"}`;
            count.id = `user_count1_${item.name}`;
            count.innerText = 0;
            battleInfo.append(name, count);
            innerBattleContainer.append(avatar, battleInfo);
            battleContainer.append(innerBattleContainer);
            div.append(battleContainer);

            div.style.fontWeight = item.attributes.fontWeight || "400";
            div.style.color = item.attributes.color;
            headerIntervals.push(setInterval(func = function () {
                const rankRange = parseMinMax(item.attributes.restrictRanks);

                let user1 = null;
                if (item.attributes.type == 'custom') {
                    user1 = data.data.find(u => u.id == item.attributes.id1);
                } else {
                    user1 = findFastestChannel(item.attributes.ranking || 1, rankRange);
                }

                const rank = user1 ? getRankOf(user1.id) : 0;
                if (rank < rankRange[0] || rank > rankRange[1]) user1 = null;
                let left = '';
                let right = '';
                switch (item.attributes.userRankPos) {
                    case 'before':
                        left = '#' + formatRank(rank) + ' ';
                        break;
                    case 'after':
                        right = ' #' + formatRank(rank);
                        break;
                }

                document.getElementById('user_name1_' + item.name).innerText = user1 ? (left + user1.name + right) : ZERO_WIDTH_SPACE;
                document.getElementById('user_count1_' + item.name).innerText = getDisplayedCount(user1 ? user1.count : 0);
                if (user1 && document.getElementById('user_image1_' + item.name).src !== user1.image) {
                    document.getElementById('user_image1_' + item.name).src = user1.image;
                } else if (!user1) {
                    document.getElementById('user_image1_' + item.name).src = DEFAULT_AVATAR;
                }

                if (!user1 && item.attributes.hideInvalid) {
                    div.style.visibility = 'hidden';
                } else {
                    div.style.visibility = 'visible';
                }

                if (['left', 'right'].includes(item.attributes.userRankPos)) {
                    let rankBox = div.querySelector(".num");
                    if (rankBox && ((rankBox.classList.contains("rank_battle_left") 
                        && item.attributes.userRankPos === 'right') || 
                        (rankBox.classList.contains("rank_battle_right") 
                        && item.attributes.userRankPos === 'left'))) {
                        rankBox.remove();
                        rankBox = null;
                    }

                    if (!rankBox) {
                        rankBox = document.createElement("div");
                        rankBox.className = "num";
                        if (item.attributes.userRankPos === 'left') {
                            rankBox.classList.add('rank_battle_left');
                            div.querySelector(".battle_container").prepend(rankBox);
                        } else {
                            rankBox.classList.add('rank_battle_right');
                            div.querySelector(".battle_container").appendChild(rankBox);
                        }
                    }
                    
                    rankBox.innerHTML = `
                        <div class="num_text">${rank}</div>
                    `

                    applyFire(div, rank - 1, item.attributes.applyFire)
                    
                } else {
                    if (div.querySelector(".num")) {
                        div.querySelector(".num").remove();
                    }

                    if (data.fireIcons.enabled && item.attributes.applyFire) {
                        const fireIcon = user1 ? fires.get(user1.id) : undefined;
                        if (fireIcon != undefined) {
                            div.querySelector(".battle-container").style.backgroundImage = `url(${data.fireIcons.created[fireIcon].icon})`
                            div.querySelector(".battle_info").style.color = data.fireIcons.created[fireIcon].color;
                            div.querySelector(".battle_info").style.fontWeight = data.fireIcons.created[fireIcon].fontWeight;
                        } else {
                            div.querySelector(".battle-container").style.backgroundImage = '';
                            div.querySelector(".battle_info").style.color = '';
                            div.querySelector(".battle_info").style.fontWeight = '';
                        }
                    }
                }

                const styles = document.getElementById('headerStyles_' + item.name);
                if (styles) {
                    styles.innerText = `
                        .header_child#${CSS.escape('header_' + item.name)} .odometer.odometer-auto-theme.odometer-counting-up.odometer-animating .odometer-ribbon-inner,
                        .header_child#${CSS.escape('header_' + item.name)} .odometer.odometer-theme-default.odometer-counting-up.odometer-animating .odometer-ribbon-inner {
                            animation: ${data.odometerSpeed}s linear up1;
                            animation-iteration-count: 1;
                        }

                        .header_child#${CSS.escape('header_' + item.name)} .odometer.odometer-auto-theme.odometer-counting-down.odometer-animating .odometer-ribbon-inner,
                        .header_child#${CSS.escape('header_' + item.name)} .odometer.odometer-theme-default.odometer-counting-down.odometer-animating .odometer-ribbon-inner {
                            animation: ${data.odometerSpeed}s linear down1;
                            animation-iteration-count: 1;
                        }

                        @keyframes up1 {
                            0% { color: ${getComputedStyle(div.querySelector(".count")).color}; }
                            25% { color: ${data.odometerUp}; }
                            75% { color: ${data.odometerUp}; }
                            100%: { color: ${getComputedStyle(div.querySelector(".count")).color}; }
                        }

                        @keyframes down1 {
                            0% { color: ${getComputedStyle(div.querySelector(".count")).color}; }
                            25% { color: ${data.odometerDown}; }
                            75% { color: ${data.odometerDown}; }
                            100%: { color: ${getComputedStyle(div.querySelector(".count")).color}; }
                        }

                    `;
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

        if (func) {
            func();
        }
    }
    if (footerEl) {
        footerEl.style.fontFamily = data.headerFont || "Arial";
    }
    updateOdo()
}

function findClosestBattle(index, rankRange, threshold, thresholdType, type) {
    const toConsider = [...data.data]
        .slice(rankRange[0] - 1, rankRange[1])
        .sort((a, b) => { getDisplayedCount(b.count) - getDisplayedCount(a.count)});
    let pairs = [];
    for (let i = 0; i < toConsider.length - 1; i++) {
        pairs.push({
            diff: Math.abs(getDisplayedCount(toConsider[i].count) - getDisplayedCount(toConsider[i + 1].count)),
            channels: [toConsider[i], toConsider[i + 1]],
            time: estimatePassingTime(toConsider[i], toConsider[i+1])
        });
    }
    if ((!thresholdType || thresholdType === 'count') && threshold != null) pairs = pairs.filter(x => x.diff <= threshold);
    if (thresholdType === 'hours' && threshold != null) {
        pairs = pairs.filter(x => {
            const hours = x.time / 3.6e6 * data.updateInterval;
            return hours >= 0 && hours <= threshold;
        })
    }
    if (type === 'fastest') {
        pairs = pairs.filter(x => x.time >= 0);
        pairs.sort((a, b) => a.time - b.time);
    } else {
        pairs.sort((a, b) => a.diff - b.diff);
    } 
    return pairs[index - 1];
}

function findFastestChannel(index, rankRange) {
    const toConsider = [...data.data].slice(rankRange[0] - 1, rankRange[1]);
    let toReturn = toConsider.sort((a, b) => getGain(b.id) - getGain(a.id));
    return toReturn[index - 1];
}

async function saveTopSettings(shouldAlert = true) {
    let items = [];
    const valid = Array.from(document.querySelector("#sections").children)
        .every(x => isValidHeaderName(x.querySelector(".section_option_name")?.value));
    
    if (!valid) {
        return alert("Section names cannot be empty and cannot contain any of the following characters < > ' \" \\ &");
    }

    if (hasDuplicates(Array.from(document.querySelector("#sections").children).map(x => x.querySelector(".section_option_name")?.value))) {
        return alert("Section names must be unique.")
    }

    Array.from(document.querySelector("#sections").children).forEach(parent => {
        const secID = parent.querySelector(".section_option_name").value;
        let item = {
            "attributes": data.headerSettings.items.find(x => x.name === secID)?.attributes || {}
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
                            item['attributes'][attrName] = child.value ? parseInt(child.value) : (child.classList.contains("optional") ? null : 0);
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
        items.push(item);
        
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
    await saveInBrowser(COUNTER_THEME, shouldAlert)
    if (shouldAlert) loadTopSettings()
    loadHeader()
}

async function loadTopSettings(itemName, itemType) {
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

    data.headerSettings.items.forEach(item => {
        if (item.name == itemName) {
            item.type = itemType;
        }

        let div = document.createElement("div");
        div.className = "headerItem";
        div.id = `headerItem_${item.name}`;


        function fixUserSettings(value) {
            const userID = div.querySelector(".header_option_user_id");
            if (userID) {
                userID.style.display = value === "custom" ? "" : "none";
            }

            const nthFastest = div.querySelector(".header_option_nth_fastest");
            if (nthFastest) {
                nthFastest.style.display = value === "custom" ? "none" : "";
            }
        }

        function fixHeaderSettings() {
            const userType = div.querySelector(".header_option_user_type");
            if (userType) {
                userType.addEventListener('change', () => {fixUserSettings(userType.value)});
                fixUserSettings(userType.value);
            }
        }

        function setSelect(elem, val) {
            elem.querySelectorAll('option').forEach(x => {
                if (val == x.value) {
                    x.setAttribute('selected', true);
                }
            });
        }

        function setValue(elem, val) {
            elem.querySelector('input').setAttribute('value', val);
        }

        function setChecked(elem, val) {
            if (val) {
                elem.querySelector('input').setAttribute('checked', true);
            }
        }

        function createTextSettings() {
            const result = document.createElement('div');

            const basicSettingsContainer = document.createElement('div');
            basicSettingsContainer.className = 'section-basic-options';
            const basicSettingsContainerInner = document.createElement('div');
            basicSettingsContainerInner.style.gridColumn = '1 / -1';
            basicSettingsContainerInner.innerHTML = `<label><strong>Text content:</strong></label>
            <textarea rows="3" class="section_attribute_text header_option"
                placeholder="Enter text here. Use variables like $name1 or $name(1), $hourly1 or $hourly(1), $count1 or $count(1), or $repeat(1-50, $name, hi, $rank)"></textarea>
            <p class="option-small-text">
                <strong>Variables:</strong> $name(rank), $hourly(rank), $count(rank), $abbhourly(rank), $abbcount(rank), $rank<br>
                <strong>Repeat:</strong> $repeat(start-end, part1, part2, ...) - Repeats template for each rank in range<br>
                <strong>Example:</strong> "$name(1) gains $hourly(1) per hour" or "$repeat(1-10, $rank. $name - $count)"
            </p>`
            basicSettingsContainerInner.querySelector('textarea').innerText = item.attributes.text || '';
            const basicSettingsHOG = document.createElement('div');
            basicSettingsHOG.className = 'header-option-group';
            const textColorSetting = document.createElement('div');
            textColorSetting.innerHTML = `<label><strong>Text color:</strong></label>
            <input type="color" class="section_attribute_color header_option"/>`
            setValue(textColorSetting, item.attributes.color || '#ffffff');
            const fontSizeSetting = document.createElement('div');
            fontSizeSetting.innerHTML = `<label><strong>Font size:</strong></label>
            <input type="number" class="section_attribute_size header_option xs-width" placeholder="20"/>`;
            setValue(fontSizeSetting, item.attributes.size || '20');
            basicSettingsHOG.append(textColorSetting,fontSizeSetting);
            basicSettingsContainer.append(basicSettingsContainerInner, basicSettingsHOG);

            const advancedSettingsContainer = document.createElement('details');
            advancedSettingsContainer.className = 'section-advanced-options';
            advancedSettingsContainer.innerHTML = '<summary><strong>Advanced Options (click to toggle)</strong></summary>';
            
            const advancedSettingsHOG1 = document.createElement('div');
            advancedSettingsHOG1.className = 'header-option-group';
            advancedSettingsHOG1.style.marginTop = '10px';
            const fontWeightSetting = document.createElement('div');
            fontWeightSetting.innerHTML = `<label>Font weight:</label>
            <select class="section_attribute_fontWeight header_option ms-width">
                ${FONT_WEIGHTS}
            </select>`;
            setSelect(fontWeightSetting, item.attributes.fontWeight || "400");
            const autoScrollSetting = document.createElement('div');
            autoScrollSetting.innerHTML = `<label>Auto-scroll duration (seconds) (0 = disabled):</label>
            <input type="number" class="section_attribute_scrollTime header_option xs-width" /><br>`;
            setValue(autoScrollSetting, item.attributes.scrollTime || 0);
            const scrollDirectionSetting = document.createElement('div');
            scrollDirectionSetting.innerHTML = `<label>Scroll direction:</label>
            <select class="section_attribute_scrollDirection header_option s-width">
                <option value="left">Left</option>
                <option value="right">Right</option>
            </select>`;
            setSelect(scrollDirectionSetting, item.attributes.scrollDirection);
            advancedSettingsHOG1.append(fontWeightSetting, autoScrollSetting, scrollDirectionSetting);

            const advancedSettingsHOG2 = document.createElement('div');
            advancedSettingsHOG2.className = 'header-option-group';
            const listLengthSetting = document.createElement('div');
            listLengthSetting.innerHTML = `<label>List length:</label>
            <input type="number" class="section_attribute_length header_option xs-width"/><br>`;
            setValue(listLengthSetting, item.attributes.length || 0);
            const sortOrderSetting = document.createElement('div');
            sortOrderSetting.innerHTML = `<label>Sort order:</label>
            <select class="section_attribute_sortOrder header_option ms-width">
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
            </select>`
            setSelect(sortOrderSetting, item.attributes.sortOrder);
            const updateIntervalSetting = document.createElement('div');
            updateIntervalSetting.innerHTML = `<label>Update interval (seconds):</label>
            <input type="number" class="section_attribute_updateInterval header_option xs-width"/>`;
            setValue(updateIntervalSetting, item.attributes.updateInterval || 2);
            advancedSettingsHOG2.append(listLengthSetting, sortOrderSetting, updateIntervalSetting);
            
            advancedSettingsContainer.append(advancedSettingsHOG1, advancedSettingsHOG2);
            result.append(basicSettingsContainer, advancedSettingsContainer);
            return result;
        }

        function createBattleAndUserStyling() {
            const advancedSettingsHOG1 = document.createElement('div');
            advancedSettingsHOG1.style.marginTop = '10px';
            advancedSettingsHOG1.className = 'header-option-group';
            const backgroundColorSetting = document.createElement('div');
            backgroundColorSetting.innerHTML = `<label>Background color:</label>
            <input type="color" class="section_attribute_bgColor header_option"/>`;
            setValue(backgroundColorSetting, item.attributes.bgColor || '#000000');
            const textColorSetting = document.createElement('div');
            textColorSetting.innerHTML = `<label>Text color:</label>
            <input type="color" class="section_attribute_color header_option"/>`;
            setValue(textColorSetting, item.attributes.color || '#ffffff');
            const heightSetting = document.createElement('div');
            heightSetting.innerHTML = `<label>Height:</label>
            <input type="number" class="section_attribute_boxHeight header_option xs-width"/>`;
            setValue(heightSetting, fixNum(item.attributes.boxHeight, 60));
            const imageSizeSetting = document.createElement('div');
            imageSizeSetting.innerHTML = `<label>Image size:</label>
            <input type="number" class="section_attribute_imageSize header_option xs-width"/>`;
            setValue(imageSizeSetting, fixNum(item.attributes.imageSize, 15));
            const fontSizeSetting = document.createElement('div');
            fontSizeSetting.innerHTML = `<label>Font size:</label>
            <input type="number" class="section_attribute_fontSize header_option xs-width" />`;
            setValue(fontSizeSetting, fixNum(item.attributes.fontSize, 15));
            const fontWeightSetting = document.createElement('div');
            fontWeightSetting.innerHTML = `<label>Font weight:</label>
            <select class="section_attribute_fontWeight header_option ms-width">
                ${FONT_WEIGHTS}
            </select>`;
            setSelect(fontWeightSetting, item.attributes.fontWeight);
            advancedSettingsHOG1.append(backgroundColorSetting,textColorSetting,heightSetting,
                imageSizeSetting,fontSizeSetting,fontWeightSetting);
            return advancedSettingsHOG1;
        }
        function createBattleSettings() {
            const result = document.createElement('div');

            const basicSettingsContainer = document.createElement('div');
            basicSettingsContainer.className = 'section-basic-options header-option-group';
            const battleTypeSetting = document.createElement('div');
            battleTypeSetting.innerHTML = `<label><strong>Battle type:</strong></label>
            <select class="section_attribute_type header_option header_option_user_type m-width">
                <option value="closest">Closest Battle (auto)</option>
                <option value="fastest">Fastest Closing (auto)</option>
                <option value="custom">Custom Users</option>
            </select>`
            setSelect(battleTypeSetting, item.attributes.type);
            const updateIntervalSetting = document.createElement('div');
            updateIntervalSetting.innerHTML = `<label><strong>Update interval (seconds):</strong></label>
            <input type="number" class="section_attribute_updateInterval header_option xs-width" placeholder="2"/>`;
            setValue(updateIntervalSetting, item.attributes.updateInterval || 2);
            const showRankSetting = document.createElement('div');
            showRankSetting.innerHTML = `<label><strong>Show rank:</strong></label>
            <select class="section_attribute_battleRankPos header_option m-width">
                <option value="none">Don't show rank</option>
                <option value="outside">On the outside</option>
                <option value="inside">On the inside</option>
                <option value="left">On the left</option>
                <option value="right">On the right</option>
                <option value="outsideName">On the outside, in name</option>
                <option value="insideName">On the inside, in name</option>
                <option value="before">Before name</option>
                <option value="after">After name</option>
            </select>`;
            setSelect(showRankSetting, item.attributes.battleRankPos);
            const applyFireSetting = document.createElement('div');
            applyFireSetting.innerHTML = `<label><strong>Apply fire effect:</strong></label>
            <input type="checkbox" class="section_attribute_applyFire header_option">`;
            setChecked(applyFireSetting, item.attributes.applyFire);
            const restrictRanksSetting = document.createElement('div');
            restrictRanksSetting.innerHTML = `<label><strong>Restrict to ranks (e.g. 1-25, 51+):</strong></label>
            <input type="text" class="section_attribute_restrictRanks header_option s-width" placeholder="1+"">`;
            setValue(restrictRanksSetting, item.attributes.restrictRanks || '');
            const hideInvalidSetting = document.createElement('div');
            hideInvalidSetting.innerHTML = `<label><strong>Hide if no valid battle:</strong></label>
            <input type="checkbox" class="section_attribute_hideInvalid header_option">`;
            setChecked(hideInvalidSetting, item.attributes.hideInvalid);
            const thresholdTypeSetting = document.createElement('div');
            thresholdTypeSetting.innerHTML = `<label><strong>Threshold type:</strong></label>
            <select class="section_attribute_thresholdType header_option m-width">
                <option value="count">Count</option>
                <option value="hours">Hours until closing</option> 
            </select>`;
            setSelect(thresholdTypeSetting, item.attributes.thresholdType);
            const thresholdSetting = document.createElement('div');
            thresholdSetting.innerHTML = `<label><strong>Threshold (leave blank for none):</strong></label>
            <input type="number" class="section_attribute_threshold header_option s-width optional" placeholder="None">`;
            setValue(thresholdSetting, fixNum(item.attributes.threshold, ''));
            const rankingOption = document.createElement('div');
            rankingOption.className = 'header_option_nth_fastest';
            rankingOption.innerHTML = `<label><strong>nth closest battle (e.g. 1 = closest, 2 = 2nd closest):</strong></label>
            <input type="number" class="section_attribute_ranking header_option xs-width optional" placeholder="1">`;
            setValue(rankingOption, fixNum(item.attributes.ranking, ''));
            basicSettingsContainer.append(battleTypeSetting, updateIntervalSetting, showRankSetting, applyFireSetting, 
                restrictRanksSetting, hideInvalidSetting, thresholdTypeSetting, thresholdSetting, rankingOption);
            
            const userIDHOG = document.createElement('div');
            userIDHOG.style.marginTop = '10px';
            userIDHOG.className = 'header-option-group header_option_user_id';
            const user1Setting = document.createElement('div');
            user1Setting.innerHTML = `<label><strong>User 1 ID:</strong></label>
            <input class="section_attribute_id1 header_option l-width" placeholder="Select using Edit Channel to find"/><br>`;
            setValue(user1Setting, item.attributes.id1 || '');
            const user2Setting = document.createElement('div');
            user2Setting.innerHTML = `<label><strong>User 2 ID:</strong></label>
            <input class="section_attribute_id2 header_option l-width" placeholder="Select using Edit Channel to find"/>`
            setValue(user2Setting, item.attributes.id2 || '');
            userIDHOG.append(user1Setting, user2Setting);

            const advancedSettingsContainer = document.createElement('details');
            advancedSettingsContainer.className = 'section-advanced-options';
            advancedSettingsContainer.innerHTML = '<summary><strong>Styling Options (click to toggle)</strong></summary>';
            advancedSettingsContainer.style.marginTop = '10px';
            
            const advancedSettingsHOG1 = createBattleAndUserStyling()
            
            const advancedSettingsHOG2 = document.createElement('div');
            advancedSettingsHOG2.className = 'header-option-group';
            const odometerColorsSetting = document.createElement('div');
            odometerColorsSetting.innerHTML = `<input type="checkbox" class="section_attribute_odometerColors header_option"><label>Use odometer colors</label>`;
            setChecked(odometerColorsSetting, item.attributes.odometerColors);
            const roundAvatarsSetting = document.createElement('div');
            roundAvatarsSetting.innerHTML = `<input type="checkbox" class="section_attribute_roundAvatars header_option"><label>Round avatars</label>`;
            setChecked(roundAvatarsSetting, item.attributes.roundAvatars);
            const battleAlignSetting = document.createElement('div');
            battleAlignSetting.innerHTML = `<input type="checkbox" class="section_attribute_battleAlign header_option"><label>Align counters to sides</label>`;
            setChecked(battleAlignSetting, item.attributes.battleAlign);
            advancedSettingsHOG2.append(odometerColorsSetting, roundAvatarsSetting, battleAlignSetting);
            
            advancedSettingsContainer.append(advancedSettingsHOG1,advancedSettingsHOG2);
            result.append(basicSettingsContainer, userIDHOG, advancedSettingsContainer);
            return result;
        }

        function createUserSettings() {
            const result = document.createElement('div');
            const basicSettingsContainer = document.createElement('div');
            basicSettingsContainer.className = 'section-basic-options header-option-group';
            const userTypeSetting = document.createElement('div');
            userTypeSetting.innerHTML = `<label><strong>User Type:</strong></label>
            <select class="section_attribute_type header_option header_option_user_type m-width">
                <option value="fastest">Fastest Growing</option>
                <option value="custom">Specific User</option>
            </select>`;
            setSelect(userTypeSetting, item.attributes.type);
            const updateIntervalSetting = document.createElement('div');
            updateIntervalSetting.innerHTML = `<label><strong>Update interval (seconds):</strong></label>
            <input type="number" class="section_attribute_updateInterval header_option xs-width" placeholder="2" />`;
            setValue(updateIntervalSetting, item.attributes.updateInterval || 2);
            const userRankPosSetting = document.createElement('div');
            userRankPosSetting.innerHTML = `<label><strong>Show rank:</strong></label>
            <select class="section_attribute_userRankPos header_option m-width">
                <option value="none">Don't show rank</option>
                <option value="left">On the left</option>
                <option value="right">On the right</option>
                <option value="before">Before name</option>
                <option value="after">After name</option>
            </select>`;
            setSelect(userRankPosSetting, item.attributes.userRankPos);
            const applyFireSetting = document.createElement('div');
            applyFireSetting.innerHTML = `<label><strong>Apply fire effect:</strong></label><input type="checkbox" class="section_attribute_applyFire header_option">`;
            setChecked(applyFireSetting, item.attributes.applyFire);
            const restrictRanksSetting = document.createElement('div');
            restrictRanksSetting.innerHTML = `<label><strong>Restrict to ranks (e.g. 1-25, 51+):</strong></label>
            <input type="text" class="section_attribute_restrictRanks header_option s-width" placeholder="1+"">`;
            setValue(restrictRanksSetting, item.attributes.restrictRanks || '');
            const hideInvalidSetting = document.createElement('div');
            hideInvalidSetting.innerHTML = `<label><strong>Hide if no valid user:</strong></label><input type="checkbox" class="section_attribute_hideInvalid header_option">`;
            setChecked(hideInvalidSetting, item.attributes.hideInvalid);
            const rankingOption = document.createElement('div');
            rankingOption.className = 'header_option_nth_fastest';
            rankingOption.innerHTML = `<label><strong>nth fastest channel (e.g. 1 = fastest, 2 = 2nd fastest):</strong></label>
            <input type="number" class="section_attribute_ranking header_option xs-width optional" placeholder="1">`;
            setValue(rankingOption, fixNum(item.attributes.ranking, ''));
            basicSettingsContainer.append(userTypeSetting, updateIntervalSetting, userRankPosSetting,
                applyFireSetting, restrictRanksSetting, hideInvalidSetting, rankingOption);
            
            const userIDOption = document.createElement('div');
            userIDOption.style.marginTop = '10px';
            userIDOption.className = 'header_option_user_id';
            userIDOption.innerHTML = `<label><strong>User ID:</strong></label>
                <input class="section_attribute_id1 header_option l-width" placeholder="Select using Edit Channel to find"/>`;
            setValue(userIDOption, item.attributes.id1 || '');

            const advancedSettingsContainer = document.createElement('details');
            advancedSettingsContainer.className = 'section-advanced-options';
            advancedSettingsContainer.innerHTML = '<summary><strong>Styling Options (click to toggle)</strong></summary>';
            advancedSettingsContainer.style.marginTop = '10px';

            const advancedSettingsHOG1 = createBattleAndUserStyling()

            const advancedSettingsHOG2 = document.createElement('div');
            advancedSettingsHOG2.className = 'header-option-group';
            const odometerColorsSetting = document.createElement('div');
            odometerColorsSetting.innerHTML = `<input type="checkbox" class="section_attribute_odometerColors header_option"><label>Use odometer colors</label>`;
            setChecked(odometerColorsSetting, item.attributes.odometerColors);
            const roundAvatarsSetting = document.createElement('div');
            roundAvatarsSetting.innerHTML = `<input type="checkbox" class="section_attribute_roundAvatars header_option"><label>Round avatars</label>`;
            setChecked(roundAvatarsSetting, item.attributes.roundAvatars);
            advancedSettingsHOG2.append(odometerColorsSetting, roundAvatarsSetting);
            advancedSettingsContainer.append(advancedSettingsHOG1,advancedSettingsHOG2);
            result.append(basicSettingsContainer, userIDOption, advancedSettingsContainer);
            return result;
        }

        function createBoxSettings() {
            const result = document.createElement('div');
            const basicSettingsContainer = document.createElement('div');
            basicSettingsContainer.innerHTML = `<div><label><strong>Number of rows:</strong></label>
                <input type="number" class="section_attribute_rows header_option xs-width" placeholder="0"/>
            </div>`;
            setValue(basicSettingsContainer, fixNum(item.attributes.rows, 0));
            result.append(basicSettingsContainer);
            result.innerHTML += `<p class="option-small-text">Boxes are containers that can hold other sections. Use "Child of" below to nest sections inside boxes.</p>`;
            return result;
        }

        function createMainSettings() {
            const outerDiv = document.createElement('div');
            outerDiv.className = 'header-settings-div-outer';
            const innerDiv = document.createElement('div');
            innerDiv.className = 'header-settings-div-inner';
            const nameSetting = document.createElement('div');
            nameSetting.innerHTML = `<label><strong>Section name:</strong></label>
            <input type="text" class="section_option_name header_option l-width" placeholder="My Section" />`;
            setValue(nameSetting, item.name);
            const placementSetting = document.createElement('div');
            placementSetting.innerHTML = `<label><strong>Place in:</strong></label>
            <select class="section_option_placement header_option m-width">
                <option value="header">Header</option>
                <option value="footer">Footer</option>
            </select>`;
            setSelect(placementSetting, item.placement);
            const sectionTypeSetting = document.createElement('div');
            sectionTypeSetting.innerHTML = `<label><strong>Section type:</strong></label>
            <select class="section_option_type header_option m-width">
                <option value="text">Text</option>
                <option value="battle">Battle</option>
                <option value="user">User</option>
                <option value="box">Box (Container)</option>
            </select>`;
            setSelect(sectionTypeSetting, item.type);
            sectionTypeSetting.querySelector('select').onchange = e => {
                loadTopSettings(item.name, e.target.value);
            };
            innerDiv.append(nameSetting, placementSetting, sectionTypeSetting);

            const nestingOption = document.createElement('details');
            nestingOption.className = 'section-nesting-option';
            nestingOption.style.marginBottom = '10px';
            nestingOption.innerHTML = `<summary><strong>Nesting (advanced) (click to toggle)</strong></summary>
            <div style="margin-top: 10px;">
                <label>Parent box name:</label>
                <input type="text" class="section_option_childOf header_option l-width"
                    placeholder="Leave blank for top level" />
                <p class="option-small-text">Enter the name of a box section to nest this
                    inside it.</p>
            </div>`;
            setValue(nestingOption, item.childOf || '');
            const hr1 = document.createElement('hr');
            hr1.className = 'header-option-hr';
            let itemOptions;
            switch (item.type) {
                case 'battle':
                    itemOptions = createBattleSettings();
                    break;
                case 'user':
                    itemOptions = createUserSettings();
                    break;
                case 'box':
                    itemOptions = createBoxSettings();
                    break;
                default:
                    itemOptions = createTextSettings();
            }
            const hr2 = document.createElement('hr');
            hr2.className = 'header-option-hr';
            const headerControlOptions = document.createElement('div');
            headerControlOptions.className = 'header-control-options';
            const deleteButton = document.createElement('button');
            deleteButton.className = 'danger-button';
            deleteButton.innerText = 'Delete';
            deleteButton.onclick = () => {
                removeTopSetting(item.name);
            };
            const moveUpButton = document.createElement('button');
            moveUpButton.innerText = '↑ Move Up';
            moveUpButton.onclick = () => {
                reorderTopSetting(item.name, 'up');
            };
            const moveDownButton = document.createElement('button');
            moveDownButton.innerText = '↓ Move Down';
            moveDownButton.onclick = () => {
                reorderTopSetting(item.name, 'down');
            };
            headerControlOptions.append(deleteButton,moveUpButton,moveDownButton);
            outerDiv.append(innerDiv,nestingOption,hr1,itemOptions,hr2,headerControlOptions);
            return outerDiv;
        }

        div.append(createMainSettings());

        document.getElementById("sections").appendChild(div);
        fixHeaderSettings();
    });
    adjustColors();
    await saveTopSettings(false);
    loadHeader();
};

function removeTopSetting(name) {
    if (confirm("Are you sure you want to delete this setting?")) {
        let itemToRemove = data.headerSettings.items.find(item => item.name === name);
        if (itemToRemove) {
            if (document.getElementById('headerStyles_' + name)) {
                document.getElementById('headerStyles_' + name).remove();
            }
            data.headerSettings.items.splice(data.headerSettings.items.indexOf(itemToRemove), 1);
            loadTopSettings();
        }
    }
}

function createNewSection() {
    let index = data.headerSettings.items.length;
    while (data.headerSettings.items.some(x => x.name === "Item " + index)) {
        index++;
    }
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
            "battleAlign": true,
            "odometerColors": false,
            "fontWeight": "400",
            "boxHeight": 60,
            "id1": "",
            "id2": ""
        },
        "name": "Item " + index,
        "type": "text",
        "childOf": "",
        "placement": "header"
    }
    data.headerSettings.items.unshift(item);
    loadTopSettings();
}

function displaySetting(id, item) {
    document.getElementById(data.settingsTab).classList.add("hidden");
    document.getElementById("button_" + data.settingsTab).classList.remove("enabled");
    data.settingsTab = id;
    document.getElementById(id).classList.remove("hidden");
    item.classList.add("enabled");
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

function saveCustomCSS() {
    const css = document.getElementById('customCSS').value;
    document.getElementById('customCSSOverrides').innerText = css;
    data['customCSS'] = css;
}

function updateAddHourlyEstimates() {
    const addMinGain = parseFloat(document.getElementById("add_min_gain").value) || 0;
    const addMaxGain = parseFloat(document.getElementById("add_max_gain").value) || 0;
    const addMeanGain = parseFloat(document.getElementById("add_mean_gain").value);
    const addStdGain = parseFloat(document.getElementById("add_std_gain").value) || 0;
    const usingMeanGain = isFinite(addMeanGain);

    // Minimum practical interval is 4 ms
    const updateIntervals = 3.6e6 / Math.max(4,data.updateInterval);
    const mean = updateIntervals * (usingMeanGain ? addMeanGain : (addMinGain + addMaxGain) / 2);
    const stdev = Math.sqrt(updateIntervals) * Math.abs((usingMeanGain ? addStdGain : (addMinGain - addMaxGain) / Math.sqrt(12)));
    document.getElementById("addHourlyMean").innerText = Math.abs(mean) > 10 ? formatNumber(Math.round(mean)) : formatNumber(mean, {maximumSignificantDigits: 2});
    document.getElementById("addHourlyStDev").innerText = stdev > 10 ? formatNumber(Math.round(stdev)) : formatNumber(stdev, {maximumSignificantDigits: 2});
}

function updateEditHourlyEstimates() {
    const editMinGain = parseFloat(document.getElementById("edit_min_gain").value) || 0;
    const editMaxGain = parseFloat(document.getElementById("edit_max_gain").value) || 0;
    const editMeanGain = parseFloat(document.getElementById("edit_mean_gain").value);
    const editStdGain = parseFloat(document.getElementById("edit_std_gain").value) || 0;
    const usingMeanGain = isFinite(editMeanGain);

    // Minimum practical interval is 4 ms
    const updateIntervals = 3.6e6 / Math.max(4,data.updateInterval);
    const mean = updateIntervals * (usingMeanGain ? editMeanGain : (editMinGain + editMaxGain) / 2);
    const stdev = Math.sqrt(updateIntervals) * Math.abs((usingMeanGain ? editStdGain : (editMinGain - editMaxGain) / Math.sqrt(12)));
    document.getElementById("editHourlyMean").innerText = Math.abs(mean) > 10 ? formatNumber(Math.round(mean)) : formatNumber(mean, {maximumSignificantDigits: 2});
    document.getElementById("editHourlyStDev").innerText = stdev > 10 ? formatNumber(Math.round(stdev)) : formatNumber(stdev, {maximumSignificantDigits: 2});
}

document.getElementById("add_min_gain").addEventListener('input', updateAddHourlyEstimates);
document.getElementById("add_max_gain").addEventListener('input', updateAddHourlyEstimates);
document.getElementById("add_mean_gain").addEventListener('input', updateAddHourlyEstimates);
document.getElementById("add_std_gain").addEventListener('input', updateAddHourlyEstimates);
document.getElementById("edit_min_gain").addEventListener('input', updateEditHourlyEstimates);
document.getElementById("edit_max_gain").addEventListener('input', updateEditHourlyEstimates);
document.getElementById("edit_mean_gain").addEventListener('input', updateEditHourlyEstimates);
document.getElementById("edit_std_gain").addEventListener('input', updateEditHourlyEstimates);

function updateScrollbars() {
    if (data.showScrollbars === false) {
        document.getElementById("noScrollbars").innerText = `
            .main {
                scrollbar-width: none;    
                -ms-overflow-style: none; 
            }

            .main::-webkit-scrollbar {
                display: none;
            }
        `
    } else {
        document.getElementById("noScrollbars").innerText = "";   
    }
}