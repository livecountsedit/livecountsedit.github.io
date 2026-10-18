let scriptList = {}
let scriptPage = 1;

function updateScriptList() {
    document.getElementById('loadedScripts').innerText = 'Installed: ';
    const installedScripts = data.scripts.filter(x => scriptList[x]);
    for (const s of installedScripts) {
        const badge = document.createElement('span');
        badge.className = 'badge'
        badge.innerText = scriptList[s].ai ? scriptList[s].title + " [AI]" : scriptList[s].title;
        badge.style.backgroundColor = scriptList[s].ai ? 'red' : 'green';
        const button = document.createElement('button');
        button.innerText = 'X';
        button.style.padding = "1px 5px";
        button.style.marginLeft = "5px";
        button.onclick = async () => {
            if (confirm(`Uninstall ${scriptList[s].title}?`)) {
                data.scripts = data.scripts.filter(x => x !== s);
                await saveInBrowser(COUNTER_THEME, false);
                window.location.reload();
            }
        }
        badge.appendChild(button);
        document.getElementById('loadedScripts').appendChild(badge);
    }
    if (!installedScripts.length) document.getElementById('loadedScripts').innerText += ' none';
}

async function uninstallAllScripts() {
    if (!data.scripts.length) return alert("There are no scripts installed.")
    if (confirm("Are you sure you want to uninstall all scripts?")) {
        data.scripts = [];
        await saveInBrowser(COUNTER_THEME, false);
        window.location.reload();
    }
}

async function uninstallAllAIScripts() {
    if (!data.scripts.some(x => scriptList[x].ai)) return alert("There are no AI-generated scripts installed.")
    if (confirm("Are you sure you want to uninstall all AI-generated scripts?")) {
        data.scripts = data.scripts.filter(x => !scriptList[x].ai);
        await saveInBrowser(COUNTER_THEME, false);
        window.location.reload();
    }
}

function renderScripts(list) {

    const container = document.getElementById('scriptList');
    container.innerHTML = '';

    if (!list.length) container.innerText = "No results."
    
    for (const item of list) {
        const object = scriptList[item];
        if (!object) continue;
        const div = document.createElement('div');
        
        //div.style.color = data.textColor;
        div.innerHTML = `
            <h2>${object.title}${object.ai ? ' <span class="badge" title="This add-on was created using generative AI.">AI</span>' : ""}</h2>
            <p>${object.description}</p>
            <p class="script-tag-list"></p>
            <label>Published: ${object.published} (Created: ${object.created}, Updated: ${object.updated})</label><br>
            <label>${object.author}</label>
            <a href="${object.url}">URL</a>
            <a href="https://github.com/livecountsedit/scripts/tree/main/listings/${object.id}">Source</a><br><br>
            <img style="height: 100px; max-width: 300px;" src="https://raw.githubusercontent.com/livecountsedit/scripts/refs/heads/main/listings/${object.id}/image.png"><br>
            <button>${data.scripts.includes(object.id) ? 'Uninstall' : 'Install'}</button>
        `;

        for (const tag of object.tags) {
            const badge = document.createElement('span');
            badge.className = 'badge'
            badge.innerText = tag;
            badge.style.backgroundColor = 'purple';
            div.querySelector('.script-tag-list').appendChild(badge);
        }

        const button = div.querySelector('button');
        button.addEventListener('click', async () => {
            if (button.innerHTML === 'Install') {
                if (confirm(`Are you sure you want to install this script (${object.title})? It may very well break EVERYTHING...`)) {
                    const script = await fetch(`https://raw.githubusercontent.com/livecountsedit/scripts/refs/heads/main/listings/${object.id}/index.js`).then(r => r.text());
                    eval(script);
                    data.scripts.push(object.id);
                    updateScriptList()
                    await saveInBrowser(COUNTER_THEME, false); // or reload the affected item
                    button.innerHTML = 'Uninstall'
                }
            } else {
                data.scripts = data.scripts.filter(id => id !== object.id);
                await saveInBrowser(COUNTER_THEME, false);
                location.reload();
            }
        });

        container.appendChild(div);

    }
}

