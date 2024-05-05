from flask_socketio import *
from threading import Thread
from requests import post
from base64 import b64decode
from flask import *
from time import sleep, time, strftime
from os import path as Patho


app = Flask(__name__)
sock = SocketIO(app)

networks = {}

Alerts = []

current = {
	"ssid": "",
	"times": 0,
	"played": False
}

max_found = 2

Last_Update = {
	"ssid": ""
}

API_URL = ""

def DEBUG(*text):
	print("[DEBUG]", text)

def API(data):
	DEBUG("sent", data)

	post(API_URL, data={"data": data})

def Info_Zones(emit):
	emit("info", [current, "zone"])

def Info_Networks(emit):
	emit("elements", networks)

@sock.on("connect", namespace="/")
def connect():
	Info_Networks(emit)
	sock.emit("alert", Alerts)

@sock.on("alert_deleted", namespace="/")
def alert_deleted(data):
	Alerts.pop(data)

	sock.emit("alert", Alerts)


@sock.on("elements", namespace="/")
def elements(data):
	global networks

	networks = data

	Info_Networks(sock.emit)

@app.route("/")
def html_render():
	return send_from_directory(".", "home.html"), 200

@app.route("/alert")
def alert_system():
	Alerts.append({
		"ssid": Last_Update["ssid"],
		"time": strftime("%Y/%m/%d %H:%M:%S")
		})

	sock.emit("notification", "Alert: Help requested from the zone '{}'".format(Last_Update["ssid"]))

	sock.emit("alert", Alerts)

	return "oh!", 200


@app.route('/handleData', methods=["POST"])
def handleData():
	DEBUG("Got Data From ESP8266")

	data = request.form.get('data')

	data = b64decode(data).decode()

	DEBUG("\n\n" + "\n".join(data.split(";")) + "\n\n")


	found = {}

	for i in data.split(";"):
		if "," not in i:
			break
		ssid, power = i.rsplit(",", 1)

		if ssid in networks.keys():
			if int(power) > networks[ssid]["power"]:
				found[ssid] = int(power)


	if not len(found.keys()):
		#decrese times
		current["times"]-= current["times"] > 0

		if current["times"] == 0 and current["played"]:
			current["played"] = False
			API("s")
			return "s"

		return "no"

	k, v = sorted(found.items(), key=lambda item: item[1], reverse=True)[0]

	#log the last close zone
	Last_Update["ssid"] = k

	if current["ssid"] != k:
		current["ssid"] = k
		current["times"] = 0
		current["played"] = False

	current["times"]+= current["times"] < max_found

	DEBUG("Current Zone Progress:", current)

	if current["times"] == max_found:
		DEBUG("Enter Zone:", k)

		if not current["played"]:
			current["played"] = True
			API("p" + str(networks[k]["audio"]))

			return "yes"

	return "yes"


#resources
@app.route("/<path:folder>/<path:path>")
def loads_resource(folder, path):
	if folder in ["photos", "js", "css"]:
		return send_from_directory(Patho.join(".", folder), path)
	else:
		abort(404)

if __name__ == '__main__':
	sock.run(app, host='0.0.0.0', port=80, debug=False)
