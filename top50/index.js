let currentIndex = 0;
const uuidGen = function () {
    let a = function () {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };
    return a() + a() + '-' + a() + '-' + a() + '-' + a() + '-' + a() + a() + a();
}
let uuid = uuidGen()
let data = {
    "data": [],
    "bgColor": "#FFF",
    "textColor": "#000",
    "boxColor": "#f7f5fe",
    "boxBorder": "#FFF",
    "imageBorder": "0",
    "sort": "",
    "rows": 10,
    "columns": 5,
    "gain_min": -10000,
    "gain_max": 10000,
    "updateInterval": 2000,
    "uuid": uuid
};
let updateInterval;

if (localStorage.getItem("data") != null) {
    data = JSON.parse(localStorage.getItem("data"));
    if (!data.updateInterval) {
        data.updateInterval = 2000;
    }
    let c = 1;
    if (!data.rows) {
        data.rows = 5;
    }
    if (!data.columns) {
        data.columns = 10;
    }
    for (var l = 1; l <= data.rows; l++) {
        var htmlcolumn = `<div class="column_${l} column"></div>`;
        $('.main').append(htmlcolumn);
        for (var t = 1; t <= data.columns; t++) {
            let cc = c;
            if (c < 10) {
                cc = "0" + c;
            }
            if (data.data[c - 1]) {
                var htmlcard = `<div class="card card_${c - 1}" id="card_${data.data[c - 1].id}">
            <div class="num" id="num_${data.data[c - 1].id}">${cc}</div>
          <img src="${data.data[c - 1].image}" alt="" id="image_${data.data[c - 1].id}" class="image">
          <div class="name" id="name_${data.data[c - 1].id}">${data.data[c - 1].name}</div>
          <div class="count odometer" id="count_${data.data[c - 1].id}">${data.data[c - 1].count}</div>
          </div>`;
                $('.column_' + l).append(htmlcard);
                c += 1;
            } else {
                var htmlcard = `<div class="card card_${c - 1}" id="card_">
                <div class="num" id="num_">${cc}</div>
                <img src="../default.png" alt="" id="image_" class="image">
                <div class="name" id="name_">Loading</div>
                <div class="count odometer" id="count_">0</div>
                </div>`;
                $('.column_' + l).append(htmlcard);
                c += 1;
            }
        }
    }
    if (!data.uuid) {
        data.uuid = uuidGen();
    }
    document.body.style.backgroundColor = data.bgColor;
    document.body.style.color = data.textColor;
    fix()
    updateInterval = setInterval(update, data.updateInterval);
} else {
    let c = 1;
    for (var l = 1; l <= data.columns; l++) {
        var htmlcolumn = `<div class="column_${l} column"></div>`;
        $('.main').append(htmlcolumn);
        for (var t = 1; t <= data.rows; t++) {
            let cc = c;
            if (c < 10) {
                cc = "0" + c;
            }
            var htmlcard = `<div class="card card_${c - 1}" id="card_">
            <div class="num" id="num_">${cc}</div>
          <img src="../default.png" alt="" id="image_" class="image">
          <div class="name" id="name_">Loading</div>
          <div class="count odometer" id="count_">0</div>
          </div>`;
            $('.column_' + l).append(htmlcard);
            c += 1;
        }
    }
    updateInterval = setInterval(update, data.updateInterval);
    fix()
}
function randomGen() {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function create() {
    let image;
    let min;
    let max;
    if (document.getElementById('add_min_gain').value == "" || document.getElementById('add_max_gain').value == "") {
        alert("Please fill the minimum and maximum gain.");
        return;
    } else {
        min = parseFloat(document.getElementById('add_min_gain').value);
        max = parseFloat(document.getElementById('add_max_gain').value);
    }
    if (document.getElementById('add_count').value == "") {
        alert("Please enter a count value");
        return;
    } else if (document.getElementById('add_name').value == "") {
        alert("Please enter a name value");
        return;
    }
    if (document.getElementById('add_image1').value == "") {
        if (document.getElementById('add_image2').files.length == 0) {
            image = "../default.png";
            bruh()
            return;
        } else {
            let file = document.getElementById('add_image2').files[0];
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                image = reader.result;
                bruh()
            }
        }
    } else {
        image = document.getElementById('add_image1').value;
        bruh()
    }
    function bruh() {
        let count = document.getElementById('add_count').value;
        let name = document.getElementById('add_name').value;
        let id = randomGen();
        data.data.push({
            "name": name,
            "count": parseFloat(count),
            "image": image,
            "min_gain": min,
            "max_gain": max,
            "id": id
        });
        fix()
    }
}
function update() {
    if (data) {
        let fastest = ""
        let fastestCount = 0;
        let fastestName = "";
        for (let i = 0; i < data.data.length; i++) {
            data.data[i].lastCount = data.data[i].count;
            data.data[i].count = parseFloat(data.data[i].count) + random(parseFloat(data.data[i].min_gain), parseFloat(data.data[i].max_gain));
            if (data.data[i].count - data.data[i].lastCount > fastestCount) {
                fastestCount = data.data[i].count - data.data[i].lastCount;
                fastest = data.data[i].id;
                fastestName = data.data[i].name;
            }
        }
        if (document.getElementById('sort').value == "num") {
            data.data = data.data.sort(function (a, b) {
                return b.count - a.count;
            });
            data.sort = "num";
        } else if (document.getElementById('sort').value == "name") {
            data.data = data.data.sort(function (a, b) {
                if (a.name < b.name) {
                    return -1;
                }
                if (a.name > b.name) {
                    return 1;
                }
                return 0;
            });
            data.sort = "name";
        } else {
            data.data = data.data.sort(function (a, b) {
                return b.count - a.count;
            });
            data.sort = "num";
        }
        limit = data.rows * data.columns;
        for (let i = 0; i < limit; i++) {
            if ((i + 1) < 10) {
                num = "0" + (i + 1);
            } else {
                num = (i + 1);
            }
            if (document.getElementsByClassName("card")[i]) {
                if (data.data[i]) {
                    if (!data.data[i].image) {
                        data.data[i].image = "../default.png";
                    }
                    document.getElementsByClassName("card")[i].children[1].src = data.data[i].image
                    document.getElementsByClassName("card")[i].children[2].innerHTML = data.data[i].name
                    document.getElementsByClassName("card")[i].children[3].innerHTML = data.data[i].count
                    document.getElementsByClassName("card")[i].children[1].id = "image_" + data.data[i].id
                    document.getElementsByClassName("card")[i].children[2].id = "name_" + data.data[i].id
                    document.getElementsByClassName("card")[i].children[3].id = "count_" + data.data[i].id
                    document.getElementsByClassName("card")[i].children[0].id = "num_" + data.data[i].id
                    document.getElementsByClassName("card")[i].id = "card_" + data.data[i].id
                    if (selected == data.data[i].id) {
                        document.getElementById("card_" + selected).style.border = "1px solid red";
                    } else {
                        document.getElementById("card_" + data.data[i].id).style.border = "1px solid " + data.boxBorder + "";
                    }
                    if (fastest == data.data[i].id) {
                        document.getElementById("card_" + fastest).children[2].innerHTML = "🔥" + data.data[i].name
                    }
                }
            }
        }
    }
}

