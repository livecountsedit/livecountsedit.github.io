const updaters = new Map();

let COUNTER_THEME = '';
let data;
let example_data = {
    abbreviate: false,
    allowNegative: false,
    animationType: 'default',
    apiUpdates: {
        enabled: false,
        url: '',
        interval: 10000,
        method: 'GET',
        body: {},
        headers: {},
        custom: false,
        maxChannelsPerFetch: 'one',
        customAPIList: [],
        response: {
            loop: 'data',
            name: {
                enabled: true,
                path: 'name',
            },
            count: {
                enabled: true,
                path: 'count',
            },
            image: {
                enabled: true,
                path: 'image',
            },
            id: {
                path: 'id',
                IDIncludes: false
            }
        },
        forceUpdates: false,
        leeway: 0,
    },
    autosave: true,
    bgColor: '#ffffff',
    counterFontWeight: '400',
    data: [],
    debugMode: true,
    editorShowsExactCount: false,
    importFromGoogleFonts: false,
    index: 1,
    intervalCount: 0,
    lastOnline: Date.now(),
    mainFont: 'Arial, Helvetica, sans-serif',
    nameColor: '#000000',
    numberFormat: 'comma',
    odometerDown: '#c00000',
    odometerSpeed: 2,
    odometerUp: '#008000',
    partialExports: {
        state: true, // State and preferences
        counters: true, // Counters
        names: true, // Counter name
        counts: true, // Counter counts
        avatars: true, // Counter avatars
        gains: true, // Counter gains
        designSettings: true, // Design settings
        styles: true, // Styling
        technicalSettings: true, // Technical settings
        apiUpdates: true, // API updates
    },
    pause: false,
    reverseAnimation: false,
    saveType: '',
    saveVersion: SAVE_VERSION,
    streamerMode: false,
    textColor: '#000000',
    updateInterval: 2000,
    useOdometerColors: false,
    versionCreated: VERSION,
    versionLastOpened: VERSION
}

