let chart;
let chart2;

function getChartOptions() {
    return {
        xAxis: {
            visible: data.cardStyles.showChartGrid,
            gridLineColor: data.cardStyles.chartGridColor,
            labels: {
                style: {
                    color: data.cardStyles.chartGridColor
                }
            },
            lineColor: data.cardStyles.chartGridColor,
            minorGridLineColor: data.cardStyles.chartGridColor,
            minorTickColor: data.cardStyles.chartGridColor,
            tickColor: data.cardStyles.chartGridColor,
        },
        yAxis: {
            gridLineColor: data.cardStyles.chartGridColor,
            visible: data.cardStyles.showChartGrid,
            lineColor: data.cardStyles.chartGridColor,
            minorGridLineColor: data.cardStyles.chartGridColor,
            minorTickColor: data.cardStyles.chartGridColor,
            tickColor: data.cardStyles.chartGridColor,
            labels: {
                style: {
                    color: data.cardStyles.chartGridColor
                }
            }
        },
        credits: {
            enabled: data.cardStyles.chartCreditsEnabled,
            style: {
                color: data.cardStyles.chartGridColor
            }
        }
    };
}

function getChartRenderOptions(chart) {
    return {
        chart: {
            renderTo: chart,
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
            visible: data.cardStyles.showChartGrid,
            gridLineColor: data.cardStyles.chartGridColor,
            labels: {
                style: {
                    color: data.cardStyles.chartGridColor
                }
            },
            title: {
                text: ''
            },
            lineColor: data.cardStyles.chartGridColor,
            minorGridLineColor: data.cardStyles.chartGridColor,
            minorTickColor: data.cardStyles.chartGridColor,
            tickColor: data.cardStyles.chartGridColor,
        },
        yAxis: {
            gridLineColor: data.cardStyles.chartGridColor,
            visible: data.cardStyles.showChartGrid,
            lineColor: data.cardStyles.chartGridColor,
            minorGridLineColor: data.cardStyles.chartGridColor,
            minorTickColor: data.cardStyles.chartGridColor,
            tickColor: data.cardStyles.chartGridColor,
            title: {
                text: ''
            },
            labels: {
                style: {
                    color: data.cardStyles.chartGridColor
                }
            }
        },
        credits: {
            enabled: data.cardStyles.chartCreditsEnabled,
            text: 'lcedit.com',
            style: {
                color: data.cardStyles.chartGridColor
            }
        },
        series: [
            {
                showInLegend: false,
                name: chart === 'chart' ? data.footerText : data.footerText2,
                marker: { enabled: false},
                color: data.cardStyles.chartLineColor,
                lineColor: data.cardStyles.chartLineColor,
                data: data.saveChartData ? ((chart === 'chart' ? data.liveGraph : data.liveGraph2) || []) : []
            }
        ]
    }
}

