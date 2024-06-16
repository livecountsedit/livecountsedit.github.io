window.odometerOptions = {
	animation: "byDigit",
	removeLeadingZeros: true
}

let cmm = 0;
let raw = 0;
let m = "100b";
let saveInterval;
let graphData = [];
const uuidGen = function () {
	let a = function () {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	};
	return a() + a() + '-' + a() + '-' + a() + '-' + a() + '-' + a() + a() + a();
}

const selectElement = document.getElementById('selectcomma');
const comma1Element = document.getElementById('comma1a');
const comma2Element = document.getElementById('comma2a');
const comma3Element = document.getElementById('comma3a');

let user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : {
	name: "Loading",
	image: "../default.png",
	footer: "Subscribers",
	count: 0,
	min_gain: 0,
	max_gain: 0,
	updateInterval: 2000,
	graphType: "live",
	graphDates: [],
	graphValues: [],
	liveGraph: [],
	maxPoints: 100,
	dropdownTopText: "All Time",
	dropdownBottomText: "Live Data",
	id: uuidGen(),
	autosave: true,
	//unsed by studio
	banner: "",
	textColor: "#000",
	odometerUp: "#000",
	odometerDown: "#000",
	odometerSpeed: 2,
	graphColor: "#000",
	boxColor: "#000",
	bgColor: "#1a1a20",
	mean_gain: 0,
	std_gain: 0,
	abbreviate: false,
};
if (!user.count) {
	user.count = user.subscribers;
}

function render() {
	document.querySelector('.odometer').innerText = Math.round(user.count);
}

if (user.graphType == "live") {
	graphData = user.liveGraph
} else if (user.graphType == "set") {
	let chartData = []
	for (let i = 0; i < user.graphDates.length; i++) {
		chartData.push([new Date(user.graphDates[i]).getTime(), user.graphValues[i]])
	}
	graphData = chartData
}

function spl(n) {
	n = '' + n + ''
	return n.split('', 12)
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
			let prevCount = user.count
			user.count = parseFloat(document.getElementById('subscribers_input').value)
			cmm = spl(user.count)
			raw = user.count
			gain = user.count - prevCount
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
	user.footer = document.getElementById('footer_input').value
	document.getElementById('footer').innerHTML = user.footer
}

let interval;

function update() {
	gain = random(user.min_gain, user.max_gain)
	user.count += gain
	cmm = spl(user.count)
	raw = user.count
	if (user.graphType == "live") {
		if (chart.series[0].data.length > user.maxPoints) {
			chart.series[0].data[0].remove()
			user.liveGraph.shift()
		}
		chart.series[0].addPoint([new Date().getTime(), user.count])
		user.liveGraph.push([new Date().getTime(), user.count])
	}
	render()
}

function submit1() {
	user.updateInterval = document.getElementById('updateInterval').value * 1000
	user.min_gain = parseFloat(document.getElementById('min_subs').value)
	user.max_gain = parseFloat(document.getElementById('max_subs').value)
	clearInterval(interval)
	interval = setInterval(update, user.updateInterval)
}

