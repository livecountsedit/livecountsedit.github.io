let chart;

function studioAbbs(n) {
    let s = Math.sign(n);
    n = Math.abs(n);
    if (n < 1) return '0';
    if (n < 1000) return s * Math.floor(n);
    let l = Math.floor(Math.log10(n) / 3);
    let result = formatNumber(s * n / (1000 ** l), { minimumFractionDigits: 1, maximumFractionDigits: 1, roundingMode: 'trunc' }) + (l > 5 ? "?" : " KMBTQ"[l]);
    if (result.endsWith(" ")) return result.slice(0, -1);
    return result;
}

window.onload = async () => {

    COUNTER_THEME = 'studio';

    example_data.saveType = COUNTER_THEME;

    enableChartFeature();

    const extraKeys = {
        cardStyles: {
            chartBaseColor: '#9e9e9e',
            chartGridColor: '#3d3d3d',
            chartLineColor: '#3fabcd'
        },
        animationType: 'ytstudio',
        bgColor: '#282828',
        footerColor: '#aaaaaa',
        footerText: 'Subscribers',
        nameColor: '#ffffff',
        mainFont: 'Roboto, sans-serif',
        counterFontWeight: '700',
        textColor: '#ffffff',
        graphDates: 'Aug 31 2023, Sep 1 2023, Sep 2 2023, Sep 3 2023, Sep 4 2023, Sep 5 2023, Sep 6 2023',
        graphValues: '1, 2, 3, 4, 5, 6, 7',
        useStaticGraph: false,
        ytStudioSettings: {
            countMarginTop: 0,
            dropdownTopText: 'All Time',
            dropdownBottomText: 'Live Data',
            headerColor: '#1f1f1f',
            countEditBox: false,
        },
        partialExports: {
            ytStudioSettings: true,
        }
    }

    example_data = mergeWithExampleData(extraKeys, example_data);

    const insertedTab = {
        title: 'YT Studio Theme Settings',
        items: [
            {
                title: '<abbr title="Meant to fix an issue on Safari browser where the counter would be in the wrong place.">Counter margin top</abbr>',
                value: 0,
                type: 'number',
                path: 'data.ytStudioSettings.countMarginTop',
                className: 's-width'
            },
            {
                title: 'Dropdown top text',
                type: 'text',
                path: 'data.ytStudioSettings.dropdownTopText'
            },
            {
                title: 'Dropdown bottom text',
                type: 'text',
                path: 'data.ytStudioSettings.dropdownBottomText'
            },
            {
                title: 'Header color',
                type: 'color',
                path: 'data.ytStudioSettings.headerColor',
                id: 'headerColor'
            },
            {
                title: 'Show count input box on top right',
                type: 'checkbox',
                value: false,
                path: 'data.ytStudioSettings.countEditBox'
            }
        ]
    }

    const extraStyleOptions = [{
        type: 'html',
        value: '<br>'
    }, {
        title: 'Footer text',
        value: 'Subscribers',
        type: 'text',
        path: 'data.footerText'
    }, {
        title: 'Footer color',
        type: 'color',
        path: 'data.footerColor',
        id: 'footerColor'
    }]

    MENU.tabs.find(x => x.title === 'Design Settings & Styling').items.splice(5, 0, ...extraStyleOptions);

    const extraChartOptions = [{
        title: 'Chart grid color',
        type: 'color',
        path: 'data.cardStyles.chartGridColor'
    }, {
        title: 'Chart base color',
        type: 'color',
        path: 'data.cardStyles.chartBaseColor'
    }, {
        type: 'html',
        value: '<br>'
    }, {
        title: 'Use static graph',
        type: 'checkbox',
        value: false,
        path: 'data.useStaticGraph',
        func: function (item) {
            renderChart();
        }
    }, {
        title: '<abbr title="Comma separated, so do NOT use commas in date format! e.g. Jul 29 2019 not Jul 29, 2019">Static graph dates</abbr>',
        type: 'textarea',
        path: 'data.graphDates',
        func: function (item) {
            renderChart();
        }
    }, {
        title: '<abbr title="Comma separated, do NOT use digit separators. e.g. 12345678 not 12,345,678 nor 12.345.678">Static graph values</abbr>',
        type: 'textarea',
        path: 'data.graphValues',
        func: function (item) {
            renderChart();
        }
    }]

    MENU.tabs.find(x => x.title === 'Chart Settings').items[0].id = 'showChart';

    MENU.tabs.find(x => x.title === 'Chart Settings').items.push(...extraChartOptions);

    const partialExportAddition = {
        title: 'YT Studio settings',
        value: true,
        type: 'checkbox',
        path: 'data.partialExports.ytStudioSettings',
        className: 'partial-export-option'
    }

    // Insert SocialBlade tab at second to last position
    MENU.tabs.splice(-2, 0, insertedTab);

    // Insert partial export setting at fourth to last position
    MENU.tabs.find(x => x.title === 'Import & Export Data').items.splice(-3, 0, partialExportAddition);

    const oldData = localStorage.getItem('user');
    const oldAPIData = localStorage.getItem('studio-apiUpdates');
    if (oldData) {
        try {
            if (confirm('You have old data saved in your browser that needs to be converted. Would you like to save a backup just in case?')) {
                download(oldData, 'studio-legacy.json')
            }

            const oldSave = convert_yt_studio_to_top_50(JSON.parse(oldData));
            data = mergeWithExampleData(oldSave, example_data);
            if (oldAPIData) {
                const jsonData = JSON.parse(oldAPIData);
                const oldSave2 = {
                    apiUpdates: jsonData,
                    data: [new Channel({ id: jsonData.channelID || uuidGen() })],
                    partialExports: {
                        counters: true,
                        apiUpdates: true
                    },
                    saveType: COUNTER_THEME
                }
                const channelID = oldSave2.apiUpdates.channelID;
                delete oldSave2.apiUpdates.channelID;
                if (confirm('You have old API update settings saved for the YouTube Studio counter. Would you like to save a backup just in case?')) {
                    download(oldSave2, 'studio-legacy-api-updates.json');
                }
                if (data.data) {
                    delete oldSave2.data;
                    data.data[0].id = channelID;
                }
                data = mergeWithExampleData(oldSave2, data);
            }
        } catch (err) {
            console.error(err)
        }
        localStorage.removeItem('studio-apiUpdates');
        localStorage.removeItem('user');
    } else {
        try {
            data = await retrieveDataFromBrowser(COUNTER_THEME, 1);
            data = mergeWithExampleData(data, example_data);
        } catch (err) {
            console.error(err);
        }
    }
    
    if (!data) data = structuredClone(example_data);
    data.data = data.data.slice(0, 1);
    data.data = data.data.map(x => new Channel(x));
    if (!data.data.length) data.data.push(new Channel());

    drawMenu(MENU, document.querySelector('.tabs'), document.querySelector('.tab-stuff'), document.querySelector('.tab-controls'));

    afterDrawingMenu();
    await processImport(data);
}

