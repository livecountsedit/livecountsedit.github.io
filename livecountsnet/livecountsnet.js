window.onload = async () => {

    COUNTER_THEME = 'livecountsnet';
    example_data.saveType = COUNTER_THEME;
    enableViewsAndVideoFeature(true);

    const extraKeys = {
        bgColor: '#d0e4fe',
        showImages: true,
        lcnetSettings: {
            subButton: true,
            viewCounter: false,
        },
        partialExports: {
            lcnetSettings: true,
        }
    }

    example_data = mergeWithExampleData(extraKeys, example_data);

    const extraCounterOptions = [{
        title: 'Show avatar',
        value: true,
        type: 'checkbox',
        path: 'data.showImages'
    }, {
        type: 'html',
        value: "<p>Note: The avatar is only visible if the window's aspect ratio is 6:5 or lower.</p>"
    }, {
        title: 'Clicking "Subscribe!" increases sub count by 1',
        value: true,
        type: 'checkbox',
        path: 'data.lcnetSettings.subButton' 
    }];

    MENU.tabs.find(x => x.title === 'Counter Settings').items.push(...extraCounterOptions);

    const extraViewCounterOptions = [
        {
            title: 'Use view counter',
            value: false,
            type: 'checkbox',
            path: 'data.lcnetSettings.viewCounter'
        }, {
            type: 'html',
            value: "<p>Note: the view counter will only show if the window's aspect ratio is 5:3 or lower.</p>"
        }
    ]

    MENU.tabs.find(x => x.title === 'View Counter').items.splice(0, 0, ...extraViewCounterOptions);

    const partialExportAddition = {
        title: '<abbr title="Whether or not to use the view counter & whether or not pressing &quot;Subscribe&quot; increases the count by 1.">Livecounts.net theme settings</abbr>',
        value: true,
        type: 'checkbox',
        path: 'data.partialExports.lcnetSettings',
        className: 'partial-export-option'
    }

    // Insert SocialBlade tab at second to last position
    //MENU.tabs.splice(-2, 0, insertedTab);

    // Insert partial export setting at fourth to last position
    MENU.tabs.find(x => x.title === 'Import & Export Data').items.splice(-3, 0, partialExportAddition);

    MENU.tabs.push({
        title: 'Credits',
        items: [{
            type: 'html',
            value: `<div>
                <h3>Questions, bugs, comments, or suggestions?</h3>
                <p>Read our <a href="/about/faq.html">website FAQ</a>.</p>
                <p>You can also join the <a href="/about/discord.html">Livecountsedit Discord server</a>!</p>
            </div>
            <hr>
            <div>
                <h3>Disclaimer</h3>
                <p>This page is a parody of the original Livecounts.net counter by @ColleensCuber (<a href="https://x.com/LivecountsSite">@LivecountsSite</a>).</p>
                <p>All credit goes to them for the design of this page.</p>
                <p>No copyright infrigment is intended. Educational & fun purposes only.</p>
                <p>We do not condone the use of this site for spreading misinformation.</p>
            </div>`
        }]
    })

    const oldData = localStorage.getItem('lcedit-lcnet');
    if (oldData) {
        try {
            if (confirm('You have old data saved in your browser that needs to be converted. Would you like to save a backup just in case?')) {
                const file = new Blob([oldData], { type: 'text/plain' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(file);
                a.download = 'livecountsnet-legacy.json';
                a.click();
                delete a;
            }

            const oldSave = convert_lcedit_7_0_to_top_50(JSON.parse(oldData));
            data = mergeWithExampleData(oldSave, example_data);
        } catch (err) {
            console.error(err);
        }
        localStorage.removeItem('lcedit-lcnet');
    } else {
        try {
            data = await retrieveDataFromBrowser(COUNTER_THEME, 1);
            data = mergeWithExampleData(data, example_data);
        } catch (err) {
            console.error(err);
        }
    }

    fixData(2);
    drawMenu(MENU, document.querySelector('.tabs'), document.querySelector('.tab-stuff'), document.querySelector('.tab-controls'));
    afterDrawingMenu();
    await processImport(data);
}

async function processImport(imported) {
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

    document.getElementById('saveCountButton').addEventListener('click', () => {
        const count = parseFloat(document.getElementById('lcnet-input-count').value);
        if (isFinite(count)) {
            data.data[0].count = count;
        }
    })
}

function updateCounters2(doGains = true) {
    const count = data.data[0].getDisplayedCount();
    document.getElementById('lcnet-count').innerText = count;

    if (data.lcnetSettings.viewCounter) {
        const viewCount = data.data[1].getUnabbreviatedCount();
        document.getElementById('lcnet-small-count').innerText = viewCount;
        document.getElementById('lcnet-small-text').innerText = 'total video views'
    } else {
        const goal = calculateNextGoal(count);
        const subsLeft = goal - count;
        document.getElementById('lcnet-small-count').innerText = subsLeft;
        document.getElementById('lcnet-small-text').innerText = 'subscribers to ' + formatNumber(goal)
    }
}

function livecountsNetSubscribe() {
    if (data.lcnetSettings.subButton) data.data[0].count++;
}

function fix(noOdo = false) {
    document.getElementById('lcnet-name').innerText = data.data[0].name || 'User';
    document.getElementById('lcnet-update-text').innerText = `updated every ${data.updateInterval / 1000} second${data.updateInterval === 1000 ? '' : 's'}`
    if ((data.data[0].image || '/default.png') !== document.getElementById('lcnet-avatar').src) {
        document.getElementById('lcnet-avatar').src = data.data[0].image || '/default.png';
    }

    document.body.style.backgroundColor = data.bgColor;
    document.querySelector('.counter-container').style.color = data.textColor;
    document.querySelector('.counter-container-2').style.color = data.textColor;
    document.querySelector('.counter-content').style.color = data.nameColor;
    document.body.style.fontWeight = data.counterFontWeight;
    document.body.style.fontFamily = data.mainFont;
    document.getElementById('lcnet-avatar').style.display = data.showImages ? '' : 'none';

    document.getElementById('counterColor').innerText = `
        #counter {
            color: ${data.textColor};
        }
        #lcnet-small-count {
            color: ${data.textColor} !important;
        }
    `

    document.getElementById('lcnet-small-text').style.color = data.textColor;
    if (!noOdo) updateOdo();
}

function calculateNextGoal(n) {
    if (n < 10) return 10;
    else return (Math.floor(n/(10**Math.floor(Math.log10(n)))) + 1)*(10**Math.floor(Math.log10(n)));
}

function setLightTheme() {
    const values = {
        nameColor: '#000000',
        textColor: '#000000',
        bgColor: '#d0e4fe'
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
        bgColor: '#34393f'
    }

    for (const key of Object.keys(values)) {
        document.getElementById(key).value = values[key];
        document.getElementById(key).dispatchEvent(new Event('change'));
    }
}