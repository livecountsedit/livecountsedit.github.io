var current = 0;
class LivecountseditInterface {
    constructor() {
        this.suffixValues = {
            'k': 1e3,
            'm': 1e6,
            'b': 1e9,
            't': 1e12,
            'q': 1e15,
        },
            this.openTab = function (e, f) {
                var a, b, c;
                b = document.getElementsByClassName('tab-content');
                for (a = 0; a < b.length; a++) {
                    b[a].style.display = 'none';
                }
                c = document.getElementsByClassName('tab-link');
                for (a = 0; a < c.length; a++) {
                    c[a].className = c[a].className.replace(' active', '');
                }
                document.getElementById(f).style.display = 'block';
                e.currentTarget.className += ' active'
            },
            this.rickroll = function () {
                window.location.replace('https://youtu.be/dQw4w9WgXcQ')
            },
            this.setBanner = function () {
                if (!document.getElementById("options.counter.banner.file").files.length) {
                    if (!document.getElementById("options.counter.banner.url").value) return;
                    else document.querySelector(".banner").src = document.getElementById("options.counter.banner.url").value
                } else {
                    document.querySelector(".banner").src = URL.createObjectURL(document.getElementById("options.counter.banner.file").files[0])
                }
            },
            this.setAvatar = function () {
                if (!document.getElementById("options.counter.avatar.file").files.length) {
                    if (!document.getElementById("options.counter.avatar.url").value) return;
                    else document.querySelector(".avatar").src = document.getElementById("options.counter.avatar.url").value
                } else {
                    document.querySelector(".avatar").src = URL.createObjectURL(document.getElementById("options.counter.avatar.file").files[0])
                }
            }
        this.setTitle = function () {
            document.getElementById("counter-title").innerHTML = document.getElementById("options.counter.title").value
        }
        this.setValue = function () {
            document.getElementById("counter").innerHTML = parseFloat(document.getElementById("options.counter.value").value)
            current = parseFloat(document.getElementById("options.counter.value").value)
            if (chart.series[0].points.length == 1500) chart.series[0].data[0].remove();
            chart.series[0].addPoint([Date.now(), Math.floor(current)])
        }
        this.setFooter = function () {
            document.getElementById("footer").innerHTML = document.getElementById("options.counter.footer").value
        }
        var rate1 = 0;
        var rate2 = 0;
        var updatetime;
        this.setMin = function () {
            rate1 = document.getElementById("options.counter.rates.basicMinimum").value
        }
        this.setMax = function () {
            rate2 = document.getElementById("options.counter.rates.basicMaximum").value
        }
        this.setRate = function () {
            clearInterval(updatetime)
            var t = document.getElementById("options.counter.rates.mode.basic.baseUnit").value
            var e = document.getElementById("options.counter.rates.mode.basic.units").value
            if (e == "") { }
            else {
                if (t == "1") {
                    e = e * 1000
                    updatetime = setInterval(updateManager, e)
                } else if (t == "60") {
                    e = e * 60000
                    updatetime = setInterval(updateManager, e)
                } else if (t == "3600") {
                    e = e * 3.6e+6
                    updatetime = setInterval(updateManager, e)
                } else if (t == "86400") {
                    e = e * 8.64e+7
                    updatetime = setInterval(updateManager, e)
                }
            }
        }
        function updateManager() {
            var subs = parseFloat(current)
            var rate3 = 0;
            var rate4 = 0;
            if (document.getElementById('options.counter.rates.mode.basic.baseUnit2').value == "1") {
                rate3 = parseFloat(rate1)
                rate4 = parseFloat(rate2)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnit2').value == "60") {
                rate3 = parseFloat(rate1 / 60)
                rate4 = parseFloat(rate2 / 60)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnit2').value == "3600") {
                rate3 = parseFloat(rate1 / 3600)
                rate4 = parseFloat(rate2 / 3600)
            } else {
                rate3 = parseFloat(rate1 / 86400)
                rate4 = parseFloat(rate2 / 86400)
            }
            rate3 = parseFloat(rate3)
            rate4 = parseFloat(rate4)
            subs += random(rate3, rate4)
            if (subs == NaN) {
            } else {
                current = subs
            }
            document.getElementById("counter").innerHTML = Math.floor(subs)
            if (chart.series[0].points.length == 1500) chart.series[0].data[0].remove();
            chart.series[0].addPoint([Date.now(), Math.floor(subs)])
        }
    }
}

this.usernameColor = function () {
    document.getElementById('counter-title').style.color = document.getElementById('username.color.settings').value
}
this.footerColor = function () {
    document.getElementById('footer').style.color = document.getElementById('footer.color.settings').value
}
this.mainCounterColor = function () {
    document.getElementById('counter').style.color = document.getElementById('counter.color.settings').value
}

var newcolor = "#FFF"
const Interface = new LivecountseditInterface()
window.onload = function () {
    if (document.getElementById('tabs.0')) document.getElementById('tabs.0').click();
}
function submit() {
    Interface.setValue()
}
document.getElementById("options.counter.banner.file").addEventListener('input', Interface.setBanner)
document.getElementById("options.counter.avatar.file").addEventListener('input', Interface.setAvatar)
document.getElementById("options.counter.banner.url").addEventListener('input', Interface.setBanner)
document.getElementById("options.counter.avatar.url").addEventListener('input', Interface.setAvatar)
document.getElementById("options.counter.title").addEventListener('input', Interface.setTitle)
document.getElementById("options.counter.footer").addEventListener('input', Interface.setFooter)
document.getElementById("options.counter.rates.basicMinimum").addEventListener('input', Interface.setMin)
document.getElementById("options.counter.rates.basicMaximum").addEventListener('input', Interface.setMax)
document.getElementById("options.counter.rates.mode.basic.units").addEventListener('input', Interface.setRate)
document.getElementById("options.counter.rates.mode.basic.baseUnit").addEventListener('change', Interface.setRate)
document.getElementById("options.counter.rates.mode.basic.baseUnit2").addEventListener('change', Interface.setRate)
document.getElementById("odometer.up.color.settings").addEventListener('input', Interface.odometerUpColor)
document.getElementById("odometer.down.color.settings").addEventListener('input', Interface.odometerDownColor)
document.getElementById("username.color.settings").addEventListener
    ('input', function (e) {
        document.getElementById('counter-title').style.color = document.getElementById('username.color.settings').value
    })
