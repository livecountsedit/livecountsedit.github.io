let currentIndex = 0;
let data = [];
if (localStorage.getItem("data") != null) {
    //currentIndex = JSON.parse(localStorage.getItem("data")).length;
    data = JSON.parse(localStorage.getItem("data"));
    for (let i = 0; i < data.length; i++) {
        let id = data[i].id;
        let image = data[i].image;
        let name = data[i].name;
        let count = data[i].count;
        if (currentIndex < 10) {
            num = "0" + (currentIndex + 1).toString();
        } else {
            num = currentIndex + 1;
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
        countDiv.classList = "count odometer";
        countDiv.id = "count_" + currentIndex;
        countDiv.innerHTML = count;
        countDiv.setAttribute("cid", id);
        card.appendChild(div);
        card.appendChild(img);
        card.appendChild(nameDiv);
        card.appendChild(countDiv);
        document.getElementById('main').appendChild(card);
        currentIndex++;
    }
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
            alert("Please enter an image");
            return;
        } else {
            image = URL.createObjectURL(document.getElementById('add_image2').files[0]);
        }
    } else {
        image = document.getElementById('add_image1').value;
    }
    let count = document.getElementById('add_count').value;
    let name = document.getElementById('add_name').value;
    let num;
    let id = randomGen();
    if (currentIndex < 10) {
        num = "0" + (currentIndex + 1).toString();
    } else {
        num = currentIndex + 1;
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
    countDiv.classList = "count odometer";
    countDiv.id = "count_" + currentIndex;
    countDiv.innerHTML = count;
    countDiv.setAttribute("cid", id);
    card.appendChild(div);
    card.appendChild(img);
    card.appendChild(nameDiv);
    card.appendChild(countDiv);
    document.getElementById('main').appendChild(card);
    currentIndex++;
    data.push({
        "name": name,
        "count": parseFloat(count),
        "image": image,
        "min_gain": min,
        "max_gain": max,
        "id": id
    });
}

function update() {
    if (data) {
        for (let i = 0; i < data.length; i++) {
            data[i].count = parseFloat(data[i].count) + random(parseFloat(data[i].min_gain), parseFloat(data[i].max_gain));
        }
        if (document.getElementById('sort').value == "num") {
            data = data.sort(function (a, b) {
                return b.count - a.count;
            });
        } else if (document.getElementById('sort').value == "name") {
            data = data.sort(function (a, b) {
                if (a.name < b.name) {
                    return -1;
                }
                if (a.name > b.name) {
                    return 1;
                }
                return 0;
            });
        }
        for (let i = 0; i < data.length; i++) {
            if ((i + 1) < 10) {
                num = "0" + (i + 1);
            } else {
                num = (i + 1);
            }
            document.getElementById("num_" + i).innerHTML = num;
            document.getElementById("name_" + i).innerHTML = data[i].name;
            document.getElementById("count_" + i).innerHTML = data[i].count;
            document.getElementById("img_" + i).src = data[i].image;
            document.getElementById("num_" + i).setAttribute("cid", data[i].id)
            document.getElementById("name_" + i).setAttribute("cid", data[i].id)
            document.getElementById("count_" + i).setAttribute("cid", data[i].id)
            document.getElementById("img_" + i).setAttribute("cid", data[i].id)
            document.getElementById("card_" + i).setAttribute("cid", data[i].id)
        }
    }
}

setInterval(update, 2000);

document.getElementById('sort').addEventListener('change', function () {
    update();
});
let selected = null;
document.getElementById('main').addEventListener('click', function (e) {
    let id = e.target.getAttribute('cid');
    if (selected !== null) {
        document.querySelector('[cid = "' + selected + '"]').classList.remove('selected');
    }
    if (id == selected) {
        document.querySelector('[cid = "' + id + '"]').classList.remove('selected');
        selected = null;
    } else {
        selected = id;
        document.querySelector('[cid = "' + id + '"]').classList.add('selected');
        let card = document.querySelector('[cid = "' + id + '"]');
        document.getElementById('edit_name').value = card.querySelector('.name').innerHTML;
        document.getElementById('edit_count').value = card.querySelector('.count').innerHTML;
        document.getElementById('edit_image1').value = card.querySelector('.img').src;
        for (let q = 0; q < data.length; q++) {
            if (data[q].id == id) {
                document.getElementById('edit_min_gain').value = data[q].min_gain;
                document.getElementById('edit_max_gain').value = data[q].max_gain;
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
        if (document.getElementById('edit_image1').value !== "") {
            image = document.getElementById('edit_image1').value;
        } else if (document.getElementById('edit_image2').files.length !== 0) {
            image = URL.createObjectURL(document.getElementById('edit_image2').files[0]);
        }
        let min = document.getElementById('edit_min_gain').value;
        let max = document.getElementById('edit_max_gain').value;
        document.getElementById('edit_image2').value = "";
        let card = document.querySelector('[cid = "' + id + '"]');
        for (let i = 0; i < data.length; i++) {
            if (data[i].id == id) {
                data[i].min_gain = min;
                data[i].max_gain = max;
            }
        }
        if (card.querySelector('.name').innerHTML !== name && name !== "") {
            card.querySelector('.name').innerHTML = name;
            for (let i = 0; i < data.length; i++) {
                if (data[i].id == id) {
                    data[i].name = name;
                }
            }
        }
        if (card.querySelector('.count').innerHTML !== count && count !== "") {
            card.querySelector('.count').innerHTML = count;
            for (let i = 0; i < data.length; i++) {
                if (data[i].id == id) {
                    data[i].count = count;
                }
            }
        }
        if (card.querySelector('.img').src !== image && image !== "") {
            card.querySelector('.img').src = image;
            for (let i = 0; i < data.length; i++) {
                if (data[i].id == id) {
                    data[i].image = image;
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

function load() {
    data = [];
    document.getElementById('main').innerHTML = "";
    document.getElementById('loadData').files[0].text().then(function (data) {
        data = JSON.parse(data);
        for (let q = 0; q < data.length; q++) {
            let name = data[q].name;
            let count = data[q].count;
            let image = data[q].image;
            let id = data[q].id;
            if (currentIndex < 10) {
                num = "0" + (currentIndex + 1).toString();
            } else {
                num = currentIndex + 1;
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
            countDiv.classList = "count odometer";
            countDiv.id = "count_" + currentIndex;
            countDiv.innerHTML = count;
            countDiv.setAttribute("cid", id);
            card.appendChild(div);
            card.appendChild(img);
            card.appendChild(nameDiv);
            card.appendChild(countDiv);
            document.getElementById('main').appendChild(card);
            currentIndex++;
        }
    });
}
function save2() {
    //save data into json file
    let data2 = JSON.stringify(data);
    let a = document.createElement('a');
    let file = new Blob([data2], { type: 'text/json' });
    a.href = URL.createObjectURL(file);
    a.download = 'data.json';
    a.click();
}

function reset() {
    localStorage.clear();
    location.reload();
}

document.getElementById('bg_color').addEventListener('change', function () {
    document.body.style.backgroundColor = this.value;
    document.getElementById('bg_color').value = this.value;
});

document.getElementById('text_color').addEventListener('change', function () {
});

document.getElementById('border_color').addEventListener('change', function () {
    document.getElementById('border_color').value = this.value;
    document.querySelector('.other').style.borderColor = this.value;
    document.querySelectorAll('.dashed').forEach(function (e) {
        console.log(e.style.border)
        e.style.border = "1px dashed " + this.value;
        console.log(e.style.border)
    });
});