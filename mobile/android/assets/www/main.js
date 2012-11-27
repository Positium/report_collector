// Android 2.1 fallback
Object.keys = Object.keys || function(o) {
    var result = [];
    for (var name in o) {
        if (o.hasOwnProperty(name))
          result.push(name);
    }
    return result;
};

// Fixes illegal access on gingerbread
JSON._parse = JSON.parse;

JSON.parse = function (text) {
  if (text) {
    return JSON._parse(text);
  } else {
    return null;
  }
};

// Fixes swipes
(function($){
  $.fn.betterTouch = function (options) {
    var defaults = {
      threshold: 40,
      swipe_right: function () {},
      swipe_left: function () {}
    };
    options = $.extend(defaults, options);
    
    return this.each(function () {
      var me = this;
      var touch = {
        active: false,
        x: 0,
        y: 0,
        deltaX: 0,
        deltaY: 0
      };

      var onPressEvent = function (event) {
        var onPress= function (event) {
          touch.active = true;
          touch.x = parseInt(event.clientX, 10);
          touch.y = parseInt(event.clientY, 10);
          touch.deltaX = touch.deltaY = 0;
        };
        
        var onMove = function (event, e) {
          var cx = event.clientX;
          var cy = event.clientY;


          if (Math.abs(touch.x - cx) > Math.abs(touch.y - cy) &&
              e && e.preventDefault) e.preventDefault();
          
          if (touch.active){
            touch.deltaX = touch.x - cx;
            touch.deltaY = touch.y - cy;
          }
        };
        
        var onRelease = function (event) {  
          if (Math.abs(touch.deltaX) > Math.abs(touch.deltaY)) {
            if (touch.deltaX > options.threshold) {
              options.swipe_right();
            }
            if (touch.deltaX < -options.threshold) {
              options.swipe_left();
            }
          }
          touch.active = false;
          touch.deltaX = touch.deltaY = 0;
        };
        
        switch(event.type) {
          case "touchstart": onPress(event.targetTouches[0]); break;
          case "touchmove": onMove(event.targetTouches[0], event); break;
          case "touchend": onRelease(event.targetTouches[0]); break;
          case "touchcancel": onRelease(event.targetTouches[0]); break;
          case "touchleave": onRelease(event.targetTouches[0]); break;
        }
      };

      me.ontouchstart = onPressEvent;
      me.ontouchmove = onPressEvent;
      me.ontouchend = onPressEvent;
      me.ontouchcancel = onPressEvent;
      me.ontouchleave = onPressEvent;
    });
  }; 
})(Zepto);

