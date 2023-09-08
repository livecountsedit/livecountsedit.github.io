let cmm = 0;
let raw = 0;
let m = "100m";
let saveInterval;
let graphData = [];
let user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : {
	name: "",
	image: "",
	subscribers: 0,
	min_gain: 0,
	max_gain: 0,
	per_every: 0,
	per_every_type: "1",
	gain_rate: "1",
	graphType: "1",
	graphDates: [],
	graphValues: [],
	liveGraph: [],
	maxPoints: 100,
	dropdownTopText: "All Time",
	dropdownBottomText: "Live Data"
};

if (user.graphType == "1") {
	graphData = user.liveGraph
} else if (user.graphType == "2") {
	let chartData = []
	for (let i = 0; i < user.graphDates.length; i++) {
		chartData.push([user.graphDates[i], new Date(user.graphValues[i])])
	}
	graphData = chartData
}


function spl(n) {
	n = '' + n + ''
	return n.split('', 9)
}

const chart = new Highcharts.chart({
	chart: {
		renderTo: "chart",
		type: "line",
		zoomType: "x",
		backgroundColor: "transparent",
		plotBorderColor: "transparent",
		style: {
			fontFamily: "Roboto",
		},
		height: (9 / 16 * 30) + '%',
		spacingLeft: -10,
		spacingLeft: -10,
		marginRight: 65
	},
	title: {
		text: "",
	},
	xAxis: {
		type: "datetime",
		tickPixelInterval: 500,
		labels: {
			style: {
				color: "#AAAAAA",
			},
			formatter: function () {
				return Highcharts.dateFormat("%b %e, %Y", this.value);
			}
		},
		gridLineColor: "#9E9E9E",
		lineColor: "#9E9E9E",
		minorGridLineColor: "#858585",
		tickColor: "#858585",
		title: {
			style: {
				color: "#858585",
			},
		},
	},
	yAxis: {
		title: {
			text: "",
		},
		labels: {
			style: {
				color: "#AAAAAA",
				fontSize: "12px",
			},
			formatter: function () {
				return abb(this.value);
			},
		},
		gridLineColor: "#3D3D3D",
		lineColor: "#3D3D3D",
		minorGridLineColor: "#3D3D3D",
		tickColor: "#3D3D3D",
		opposite: true
	},
	credits: {
		enabled: false,
	},
	series: [
		{
			showInLegend: false,
			name: "Subscribers",
			marker: { enabled: false },
			color: "#3FABCD",
			lineColor: "#3FABCD",
			lineWidth: 2,
			data: graphData
		},
	],
});

function abb(count) {
	if (count === 0) return "0";
	const ABBREVIATIONS = ["", "K", "M", "B"];
	const isNegative = count < 0;
	const absCount = Math.abs(count);
	const index = absCount === 0 ? 0 : Math.floor(Math.log10(absCount) / 3);
	let result = (absCount / Math.pow(1000, index)).toFixed(2).toString();
	result += ABBREVIATIONS[index];
	if (isNegative) {
		result = `-${result}`;
	}
	const parts = result.split(".");
	if (parts[1] && parts[1].length > 1) {
		result = parts[0] + "." + parts[1][0];
		result += ABBREVIATIONS[index];
		if (isNegative) {
			result = `-${result}`;
		}
	}
	return result;
}