const MENU = {
    tabs: [
        {
            title: 'Counter Settings',
            items: [
                {
                    title: 'Username',
                    value: 'User',
                    type: 'text',
                    path: 'data.data.0.name',
                    id: 'usernameInput'
                },
                {
                    title: 'Count',
                    value: 0,
                    type: 'number',
                    path: 'data.data.0.count',
                    className: 'count-input'
                },
                {
                    title: 'Gain type',
                    value: 'uniform',
                    type: 'select',
                    path: 'data.data.0.gain_type',
                    options: [['uniform', 'Min/max'],
                    ['gaussian', 'Mean/standard deviation'],
                    ['custom', 'Custom distribution']],
                    func: function (item) {
                        updateGainType(0);
                    }
                },
                {
                    title: 'Min gain',
                    value: 0,
                    type: 'number',
                    path: 'data.data.0.min_gain',
                    className: 'uniform-gain-setting-0'
                },
                {
                    title: 'Max gain',
                    value: 0,
                    type: 'number',
                    path: 'data.data.0.max_gain',
                    className: 'uniform-gain-setting-0'
                },
                {
                    title: 'Mean gain',
                    value: 0,
                    type: 'number',
                    path: 'data.data.0.mean_gain_value',
                    className: 'gaussian-gain-setting-0',
                    func: function (item) {
                        updateGainType(0);
                    }
                },
                {
                    title: 'Standard deviation',
                    value: 0,
                    type: 'number',
                    path: 'data.data.0.std_gain_value',
                    className: 'gaussian-gain-setting-0',
                    func: function (item) {
                        updateGainType(0);
                    }
                },
                {
                    title: 'Custom distribution<br>',
                    value: '',
                    type: 'textarea',
                    path: 'data.data.0.custom_counter_data.custom_rate',
                    className: 'custom-gain-setting-0',
                    placeholder: 'min1, max1, weight1\nmin2, max2, weight2\n...',
                    func: function (item) {
                        updateGainType(0);
                    }
                },
                {
                    title: 'Gain is per every: ',
                    items: [
                        {
                            value: 1,
                            type: 'number',
                            path: 'data.data.0.gain_per_number',
                            className: 's-width'
                        },
                        {
                            value: 'second',
                            type: 'select',
                            path: 'data.data.0.gain_per',
                            options: [['second', 'second(s)'],
                            ['updateInterval', 'update interval(s)'],
                            ['minute', 'minute(s)'],
                            ['hour', 'hour(s)'],
                            ['day', 'day(s)']]
                        }
                    ]
                },
                {
                    title: '<abbr title="Adds variability to the counter updating. Gains will scale accordingly.">Update probability (%)</abbr>',
                    type: 'number',
                    value: 100,
                    placeholder: 100,
                    path: 'data.data.0.custom_counter_data.updateProbability',
                    className: 's-width'
                },
                {
                    type: 'html',
                    value: '<br>'
                },
                {
                    title: 'Minimum count',
                    type: 'number',
                    value: '',
                    path: 'data.data.0.custom_counter_data.min',
                    placeholder: 'Leave blank for none'
                },
                {
                    title: 'Maximum count',
                    type: 'number',
                    value: '',
                    path: 'data.data.0.custom_counter_data.max',
                    placeholder: 'Leave blank for none'
                },
                {
                    type: 'html',
                    value: '<br>'
                },
                {
                    title: 'Avatar URL',
                    value: '',
                    type: 'text',
                    path: 'data.data.0.image',
                    id: 'counterAvatarURL',
                },
                {
                    type: 'html',
                    value: '<button onclick="document.getElementById(\'counterAvatarFile\').click()">Upload avatar</button><input type="file" id="counterAvatarFile" url-destination="counterAvatarURL" class="hidden-file-input" accept="image/*">'
                }
            ]
        },
        {
            title: 'Design Settings & Styling',
            items: [
                {
                    title: 'Username color',
                    type: 'color',
                    path: 'data.nameColor',
                    id: 'nameColor',
                },
                {
                    title: 'Counter color',
                    type: 'color',
                    path: 'data.textColor',
                    id: 'textColor',
                },
                {
                    title: 'Odometer up color',
                    type: 'color',
                    path: 'data.odometerUp'
                },
                {
                    title: 'Odometer down color',
                    type: 'color',
                    path: 'data.odometerDown'
                },
                {
                    title: 'Use odometer colors',
                    type: 'checkbox',
                    path: 'data.useOdometerColors'
                },
                {
                    title: 'Background color',
                    type: 'color',
                    path: 'data.bgColor',
                    id: 'bgColor'
                },
                {
                    type: 'html',
                    value: '<br>'
                },
                {
                    title: 'Font',
                    type: 'text',
                    path: 'data.mainFont',
                    func: function (item) {
                        if (data.importFromGoogleFonts) {
                            loadMyFont();
                        }
                    }
                },
                {
                    title: 'Import from Google Fonts',
                    type: 'checkbox',
                    path: 'data.importFromGoogleFonts',
                    func: function (item) {
                        if (data.importFromGoogleFonts) {
                            loadMyFont();
                        }
                    }
                },
                {
                    title: '<abbr title="Note: not all font weights are supported on all fonts">Font weight</abbr>',
                    type: 'select',
                    path: 'data.counterFontWeight',
                    options: [
                        ['100', 'Thin'],
                        ['200', 'Extra Light'],
                        ['300', 'Light'],
                        ['400', 'Regular'],
                        ['500', 'Medium'],
                        ['600', 'Semibold'],
                        ['700', 'Bold'],
                        ['800', 'Extra Bold'],
                        ['900', 'Black']
                    ]
                },
                {
                    type: 'html',
                    value: '<br>'
                },
                {
                    title: 'Odometer animation type',
                    type: 'select',
                    path: 'data.animationType',
                    options: [
                        ['default', 'Odometer (default)'],
                        ['ytstudio', 'Odometer (YouTube studio)'],
                        ['counting', 'Counting'],
                        ['minimal', 'Odometer (minimal)']
                    ]
                },
                {
                    title: 'Odometer animation duration (seconds)',
                    type: 'number',
                    value: 2,
                    path: 'data.odometerSpeed',
                    className: 's-width'
                },
                {
                    title: 'Reverse odometer animation',
                    type: 'checkbox',
                    value: false,
                    path: 'data.reverseAnimation'
                },
                {
                    title: 'Number format',
                    type: 'select',
                    value: 'comma',
                    path: 'data.numberFormat',
                    options: [
                        ['comma', '12,345,678.9'],
                        ['dot', '12.345.678,9'],
                        ['space', '12 345 678.9'],
                        ['spaceComma', '12 345 678,9'],
                        ['indian', '1,23,45,678.9'],
                        ['apo', "12'345'678.9"],
                        ['apoComma', "12'345'678,9"],
                        ['noSep', '12345678.9'],
                        ['noSepComma', '12345678,9']
                    ]
                }
            ]
        },
        {
            title: 'Technical Settings',
            items: [
                {
                    title: 'Update interval (seconds)',
                    type: 'number',
                    value: 2,
                    id: 'updateInterval',
                    className: 's-width'
                },
                {
                    title: 'Editor shows exact internal count',
                    type: 'checkbox',
                    value: true,
                    path: 'data.editorShowsExactCount',
                    func: function (item) {
                        refreshCount();
                    }
                },
                {
                    title: 'Abbreviate count',
                    type: 'checkbox',
                    value: false,
                    path: 'data.abbreviate'
                },
                {
                    title: 'Allow negative count',
                    type: 'checkbox',
                    value: false,
                    path: 'data.allowNegative'
                },
                {
                    title: 'Debug mode',
                    type: 'checkbox',
                    value: true,
                    path: 'data.debugMode'
                },
                {
                    title: 'Offline gains',
                    type: 'checkbox',
                    value: false,
                    path: 'data.offlineGains'
                }
            ]
        },
        {
            title: 'API Updates',
            items: [
                {
                    title: 'Channel ID',
                    type: 'text',
                    value: '',
                    path: 'data.data.0.id',
                    func: function (item) {
                        regenerateDuplicatedID();
                    }
                },
                {
                    type: 'html',
                    value: '<a href="https://www.streamweasels.com/tools/youtube-channel-id-and-user-id-convertor/">Channel ID finder for YouTube</a>'
                },
                {
                    type: 'html',
                    value: '<br>'
                },
                {
                    title: 'API preset',
                    value: 'custom',
                    type: 'select',
                    id: 'apiSourcePreset',
                    options: [['custom', 'Custom'],
                    ['mixerno1', 'mixerno.space (abbreviated)'],
                    ['mixerno2', 'mixerno.space (estimated)']]
                },
                {
                    title: '<abbr title="Put the variable {{channelID}} where the channel ID should go. Otherwise, by default it will go at the very end.">API request URL</abbr>',
                    value: '',
                    type: 'text',
                    path: 'data.apiUpdates.url',
                    className: 'api-setting',
                    auto: false,
                    streamerMode: true
                },
                {
                    title: 'API request method',
                    value: 'GET',
                    type: 'select',
                    path: 'data.apiUpdates.method',
                    className: 'api-setting',
                    auto: false,
                    options: [['GET', 'GET'], ['POST', 'POST']]
                },
                {
                    type: 'html',
                    value: '<br>'
                },
                {
                    title: 'Loop through (data = root JSON object)',
                    value: 'data',
                    type: 'text',
                    path: 'data.apiUpdates.response.loop',
                    className: 'api-setting',
                    auto: false
                },
                {
                    title: 'HTTP request headers (advanced, optional)',
                    value: '',
                    placeholder: 'Authorization: code;\nAuthorization2: code2;',
                    type: 'textarea',
                    id: 'apiHeaders',
                    streamerMode: true
                },
                {
                    title: 'HTTP request body (advanced, optional)',
                    value: '',
                    placeholder: 'Value1: hi;\nValue2: lol;',
                    type: 'textarea',
                    id: 'apiBody',
                    streamerMode: true
                },
                {
                    type: 'html',
                    value: '<br>'
                },
                {
                    title: 'Update name',
                    value: false,
                    type: 'checkbox',
                    path: 'data.apiUpdates.response.name.enabled',
                    className: 'api-setting',
                    auto: false
                },
                {
                    title: 'Path to name',
                    value: '',
                    type: 'text',
                    path: 'data.apiUpdates.response.name.path',
                    className: 'api-setting',
                    auto: false
                },
                {
                    type: 'html',
                    value: '<br>'
                },
                {
                    title: 'Update count',
                    value: false,
                    type: 'checkbox',
                    path: 'data.apiUpdates.response.count.enabled',
                    className: 'api-setting',
                    auto: false
                },
                {
                    title: 'Path to count',
                    value: '',
                    type: 'text',
                    path: 'data.apiUpdates.response.count.path',
                    className: 'api-setting',
                    auto: false
                },
                {
                    type: 'html',
                    value: '<br>'
                },
                {
                    title: 'Update avatar',
                    value: false,
                    type: 'checkbox',
                    path: 'data.apiUpdates.response.image.enabled',
                    className: 'api-setting',
                    auto: false
                },
                {
                    title: 'Path to avatar',
                    value: '',
                    type: 'text',
                    path: 'data.apiUpdates.response.image.path',
                    className: 'api-setting',
                    auto: false
                },
                {
                    type: 'html',
                    value: '<br>'
                },
                {
                    title: 'Path to ID (required)',
                    value: '',
                    type: 'text',
                    path: 'data.apiUpdates.response.id.path',
                    className: 'api-setting',
                    auto: false
                },
                {
                    title: '<abbr title="Enable if the path to ID in the API actually returns a different string with the channel ID in it.">ID is part of another string</abbr>',
                    value: false,
                    type: 'checkbox',
                    path: 'data.apiUpdates.response.id.IDIncludes',
                    className: 'api-setting',
                    auto: false
                },
                {
                    type: 'html',
                    value: '<br>'
                },
                {
                    title: '<abbr title="If enabled, it uses the full API count. If disabled, it only checks for updates on the abbreviated count and you make your own estimations.">Force API updates</abbr>',
                    value: false,
                    type: 'checkbox',
                    path: 'data.apiUpdates.forceUpdates',
                    className: 'api-setting',
                    auto: false
                },
                {
                    title: '<abbr title="If you overestimate the abbreviated count, the amount to bring the count back down by. Example: with 10%, and an abbreviated count of 101M, if your estimation reaches 102M before the API reaches 102M, your count gets brought back down to 101.9M. If you used 20%, it would be 101.8M. Has no effect if the previous box is checked.">Overestimation leeway (%)</abbr>',
                    value: 0,
                    type: 'number',
                    path: 'data.apiUpdates.leeway',
                    className: 'api-setting s-width',
                    auto: false,
                },
                {
                    type: 'html',
                    value: '<br>'
                },
                {
                    title: 'API update interval (seconds)',
                    value: 10,
                    type: 'number',
                    id: 'apiUpdateInterval',
                    className: 's-width'
                },
                {
                    type: 'html',
                    value: '<br><button id="toggleAPIUpdates" onclick="toggleAPIUpdates()">Save & Enable API Updates</button><button id="saveAPI" onclick="saveAPISettings()">Save API Update Settings</button><button onlick="updateAPINow()">Update Now</button>'
                },
                {
                    type: 'html',
                    value: '<p>Status: <span id="apiUpdateStatus">--</span></p>'
                }
            ]
        },
        {
            title: 'Import & Export Data',
            items: [
                {
                    type: 'html',
                    value: '<p>Select what you would like included in your import/export:</p><br>'
                },
                {
                    title: '<abbr title="e.g. Whether or not the counter is paused, streamer mode status, etc.">Current state and preferences</abbr>',
                    value: true,
                    type: 'checkbox',
                    path: 'data.partialExports.state',
                    className: 'partial-export-option'
                },
                {
                    title: 'Counter',
                    value: true,
                    type: 'checkbox',
                    path: 'data.partialExports.counters',
                    className: 'partial-export-option'
                },
                {
                    title: 'Counter name',
                    value: true,
                    type: 'checkbox',
                    path: 'data.partialExports.names',
                    className: 'partial-export-option'
                },
                {
                    title: 'Counter values',
                    value: true,
                    type: 'checkbox',
                    path: 'data.partialExports.counts',
                    className: 'partial-export-option'
                },
                {
                    title: 'Counter avatar',
                    value: true,
                    type: 'checkbox',
                    path: 'data.partialExports.avatars',
                    className: 'partial-export-option'
                },
                {
                    title: 'Counter gain',
                    value: true,
                    type: 'checkbox',
                    path: 'data.partialExports.gains',
                    className: 'partial-export-option'
                },
                {
                    title: 'Design settings',
                    value: true,
                    type: 'checkbox',
                    path: 'data.partialExports.designSettings',
                    className: 'partial-export-option'
                },
                {
                    title: 'Styling',
                    value: true,
                    type: 'checkbox',
                    path: 'data.partialExports.styles',
                    className: 'partial-export-option'
                },
                {
                    title: 'Technical settings',
                    value: true,
                    type: 'checkbox',
                    path: 'data.partialExports.technicalSettings',
                    className: 'partial-export-option'
                },
                {
                    title: 'API updates',
                    value: true,
                    type: 'checkbox',
                    path: 'data.partialExports.apiUpdates',
                    className: 'partial-export-option'
                },
                {
                    type: 'html',
                    value: '<br><button onclick="enableAllPartialExports()">Select all</button><button onclick="disableAllPartialExports()">Deselect all</button><button onclick="toggleAllPartialExports()">Toggle all</button>'
                },
                {
                    type: 'html',
                    value: '<br><p class="obs-mode">Note: All OBS browser source imports/exports are full imports/exports. Partial saves do not apply.</p><button class="no-obs-mode" onclick="exportData()">Export Data</button><button class="obs-mode" onclick="obsExport()">Export Data (OBS Browser Source)</button>'
                },
                {
                    type: 'html',
                    value: '<button class="no-obs-mode" onclick="document.getElementById(\'fileImport\').click()">Import Data</button><input type="file" id="fileImport" class="hidden-file-input" accept=".json, .txt"><button class="obs-mode" onclick="obsImport()">Import Data (OBS Browser Source)</button><input type="file" id="obsImportFile" class="hidden-file-input" accept=".json, .txt"><br>'
                },
                {
                    title: 'Autosave (15s)',
                    type: 'checkbox',
                    path: 'data.autosave',
                    id: 'autosaveToggle',
                    func: function (item) {
                        updateAutoSave();
                        saveInBrowser(COUNTER_THEME, false);
                    }
                }
            ]
        },
        {
            title: 'Search Settings',
            items: [
                {
                    type: 'html',
                    value: '<input type="text" id="settingsSearch" placeholder="e.g. update interval"><div class="search-results"></div>'
                }
            ]
        }
    ],
    controls: [
        ['pauseB', 'Pause', 'pause()'],
        ['resetB', 'Reset', 'reset()'],
        ['saveInBrowser', 'Save (in browser)', 'saveInBrowser(COUNTER_THEME, true)'],
        ['streamerModeB', 'Enable Streamer Mode', 'toggleStreamerMode()'],
        ['obsModeB', 'Enable OBS Browser Mode', 'promptOBSMode()'],
        ['refreshCountB', 'Refresh count', 'refreshCount()']
    ]
}