document.getElementById('sort').addEventListener('change', function () {
    update();
});
let selected = null;
document.getElementById('main').addEventListener('click', function (e) {
    let id = e.target.id.split("_")[1];
    if (e.target.id.split("_").length > 2) {
        for (let i = 2; i < e.target.id.split("_").length; i++) {
            id = id + "_" + e.target.id.split("_")[i];
        }
    }
    if (selected != null) {
        document.getElementById('card_' + selected + '').classList.remove('selected');
        document.getElementById('card_' + selected + '').style.border = "solid 1px " + data.boxBorder + "";
    }
    if (id == selected) {
        if (selected != null) {
            document.getElementById('card_' + id + '').classList.remove('selected');
            document.getElementById('card_' + id + '').style.border = "solid 1px " + data.boxBorder + "";
            selected = null;
            document.getElementById('edit_min_gain').value = "";
            document.getElementById('edit_max_gain').value = "";
            document.getElementById('edit_name').value = "";
            document.getElementById('edit_count').value = "";
            document.getElementById('edit_image1').value = "";
        }
    } else {
        document.getElementById('card_' + id + '').classList.add('selected');
        document.getElementById('card_' + id + '').style.border = "solid 1px red"
        selected = id;
        for (let q = 0; q < data.data.length; q++) {
            if (data.data[q].id == id) {
                document.getElementById('edit_min_gain').value = data.data[q].min_gain;
                document.getElementById('edit_max_gain').value = data.data[q].max_gain;
                document.getElementById('edit_name').value = data.data[q].name;
                document.getElementById('edit_count').value = data.data[q].count;
                document.getElementById('edit_image1').value = data.data[q].image;
            }
        }
    }
});
function edit() {
    if (selected !== null) {
        let id = selected;
        let name = document.getElementById('edit_name').value;
        let count = document.getElementById('edit_count').value;
        let image;
        if (document.getElementById('edit_image_check').checked) {
            if (document.getElementById('edit_image1').value !== "") {
                image = document.getElementById('edit_image1').value;
                bruh()
            } else if (document.getElementById('edit_image2').files.length !== 0) {
                let file = document.getElementById('edit_image2').files[0];
                let reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function () {
                    image = reader.result;
                    bruh()
                }
            }
        } else {
            bruh()
        }
        function bruh() {
            let min = document.getElementById('edit_min_gain').value;
            let max = document.getElementById('edit_max_gain').value;
            document.getElementById('edit_image2').value = "";
            let card = document.getElementById('card_' + id);
            for (let i = 0; i < data.data.length; i++) {
                if (data.data[i].id == id) {
                    if (document.getElementById('edit_min_gain_check').checked) {
                        data.data[i].min_gain = min;
                    }
                    if (document.getElementById('edit_max_gain_check').checked) {
                        data.data[i].max_gain = max;
                    }
                }
            }
            if (document.getElementById('edit_name_check').checked) {
                if (card.querySelector('.name').innerHTML !== name && name !== "") {
                    card.querySelector('.name').innerHTML = name;
                    for (let i = 0; i < data.data.length; i++) {
                        if (data.data[i].id == id) {
                            data.data[i].name = name;
                        }
                    }
                }
            }
            if (document.getElementById('edit_count_check').checked) {
                if (card.querySelector('.odometer').innerHTML !== count && count !== "") {
                    card.querySelector('.odometer').innerHTML = count;
                    for (let i = 0; i < data.data.length; i++) {
                        if (data.data[i].id == id) {
                            data.data[i].count = count;
                        }
                    }
                }
            }
            if (card.querySelector('.image').src !== image && image !== "") {
                card.querySelector('.image').src = image;
                for (let i = 0; i < data.data.length; i++) {
                    if (data.data[i].id == id) {
                        data.data[i].image = image;
                    }
                }
            }
        }
    } else {
        alert("Please select a card by clicking it.");
    }
}

