var current = 0;
class LivecountseditInterface {
    constructor () {
        this.suffixValues = {
            'k': 1e3,
            'm': 1e6,
            'b': 1e9,
            't': 1e12,
            'q': 1e15,
        },
        this.openTab = function (e,f) {
            var a,b,c;
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
     if (e == "") {}
     else {
     if (t == "1") {
         e = e*1000
       updatetime = setInterval(updateManager,e)
     } else if (t == "60") {
        e = e*60000
        updatetime = setInterval(updateManager,e)
     } else if (t == "3600") {
        e = e*3.6e+6
        updatetime = setInterval(updateManager,e)
     } else if (t == "86400") {
        e = e*8.64e+7
        updatetime = setInterval(updateManager,e)
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
        rate3 = parseFloat(rate1/60)
        rate4 = parseFloat(rate2/60)
    } else if (document.getElementById('options.counter.rates.mode.basic.baseUnit2').value == "3600") {
        rate3 = parseFloat(rate1/3600)
        rate4 = parseFloat(rate2/3600)
    } else {
        rate3 = parseFloat(rate1/86400)
        rate4 = parseFloat(rate2/86400)
    }
    rate3 = parseFloat(rate3)
    rate4 = parseFloat(rate4)
    subs += random(rate3, rate4)
    if (subs == NaN) {
    } else { 
        current = subs
    }
    document.getElementById("yt_subs").innerHTML = Math.floor(subs)

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