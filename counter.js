var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})

const LCEDIT = {
    saveVersion: 1,
    versionName: "7.0",
    util: {
        clamp: (input, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) => {
            if (isNaN(input)) input = 0;
            if (input < min) return min;
            if (input > max) return max;
            return input;
        },
        abb: (n) => {
            let s = Math.sign(n);
            n = Math.abs(n);
            if (n < 1) return 0;
            else return s * Math.floor(n / (10 ** (Math.floor(Math.log10(n)) - 2))) * (10 ** (Math.floor(Math.log10(n)) - 2));
        },
        random: (min = 0, max = 1) => {
            return (parseFloat(min) + Math.random() * (parseFloat(max) - parseFloat(min))) || 0;
        },
        randomGaussian: (mean, stdev) => {
            let a = 0, b = 0;
            while (!a) a = Math.random();
            while (!b) b = Math.random();
            return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b) * parseFloat(stdev) + parseFloat(mean);
        },
        randomFromCustomDistribution: (data) => {
            if (typeof data != 'object' || !data.entries || !data.entries.length || !data.totalWeight || data.totalWeight < 0) return 0;
            const a = Math.random() * data.totalWeight;
            let i = 0;
            while (a > data.entries[i]?.cutoff && data.entries[i]) {
                i++;
            }
            return LCEDIT.util.random(data.entries[i].min, data.entries[i].max);
        },
        createCustomDistribution: (data) => {
            const result = {
                totalWeight: 0,
                entries: []
            };
            let totalWeight = 0;
            const rows = data.split('\n')
            for (i = 0; i < rows.length; i++) {
                const rowData = rows[i].replace(/ +/g, '').split(',')
                totalWeight += parseFloat(rowData[2]) || 0;
                const entry = {
                    min: parseFloat(rowData[0]) || 0,
                    max: parseFloat(rowData[1]) || 0,
                    cutoff: totalWeight
                };
                result.entries.push(entry);
                result.totalWeight = totalWeight;
            }
            return result;
        },
        removeClass: (el, name) => {
            return el.className = el.className.replace(new RegExp("(^| )" + (name.split(' ').join('|')) + "( |$)", 'gi'), ' ');
        },
        addClass: (el, name) => {
            LCEDIT.util.removeClass(el, name);
            return el.className += " " + name;
        },
        fillForms: (forms, formData) => {
            for (i = 0; i < forms.length; i++) {
                forms[i].reset();
                const inputs = forms[i].querySelectorAll('input,select');
                for (j = 0; j < inputs.length; j++) {
                    const v = formData[inputs[j].id];
                    if (v == undefined) continue;
                    if (typeof v === 'boolean') inputs[j].checked = v;
                    else inputs[j].value = v;
                }
                const textareas = forms[i].querySelectorAll('textarea');
                for (j = 0; j < textareas.length; j++) {
                    const v = formData[textareas[j].id];
                    if (v != undefined) textareas[j].innerText = v;
                }
            }
        },
        cleanFormValue: (v, type) => {
            if (type === 'number') v = parseFloat(v) || 0;
            if (type === 'boolean') {
                if (v === 'true') v = true
                else v = false
            }
            if (type === 'object' || type === 'function') throw new Error('Cannot set this form value');
            return v;
        },
        cleanFormData: formData => {
            result = {};
            const k = Object.keys(formData);
            for (i = 0; i < k.length; i++) {
                result[k[i]] = LCEDIT.util.cleanFormValue(formData[k[i]], typeof defaultCounter[k[i]]);
            }
            return result;
        },
        submitForms: (forms) => {
            const results = {
                success: true,
                problematicForm: null,
                data: {},
                files: 0
            }
            for (j = 0; j < forms.length; j++) {
                if (forms[j].checkValidity()) {
                    const fData = new FormData(forms[j]);
                    const checkboxes = forms[j].querySelectorAll("input[type=checkbox]");
                    for (k = 0; k < checkboxes.length; k++) {
                        fData.append(checkboxes[k].getAttribute('name'), checkboxes[k].checked)
                    }
                    const newData = LCEDIT.util.cleanFormData(Object.fromEntries(fData.entries()));
                    results.data = Object.assign(results.data, newData)
                } else {
                    results.success = false;
                    results.problematicForm = forms[j];
                }
            }

            if (results.data.imageFile?.size) {
                results.files++
                const reader = new FileReader();
                reader.readAsDataURL(results.data.imageFile);
                reader.onload = () => {
                    results.data.imageURL = reader.result
                    dispatchEvent(new Event('fileReady'))
                }
            }

            if (results.data.bannerFile?.size) {
                results.files++
                const reader = new FileReader();
                reader.readAsDataURL(results.data.bannerFile);
                reader.onload = () => {
                    results.data.bannerURL = reader.result
                    dispatchEvent(new Event('fileReady'))
                }
            }
            return results;
        },
        setVisible: (el, visible, display = 'block') => {
            if (visible) {
                el.style.display = display;
            } else {
                el.style.display = 'none';
            }
        }
    }
}

