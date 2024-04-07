updateOdo()
function getDisplayedCount(n) {
    if (data.abbreviate) return abb(n)
    else return Math.floor(n);
}
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
const s = document.createElement('style');
document.head.appendChild(s);
if (!data.showBlankSlots) {
    s.innerText += '#card_ * {display: none;}'; 
}

if (!data.showDifferences) {
    s.innerText += '.subgap * {display: none;}'; 
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
        let fastestCount = -Infinity;
        let slowest = ""
        let slowestCount = Infinity;
        if (data.data.length > 1) {
            for (let i = 0; i < data.data.length; i++) {
                if ((data.data[i].count - data.data[i].lastCount >= fastestCount)) {
                    fastestCount = data.data[i].count - data.data[i].lastCount;
                    fastest = data.data[i].id;
                }
                if ((data.data[i].count - data.data[i].lastCount < slowestCount)) {
                    slowestCount = data.data[i].count - data.data[i].lastCount;
                    slowest = data.data[i].id;
                }
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
                const currentCard = document.getElementsByClassName("card")[i]
                if (currentCard) {
                    if (data.data[i]) {
                        if (!data.data[i].image) {
                            data.data[i].image = "../default.png";
                        }
                        currentCard.children[1].src = data.data[i].image
                        currentCard.children[2].innerText = data.data[i].name
                        currentCard.children[1].id = "image_" + data.data[i].id
                        currentCard.children[2].id = "name_" + data.data[i].id
                        currentCard.children[0].id = "num_" + data.data[i].id
                        currentCard.id = "card_" + data.data[i].id
                        currentCard.children[3].id = "count_" + data.data[i].id
                        currentCard.children[3].innerText = getDisplayedCount(data.data[i].count)
                        if (data.data[i+1]) {
                            currentCard.children[4].innerText = getDisplayedCount(data.data[i].count)-getDisplayedCount(data.data[i+1].count)
                        } else {
                            currentCard.children[4].innerText = getDisplayedCount(data.data[i].count)
                        }

                        if (fastest == data.data[i].id) {
                            if (data.fastest == true) {
                                document.getElementById("card_" + fastest).children[2].innerText = "🔥" + data.data[i].name
                            }
                        }
                        if (slowest == data.data[i].id) {
                            if (data.slowest == true) {
                                document.getElementById("card_" + slowest).children[2].innerText = "⌛️" + data.data[i].name
                            }
                        }
                    }
                }
            }
        }
    }
}
observer.observe(document.body, { childList: true });