function displaySetting(index) {
    const tabs = document.querySelectorAll('.settings');
    for (i = 0; i < tabs.length; i++) {
        if (i === index) tabs[i].classList.remove('hidden');
        else tabs[i].classList.add('hidden')
    }
    document.querySelectorAll('.tab-button').forEach(x => x.classList.remove('active'));
    document.getElementById('button_' + index).classList.add('active')
}

function fix(noOdo = false) {
    return alert('dummy');
}

function drawMenu(menu, buttons, divs, controls) {
    for (i = 0; i < menu.tabs.length; i++) {
        const tab = menu.tabs[i];
        if (tab.disabled) continue;
        const button = document.createElement('button');
        button.className = 'tab-button';
        button.innerText = tab.title;
        button.id = 'button_' + i;
        button.setAttribute('onclick', `displaySetting(${i})`);
        buttons.appendChild(button);

        const settingsTab = document.createElement('div');
        settingsTab.className = 'settings hidden';
        settingsTab.id = i;
        const h2 = document.createElement('h2');
        h2.innerText = tab.title;
        const hr = document.createElement('hr');

        for (const item of tab.items) {
            const div = document.createElement('div');
            if (item.type === 'html') {
                div.innerHTML = item.value;
            } else {
                div.className = 'settings-container';
                const label = document.createElement('label');
                label.innerHTML = item.title + ' ';
                let itemArray = item.items || [item];
                for (const subItem of itemArray) {
                    let elem;
                    let colorRemover;
                    if (subItem.type === 'textarea') {
                        elem = document.createElement('textarea');
                    } else if (subItem.type === 'select') {
                        elem = document.createElement('select');
                        for (const option of subItem.options) {
                            const optionElem = document.createElement('option');
                            optionElem.value = option[0];
                            optionElem.innerText = option[1];
                            elem.appendChild(optionElem);
                        }
                    } else {
                        elem = document.createElement('input');
                        elem.type = subItem.type;
                    }

                    if (subItem.className) elem.className = subItem.className;
                    if (subItem.id) elem.id = subItem.id;

                    if (subItem.type !== 'checkbox') {
                        if (subItem.value != undefined) elem.value = subItem.value;
                        if (subItem.placeholder != undefined) elem.placeholder = subItem.placeholder;
                        if (subItem.type === 'color') {
                            colorRemover = document.createElement('button');
                            colorRemover.innerText = 'X';
                            colorRemover.onclick = () => {
                                const splitPath = subItem.path.split('.');
                                if (splitPath[0] === 'data') {
                                    let location = example_data;
                                    for (i = 1; i < splitPath.length - 1; i++) {
                                        location = location[splitPath[i]];
                                    }
                                    colorRemover.previousElementSibling.value = location[splitPath[splitPath.length - 1]];
                                    colorRemover.previousElementSibling.dispatchEvent(new Event('change'));
                                }
                            }
                        }
                    } else {
                        elem.checked = Boolean(subItem.value);
                    }
                    if (subItem.path) {
                        elem.setAttribute('data-path', subItem.path);
                        const func = subItem.func || (function (_) {});
                        if (subItem.auto !== false) {
                            if (subItem.type === 'checkbox') {
                                elem.addEventListener('change', e => {
                                    const splitPath = subItem.path.split('.');
                                    if (splitPath[0] === 'data') {
                                        let location = data;
                                        for (i = 1; i < splitPath.length - 1; i++) {
                                            location = location[splitPath[i]];
                                        }
                                        location[splitPath[splitPath.length - 1]] = e.target.checked;
                                    }
                                    func(subItem);
                                    fix();
                                })
                            } else if (subItem.type === 'number') {
                                elem.addEventListener('change', e => {
                                    const splitPath = subItem.path.split('.');
                                    if (splitPath[0] === 'data') {
                                        let location = data;
                                        for (i = 1; i < splitPath.length - 1; i++) {
                                            location = location[splitPath[i]];
                                        }
                                        location[splitPath[splitPath.length - 1]] = parseFloat(e.target.value);
                                    }
                                    func(subItem);
                                    fix();
                                })
                            } else {
                                elem.addEventListener('change', e => {
                                    const splitPath = subItem.path.split('.');
                                    if (splitPath[0] === 'data') {
                                        let location = data;
                                        for (i = 1; i < splitPath.length - 1; i++) {
                                            location = location[splitPath[i]];
                                        }
                                        location[splitPath[splitPath.length - 1]] = e.target.value;
                                    }
                                    func(subItem);
                                    fix();
                                })
                            }
                        }
                    }
                    if (subItem.streamerMode) {
                        const streamerModeWrapper = document.createElement('div');
                        streamerModeWrapper.className = 'streamer-mode-wrapper';
                        streamerModeWrapper.appendChild(elem);
                        const streamerModeDiv = document.createElement('div');
                        streamerModeDiv.className = 'streamer-mode';
                        streamerModeDiv.innerText = 'Turn off Streamer Mode to view this!';
                        streamerModeWrapper.appendChild(streamerModeDiv); 
                        label.appendChild(streamerModeWrapper);
                    } else {
                        label.appendChild(elem);
                    }
                    if (colorRemover) {
                        label.appendChild(colorRemover);
                    }
                }
                div.appendChild(label);
            }
            settingsTab.appendChild(div);
        }
        divs.appendChild(settingsTab);
    }
    for (i = 0; i < menu.controls.length; i++) {
        const button = document.createElement('button');
        button.id = menu.controls[i][0];
        button.innerText = menu.controls[i][1];
        button.setAttribute('onclick', menu.controls[i][2]);
        controls.appendChild(button);
    }
    buttons.firstElementChild.click();
}