window.onload = async () => {
    COUNTER_THEME = 'livecountseditcompare';
    example_data.saveType = COUNTER_THEME;

    enableChartFeature();
    enableBannerFeature();
    enableCompareMode();

    const extraKeys = {
        boxColor: '#222233',
        bgColor: '#1a1a20',
        cardStyles: {
            chartLineColor: '#ff0000',
            chartGridColor: '#bdbdbd',
            chartCreditsEnabled: true,
            showChartGrid: true,
        },
        footerColor: '#ffffff',
        footerText: 'Subscribers',
        footerText2: 'Subscribers',
        gapMethod: 'absolute',
        gapText: 'Gap:',
        liveGraph2: [],
        maxChartValues: 450,
        nameColor: '#ffffff',
        showBanners: true,
        showImages: true,
        textColor: '#ffffff',
        lceditThemeSettings: {
            bannerBlur: 4,
            showFooter: true
        },
        partialExports: {
            lceditThemeSettings: true,
        }
    }

    example_data = mergeWithExampleData(extraKeys, example_data);

    const extraStyleOptions = [{
        type: 'html',
        value: '<br>'
    }, {
        title: 'Show avatars',
        value: true,
        type: 'checkbox',
        path: 'data.showImages'
    }, {
        title: 'Show banners',
        value: true,
        type: 'checkbox',
        path: 'data.showBanners'
    }, {
        title: 'Card background color',
        type: 'color',
        path: 'data.boxColor'
    },  {
        title: 'Show footers',
        value: true,
        type: 'checkbox',
        path: 'data.lceditThemeSettings.showFooter'
    }, {
        title: 'Left footer text',
        value: 'Subscribers',
        type: 'text',
        path: 'data.footerText'
    }, {
        title: 'Right footer text',
        value: 'Subscribers',
        type: 'text',
        path: 'data.footerText2'
    }, {
        title: 'Difference text',
        value: 'Gap:',
        type: 'text',
        path: 'data.gapText'
    }, {
        title: 'Footer color',
        type: 'color',
        path: 'data.footerColor'
    }, {
        title: 'Banner blur amount (pixels)',
        type: 'number',
        value: 4,
        path: 'data.lceditThemeSettings.bannerBlur',
        className: 's-width'
    }]

    MENU.tabs.find(x => x.title === 'Design Settings & Styling').items.splice(5, 0, ...extraStyleOptions);

    const gapMethodOption = {
        title: 'Difference method',
        value: 'absolute',
        type: 'select',
        path: 'data.gapMethod',
        options: [['absolute', 'Absolute value'],
        ['left', 'Left minus right'],
        ['right', 'Right minus left']]
    }

    MENU.tabs.find(x => x.title === 'Technical Settings').items.push(gapMethodOption);

    const extraChartOptions = [{
        title: 'Show lcedit.com chart credits',
        type: 'checkbox',
        value: true,
        path: 'data.cardStyles.chartCreditsEnabled'
    }, {
        title: 'Show chart grid',
        type: 'checkbox',
        value: true,
        path: 'data.cardStyles.showChartGrid'
    }, {
        title: 'Chart grid color',
        type: 'color',
        path: 'data.cardStyles.chartGridColor'
    }]

    const partialExportAddition = {
        title: '<abbr title="Whether or not to show the footer, the banner blur amount, and whether or not the counter is full screen.">Livecountsedit theme settings</abbr>',
        value: true,
        type: 'checkbox',
        path: 'data.partialExports.lceditThemeSettings',
        className: 'partial-export-option'
    }

    // Insert SocialBlade tab at second to last position
    //MENU.tabs.splice(-2, 0, insertedTab);

    // Insert partial export setting at fourth to last position
    MENU.tabs.find(x => x.title === 'Import & Export Data').items.splice(-3, 0, partialExportAddition);

    MENU.tabs.find(x => x.title === 'Chart Settings').items.push(...extraChartOptions);

    MENU.tabs.push({
        title: 'Credits',
        items: [{
            type: 'html',
            value: `<div>
                <h3>Questions, bugs, comments, or suggestions?</h3>
                <p>Read our <a href="/about/faq.html">website FAQ</a>.</p>
                <p>You can also join the <a href="/about/discord.html">Livecountsedit Discord server</a>!</p>
                <p>Livecountsedit is made by Straight From MG and RandomPerson3465.</p>
            </div>
            <hr>
            <div>
                <h3>Disclaimer</h3>
                <p>This page was inspired by popular live subscriber counter websites.</p>
                <p>Educational & fun purposes only. We do not condone the use of this site for spreading misinformation.</p>
            </div>`
        }]
    });

    try {
        data = await retrieveDataFromBrowser(COUNTER_THEME, 1);
        data = mergeWithExampleData(data, example_data);
    } catch (err) {
        console.error(err);
    }

    fixData(2);
    drawMenu(MENU, document.querySelector('.tabs'), document.querySelector('.tab-stuff'), document.querySelector('.tab-controls'));
    afterDrawingMenu();
    await processImport(data);
}

async function processImport(imported) {
    renderChart();
    importingStuff(imported, 2);
    fix();
    updateGainTypes(2);
    return imported;
}

function afterDrawingMenu2() {
    updateGainTypes(2);
    fillMenus();
    saveAPISettings(false);
    refreshCount();
}