document.getElementById("footer.color.settings").addEventListener('input', function (e) {
    document.getElementById('footer').style.color = document.getElementById('footer.color.settings').value
})
document.getElementById("counter.color.settings").addEventListener('input', function (e) {
    document.getElementById('counter').style.color = document.getElementById('counter.color.settings').value
})


document.getElementById("odometer.up.color.settings").addEventListener('input', function (e) {
    var newcolor = document.getElementById('odometer.up.color.settings').value
    $('style').append(`.odometer.odometer-auto-theme.odometer-animating-up.odometer-animating .odometer-ribbon-inner, .odometer.odometer-theme-default.odometer-animating-down.odometer-animating .odometer-ribbon-inner {
    color: ${newcolor};
  }`)
})

document.getElementById("odometer.down.color.settings").addEventListener('input', function (e) {
    var newcolor = document.getElementById('odometer.down.color.settings').value
    $('style').append(`.odometer.odometer-auto-theme.odometer-animating-down.odometer-animating .odometer-ribbon-inner, .odometer.odometer-theme-default.odometer-animating-down.odometer-animating .odometer-ribbon-inner {
            color: ${newcolor};
          }`)
})

document.getElementById("box.color.settings").addEventListener('input', function (e) {
    document.querySelector("body > div.container > div.counter-content > div").style.backgroundColor = document.getElementById('box.color.settings').value
})
var textBright = "#bdbdbd"
document.getElementById("graph.color.settings").addEventListener('input', function (e) {
    newcolor = document.getElementById('graph.color.settings').value
    chart = new Highcharts.chart({
        chart: {
            renderTo: 'chart',
            type: 'spline',
            zoomType: 'x',
            backgroundColor: 'transparent',
            plotBorderColor: 'transparent'
        },
        title: {
            text: ' '
        },
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 500,
            gridLineColor: textBright,
            labels: {
                style: {
                    color: textBright
                }
            },
            lineColor: lineColor,
            minorGridLineColor: '#bdbdbd',
            tickColor: lineColor,
            title: {
                style: {
                    color: textBright
                }
            }
        },
        yAxis: {
            title: {
                text: ''
            },
            gridLineColor: textBright,
            labels: {
                style: {
                    color: textBright
                }
            },
            lineColor: lineColor,
            minorGridLineColor: '#bdbdbd',
            tickColor: lineColor
        },
        credits: {
            enabled: true,
            text: "Livecountsedit"
        },

        series: [{
            showInLegend: false,
            name: 'Subscribers',
            marker: { enabled: false },
            color: '#000000',
            lineColor: newcolor,
            data: chart.series[0].userOptions.data
        }]
    });
})
function resetgraph() {
    chart = new Highcharts.chart({
        chart: {
            renderTo: 'chart',
            type: 'spline',
            zoomType: 'x',
            backgroundColor: 'transparent',
            plotBorderColor: 'transparent'
        },
        title: {
            text: ' '
        },
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 500,
            gridLineColor: textBright,
            labels: {
                style: {
                    color: textBright
                }
            },
            lineColor: lineColor,
            minorGridLineColor: '#bdbdbd',
            tickColor: lineColor,
            title: {
                style: {
                    color: textBright
                }
            }
        },
        yAxis: {
            title: {
                text: ''
            },
            gridLineColor: textBright,
            labels: {
                style: {
                    color: textBright
                }
            },
            lineColor: lineColor,
            minorGridLineColor: '#bdbdbd',
            tickColor: lineColor
        },
        credits: {
            enabled: true,
            text: "Livecountsedit"
        },

        series: [{
            showInLegend: false,
            name: 'Subscribers',
            marker: { enabled: false },
            color: '#000000',
            lineColor: newcolor
        }]
    });

}

function random(min, max) {
    return Math.random() * (max - min) + min
}

var lineColor = "#000000"
var maxPoints = 20000;
var chart = new Highcharts.chart({
    chart: {
        renderTo: 'chart',
        type: 'spline',
        zoomType: 'x',
        backgroundColor: 'transparent',
        plotBorderColor: 'transparent'
    },
    title: {
        text: ' '
    },
    xAxis: {
        type: 'datetime',
        tickPixelInterval: 500,
        gridLineColor: textBright,
        labels: {
            style: {
                color: textBright
            }
        },
        lineColor: lineColor,
        minorGridLineColor: '#bdbdbd',
        tickColor: lineColor,
        title: {
            style: {
                color: textBright
            }
        }
    },
    yAxis: {
        title: {
            text: ''
        },
        gridLineColor: textBright,
        labels: {
            style: {
                color: textBright
            }
        },
        lineColor: lineColor,
        minorGridLineColor: '#bdbdbd',
        tickColor: lineColor
    },
    credits: {
        enabled: true,
        text: "Livecountsedit"
    },

    series: [{
        showInLegend: false,
        name: 'Subscribers',
        marker: { enabled: false },
        color: '#000000',
        lineColor: '#FFFFFF'
    }]
});