function save() {
    localStorage.setItem("data", JSON.stringify(data));
    alert("Saved!");
}

function saveData2() {
    localStorage.setItem("data", JSON.stringify(data));
}

function load() {
    data3 = {};
    document.getElementById('main').innerHTML = "";
    if (document.getElementById('loadData').files[0]) {
        document.getElementById('loadData').files[0].text().then(function (data2) {
            data3 = JSON.parse(data2);
            if (data3.data) {
                data = JSON.parse(data2);
                for (let i = 0; i < data.data.length; i++) {
                    let id = data.data[i].id;
                    let image = data.data[i].image;
                    let name = data.data[i].name;
                    let count = data.data[i].count;
                    if (currentIndex < 10) {
                        num = "0" + (currentIndex).toString();
                    } else {
                        num = currentIndex;
                    }
                    let card = document.createElement('div');
                    card.className = "card";
                    card.id = "card_" + currentIndex;
                    card.setAttribute("cid", id);
                    let div = document.createElement('div');
                    div.className = "num";
                    div.id = "num_" + currentIndex;
                    div.innerHTML = num;
                    div.setAttribute("cid", id);
                    let img = document.createElement('img');
                    img.className = "img";
                    img.id = "img_" + currentIndex;
                    img.src = image;
                    img.setAttribute("cid", id);
                    let nameDiv = document.createElement('h1');
                    nameDiv.className = "name";
                    nameDiv.id = "name_" + currentIndex;
                    nameDiv.innerHTML = name;
                    nameDiv.setAttribute("cid", id);
                    let countDiv = document.createElement('h2');
                    countDiv.classList = "odometer";
                    countDiv.id = "count_" + currentIndex;
                    countDiv.innerHTML = count;
                    countDiv.setAttribute("cid", id);
                    odo = new Odometer({
                        el: countDiv,
                    });
                    card.appendChild(div);
                    card.appendChild(img);
                    card.appendChild(nameDiv);
                    card.appendChild(countDiv);
                    document.getElementById('main').appendChild(card);
                    currentIndex++;
                }
                document.body.style.backgroundColor = data.bgColor;
                document.body.style.color = data.textColor;
                fix()
                document.getElementById('sort').value = data.sort;
                if (!data.uuid) {
                    data.uuid = uuidGen();
                }
                localStorage.setItem("data", JSON.stringify(data));
                location.reload();
            }
        });
    }
}
function save2() {
    let data2 = JSON.stringify(data);
    let a = document.createElement('a');
    let file = new Blob([data2], { type: 'text/json' });
    a.href = URL.createObjectURL(file);
    a.download = 'data.json';
    a.click();
}