function showScripts() {
    let list = Object.keys(scriptList);
    if (document.getElementById("scriptAIFilter").value === 'hide') {
        list = list.filter(x => !scriptList[x].ai)
    }
    if (document.getElementById("scriptTagFilter").value !== 'any') {
        list = list.filter(x => scriptList[x].tags.includes(document.getElementById("scriptTagFilter").value))
    }
    if (document.getElementById("scriptAuthorFilter").value !== 'any') {
        list = list.filter(x => scriptList[x].author === document.getElementById("scriptAuthorFilter").value)
    }
    switch (document.getElementById("scriptSorter").value) {
        case "lastUpdated":
            list.sort((a, b) => new Date(scriptList[b].updated).getTime() - new Date(scriptList[a].updated).getTime());
            break;
        case "lastPublished":
            list.sort((a, b) => new Date(scriptList[b].published).getTime() - new Date(scriptList[a].published).getTime());
            break;
        case "lastCreated":
            list.sort((a, b) => new Date(scriptList[b].created).getTime() - new Date(scriptList[a].created).getTime());
            break;
        case "firstPublished":
            list.sort((a, b) => new Date(scriptList[a].published).getTime() - new Date(scriptList[b].published).getTime());
            break;
        case "oldest":
            list.sort((a, b) => new Date(scriptList[a].created).getTime() - new Date(scriptList[b].created).getTime());
            break;
        default:
            list.sort((a, b) => {
                if (scriptList[a].title.toLowerCase() < scriptList[b].title.toLowerCase()) return -1;
                if (scriptList[a].title.toLowerCase() > scriptList[b].title.toLowerCase()) return 1;
                if (scriptList[a].title < scriptList[b].title) return -1;
                if (scriptList[a].title > scriptList[b].title) return -1;
                return 0;
            })
    }
    const totalPages = Math.ceil(list.length / 6) || 1;
    document.getElementById('pageList').innerHTML = "Pages:"
    for (i = 1; i <= totalPages; i++) {
        if (scriptPage === i) {
            document.getElementById('pageList').innerHTML += ` <strong>${i}</strong>`
        } else {
            document.getElementById('pageList').innerHTML += ` <a href="#" onclick="event.preventDefault(); updatePage(${i})">${i}</a>`
        }
    }
    if (scriptPage != 1) {
        document.getElementById('pageList').innerHTML += ` <a href="#" onclick="event.preventDefault(); updatePage(${scriptPage - 1})">Previous</a>`
    }
    if (scriptPage != totalPages) {
        document.getElementById('pageList').innerHTML += ` <a href="#" onclick="event.preventDefault(); updatePage(${scriptPage + 1})">Next</a>`
    }
    renderScripts(list.slice((scriptPage - 1) * 6, scriptPage * 6));
}

function updatePage(num) {
    scriptPage = num;
    showScripts();
}

async function loadScripts() {
    fetch('https://scripts.lcedit.com/all.json?v=' + uuidGen())
        .then(res => res.json())
        .then(resd => {
            scriptList = resd;
            const authors = new Set();
            for (const script of Object.values(scriptList)) {
                authors.add(script.author);
            }
            const sortedAuthors = [...authors].sort((a , b) => {
                if (a.toLowerCase() < b.toLowerCase()) return -1;
                if (a.toLowerCase() > b.toLowerCase()) return 1;
                if (a < b) return -1;
                if (a > b) return 1;
                return 0;
            });
            for (const author of sortedAuthors) {
                const option = document.createElement('option');
                option.value = author;
                option.innerText = "Author: " + author;
                document.getElementById('scriptAuthorFilter').appendChild(option);
            }

            const tags = new Set();
            for (const script of Object.values(scriptList)) {
                for (const tag of script.tags) {
                    tags.add(tag.toLowerCase())
                }
            }
            const sortedTags = [...tags].sort();
            for (const tag of sortedTags) {
                const option = document.createElement('option');
                option.value = tag;
                option.innerText = "Tag: " + tag;
                document.getElementById('scriptTagFilter').appendChild(option);
            }
            
            document.getElementById('scriptList').innerHTML = '';
            

            if (!data.scripts) {
                data.scripts = [];
            }

            document.getElementById('scriptSorter').addEventListener('change', showScripts)
            document.getElementById('scriptAuthorFilter').addEventListener('change', showScripts)
            document.getElementById('scriptTagFilter').addEventListener('change', showScripts)
            document.getElementById('scriptAIFilter').addEventListener('change', showScripts)
            showScripts();

            updateScriptList();
            adjustColors();

        });
};
// loadScripts();

function initScripts() {
    data.scripts.forEach(scriptId => {
        fetch(`https://raw.githubusercontent.com/livecountsedit/scripts/refs/heads/main/listings/${scriptId}/index.js`)
            .then(res => res.text())
            .then(script => {
                eval(script);
                if (data.debugMode) console.log('loaded script: ' + scriptId)
            })
    })
}