function settype(n) {
	if (n < 1000000000) {
		m = '100m'
		document.querySelector("#odo1a").style.display = "inline-block"
		document.querySelector("#odo2a").style.display = "inline-block"
		document.querySelector("#odo3a").style.display = "inline-block"
		document.querySelector("#odo4a").style.display = "inline-block"
		document.querySelector("#odo5a").style.display = "inline-block"
		document.querySelector("#odo6a").style.display = "inline-block"
		document.querySelector("#odo7a").style.display = "inline-block"
		document.querySelector("#odo8a").style.display = "inline-block"
		document.querySelector("#odo9a").style.display = "inline-block"
		document.querySelector("#comma1a").style.display = "inline-block"
		document.querySelector("#comma2a").style.display = "inline-block"
	}
	if (n < 100000000) {
		m = '10m'
		document.querySelector("#odo1a").style.display = "none"
		document.querySelector("#odo2a").style.display = "inline-block"
		document.querySelector("#odo3a").style.display = "inline-block"
		document.querySelector("#odo4a").style.display = "inline-block"
		document.querySelector("#odo5a").style.display = "inline-block"
		document.querySelector("#odo6a").style.display = "inline-block"
		document.querySelector("#odo7a").style.display = "inline-block"
		document.querySelector("#odo8a").style.display = "inline-block"
		document.querySelector("#odo9a").style.display = "inline-block"
		document.querySelector("#comma1a").style.display = "inline-block"
		document.querySelector("#comma2a").style.display = "inline-block"
	}
	if (n < 10000000) {
		m = '1m'
		document.querySelector("#odo1a").style.display = "none"
		document.querySelector("#odo2a").style.display = "none"
		document.querySelector("#odo3a").style.display = "inline-block"
		document.querySelector("#odo4a").style.display = "inline-block"
		document.querySelector("#odo5a").style.display = "inline-block"
		document.querySelector("#odo6a").style.display = "inline-block"
		document.querySelector("#odo7a").style.display = "inline-block"
		document.querySelector("#odo8a").style.display = "inline-block"
		document.querySelector("#odo9a").style.display = "inline-block"
		document.querySelector("#comma1a").style.display = "inline-block"
		document.querySelector("#comma2a").style.display = "inline-block"
	}
	if (n < 1000000) {
		m = '100k'
		document.querySelector("#odo1a").style.display = "none"
		document.querySelector("#odo2a").style.display = "none"
		document.querySelector("#odo3a").style.display = "none"
		document.querySelector("#odo4a").style.display = "inline-block"
		document.querySelector("#odo5a").style.display = "inline-block"
		document.querySelector("#odo6a").style.display = "inline-block"
		document.querySelector("#odo7a").style.display = "inline-block"
		document.querySelector("#odo8a").style.display = "inline-block"
		document.querySelector("#odo9a").style.display = "inline-block"
		document.querySelector("#comma1a").style.display = "none"
		document.querySelector("#comma2a").style.display = "inline-block"
	}
	if (n < 100000) {
		m = '10k'
		document.querySelector("#odo1a").style.display = "none"
		document.querySelector("#odo2a").style.display = "none"
		document.querySelector("#odo3a").style.display = "none"
		document.querySelector("#odo4a").style.display = "none"
		document.querySelector("#odo5a").style.display = "inline-block"
		document.querySelector("#odo6a").style.display = "inline-block"
		document.querySelector("#odo7a").style.display = "inline-block"
		document.querySelector("#odo8a").style.display = "inline-block"
		document.querySelector("#odo9a").style.display = "inline-block"
		document.querySelector("#comma1a").style.display = "none"
		document.querySelector("#comma2a").style.display = "inline-block"
	}
	if (n < 10000) {
		m = '1k'
		document.querySelector("#odo1a").style.display = "none"
		document.querySelector("#odo2a").style.display = "none"
		document.querySelector("#odo3a").style.display = "none"
		document.querySelector("#odo4a").style.display = "none"
		document.querySelector("#odo5a").style.display = "none"
		document.querySelector("#odo6a").style.display = "inline-block"
		document.querySelector("#odo7a").style.display = "inline-block"
		document.querySelector("#odo8a").style.display = "inline-block"
		document.querySelector("#odo9a").style.display = "inline-block"
		document.querySelector("#comma1a").style.display = "none"
		document.querySelector("#comma2a").style.display = "inline-block"
	}
	if (n < 1000) {
		m = '100'
		document.querySelector("#odo1a").style.display = "none"
		document.querySelector("#odo2a").style.display = "none"
		document.querySelector("#odo3a").style.display = "none"
		document.querySelector("#odo4a").style.display = "none"
		document.querySelector("#odo5a").style.display = "none"
		document.querySelector("#odo6a").style.display = "none"
		document.querySelector("#odo7a").style.display = "inline-block"
		document.querySelector("#odo8a").style.display = "inline-block"
		document.querySelector("#odo9a").style.display = "inline-block"
		document.querySelector("#comma1a").style.display = "none"
		document.querySelector("#comma2a").style.display = "none"
	}
	if (n < 100) {
		m = '10'
		document.querySelector("#odo1a").style.display = "none"
		document.querySelector("#odo2a").style.display = "none"
		document.querySelector("#odo3a").style.display = "none"
		document.querySelector("#odo4a").style.display = "none"
		document.querySelector("#odo5a").style.display = "none"
		document.querySelector("#odo6a").style.display = "none"
		document.querySelector("#odo7a").style.display = "none"
		document.querySelector("#odo8a").style.display = "inline-block"
		document.querySelector("#odo9a").style.display = "inline-block"
		document.querySelector("#comma1a").style.display = "none"
		document.querySelector("#comma2a").style.display = "none"
	}
	if (n < 10) {
		m = '1'
		document.querySelector("#odo1a").style.display = "none"
		document.querySelector("#odo2a").style.display = "none"
		document.querySelector("#odo3a").style.display = "none"
		document.querySelector("#odo4a").style.display = "none"
		document.querySelector("#odo5a").style.display = "none"
		document.querySelector("#odo6a").style.display = "none"
		document.querySelector("#odo7a").style.display = "none"
		document.querySelector("#odo8a").style.display = "none"
		document.querySelector("#odo9a").style.display = "inline-block"
		document.querySelector("#comma1a").style.display = "none"
		document.querySelector("#comma2a").style.display = "none"
	}
	return m
}