function toggleAPIUpdates() {
    data.apiUpdates.enabled = !data.apiUpdates.enabled;
    if (!data.apiUpdates.enalbed) {
        if (document.getElementById('apiUpdateStatus')) {
            document.getElementById('apiUpdateStatus').innerText = '--';
            document.getElementById('apiUpdateStatus').style.color = '';
        }
    }
    saveAPISettings(false);
}

function saveAPISettings(shouldAlert = true) {
    document.getElementById('toggleAPIUpdates').innerText = data.apiUpdates.enabled ? 'Save & Disable API Updates' : 'Save & Enable API Updates';
    const updater = updaters.get('api');
    if (updater) {
        clearInterval(updater);
    }

    document.querySelectorAll('.api-setting').forEach(x => {
        const splitPath = x.getAttribute('data-path').split('.');
        if (splitPath[0] === 'data') {
            let location = data;
            for (i = 1; i < splitPath.length - 1; i++) {
                location = location[splitPath[i]];
            }
            location[splitPath[splitPath.length - 1]] = x.type === 'checkbox' ? x.checked : (x.type === 'number' ? parseFloat(x.value) : x.value);
        }
    })

    let headers = document.getElementById('apiHeaders').value.toString().split(';').filter(x => x.trim());
    let newHeaders = {};
    for (let i = 0; i < headers.length; i++) {
        let header = headers[i].split(':').map(x => x.trim());
        if (header[1]) {
            newHeaders[header[0]] = header[1];
        }
    }
    data.apiUpdates.headers = newHeaders;
    
    let body = document.getElementById('apiBody').value.toString().split(';').filter(x => x.trim());
    let newBody = {};
    for (let i = 0; i < body.length; i++) {
        let b = body[i].split(':').map(x => x.trim());
        if (b[1]) {
            newBody[b[0]] = b[1];
        }
    }
    data.apiUpdates.body = newBody;

    data.apiUpdates.interval = clamp(parseFloat(document.getElementById('apiUpdateInterval').value) * 1000 || 10000, 1000, 2147483647);

    if (data.apiUpdates.enabled) {
        updaters.set('api', setInterval(updateAPINow, data.apiUpdates.interval, true));
        updateAPINow(true);
    }

    if (shouldAlert) alert('API settings saved!')
}

