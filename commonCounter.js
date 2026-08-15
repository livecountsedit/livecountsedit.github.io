const updaters = new Map();
const VERSION = '7.8';
const SAVE_VERSION = 8;

let COUNTER_THEME = '';
let data;
let example_data = {
    abbreviate: false,
    allowNegative: false,
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
    data: [],
    debugMode: true,
    editorShowsExactCount: false,
    index: 1,
    intervalCount: 0,
    lastOnline: Date.now(),
    partialExports: {
        state: true, // State and preferences
        counters: true, // Counters
        names: true, // Counter name
        counts: true, // Counter counts
        avatars: true, // Counter avatars
        gains: true, // Counter gains
        technicalSettings: true, // Technical settings
        apiUpdates: true, // API updates
    },
    pause: false,
    saveType: '',
    saveVersion: SAVE_VERSION,
    streamerMode: false,
    updateInterval: 2000,
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
                    ['gaussian', 'Mean/standard deviation']],
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
                    title: 'Gain is per every: ',
                    value: 'second',
                    type: 'select',
                    path: 'data.data.0.gain_per',
                    options: [['second', 'second'],
                    ['updateInterval', 'update interval'],
                    ['minute', 'minute'],
                    ['hour', 'hour'],
                    ['day', 'day']]
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
            title: 'Technical Settings',
            items: [
                {
                    title: 'Update interval (seconds)',
                    type: 'number',
                    value: 2,
                    id: 'updateInterval'
                },
                {
                    title: 'Channel editor shows exact internal count',
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
                    path: 'data.data.0.id'
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
                    className: 'api-setting',
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
                    id: 'apiUpdateInterval'
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
                    value: '<br><button onclick="exportData()">Export Data</button>'
                },
                {
                    type: 'html',
                    value: '<button onclick="document.getElementById(\'fileImport\').click()">Import Data</button><input type="file" id="fileImport" class="hidden-file-input" accept=".txt, .json"><br>'
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

function fix() {
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
                let elem;
                const label = document.createElement('label');
                label.innerHTML = item.title + ' ';
                if (item.type === 'textarea') {
                    elem = document.createElement('textarea');
                } else if (item.type === 'select') {
                    elem = document.createElement('select');
                    for (const option of item.options) {
                        const optionElem = document.createElement('option');
                        optionElem.value = option[0];
                        optionElem.innerText = option[1];
                        elem.appendChild(optionElem);
                    }
                } else {
                    elem = document.createElement('input');
                    elem.type = item.type;
                }

                if (item.className) elem.className = item.className;
                if (item.id) elem.id = item.id;

                if (item.type !== 'checkbox') {
                    if (item.value != undefined) elem.value = item.value;
                    if (item.placeholder != undefined) elem.placeholder = item.placeholder;
                } else {
                    elem.checked = Boolean(item.value);
                }
                if (item.path) {
                    elem.setAttribute('data-path', item.path);
                    const func = item.func || (function (_) {});
                    if (item.auto !== false) {
                        if (item.type === 'checkbox') {
                            elem.addEventListener('change', e => {
                                const splitPath = item.path.split('.');
                                if (splitPath[0] === 'data') {
                                    let location = data;
                                    for (i = 1; i < splitPath.length - 1; i++) {
                                        location = location[splitPath[i]];
                                    }
                                    location[splitPath[splitPath.length - 1]] = e.target.checked;
                                }
                                func(item);
                                fix();
                            })
                        } else if (item.type === 'number') {
                            elem.addEventListener('change', e => {
                                const splitPath = item.path.split('.');
                                if (splitPath[0] === 'data') {
                                    let location = data;
                                    for (i = 1; i < splitPath.length - 1; i++) {
                                        location = location[splitPath[i]];
                                    }
                                    location[splitPath[splitPath.length - 1]] = parseFloat(e.target.value);
                                }
                                func(item);
                                fix();
                            })
                        } else {
                            elem.addEventListener('change', e => {
                                const splitPath = item.path.split('.');
                                if (splitPath[0] === 'data') {
                                    let location = data;
                                    for (i = 1; i < splitPath.length - 1; i++) {
                                        location = location[splitPath[i]];
                                    }
                                    location[splitPath[splitPath.length - 1]] = e.target.value;
                                }
                                func(item);
                                fix();
                            })
                        }
                    }
                }
                if (item.streamerMode) {
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
        let nameUpdate, countUpdate, imageUpdate, bannerUpdate, viewsUpdate, videosUpdate, idUpdate;
        
        if (data.apiUpdates.response.name.enabled) {
            const pathParts = data.apiUpdates.response.name.path.split('.');
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
            nameUpdate = result;
        }
        
        if (data.apiUpdates.response.count.enabled) {
            const pathParts = data.apiUpdates.response.count.path.split('.');
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
            countUpdate = parseFloat(result);
        }
        
        if (data.apiUpdates.response.image.enabled) {
            const pathParts = data.apiUpdates.response.image.path.split('.');
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
            imageUpdate = result;
        }

        if (data.apiUpdates.response.banner?.enabled) {
            const pathParts = data.apiUpdates.response.banner.path.split('.');
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
            bannerUpdate = result;
        }

        // For akshatmittal theme
        if (data.apiUpdates.response.views?.enabled) {
            const pathParts = data.apiUpdates.response.views.path.split('.');
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
            viewsUpdate = result;
        }

        if (data.apiUpdates.response.videos?.enabled) {
            const pathParts = data.apiUpdates.response.videos.path.split('.');
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
            videosUpdate = result;
        }
        
        const idPathParts = data.apiUpdates.response.id.path.split('.');
        let idResult = item;
        for (const part of idPathParts) {
            if (part.includes('[')) {
                const [arrName, index] = part.split('[');
                const idx = parseInt(index.split(']')[0]);
                idResult = idResult[arrName][idx];
            } else {
                idResult = idResult[part];
            }
        }
        idUpdate = idResult;
        
        if (data.apiUpdates.response.id.IDIncludes) {
            if (idUpdate && idUpdate.includes(data.data[0].id)) {
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
                    data.data[1].count = viewsUpdate;
                }
                if (videosUpdate !== undefined && typeof videosUpdate == 'number' && isFinite(videosUpdate)) {
                    data.data[2].count = videosUpdate;
                }
                if (countUpdate !== undefined && typeof countUpdate === 'number' && isFinite(countUpdate)) {
                    data.data[0].adjustForAPI(countUpdate);
                }
            }
        } else {
            if (idUpdate === data.data[0].id) {
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
                    data.data[1].count = viewsUpdate;
                }
                if (videosUpdate !== undefined && typeof videosUpdate == 'number' && isFinite(videosUpdate)) {
                    data.data[2].count = videosUpdate;
                }
                if (countUpdate !== undefined && typeof countUpdate === 'number' && isFinite(countUpdate)) {
                    data.data[0].adjustForAPI(countUpdate);
                }
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

        fix();
        
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

function processData(data_) {
    if (data_.partialExports) {
        if (!data_.partialExports.state) {
            delete data_.autosave;
            delete data_.debugMode;
            delete data_.editorShowsExactCount;
            delete data_.intervalCount;
            delete data_.pause;
            delete data_.streamerMode;
        }
        if (!data_.partialExports.counters) {
            delete data_.data;
        } else {
            if (!data_.partialExports.names) {
                for (i = 0; i < data_.data.length; i++) {
                    delete data_.data[i].name;
                }
            }
            if (!data_.partialExports.counts) {
                for (i = 0; i < data_.data.length; i++) {
                    delete data_.data[i].count;
                }
            }
            if (!data_.partialExports.avatars) {
                for (i = 0; i < data_.data.length; i++) {
                    delete data_.data[i].image;
                }
            }
            if (!data_.partialExports.banners) {
                for (i = 0; i < data_.data.length; i++) {
                    delete data_.data[i].banner;
                }
            }
            if (!data_.partialExports.gains) {
                for (i = 0; i < data_.data.length; i++) {
                    delete data_.data[i].min_gain;
                    delete data_.data[i].max_gain;
                    delete data_.data[i].mean_gain;
                    delete data_.data[i].std_gain;
                    delete data_.data[i].mean_gain_value;
                    delete data_.data[i].std_gain_value;
                    delete data_.data[i].gain_type;
                    delete data_.data[i].gain_per;
                }
            }

            if (!data_.partialExports.viewAndVideoCounts && data_.saveType !== 'top50') {
                data_.data = data_.data.slice(0, 1);
            }
        }
        if (!data_.partialExports.charts) {
            if (data_.cardStyles) delete data_.cardStyles.showChart;
            delete data_.liveGraph;
            delete data_.maxChartValues;
            delete data_.saveChartData;
        }
        if (!data_.partialExports.technicalSettings) {
            delete data_.abbreviate;
            delete data_.allowNegative;
            delete data_.odometerSpeed;
            delete data_.offlineGains;
            delete data_.updateInterval;
        }
        if (!data_.partialExports.apiUpdates) {
            delete data_.apiUpdates;
        }
        
        if (!data_.partialExports.socialBladeSettings) {
            delete data_.socialBladeSettings;
        }

        if (!data_.partialExports.akshatmittalSettings) {
            delete data_.akshatmittalSettings;
        }
        data_ = processData2(data_);
    }
    return data_;
}

// needs to be implemented by individual counters
function processData2(data_) {
    return data_;
}

function exportData(shouldAlert = true) {
    const data_ = processData(structuredClone(data));
    
    if (shouldAlert) {
        if (!data_.partialExports || data_.partialExports.apiUpdates) {
            alert('NOTICE: API update settings are included in this export. Be careful not to share any sensitive data or credentials with people you don\'t trust!');
        }
    }
    const jsonData = JSON.stringify(data_);
    const file = new Blob([jsonData], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = 'export.json';
    a.click();
    delete a;
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
                x.value = location[splitPath[splitPath.length - 1]];
            }
        }
    })
    document.getElementById('updateInterval').value = data.updateInterval / 1000;
    loadAPIUpdates();
}

function loadAPIUpdates() {
    document.getElementById('apiHeaders').value = Object.keys(data.apiUpdates.headers)
        .map(x => `${x}: ${data.apiUpdates.headers[x]};`).join('\n');
    document.getElementById('apiBody').value = Object.keys(data.apiUpdates.body)
        .map(x => `${x}: ${data.apiUpdates.body[x]};`).join('\n');
    document.getElementById('apiUpdateInterval').value = clamp(data.apiUpdates.interval, 1000, 2147483647) / 1000;
}

async function importData(imported) {

    if (typeof imported.saveType === 'number') {
        return alert('Saves from v7 Livecountsedit and Livecounts.net themes are not supported yet.')
    }

    const partialImports = structuredClone(data.partialExports);
    if (imported.partialExports) {
        for (const key in partialImports) {
            if (!imported.partialExports[key]) partialImports[key] = false;
        }
    }
    imported.partialExports = partialImports;
    imported = processData(imported);

    imported.saveType = COUNTER_THEME;
    imported.versionLastOpened = example_data.versionLastOpened;

    if (Object.keys(imported.partialExports).some(x => !imported.partialExports[x])) {
        imported.partialExports = data.partialExports;
        const action = prompt('Either this save is a partial export/from an old version, or you have decided to only partially import this save.\nType 1 to use DEFAULT settings for unimported settings.\nType 2 to KEEP your current settings for unimported settings.\nType anything else or leave blank to cancel.');
        if (action == '1') {
            data = mergeWithExampleData(imported, example_data, true);
        } else if (action == '2') {
            data = mergeWithExampleData(imported, data, true);
        } else {
            return;
        }
    } else {
        data = mergeWithExampleData(imported, example_data, true);
    }
    data.data = data.data.map(x => new Channel(x));
    await processImport(imported);
    fillMenus();
}

// needs to be implemented by individual counters
async function processImport(imported) {
    return imported;
}

class Channel {
    constructor(options = {}) {
        this.id = options.id || uuidGen();
        this.name = options.name || 'User';
        this.count = parseFloat(options.count) || 0;
        this.image = options.image || '/default.png'
        this.min_gain = parseFloat(options.min_gain) || 0;
        this.max_gain = parseFloat(options.max_gain) || 0;
        this.mean_gain = parseFloat(options.mean_gain);
        this.std_gain = parseFloat(options.std_gain);
        this.mean_gain_value = parseFloat(options.mean_gain_value) || 0;
        this.std_gain_value = parseFloat(options.std_gain_value) || 0;
        this.gain_type = isFinite(this.mean_gain) && isFinite(this.std_gain) ? 'gaussian' : 'uniform';
        this.bg = options.bg || '';
        this.banner = options.banner || '/default_banner.png';
        this.gain_per = options.gain_per || 'updateInterval';
        this.last_api_count = parseFloat(options.last_api_count);
    }

    getDisplayedCount() {
        if (!data.allowNegative && this.count < 0) this.count = 0;
        if (data.abbreviate) return abb(this.count);
        else return isFinite(this.count) ? Math.floor(this.count) : 0;
    }

    getGainMultiplier() {
        switch (this.gain_per) {
            case 'second':
                return data.updateInterval / 1_000;
            case 'minute':
                return data.updateInterval / 60_000;
            case 'hour':
                return data.updateInterval / 3_600_000;
            case 'day':
                return data.updateInterval / 86_400_000;
            default:
                return 1;
        }
    }

    gain() {

        // Ignore gains if using a real sub count
        if (data.apiUpdates.enabled && data.apiUpdates.forceUpdates) return;

        let multiplier = this.getGainMultiplier();
        let gain = 0;
        if (this.gain_type === 'gaussian') {
            gain = randomGaussian(this.mean_gain * multiplier, this.std_gain * Math.sqrt(multiplier));
            // With normally distributed gains, this results in the variability being accurate
            // This is possible because normal distribution + normal distribution = normal distribution
        } else {
            gain = random(this.min_gain, this.max_gain) * multiplier;
            // With uniform (min/max) gains the long term result is a normal distribution.
            // if gain rate is not per update interval, then the variability can't be accurate.
            // e.g. 10k to 20k per hour = will cluster around 15k
        }
        if (!isFinite(gain)) gain = 0;
        if (isFinite(gain + this.count)) {
            this.count += gain;
        }

        // Prevent gains from going over API constraints
        // (For users making their own estimation)
        if (data.apiUpdates.enabled && !data.apiUpdates.forceUpdates) {
            if (this.last_api_count >= 0) {
                this.adjustForAPI(this.last_api_count);
            }
        }
    }

    // Get the mean gain per update interval
    getUnitMeanGain() {
        if (this.gain_type === 'gaussian') {
            return this.mean_gain * this.getGainMultiplier();
        } else {
            return avg(this.min_gain, this.max_gain) * this.getGainMultiplier();
        }
    }

    // Get to standard deviation of gain per update interval
    getUnitStDevGain() {
        if (this.gain_type === 'gaussian') {
            return this.std_gain * Math.sqrt(this.getGainMultiplier());
        } else {
            // The standard deviation of a uniform distribution is (max - min) / sqrt(12)
            // https://en.wikipedia.org/wiki/Continuous_uniform_distribution
            return Math.abs(this.max_gain - this.min_gain) * this.getGainMultiplier() / Math.sqrt(12);
        }
    }

    // Offline gains are gains added to compensate for the time the save wasn't loaded in the browser
    // e.g. when tab is closed. It DOES NOT refer to gains for users that are not active on stream.
    offlineGain() {
        // Don't do offline gains if disabled or paused, or if the last saved time isn't set
        // or if API updates are enabled and force updated
        if (data.pause || !data.offlineGains || typeof data.lastOnline !== 'number' 
            || !isFinite(data.lastOnline) || (data.apiUpdates.enabled && data.apiUpdates.forceUpdates)) return;
        
        const intervalsElapsed = (Date.now() - data.lastOnline) / data.updateInterval;

        // Only do offline gains if at least 5 update intervals have passed
        if (intervalsElapsed < 5) return;

        if (data.debugMode) console.log('Intervals passed for offline gains: ' + intervalsElapsed)

        // The total gain will be approximately normally distributed
        let gain = randomGaussian(this.getUnitMeanGain() * intervalsElapsed, 
            this.getUnitStDevGain() * Math.sqrt(intervalsElapsed));

        if (data.debugMode) console.log('Offline gains: ' + gain)
        if (!isFinite(gain)) gain = 0;
        if (isFinite(gain + this.count)) {
            this.count += gain;
        }

        // Prevent gains from going over API constraints
        // (For users making their own estimation)
        if (data.apiUpdates.enabled && !data.apiUpdates.forceUpdates) {
            if (this.last_api_count >= 0) {
                this.adjustForAPI(this.last_api_count);
            }
        }
    }

    adjustForAPI(apiCount) {
        // If real sub count is used:
        if (data.apiUpdates.forceUpdates) {
            this.count = apiCount;
        } else {
            const abbAPICount = abb(apiCount);
            this.last_api_count = abbAPICount;
            const nextMilestone = Channel.calculateNextAbbreviationMilestone(abbAPICount);
            // Adjust for API count if the user is making their own estimates
            if (this.getUnitMeanGain() >= 0) {
                if (abbAPICount > abb(this.count)) {
                    // Count increasing, API count is ahead
                    this.count = apiCount; // Jump to new milestone
                } else if (abbAPICount < abb(this.count)) {
                    // Count increasing, API count is behind (estimation is ahead)                    
                    // Make sure overestimation leeway is between 0 and 100%
                    data.apiUpdates.leeway = clamp(data.apiUpdates.leeway, 0, 100)
                    let newCount = nextMilestone - (nextMilestone - abbAPICount) * data.apiUpdates.leeway / 100;
                    // For 0 leeway, keep count at 1 less than the next abbreviation milestone (e.g. 100,999,999)
                    if (data.apiUpdates.leeway === 0) newCount--;
                    this.count = newCount;
                }
            } else {
                if (abbAPICount < abb(this.count)) {
                    // Count decreasing, API count is ahead (as in decreased faster)
                    // e.g. abbreviated count goes from 101M -> 100M, display 100,999,999.
                    this.count = nextMilestone - 1;
                } else if (abbAPICount > abb(this.count)) {
                    // Count decreasing, API count is behind (as in hasn't gone under yet)
                    // Make sure overestimation leeway is between 0 and 100%
                    data.apiUpdates.leeway = clamp(data.apiUpdates.leeway, 0, 100)
                    let newCount = abbAPICount + (nextMilestone - abbAPICount) * data.apiUpdates.leeway / 100;
                    if (data.apiUpdates.leeway === 100) newCount--;
                    this.count = newCount;
                }
            }
        }
    }

    static doGains() {
        data.data.forEach(x => x.gain());
    }

    static doOfflineGains() {
        data.data.forEach(x => x.offlineGain());
    }

    // Calculates the next abbreviation milestone
    // e.g. for 12,345 it is 12,400, for 100,000 it is 101,000
    static calculateNextAbbreviationMilestone(count) {
        if (count < 0) return 0;
        if (count < 1000) return Math.floor(count) + 1;
        return abb(count) + 10 ** (Math.floor(Math.log10(count) - 2));
    }
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
        } else {
            counter.mean_gain = NaN;
            counter.std_gain = NaN;
            document.querySelectorAll('.gaussian-gain-setting-' + index).forEach(x => x.parentElement.style.display = 'none');
            document.querySelectorAll('.uniform-gain-setting-' + index).forEach(x => x.parentElement.style.display = '');
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
        countInputs[i].value = data.editorShowsExactCount ? data.data[i].count : data.data[i].getDisplayedCount();
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
                title: 'Maximum chart values (2-5000):',
                value: 1500,
                type: 'number',
                path: 'data.maxChartValues'
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

function enableViewsAndVideoFeature() {
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

    MENU.tabs.find(x => x.title === 'API Updates').items.splice(20, 0, ...newAPIUpdateOptions);

    const newTab = {
        title: 'View and Video Counters',
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
                path: 'data.data.0.gain_type',
                options: [['uniform', 'Min/max'],
                ['gaussian', 'Mean/standard deviation']],
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
                title: 'Views gain is per every: ',
                value: 'second',
                type: 'select',
                path: 'data.data.1.gain_per',
                options: [['second', 'second'],
                ['updateInterval', 'update interval'],
                ['minute', 'minute'],
                ['hour', 'hour'],
                ['day', 'day']]
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
                ['gaussian', 'Mean/standard deviation']],
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
                title: 'Videos gain is per every: ',
                value: 'second',
                type: 'select',
                path: 'data.data.2.gain_per',
                options: [['second', 'second'],
                ['updateInterval', 'update interval'],
                ['minute', 'minute'],
                ['hour', 'hour'],
                ['day', 'day']]
            },
        ]
    }

    MENU.tabs.splice(1, 0, newTab);

    const partialExportAddition = {
        title: 'View and video counters',
        value: true,
        type: 'checkbox',
        path: 'data.partialExports.viewAndVideoCounts',
        className: 'partial-export-option'
    };

    MENU.tabs.find(x => x.title === 'Import & Export Data').items.splice(-5, 0, partialExportAddition);
}