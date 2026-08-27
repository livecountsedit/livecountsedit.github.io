let chart;

window.onload = async () => {

    document.getElementById('versionNumber').innerText = VERSION;

    COUNTER_THEME = 'livecountsedit';
    example_data.saveType = COUNTER_THEME;
    
    enableChartFeature();
    enableBannerFeature();

    const extraKeys = {
        bgColor: '#222233',
        cardStyles: {
            chartLineColor: '#ff0000',
            chartGridColor: '#bdbdbd',
            chartCreditsEnabled: true,
            showChartGrid: true
        },
        footerColor: '#ffffff',
        footerText: 'Subscribers',
        maxChartValues: 450,
        nameColor: '#ffffff',
        showImages: true,
        textColor: '#ffffff',
        lceditThemeSettings: {
            bannerBlur: 4,
            isFullScreen: false,
            showFooter: true,
        },
        partialExports: {
            lceditThemeSettings: true,
        }
    }


    example_data = mergeWithExampleData(extraKeys, example_data);

    const extraCounterOptions = [{
        title: 'Show avatar',
        value: true,
        type: 'checkbox',
        path: 'data.showImages'
    }, {
        title: 'Show banner',
        value: true,
        type: 'checkbox',
        path: 'data.showBanners'
    }];

    MENU.tabs.find(x => x.title === 'Counter Settings').items.push(...extraCounterOptions);

    const extraStyleOptions = [{
        type: 'html',
        value: '<br>'
    },{
        title: 'Show footer',
        value: true,
        type: 'checkbox',
        path: 'data.lceditThemeSettings.showFooter'
    }, {
        title: 'Footer text',
        value: 'Subscribers',
        type: 'text',
        path: 'data.footerText'
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
    })

    const oldData = localStorage.getItem('lcedit-lcedit');
    if (oldData) {
        try {
            if (confirm('You have old data saved in your browser that needs to be converted. Would you like to save a backup just in case?')) {
                const file = new Blob([oldData], { type: 'text/plain' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(file);
                a.download = 'livecountsedit-legacy.json';
                a.click();
                delete a;
            }

            const oldSave = convert_lcedit_7_0_to_top_50(JSON.parse(oldData));
            data = mergeWithExampleData(oldSave, example_data);
        } catch (err) {
            console.error(err);
        }
        localStorage.removeItem('lcedit-lcedit');
    } else {
        try {
            data = await retrieveDataFromBrowser(COUNTER_THEME, 1);
            data = mergeWithExampleData(data, example_data);
        } catch (err) {
            console.error(err);
        }
    }

    fixData();
    drawMenu(MENU, document.querySelector('.tabs'), document.querySelector('.tab-stuff'), document.querySelector('.tab-controls'));
    afterDrawingMenu();
    await processImport(data);
}

async function processImport(imported) {
    renderChart();
    importingStuff(imported);
    fix();
    updateGainTypes();
    toggleFullScreen(data.lceditThemeSettings.isFullScreen || false);
    return imported;
}

function afterDrawingMenu2() {
    updateGainTypes();
    fillMenus();
    saveAPISettings(false);
    refreshCount();
}

function updateCounters2(doGains = true) {
    const count = data.data[0].getDisplayedCount();
    document.getElementById('counter-counter').innerText = count;
    updateChart(count);
}

function fix(noOdo = false) {
    document.getElementById('counter-title').innerText = data.data[0].name || 'User';
    document.getElementById('counter-title').style.color = data.nameColor;

    if ((data.data[0].image || '/default.png') !== document.getElementById('counter-avatar').src) {
        document.getElementById('counter-avatar').src = data.data[0].image || '/default.png';
    }

    if ((data.data[0].banner || '/default_banner.png') !== document.getElementById('counter-banner').src) {
        document.getElementById('counter-banner').src = data.data[0].banner || '/default_banner.png';
    }

    if (data.cardStyles.showChart) {
        document.getElementById('counter-chart').style.display = '';
        chart.reflow();
    } else {
        document.getElementById('counter-chart').style.display = 'none';
    }

    document.querySelector('.counter-area').style.backgroundColor = data.bgColor;
    document.body.style.fontWeight = data.counterFontWeight;
    document.body.style.fontFamily = data.mainFont;
    document.getElementById('counter-avatar').style.display = data.showImages ? '' : 'none';
    document.getElementById('counter-banner').style.visibility = data.showBanners ? '' : 'hidden';
    document.getElementById('counter-banner').style.filter = 'blur(' + data.lceditThemeSettings.bannerBlur + 'px)';

    document.getElementById('counter-footer').innerText = data.footerText;
    document.getElementById('counter-footer').style.display = data.lceditThemeSettings.showFooter ? '' : 'none';
    document.getElementById('counter-footer').style.color = data.footerColor;
    document.getElementById('counterColor').innerText = `
        #counter-counter {
            color: ${data.textColor};
        }
    `
    try {
        chart.update({
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
        });
        chart.series[0].update({
            color: data.cardStyles.chartLineColor,
            name: data.footerText,
            lineColor: data.cardStyles.chartLineColor
        })
    } catch (err) {
        console.error(err);
    }
    if (!noOdo) updateOdo();
}

function renderChart() {
    chart = new Highcharts.chart({
        chart: {
            renderTo: 'counter-chart',
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
                name: data.footerText,
                marker: { enabled: false},
                color: data.cardStyles.chartLineColor,
                lineColor: data.cardStyles.chartLineColor,
                data: data.saveChartData ? (data.liveGraph || []) : []
            }
        ]
    })
}

function toggleFullScreen(value) {
    if (value !== undefined) {
        data.lceditThemeSettings.isFullScreen = value;
    } else {
        data.lceditThemeSettings.isFullScreen = !data.lceditThemeSettings.isFullScreen;
    }
    document.querySelector('.menu').style.display = data.lceditThemeSettings.isFullScreen ? 'none' : '';
    if (data.lceditThemeSettings.isFullScreen) {
        document.querySelector(".counter-content").style.width = "100%";
        document.querySelector(".counter-content").style.border = "none";
        document.body.style.backgroundColor = data.bgColor;
        document.querySelector(".page-footer").style.color = data.textColor;
    } else {
        document.querySelector(".counter-content").style.width = "50%";
        document.querySelector(".counter-content").style.border = "1px solid var(--border-color, #ddd)";
        document.body.style.backgroundColor = "var(--bg-color, #1a1a20)";
        document.querySelector(".page-footer").style.color = '';
    }
    if (chart) chart.reflow();
}