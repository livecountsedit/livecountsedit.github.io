var current = 0;
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
            this.rickroll = function () {
                window.location.replace('https://youtu.be/dQw4w9WgXcQ')
            },

            this.setBanner = function () {
                if (!document.getElementById("options.counter.banner.file").files.length) {
                    if (!document.getElementById("options.counter.banner.url").value) return;
                    else document.getElementById("yt_cover_vs1").src = document.getElementById("options.counter.banner.url").value
                } else {
                    document.getElementById("yt_cover_vs1").src = URL.createObjectURL(document.getElementById("options.counter.banner.file").files[0])
                }
            },
            this.setAvatar = function () {
                if (!document.getElementById("options.counter.avatar.file").files.length) {
                    if (!document.getElementById("options.counter.avatar.url").value) return;
                    else document.getElementById("yt_profile_vs1").src = document.getElementById("options.counter.avatar.url").value
                } else {
                    document.getElementById("yt_profile_vs1").src = URL.createObjectURL(document.getElementById("options.counter.avatar.file").files[0])
                }
            }
        this.setTitle = function () {
            document.getElementById("yt_name_vs1").innerHTML = document.getElementById("options.counter.title").value
            document.getElementById("yt_brand_vs1").innerHTML = document.getElementById("options.counter.title").value
            document.getElementById("tweet1").innerHTML = document.getElementById("options.counter.title").value
        }
        this.setValue = function () {
            document.getElementById("yt_subs_vs1").innerHTML = parseFloat(document.getElementById("options.counter.value").value)
            current = parseFloat(document.getElementById("options.counter.value").value)
        }
        this.setFooter = function () {
            document.getElementById("count_name_1").innerHTML = document.getElementById("options.counter.footer").value
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
            document.getElementById("yt_subs_vs1").innerHTML = Math.floor(subs)
        }



//2sssssss

        this.setBanner2 = function () {
                if (!document.getElementById("options.counter.banner.file2").files.length) {
                    if (!document.getElementById("options.counter.banner.url2").value) return;
                    else document.getElementById("yt_cover_vs2").src = document.getElementById("options.counter.banner.url2").value
                } else {
                    document.getElementById("yt_cover_vs2").src = URL.createObjectURL(document.getElementById("options.counter.banner.file2").files[0])
                }
            },
            this.setAvatar2 = function () {
                if (!document.getElementById("options.counter.avatar.file").files.length) {
                    if (!document.getElementById("options.counter.avatar.url").value) return;
                    else document.getElementById("yt_profile_vs2").src = document.getElementById("options.counter.avatar.url2").value
                } else {
                    document.getElementById("yt_profile_vs2").src = URL.createObjectURL(document.getElementById("options.counter.avatar.file2").files[0])
                }
            }
        this.setTitle2 = function () {
            document.getElementById("yt_name_vs2").innerHTML = document.getElementById("options.counter.title2").value
            document.getElementById("yt_brand_vs2").innerHTML = document.getElementById("options.counter.title2").value
            document.getElementById("tweet2").innerHTML = document.getElementById("options.counter.title2").value
        }
        this.setValue2 = function () {
            document.getElementById("yt_subs_vs2").innerHTML = parseFloat(document.getElementById("options.counter.value2").value)
            current2 = parseFloat(document.getElementById("options.counter.value2").value)
        }
        this.setFooter2 = function () {
            document.getElementById("count_name_2").innerHTML = document.getElementById("options.counter.footer2").value
        }
        var rate12 = 0;
        var rate22 = 0;
        var updatetime2;
        this.setMin2 = function () {
            rate12 = document.getElementById("options.counter.rates.basicMinimum2").value
        }
        this.setMax2 = function () {
            rate22 = document.getElementById("options.counter.rates.basicMaximum2").value
        }
        this.setRate2 = function () {
            clearInterval(updatetime2)
            var t = document.getElementById("options.counter.rates.mode.basic.baseUnit3").value
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
        function updateManager2() {
            var subs = parseFloat(current2)
            var rate3 = 0;
            var rate4 = 0;
            if (document.getElementById('options.counter.rates.mode.basic.baseUnit4').value == "1") {
                rate3 = parseFloat(rate12)
                rate4 = parseFloat(rate22)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnit4').value == "60") {
                rate3 = parseFloat(rate12 / 60)
                rate4 = parseFloat(rate22 / 60)
            } else if (document.getElementById('options.counter.rates.mode.basic.baseUnit4').value == "3600") {
                rate3 = parseFloat(rate12 / 3600)
                rate4 = parseFloat(rate22 / 3600)
            } else {
                rate3 = parseFloat(rate12 / 86400)
                rate4 = parseFloat(rate22 / 86400)
            }
            rate3 = parseFloat(rate3)
            rate4 = parseFloat(rate4)
            subs += random(rate3, rate4)
            if (subs == NaN) {
            } else {
                current2 = subs
            }
            document.getElementById("yt_subs_vs2").innerHTML = Math.floor(subs)
        }

        this.gaptitle = function () {
            document.getElementById("yt_diff_name").innerHTML = document.getElementById("gap.title").value
        }
        var gaptime = setInterval(gap,2000)
        this.gaptime = function () {
            clearInterval(gaptime)
            var t = document.getElementById("gap.time").value*1000
            gaptime = setInterval(gap,t)
        }
    }
}


function gap() {
document.getElementById("yt_diff").innerHTML = Math.floor(current-current2)
}

const Interface = new LivecountseditInterface()
window.onload = function () {
    if (document.getElementById('tabs.0')) document.getElementById('tabs.0').click();
}
function submit() {
    Interface.setValue()
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
document.getElementById("options.counter.rates.basicMinimum").addEventListener('input', Interface.setMin)
document.getElementById("options.counter.rates.basicMaximum").addEventListener('input', Interface.setMax)
document.getElementById("options.counter.rates.mode.basic.units").addEventListener('input', Interface.setRate)
document.getElementById("options.counter.rates.mode.basic.baseUnit").addEventListener('change', Interface.setRate)
document.getElementById("options.counter.rates.mode.basic.baseUnit2").addEventListener('change', Interface.setRate)

document.getElementById("options.counter.banner.file2").addEventListener('input', Interface.setBanner2)
document.getElementById("options.counter.avatar.file2").addEventListener('input', Interface.setAvatar2)
document.getElementById("options.counter.banner.url2").addEventListener('input', Interface.setBanner2)
document.getElementById("options.counter.avatar.url2").addEventListener('input', Interface.setAvatar2)
document.getElementById("options.counter.title2").addEventListener('input', Interface.setTitle2)
document.getElementById("options.counter.footer2").addEventListener('input', Interface.setFooter2)
document.getElementById("options.counter.rates.basicMinimum2").addEventListener('input', Interface.setMin2)
document.getElementById("options.counter.rates.basicMaximum2").addEventListener('input', Interface.setMax2)
document.getElementById("options.counter.rates.mode.basic.units2").addEventListener('input', Interface.setRate2)
document.getElementById("options.counter.rates.mode.basic.baseUnit3").addEventListener('change', Interface.setRate2)
document.getElementById("options.counter.rates.mode.basic.baseUnit4").addEventListener('change', Interface.setRate2)

document.getElementById("gap.title").addEventListener('change', Interface.gaptitle)
document.getElementById("gap.time").addEventListener('change', Interface.gaptime)

function random(min, max) {
    return Math.random() * (max - min) + min
}