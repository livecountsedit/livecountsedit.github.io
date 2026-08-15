const CHART_TEXT_COLOR = '#bdbdbd';
const CHART_LINE_COLOR = '#b3382c';
const CHART_GRIDLINE_COLOR = '#000000';
let chart;

window.onload = async () => {

    COUNTER_THEME = 'socialblade';

    example_data.saveType = COUNTER_THEME;

    enableChartFeature();

    const extraKeys = {
        socialBladeSettings: {
            countEditBox: false,
            counterType: 'youtube',
            showBackgroundLogo: true,
            showFooter: true,
        },
        partialExports: {
            socialBladeSettings: true,
        }
    }

    example_data = mergeWithExampleData(extraKeys, example_data);

    const insertedTab = {
        title: 'SocialBlade Theme Settings',
        items: [
            {
                title: 'Counter type',
                value: 'youtube',
                type: 'select',
                path: 'data.socialBladeSettings.counterType',
                options: [
                    ['youtube', 'YouTube'],
                    ['twitch', 'Twitch'],
                    ['twitter', 'Twitter'],
                    ['tiktok', 'TikTok'],
                    ['none', 'None']
                ]
            },
            {
                title: 'Show SocialBlade logo',
                value: true,
                type: 'checkbox',
                path: 'data.socialBladeSettings.showBackgroundLogo'
            },
            {
                title: 'Show footer',
                value: true,
                type: 'checkbox',
                path: 'data.socialBladeSettings.showFooter'
            },
            {
                title: 'Edit count through "Enter Username" box',
                value: false,
                type: 'checkbox',
                path: 'data.socialBladeSettings.countEditBox'
            }
        ]
    }

    const partialExportAddition = {
        title: 'SocialBlade settings',
        value: true,
        type: 'checkbox',
        path: 'data.partialExports.socialBladeSettings',
        className: 'partial-export-option'
    }

    // Insert SocialBlade tab at second to last position
    MENU.tabs.splice(-2, 0, insertedTab);

    // Insert partial export setting at fourth to last position
    MENU.tabs.find(x => x.title === 'Import & Export Data').items.splice(-3, 0, partialExportAddition);

    try {
        data = await retrieveDataFromBrowser(COUNTER_THEME, 1);
        data = mergeWithExampleData(data, example_data);
    } catch (err) {
        console.error(err);
    }
    if (!data) data = structuredClone(example_data);
    data.data = data.data.slice(0, 1);
    data.data = data.data.map(x => new Channel(x));
    if (!data.data.length) data.data.push(new Channel());

    // Load old API update settings
    const oldAPIUpdates = localStorage.getItem('socialblade-apiUpdates');
    if (oldAPIUpdates) {
        try {
            const jsonData = JSON.parse(oldAPIUpdates);
            const oldSave = {
                apiUpdates: jsonData,
                data: [new Channel({ id: jsonData.channelID || uuidGen() })],
                partialExports: {
                    counters: true,
                    apiUpdates: true
                },
                saveType: COUNTER_THEME
            }
            delete oldSave.apiUpdates.channelID;
            if (confirm('You have old API update settings saved for the SocialBlade counter. Would you like to save a backup just in case?')) {
                const file = new Blob([JSON.stringify(oldSave)], { type: 'text/plain' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(file);
                a.download = 'socialblade-legacy-api-updates.json';
                a.click();
                delete a;
            }

            delete oldSave.partialExports;
            data = mergeWithExampleData(oldSave, data);
            
        } catch (err) {
            console.error(err);
        }
        localStorage.removeItem('socialblade-apiUpdates');
    }
    drawMenu(MENU, document.getElementById('menuButtons'), document.getElementById('settingsMenus'), document.getElementById('controlButtons'));

    afterDrawingMenu();
    await processImport(data);
}

async function processImport(imported) {
    if (!imported.data.length) {
        imported.data.push(new Channel());
    }
    if (imported.data.length > 1) {
        imported.data = imported.data.slice(0, 1);
    }
    imported.saveType = COUNTER_THEME;
    updateAutoSave();
    updateStreamerMode();
    renderChart();
    changeUpdateInterval();
    refreshCount();
    fix();
    return imported;
}

function afterDrawingMenu2() {
    updateGainType(0);
    fillMenus(document.getElementById('settingsMenus'));
    saveAPISettings(false);
    refreshCount();

    document.getElementById('saveCountButton').addEventListener('click', () => {
        const count = parseFloat(document.getElementById('SearchInput').value);
        if (isFinite(count)) {
            data.data[0].count = count;
        }
    })
}

function updateCounters2(doGains = true) {
    const count = data.data[0].getDisplayedCount();
    document.getElementById('counter').innerText = count;
    updateChart(count);
}

function openmenu() {
    if (document.getElementById('settingsMenu').style.visibility == "visible") {
        document.getElementById('settingsMenu').style.visibility = "hidden"
    } else {
        document.getElementById('settingsMenu').style.visibility = "visible"
        refreshCount();
    }
}

document.getElementById('close').onclick = function () {
    document.getElementById('settingsMenu').style.visibility = "hidden"
}

function fix() {
    document.getElementById('userName').innerText = data.data[0].name || 'User';
    document.getElementById('updateIntervalDisplay').innerText = data.updateInterval === 1000 ? 'This page updates every second.' : `This page updates every ${data.updateInterval / 1000} seconds.`
    if (data.data[0].image !== document.getElementById('userimg').src) {
        document.getElementById('userimg').src = data.data[0].image || '/default.png';
    }
    if (!data.saveChartData) {
        data.liveGraph = [];
    }
    if (data.cardStyles.showChart) {
        document.getElementById('chart').style.display = '';
    } else {
        document.getElementById('chart').style.display = 'none';
    }

    switch (data.socialBladeSettings.counterType) {
        case "youtube":
            document.querySelector(".platform-icon").style.display = "inline";
            document.querySelector(".platform-icon").src = "youtube-icon.png";
            document.getElementById("SearchInput").placeholder = "Enter YouTube Username";
            document.getElementById("realtime-title").innerText = "Real Time YouTube Subscriber Count";
            document.getElementById("live-count-watermark").innerText = "YouTube Live Subscriber Count";
            document.getElementById("live-count-watermark").style.color = "#d64e33";
            document.getElementById("platform-plus-sign").style.backgroundColor = "#e62117";
            document.getElementById("userimg").style.border = "1px solid #e62117";
            break;
        case "twitch":
            document.querySelector(".platform-icon").style.display = "inline";
            document.querySelector(".platform-icon").src = "twitch-icon.png";
            document.getElementById("SearchInput").placeholder = "Enter Twitch Username";
            document.getElementById("realtime-title").innerText = "Real Time Twitch Follower Count";
            document.getElementById("live-count-watermark").innerText = "Twitch Live Follower Count";
            document.getElementById("live-count-watermark").style.color = "#3a0070";
            document.getElementById("platform-plus-sign").style.backgroundColor = "#7a31b3";
            document.getElementById("userimg").style.border = "1px solid #7a31b3";
            break;
        case "twitter":
            document.querySelector(".platform-icon").style.display = "inline";
            document.querySelector(".platform-icon").src = "twitter-icon.png";
            document.getElementById("SearchInput").placeholder = "Enter Twitter Username";
            document.getElementById("realtime-title").innerText = "Real Time Twitter Follower Count";
            document.getElementById("live-count-watermark").innerText = "Twitter Live Follower Count";
            document.getElementById("live-count-watermark").style.color = "#003a70";
            document.getElementById("platform-plus-sign").style.backgroundColor = "#317db3";
            document.getElementById("userimg").style.border = "1px solid #317db3";
            break;
        case "tiktok":
            document.querySelector(".platform-icon").style.display = "none";
            document.getElementById("SearchInput").placeholder = "Enter TikTok Username";
            document.getElementById("realtime-title").innerText = "Real Time TikTok Follower Count";
            document.getElementById("live-count-watermark").innerText = "TikTok Live Follower Count";
            document.getElementById("live-count-watermark").style.color = "#703d00";
            document.getElementById("platform-plus-sign").style.backgroundColor = "#ff4c74";
            document.getElementById("userimg").style.border = "1px solid #ff4c74";
            break;
        default:
            document.querySelector(".platform-icon").style.display = "none";
            document.getElementById("SearchInput").placeholder = "Enter Username";
            document.getElementById("realtime-title").innerText = "Real Time Count";
            document.getElementById("live-count-watermark").innerText = "Live Count";
            document.getElementById("live-count-watermark").style.color = "#703d00";
            document.getElementById("platform-plus-sign").style.backgroundColor = "#333333";
            document.getElementById("userimg").style.border = "1px solid #333333";
    }

    chart.series[0].name = data.socialBladeSettings.counterType === 'youtube' ? 'Subscribers' : 'Followers';

    document.getElementById('noSocialBladeLogo').innerText = data.socialBladeSettings.showBackgroundLogo ? '' : 'div.page-realtime-body .containment:after { opacity: 0 !important; }'
    document.querySelector('.realtime-watermark').style.visibility = data.socialBladeSettings.showFooter ? '' : 'hidden';

    if (data.socialBladeSettings.countEditBox) {
        document.getElementById('saveCountButton').style.display = 'block';
        document.getElementById('SearchInput').placeholder = 'Enter count';
        document.getElementById('SearchInput').type = 'number';
    } else {
        document.getElementById('SearchInput').type = 'text';
        document.getElementById('saveCountButton').style.display = 'none';
    }
}

function renderChart() {
    chart = new Highcharts.chart({
        chart: {
            renderTo: 'chart',
            type: 'spline',
            zoomType: 'x',
            backgroundColor: 'transparent',
            plotBorderColor: 'transparent',
        },
        title: {
            text: ' '
        },
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 500,
            gridLineColor: CHART_TEXT_COLOR,
            labels: {
                style: {
                    color: CHART_TEXT_COLOR
                }
            },
            lineColor: CHART_GRIDLINE_COLOR,
            minorGridLineColor: CHART_TEXT_COLOR,
            tickColor: CHART_GRIDLINE_COLOR,
            title: {
                style: {
                    color: CHART_TEXT_COLOR
                }
            }
        },
        yAxis: {
            visible: false
        },
        credits: {
            enabled: true,
            text: 'Livecountsedit'
        },
        series: [
            {
                showInLegend: false,
                name: 'Subscribers',
                marker: { enabled: false},
                color: CHART_LINE_COLOR,
                lineColor: CHART_LINE_COLOR,
                data: data.saveChartData ? (data.liveGraph || []) : []
            }
        ]
    })
}

function updateChart(val) {

    data.maxChartValues = clamp(Math.floor(data.maxChartValues), 2, 5000);

    while (chart.series[0].data.length >= data.maxChartValues) {
        chart.series[0].removePoint(0);
    }

    chart.series[0].addPoint([Date.now(), val]);

    if (data.saveChartData) {
        data.liveGraph = chart.series[0].data.map(x => [x.x, x.y])
    } else {
        data.liveGraph = [];
    }
}

function clearChart() {
    if (confirm('Are you sure you want to clear the chart?')) {
        data.liveGraph = [];
        renderChart();
    }
}