#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <WiFiClient.h>
#include <base64.h>

#include "GD3300.h"
#include <SoftwareSerial.h>

#define WIFI_SSID       ""
#define WIFI_PASSWORD   ""
#define SERVER_IP       ""
#define SERVER_PORT     80

String wifiScanResults = "";

bool _btn_clicked = false;

const int buttonPin = 04; //D2

ESP8266WebServer server(SERVER_PORT);

SoftwareSerial mp3Serial(0, 2); // RX, TX
GD3300 mp3;


void setup() {
  Serial.begin(115200);
  mp3Serial.begin(9600); //jack

  delay(500);             // wait for init

  pinMode(buttonPin, INPUT_PULLUP);

  mp3.begin(mp3Serial);
  mp3.sendCommand(CMD_SEL_DEV, 0, 2);   //select sd-card
  delay(500);             // wait for init

  // Connect to Wi-Fi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  Serial.println("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  // Start HTTP server
  server.on("/", HTTP_POST, API);
  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  server.handleClient();
  
  wifiScanResults = scanWiFi();

  //check if the button is clicked
  ButtonClicked();

  // Encode scan results as Base64
  String encodedData = base64::encode(wifiScanResults);

  Serial.println(encodedData);
  
  // Send scan results to server
  sendToServer(encodedData);
  
  //delay(500);
  //no delay because http request and response itself takes time
}

void ButtonClicked(){
  int buttonState = digitalRead(buttonPin); // Read the state of the push button

  Serial.println(buttonState == LOW && !_btn_clicked);

  if (buttonState == LOW && !_btn_clicked) { // if clicked and its the first time
    //send an alert request

    Serial.println("alert sent!");

    _btn_clicked = true;
    
    WiFiClient client;
    if (client.connect(SERVER_IP, SERVER_PORT)) {
      client.print("GET /alert HTTP/1.1\r\nHost: ");
      client.print(SERVER_IP);
      client.print("\r\nConnection: close\r\n\r\n");
      client.stop();
    }
  } else if(_btn_clicked) {
    _btn_clicked = false;  // mark it as not clicked
  }

}

void API() {
  // Handle POST request from backend server
  if (server.hasArg("data")) {
    String response = server.arg("data");

    String cmd     = response.substring(0, 1);
    int cmd_arg = response.charAt(1) - '0';
  
  
    if (cmd == "p"){
        mp3.play(cmd_arg);
    } else if (cmd == "s"){
         mp3.stop();
    }
  }

  // Send response to backend server
  server.send(200, "text/plain", "ok");
}

String scanWiFi() {
  String result = "";
  int n = WiFi.scanNetworks();
  
  if (n == 0) {
    Serial.println("No networks found");
  } else {
    Serial.print(n);
    Serial.println(" networks found");
    
    for (int i = 0; i < n; ++i) {
      result += WiFi.SSID(i);
      result += ",";
      result += WiFi.RSSI(i);
      result += ";";
    }
  }
  
  return result;
}


void sendToServer(String data) {
  WiFiClient client;
  
  if (client.connect(SERVER_IP, SERVER_PORT)) {
    client.print("POST /handleData HTTP/1.1\r\n");
    client.print("Host: ");
    client.print(SERVER_IP);
    client.print("\r\n");
    client.print("Content-Type: application/x-www-form-urlencoded\r\n");
    client.print("Content-Length: ");
    client.print(data.length()+5); //the word "data=" + data
    client.print("\r\n\r\n");
    client.print("data=");
    client.print(data);
  }
}
