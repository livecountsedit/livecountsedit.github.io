async function convertLCEDIT() {
    const file = document.getElementById('lcedit-save-input').files[0];
    if (!file) {
        return alert('input a file first')
    } else {
        try {
            const data = await file.text();
            const jsonData = JSON.parse(data);
            const converted = JSON.stringify(convert_lcedit_7_0_to_top_50(jsonData));
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([converted], { type: 'text/plain' }));
            a.download = 'export.json';
            a.click();
            delete a;
        } catch (err) {
            console.error(err);
            alert(err);
        }
    }
}

async function convertStudio() {
    const file = document.getElementById('studio-save-input').files[0];
    if (!file) {
        return alert('input a file first')
    } else {
        try {
            const data = await file.text();
            const jsonData = JSON.parse(data);
            const converted = JSON.stringify(convert_yt_studio_to_top_50(jsonData));
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([converted], { type: 'text/plain' }));
            a.download = 'export.json';
            a.click();
            delete a;
        } catch (err) {
            console.error(err);
            alert(err);
        }
    }
}