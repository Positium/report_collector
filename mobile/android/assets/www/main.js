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

    takePhoto: function (callback) {
      var success = function (data) {
        callback(null, data);
      };

      var fail = function (error) {
        callback(error);
      }

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

      screen.current = screen.loading;
      categories.update();
    }
  };

  $(document).on('deviceready', device.on_ready);

  var screen = {
    initAll: function () {
      for (var s in screen) {
        if (screen[s] !== null && typeof screen[s] === 'object' && 'element' in screen[s]) {
          screen[s].init();
        }
      }
    },

    current: null,

    showScreen: function (new_screen, animation_direction) {
      if (new_screen !== screen.current) {
        // TODO: transition
        screen.current.element.hide();
        screen.current = new_screen;
        screen.setSwipeEvents(new_screen);
        new_screen.element.show();
      }
    },

    setSwipeEvents: function (screen) {
      var action_left = function () {};
      var action_right = action_left;

      var button_left = screen.element.find('.button-left');
      var button_right = screen.element.find('.button-right');


      // The swipes are mirrored
      if (button_left.length !== 0) {
        action_right = function () { 
          if (!button_left.attr('disabled')) {
            button_left.trigger('tap');
          }
        };
      }
      if (button_right.length !== 0) {
        action_left = function () { 
          if (!button_right.attr('disabled')) {
            button_right.trigger('tap');
          }
        };
      }
      
      $(document).swipeLeft(action_left).swipeRight(action_right);
    },

    loading: {
      element: $('#loading-screen'),

      init: function () {}
    },

    intro: {
      element: $('#intro-screen'),

      init: function () {
        $('#start-app').tap(screen.take_photo.show);
      },

      show: function () {
        screen.showScreen(screen.intro);
      }
    },

    take_photo: {
      element: $('#take-photo-screen'),

      init: function () {
        $('#take-photo-back').tap(screen.intro.show);
        $('#take-photo').tap(camera.takePhoto(screen.photo_review.show));
      },

      show: function () {
        screen.showScreen(screen.take_photo);
      }
    },

    photo_review: {
      element: $('#photo-review-screen'),

      init: function () {
        $('#photo-review-retry').tap(screen.take_photo.show);
        $('#photo-review-done').tap(screen.category.show);
      },

      show: function (error, photo_data) {
        if (error && !(error instanceof Event)) {
          report.photo = null;
          $('#photo-review-title').text('Viga pildi tegemisel: ' + error);
          $('#review-photo').hide();
          $('#photo-review-done').attr('disabled', 'disabled').hide();
        } else if (photo_data) {
          report.photo = 'data:image/jpeg;base64,' + photo_data;
          $('#photo-review-title').text('Kas see pilt sobib?');
          $('.review-photo').attr('src', report.photo).show();
          $('#photo-review-done').removeAttr('disabled').show();
        }

        screen.showScreen(screen.photo_review);
      },
    },

    category: {
      element: $('#category-screen'),

      init: function () {
        $('#category-back').tap(screen.photo_review.show);
        $('#category-done').tap(screen.comment.show);

        var ul = $('#category-list');
        for (var c in categories.list) {
          var category = categories.list[c];
          var li = $('<li data-id="' + category.id + '">' + category['name_' + language] + '</li>');
          li.tap(screen.category.on_select);
          ul.append(li);
        }
        
        $('#category-done').attr('disabled', 'disabled').hide();
      },

      on_select: function () {
        if (report.category) {
          $('#category-list').children().removeClass('selected');
        }

        $('#category-done').removeAttr('disabled').show();

        var $this = $(this);
        $this.addClass('selected');

        report.category = $this.data('id');
        $('#review-category').text($this.text());
      },

      show: function () {
        screen.showScreen(screen.category);
      }
    },

    comment: {
      element: $('#comment-screen'),

      init: function () {
        $('#comment-back').tap(screen.category.show);
        $('#comment-done').tap(screen.comment.update_and_show_review);
      },

      show: function () {
        screen.showScreen(screen.comment);
      },

      update_and_show_review: function () {
        $('#comment-field').blur();
        report.comment = $('#comment-field').val();

        if (report.comment.length > 0) {
          $('#review-comment').text(report.comment);
        } else {
          $('#review-comment').text('Puudub');
        }

        screen.review.show();
      }
    },

    review: {
      element: $('#review-screen'),

      init: function () {
        $('#review-back').tap(screen.comment.show);
        $('#review-done').tap(sendReport);
      },

      show: function () {
        screen.showScreen(screen.review);
      }
    },

    send: {
      element: $('#send-screen'),

      init: function () {},

      show: function () {
        screen.showScreen(screen.send);
      }
    },

    send_success: {
      element: $('#send-success-screen'),

      init: function () {
        $('#success-new-report').tap(reload);
      },

      show: function () {
        screen.showScreen(screen.send_success);
      }
    },

    send_fail: {
      element: $('#send-fail-screen'),

      init: function () {
        $('#fail-new-report').tap(reload);
      },

      show: function () {
        screen.showScreen(screen.send_fail);
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