async function updateAPINow(bypass = false) {

    if (!data.apiUpdates.enabled) {
        if (!bypass) return alert('You need to enable API updates first.')
        return;
    }

    if (!data.apiUpdates.url || !data.data[0].id) {
        if (!bypass) return alert('You must configure the API URL and channel ID first.')
        return;
    }

    if (data.debugMode) {
        console.log('API updating...')
    }

    try {
        let url = data.apiUpdates.url;
        url = url.includes('{{channelID}}') ? url.replace('{{channelID}}', data.data[0].id) : url + data.data[0].id;
        
        let fetchOptions = {
            method: data.apiUpdates.method || 'GET'
        }

        if (Object.keys(data.apiUpdates.headers).length > 0) {
            fetchOptions.headers = data.apiUpdates.headers;
        }

        if (data.apiUpdates.method === 'POST' && Object.keys(data.apiUpdates.body).length > 0) {
            fetchOptions.body = JSON.stringify(data.apiUpdates.body);
        }

        const response = await fetch(url, fetchOptions);
        const json = await response.json();

        let apiData = json;
        if (data.apiUpdates.response.loop !== 'data') {
            const loopPath = data.apiUpdates.response.loop.split('data.')[1];
            if (loopPath) {
                const parts = loopPath.split('.');
                for (const part of parts) {
                    apiData = apiData[part];
                }
            }
        }

        if (!Array.isArray(apiData)) {
            apiData = [apiData];
        }

        if (!apiData.length) {
            throw new Error('No data returned from API');
        }

        const item = apiData[0];
        let nameUpdate, countUpdate, imageUpdate, bannerUpdate, viewsUpdate, videosUpdate, idUpdate, commentsUpdate;

        function getItemFromPath(item, path) {
            const pathParts = path.split('.');
            let result = item;
            for (const part of pathParts) {
                if (part.includes('[')) {
                    const [arrName, index] = part.split('[');
                    const idx = parseInt(index.split(']')[0]);
                    result = result[arrName][idx];
                } else {
                    result = result[part];
                }
            }
            return result;
        }
        
        if (data.apiUpdates.response.name.enabled) {
            nameUpdate = getItemFromPath(item, data.apiUpdates.response.name.path)
        }
        
        if (data.apiUpdates.response.count.enabled) {
            countUpdate = parseFloat(getItemFromPath(item, data.apiUpdates.response.count.path));
        }
        
        if (data.apiUpdates.response.image.enabled) {
            imageUpdate = getItemFromPath(item, data.apiUpdates.response.image.path);
        }

        if (data.apiUpdates.response.banner?.enabled) {
            bannerUpdate = getItemFromPath(item, data.apiUpdates.response.banner.path);
        }

        // views update: for Akshatmittal & Livecounts.net themes
        // corresponds to likes on view counters
        if (data.apiUpdates.response.views?.enabled) {
            viewsUpdate = parseFloat(getItemFromPath(item, data.apiUpdates.response.views.path));
        }

        // corresponds to dislikes on view counters
        if (data.apiUpdates.response.videos?.enabled) {
            videosUpdate = parseFloat(getItemFromPath(item, data.apiUpdates.response.videos.path));
        }

        if (data.apiUpdates.response.comments?.enabled) {
            commentsUpdate = parseFloat(getItemFromPath(item, data.apiUpdates.response.comments.path));
        }
        
        idUpdate = getItemFromPath(item, data.apiUpdates.response.id.path);

        function updateStuff() {
            if (nameUpdate !== undefined) {
                data.data[0].name = nameUpdate;
            }
            if (imageUpdate !== undefined) {
                data.data[0].image = imageUpdate;
            }
            if (bannerUpdate !== undefined) {
                data.data[0].banner = bannerUpdate;
            }
            if (viewsUpdate !== undefined && typeof viewsUpdate == 'number' && isFinite(viewsUpdate)) {
                if (data.data[1]) data.data[1].count = viewsUpdate;
            }
            if (videosUpdate !== undefined && typeof videosUpdate == 'number' && isFinite(videosUpdate)) {
                if (data.data[2]) data.data[2].count = videosUpdate;
            }
            if (commentsUpdate !== undefined && typeof commentsUpdate == 'number' && isFinite(commentsUpdate)) {
                if (data.data[3]) data.data[3].count = commentsUpdate;
            }
            if (countUpdate !== undefined && typeof countUpdate === 'number' && isFinite(countUpdate)) {
                data.data[0].isSubCounter() ? data.data[0].adjustForAPI(countUpdate) : data.data[0].count = countUpdate;
            }
        }
        
        if (data.apiUpdates.response.id.IDIncludes) {
            if (idUpdate && idUpdate.includes(data.data[0].id)) {
                updateStuff();
            }
        } else {
            if (idUpdate === data.data[0].id) {
                updateStuff();
            }
        }

        if (nameUpdate !== undefined && document.getElementById('usernameInput').value !== nameUpdate) {
            document.getElementById('usernameInput').value = nameUpdate;
        }

        if (imageUpdate !== undefined && document.getElementById('counterAvatarURL').value !== imageUpdate) {
            document.getElementById('counterAvatarURL').value = imageUpdate;
        }

        if (bannerUpdate !== undefined && document.getElementById('counterBannerURL') && document.getElementById('counterBannerURL').value !== bannerUpdate) {
            document.getElementById('counterBannerURL').value = bannerUpdate;
        }

        fix(true);
        
        if (document.getElementById('apiUpdateStatus')) {
            document.getElementById('apiUpdateStatus').innerText = 'OK';
            document.getElementById('apiUpdateStatus').style.color = 'green';
        }
    } catch (err) {
        if (data.debugMode) console.error(err);
        if (document.getElementById('apiUpdateStatus')) {
            document.getElementById('apiUpdateStatus').innerText = 'Error';
            document.getElementById('apiUpdateStatus').style.color = 'darkred';
        }
    }

}

function fillMenus() {
    const elems = document.querySelectorAll('[data-path]');
    elems.forEach(x => {
        const splitPath = x.getAttribute('data-path').split('.');
        if (splitPath[0] === 'data') {
            let location = data;
            for (i = 1; i < splitPath.length - 1; i++) {
                location = location[splitPath[i]];
            }

            if (x.type === 'checkbox') {
                x.checked = Boolean(location[splitPath[splitPath.length - 1]]);
            } else {
                if (location[splitPath[splitPath.length - 1]] == undefined) {
                    x.value = '';
                } else {
                    x.value = location[splitPath[splitPath.length - 1]];
                }
            }
        }
    })
    document.getElementById('updateInterval').value = data.updateInterval / 1000;
    loadAPIUpdates();
    refreshCount();
}

function loadAPIUpdates() {
    document.getElementById('apiHeaders').value = Object.keys(data.apiUpdates.headers)
        .map(x => `${x}: ${data.apiUpdates.headers[x]};`).join('\n');
    document.getElementById('apiBody').value = Object.keys(data.apiUpdates.body)
        .map(x => `${x}: ${data.apiUpdates.body[x]};`).join('\n');
    document.getElementById('apiUpdateInterval').value = clamp(data.apiUpdates.interval, 1000, 2147483647) / 1000;
}


function updateAutoSave() {
    if (data.autosave) {
        updaters.set('autosave', setInterval(saveInBrowser, AUTOSAVE_INTERVAL, COUNTER_THEME, false));
    } else {
        const interval = updaters.get('autosave');
        if (interval) {
            clearInterval(interval);
        }
    }
}

async function reset() {
    if (confirm('Are you sure you want to reset? This cannot be undone!')) {
        await deleteDataInBrowser(COUNTER_THEME, 1);
        window.location.reload();
    }
}

function updateGainType(index) {
    const counter = data.data[index];
    if (counter) {
        if (counter.gain_type === 'gaussian') {
            counter.mean_gain = counter.mean_gain_value;
            counter.std_gain = counter.std_gain_value;
            document.querySelectorAll('.uniform-gain-setting-' + index).forEach(x => x.parentElement.style.display = 'none');
            document.querySelectorAll('.gaussian-gain-setting-' + index).forEach(x => x.parentElement.style.display = '');
            document.querySelectorAll('.custom-gain-setting-' + index).forEach(x => x.parentElement.style.display = 'none');
        } else if (counter.gain_type === 'custom') {
            const customGains = counter.custom_counter_data.custom_rate || '';
            const result = {
                totalWeight: 0,
                entries: [],
            };
            let totalWeight = 0;
            const rows = customGains.split('\n');
            for (i = 0; i < rows.length; i++) {
                const rowData = rows[i].replace(/ +/g, '').split(',')
                const weight = clamp(parseFloat(rowData[2]), 0, Number.MAX_VALUE) || 0;
                totalWeight += weight;
                const entry = {
                    min: parseFloat(rowData[0]) || 0,
                    max: parseFloat(rowData[1]) || 0,
                    weight: weight,
                    cutoff: totalWeight
                };
                result.entries.push(entry);
                result.totalWeight = totalWeight;
            }
            counter.custom_counter_data.custom_distribution = result;

            // For compatibility with Top 50, we convert the custom distribution to one with equivalent mean and standard deviation.
            counter.mean_gain = counter.getUnitMeanGain();
            counter.std_gain = counter.getUnitStDevGain();

            document.querySelectorAll('.uniform-gain-setting-' + index).forEach(x => x.parentElement.style.display = 'none');
            document.querySelectorAll('.gaussian-gain-setting-' + index).forEach(x => x.parentElement.style.display = 'none');
            document.querySelectorAll('.custom-gain-setting-' + index).forEach(x => x.parentElement.style.display = '');
        } else {
            counter.mean_gain = NaN;
            counter.std_gain = NaN;
            document.querySelectorAll('.gaussian-gain-setting-' + index).forEach(x => x.parentElement.style.display = 'none');
            document.querySelectorAll('.uniform-gain-setting-' + index).forEach(x => x.parentElement.style.display = '');
            document.querySelectorAll('.custom-gain-setting-' + index).forEach(x => x.parentElement.style.display = 'none');
        }
    }
}

