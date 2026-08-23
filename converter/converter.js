const MAPPINGS = {
    LCEDIT_7_0_ANIMATION_TYPE: ['default', 'ytstudio', 'counting', 'minimal'],
    LCEDIT_7_0_FONT_TYPE: ['none','serif','sans-serif','monospace','math'],
    LCEDIT_7_0_GAIN_TYPE: ['uniform', 'gaussian', 'custom'],
    LCEDIT_7_0_NUMBER_FORMAT: {
        ",ddd": "comma",
        ".ddd": "dot",
        " ddd": "space",
        "d": "noSep"
    },
    YT_STUDIO_NUMBER_FORMAT: {
        "(,ddd)": "comma",
        "(.ddd)": "dot",
        "( ddd)": "space"
    }
}

// this formula is explained in commonUtils.js
function convertCustomDistribution(dist) {
    try {
        const rows = dist.split('\n').map(x => x.replace(/ +/g, '').split(',').map(x => parseFloat(x)));
        let totalWeight = 0;
        let avg = 0;
        let variance = 0;
        for (const row of rows) {
            avg += (row[0] + row[1]) * row[2];
            variance += (row[0] * row[0] + row[0] * row[1] + row[1] * row[1]) * row[2];
            totalWeight += row[2];
        }
        avg /= (totalWeight + totalWeight);
        variance /= (3 * totalWeight);
        variance -= avg * avg;
        if (!isFinite(avg)) avg = 0;
        let stdev = Math.sqrt(Math.max(0, variance));
        if (!isFinite(stdev)) stdev = 0;
        return [avg, stdev];
    } catch (err) {
        console.error(err);
        return [0, 0];
    }
}

function convert_lcedit_7_0_to_top_50(imported) {
    const data = {
        cardStyles: {},
        lastOnline: imported.lastSaved,
        lceditThemeSettings: {},
        lcnetSettings: {},
        pause: imported.paused,
        saveVersion: 9,
    }

    if (imported.counters.length) {
        const counter = imported.counters[0];
        const newCounter = {

            // currently unused
            custom_counter_data: {}
        };
        data.data = [];
        data.data[0] = newCounter;
        data.abbreviate = counter.settings.abb;
        data.odometerSpeed = counter.settings.animationDuration;
        data.animationType = MAPPINGS.LCEDIT_7_0_ANIMATION_TYPE[counter.settings.animationType];
        data.lceditThemeSettings.bannerBlur = counter.settings.bannerBlur;
        data.data[0].banner = counter.settings.bannerURL;
        data.bgColor = counter.settings.bgColor;
        data.cardStyles.chartLineColor = counter.settings.chartColor;
        if ('chartGridColor' in counter.settings) data.cardStyles.chartGridColor = counter.settings.chartGridColor;
        if ('chartCreditsEnabled' in counter.settings) data.cardStyles.chartCreditsEnabled = counter.settings.chartCreditsEnabled;
        data.data[0].count = counter.settings.count;
        data.textColor = counter.settings.counterColor;
        if (counter.settings.customRate) {
            data.data[0].custom_counter_data.custom_rate = counter.settings.customRate;
        }
        data.odometerDown = counter.settings.downColor;
        if ('font' in counter.settings && 'fontType' in counter.settings) {
            data.mainFont = counter.settings.fontType <= 4 ? MAPPINGS.LCEDIT_7_0_FONT_TYPE[counter.settings.fontType] : counter.settings.font;
            data.importFromGoogleFonts = counter.settings.fontType === 6;
        }
        if ('fontWeight' in counter.settings) {
            data.counterFontWeight = counter.settings.fontWeight;
        }
        data.footerText = counter.settings.footer;
        data.footerColor = counter.settings.footerColor;
        data.data[0].gain_per = 'second';
        data.data[0].gain_per_number = counter.settings.gainPer;
        data.data[0].gain_type = MAPPINGS.LCEDIT_7_0_GAIN_TYPE[counter.settings.gainType]
        data.data[0].image = counter.settings.imageURL;
        data.saveChartData = counter.settings.keepChartData;
        if ('lcNetSubButton' in counter.settings) {
            data.lcnetSettings.subButton = counter.settings.lcNetSubButton;
        }
        data.data[0].custom_counter_data.max = counter.settings.max;
        data.maxChartValues = counter.settings.maxChartValues;
        data.data[0].max_gain = counter.settings.maxRate;
        data.data[0].mean_gain = counter.settings.gainType === 1 ? counter.settings.meanRate : null;
        data.data[0].mean_gain_value = counter.settings.meanRate;
        data.data[0].custom_counter_data.min = counter.settings.min;
        data.allowNegative = counter.settings.min < 0 || counter.settings.max < 0;
        data.data[0].min_gain = counter.settings.minRate;
        if ('numberFormat' in counter.settings) {
            data.numberFormat = MAPPINGS.LCEDIT_7_0_NUMBER_FORMAT[counter.settings.numberFormat] || "comma";
        }
        if ('offlineGains' in counter.settings) {
            data.offlineGains = counter.settings.offlineGains;
        }
        if ('reverseAnimation' in counter.settings) {
            data.reverseAnimation = counter.settings.reverseAnimation;
        }
        data.showBanners = counter.settings.showBanner;
        data.cardStyles.showChart = counter.settings.showChart;
        if ('showChartGrid' in counter.settings) {
            data.cardStyles.showChartGrid = counter.settings.showChartGrid;
        }
        data.lceditThemeSettings.showFooter = counter.settings.showFooter;
        data.showImages = counter.settings.showImage;
        data.data[0].std_gain = counter.settings.gainType === 1 ? counter.settings.stdevRate : null;
        data.data[0].std_gain_value = counter.settings.stdevRate;

        // For compatibility with Top 50
        if (counter.settings.gainType === 2) {
            const meanStdev = convertCustomDistribution(counter.settings.customRate);
            data.data[0].mean_gain = meanStdev[0];
            data.data[0].std_gain = meanStdev[1];
        }
        data.data[0].name = counter.settings.title;
        data.nameColor = counter.settings.titleColor;
        data.odometerUp = counter.settings.upColor;
        data.data[0].custom_counter_data.updateProbability = counter.settings.updateProbability;
        data.updateInterval = counter.settings.updateInterval * 1000;
        data.useOdometerColors = true;
        data.data[0].last_api_count = counter.lastAPICount;
        data.liveGraph = counter.chartData || [];
    }

    data.lceditThemeSettings.isFullScreen = imported.isFullScreen;

    if (imported.apiUpdates) {
        const channelID = imported.apiUpdates.channelID;
        if (channelID && data.data && data.data.length) {
            data.data[0].id = channelID;
            delete imported.apiUpdates.channelID;
        }
        data.apiUpdates = imported.apiUpdates;
    }

    if (imported.api && imported.api.leeway) {
        if (!data.apiUpdates) {
            data.apiUpdates = {};
        }
        data.apiUpdates.leeway = imported.api.leeway;
    }

    return data;
}

