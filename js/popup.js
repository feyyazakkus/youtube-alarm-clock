var app = {
    initialize: function () {
        console.log("app initializing feyyaz..");
        var newAlarmBtn = document.getElementById('new-alarm');
        newAlarmBtn.addEventListener('click', this.newAlarm);

        var goBackBtn = document.getElementById('goBack');
        goBackBtn.addEventListener('click', this.goBack);

        chrome.alarms.getAll(function(alarms) {
            console.log(alarms);
        });

        var test = document.getElementById('alarm-test');
        test.addEventListener('click', function () {

            var alarmDate = Date.now() + 2000;
            chrome.alarms.create("myAlarm", {when: alarmDate});
        });

    },

    newAlarm: function (self) {

        $('#home-view').hide();
        $('#create-view').show();

        $("form").submit(function( event ) {
        
            var alarm = {}; 
            alarm.title = $('input[name=title]').val();
            alarm.date = $('input[name=alarm-date]').val() + ' ' + $('input[name=alarm-time]').val() + ':00';
            alarm.videoId = $('input[name=video-id]').val();

            // validate alarm date
            var now = new Date().getTime();
            var alarmDate = new Date(alarm.date).getTime();
            
            if (alarmDate > now) { // create alarm
                chrome.alarms.create(alarm.title, {when: alarmDate});
                
                var alarms = [alarm];

                chrome.storage.local.set({'alarms': alarms});
                chrome.storage.local.get('alarms', function (result) {
                    console.log(result);
                });

            } else {
                alert("Alarm time cant less then the current time");
            }

            console.log(alarm);

            event.preventDefault();
        });
    },

    goBack: function () {
        $('#create-view').hide();
        $('#home-view').show();
    }
};

console.log("test");


window.onload = app.initialize();