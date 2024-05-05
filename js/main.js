socket = io()

var elements = {}

var draging_dot = -1;

const pages = ["map", "support"];
var current_page = "page_map"

for (var i = 0; i < pages.length; i++) {
	document.getElementById("page_" + pages[i] + "_btn").onclick = function () {
		document.getElementById(current_page).style.display = "none"
		document.getElementById(current_page + "_btn").setAttribute('data-selected', false);

		document.getElementById(this.id.replace("_btn", "")).style.display = "flex"
		document.getElementById(this.id).setAttribute('data-selected', true);

		current_page = this.id.replace("_btn", "")
	}
}


document.getElementById("save").onclick = function () {
	var holder = document.getElementById("pop_up_element");
	var map = document.getElementById("view_map_map");

	var ssid = holder.querySelectorAll("[name=ssid]")[0].value
	var power = holder.querySelectorAll("[name=power]")[0].value
	var audio = holder.querySelectorAll("[name=audio]")[0].value
	var color = holder.querySelectorAll("[name=color]")[0].value
	var id = parseInt(holder.querySelectorAll("[name=dot_id]")[0].value);


	if (Object.keys(elements).includes(ssid)) {
		//the ssid is in the list
		if (id != Object.keys(elements).indexOf(ssid)) {
			//we are editing with the same ssid & id
			return
		}
		
	}

	if (id >= Object.keys(elements).length) {
		elements[ssid] = {
			"power": 0,
			"color": "",
			"audio": 0,
			"cord": {
				"x": 0,
				"y": 0
			}
		}
	}else {
		if (!Object.keys(elements).includes(ssid)) {
			//we are editing an element

			//delete old element
			delete elements[Object.keys(elements)[id]];

			var old_id = id;

			//generating new id
			var id = Object.keys(elements).length;

			map.querySelectorAll(".view_map_dot[data-element_id='" + old_id + "']")[0].dataset.element_id = id;

			elements[ssid] = {
				"power": 0,
				"color": "",
				"audio": 0,
				"cord": {
					"x": 0,
					"y": 0
				}
			}
		}
	}

	elements[ssid]["power"] = parseFloat(power);
	elements[ssid]["audio"] = parseInt(audio);
	elements[ssid]["color"] = color;

	var x = parseFloat(getComputedStyle(map.querySelectorAll(".view_map_dot[data-element_id='" + id + "']")[0]).left);
	var y = parseFloat(getComputedStyle(map.querySelectorAll(".view_map_dot[data-element_id='" + id + "']")[0]).top);

	var rect = document.getElementById("view_map_map").getBoundingClientRect();

	//make it relative
	x = 100*x/rect.width;
	y = 100*y/rect.height;

	elements[ssid]["cord"]["x"] = x;
	elements[ssid]["cord"]["y"] = y;


	map.querySelectorAll(".view_map_dot[data-element_id='" + id + "']")[0].style.backgroundColor = color;
	map.querySelectorAll(".view_map_dot[data-element_id='" + id + "'] label")[0].innerText = ssid;

	var inputs = document.getElementById("pop_up_element").querySelectorAll("input");

	for (var i = 0; i < inputs.length; i++) {
		inputs[i].value = inputs[i].defaultValue;
	}

	document.getElementById("pop_up").style.display = "none";

	save_elements();

}

document.getElementById("cancel").onclick = function () {
	var inputs = document.getElementById("pop_up_element").querySelectorAll("input");
	var id = document.getElementById("pop_up_element").querySelectorAll("[name=dot_id]")[0].value;

	document.getElementById("view_map_map").querySelectorAll(".view_map_dot[data-element_id='" + id + "']")[0].remove()

	delete elements[Object.keys(elements)[id]];


	for (var i = 0; i < inputs.length; i++) {
		inputs[i].value = inputs[i].defaultValue;
	}

	document.getElementById("pop_up").style.display = "none";

	save_elements();
}

document.getElementById("view_map_map").onmousemove = function(event){
	if (draging_dot > -1) {
		var dot = document.getElementById("view_map_map").querySelectorAll(".view_map_dot[data-element_id='" + draging_dot+ "']")[0];

		var rect = this.getBoundingClientRect();
		var rect_2 = dot.getBoundingClientRect();
		var x = event.clientX - rect.left - rect_2.width/2;
		var y = event.clientY - rect.top - rect_2.height/2;

		//make it relative
		x = 100*x/rect.width;
		y = 100*y/rect.height;

		dot.style.top = y + "%";
		dot.style.left = x + "%";

		elements[Object.keys(elements)[draging_dot]]["cord"]["x"] = x;
		elements[Object.keys(elements)[draging_dot]]["cord"]["y"] = y;
	}
}