function render() {
	settype(raw)
	if (m == '100m') {
		odo1a.innerHTML = cmm[0]
		odo2a.innerHTML = cmm[1]
		odo3a.innerHTML = cmm[2]
		odo4a.innerHTML = cmm[3]
		odo5a.innerHTML = cmm[4]
		odo6a.innerHTML = cmm[5]
		odo7a.innerHTML = cmm[6]
		odo8a.innerHTML = cmm[7]
		odo9a.innerHTML = cmm[8]
	}
	if (m == '10m') {
		odo2a.innerHTML = cmm[0]
		odo3a.innerHTML = cmm[1]
		odo4a.innerHTML = cmm[2]
		odo5a.innerHTML = cmm[3]
		odo6a.innerHTML = cmm[4]
		odo7a.innerHTML = cmm[5]
		odo8a.innerHTML = cmm[6]
		odo9a.innerHTML = cmm[7]
	}
	if (m == '1m') {
		odo3a.innerHTML = cmm[0]
		odo4a.innerHTML = cmm[1]
		odo5a.innerHTML = cmm[2]
		odo6a.innerHTML = cmm[3]
		odo7a.innerHTML = cmm[4]
		odo8a.innerHTML = cmm[5]
		odo9a.innerHTML = cmm[6]
	}
	if (m == '100k') {
		odo4a.innerHTML = cmm[0]
		odo5a.innerHTML = cmm[1]
		odo6a.innerHTML = cmm[2]
		odo7a.innerHTML = cmm[3]
		odo8a.innerHTML = cmm[4]
		odo9a.innerHTML = cmm[5]
	}
	if (m == '10k') {
		odo5a.innerHTML = cmm[0]
		odo6a.innerHTML = cmm[1]
		odo7a.innerHTML = cmm[2]
		odo8a.innerHTML = cmm[3]
		odo9a.innerHTML = cmm[4]
	}
	if (m == '1k') {
		odo6a.innerHTML = cmm[0]
		odo7a.innerHTML = cmm[1]
		odo8a.innerHTML = cmm[2]
		odo9a.innerHTML = cmm[3]
	}
	if (m == '100') {
		odo7a.innerHTML = cmm[0]
		odo8a.innerHTML = cmm[1]
		odo9a.innerHTML = cmm[2]
	}
	if (m == '10') {
		odo8a.innerHTML = cmm[0]
		odo9a.innerHTML = cmm[1]
	}
	if (m == '1') {
		odo9a.innerHTML = cmm[0]
	}
}

function openmenu() {
	if (document.getElementById('settingsMenu').style.visibility == "visible") {
		document.getElementById('settingsMenu').style.visibility = "hidden"
	} else {
		document.getElementById('settingsMenu').style.visibility = "visible"
	}
}

document.getElementById('close').onclick = function () {
	document.getElementById('settingsMenu').style.visibility = "hidden"
}

function submit() {
	if (document.getElementById('enabled').checked) {
		if (!(document.getElementById('subscribers_input').value == "")) {
			user.subscribers = parseFloat(document.getElementById('subscribers_input').value)
			cmm = spl(user.subscribers)
			raw = user.subscribers
			render()
		}
	}
	if (document.getElementById("file_input").files[0]) {
		let file = document.getElementById("file_input").files[0]
		let reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = function () {
			user.image = reader.result
		};
		document.getElementById('image').src = user.image
	} else {
		user.image = document.getElementById("image_input").value
		document.getElementById('image').src = user.image
	}
	user.name = document.getElementById('name_input').value
	document.getElementById('name').innerHTML = user.name
}

let interval;

function update() {
	let gain = random(user.min_gain, user.max_gain)
	user.subscribers += gain
	cmm = spl(user.subscribers)
	raw = user.subscribers
	render()
	if (user.graphType == "1") {
		if (chart.series[0].data.length > user.maxPoints) {
			chart.series[0].data[0].remove()
			user.liveGraph.shift()
		}
		chart.series[0].addPoint([new Date().getTime(), user.subscribers], true, true);
		user.liveGraph.push([new Date().getTime(), user.subscribers])
	}
}

