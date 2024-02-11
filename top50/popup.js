updateOdo()
document.querySelectorAll('.image').forEach(function (card) {
    if (!data.showImages) {
        card.style.display = "";
    }
    card.style.borderRadius = data.imageBorder + "%";
    card.style.borderColor = data.imageBorderColor;
})
if (!data.showNames) {
    document.querySelectorAll('.name').forEach(function (card) {
        card.style.display = "";
    })
}
if (!data.showCounts) {
    document.querySelectorAll('.count').forEach(function (card) {
        card.style.display = "";
    })
}
if (!data.showRankings) {
    document.querySelectorAll('.num').forEach(function (card) {
        card.style.display = "";
    })
}
document.body.style.backgroundColor = data.bgColor;
document.body.style.color = data.textColor;
document.querySelectorAll('.card').forEach(function (card) {
    card.style.backgroundColor = data.boxColor
    card.style.borderColor = data.boxBorder
})

if (data.theme.includes('top100')) {
    data.max = 100;
} else if (data.theme.includes('top25')) {
    data.max = 25;
} else if (data.theme.includes('top50')) {
    data.max = 50;
} else if (data.theme.includes('top10')) {
    data.max = 10;
} else if (data.theme.includes('top150')) {
    data.max = 150;
}
function update() {
    if (data) {
        let fastest = ""
        let fastestCount = 0;
        let slowest = ""
        let slowestCount = 0;
        for (let i = 0; i < data.data.length; i++) {
            if ((data.data[i].count - data.data[i].lastCount > fastestCount) || (fastestCount == 0)) {
                fastestCount = data.data[i].count - data.data[i].lastCount;
                fastest = data.data[i].id;
            }
            if ((data.data[i].count - data.data[i].lastCount < slowestCount) || (slowestCount == 0)) {
                slowestCount = data.data[i].count - data.data[i].lastCount;
                slowest = data.data[i].id;
            }
        }
        if (data.sort == "fastest") {
            data.data = data.data.sort(function (a, b) {
                return avg(b.min_gain, b.max_gain) - avg(a.min_gain, a.max_gain)
            });
        } else if (data.sort == "name") {
            data.data = data.data.sort(function (a, b) {
                return a.name.localeCompare(b.name)
            });
        } else {
            data.data = data.data.sort(function (a, b) {
                return b.count - a.count
            });
        }
        if (data.order == "asc") {
            data.data = data.data.reverse();
        }
        if (data.visulization == 'default') {
            for (let i = 0; i < data.max; i++) {
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
                        document.getElementsByClassName("card")[i].children[1].id = "image_" + data.data[i].id
                        document.getElementsByClassName("card")[i].children[2].id = "name_" + data.data[i].id
                        document.getElementsByClassName("card")[i].children[0].id = "num_" + data.data[i].id
                        document.getElementsByClassName("card")[i].id = "card_" + data.data[i].id
                        document.getElementsByClassName("card")[i].children[3].id = "count_" + data.data[i].id
                        if (data.abbreviate == true) {
                            document.getElementsByClassName("card")[i].children[3].innerHTML = abb(data.data[i].count)
                        } else {
                            document.getElementsByClassName("card")[i].children[3].innerHTML = Math.floor(data.data[i].count)
                        }
                        if (fastest == data.data[i].id) {
                            if (data.fastest == true) {
                                document.getElementById("card_" + fastest).children[2].innerHTML = "🔥" + data.data[i].name
                            }
                        }
                        if (slowest == data.data[i].id) {
                            if (data.slowest == true) {
                                document.getElementById("card_" + slowest).children[2].innerHTML = "⌛️" + data.data[i].name
                            }
                        }
                    }
                }
            }
        }
    }
}
observer.observe(document.body, { childList: true });
