chrome.runtime.getBackgroundPage(function(bg) {
    console.log(bg.alarm);

    chrome.storage.local.get('alarms', function (result) {
    	console.log(result);

    	for (var i = 0; i < result.alarms.length; i++) {
    		if ("myAlarm" == bg.alarm.name) {

    			//document.getElementById('video').innerHTML = result.alarms[i].videoId;
    			//document.getElementById('title').innerHTML = result.alarms[i].title;
				
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

    		}
    	}
    });
});