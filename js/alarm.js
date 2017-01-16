chrome.runtime.getBackgroundPage(function(bg) {
    console.log(bg.alarm);

    chrome.storage.local.get('alarms', function (result) {
    	console.log(result);
    	var alarmList = result.alarms;

    	for (var i = 0; i < result.alarms.length; i++) {
    		if (result.alarms[i]['name'] == bg.alarm.name) {

    			var videoId = result.alarms[i].videoId;

	   			document.title = bg.alarm.name + ' - Youtube Alarm Clock';
	   			document.getElementById('alarm-name').innerHTML = bg.alarm.name;

	            var player = new YT.Player('player', {
				    height: '390',
				    width: '640',
				    videoId: videoId,
				    playerVars: { 'controls': 0 },
				    events: {
				      'onReady': onPlayerReady,
				      'onStateChange': console.log("onStateChange")
				    }
				});
			    
			    function onPlayerReady(event) {
		        	event.target.playVideo();
		      	}

		      	break;
    		}
    	}
    });

    // delete alarm
    chrome.alarms.clear(bg.alarm.name, function () {
    	console.log("alarm deleted");
    });
});