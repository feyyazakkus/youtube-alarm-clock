var app = {
    initialize: function () {

        var self = this;
        this.getAlarms();

        $('.btn-new').click(function () {
            self.createAlarm();
        });

        $('.btn-back').click(function () {
            self.goBack();
        });
    },

    createAlarm: function () {

        var self = this;
        $('.home-view').hide();
        $('.create-view').show();

        var now = new Date();
        $('input[name=alarm-name]').val('');
        $('input[name=alarm-date]').val(now.toISOString().substring(0, 10));
        $('input[name=alarm-time]').val(self.pad(now.getHours()) + ':' + self.pad(now.getMinutes()));
        $('input[name=video-link]').val('');

        // save alarm
        $("#form-create").unbind('submit').submit(function(event) {
            
            $('.loader').show();
            $('.create-view').hide();

            var alarm = {};
            alarm.name = $('input[name=alarm-name]').val();
            alarm.date = $('input[name=alarm-date]').val() + ' ' + $('input[name=alarm-time]').val();
            alarm.videoLink = $('input[name=video-link]').val();
            alarm.videoId = self.getVideoId(alarm.videoLink);

            // validate alarm date
            var now = new Date().getTime();
            var alarmDate = new Date(alarm.date).getTime();

            if (alarmDate > now) { // create alarm
                chrome.alarms.create(alarm.name, {when: alarmDate});

                var alarms_arr = [];
                chrome.storage.local.get('alarms', function (data) {
                    if (typeof data.alarms !== 'undefined') {
                        data.alarms.push(alarm);
                        alarms_arr = data.alarms;
                        
                    } else {
                        alarms_arr.push(alarm);
                    }
                    
                    chrome.storage.local.set({'alarms': alarms_arr}, function () {
                        self.getAlarms();
                    });
                });

            } else {
                alert("Alarm time cant less then the current time");
                $('.loader').hide();
                $('.create-view').show();
            }

            event.preventDefault();
        });
    },

    getAlarms: function () {

        var self = this;
        $('.alarms-list').html('');
        $('.loader').show();

        chrome.storage.local.get('alarms', function (data) {
            console.log("alarms storage:", data.alarms);

            if (typeof data.alarms !== 'undefined' && data.alarms.length > 0) {
                data.alarms.reverse();

                // set alarms status
                chrome.alarms.getAll(function(alarms) {
                    console.log("alarms:", alarms)

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

                var video_ids_str = video_ids.join();

                // retrive youtube video informations
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

                        alarmsHTML += '<li class="row '+ name +'">' +
                            '<div class="image">\n' +
                                '<img src="'+ img +'">\n' +
                            '</div>\n' +
                            '<div class="info">\n' +
                                '<p class="alarm-name">'+ name +'</p>\n' +
                                '<p class="alarm-date">Date: '+ date +'</p>\n' +
                                '<p class="video-title">Video: '+ videoTitle +'..</p>\n' +
                                '<p class="status '+ status +'"></p>\n' + 
                            '</div>\n' +
                          '</li>\n';
                    }

                    $('.alarms-list').html(alarmsHTML);
                    $('.no-alarm').hide();

                    // bind click event to alarms
                    $('.alarms-list li.row').click(function () {
                        var alarmName = $(this).attr('class').replace('row ', '');
                        self.updateAlarm(alarmName);
                    });

                    self.goBack();
                    $('.loader').hide();

                });

            } else {
                $('.no-alarm').show();
                $('.loader').hide();
            }
        });
    },

    updateAlarm: function (alarmName) {

        var self = this;
        $('.home-view').hide();
        $('.update-view').show();

        chrome.storage.local.get('alarms', function (data) {
            
            for (var i = 0; i < data.alarms.length; i++) {
                if (alarmName == data.alarms[i]['name']) {
                    console.log(data.alarms[i]);
                    var date = new Date(data.alarms[i]['date']).toISOString().substring(0, 10);
                    var time = data.alarms[i]['date'].split(' ')[1];

                    $('input[name=alarm-name]').val(alarmName);
                    $('input[name=alarm-date]').val(date);
                    $('input[name=alarm-time]').val(time);
                    $('input[name=video-link]').val(data.alarms[i]['videoLink']);
                }
            }
        });

        // on update
        $("#form-update").unbind('submit').submit(function(event) {

            var alarm = {};
            alarm.name = $('#form-update input[name=alarm-name]').val();
            alarm.date = $('#form-update input[name=alarm-date]').val() + ' ' + $('#form-update input[name=alarm-time]').val();
            alarm.videoLink = $('#form-update input[name=video-link]').val();
            alarm.videoId = self.getVideoId(alarm.videoLink);

            // validate alarm date
            var now = new Date().getTime();
            var alarmDate = new Date(alarm.date).getTime();
            
            // delete alarm and create new one
            if (alarmDate > now) {

                $('.loader').show();
                $('.update-view').hide();

                self.deleteAlarm(alarmName, function () {

                    chrome.alarms.create(alarm.name, {when: alarmDate});

                    var alarms_arr = [];
                    chrome.storage.local.get('alarms', function (data) {
                        if (typeof data.alarms !== 'undefined') {
                            data.alarms.push(alarm);
                            alarms_arr = data.alarms;
                            
                        } else {
                            alarms_arr.push(alarm);
                        }
                        
                        chrome.storage.local.set({'alarms': alarms_arr}, function () {
                            self.getAlarms();
                        });
                    });
                });

            } else {
                console.log("else girdi");
                alert("Alarm time cant less then the current time");
                $('.loader').hide();
                $('.update-view').show();
            }

            event.preventDefault();
        });

        // on delete
        $('.btn-delete').unbind('click').click(function () {
            self.deleteAlarm(alarmName, function () {
                self.goBack();
                self.getAlarms();
            });
        });
    },

    getVideoId: function (link) {
        var params = link.substring(link.indexOf("?") + 1, link.length);
        var v = params.split('&')[0];
        return v.substring(v.indexOf('v=') + 2, v.length);
    },

    deleteAlarm: function (alarmName, callback) {

        var self = this;
        console.log(alarmName + " deleting..");
        chrome.alarms.clear(alarmName, function () {            
            chrome.storage.local.get('alarms', function (data) {
                
                var alarms = data.alarms;
                for (var i = 0; i < data.alarms.length; i++) {
                    if (alarmName == data.alarms[i]['name']) {
                        alarms.splice(i, 1);
                        chrome.storage.local.set({'alarms': alarms}, function () {
                            callback();
                        });   
                    }
                }
            });
        });
    },

    goBack: function () {
        $('.create-view').hide();
        $('.update-view').hide();
        $('.home-view').show();
    },

    pad: function (value) {
        return value.toString().length > 1 ? value : '0' + value;
    }
};

var GOOGLE_API_KEY = "AIzaSyDeLUHZIuCwCrTdWnot-HCqB1l8x4n2HrI";

window.onload = app.initialize();