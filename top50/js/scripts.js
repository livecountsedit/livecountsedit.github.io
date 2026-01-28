function loadScripts() {
    fetch('https://scripts.lcedit.com/all')
        .then(res => res.text())
        .then(resd => {
            const entries = resd
                .split(/-+\s*-+\s*-+/) // split on any "---" or similar
                .map(e => e.trim())
                .filter(Boolean);

            const obj = entries.map(entry => {
                const created = entry.match(/Created:\s*(.*)/)?.[1]?.trim() || "";
                const updated = entry.match(/Updated:\s*(.*)/)?.[1]?.trim() || "";
                const title = entry.match(/Title:\s*(.*)/)?.[1]?.trim() || "";
                const desc = entry.match(/Desc:\s*([\s\S]*?)Author:/)?.[1]?.trim() || "";
                const author = entry.match(/Author:\s*(.*)/)?.[1]?.trim() || "";
                const url = entry.match(/URL:\s*(.*)/)?.[1]?.trim() || "";
                const id = entry.match(/ID:\s*(.*)/)?.[1]?.trim() || "";

                if (title.length > 0) {
                    return { created, title, desc, author, url, id, updated };
                }
            });
            document.getElementById('scriptList').innerHTML = '';
            document.getElementById('loadedScripts').innerHTML = 'Installed:';

            if (!data.scripts) {
                data.scripts = [];
            }

            const container = document.getElementById('scriptList');
            container.innerHTML = '';

            obj.forEach(object => {
                if (!object) return;

                const div = document.createElement('div');
                //div.style.color = data.textColor;
                div.style.width = '200px';
                div.innerHTML = `
    <h2>${object.title}</h2>
    <p>${object.desc}</p>
    <label>Created: ${object.created} (Updated: ${object.updated})</label><br>
    <label>${object.author}</label>
    <a href="${object.url}">URL</a>
    <a href="https://github.com/livecountsedit/scripts/tree/main/listings/${object.id}">Source</a><br><br>
    <img style="width: 200px; height: 100px;" src="https://raw.githubusercontent.com/livecountsedit/scripts/refs/heads/main/listings/${object.id}/image.png"><br>
    <button>${data.scripts.includes(object.id) ? 'Uninstall' : 'Install'}</button><hr>
  `;

                const button = div.querySelector('button');
                button.addEventListener('click', async () => {
                    if (button.innerHTML === 'Install') {
                        if (confirm(`Are you sure you want to install this script (${object.title})? It may very well break EVERYTHING...`)) {
                            const script = await fetch(`https://raw.githubusercontent.com/livecountsedit/scripts/refs/heads/main/listings/${object.id}/index.lcscript`).then(r => r.text());
                            eval(script);
                            data.scripts.push(object.id);
                            saveData(false); // or reload the affected item
                            button.innerHTML = 'Uninstall'
                        }
                    } else {
                        data.scripts = data.scripts.filter(id => id !== object.id);
                        saveData(false);
                        location.reload();
                    }
                });

                container.appendChild(div);

                if (data.scripts.includes(object.id)) {
                    document.getElementById('loadedScripts').innerText += ` ${object.title},`;
                }
            });
            adjustColors();

        });
};
loadScripts();

function initScripts() {
    data.scripts.forEach(scriptId => {
        fetch(`https://raw.githubusercontent.com/livecountsedit/scripts/refs/heads/main/listings/${scriptId}/index.lcscript`)
            .then(res => res.text())
            .then(script => {
                eval(script);
                console.log('loaded script: ' + scriptId)
            })
    })
}
initScripts();