function updateCounters2(doGains = true) {
    const count1 = data.data[0].getDisplayedCount();
    const count2 = data.data[1].getDisplayedCount();
    document.getElementById('subs1').innerText = count1;
    document.getElementById('subs2').innerText = count2;
    let gap = count1 - count2;
    if (data.gapMethod === 'right') {
        gap = -gap;
    } else if (data.gapMethod === 'absolute') {
        gap = Math.abs(gap);
    }
    document.querySelector('.subgap').innerText = gap;

    updateChart(count1);
    updateChart2(count2);
}

function fix(noOdo = false) {
    document.getElementById('name1').innerText = data.data[0].name || 'User';
    document.getElementById('name1').style.color = data.nameColor;
    document.getElementById('name2').innerText = data.data[1].name || 'User';
    document.getElementById('name2').style.color = data.nameColor;
    document.getElementById('subgapTitle').style.color = data.nameColor;
    document.getElementById('subgapTitle').innerText = data.gapText;

    if ((data.data[0].image || '/default.png') !== document.getElementById('image1').src) {
        document.getElementById('image1').src = data.data[0].image || '/default.png';
    }

    if ((data.data[0].banner || '/default_banner.png') !== document.getElementById('banner1').src) {
        document.getElementById('banner1').src = data.data[0].banner || '/default_banner.png';
    }

    if ((data.data[1].image || '/default.png') !== document.getElementById('image2').src) {
        document.getElementById('image2').src = data.data[1].image || '/default.png';
    }

    if ((data.data[1].banner || '/default_banner.png') !== document.getElementById('banner2').src) {
        document.getElementById('banner2').src = data.data[1].banner || '/default_banner.png';
    }

    if (data.cardStyles.showChart) {
        document.getElementById('chart').style.display = '';
        document.getElementById('chart2').style.display = '';
        chart.reflow();
        chart2.reflow();
    } else {
        document.getElementById('chart').style.display = 'none';
        document.getElementById('chart2').style.display = 'none';
    }

    document.body.style.backgroundColor = data.bgColor;
    document.querySelectorAll('.card,.subgap-card').forEach(x => x.style.backgroundColor = data.boxColor);
    document.body.style.fontWeight = data.counterFontWeight;
    document.body.style.fontFamily = data.mainFont;
    document.querySelectorAll('.avatar').forEach(x => x.style.display = data.showImages ? '' : 'none');
    document.querySelectorAll('.banner').forEach(x => {
        x.style.visibility = data.showBanners ? '' : 'hidden';
        x.style.filter = 'blur(' + data.lceditThemeSettings.bannerBlur+ 'px)';
    });

    document.querySelectorAll('.footer').forEach(x => {
        x.style.display = data.lceditThemeSettings.showFooter ? '' : 'none';
        x.style.color = data.footerColor;
    })

    document.getElementById('footer1').innerText = data.footerText;
    document.getElementById('footer2').innerText = data.footerText2;

    document.getElementById('counterColor').innerText = `
        .counter {
            color: ${data.textColor};
        }

        .subgap {
            color: ${data.textColor} !important;
        }
    `

    try {
        chart.update(getChartOptions());
        chart.series[0].update({
            color: data.cardStyles.chartLineColor,
            name: data.footerText,
            lineColor: data.cardStyles.chartLineColor
        });

        chart2.update(getChartOptions());
        chart2.series[0].update({
            color: data.cardStyles.chartLineColor,
            name: data.footerText2,
            lineColor: data.cardStyles.chartLineColor
        });

    } catch (err) {
        console.error(err);
    }

    if (!noOdo) updateOdo();
}

function renderChart() {
    chart = new Highcharts.chart(getChartRenderOptions('chart'));
    const chart2Options = structuredClone(getChartRenderOptions('chart2'));
    chart2Options.chart.renderTo = 'chart2';
    chart2Options.series[0].name = data.footerText2;
    chart2 = new Highcharts.chart(chart2Options);
}

// Swaps the channels.
async function unoReverse() {
    alert('This will refresh the page');
    data.data = [data.data[1], data.data[0]];
    [data.liveGraph, data.liveGraph2] = [data.liveGraph2, data.liveGraph];
    [data.footerText, data.footerText2] = [data.footerText2, data.footerText];
    await saveDataInBrowser(COUNTER_THEME, data);
    window.location.reload();
}