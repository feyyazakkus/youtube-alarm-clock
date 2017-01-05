chrome.runtime.getBackgroundPage(function(bg) {
    console.log(bg.alarm);

    chrome.storage.local.get('alarms', function (result) {
    	console.log(result);
    	var alarmList = result.alarms;

    	for (var i = 0; i < result.alarms.length; i++) {
    		if (result.alarms[i]['name'] == bg.alarm.name) {

    			document.getElementById('alarm-name').innerHTML = result.alarms[i].name;
				
	            var player = new YT.Player('player', {
				    height: '390',
				    width: '640',
				    videoId: 'K0YEVNacmtw',
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
});