function pause() {
    data.pause = !data.pause;
    changeUpdateInterval();
}

function changeUpdateInterval() {
    const updater = updaters.get('counters');
    if (updater) {
        clearInterval(updater)
    }
    if (!data.pause) {
        if (document.getElementById('pauseB')) {
            document.getElementById('pauseB').innerText = 'Pause';
        }
        updaters.set('counters', setInterval(updateCounters, data.updateInterval));
        updateCounters();
    } else {
        if (document.getElementById('pauseB')) {
            document.getElementById('pauseB').innerText = 'Resume';
        }
    }
    fix();
}

function updateCounters(doGains = true) {
    if (data.debugMode && doGains) console.time(`Update #${data.intervalCount + 1} took`);
    if (doGains) {
        Channel.doOfflineGains();
        Channel.doGains();
    }
    data.lastOnline = Date.now();
    updateCounters2(doGains);
    if (data.debugMode && doGains) console.timeEnd(`Update #${data.intervalCount + 1} took`);
    if (doGains) data.intervalCount++;
}

// up to individual counters to implement
function updateCounters2() {

}

function refreshCount() {
    const countInputs = document.querySelectorAll('.count-input');
    for (i = 0; i < countInputs.length; i++) {
        countInputs[i].value = data.editorShowsExactCount ? data.data[i].count : data.data[i].getDisplayedCount(i);
    }
}

function enableChartFeature() {
    const extraKeys = {

        // showChart is a cardStyles option for compatibility with Top 50
        cardStyles: {
            showChart: true
        },
        liveGraph: [],
        maxChartValues: 1500, // The SocialBlade counter had a maximum of 1500 chart values.
        partialExports: {
            charts: true,
        },
        saveChartData: false,
    }

    example_data = mergeWithExampleData(extraKeys, example_data);

    const insertedTab = {
        title: 'Chart Settings',
        items: [
            {
                title: 'Show chart',
                value: true,
                type: 'checkbox',
                path: 'data.cardStyles.showChart'
            },
            {
                title: 'Chart line color',
                type: 'color',
                path: 'data.cardStyles.chartLineColor'
            },
            {
                title: 'Maximum chart values (2-5000):',
                value: 1500,
                type: 'number',
                path: 'data.maxChartValues',
                className: 's-width'
            },
            {
                title: 'Save chart data when reloaded',
                value: false,
                type: 'checkbox',
                path: 'data.saveChartData'
            }
        ]
    }

    // Insert chart tab at fourth to last position
    MENU.tabs.splice(-3, 0, insertedTab);

    const partialExportAddition = {
        title: 'Chart settings',
        value: true,
        type: 'checkbox',
        path: 'data.partialExports.charts',
        className: 'partial-export-option'
    }

    // Insert partial export setting at sixth to last position
    MENU.tabs.find(x => x.title === 'Import & Export Data').items.splice(-5, 0, partialExportAddition);

    MENU.controls.push(['clearChartB', 'Clear chart', 'clearChart()'])
}

function enableBannerFeature() {
    const extraKeys = {
        apiUpdates: {
            response: {
                banner: {
                    enabled: false,
                    path: 'banner'
                }
            }
        },
        partialExports: {
            banners: true
        }
    };

    example_data = mergeWithExampleData(extraKeys, example_data);

    const bannerAPIUpdateOptions = [{
        title: 'Update banner',
        value: false,
        type: 'checkbox',
        path: 'data.apiUpdates.response.banner.enabled',
        className: 'api-setting',
        auto: false
    }, {
        title: 'Path to banner',
        value: '',
        type: 'text',
        path: 'data.apiUpdates.response.banner.path',
        className: 'api-setting',
        auto: false
    }, {
        type: 'html',
        value: '<br>'
    }]

    MENU.tabs.find(x => x.title === 'API Updates').items.splice(20, 0, ...bannerAPIUpdateOptions);

    const insertedOptions = [{
        title: 'Banner URL',
        value: '',
        type: 'text',
        path: 'data.data.0.banner',
        id: 'counterBannerURL'
    }, {
        type: 'html',
        value: '<button onclick="document.getElementById(\'counterBannerFile\').click()">Upload banner</button><input type="file" id="counterBannerFile" url-destination="counterBannerURL" class="hidden-file-input" accept="image/*">'
    }]

    MENU.tabs.find(x => x.title === 'Counter Settings').items.push(...insertedOptions);

    const partialExportAddition = {
        title: 'Counter banner',
        value: true,
        type: 'checkbox',
        path: 'data.partialExports.banners',
        className: 'partial-export-option'
    };

    // Insert at sixth position
    MENU.tabs.find(x => x.title === 'Import & Export Data').items.splice(5, 0, partialExportAddition);
}