function reset() {
    if (confirm("Are you sure you want to reset?")) {
        localStorage.clear();
        location.reload();
    }
}

function deleteChannel() {
    if (selected !== null) {
        if (confirm("Are you sure you want to delete this channel?")) {
            let id = selected;
            let image = document.getElementById('image_' + id).src = "../default.png"
            let name = document.getElementById('name_' + id).innerHTML = "Loading";
            let count = document.getElementById('count_' + id).innerHTML = "0";
            name.innerHTML = "";
            count.innerHTML = "";
            image.src = "";
            for (let i = 0; i < data.data.length; i++) {
                if (data.data[i].id == id) {
                    data.data.splice(i, 1);
                }
            }
            selected = null;
        }
    } else {
        alert("Please select a card by clicking it.");
    }
}

document.getElementById('backPicker').addEventListener('change', function () {
    document.body.style.backgroundColor = this.value;
    data.bgColor = this.value;
});

document.getElementById('textPicker').addEventListener('change', function () {
    document.getElementById('main').style.color = this.value;
    data.textColor = this.value;
});

document.getElementById('boxPicker').addEventListener('change', function () {
    let color = this.value;
    data.boxColor = color;
    fix()
});

document.getElementById('borderPicker').addEventListener('change', function () {
    let color = this.value;
    data.boxBorder = color;
    fix()
});

document.getElementById('imageBorder').addEventListener('change', function () {
    let num = this.value;
    data.imageBorder = num;
    fix()
});

function fix() {
    document.querySelectorAll('.card').forEach(function (card) {
        card.style.backgroundColor = data.boxColor;
        if (card.className.split(' ').includes("selected") == false) {
            card.style.border = "solid 1px " + data.boxBorder;
        }
    });
    document.querySelectorAll('.image').forEach(function (card) {
        card.style.borderRadius = data.imageBorder + "%";
    });
    document.getElementById('backPicker').value = convert3letterhexto6letters(data.bgColor);
    document.getElementById('textPicker').value = convert3letterhexto6letters(data.textColor);
    document.getElementById('boxPicker').value = convert3letterhexto6letters(data.boxColor);
    document.getElementById('borderPicker').value = convert3letterhexto6letters(data.boxBorder);
    document.getElementById('imageBorder').value = data.imageBorder
    if (data.updateInterval) {
        document.getElementById('updateint').value = (data.updateInterval/1000).toString()
    }
    document.getElementById('sort').value = data.sort;
}
function convert3letterhexto6letters(hex) {
    hex = hex.replace('#', '');
    if (hex.length == 3) {
        hex = "#" + hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    } else {
        hex = "#" + hex;
    }
    return hex;
}
let code = data.uuid
let connected = false;
if (window.location.href.includes('?code=')) {
    code = window.location.href.split('?code=')[1];
    connected = true;
}

function connect() {
    if (window.location.href.includes('?code=')) {
        window.location.href = window.location.href.split('?code=')[0];
    } else {
        saveData2()
        window.location.href = window.location.href + "?code=" + code;
    }
}
let update2Hold;
if (connected == true) {
    update2()
    update2Hold = setInterval(update2, 5000);
    document.getElementById('isconnected').innerHTML = "Yes";
    document.getElementById('toConnect').innerHTML = "Disconnect";
}