function convert_yt_studio_to_top_50(imported) {
    const data = {
        cardStyles: {},
        lastOnline: Date.now(),
        ytStudioSettings: {},
        pause: false,
        saveVersion: 9,
    }
    const newCounter = {
        custom_counter_data: {}
    };
    data.data = [];
    data.data[0] = newCounter;
    data.ytStudioSettings.headerColor = '#1f1f1f'; // the header color on studio.
    data.bgColor = '#282828'; // the background color on studio.

    data.footerColor = '#aaaaaa';
    data.nameColor = '#ffffff';
    data.textColor = '#ffffff';
    data.cardStyles.chartLineColor = '#3fabcd';
    data.cardStyles.chartGridColor = '#3d3d3d';
    data.cardStyles.chartBaseColor = '#9e9e9e';
    // label color will use the same color as the footer

    data.mainFont = 'Roboto, sans-serif';
    data.counterFontWeight = '700';

    data.data[0].name = imported.name;
    data.data[0].image = imported.image;
    data.data[0].count = isFinite(imported.count) ? imported.count : 0;
    data.data[0].min_gain = isFinite(imported.min_gain) ? imported.min_gain : 0;
    data.data[0].max_gain = isFinite(imported.max_gain) ? imported.max_gain : 0;
    data.data[0].gain_type = 'uniform';
    data.animationType = 'ytstudio';
    data.updateInterval = imported.updateInterval;
    data.graphDates = imported.graphDates.join(', ');
    data.graphValues = imported.graphValues.join(', ');
    data.useStaticGraph = imported.graphType === 'set';
    data.ytStudioSettings.dropdownTopText = imported.dropdownTopText;
    data.ytStudioSettings.dropdownBottomText = imported.dropdownBottomText;
    data.maxChartValues = imported.maxPoints;
    data.autosave = imported.autosave;
    data.footerText = imported.footer;
    data.numberFormat = MAPPINGS.YT_STUDIO_NUMBER_FORMAT[imported.commaFormat] || 'comma';
    return data;
}