function enableViewsAndVideoFeature(noVideo = false) {
    const extraKeys = {
        apiUpdates: {
            response: {
                views: {
                    enabled: false,
                    path: 'views'
                },
                videos: {
                    enabled: false,
                    path: 'videos'
                }
            }
        },
        partialExports: {
            viewAndVideoCounts: true
        }
    };

    example_data = mergeWithExampleData(extraKeys, example_data);

    const newAPIUpdateOptions = [{
        title: 'Update view count',
        value: false,
        type: 'checkbox',
        path: 'data.apiUpdates.response.views.enabled',
        className: 'api-setting',
        auto: false
    }, {
        title: 'Path to view count',
        value: '',
        type: 'text',
        path: 'data.apiUpdates.response.views.path',
        className: 'api-setting',
        auto: false
    }, {
        type: 'html',
        value: '<br>'
    }, {
        title: 'Update video count',
        value: false,
        type: 'checkbox',
        path: 'data.apiUpdates.response.videos.enabled',
        className: 'api-setting',
        auto: false
    }, {
        title: 'Path to video count',
        value: '',
        type: 'text',
        path: 'data.apiUpdates.response.videos.path',
        className: 'api-setting',
        auto: false
    }, {
        type: 'html',
        value: '<br>'
    }]

    if (noVideo) newAPIUpdateOptions.splice(2);

    MENU.tabs.find(x => x.title === 'API Updates').items.splice(20, 0, ...newAPIUpdateOptions);

    const newTab = {
        title: noVideo ? 'View Counter' : 'View and Video Counters',
        items: [
            {
                title: 'View count',
                value: 0,
                type: 'number',
                path: 'data.data.1.count',
                className: 'count-input'
            },
            {
                title: 'Views gain type',
                value: 'uniform',
                type: 'select',
                path: 'data.data.1.gain_type',
                options: [['uniform', 'Min/max'],
                ['gaussian', 'Mean/standard deviation'],
                ['custom', 'Custom distribution']],
                func: function (item) {
                    updateGainType(1);
                }
            },
            {
                title: 'Min views gain',
                value: 0,
                type: 'number',
                path: 'data.data.1.min_gain',
                className: 'uniform-gain-setting-1'
            },
            {
                title: 'Max views gain',
                value: 0,
                type: 'number',
                path: 'data.data.1.max_gain',
                className: 'uniform-gain-setting-1'
            },
            {
                title: 'Mean views gain',
                value: 0,
                type: 'number',
                path: 'data.data.1.mean_gain_value',
                className: 'gaussian-gain-setting-1',
                func: function (item) {
                    updateGainType(1);
                }
            },
            {
                title: 'Standard deviation of views gain',
                value: 1,
                type: 'number',
                path: 'data.data.1.std_gain_value',
                className: 'gaussian-gain-setting-1',
                func: function (item) {
                    updateGainType(1);
                }
            },
            {
                title: 'Custom distribution for views gain<br>',
                value: '',
                type: 'textarea',
                path: 'data.data.1.custom_counter_data.custom_rate',
                className: 'custom-gain-setting-1',
                placeholder: 'min1, max1, weight1\nmin2, max2, weight2\n...',
                func: function (item) {
                    updateGainType(1);
                }
            },
            {
                title: 'Views gain is per every: ',
                items: [
                    {
                        value: 1,
                        type: 'number',
                        path: 'data.data.1.gain_per_number',
                        className: 's-width'
                    },
                    {
                        value: 'second',
                        type: 'select',
                        path: 'data.data.1.gain_per',
                        options: [['second', 'second(s)'],
                        ['updateInterval', 'update interval(s)'],
                        ['minute', 'minute(s)'],
                        ['hour', 'hour(s)'],
                        ['day', 'day(s)']]
                    }
                ]
            },
            {
                title: '<abbr title="Adds variability to the counter updating. Gains will scale accordingly.">Update probability for views (%)</abbr>',
                type: 'number',
                value: 100,
                placeholder: 100,
                path: 'data.data.1.custom_counter_data.updateProbability',
                className: 's-width'
            },
            {
                title: 'Minimum view count',
                type: 'number',
                value: '',
                path: 'data.data.1.custom_counter_data.min',
                placeholder: 'Leave blank for none'
            },
            {
                title: 'Maximum view count',
                type: 'number',
                value: '',
                path: 'data.data.1.custom_counter_data.max',
                placeholder: 'Leave blank for none'
            },
            {
                type: 'html',
                value: '<br>'
            },
            {
                title: 'Video count',
                value: 0,
                type: 'number',
                path: 'data.data.2.count',
                className: 'count-input'
            },
            {
                title: 'Videos gain type',
                value: 'uniform',
                type: 'select',
                path: 'data.data.2.gain_type',
                options: [['uniform', 'Min/max'],
                ['gaussian', 'Mean/standard deviation'],
                ['custom', 'Custom distribution']],
                func: function (item) {
                    updateGainType(2);
                }
            },
            {
                title: 'Min videos gain',
                value: 0,
                type: 'number',
                path: 'data.data.2.min_gain',
                className: 'uniform-gain-setting-2'
            },
            {
                title: 'Max videos gain',
                value: 0,
                type: 'number',
                path: 'data.data.2.max_gain',
                className: 'uniform-gain-setting-2'
            },
            {
                title: 'Mean videos gain',
                value: 0,
                type: 'number',
                path: 'data.data.2.mean_gain_value',
                className: 'gaussian-gain-setting-2',
                func: function (item) {
                    updateGainType(2);
                }
            },
            {
                title: 'Standard deviation of videos gain',
                value: 1,
                type: 'number',
                path: 'data.data.2.std_gain_value',
                className: 'gaussian-gain-setting-2',
                func: function (item) {
                    updateGainType(2);
                }
            },
            {
                title: 'Custom distribution for videos gain<br>',
                value: '',
                type: 'textarea',
                path: 'data.data.2.custom_counter_data.custom_rate',
                className: 'custom-gain-setting-2',
                placeholder: 'min1, max1, weight1\nmin2, max2, weight2\n...',
                func: function (item) {
                    updateGainType(2);
                }
            },
            {
                title: 'Videos gain is per every: ',
                items: [
                    {
                        value: 1,
                        type: 'number',
                        path: 'data.data.2.gain_per_number',
                        className: 's-width'
                    },
                    {
                        value: 'second',
                        type: 'select',
                        path: 'data.data.2.gain_per',
                        options: [['second', 'second(s)'],
                        ['updateInterval', 'update interval(s)'],
                        ['minute', 'minute(s)'],
                        ['hour', 'hour(s)'],
                        ['day', 'day(s)']]
                    }
                ]
            },
            {
                title: '<abbr title="Adds variability to the counter updating. Gains will scale accordingly.">Update probability for videos (%)</abbr>',
                type: 'number',
                value: 100,
                placeholder: 100,
                path: 'data.data.2.custom_counter_data.updateProbability',
                className: 's-width'
            },
            {
                title: 'Minimum video count',
                type: 'number',
                value: '',
                path: 'data.data.2.custom_counter_data.min',
                placeholder: 'Leave blank for none'
            },
            {
                title: 'Maximum video count',
                type: 'number',
                value: '',
                path: 'data.data.2.custom_counter_data.max',
                placeholder: 'Leave blank for none'
            },
        ]
    }

    if (noVideo) newTab.items.splice(11);

    MENU.tabs.splice(1, 0, newTab);

    const partialExportAddition = {
        title: noVideo ? 'View counter' : 'View and video counters',
        value: true,
        type: 'checkbox',
        path: 'data.partialExports.viewAndVideoCounts',
        className: 'partial-export-option'
    };

    MENU.tabs.find(x => x.title === 'Import & Export Data').items.splice(-8, 0, partialExportAddition);
}

