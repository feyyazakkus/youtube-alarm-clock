chrome.browserAction.onClicked.addListener(function(activeTab) {
    //chrome.tabs.executeScript(null, {file: "content.js"});
    console.log("browserAction.onClicked calıstı");
});


chrome.alarms.onAlarm.addListener(function(alarm) {
  console.log("Got an alarm!", alarm);

  window.alarm = alarm;

  var w = 440;
  var h = 220;
  var left = (screen.width/2)-(w/2);
  var top = (screen.height/2)-(h/2); 

  chrome.windows.create({'url': 'alarm.html', 'type': 'popup', 'width': w, 'height': h, 'left': left, 'top': top} , function(newWindow) {
  	
  });
});