async function processImport(imported) {
    renderChart();
    importingStuff(imported);
    updateGainType(0);
    fix();
    return imported;
}

function afterDrawingMenu2() {
    updateGainType(0);
    fillMenus();
    saveAPISettings(false);
    refreshCount();

    document.querySelector('.svg5').addEventListener('click', () => {
        document.getElementById('showChart').click();
    })

    document.getElementById('saveCountButton').addEventListener('click', () => {
        const count = parseFloat(document.getElementById('studio-input-count').value);
        if (isFinite(count)) {
            data.data[0].count = count;
        }
    })
}

function updateCounters2(doGains = true) {
    const count = data.data[0].getDisplayedCount();
    document.getElementById('count').innerText = count;
    if (!data.useStaticGraph) {
        updateChart(count);
    }
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

function fix(noOdo = false) {
    document.getElementById('name').innerText = data.data[0].name || 'User';
    if (data.data[0].image !== document.getElementById('image').src) {
        document.getElementById('image').src = data.data[0].image || '/default.png';
    }

    document.getElementById('image').style.border = '8px solid ' + data.bgColor;
    if (!data.saveChartData) {
        data.liveGraph = [];
    }
    if (data.cardStyles.showChart) {
        document.getElementById('chart').style.display = '';
        document.querySelector('.chart-dropdown-area1-inner').style.visibility = '';
        document.getElementById('count').style.fontSize = '72px';
        document.getElementById('footer').style.marginTop = '-1px';
        document.querySelector('.counter').style.height = '60%';
        document.querySelector('.svg5').style.transform = '';
        chart.reflow();
    } else {
        document.getElementById('chart').style.display = 'none';
        document.querySelector('.chart-dropdown-area1-inner').style.visibility = 'hidden';
        document.getElementById('count').style.fontSize = '96px';
        document.getElementById('footer').style.marginTop = '23px';
        document.querySelector('.counter').style.height = '80%';
        document.querySelector('.svg5').style.transform = 'rotate(180deg)';
    }

    chart.series[0].name = data.footerText;

    document.querySelector('.header').style.backgroundColor = data.ytStudioSettings.headerColor;
    document.querySelector('.main').style.backgroundColor = data.bgColor;
    document.getElementById('count').style.color = data.textColor;
    document.getElementById('count').style.fontWeight = data.counterFontWeight;
    document.getElementById('count').style.fontFamily = data.mainFont;
    document.getElementById('count').style.marginTop = data.ytStudioSettings.countMarginTop + 'px';
    document.getElementById('footer').innerText = data.footerText;
    document.getElementById('footer').style.color = data.footerColor;

    document.getElementById('counterColor').innerText = `
        #count {
            color: ${data.textColor};
        }
    `
    document.getElementById('name').style.color = data.nameColor;
    document.body.style.fontFamily = data.mainFont;
    document.querySelector('.live').style.fontFamily = data.mainFont;
    document.getElementById('dropdown-label1').style.fontFamily = data.mainFont;
    document.getElementById('dropdown-label2').style.fontFamily = data.mainFont;
    document.getElementById('name').style.fontFamily = data.mainFont;
    document.getElementById('footer').style.fontFamily = data.mainFont;
    document.querySelector('.chart-labels-area1').style.fontFamily = data.mainFont;
    document.querySelector('.chart-labels-area1').style.color = data.textColor;
    document.querySelector('.chart-labels-area2').style.fontFamily = data.mainFont;
    document.querySelector('.chart-labels-area2').style.color = data.footerColor;
    for (i = 1; i <= 5; i++) {
        document.querySelector('.svg' + i).style.fill = data.footerColor;
    }

    document.getElementById('dropdown-label1').innerText = data.ytStudioSettings.dropdownTopText;
    document.getElementById('dropdown-label1').style.color = data.footerColor;
    document.getElementById('dropdown-label2').innerText = data.ytStudioSettings.dropdownBottomText;
    document.getElementById('dropdown-label2').style.color = data.textColor;

    document.getElementById('manual-input').style.display = data.ytStudioSettings.countEditBox ? '' : 'none';

    const color = getComputedStyle(document.querySelector('.header')).getPropertyValue('background-color').replace('rgb(', '').split(',').map(x => parseInt(x, 10));
    const brightness = (0.2126 * color[0] + 0.7152 * color[1] + 0.0722 * color[2]) / 255;
    if (brightness < 0.5) {
        document.querySelector('.yt-icon').style.fill = '#ffffff';
    } else {
        document.querySelector('.yt-icon').style.fill = '#000000';
    }

    try {
        chart.update({
            chart: {
                style: {
                    fontFamily: data.mainFont
                }
            },
            xAxis: {
                gridLineColor: data.cardStyles.chartGridColor,
                labels: {
                    style: {
                        color: data.footerColor
                    }
                },
                lineColor: data.cardStyles.chartBaseColor,
                minorGridLineColor: data.cardStyles.chartGridColor,
                tickColor: data.cardStyles.chartGridColor,
                title: {
                    style: {
                        color: data.cardStyles.chartGridColor
                    }
                }
            },
            yAxis: {
                labels: {
                    style: {
                        color: data.footerColor,
                    },
                },
                gridLineColor: data.cardStyles.chartGridColor,
                lineColor: data.cardStyles.chartGridColor,
                minorGridLineColor: data.cardStyles.chartGridColor,
                tickColor: data.cardStyles.chartGridColor,
            }
        });
        chart.series[0].update({
            color: data.cardStyles.chartLineColor,
            name: data.footerText,
            lineColor: data.cardStyles.chartLineColor
        });
    } catch (err) {
        console.error(err);
    }
    if (!noOdo) updateOdo();
}

function renderChart() {
    chart = new Highcharts.chart({
        chart: {
            renderTo: 'chart',
            type: 'line',
            zoomType: 'x',
            backgroundColor: 'transparent',
            plotBorderColor: 'transparent',
            style: {
                fontFamily: data.mainFont
            },
            height: (9 / 16 * 30) + '%',
            spacingLeft: -10,
            marginRight: 65
        },
        title: {
            text: ''
        },
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 500,
            gridLineColor: data.cardStyles.chartGridColor,
            labels: {
                style: {
                    color: data.footerColor
                },
                formatter: function () {
                    return Highcharts.dateFormat("%b %e, %Y", this.value);
                }
            },
            lineColor: data.cardStyles.chartLineColor,
            minorGridLineColor: data.cardStyles.chartGridColor,
            tickColor: data.cardStyles.chartGridColor,
            title: {
                style: {
                    color: data.cardStyles.chartGridColor
                }
            }
        },
        yAxis: {
            title: {
                text: ''
            },
            labels: {
                style: {
                    color: data.footerColor,
                    fontSize: '12px'
                },
                formatter: function () {
                    return studioAbbs(this.value);
                }
            },
            gridLineColor: data.cardStyles.chartGridColor,
            lineColor: data.cardStyles.chartGridColor,
            minorGridLineColor: data.cardStyles.chartGridColor,
            tickColor: data.cardStyles.chartGridColor,
            opposite: true
        },
        credits: {
            enabled: false
        },
        series: [
            {
                showInLegend: false,
                name: data.footerText,
                marker: { enabled: false},
                color: data.cardStyles.chartLineColor,
                lineColor: data.cardStyles.chartLineColor,
                lineWidth: 2,
                data: data.useStaticGraph ? serializeStaticChartData() : (data.saveChartData ? (data.liveGraph || []) : [])
            }
        ]
    })
}

function setLightTheme() {
    const values = {
        nameColor: '#0f0f0f',
        textColor: '#0f0f0f',
        headerColor: '#f2f2f2',
        footerColor: '#606060',
        bgColor: '#ffffff'
    }

    for (const key of Object.keys(values)) {
        document.getElementById(key).value = values[key];
        document.getElementById(key).dispatchEvent(new Event('change'));
    }
}

function setDarkTheme() {
    const values = {
        nameColor: '#ffffff',
        textColor: '#ffffff',
        headerColor: '#1f1f1f',
        footerColor: '#aaaaaa',
        bgColor: '#282828'
    }

    for (const key of Object.keys(values)) {
        document.getElementById(key).value = values[key];
        document.getElementById(key).dispatchEvent(new Event('change'));
    }
}

function serializeStaticChartData() {
    const dates = data.graphDates.split(/, */).filter(x => x).map(x => new Date(x.trim()).getTime());
    const counts = data.graphValues.split(/, */).map(x => parseInt(x)).filter(x => isFinite(x));
    const result = [];
    for (i = 0; i < dates.length && i < counts.length; i++) {
        result.push([dates[i], counts[i]]);
    }
    return result;
}