// Main
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
        screen.from = 'right';
        callback(null, data);
      };

      var fail = function (error) {
        screen.from = 'right';
        callback(error);
      };

      return function () {
        navigator.camera.getPicture(success, fail, {
          quality: 70,
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
          success: send_success,
          fail: null
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
        navigator.geolocation.getCurrentPosition(function (position) {
          $.ajax({
            url: UPDATE_URL,
            type: 'POST',
            data: {
              lastrevision: last_revision,
              geolocation: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
              }
            },
            dataType: 'json',
            timeout: 10000,
            success: update_start,
            error: no_update_start
          });
        }, no_update_start);
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

      var pixel_ratio = window.devicePixelRatio;
      var font_size = 22;
      if (window.device.platform === 'Android' && pixel_ratio) {
        font_size *= pixel_ratio;
        $('head').append('<style>html, body, div.screen { font: ' + font_size + 'px sans-serif; }');
      }

      report.uuid = window.device.uuid;
      camera.format = navigator.camera.DestinationType;

      screen.current = screen.loading;
      screen.loading.show();
      categories.update();

      $(document).on('backbutton', confirm_quit);
    }
  };

  $(document).on('deviceready', device.on_ready);

  var screen = {
    initAll: function () {
      for (var s in screen) {
        if (screen[s] !== null && typeof screen[s] === 'object' && 'element' in screen[s]) {
          screen[s].init();
          screen.setActions(screen[s]);
        }
      }
    },

    current: null,
    in_transition: false,
    from: 'right',

    showScreen: function (new_screen) {
      if (new_screen !== screen.current && !screen.in_transition) {
        if (!$.fx.off && screen.from === 'left' || screen.from === 'right') {
          screen.in_transition = true;

          var z_index_before = new_screen.element.css('z-index');
          new_screen.element.css({
            '-webkit-transform': 'translateX' + (screen.from === 'left' ? '(-100%)' : '(100%)'),
            'z-index': z_index_before + 1
          }).show();

          var anim_done = false;
          var anim_time = 175;
          var anim_callback = function () {
            if (!anim_done) {
              anim_done = true;
              screen.current.element.hide();
              new_screen.element.css('z-index', z_index_before);
              screen.current = new_screen;
              screen.in_transition = false;
            }
          };

          new_screen.element.animate({translateX: 0}, anim_time, 'linear', anim_callback);
        } else {
          new_screen.element.show();
          screen.current.element.hide();
          screen.current = new_screen;
        }
      }
    },

    setActions: function (for_screen) {
      var button_left = for_screen.element.find('.button-left');
      var button_right = for_screen.element.find('.button-right');

      var action_left = function () {};
      var action_right = action_left;

      if (button_left.length !== 0) {
        button_left.on('tap', for_screen.left_action);
        action_left = function () {
          if (!button_left.attr('disabled')) button_left.trigger('tap');
        };
      }

      if (button_right.length !== 0) {
        button_right.on('tap', for_screen.right_action);
        action_right = function () {
          if (!button_right.attr('disabled')) button_right.trigger('tap');
        };
      }
      
      for_screen.element.betterTouch({
        swipe_left: action_left,
        swipe_right: action_right
      });

      var preventer = function (event) {
        event.preventDefault();
        event.stopPropagation();
      };
    },

    loading: {
      element: $('#loading-screen'),

      init: function () {},

      show: function () {
        screen.loading.element.show();
      }
    },

    no_categories: {
      element: $('#no-categories-screen'),
      
      left_action: reload,

      init: function () {
      },

      show: function () {
        screen.showScreen(screen.no_categories);
      }
    },

    intro: {
      element: $('#intro-screen'),
      
      right_action: function () { 
        screen.from = 'right';
        screen.take_photo.show();
      },

      init: function () {
      },

      show: function () {
        if (screen.current === screen.loading && localStorage.getItem('intro_shown')) {
          screen.take_photo.show();
        } else {
          localStorage.setItem('intro_shown', 'true');
          screen.showScreen(screen.intro);
        }
      }
    },

    take_photo: {
      element: $('#take-photo-screen'),
      
      left_action: function () {
        screen.from = 'left';
        screen.intro.show();
      },

      init: function () {
        $('#take-photo').on('tap', camera.takePhoto(screen.photo_review.show));
      },

      show: function () {
        screen.showScreen(screen.take_photo);
      }
    },

    photo_review: {
      element: $('#photo-review-screen'),

      left_action: function () {
        screen.from = 'left';
        screen.take_photo.show();
      },

      right_action: function () {
        screen.from = 'right';
        screen.category.show();
      },
      
      right_button: $('#photo-review-screen').find('.button-right').first(),

      init: function () {
      },

      show: function (error, photo_data) {
        if (error && !(error instanceof Event)) {
          report.photo = null;
          $('#photo-review-title').text('Viga pildi tegemisel: ' + error);
          $('.review-photo').hide();
          screen.photo_review.right_button.attr('disabled', 'disabled').hide();
        } else if (photo_data) {
          report.photo = 'data:image/jpeg;base64,' + photo_data;
          $('#photo-review-title').text('Kas see pilt sobib?');
          $('.review-photo').attr('src', report.photo).show();
          screen.photo_review.right_button.removeAttr('disabled').show();
        }

        screen.showScreen(screen.photo_review);
      }
    },

    category: {
      element: $('#category-screen'),
        
      left_action: function () {
        screen.from = 'left';
        screen.photo_review.show();
      },

      right_action: function () {
        screen.from = 'right';
        screen.subcategory.show();
      },

      right_button: $('#category-screen').find('.button-right').first(),

      init: function () {
        var ul = $('#category-list');
        for (var c in categories.categories) {
          var category = categories.categories[c];
          var li = $('<li data-id="' + category.id + '">' + category.name + '</li>');
          li.on('tap', screen.category.on_select);
          ul.append(li);
        }
        
        screen.category.right_button.attr('disabled', 'disabled').hide();
      },

      on_select: function () {
        if (report.category) {
          $('#category-list').children().removeClass('selected');
        }

        screen.category.right_button.removeAttr('disabled').show();

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
        
      left_action: function () {
        screen.from = 'left';
        screen.category.show();
      },

      right_action: function () {
        screen.from = 'right';
        screen.comment.show();
      },

      right_button: $('#subcategory-screen').find('.button-right').first(),

      init: function () {
      },

      on_select: function () {
        if (report.subcategory) {
          $('#subcategory-list').children().removeClass('selected');
        }

        screen.subcategory.right_button.removeAttr('disabled').show();

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
            li.on('tap', screen.subcategory.on_select);
            ul.append(li);
          }
          
          screen.subcategory.right_button.attr('disabled', 'disabled').hide();

          screen.showScreen(screen.subcategory);
        }
      }
    },

    comment: {
      element: $('#comment-screen'),
        
      left_action: function () {
        screen.from = 'left';
        screen.subcategory.show();
      },

      right_action: function () {
        screen.from = 'right';
        screen.comment.update_and_show_review();
      },

      init: function () {
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
      
      left_action: function () {
        screen.from = 'left';
        screen.comment.show();
      },

      right_action: function () {
        report.timestamp = Math.round(+new Date() / 1000);
        geolocation.disable();
        sendReport({
          report: report,
          quiet: false,
          fail: function (report) {
            unsent_reports.save(report);
          },
          success: null
        });
      },

      init: function () {
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

      left_action: function () {
        reload();
      },

      init: function () {
      },

      show: function () {
        screen.showScreen(screen.send_success);
        $(document).off('backbutton');
      }
    },

    send_fail: {
      element: $('#send-fail-screen'),

      left_action: function () {
        reload();
      },

      init: function () {
      },

      show: function () {
        screen.showScreen(screen.send_fail);
        $(document).off('backbutton');
      }
    }
  };

  var sendReport = function (args) {
    if (!args.quiet) {
      screen.from = 'right';
      screen.send.show();
    }

    var send_fail = function () {
      if (!args.quiet) {
        screen.from = 'right';
        screen.send_fail.show();
      }
      if (args.fail) args.fail(args.report);
    };

    var send_success = function (res) {
      if (res.result === 'success') {
        if (!args.quiet) {
          screen.from = 'right';
          screen.send_success.show();
        }
        if (args.success) args.success(args.report);
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

  var confirm_quit = function () {
    if (confirm('Väljuda? Pooleli teade kaob.')) {
      geolocation.disable();
      navigator.app.exitApp();
    }
    return false;
  };
})();

