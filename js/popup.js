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
            alarm.date = $('input[name=alarm-date]').val() + ' ' + $('input[name=alarm-time]').val();
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

            data.alarms.reverse();

            if (typeof data.alarms !== 'undefined') {

                // set alarms status
                chrome.alarms.getAll(function(alarms) {

                    for (var i = 0; i < data.alarms.length; i++) {

                        data.alarms[i]['status'] = 'off';

                        for (var j = 0; j < alarms.length; j++) {
                            if (alarms[j]['name'] == data.alarms[i]['name']) {
                                data.alarms[i]['status'] = 'on';
                            }
                        }
                    }
                });

                // collect video ids
                var video_ids = [];
                for (var i = 0; i < data.alarms.length; i++) {
                    video_ids.push(data.alarms[i]['videoId']);
                }
                console.log(data.alarms);

                // retrive youtube video informations
                var video_ids_str = video_ids.join();

                $.get('https://www.googleapis.com/youtube/v3/videos?part=id%2C+snippet&id='+ video_ids_str +'&key=' + GOOGLE_API_KEY, function (apiData) {
                    console.log("resp:", apiData);

                    // set content
                    var alarmsHTML = '';
                    for (var i = 0; i < data.alarms.length; i++) {

                        var img = 'icon.png';
                        var videoTitle = 'No video';
                        var name = data.alarms[i]['name'];
                        var date = data.alarms[i]['date'];
                        var status = data.alarms[i]['status'];

                        for (var j = 0; j < apiData.items.length; j++) {
                            if (data.alarms[i]['videoId'] == apiData.items[j]['id']) {
                                img = apiData.items[j].snippet.thumbnails.default.url;
                                videoTitle = apiData.items[j].snippet.title;
                            }
                        }

                        if (videoTitle.length > 30) {
                            videoTitle = videoTitle.substring(0, 30) + '..';
                        }

                        alarmsHTML += '<li class="row" id="alarm-'+ name +'">' +
                            '<div class="image">\n' +
                                '<img src="'+ img +'">\n' +
                            '</div>\n' +
                            '<div class="info">\n' +
                                '<p class="alarm-name">'+ name +'</p>\n' +
                                '<p class="alarm-date">Date: '+ date +'</p>\n' +
                                '<p class="video-name">Video: '+ videoTitle +'..</p>\n' +
                                '<p class="status '+ status +'"></p>\n' + 
                            '</div>\n' +
                          '</li>\n';
                    }

                    $('#alarms-list').html(alarmsHTML);

                    // bind click event to alarms
                    $('#alarms-list li').click(function () {
                        console.log(event);
                    });
                });

            } else {
                $('#alarms-list').html("You have no alarm.");
            }
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

var GOOGLE_API_KEY = "AIzaSyDeLUHZIuCwCrTdWnot-HCqB1l8x4n2HrI";

window.onload = app.initialize();