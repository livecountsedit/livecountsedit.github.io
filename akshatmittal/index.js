var current = 0;
var current1 = 0;
var current2 = 0;
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
                    else document.getElementById("yt_cover").src = document.getElementById("options.counter.banner.url").value
                } else {
                    document.getElementById("yt_cover").src = URL.createObjectURL(document.getElementById("options.counter.banner.file").files[0])
                }
            },
            this.setAvatar = function () {
                if (!document.getElementById("options.counter.avatar.file").files.length) {
                    if (!document.getElementById("options.counter.avatar.url").value) return;
                    else document.getElementById("yt_profile").src = document.getElementById("options.counter.avatar.url").value
                } else {
                    document.getElementById("yt_profile").src = URL.createObjectURL(document.getElementById("options.counter.avatar.file").files[0])
                }
            }
        this.setTitle = function () {
            document.getElementById("yt_name").innerHTML = document.getElementById("options.counter.title").value
        }
        this.setValue = function () {
            document.getElementById("yt_subs").innerHTML = parseFloat(document.getElementById("options.counter.value").value)
            current = parseFloat(document.getElementById("options.counter.value").value)
        }
        this.setValue1 = function () {
            document.getElementById("yt_views").innerHTML = parseFloat(document.getElementById("options.counter.value1").value)
            current1 = parseFloat(document.getElementById("options.counter.value1").value)
        }
        this.setValue2 = function () {
            document.getElementById("yt_videos").innerHTML = parseFloat(document.getElementById("options.counter.value2").value)
            current2 = parseFloat(document.getElementById("options.counter.value2").value)
        }
        this.setFooter = function () {
            document.getElementById("footer").innerHTML = document.getElementById("options.counter.footer").value
        }
        this.setFooter1 = function () {
            document.getElementById("footer1").innerHTML = document.getElementById("options.counter.footer1").value
        }
        this.setFooter2 = function () {
            document.getElementById("footer2").innerHTML = document.getElementById("options.counter.footer2").value
        }
        var rate1 = 0;
        var rate2 = 0;
        var rate3 = 0;
        var rate4 = 0;
        var rate5 = 0;
        var rate6 = 0;
        var updatetime;
        var updatetime1;
        var updatetime2;
        this.setMin = function () {
            rate1 = document.getElementById("options.counter.rates.basicMinimum").value
        }
        this.setMax = function () {
            rate2 = document.getElementById("options.counter.rates.basicMaximum").value
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
        this.setRate1 = function () {
            clearInterval(updatetime1)
            var t = document.getElementById("options.counter.rates.mode.basic.baseUnit1").value
            var e = document.getElementById("options.counter.rates.mode.basic.units1").value
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
        this.setRate2 = function () {
            clearInterval(updatetime2)
            var t = document.getElementById("options.counter.rates.mode.basic.baseUnit2").value
            var e = document.getElementById("options.counter.rates.mode.basic.units2").value
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
        function updateManager() {
            var subs = parseFloat(current)
            var rate11 = 0;
            var rate22 = 0;
            if (document.getElementById('options.counter.rates.mode.basic.baseUnitt').value == "1") {
                rate11 = parseFloat(rate1)
                rate22 = parseFloat(rate2)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnitt').value == "60") {
                rate11 = parseFloat(rate1 / 60)
                rate22 = parseFloat(rate2 / 60)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnitt').value == "3600") {
                rate11 = parseFloat(rate1 / 3600)
                rate22 = parseFloat(rate2 / 3600)
            } else {
                rate11 = parseFloat(rate1 / 86400)
                rate22 = parseFloat(rate2 / 86400)
            }
            rate11 = parseFloat(rate11)
            rate22 = parseFloat(rate22)
            subs += random(rate11, rate22)
            if (subs == NaN) {
            } else {
                current = subs
            }
            document.getElementById("yt_subs").innerHTML = Math.floor(subs)

        }
        function updateManager1() {
            var subs = parseFloat(current1)
            var rate11 = 0;
            var rate22 = 0;
            if (document.getElementById('options.counter.rates.mode.basic.baseUnit11').value == "1") {
                rate11 = parseFloat(rate3)
                rate22 = parseFloat(rate4)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnit11').value == "60") {
                rate11 = parseFloat(rate3 / 60)
                rate22 = parseFloat(rate4 / 60)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnit11').value == "3600") {
                rate11 = parseFloat(rate3 / 3600)
                rate22 = parseFloat(rate4 / 3600)
            } else {
                rate11 = parseFloat(rate3 / 86400)
                rate22 = parseFloat(rate4 / 86400)
            }
            rate11 = parseFloat(rate11)
            rate22 = parseFloat(rate22)
            subs += random(rate11, rate22)
            if (subs == NaN) {
            } else {
                current1 = subs
            }
            document.getElementById("yt_views").innerHTML = Math.floor(subs)

        }
        function updateManager2() {
            var subs = parseFloat(current2)
            var rate11 = 0;
            var rate22 = 0;
            if (document.getElementById('options.counter.rates.mode.basic.baseUnit2').value == "1") {
                rate11 = parseFloat(rate5)
                rate22 = parseFloat(rate6)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnit2').value == "60") {
                rate11 = parseFloat(rate5 / 60)
                rate22 = parseFloat(rate6 / 60)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnit2').value == "3600") {
                rate11 = parseFloat(rate5 / 3600)
                rate22 = parseFloat(rate6 / 3600)
            } else {
                rate11 = parseFloat(rate5 / 86400)
                rate22 = parseFloat(rate6 / 86400)
            }
            rate11 = parseFloat(rate11)
            rate22 = parseFloat(rate22)
            subs += random(rate11, rate22)
            if (subs == NaN) {
            } else {
                current2 = subs
            }
            document.getElementById("yt_videos").innerHTML = Math.floor(subs)

        }
    }
}

const Interface = new LivecountseditInterface()
window.onload = function () {
    if (document.getElementById('tabs.0')) document.getElementById('tabs.0').click();
}
function submit() {
    Interface.setValue()
}
function submit1() {
    Interface.setValue1()
}
function submit2() {
    Interface.setValue2()
}
document.getElementById("options.counter.banner.file").addEventListener('input', Interface.setBanner)
document.getElementById("options.counter.avatar.file").addEventListener('input', Interface.setAvatar)
document.getElementById("options.counter.banner.url").addEventListener('input', Interface.setBanner)
document.getElementById("options.counter.avatar.url").addEventListener('input', Interface.setAvatar)
document.getElementById("options.counter.title").addEventListener('input', Interface.setTitle)
document.getElementById("options.counter.footer").addEventListener('input', Interface.setFooter)
document.getElementById("options.counter.footer1").addEventListener('input', Interface.setFooter1)
document.getElementById("options.counter.footer2").addEventListener('input', Interface.setFooter2)

document.getElementById("options.counter.rates.basicMinimum").addEventListener('input', Interface.setMin)
document.getElementById("options.counter.rates.basicMaximum").addEventListener('input', Interface.setMax)
document.getElementById("options.counter.rates.basicMinimum1").addEventListener('input', Interface.setMin1)
document.getElementById("options.counter.rates.basicMaximum1").addEventListener('input', Interface.setMax1)
document.getElementById("options.counter.rates.basicMinimum2").addEventListener('input', Interface.setMin2)
document.getElementById("options.counter.rates.basicMaximum2").addEventListener('input', Interface.setMax2)
document.getElementById("options.counter.rates.mode.basic.units").addEventListener('input', Interface.setRate)
document.getElementById("options.counter.rates.mode.basic.units1").addEventListener('input', Interface.setRate1)
document.getElementById("options.counter.rates.mode.basic.units2").addEventListener('input', Interface.setRate2)
document.getElementById("options.counter.rates.mode.basic.baseUnit").addEventListener('change', Interface.setRate)
document.getElementById("options.counter.rates.mode.basic.baseUnitt").addEventListener('change', Interface.setRate)
document.getElementById("options.counter.rates.mode.basic.baseUnit1").addEventListener('change', Interface.setRate1)
document.getElementById("options.counter.rates.mode.basic.baseUnit11").addEventListener('change', Interface.setRate1)
document.getElementById("options.counter.rates.mode.basic.baseUnit2").addEventListener('change', Interface.setRate2)
document.getElementById("options.counter.rates.mode.basic.baseUnit22").addEventListener('change', Interface.setRate2)
function random(min, max) {
    return Math.random() * (max - min) + min
}

function hidenav() {
    if (document.querySelector("#main-wrapper > aside").style.visibility == "hidden") {
        document.querySelector("#main-wrapper > aside").style.visibility = "visible"
    } else {
        document.querySelector("#main-wrapper > aside").style.visibility = "hidden"
    }
}