function submit1() {
	let gainIn = document.getElementById('gain_rate_in').value
	if (gainIn == "1") {
		user.min_gain = parseFloat(document.getElementById('min_subs').value)
	} else if (gainIn == "60") {
		user.min_gain = parseFloat(document.getElementById('min_subs').value) / 60
	} else if (gainIn == "3600") {
		user.min_gain = parseFloat(document.getElementById('min_subs').value) / 3600
	} else if (gainIn == "86400") {
		user.min_gain = parseFloat(document.getElementById('min_subs').value) / 86400
	}
	if (gainIn == "1") {
		user.max_gain = parseFloat(document.getElementById('max_subs').value)
	} else if (gainIn == "60") {
		user.max_gain = parseFloat(document.getElementById('max_subs').value) / 60
	} else if (gainIn == "3600") {
		user.max_gain = parseFloat(document.getElementById('max_subs').value) / 3600
	} else if (gainIn == "86400") {
		user.max_gain = parseFloat(document.getElementById('max_subs').value) / 86400
	}
	user.gain_rate = document.getElementById('gain_rate_in').value
	clearInterval(interval)
	let time = document.getElementById('gain_every').value
	user.per_every_type = document.getElementById('gain_rate').value
	if (document.getElementById('gain_rate').value == "1") {
		user.per_every = time
	} else if (document.getElementById('gain_rate').value == "60") {
		user.per_every = time * 60
	} else if (document.getElementById('gain_rate').value == "3600") {
		user.per_every = time * 3600
	} else if (document.getElementById('gain_rate').value == "86400") {
		user.per_every = time * 86400
	}
	interval = setInterval(update, user.per_every * 1000)
}

function submit2() {
	if (document.getElementById('graph_type').value == "1") {
		user.graphType = "1"
	} else if (document.getElementById('graph_type').value == "2") {
		user.graphType = "2"
		let dates = document.getElementById('graph_dates').value
		let values = document.getElementById('graph_values').value
		user.graphDates = dates.split(',')
		user.graphValues = values.split(',')
		let graphDates = []
		for (let i = 0; i < user.graphDates.length; i++) {
			user.graphDates[i] = user.graphDates[i]
			graphData[i] = new Date(user.graphDates[i]).getTime()
		}
		for (let i = 0; i < user.graphValues.length; i++) {
			user.graphValues[i] = parseFloat(user.graphValues[i]);
		}
		let chartData = []
		for (let i = 0; i < user.graphDates.length; i++) {
			chartData.push([graphDates[i], user.graphValues[i]])
		}
		console.log(chartData)
		chart.series[0].setData(chartData)
	}
	user.dropdownTopText = document.getElementById('dropdownTopText').value
	user.dropdownBottomText = document.getElementById('dropdownBottomText').value
	document.getElementById('dropdown-label1').innerHTML = user.dropdownTopText
	document.getElementById('dropdown-label2').innerHTML = user.dropdownBottomText
	user.maxPoints = (document.getElementById('maxPoints').value != "") ? parseFloat(document.getElementById('maxPoints').value) : 100
}

function random(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function saveData() {
	localStorage.setItem("user", JSON.stringify(user))
	alert("Saved!")
}

function exportData() {
	let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user));
	let dlAnchorElem = document.createElement("a");
	dlAnchorElem.setAttribute("href", dataStr);
	dlAnchorElem.setAttribute("download", "data.json");
	dlAnchorElem.click();
}

function clearChart() {
	chart.series[0].setData([])
}

function importData() {
	let file = document.getElementById('file_input2').files[0]
	if (file) {
		let reader = new FileReader();
		reader.readAsText(file, "UTF-8");
		reader.onload = function (evt) {
			user = JSON.parse(evt.target.result)
			localStorage.setItem("user", JSON.stringify(user))
			location.reload()
		}
		reader.onerror = function (evt) {
			alert("error reading file");
		}
	} else {
		alert("Please select a file")
	}
}

if (localStorage.getItem("user")) {
	document.getElementById('subscribers_input').value = user.subscribers
	document.getElementById('name_input').value = user.name
	document.getElementById('image_input').value = user.image
	document.getElementById('image').src = user.image
	document.getElementById('min_subs').value = user.min_gain
	document.getElementById('max_subs').value = user.max_gain
	document.getElementById('gain_rate_in').value = user.gain_rate
	document.getElementById('gain_every').value = user.per_every
	document.getElementById('gain_rate').value = user.per_every_type
	document.getElementById('graph_type').value = user.graphType
	document.getElementById('graph_dates').innerHTML = user.graphDates
	document.getElementById('graph_values').innerHTML = user.graphValues
	document.getElementById('dropdownTopText').value = user.dropdownTopText
	document.getElementById('dropdownBottomText').value = user.dropdownBottomText
	document.getElementById('maxPoints').value = user.maxPoints
	submit()
	submit1()
	submit2()
} else {
	render()
}

document.getElementById('autosave').onclick = function () {
	if (document.getElementById('autosave').checked) {
		saveInterval = setInterval(function () {
			localStorage.setItem("user", JSON.stringify(user))
		}, 1000)
	} else {
		clearInterval(saveInterval)
	}
}

function resetData() {
	if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
		localStorage.clear()
		location.reload()
	}
}