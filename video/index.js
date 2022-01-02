var current1 = 0;
var current2 = 0;
var current3 = 0;
var current4 = 0;
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
        this.setValue1 = function () {
            document.getElementById("counter").innerHTML = parseFloat(document.getElementById("options.counter.value").value)
            current1 = parseFloat(document.getElementById("options.counter.value").value)
        }
        this.setValue2 = function () {
            document.getElementById("counter2").innerHTML = parseFloat(document.getElementById("options.counter.value2").value)
            current2 = parseFloat(document.getElementById("options.counter.value2").value)
        }
        this.setValue3 = function () {
            document.getElementById("counter3").innerHTML = parseFloat(document.getElementById("options.counter.value3").value)
            current3 = parseFloat(document.getElementById("options.counter.value3").value)
        }
        this.setValue4 = function () {
            document.getElementById("counter4").innerHTML = parseFloat(document.getElementById("options.counter.value4").value)
            current4 = parseFloat(document.getElementById("options.counter.value4").value)
        }
        this.setFooter1 = function () {
            document.getElementById("footer").innerHTML = document.getElementById("options.counter.footer").value
        }
        this.setFooter2 = function () {
            document.getElementById("footer2").innerHTML = document.getElementById("options.counter.footer2").value
        }
        this.setFooter3 = function () {
            document.getElementById("footer3").innerHTML = document.getElementById("options.counter.footer3").value
        }
        this.setFooter4 = function () {
            document.getElementById("footer4").innerHTML = document.getElementById("options.counter.footer4").value
        }
        var rate1 = 0;
        var rate2 = 0;
        var rate3 = 0;
        var rate4 = 0;
        var rate5 = 0;
        var rate6 = 0;
        var rate7 = 0;
        var rate8 = 0;
        var updatetime1;
        var updatetime2;
        var updatetime3;
        var updatetime4;

        this.setMin0 = function () {
            rate1 = document.getElementById("options.counter.rates.basicMinimum0").value
        }
        this.setMax0 = function () {
            rate2 = document.getElementById("options.counter.rates.basicMaximum0").value
        }
        this.setMin1 = function () {
            rate3 = document.getElementById("options.counter.rates.basicMinimum1").value
        }
        this.setMax1 = function () {
            rate4 = document.getElementById("options.counter.rates.basicMaximum1").value
        }
        this.setMin2 = function () {
            rate5 = document.getElementById("options.counter.rates.basicMinimum2").value
        }
        this.setMax2 = function () {
            rate6 = document.getElementById("options.counter.rates.basicMaximum2").value
        }
        this.setMin3 = function () {
            rate7 = document.getElementById("options.counter.rates.basicMinimum3").value
        }
        this.setMax3 = function () {
            rate8 = document.getElementById("options.counter.rates.basicMaximum3").value
        }

        this.setRate0 = function () {
            clearInterval(updatetime1)
            var t = document.getElementById("options.counter.rates.mode.basic.baseUnit0").value
            var e = document.getElementById("options.counter.rates.mode.basic.units0").value
            if (e == "") { }
            else {
                if (t == "1") {
                    e = e * 1000
                    updatetime1 = setInterval(updateManager1, e)
                } else if (t == "60") {
                    e = e * 60000
                    updatetime1 = setInterval(updateManager1, e)
                } else if (t == "3600") {
                    e = e * 3.6e+6
                    updatetime1 = setInterval(updateManager1, e)
                } else if (t == "86400") {
                    e = e * 8.64e+7
                    updatetime1 = setInterval(updateManager1, e)
                }
            }
        }

        this.setRate1 = function () {
            clearInterval(updatetime2)
            var t = document.getElementById("options.counter.rates.mode.basic.baseUnit1").value
            var e = document.getElementById("options.counter.rates.mode.basic.units1").value
            if (e == "") { }
            else {
                if (t == "1") {
                    e = e * 1000
                    updatetime2 = setInterval(updateManager2, e)
                } else if (t == "60") {
                    e = e * 60000
                    updatetime2 = setInterval(updateManager2, e)
                } else if (t == "3600") {
                    e = e * 3.6e+6
                    updatetime2 = setInterval(updateManager2, e)
                } else if (t == "86400") {
                    e = e * 8.64e+7
                    updatetime2 = setInterval(updateManager2, e)
                }
            }
        }

        this.setRate2 = function () {
            clearInterval(updatetime3)
            var t = document.getElementById("options.counter.rates.mode.basic.baseUnit2").value
            var e = document.getElementById("options.counter.rates.mode.basic.units2").value
            if (e == "") { }
            else {
                if (t == "1") {
                    e = e * 1000
                    updatetime3 = setInterval(updateManager3, e)
                } else if (t == "60") {
                    e = e * 60000
                    updatetime3 = setInterval(updateManager3, e)
                } else if (t == "3600") {
                    e = e * 3.6e+6
                    updatetime3 = setInterval(updateManager3, e)
                } else if (t == "86400") {
                    e = e * 8.64e+7
                    updatetime3 = setInterval(updateManager3, e)
                }
            }
        }

        this.setRate3 = function () {
            clearInterval(updatetime4)
            var t = document.getElementById("options.counter.rates.mode.basic.baseUnit3").value
            var e = document.getElementById("options.counter.rates.mode.basic.units3").value
            if (e == "") { }
            else {
                if (t == "1") {
                    e = e * 1000
                    updatetime4 = setInterval(updateManager4, e)
                } else if (t == "60") {
                    e = e * 60000
                    updatetime4 = setInterval(updateManager4, e)
                } else if (t == "3600") {
                    e = e * 3.6e+6
                    updatetime4 = setInterval(updateManager4, e)
                } else if (t == "86400") {
                    e = e * 8.64e+7
                    updatetime4 = setInterval(updateManager4, e)
                }
            }
        }

        function updateManager1() {
            var subs1 = parseFloat(current1)
            var rate9 = 0;
            var rate10 = 0;
            if (document.getElementById('options.counter.rates.mode.basic.baseUnit00').value == "1") {
                rate9 = parseFloat(rate1)
                rate10 = parseFloat(rate2)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnit00').value == "60") {
                rate9 = parseFloat(rate1 / 60)
                rate10 = parseFloat(rate2 / 60)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnit00').value == "3600") {
                rate9 = parseFloat(rate1 / 3600)
                rate10 = parseFloat(rate2 / 3600)
            } else {
                rate9 = parseFloat(rate1 / 86400)
                rate10 = parseFloat(rate2 / 86400)
            }
            rate9 = parseFloat(rate9)
            rate10 = parseFloat(rate10)
            subs1 += random(rate9, rate10)
            if (subs1 == NaN) {
            } else {
                current1 = subs1
            }
            document.getElementById("counter").innerHTML = Math.floor(subs1)
        }

        function updateManager2() {
            var subs1 = parseFloat(current2)
            var rate9 = 0;
            var rate10 = 0;
            if (document.getElementById('options.counter.rates.mode.basic.baseUnit11').value == "1") {
                rate9 = parseFloat(rate3)
                rate10 = parseFloat(rate4)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnit11').value == "60") {
                rate9 = parseFloat(rate3 / 60)
                rate10 = parseFloat(rate4 / 60)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnit11').value == "3600") {
                rate9 = parseFloat(rate3 / 3600)
                rate10 = parseFloat(rate4 / 3600)
            } else {
                rate9 = parseFloat(rate3 / 86400)
                rate10 = parseFloat(rate4 / 86400)
            }
            rate9 = parseFloat(rate9)
            rate10 = parseFloat(rate10)
            subs1 += random(rate9, rate10)
            if (subs1 == NaN) {
            } else {
                current2 = subs1
            }
            document.getElementById("counter2").innerHTML = Math.floor(subs1)
        }

        function updateManager3() {
            var subs1 = parseFloat(current3)
            var rate9 = 0;
            var rate10 = 0;
            if (document.getElementById('options.counter.rates.mode.basic.baseUnit22').value == "1") {
                rate9 = parseFloat(rate5)
                rate10 = parseFloat(rate6)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnit22').value == "60") {
                rate9 = parseFloat(rate5 / 60)
                rate10 = parseFloat(rate6 / 60)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnit22').value == "3600") {
                rate9 = parseFloat(rate5 / 3600)
                rate10 = parseFloat(rate6 / 3600)
            } else {
                rate9 = parseFloat(rate5 / 86400)
                rate10 = parseFloat(rate6 / 86400)
            }
            rate9 = parseFloat(rate9)
            rate10 = parseFloat(rate10)
            subs1 += random(rate9, rate10)
            if (subs1 == NaN) {
            } else {
                current3 = subs1
            }
            document.getElementById("counter3").innerHTML = Math.floor(subs1)
        }

        function updateManager4() {
            var subs1 = parseFloat(current4)
            var rate9 = 0;
            var rate10 = 0;
            if (document.getElementById('options.counter.rates.mode.basic.baseUnit33').value == "1") {
                rate9 = parseFloat(rate7)
                rate10 = parseFloat(rate8)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnit33').value == "60") {
                rate9 = parseFloat(rate7 / 60)
                rate10 = parseFloat(rate8 / 60)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnit33').value == "3600") {
                rate9 = parseFloat(rate7 / 3600)
                rate10 = parseFloat(rate8 / 3600)
            } else {
                rate9 = parseFloat(rate7 / 86400)
                rate10 = parseFloat(rate8 / 86400)
            }
            rate9 = parseFloat(rate9)
            rate10 = parseFloat(rate10)
            subs1 += random(rate9, rate10)
            if (subs1 == NaN) {
            } else {
                current4 = subs1
            }
            document.getElementById("counter4").innerHTML = Math.floor(subs1)
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
const Interface = new LivecountseditInterface()
window.onload = function () {
    if (document.getElementById('tabs.0')) document.getElementById('tabs.0').click();
}
function submit1() {
    Interface.setValue1()
}
function submit2() {
    Interface.setValue2()
}
function submit3() {
    Interface.setValue3()
}
function submit4() {
    Interface.setValue4()
}
document.getElementById("options.counter.avatar.file").addEventListener('input', Interface.setAvatar)
document.getElementById("options.counter.avatar.url").addEventListener('input', Interface.setAvatar)
document.getElementById("options.counter.title").addEventListener('input', Interface.setTitle)
document.getElementById("options.counter.footer").addEventListener('input', Interface.setFooter1)
document.getElementById("options.counter.footer2").addEventListener('input', Interface.setFooter2)
document.getElementById("options.counter.footer3").addEventListener('input', Interface.setFooter3)
document.getElementById("options.counter.footer4").addEventListener('input', Interface.setFooter4)


document.getElementById("options.counter.rates.basicMinimum0").addEventListener('input', Interface.setMin0)
document.getElementById("options.counter.rates.basicMaximum0").addEventListener('input', Interface.setMax0)
document.getElementById("options.counter.rates.mode.basic.units0").addEventListener('input', Interface.setRate0)
document.getElementById("options.counter.rates.mode.basic.baseUnit0").addEventListener('change', Interface.setRate0)
document.getElementById("options.counter.rates.mode.basic.baseUnit00").addEventListener('change', Interface.setRate0)

document.getElementById("options.counter.rates.basicMinimum1").addEventListener('input', Interface.setMin1)
document.getElementById("options.counter.rates.basicMaximum1").addEventListener('input', Interface.setMax1)
document.getElementById("options.counter.rates.mode.basic.units1").addEventListener('input', Interface.setRate1)
document.getElementById("options.counter.rates.mode.basic.baseUnit1").addEventListener('change', Interface.setRate1)
document.getElementById("options.counter.rates.mode.basic.baseUnit11").addEventListener('change', Interface.setRate1)

document.getElementById("options.counter.rates.basicMinimum2").addEventListener('input', Interface.setMin2)
document.getElementById("options.counter.rates.basicMaximum2").addEventListener('input', Interface.setMax2)
document.getElementById("options.counter.rates.mode.basic.units2").addEventListener('input', Interface.setRate2)
document.getElementById("options.counter.rates.mode.basic.baseUnit2").addEventListener('change', Interface.setRate2)
document.getElementById("options.counter.rates.mode.basic.baseUnit22").addEventListener('change', Interface.setRate2)

document.getElementById("options.counter.rates.basicMinimum3").addEventListener('input', Interface.setMin3)
document.getElementById("options.counter.rates.basicMaximum3").addEventListener('input', Interface.setMax3)
document.getElementById("options.counter.rates.mode.basic.units3").addEventListener('input', Interface.setRate3)
document.getElementById("options.counter.rates.mode.basic.baseUnit3").addEventListener('change', Interface.setRate3)
document.getElementById("options.counter.rates.mode.basic.baseUnit33").addEventListener('change', Interface.setRate3)


document.getElementById("odometer.up.color.settings").addEventListener('input', Interface.odometerUpColor)
document.getElementById("odometer.down.color.settings").addEventListener('input', Interface.odometerDownColor)
document.getElementById("username.color.settings").addEventListener('input', function (e) {
    document.getElementById('counter-title').style.color = document.getElementById('username.color.settings').value
})
document.getElementById("footer.color.settings").addEventListener('input', function (e) {
    document.getElementById('footer').style.color = document.getElementById('footer.color.settings').value
    document.getElementById('footer2').style.color = document.getElementById('footer.color.settings').value
    document.getElementById('footer3').style.color = document.getElementById('footer.color.settings').value
    document.getElementById('footer4').style.color = document.getElementById('footer.color.settings').value
})
document.getElementById("counter.color.settings").addEventListener('input', function (e) {
    document.getElementById('counter').style.color = document.getElementById('counter.color.settings').value
})
document.getElementById("counter.color.settings2").addEventListener('input', function (e) {
    document.getElementById('counter2').style.color = document.getElementById('counter.color.settings2').value
    document.getElementById('counter3').style.color = document.getElementById('counter.color.settings2').value
    document.getElementById('counter4').style.color = document.getElementById('counter.color.settings2').value
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


function random(min, max) {
    return Math.random() * (max - min) + min
}