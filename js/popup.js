var app = {
    initialize: function () {

        this.getAlarms();

        $('#new-alarm').click(function () {
            app.newAlarm();
        });

        $('#go-back').click(function () {
            app.goBack();
        });
    },

    newAlarm: function () {

        $('#home-view').hide();
        $('#create-view').show();

        var now = new Date();
        $('input[name=alarm-date]').val(new Date().toISOString().substring(0, 10));
        $('input[name=alarm-time]').val(app.pad(now.getHours()) + ':' + app.pad(now.getMinutes()));

        $("form").submit(function( event ) {
        
            var alarm = {};
            alarm.name = $('input[name=alarm-name]').val();
            alarm.date = $('input[name=alarm-date]').val() + ' ' + $('input[name=alarm-time]').val() + ':00';
            alarm.videoId = $('input[name=video-id]').val();

            // validate alarm date
            var now = new Date().getTime();
            var alarmDate = new Date(alarm.date).getTime();

            if (alarmDate > now) { // create alarm
                chrome.alarms.create(alarm.name, {when: alarmDate});

                chrome.storage.local.get('alarms', function (data) {
                    if (typeof data.alarms !== 'undefined') {
                        data.alarms.push(alarm);
                        chrome.storage.local.set({'alarms': data.alarms});
                    } else {
                        chrome.storage.local.set({'alarms': [alarm]});
                    }
                });

                this.goBack();

            } else {
                alert("Alarm time cant less then the current time");
            }

            event.preventDefault();
        });
    },

    getAlarms: function () {

        chrome.storage.local.get('alarms', function (data) {

            var alarms = data.alarms;

            if (typeof alarms !== 'undefined') {
                
                // set alarms status
                chrome.alarms.getAll(function(alarms) {

                    for (var i = 0; i < data.alarms.length; i++) {
                        
                        data.alarms[i]['status'] = false;

                        for (var j = 0; j < alarms.length; j++) {
                            if (alarms[j]['name'] == data.alarms[i]['name']) {
                                data.alarms[i]['status'] = true;
                            }
                        }
                    }
                });

                // set html
                var alarmsHTML = '';
                for (var i = 0; i < alarms.length; i++) {
                    alarmsHTML += '<li class="row">' +
                                    '<div class="image">\n' +
                                        '<img src="test.png">\n' +
                                    '</div>\n' +
                                    '<div class="info">\n' +
                                        '<p class="title">'+ alarms[i]['name'] +'</p>\n' +
                                        '<p class="time">Time: '+ alarms[i]['date'] +'</p>\n' +
                                        '<p class="video-name">Video: '+ alarms[i]['videoId'] +'</p>\n' +
                                    '</div>\n' +
                                  '</li>\n';
                }
            }

            $('#alarms-list').html(alarmsHTML);

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

window.onload = app.initialize();