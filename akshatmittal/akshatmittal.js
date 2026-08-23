window.onload = async () => {
    COUNTER_THEME = 'akshatmittal';
    example_data.saveType = COUNTER_THEME;

    enableViewsAndVideoFeature();
    enableBannerFeature();

    const extraKeys = {
        boxColor: '#ffffff',
        bgColor: '#eef5f9',
        nameColor: '#605a64',
        mainFont: 'Roboto, sans-serif',
        textColor: '#605a64',
        footerColor: '#67757c',
        counterFontWeight: '300',
        odometerSpeed: 0.5,
        akshatmittalSettings: {
            countEditBox: false,
            showFeaturedUsers: true,
            showSocialMedia: true
        },
        partialExports: {
            akshatmittalSettings: true
        }
    };

    example_data = mergeWithExampleData(extraKeys, example_data);

    const insertedTab = {
        title: 'Akshatmittal Theme Settings',
        items: [
            {
                title: 'Edit count through "Search" box',
                value: false,
                type: 'checkbox',
                path: 'data.akshatmittalSettings.countEditBox'
            },
            {
                title: 'Show featured users section in sidebar',
                value: true,
                type: 'checkbox',
                path: 'data.akshatmittalSettings.showFeaturedUsers'
            },
            {
                title: 'Show social media buttons',
                value: true,
                type: 'checkbox',
                path: 'data.akshatmittalSettings.showSocialMedia'
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

    try {
        data = await retrieveDataFromBrowser(COUNTER_THEME, 1);
        data = mergeWithExampleData(data, example_data);
    } catch (err) {
        console.error(err);
    }

    if (!data) data = structuredClone(example_data);
    data.data = data.data.slice(0, 3);
    data.data = data.data.map(x => new Channel(x));
    while (data.data.length < 3) {
        data.data.push(new Channel());
    }

    // Load old API settings
    const oldAPIUpdates = localStorage.getItem('akshatmittal-apiUpdates');
    if (oldAPIUpdates) {
        try {
            const jsonData = JSON.parse(oldAPIUpdates);
            const oldSave = {
                apiUpdates: jsonData,
                data: [new Channel({ id: jsonData.channelID || uuidGen() }, new Channel(), new Channel())],
                partialExports: {
                    counters: true,
                    apiUpdates: true
                },
                saveType: COUNTER_THEME
            }
            delete oldSave.apiUpdates.channelID;
            if (confirm('You have old API update settings saved for the Akshatmittal counter. Would you like to save a backup just in case?')) {
                const file = new Blob([JSON.stringify(oldSave)], { type: 'text/plain' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(file);
                a.download = 'akshatmittal-legacy-api-updates.json';
                a.click();
                delete a;
            }

            delete oldSave.partialExports;
            data = mergeWithExampleData(oldSave, data);
            
        } catch (err) {
            console.error(err);
        }
        localStorage.removeItem('akshatmittal-apiUpdates');
    }

    drawMenu(MENU, document.getElementById('menuButtons'), document.getElementById('settingsMenus'), document.getElementById('controlButtons'));
    afterDrawingMenu();
    await processImport(data);
}

async function processImport(imported) {
    importingStuff(imported, 3);
    imported.data[1].name = 'Views';
    imported.data[2].name = 'Videos';
    fix();
    updateGainType(0);
    updateGainType(1);
    updateGainType(2);
    return imported;
}

function afterDrawingMenu2() {
    fillMenus(document.getElementById('settingsMenus'));
    updateGainType(0);
    updateGainType(1);
    updateGainType(2);
    saveAPISettings(false);
    refreshCount();

    document.getElementById('yt_searchbutton').addEventListener('click', () => {
        if (!data.akshatmittalSettings.countEditBox) return;
        const count = parseFloat(document.getElementById('yt_searchvalue').value);
        if (isFinite(count)) {
            data.data[0].count = count;
        }
    })
}

function updateCounters2(doGains = true) {
    const count = data.data[0].getDisplayedCount();
    document.getElementById('yt_subs').innerText = count;
    document.getElementById('yt_views').innerText = Math.floor(data.data[1].count);
    document.getElementById('yt_videos').innerText = Math.floor(data.data[2].count);
}

function fix(noOdo = false) {
    document.getElementById('yt_name').innerText = data.data[0].name || 'User';
    if (data.data[0].image !== document.getElementById('yt_profile').src) {
        document.getElementById('yt_profile').src = data.data[0].image;
    }
    if (data.data[0].banner !== document.getElementById('yt_cover').src) {
        document.getElementById('yt_cover').src = data.data[0].banner;
    }

    document.getElementById('pinned_nav').style.display = data.akshatmittalSettings.showFeaturedUsers ? 'block' : 'none';
    document.querySelectorAll(".social-media-buttons").forEach(x => x.style.display = data.akshatmittalSettings.showSocialMedia ? 'flex' : 'none');
    document.querySelector('.page-wrapper').style.backgroundColor = data.bgColor;
    document.getElementById('yt_name').style.color = data.nameColor;
    document.getElementById('yt_name').style.fontFamily = data.mainFont;
    document.getElementById('yt_subs').style.color = data.textColor;
    document.querySelectorAll('.odometer').forEach(x => {
        x.style.fontFamily = data.mainFont;
        x.style.fontWeight = data.counterFontWeight;
    });
    document.body.style.fontFamily = data.mainFont;
    document.querySelectorAll('.main-card').forEach(x => {
        x.style.backgroundColor = data.boxColor;
    });
    document.getElementById('footer').style.color = data.footerColor;
    document.getElementById('footer1').style.color = data.footerColor;
    document.getElementById('footer2').style.color = data.footerColor;
    document.getElementById('counterColor').innerText = `
        #counter {
            color: ${data.textColor};
        }
    `
    if (!noOdo) updateOdo();
}