function submit2() {
	if (document.getElementById('graph_type').value == "live") {
		user.graphType = "live"
	} else if (document.getElementById('graph_type').value == "set") {
		user.graphType = "set"
		let dates = document.getElementById('graph_dates').value
		let values = document.getElementById('graph_values').value
		user.graphDates = dates.split(',')
		user.graphValues = values.split(',')
		let graphDates = []
		for (let i = 0; i < user.graphDates.length; i++) {
			user.graphDates[i] = user.graphDates[i]
			graphDates[i] = new Date(user.graphDates[i]).getTime()
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

function toggleTheme() {
	const stylesheet = document.getElementById("themeStylesheet");
	if (stylesheet.getAttribute("href") === "./dark.css") {
		stylesheet.setAttribute("href", "./light.css");
	} else {
		stylesheet.setAttribute("href", "./dark.css");
	}
}

function clearChart() {
	chart.series[0].setData([]);
}

document.getElementById('file_input2').addEventListener('change', function (e) {
	importData();
});

let importedChannels = [];
function importData() {
	let file = document.getElementById('file_input2').files[0]
	if (file) {
		let reader = new FileReader();
		reader.readAsText(file, "UTF-8");
		reader.onload = function (evt) {
			let res = JSON.parse(evt.target.result)
			if (res.data) {
				importedChannels = res;
				pickChannel(res);
				return;
			} else {
				user = res;
			}
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

function pickChannel(channels) {
	document.getElementById('settingsMenu').innerHTML = "";
	for (let q = 0; q < channels.data.length; q++) {
		let channel = channels.data[q];
		document.getElementById('settingsMenu').innerHTML += `
		<div>
		<img src="${channel.image}">
		<h1>${channel.name}</h1>
		<h2>${channel.count.toLocaleString()}</h2>
		<p>${channel.id}</p>
		<button onclick="selectThing('${channel.id}')">Select</button>
		<hr>
		</div><br>`
	}
	document.body.appendChild(div);
}

function selectThing(id) {
	for (let q = 0; q < importedChannels.data.length; q++) {
		if (id == importedChannels.data[q].id) {
			let thing = importedChannels.data[q];
			let channel = {
				name: thing.name,
				count: thing.count,
				image: thing.image,
				min_gain: thing.min_gain,
				max_gain: thing.max_gain,
				mean_gain: thing.mean_gain ? thing.mean_gain : 0,
				std_gain: thing.std_gain ? thing.std_gain : 0,
				abbreviate: thing.abbreviate ? thing.abbreviate : false,
				id: thing.id ? thing.id : uuidGen(),
				footer: thing.footer ? thing.footer : "Subscribers",
				updateInterval: thing.updateInterval ? thing.updateInterval : 2000,
				graphType: thing.graphType ? thing.graphType : "live",
				graphDates: thing.graphDates ? thing.graphDates : [],
				graphValues: thing.graphValues ? thing.graphValues : [],
				liveGraph: thing.liveGraph ? thing.liveGraph : [],
				maxPoints: thing.maxPoints ? thing.maxPoints : 1000,
				dropdownTopText: thing.dropdownTopText ? thing.dropdownTopText : "All Time",
				dropdownBottomText: thing.dropdownBottomText ? thing.dropdownBottomText : "Live Data",
				banner: thing.banner ? thing.banner : "",
				textColor: thing.textColor ? thing.textColor : "#000",
				odometerUp: thing.odometerUp ? thing.odometerUp : "#000",
				odometerDown: thing.odometerDown ? thing.odometerDown : "#000",
				odometerSpeed: thing.odometerSpeed ? thing.odometerSpeed : 2,
				graphColor: thing.graphColor ? thing.graphColor : "#000",
				boxColor: thing.boxColor ? thing.boxColor : "#000",
				bgColor: thing.bgColor ? thing.bgColor : "#000",
			}
			localStorage.setItem("user", JSON.stringify(channel))
			location.reload()
		}
	}
}

if (localStorage.getItem("user")) {
	console.log(user)
	document.getElementById('subscribers_input').value = user.count
	document.getElementById('name_input').value = user.name
	document.getElementById('footer_input').value = user.footer
	document.getElementById('image_input').value = user.image
	document.getElementById('image').src = user.image
	document.getElementById('min_subs').value = user.min_gain
	document.getElementById('max_subs').value = user.max_gain
	document.getElementById('updateInterval').value = user.updateInterval / 1000
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
		}, 15000)
		user.autosave = true;
	} else {
		clearInterval(saveInterval)
		user.autosave = false;
	}
}

if (user.autosave == true) {
	saveInterval = setInterval(function () {
		localStorage.setItem("user", JSON.stringify(user))
	}, 15000)
	document.getElementById('autosave').checked = true;
}

function resetData() {
	if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
		localStorage.removeItem("user")
		location.reload()
	}
}
