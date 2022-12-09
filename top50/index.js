let currentIndex = 0;
let data = {
    "data": [],
    "bgColor": "#FFF",
    "textColor": "#000",
    "boxColor": "#f7f5fe",
    "boxBorder": "#FFF",
    "imageBorder": "0",
    "sort": ""
};
if (localStorage.getItem("data") != null) {
    data = JSON.parse(localStorage.getItem("data"));
    for (let i = 0; i < data.data.length; i++) {
        let id = data.data[i].id;
        let image = data.data[i].image;
        let name = data.data[i].name;
        let count = data.data[i].count;
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
        countDiv.classList = "odometer";
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
    document.body.style.backgroundColor = data.bgColor;
    document.body.style.color = data.textColor;
    fix()
    setInterval(update, 2000);
} else {
    setInterval(update, 2000);
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
        countDiv.classList = "odometer odometer-auto-theme";
        countDiv.id = "count_" + currentIndex;
        countDiv.innerHTML = count;
        countDiv.setAttribute("cid", id);
        card.appendChild(div);
        card.appendChild(img);
        card.appendChild(nameDiv);
        card.appendChild(countDiv);
        document.getElementById('main').appendChild(card);
        currentIndex++;
        odo = new Odometer({
            el: countDiv,
        });
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
        }
        for (let i = 0; i < data.data.length; i++) {
            if ((i + 1) < 10) {
                num = "0" + (i + 1);
            } else {
                num = (i + 1);
            }
            if (document.getElementById("card_" + i)) {
                let number = (i + 1)
                if (number / 5 <= data.data.length) {
                    document.getElementById("num_" + i).innerHTML = num;
                    document.getElementById("name_" + i).innerHTML = data.data[i].name;
                    document.getElementById("count_" + i).innerHTML = data.data[i].count;
                    document.getElementById("img_" + i).src = data.data[i].image;
                    document.getElementById("num_" + i).setAttribute("cid", data.data[i].id)
                    document.getElementById("name_" + i).setAttribute("cid", data.data[i].id)
                    document.getElementById("name_" + i).setAttribute("cid2", data.data[i].id)
                    document.getElementById("count_" + i).setAttribute("cid", data.data[i].id)
                    document.getElementById("img_" + i).setAttribute("cid", data.data[i].id)
                    document.getElementById("card_" + i).setAttribute("cid", data.data[i].id)
                }
            }
        }
        console.log(fastest, fastestName, fastestCount)
        document.querySelectorAll('[cid2="'+fastest+'"]').forEach(function (element) {
            element.innerHTML = "🔥 "+fastestName;
        });
        /*   if ((update1 + 1) < 10) {
               num = "0" + (update1 + 1);
           } else {
               num = (update1 + 1);
           }
           if (document.getElementById("num_" + update1)) {
               document.getElementById("num_" + update1).innerHTML = num;
               document.getElementById("name_" + update1).innerHTML = data.data[update1].name;
               document.getElementById("count_" + update1).innerHTML = data.data[update1].count;
               document.getElementById("img_" + update1).src = data.data[update1].image;
               document.getElementById("num_" + update1).setAttribute("cid", data.data[update1].id)
               document.getElementById("name_" + update1).setAttribute("cid", data.data[update1].id)
               document.getElementById("count_" + update1).setAttribute("cid", data.data[update1].id)
               document.getElementById("img_" + update1).setAttribute("cid", data.data[update1].id)
               document.getElementById("card_" + update1).setAttribute("cid", data.data[update1].id)
           }
           if (update1 >= data.data.length) {
           }
       }*/
    }
}

document.getElementById('sort').addEventListener('change', function () {
    update();
});
let selected = null;
document.getElementById('main').addEventListener('click', function (e) {
    let id = e.target.getAttribute('cid');
    if (selected != null) {
        document.querySelector('[cid = "' + selected + '"]').classList.remove('selected');
        document.querySelector('[cid = "' + selected + '"]').style.border = "solid 1px " + data.boxBorder + "";
    }
    if (id == selected) {
        if (selected != null) {
            document.querySelector('[cid = "' + id + '"]').classList.remove('selected');
            document.querySelector('[cid = "' + id + '"]').style.border = "solid 1px " + data.boxBorder + "";
            selected = null;
            document.getElementById('edit_min_gain').value = "";
            document.getElementById('edit_max_gain').value = "";
            document.getElementById('edit_name').value = "";
            document.getElementById('edit_count').value = "";
            document.getElementById('edit_image1').value = "";
        }
    } else {
        document.querySelector('[cid = "' + id + '"]').classList.add('selected');
        document.querySelector('[cid = "' + id + '"]').style.border = "solid 1px red"
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
            let card = document.querySelector('[cid = "' + id + '"]');
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
            if (card.querySelector('.img').src !== image && image !== "") {
                card.querySelector('.img').src = image;
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

function load() {
    data3 = {};
    document.getElementById('main').innerHTML = "";
    if (document.getElementById('loadData').files[0]) {
        document.getElementById('loadData').files[0].text().then(function (data2) {
            data3 = JSON.parse(data2);
            console.log(data2)
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
            let card = document.querySelector('[cid = "' + id + '"]');
            card.remove();
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
    document.querySelectorAll('.img').forEach(function (card) {
        card.style.borderRadius = data.imageBorder + "%";
    });
    document.getElementById('backPicker').value = convert3letterhexto6letters(data.bgColor);
    document.getElementById('textPicker').value = convert3letterhexto6letters(data.textColor);
    document.getElementById('boxPicker').value = convert3letterhexto6letters(data.boxColor);
    document.getElementById('borderPicker').value = convert3letterhexto6letters(data.boxBorder);
    document.getElementById('imageBorder').value = data.imageBorder
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
