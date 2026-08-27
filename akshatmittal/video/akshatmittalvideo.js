window.onload = async () => {
    COUNTER_THEME = 'akshatmittalvideo';
    example_data.saveType = COUNTER_THEME;

    enableViewCounterMode();

    const extraKeys = {
        boxColor: '#ffffff',
        bgColor: '#eef5f9',
        nameColor: '#605a64',
        mainFont: 'Roboto, sans-serif',
        textColor: '#605a64',
        footerColor: '#67757c',
        footerText: 'Views',
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

    fixData(4);
    drawMenu(MENU, document.getElementById('menuButtons'), document.getElementById('settingsMenus'), document.getElementById('controlButtons'));
    afterDrawingMenu();
    await processImport(data);
}

async function processImport(imported) {
    importingStuff(imported, 4);
    fix();
    updateGainTypes(4);
    return imported;
}

function afterDrawingMenu2() {
    fillMenus(document.getElementById('settingsMenus'));
    updateGainTypes(4);
    saveAPISettings(false);
    refreshCount();

    document.getElementById('yt_searchbutton').addEventListener('click', () => {
        if (!data.akshatmittalSettings.countEditBox) return;
        const count = parseFloat(document.getElementById('yt_searchvalue').value);
        if (isFinite(count)) {
            data.data[0].count = count;
        }
    })

    document.querySelector('.navbar-header').addEventListener('click', () => {
        hidenav();
    })
}

function hidenav() {
    if (document.querySelector('.left-sidebar').style.display === 'none') {
        document.querySelector('.left-sidebar').style.display = '';
        document.querySelector('.page-wrapper').style.marginLeft = '';
        document.querySelector('.menu').style.width = '';
    } else {
        document.querySelector('.left-sidebar').style.display = 'none';
        document.querySelector('.page-wrapper').style.marginLeft = '0';
        document.querySelector('.menu').style.width = '100%';
    }
}

function updateCounters2(doGains = true) {
    const count = data.data[0].getDisplayedCount();
    document.getElementById('yt_subs').innerText = count;

    const likeCount = data.data[1].getDisplayedCount();
    document.getElementById('yt_likes').innerText = likeCount;

    const dislikeCount = data.data[2].getDisplayedCount();
    document.getElementById('yt_dislikes').innerText = dislikeCount;

    const commentCount = data.data[3].getDisplayedCount();
    document.getElementById('yt_comments').innerText = commentCount;
}

function fix(noOdo = false) {
    document.getElementById('yt_name').innerText = data.data[0].name || 'Video';
    if ((data.data[0].image || '/default_thumbnail.jpg') !== document.getElementById('yt_profile').src) {
        document.getElementById('yt_profile').src = data.data[0].image || '/default_thumbnail.jpg';
    }

    document.getElementById('pinned_nav').style.display = data.akshatmittalSettings.showFeaturedUsers ? 'block' : 'none';
    document.querySelectorAll(".social-media-buttons").forEach(x => x.style.display = data.akshatmittalSettings.showSocialMedia ? 'flex' : 'none');
    document.querySelector('.page-wrapper').style.backgroundColor = data.bgColor;
    document.getElementById('yt_name').style.color = data.nameColor;
    document.getElementById('yt_name').style.fontFamily = data.mainFont;
    document.querySelectorAll('.odometer').forEach(x => {
        x.style.fontFamily = data.mainFont;
        x.style.fontWeight = data.counterFontWeight;
    });
    document.body.style.fontFamily = data.mainFont;
    document.querySelectorAll('.main-card').forEach(x => {
        x.style.backgroundColor = data.boxColor;
    });

    const numberEnabled = data.viewCounters.likes + data.viewCounters.dislikes + data.viewCounters.comments;
    const cardClass = 'col-12 ' + (numberEnabled === 3 ? 'col-lg-4' : (numberEnabled === 2 ? 'col-lg-6': 'col-lg-12'));

    document.getElementById('headerText').style.color = data.footerColor;
    document.getElementById('likeCounter').style.display = data.viewCounters.likes ? '' : 'none';
    document.getElementById('likeCounter').className = cardClass;
    document.getElementById('dislikeCounter').style.display = data.viewCounters.dislikes ? '' : 'none';
    document.getElementById('dislikeCounter').className = cardClass;
    document.getElementById('commentCounter').style.display = data.viewCounters.comments ? '' : 'none';
    document.getElementById('commentCounter').className = cardClass;
    document.getElementById('footer').style.color = data.footerColor;
    document.getElementById('footer').innerText = data.footerText;
    document.getElementById('footer1').style.color = data.footerColor;
    document.getElementById('footer1').innerText = data.viewCounters.likesFooter;
    data.data[1].name = data.viewCounters.likesFooter;
    document.getElementById('footer2').style.color = data.footerColor;
    document.getElementById('footer2').innerText = data.viewCounters.dislikesFooter;
    data.data[2].name = data.viewCounters.dislikesFooter;
    document.getElementById('footer3').style.color = data.footerColor;
    document.getElementById('footer3').innerText = data.viewCounters.commentsFooter;
    data.data[3].name = data.viewCounters.commentsFooter;
    document.getElementById('counterColor').innerText = `
        #yt_subs, #yt_likes, #yt_dislikes, #yt_comments {
            color: ${data.textColor};
        }
    `
    if (!noOdo) updateOdo();
}