let defaultCounter = {
    abb: false,
    animationDuration: 2,
    animationType: 0,
    bannerBlur: 4,
    bannerURL: "",
    bgColor: "#000000",
    chartColor: "#ff0000",
    count: 0,
    counterColor: "#000000",
    customRate: "",
    downColor: "#000000",
    footer: "",
    footerColor: "#000000",
    keepChartData: false,
    max: Number.MAX_SAFE_INTEGER,
    maxChartValues: 450,
    maxRate: 0,
    meanRate: 0,
    min: 0,
    minRate: 0,
    gainPer: 2,
    gainType: 0,
    imageURL: "",
    showBanner: false,
    showChart: false,
    showFooter: false,
    showImage: true,
    stdevRate: 0,
    title: "User",
    titleColor: "#000000",
    upColor: "#000000",
    updateProbability: 100,
    updateInterval: 2
}

class Counter {
    constructor(id, settings) {
        this.id = id;
        this.settings = settings || { ...defaultCounter }
        this.gain = 0;
        this.chartData = [];
        this.updateSettings = s => {
            if (!s) return;
            let k = Object.keys(s);
            for (i = 0; i < k.length; i++) {
                let v = s[k[i]];
                if (typeof v !== typeof this.settings[k[i]]) continue;
                if (typeof v === 'number' && !isFinite(v)) v = 0;
                this.settings[k[i]] = v;
            }
            this.setCount(this.settings.count);
        }
        this.update = () => {
            if (!(Math.random() * 100 < this.settings.updateProbability)) return;
            this.settings.gainPer = LCEDIT.util.clamp(this.settings.gainPer, 0.001);
            if (isNaN(this.settings.count)) this.settings.count = 0;
            const multiplier = (this.settings.updateInterval / this.settings.gainPer) * 100 / this.settings.updateProbability;
            switch (this.settings.gainType) {
                case 0:
                    this.gain = LCEDIT.util.random(this.settings.minRate, this.settings.maxRate) * multiplier;
                    break;
                case 1:
                    this.gain = LCEDIT.util.randomGaussian(this.settings.meanRate, this.settings.stdevRate) * multiplier;
                    break;
                case 2:
                    const d = LCEDIT.util.createCustomDistribution(this.settings.customRate);
                    this.gain = LCEDIT.util.randomFromCustomDistribution(d) * multiplier;
                    break;
                default:
                    this.gain = 0;
            }
            this.setCount(this.settings.count + this.gain)
        }
        this.setCount = (x) => {
            this.settings.count = LCEDIT.util.clamp(x, this.settings.min, this.settings.max)
        }
        this.getApparentCount = () => {
            if (this.settings.abb) {
                return LCEDIT.util.abb(this.settings.count);
            } else {
                return Math.round(this.settings.count) || 0;
            }
        }
        this.fromJSON = s => {
            if (s.id) this.id = s.id;
            if (s.settings) this.updateSettings(s.settings)
            if (s.chartData) {
                if (s.settings.keepChartData) {
                    this.chartData = s.chartData;
                }
            }
            return this;
        }
    }
}

window.odometerOptions = {
    auto: false
}

function version() {
    alert(`The code is currently on version ${LCEDIT.versionName}. If this does not match the version in the footer of this page, try the steps on the page linked with 'Not working?' or report an issue in the Livecountsedit Discord.`)
}