(function () {
  var UPDATE_URL =  'http://gistudeng.gg.bg.ut.ee/dev/index.php/receiver/sendLastCategoryRevisionNumber';
  var SEND_URL =    'http://gistudeng.gg.bg.ut.ee/dev/index.php/receiver';

  var report = {
    submit: 'raport'
  };

  var language = 'et';

  var geolocation = {
    watch: null,
    position: null,
    
    enable: function () {
      geolocation.watch = navigator.geolocation.watchPosition(
        geolocation.on_success, geolocation.on_fail, {enableHighAccuracy: true}
      );
    },
    
    disable: function () {
      navigator.geolocation.clearWatch(geolocation.watch);
    },
    
    on_success: function (pos) {
      report.geolocation = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };
    },
    
    on_fail: function (error) {
      report.geolocation = null;
    }
  };

  var camera = {
    format: null,
    image: null,

    takePhoto: function (success, fail) {
      return function () {
        navigator.camera.getPicture(success, fail, {
          quality: 50,
          destinationType: camera.format.DATA_URL,
          targetWidth: 1024,
          targetHeight: 1024,
          correctOrientation: true
        });
      }
    }
  };

  var categories = {
    list: [],

    update: function () {
      var last_revision = 1;
      $.ajax({
        url: UPDATE_URL,
        type: 'POST',
        data: {'lastrevision': last_revision},
        dataType: 'json',
        success: function (res) {
          if (res.slice(-1)[0].lastrevision > last_revision) {
            var l = res.length - 1;
            for (var c = 0; c < l; ++c) {
              categories.list.push(res[c]);
            }
          }

          screen.initAll();
          screen.intro.show();
        }
      });
    }
  };


  var device = {
    on_pause: function () {
      geolocation.disable();
    },
    
    on_resume: function () {
      geolocation.enable();
    },

    on_ready: function () {
      $(document).on('pause', device.on_pause);
      $(document).on('resume', device.on_resume);

      geolocation.enable();

      report.uuid = window.device.uuid;
      camera.format = navigator.camera.DestinationType;

      categories.update();
    }
  };

  $(document).on('deviceready', device.on_ready);


  var screen = {
    initAll: function () {
      for (var s in screen) {
        if (s !== 'initAll') {
          screen[s].init();
        }
      }
    },

    intro: {
      init: function () {
        $('#start-app').tap(screen.take_photo.show);
      },

      show: function () {
        $('.screen').hide();
        $('#intro-screen').show();
      }
    },

    take_photo: {
      init: function () {
        $('#take-photo').tap(camera.takePhoto(
          screen.photo_review.show_success, screen.photo_review.show_fail
        ));
      },

      show: function () {
        $('.screen').hide();
        $('#take-photo-screen').show();
      }
    },

    photo_review: {
      init: function () {
        $('#photo-review-retry').tap(screen.take_photo.show);

        $('#photo-review-done').tap(screen.category.show);
      },

      show_success: function (photo_data) {
        report.photo = 'data:image/jpeg;base64,' + photo_data;

        $('#photo-review-title').text('Is this photo suitable?');
        $('.review-photo').attr('src', report.photo).show();

        $('#photo-review-done').show();

        $('.screen').hide();
        $('#photo-review-screen').show();

        $(document).swipe(function () {
          alert('swipe');
        });
      },

      show_fail: function (error) {
        report.photo = null;

        $('#photo-review-title').text('Could not take photo: ' + error);
        $('#review-photo').hide();
        
        $('#photo-review-done').hide();

        $('.screen').hide();
        $('#photo-review-screen').show();
      },

      show_last: function () {
        $('.screen').hide();
        $('#photo-review-screen').show();
      }
    },

    category: {
      init: function () {
        $('#category-back').tap(screen.photo_review.show_last);
        $('#category-done').tap(screen.comment.show);

        var ul = $('#category-list');
        for (var c in categories.list) {
          var category = categories.list[c];
          var li = $('<li data-id="' + category.id + '">' + category['name_' + language] + '</li>');
          li.tap(screen.category.on_select);
          ul.append(li);
        }
      },

      on_select: function () {
        if (report.category) {
          $('#category-list').children().removeClass('selected');
        }

        $('#category-done').show();

        var $this = $(this);
        $this.addClass('selected');

        report.category = $this.data('id');
        $('#review-category').text($this.text());
      },

      show: function () {
        $('.screen').hide();
        $('#category-screen').show();
      }
    },

    comment: {
      init: function () {
        $('#comment-back').tap(screen.category.show);
        $('#comment-done').tap(screen.comment.update_and_show_review);
      },

      show: function () {
        $('.screen').hide();
        $('#comment-screen').show();
      },

      update_and_show_review: function () {
        $('#comment-field').blur();
        report.comment = $('#comment-field').val();

        if (report.comment.length > 0) {
          $('#review-comment').text(report.comment);
        } else {
          $('#review-comment').text('None');
        }

        screen.review.show();
      }
    },

    review: {
      init: function () {
        $('#review-back').tap(screen.comment.show);
        $('#review-done').tap(sendReport);
      },

      show: function () {
        $('.screen').hide();
        $('#review-screen').show();
      }
    },

    send: {
      init: function () {},

      show: function () {
        $('.screen').hide();
        $('#send-screen').show();
      }
    },

    send_success: {
      init: function () {
        $('#success-new-report').tap(reload);
      },

      show: function () {
        $('.screen').hide();
        $('#send-success-screen').show();
      }
    },

    send_fail: {
      init: function () {
        $('#fail-new-report').tap(reload);
      },

      show: function () {
        $('.screen').hide();
        $('#send-fail-screen').show();
      }
    }
  };

  var sendReport = function () {
    report.timestamp = Math.round(+new Date() / 1000);
    screen.send.show();

    geolocation.disable();
    
    $.post(SEND_URL, report, function (res) {
      if (res.result === 'success') {
        screen.send_success.show();
      } else {
        screen.send_fail.show();
      }
    }, 'json');
  };

  var reload = function () {
    document.location = 'index.html';
  };
})();

