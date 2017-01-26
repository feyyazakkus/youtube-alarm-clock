var app = {
    initialize: function () {

        //chrome.storage.local.clear();
        //chrome.alarms.clearAll();

        var self = this;
        this.getAlarms();

        $('.btn-new').click(function () {
            self.createAlarm();
        });

        $('.btn-back').click(function () {
            self.goBack();
        });
    },

    getAlarms: function () {

        var self = this;
        $('.alarms-list').html('');
        $('.loader').show();

        chrome.storage.local.get('alarms', function (data) {

            if (typeof data.alarms !== 'undefined' && data.alarms.length > 0) {
                data.alarms.reverse();
                console.log("storage.local.get:", data.alarms);
                // set alarms status
                chrome.alarms.getAll(function(alarms) {
                    console.log("alarms.getAll", alarms);
                    for (var i = 0; i < data.alarms.length; i++) {
                        data.alarms[i]['status'] = 'off';
                        for (var j = 0; j < alarms.length; j++) {
                            if (alarms[j]['name'] == data.alarms[i]['name']) {
                                data.alarms[i]['status'] = 'on';
                            }
                        }
                    }

                    // set content
                    var alarmsHTML = '';
                    for (var i = 0; i < data.alarms.length; i++) {

                        var name = data.alarms[i]['name'];
                        var nameFull = data.alarms[i]['name'];
                        var date = data.alarms[i]['date'];
                        var time = data.alarms[i]['time'];
                        var status = data.alarms[i]['status'];
                        var image = data.alarms[i]['image'];
                        var videoTitle = data.alarms[i]['videoTitle'];

                        console.log(new Date(date + ':00'));

                        if (name.length > 19) {
                            name = name.substring(0, 19) + '..';
                        }

                        if (videoTitle.length > 30) {
                            videoTitle = videoTitle.substring(0, 30) + '..';
                        }

                        alarmsHTML += '<li class="row '+ name +'">' +
                        '<div class="image">\n' +
                            '<img src="'+ image +'">\n' +
                        '</div>\n' +
                        '<div class="info">\n' +
                            '<p class="alarm-name" title="'+ nameFull +'">'+ name +'</p>\n' +
                            '<p class="video-title">'+ videoTitle +'</p>\n' +
                            '<p class="alarm-date">'+ date +'</p>\n' +
                            '<p class="status '+ status +'"></p>\n' + 
                        '</div>\n' +
                        '<div class="time">\n' +
                            '<p>'+ time +'</p>'
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

    createAlarm: function () {

        var self = this;
        $('.home-view').hide();
        $('.update-view').hide();
        $('.create-view').show();

        var now = new Date();
        $('input[name=alarm-name]').val('');
        $('input[name=alarm-date]').val(now.toISOString().substring(0, 10));
        $('input[name=alarm-time]').val(self.pad(now.getHours()) + ':' + self.pad(now.getMinutes()));
        $('input[name=video-link]').val('');

        // save alarm
        $("#form-create").unbind('submit').submit(function(event) {

            event.preventDefault();

            $('.loader').show();
            $('.create-view').hide();

            var alarm = {};
            alarm.name = $('input[name=alarm-name]').val();
            alarm.date = $('input[name=alarm-date]').val();
            alarm.time = $('input[name=alarm-time]').val();
            alarm.videoLink = $('input[name=video-link]').val();
            alarm.videoId = self.getVideoId(alarm.videoLink);

            // defaults
            alarm.image = 'icon.png';
            alarm.videoTitle = 'No video';

            // validate alarm date
            var now = new Date().getTime();
            var alarmDate = new Date(alarm.date + ' ' + alarm.time + ':00').getTime();

            if (alarmDate > now) { // create alarm
                chrome.alarms.create(alarm.name, {when: alarmDate});

                // get video information from youtube data api
                $.get('https://www.googleapis.com/youtube/v3/videos?part=id%2C+status%2C+snippet&id='+ alarm.videoId +'&key=' + GOOGLE_API_KEY, function (apiData) {
                    console.log("resp:", apiData);

                    if (apiData.items.length > 0) {
                        if (apiData.items[0].status.embeddable) {

                            alarm.image = apiData.items[0].snippet.thumbnails.default.url;
                            alarm.videoTitle = apiData.items[0].snippet.title;

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
                            alert("'The requested video is not allowed to be played in embedded players.");
                            $('.loader').hide();
                            $('.create-view').show();
                            return;
                        }
                    } else {
                        alert("Youtube video link is not valid.");
                        return;
                    }
                });

            } else {
                alert("Alarm time cant less then the current time");
                $('.loader').hide();
                $('.create-view').show();
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
                    //var date = new Date(data.alarms[i]['date'] + '00:00:00');
                    //var dateInput = date.getFullYear() + '-' + self.pad(date.getMonth() + 1) + '-' + date.getDate();
                    var dateInput = data.alarms[i]['date'];
                    var time = data.alarms[i]['time'];

                    $('#form-update input[name=alarm-name]').val(alarmName);
                    $('#form-update input[name=alarm-date]').val(dateInput);
                    $('#form-update input[name=alarm-time]').val(time);
                    $('#form-update input[name=video-link]').val(data.alarms[i]['videoLink']);

                }
            }
        });

        // on update
        $("#form-update").unbind('submit').submit(function(event) {

            event.preventDefault();

            var alarm = {};
            alarm.name = $('#form-update input[name=alarm-name]').val();
            alarm.date = $('#form-update input[name=alarm-date]').val();
            alarm.time = $('#form-update input[name=alarm-time]').val();
            alarm.videoLink = $('#form-update input[name=video-link]').val();
            alarm.videoId = self.getVideoId(alarm.videoLink);

            // validate alarm date
            var now = new Date().getTime();
            var alarmDate = new Date(alarm.date + ' ' + alarm.time + ':00').getTime();
            
            // delete alarm and create new one
            if (alarmDate > now) {

                $('.loader').show();
                $('.update-view').hide();

                self.deleteAlarm(alarmName, function () {

                    chrome.alarms.create(alarm.name, {when: alarmDate});

                    // retrive video information from youtube data api
                    $.get('https://www.googleapis.com/youtube/v3/videos?part=id%2C+status%2C+snippet&id='+ alarm.videoId +'&key=' + GOOGLE_API_KEY, function (apiData) {
                        console.log("resp:", apiData);

                        if (apiData.items.length > 0) {
                            if (apiData.items[0].status.embeddable) {

                                alarm.image = apiData.items[0].snippet.thumbnails.default.url;
                                alarm.videoTitle = apiData.items[0].snippet.title;

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
                                alert("'The requested video is not allowed to be played in embedded players.");
                                $('.loader').hide();
                                $('.create-view').show();
                                return;
                            }
                        } else {
                            alert("Youtube video link is not valid.");
                            $('.loader').hide();
                            $('.create-view').show();
                            return;
                        }
                    });
                });

            } else {
                alert("Alarm time cant less then the current time");
                $('.loader').hide();
                $('.update-view').show();
            }
            
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