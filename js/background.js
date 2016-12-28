chrome.alarms.onAlarm.addListener(function(alarm) {

  window.alarm = alarm;

  var w = 640;
  var h = 390;
  var left = (screen.width/2)-(w/2);
  var top = (screen.height/2)-(h/2); 

  // create alarm popup
  chrome.windows.create({
    'url': 'alarm.html',
    'type': 'popup',
    'width': w,
    'height': h,
    'left': left,
    'top': top
  });

});