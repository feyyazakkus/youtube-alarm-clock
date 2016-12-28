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

    newAlarm: function () {

        //chrome.storage.local.clear();

        $('#home-view').hide();
        $('#create-view').show();

        var now = new Date();
        $('input[name=alarm-date]').val(now.getFullYear() + '-' + (now.getMonth() + 1) +  '-' + now.getDate());
        $('input[name=alarm-time]').val(app.pad(now.getHours()) + ':' + app.pad(now.getMinutes()));

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
    },

    pad: function (value) {
        return value.toString().length > 1 ? value : '0' + value;
    }
};

console.log("test");

window.onload = app.initialize();