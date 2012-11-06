(function () {
  var UPDATE_URL =  'http://gistudeng.gg.bg.ut.ee/dev/index.php/receiver/sendLastCategoryRevisionNumber';
  var SEND_URL =    'http://gistudeng.gg.bg.ut.ee/dev/index.php/receiver';

  var last_screen = null;

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
        accuracy: pos.coords.accuracy
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
      };

      return function () {
        navigator.camera.getPicture(success, fail, {
          quality: 50,
          destinationType: camera.format.DATA_URL,
          targetWidth: 1024,
          targetHeight: 1024,
          correctOrientation: true
        });
      };
    }
  };

  var unsent_reports = {
    save: function (report) {
      var list = JSON.parse(localStorage.getItem('unsent-reports'));
      if (list === null) list = {};

      var key = list[report.timestamp] = 'unsent-report-' + report.timestamp;
      var value = JSON.stringify(report);

      localStorage.setItem(key, value);

      localStorage.setItem('unsent-reports', JSON.stringify(list));
    },

    remove: function (key) {
      var list = JSON.parse(localStorage.getItem('unsent-reports'));
      if (list === null) return;

      localStorage.removeItem(list[key]);
      delete list[key];

      localStorage.setItem('unsent-reports', JSON.stringify(list));
    },

    sent_reports: 0,

    sendNext: function () {
      var list = JSON.parse(localStorage.getItem('unsent-reports'));
      if (list === null) return;

      var key;

      var send_success = function () {
        unsent_reports.sent_reports++;
        unsent_reports.remove(key);
        unsent_reports.sendNext();
      };

      for (var next in list) {
        key = next;
        sendReport({
          report: JSON.parse(localStorage.getItem(list[next])),
          quiet: true,
          success: send_success
        });
        return;
      }

      if (unsent_reports.sent_reports > 0) {
        $('#notification').
          text(unsent_reports.sent_reports + ' salvestatud raport' + 
               (unsent_reports.sent_reports > 1 ? 'e' : '') + ' saadetud.').
          addClass('visible');
        setTimeout(function () {
          $('#notification').removeClass('visible');
        }, 3000);
      }
    }
  };

  var categories = {
    categories: {},

    update: function () {
      var last_revision = 0;

      var stored = JSON.parse(localStorage.getItem('categories'));
      if (stored !== null) {
        categories.categories = stored.categories;
        last_revision = stored.last_revision;
      }

      var no_update_start = function () {
        if (last_revision > 0) { // we have some old list of categories
          screen.initAll();
          screen.intro.show();
        } else { // we never got a list of categories
          screen.no_categories.init();
          screen.no_categories.show();
        }
      };

      var update_start = function (res) {
        if (res.lastrevision > last_revision) {
          var to_store = {
            last_revision: res.lastrevision,
            categories: {}
          };

          for (var c = 0; c < res.categories.length; ++c) {
            var category = res.categories[c];
            categories.categories[category.id] = 
              to_store.categories[category.id] = category;
          }
          localStorage.setItem('categories', JSON.stringify(to_store));
        }

        screen.initAll();
        screen.intro.show();

        unsent_reports.sendNext();
      };

      var network_state = navigator.connection.type;

      if (network_state !== Connection.NONE) {
        $.ajax({
          url: UPDATE_URL,
          type: 'POST',
          data: {'lastrevision': last_revision},
          dataType: 'json',
          timeout: 10000,
          success: update_start,
          error: no_update_start
        });
      } else {
        no_update_start();
      }
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
      // Disabled to due bugginess
      /*
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
      */
    },

    loading: {
      element: $('#loading-screen'),

      init: function () {}
    },

    no_categories: {
      element: $('#no-categories-screen'),

      init: function () {
        $('#no-categories-restart').tap(reload);
      },

      show: function () {
        screen.showScreen(screen.no_categories);
      }
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
      }
    },

    category: {
      element: $('#category-screen'),

      init: function () {
        $('#category-back').tap(screen.photo_review.show);
        $('#category-done').tap(screen.subcategory.show);

        var ul = $('#category-list');
        for (var c in categories.categories) {
          var category = categories.categories[c];
          var li = $('<li data-id="' + category.id + '">' + category.name + '</li>');
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
      },

      show: function () {
        screen.showScreen(screen.category);
      }
    },

    subcategory: {
      element: $('#subcategory-screen'),

      init: function () {
        $('#subcategory-back').tap(screen.category.show);
        $('#subcategory-done').tap(screen.comment.show);
      },

      on_select: function () {
        if (report.subcategory) {
          $('#subcategory-list').children().removeClass('selected');
        }

        $('#subcategory-done').removeAttr('disabled').show();

        var $this = $(this);
        $this.addClass('selected');

        report.subcategory = $this.data('id');
        $('#review-category').text($this.text());
      },

      show: function () {
        var category_id = report.category;
        var category = categories.categories[category_id];

        if (category.subcategories.length < 1) {
          report.subcategory = 0;
          $('#review-category').text(category.name);
          if (screen.current === screen.category) {
            screen.comment.show();
          } else {
            screen.category.show();
          }
        } else {
          var ul = $('#subcategory-list');
          ul.children().remove();
          for (var s in category.subcategories) {
            var subcategory = category.subcategories[s];
            var li = $('<li data-id="' + subcategory.id_sub + '">' + subcategory.name + '</li>');
            li.tap(screen.subcategory.on_select);
            ul.append(li);
          }
          
          $('#subcategory-done').attr('disabled', 'disabled').hide();

          screen.showScreen(screen.subcategory);
        }
      }
    },

    comment: {
      element: $('#comment-screen'),

      init: function () {
        $('#comment-back').tap(screen.subcategory.show);
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
        $('#review-done').tap(function () {
          report.timestamp = Math.round(+new Date() / 1000);
          geolocation.disable();
          sendReport({
            report: report,
            quiet: false,
            fail: function (report) {
              unsent_reports.save(report);
            }
          });
        });
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

  var sendReport = function (args) {
    if (!args.quiet) screen.send.show();

    var send_fail = function () {
      if (!args.quiet) screen.send_fail.show();
      if (args.fail !== null) args.fail(args.report);
    };

    var send_success = function (res) {
      if (res.result === 'success') {
        if (!args.quiet) screen.send_success.show();
        if (args.success !== null) args.success(args.report);
      } else {
        send_fail();
      }
    };

    $.ajax({
      url: SEND_URL,
      type: 'POST',
      data: args.report,
      dataType: 'json',
      timeout: 20000,
      success: send_success,
      error: send_fail
    });
  };

  var reload = function () {
    document.location = 'index.html';
  };
})();