function update2() {
    if (!data.gain_min) {
        data.gain_min = -10000;
    }
    if (!data.gain_max) {
        data.gain_max = 10000;
    }
    fetch('https://fake-sub-count.sfmg.repl.co/' + code + '')
        .then(response => response.json())
        .then(json => {
            if (json.users) {
                if (json.users.length > 0) {
                    for (let i = 0; i < json.users.length; i++) {
                        let hasID = false;
                        for (let r = 0; r < data.data.length; r++) {
                            if (data.data[r].id == json.users[i].id) {
                                min = parseInt(json.users[i].min);
                                max = parseInt(json.users[i].max);
                                if (min > data.gain_max) {
                                    min = data.gain_max;
                                } else if (min < data.gain_min) {
                                    min = data.gain_min;
                                }
                                if (max > data.gain_max) {
                                    max = data.gain_max;
                                } else if (max < data.gain_min) {
                                    max = data.gain_min;
                                }
                                data.data[r].min_gain = min;
                                data.data[r].max_gain = max;
                                hasID = true;
                            }
                        }
                        if (hasID == false) {
                            fetch('https://mixerno.space/api/youtube-channel-counter/user/' + json.users[i].id + '')
                                .then(response => response.json())
                                .then(json2 => {
                                    let count = 0;
                                    let name = json2.user[0].count;
                                    let image = json2.user[1].count;
                                    let min = json.users[i].min;
                                    let max = json.users[i].max;
                                    if (min > data.gain_max) {
                                        min = data.gain_max;
                                    } else if (min < data.gain_min) {
                                        min = data.gain_min;
                                    }
                                    if (max > data.gain_max) {
                                        max = data.gain_max;
                                    } else if (max < data.gain_min) {
                                        max = data.gain_min;
                                    }
                                    let id = json.users[i].id
                                    data.data.push({
                                        "name": name,
                                        "count": parseFloat(count),
                                        "image": image,
                                        "min_gain": min,
                                        "max_gain": max,
                                        "id": id
                                    });
                                    fix()
                                })
                        }
                    }
                }
                if (json.events.length > 0) {
                    for (let i = 0; i < json.events.length; i++) {
                        if (json.events[i].values) {
                            let id = json.events[i].id;
                            let min = parseFloat(json.events[i].values[0])
                            let max = parseFloat(json.events[i].values[1])
                            for (let i = 0; i < data.data.length; i++) {
                                if (data.data[i].id == id) {
                                    let num = Math.floor(Math.random() * (max - min + 1)) + min;
                                    data.data[i].count += num;
                                }
                            }
                        }
                    }
                }
            } else {
                alert("You are no longer connected.");
                clearInterval(update2Hold);
                document.getElementById('isconnected').innerHTML = "No";
                fetch('https://fake-sub-count.sfmg.repl.co/create?code=' + code + '', {
                    method: 'POST'
                })
                    .then(response => response.text())
                    .then(json => {
                        if (json == "done") {
                            saveData2()
                            location.reload();
                        }
                    })
            }
        });
}
let saveInterval;
document.getElementById('autosave').addEventListener('change', function () {
    if (document.getElementById('autosave').checked == true) {
        saveInterval = setInterval(saveData2, 10000);
    } else {
        clearInterval(saveInterval);
    }
})

document.getElementById('updateint').addEventListener('change', function () {
    let int = document.getElementById('updateint').value;
    if (isNaN(int)) {
        alert("Please enter a number.")
        return;
    }
    clearInterval(updateInterval);
    int = int * 1000;
    updateInterval = setInterval(update, int);
    data.updateInterval = int;
})

document.getElementById('min_gain_global').addEventListener('change', function () {
    let min = document.getElementById('min_gain_global').value;
    if (isNaN(min)) {
        alert("Please enter a number.")
        return;
    }
    for (let i = 0; i < data.data.length; i++) {
        if (data.data[i].min_gain > min) {
            data.data[i].min_gain = min;
        }
    }
    data.gain_min = min;
});

document.getElementById('max_gain_global').addEventListener('change', function () {
    let max = document.getElementById('max_gain_global').value;
    if (isNaN(max)) {
        alert("Please enter a number.")
        return;
    }
    for (let i = 0; i < data.data.length; i++) {
        if (data.data[i].max_gain < max) {
            data.data[i].max_gain = max;
        }
    }
    data.gain_max = max;
});

function custom() {
    let name = prompt("What is the command name?")
    let min = prompt("What is the minimum amount of subscribers the channel can gain?")
    if (isNaN(min)) {
        alert("Please enter a number.")
        return;
    }
    let max = prompt("What is the maximum amount of subscribers the channel can gain?")
    if (isNaN(max)) {
        alert("Please enter a number.")
        return;
    }
    alert('$(urlfetch https://Fake-Sub-Count.sfmg.repl.co/' + code + '/$(userid)?values=' + min + ',' + max + ')')
}

document.getElementById('connect').value = '$(urlfetch https://Fake-Sub-Count.sfmg.repl.co/' + code + '/$(userid)/$(query))';
document.getElementById('connect3').value = '$(urlfetch https://Fake-Sub-Count.sfmg.repl.co/' + code + '/$(userid)/$(query)?value=edit)';
document.getElementById('connect2').value = '$(urlfetch https://Fake-Sub-Count.sfmg.repl.co/' + code + '/$(userid)?values=10,20';