function enableViewCounterMode() {
    enableViewsAndVideoFeature();

    const extraKeys = {
        apiUpdates: {
            response: {
                views: {
                    enabled: false,
                    path: 'likes'
                },
                videos: {
                    enabled: false,
                    path: 'dislikes'
                },
                comments: {
                    enabled: false,
                    path: 'comments'
                }
            }
        },
        viewCounters: {
            likes: true,
            likesFooter: 'Likes',
            dislikes: true,
            dislikesFooter: 'Dislikes',
            comments: true,
            commentsFooter: 'Comments'
        }        
    }

    example_data = mergeWithExampleData(extraKeys, example_data);


    const counterTab = MENU.tabs.find(x => x.title === 'Counter Settings');
    counterTab.items.forEach(x => {
        if (x.title) x.title = x.title.replace('Username', 'Title').replace('Avatar', 'Thumbnail');
        if (x.value && typeof x.value === 'string') x.value = x.value.replace('avatar', 'thumbnail');
    })

    const styleTab = MENU.tabs.find(x => x.title === 'Design Settings & Styling');
    styleTab.items.forEach(x => {
        if (x.title) x.title = x.title.replace('Username', 'Title');
    })

    const tab = MENU.tabs.find(x => x.title === 'View and Video Counters');
    tab.title = 'Like, Dislike, and Comment Counters';
    tab.items.forEach(x => {
        if (x.title) x.title = x.title.replace('View', 'Like')
            .replace('view', 'like')
            .replace('Video', 'Dislike')
            .replace('video', 'dislike')
    })

    const apiTab = MENU.tabs.find(x => x.title === 'API Updates');

    apiTab.items.forEach(x => {
        if (x.title) x.title = x.title.replace('View', 'Like')
            .replace('view', 'like')
            .replace('Video', 'Dislike')
            .replace('video', 'dislike')
            .replace('Avatar', 'Thumbnail')
            .replace('avatar', 'thumbnail')
            .replace('Channel', 'Video')
    });

    newAPIOptions = [{
        title: 'Update comment count',
        value: false,
        type: 'checkbox',
        path: 'data.apiUpdates.response.comments.enabled',
        className: 'api-setting',
        auto: false
    }, {
        title: 'Path to comment count',
        value: '',
        type: 'text',
        path: 'data.apiUpdates.response.comments.path',
        className: 'api-setting',
        auto: false
    }, {
        type: 'html',
        value: '<br>'
    }];

    apiTab.items.splice(26, 0, ...newAPIOptions);
    
    // get rid of channel ID finder
    apiTab.items.splice(1, 1);
    apiTab.items[2].options[1][1] = 'mixerno.space (API views)'

    // get rid of force updates/estimation leeway cause view counters aren't abbreviated
    apiTab.items.splice(30, 3);

    const likeCounterItems = [{
        title: 'Show like counter',
        type: 'checkbox',
        path: 'data.viewCounters.likes',
    }, {
        title: 'Like counter footer',
        type: 'text',
        path: 'data.viewCounters.likesFooter'
    }];

    tab.items.splice(0, 0, ...likeCounterItems);

    const dislikeCounterItems = [{
        title: 'Show dislike counter',
        type: 'checkbox',
        path: 'data.viewCounters.dislikes'
    }, {
        title: 'Dislike counter footer',
        type: 'text',
        path: 'data.viewCounters.dislikesFooter'
    }]

    tab.items.splice(14, 0, ...dislikeCounterItems);

    const commentCounterItems = [{
        type: 'html',
        value: '<br>',
    }, {
        title: 'Show comment counter',
        type: 'checkbox',
        path: 'data.viewCounters.comments'
    }, {
        title: 'Comment counter footer',
        type: 'text',
        path: 'data.viewCounters.commentsFooter'
    }, {
        title: 'Comment count',
        value: 0,
        type: 'number',
        path: 'data.data.3.count',
        className: 'count-input'
    },
    {
        title: 'Comments gain type',
        value: 'uniform',
        type: 'select',
        path: 'data.data.3.gain_type',
        options: [['uniform', 'Min/max'],
        ['gaussian', 'Mean/standard deviation'],
        ['custom', 'Custom distribution']],
        func: function (item) {
            updateGainType(3);
        }
    },
    {
        title: 'Min comments gain',
        value: 0,
        type: 'number',
        path: 'data.data.3.min_gain',
        className: 'uniform-gain-setting-3'
    },
    {
        title: 'Max comments gain',
        value: 0,
        type: 'number',
        path: 'data.data.3.max_gain',
        className: 'uniform-gain-setting-3'
    },
    {
        title: 'Mean comments gain',
        value: 0,
        type: 'number',
        path: 'data.data.3.mean_gain_value',
        className: 'gaussian-gain-setting-3',
        func: function (item) {
            updateGainType(3);
        }
    },
    {
        title: 'Standard deviation of comments gain',
        value: 1,
        type: 'number',
        path: 'data.data.3.std_gain_value',
        className: 'gaussian-gain-setting-3',
        func: function (item) {
            updateGainType(3);
        }
    },
    {
        title: 'Custom distribution for comments gain<br>',
        value: '',
        type: 'textarea',
        path: 'data.data.3.custom_counter_data.custom_rate',
        className: 'custom-gain-setting-3',
        placeholder: 'min1, max1, weight1\nmin2, max2, weight2\n...',
        func: function (item) {
            updateGainType(3);
        }
    },
    {
        title: 'Comments gain is per every: ',
        items: [
            {
                value: 1,
                type: 'number',
                path: 'data.data.3.gain_per_number',
                className: 's-width'
            },
            {
                value: 'second',
                type: 'select',
                path: 'data.data.3.gain_per',
                options: [['second', 'second(s)'],
                ['updateInterval', 'update interval(s)'],
                ['minute', 'minute(s)'],
                ['hour', 'hour(s)'],
                ['day', 'day(s)']]
            }
        ]
    },
    {
        title: '<abbr title="Adds variability to the counter updating. Gains will scale accordingly.">Update probability for comments (%)</abbr>',
        type: 'number',
        value: 100,
        placeholder: 100,
        path: 'data.data.3.custom_counter_data.updateProbability',
        className: 's-width'
    },
    {
        title: 'Minimum comment count',
        type: 'number',
        value: '',
        path: 'data.data.3.custom_counter_data.min',
        placeholder: 'Leave blank for none'
    },
    {
        title: 'Maximum comment count',
        type: 'number',
        value: '',
        path: 'data.data.3.custom_counter_data.max',
        placeholder: 'Leave blank for none'
    }]
    tab.items.push(...commentCounterItems);

    const partialExportItem = MENU.tabs.find(x => x.title === 'Import & Export Data').items.find(x => x.title === 'View and video counters');
    partialExportItem.title = 'Like, dislike, and comment counters';

    const technicalSettingsTab = MENU.tabs.find(x => x.title === 'Technical Settings');
    // Remove abbreviate count option
    technicalSettingsTab.items.splice(2,1);
}

function enableCreditsTab() {
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
    });
}

function updateChart(val) {

    data.maxChartValues = clamp(Math.floor(data.maxChartValues), 2, 5000);

    if (chart.series[0].data.length > data.maxChartValues) {
        chart.series[0].setData(chart.series[0].data.slice(1-data.maxChartValues));
    } else if (chart.series[0].data.length == data.maxChartValues) {
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

function importingStuff(imported, max = 1) {
    while (imported.data.length < max) {
        imported.data.push(new Channel());
    }
    if (imported.data.length > max) {
        imported.data = imported.data.slice(0, max);
    }
    imported.saveType = COUNTER_THEME;
    imported.versionLastOpened = VERSION;
    updateAutoSave();
    updateStreamerMode();
    changeUpdateInterval();
    refreshCount();
    if (imported.importFromGoogleFonts) {
        loadMyFont();
    }
}

function fixData(max = 1) {
    if (!data) data = structuredClone(example_data);
    data.data = data.data.filter(x => x);
    data.data = data.data.slice(0, max);
    data.data = data.data.map(x => new Channel(x));
    while (data.data.length < max) {
        data.data.push(new Channel());
    }
}

function updateGainTypes(max = 1) {
    // for some reason i is being used idk why
    for (j = 0; j < max; j++) {
        updateGainType(j);
    }
} 

function regenerateDuplicatedID() {
    const index = data.data.findLastIndex(x => x.id === data.data[0].id);
    if (index > 0) {
        data.data[index].id = uuidGen();
    }
}