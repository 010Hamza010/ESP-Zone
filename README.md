# ESP-Zone

This project implements a museum device using an ESP8266, which connects to the museum's Wi-Fi and continuously scans for nearby Wi-Fi networks. The ESP8266 sends the SSID and signal strength to a local Python Flask server. The server checks if the visitor is near a specific area (indicated by Wi-Fi beacon broadcasters). If the visitor is close, the server sends an HTTP request to the ESP8266 to trigger audio playback, playing a corresponding MP3 file stored on the ESP's SD card.

The Flask server also provides:
- An overview map displaying the current locations of visitors.
- An alert system where visitors can request assistance by pressing a button on the device.

## Features:
- Continuous Wi-Fi scanning by ESP8266.
- Sends Wi-Fi scan results to a local Flask server.
- Server checks visitor proximity based on Wi-Fi beacon signals.
- Plays area-specific audio upon proximity detection.
- Overview map to monitor visitor locations.
- Alert system for assistance requests via button press.

## Components:
- **ESP8266**: Microcontroller for scanning Wi-Fi networks and playing audio.
- **Serial MP3 Player**: Plays MP3 files stored SD card.
- **Python Flask Server**: Processes the Wi-Fi signals, manages visitor locations, and sends HTTP requests to ESP8266.
- **Master Access Point**: To have Server & Esp slaves connected to it

## Sketch:

![alt text](https://github.com/010Hamza010/ESP-Zone/blob/main/demo_photos/sketch.png?raw=true)

## Dashboard:

![alt text](https://github.com/010Hamza010/ESP-Zone/blob/main/demo_photos/map.png?raw=true)

![alt text](https://github.com/010Hamza010/ESP-Zone/blob/main/demo_photos/form.png?raw=true)

## Visitor Request:

![alt text](https://github.com/010Hamza010/ESP-Zone/blob/main/demo_photos/alert.png?raw=true)

## Wiring :

|ESP8266| MP3 Module |
|--|--|
|3v|VCC|
|GND|GND|
|D3|TX|
|D4|RX|