document.getElementById("view_map_map").onmouseup = function(event){
	if (draging_dot > -1) {
		draging_dot = -1;
		save_elements();
		return
	}


	dot = createDot("New SSID", "red", Object.keys(elements).length)

	var rect = this.getBoundingClientRect();
	var rect_2 = dot.getBoundingClientRect();
	var x = event.clientX - rect.left - rect_2.width/2;
	var y = event.clientY - rect.top - rect_2.height/2;

	//make it relative
	x = 100*x/rect.width;
	y = 100*y/rect.height;

	dot.style.top = y + "%";
	dot.style.left = x + "%";

	document.getElementById("pop_up_element").querySelectorAll("[name=dot_id]")[0].value = parseFloat(dot.dataset.element_id);

	document.getElementById("pop_up").style.display = "flex";
}


function createDot(ssid, color, given_id) {
	var dot = document.createElement("div");
	var label = document.createElement("label")

	label.innerText = ssid

	dot.className = "view_map_dot"
	dot.style.backgroundColor = color;

	dot.dataset.element_id = given_id;

	dot.append(label)
	document.getElementById("view_map_map").appendChild(dot)

	dot.onmousedown = function (){
		draging_dot = parseFloat(this.dataset.element_id);
	}

	dot.ondblclick = function (){
		var holder = document.getElementById("pop_up_element");

		var id = parseInt(this.dataset.element_id)

		var ssid = Object.keys(elements)[id];

		holder.querySelectorAll("[name=ssid]")[0].value = ssid;
		holder.querySelectorAll("[name=power]")[0].value = elements[ssid]["power"];
		holder.querySelectorAll("[name=color]")[0].value = elements[ssid]["color"];
		holder.querySelectorAll("[name=dot_id]")[0].value = id;

		document.getElementById("pop_up").style.display = "flex";
	}

	return dot;
}

function save_elements() {
	socket.emit("elements", elements)
}

function AddNoti(text){
	var noti_holder = document.getElementById("noti_holder");


	var noti = document.createElement("div");
	var label = document.createElement("label");

	noti.className = "noti";
	label.innerText = text;

	noti.appendChild(label);

	noti_holder.insertBefore(noti, noti_holder.children[0])

	if (noti_holder.childElementCount > 4) {
		noti_holder.lastElementChild.remove()
	}

	setTimeout(function () {
		noti.remove();
	}, 5000)

}

socket.on("alert", function (data){
	var table = document.getElementById("page_support_table").querySelectorAll("tr");

	//delete all old alerts
	for (var i = table.length - 1; i >= 1; i--) {
		table[i].remove()
	}

	for (var i = data.length - 1; i >= 0; i--) {
		var _tr = document.createElement("tr");

		var _zone = document.createElement("td");
		var _time = document.createElement("td");
		var _btn_holder = document.createElement("td");

		var _btn = document.createElement("button");

		_btn.innerText = "Done";
		_btn.className = "btn";
		_btn.onclick = function(){
			//get id
			var _parent_tr = this.parentElement.parentElement;

			var _id = Array.from(_parent_tr.parentElement.querySelectorAll("tr")).indexOf(_parent_tr) - 1 //remove titles

			//reorder the id
			_id = _parent_tr.parentElement.querySelectorAll("tr").length - 2 - _id

			//now we send the removed id
			socket.emit("alert_deleted", _id)

		}

		_btn_holder.appendChild(_btn)

		_zone.innerText = data[i].ssid;
		_time.innerText = data[i].time;

		_tr.appendChild(_zone);
		_tr.appendChild(_time);
		_tr.appendChild(_btn_holder);

		document.getElementById("page_support_table").appendChild(_tr)

	}
})

socket.on("notification", function (data) {
	AddNoti(data);
})

socket.on("elements", function (data) {
	elements = data

	for (var i = 0; i < Object.keys(data).length; i++) {
		//check before adding that dot
		var dot = document.getElementById("view_map_map").querySelectorAll(".view_map_dot[data-element_id='" + i + "']")[0];

		if (dot == undefined) {
			var dot = createDot(Object.keys(data)[i], data[Object.keys(data)[i]]["color"], i)
		}else {
			//just update cord & color

			dot.style.backgroundColor = data[Object.keys(data)[i]]["color"];
		}

		dot.style.top = data[Object.keys(data)[i]]["cord"]["y"] + "%";
		dot.style.left = data[Object.keys(data)[i]]["cord"]["x"] + "%";

	}
})