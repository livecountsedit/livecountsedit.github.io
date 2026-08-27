window.onload = async () => {
    COUNTER_THEME = 'akshatmittalcompare';
    example_data.saveType = COUNTER_THEME;

    enableBannerFeature();
    enableCompareMode();

    const extraKeys = {
        boxColor: '#ffffff',
        bgColor: '#eef5f9',
        nameColor: '#605a64',
        mainFont: 'Roboto, sans-serif',
        textColor: '#605a64',
        footerColor: '#67757c',
        counterFontWeight: '300',
        odometerSpeed: 0.5,
        gapMethod: 'absolute',
        akshatmittalSettings: {
            countEditBox: false,
            showSocialMedia: true,
            showSubscribeAndChangeButtons: true,
            showTrophy: true,
        },
        partialExports: {
            akshatmittalSettings: true,
        }
    }

    example_data = mergeWithExampleData(extraKeys, example_data);

    const insertedTab = {
        title: 'Akshatmittal Theme Settings',
        items: [
            {
                title: 'Show boxes for editing counts in header',
                value: false,
                type: 'checkbox',
                path: 'data.akshatmittalSettings.countEditBox'
            },
            {
                title: 'Pressing "Subscribe" increases count by 1',
                value: true,
                type: 'checkbox',
                path: 'data.akshatmittalSettings.subscribeButton'
            },
            {
                title: 'Show social media buttons',
                value: true,
                type: 'checkbox',
                path: 'data.akshatmittalSettings.showSocialMedia'
            },
            {
                title: 'Show "Subscribe" and "Change" buttons',
                value: true,
                type: 'checkbox',
                path: 'data.akshatmittalSettings.showSubscribeAndChangeButtons'
            },
            {
                title: 'Show trophy icon for leading channel',
                value: true,
                type: 'checkbox',
                path: 'data.akshatmittalSettings.showTrophy'
            }
        ]
    }

    const partialExportAddition = {
        title: 'Akshatmittal settings',
        value: true,
        type: 'checkbox',
        path: 'data.partialExports.akshatmittalSettings',
        className: 'partial-export-option'
    }

    const styleAdditions = [{
        title: 'Card background color',
        type: 'color',
        path: 'data.boxColor'
    }, {
        title: 'Footer color',
        type: 'color',
        path: 'data.footerColor'
    }];

    // Insert Akshatmittal tab at second to last position
    MENU.tabs.splice(-2, 0, insertedTab);

    // Insert partial export setting at fourth to last position
    MENU.tabs.find(x => x.title === 'Import & Export Data').items.splice(-3, 0, partialExportAddition);
    
    MENU.tabs.find(x => x.title === 'Design Settings & Styling').items.splice(6, 0, ...styleAdditions);

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

    try {
        data = await retrieveDataFromBrowser(COUNTER_THEME, 1);
        data = mergeWithExampleData(data, example_data);
    } catch (err) {
        console.error(err);
    }

    fixData(2);

    // Load old API settings
    const oldAPIUpdates = localStorage.getItem('akshatmittal-compare-apiUpdates');
    if (oldAPIUpdates) {
        try {
            const jsonData = JSON.parse(oldAPIUpdates);
            const oldSave = {
                apiUpdates: jsonData,
                data: [new Channel({ id: (jsonData.updateSide === '1' ? jsonData.channelID : '') || uuidGen() }), new Channel({ id: (jsonData.updateSide === '2' ? jsonData.channelID : '') || uuidGen() })],
                partialExports: {
                    counters: true,
                    apiUpdates: true
                },
                saveType: COUNTER_THEME
            }
            delete oldSave.apiUpdates.channelID;
            if (confirm('You have old API update settings saved for the Akshatmittal compare counter. Would you like to save a backup just in case?')) {
                const file = new Blob([JSON.stringify(oldSave)], { type: 'text/plain' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(file);
                a.download = 'akshatmittalcompare-legacy-api-updates.json';
                a.click();
                delete a;
            }

            delete oldSave.partialExports;
            data = mergeWithExampleData(oldSave, data);
            
        } catch (err) {
            console.error(err);
        }
        localStorage.removeItem('akshatmittal-compare-apiUpdates');
    }
    drawMenu(MENU, document.querySelector('.tabs'), document.querySelector('.tab-stuff'), document.querySelector('.tab-controls'));
    afterDrawingMenu();
    await processImport(data);
}

async function processImport(imported) {
    importingStuff(imported, 2);
    fix();
    updateGainTypes(2);
    displayTrophy(data.data[0].getDisplayedCount(), data.data[1].getDisplayedCount());
    return imported;
}

function afterDrawingMenu2() {
    updateGainTypes(2);
    fillMenus();
    saveAPISettings(false);
    refreshCount();

    document.getElementById('saveCountButtonLeft').addEventListener('click', () => {
        const count = parseFloat(document.getElementById('left-input-count').value);
        if (isFinite(count)) {
            data.data[0].count = count;
        }
    })

    document.getElementById('saveCountButtonRight').addEventListener('click', () => {
        const count = parseFloat(document.getElementById('right-input-count').value);
        if (isFinite(count)) {
            data.data[1].count = count;
        }
    })
}

function updateCounters2(doGains = true) {
    const count1 = data.data[0].getDisplayedCount();
    const count2 = data.data[1].getDisplayedCount();
    document.getElementById('yt_subs_vs1').innerText = count1;
    document.getElementById('yt_subs_vs2').innerText = count2;
    let gap = count1 - count2;
    if (data.gapMethod === 'right') {
        gap = -gap;
    } else if (data.gapMethod === 'absolute') {
        gap = Math.abs(gap);
    }
    document.getElementById('yt_diff').innerText = gap;

    var iconPath = "trophy-icon.png";
    var ytNameVs1 = document.getElementById("yt_name_vs1");
    var ytNameVs2 = document.getElementById("yt_name_vs2");

    if (ytNameVs1.querySelector("img.trophy-icon")) ytNameVs1.querySelector("img.trophy-icon").remove();
    if (ytNameVs2.querySelector("img.trophy-icon")) ytNameVs2.querySelector("img.trophy-icon").remove();

    displayTrophy(count1, count2)
}

function displayTrophy(c1, c2) {
    var iconPath = "trophy-icon.png";
    var ytNameVs1 = document.getElementById("yt_name_vs1");
    var ytNameVs2 = document.getElementById("yt_name_vs2");
    if (c1 > c2) {
        var img = document.createElement("img");
        img.src = iconPath;
        img.className = "trophy-icon";
        ytNameVs1.style.position = "relative";
        ytNameVs1.appendChild(img);
    } else if (c1 < c2) {
        var img = document.createElement("img");
        img.src = iconPath;
        img.className = "trophy-icon";
        ytNameVs2.style.position = "relative";
        ytNameVs2.appendChild(img);
    }
}

function fix(noOdo = false) {
    document.querySelectorAll('.vs1_name').forEach(x => x.innerText = data.data[0].name || 'User');
    document.querySelectorAll('.vs2_name').forEach(x => x.innerText = data.data[1].name || 'User');
    
    document.getElementById('yt_name_vs1').style.color = data.nameColor;
    document.getElementById('yt_name_vs2').style.color = data.nameColor;
    document.getElementById('count_name_1').style.color = data.footerColor;
    document.getElementById('count_name_2').style.color = data.footerColor;
    document.getElementById('yt_diff_name').style.color = data.footerColor;
    document.querySelector('.display-title').style.color = data.footerColor;
    document.querySelectorAll('.main-card .font-light').forEach(x => x.style.color = data.textColor);

    if ((data.data[0].image || '/default.png') !== document.getElementById('yt_profile_vs1').src) {
        document.getElementById('yt_profile_vs1').src = data.data[0].image || '/default.png';
    }

    if ((data.data[0].banner || '/default_banner.png') !== document.getElementById('yt_cover_vs1').src) {
        document.getElementById('yt_cover_vs1').src = data.data[0].banner || '/default_banner.png';
    }

    if ((data.data[1].image || '/default.png') !== document.getElementById('yt_profile_vs2').src) {
        document.getElementById('yt_profile_vs2').src = data.data[1].image || '/default.png';
    }

    if ((data.data[1].banner || '/default_banner.png') !== document.getElementById('yt_cover_vs2').src) {
        document.getElementById('yt_cover_vs2').src = data.data[1].banner || '/default_banner.png';
    }

    document.querySelector('.page-wrapper').style.backgroundColor = data.bgColor;
    document.querySelectorAll('.main-card').forEach(x => x.style.backgroundColor = data.boxColor);
    document.querySelectorAll('.odometer').forEach(x => {
        x.style.fontFamily = data.mainFont;
        x.style.fontWeight = data.counterFontWeight;
    });

    document.getElementById('counterColor').innerText = `
        #yt_subs_vs1, #yt_subs_vs2 {
            color: ${data.textColor};
        }

        #yt_diff {
            color: ${data.textColor} !important;
        }
    `

    document.querySelectorAll('.selcl').forEach(x => {
        if (data.akshatmittalSettings.showSocialMedia) {
            x.style.display = '';
        } else {
            x.style.display = 'none';
        }
    })

    document.querySelectorAll('.sub-and-change').forEach(x => {
        if (data.akshatmittalSettings.showSubscribeAndChangeButtons) {
            x.style.display = '';
            document.querySelector('.main-row').style.marginBottom = '';
        } else {
            x.style.display = 'none';
            document.querySelector('.main-row').style.marginBottom = '20px';
        }
    })

    document.querySelectorAll('.manual-input').forEach(x => {
        if (data.akshatmittalSettings.countEditBox) {
            x.style.display = 'block';
        } else {
            x.style.display = 'none';
        }
    })

    if (data.akshatmittalSettings.showTrophy) {
        document.getElementById('noTrophy').innerText = '';
    } else {
        document.getElementById('noTrophy').innerText = `
            .trophy-icon {
                display: none;
            }
        `
    }

    const cardColor = getComputedStyle(document.querySelector('.selcl')).backgroundColor.replace('rgb(','').replace(')','').split(', ');
    const colorDistanceSquared = (cardColor[0] - 153) ** 2 + (cardColor[1] - 171) ** 2 + (cardColor[2] - 180) ** 2;
    if (colorDistanceSquared < 2000) {
        document.getElementById('shareOnTwitterColor').innerText = `
            .text-muted {
                color: white !important;
            }
        `
    } else {
        document.getElementById('shareOnTwitterColor').innerText = '';
    }
    if (!noOdo) updateOdo();
}


// Swaps the channels.
async function unoReverse() {
    alert('This will refresh the page');
    data.data = [data.data[1], data.data[0]];
    await saveDataInBrowser(COUNTER_THEME, data);
    window.location.reload();
}

function subLeft() {
    if (data.akshatmittalSettings.subscribeButton) {
        data.data[0].count++;
    }
}

function subRight() {
    if (data.akshatmittalSettings.subscribeButton) {
        data.data[1].count++;
    }
}