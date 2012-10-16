(function () {
  var UPDATE_URL = 'http://gistudeng.gg.bg.ut.ee/dev/index.php/receiver/sendLastCategoryRevisionNumber';
  var SEND_URL = 'http://gistudeng.gg.bg.ut.ee/Report_Collector/index.php/receiver';

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
      // TODO: actually update categories
      /*
      categories.list = [
        {id: 1, name_et: 'Kodu', name_en: 'Home', name_ru: 'Дома'},
        {id: 2, name_et: 'Reostus', name_en: 'Pollution', name_ru: 'Загрязнение'},
        {id: 3, name_et: 'Vandalism', name_en: 'Vandalism', name_ru: 'Вандализм'},
        {id: 4, name_et: 'Uputus', name_en: 'Flooding', name_ru: 'Затопление'},
        {id: 5, name_et: 'Katmata kaevud', name_en: 'Open manhole', name_ru: 'Открытый люк'},
        {id: 6, name_et: 'Asfaldis auk', name_en: 'Pothole', name_ru: 'Яма в асфальте'},
        {id: 7, name_et: 'Prügi', name_en: 'Garbage', name_ru: 'Мусор'}
      ];
      */
      var last_revision = 1;
      $.post(UPDATE_URL, {'lastrevision': last_revision}, function (res) {
        if (res.slice(-1)[0].lastrevision != last_revision) {
          var l = res.length - 1;
          for (var c = 0; c < l; ++c) {
            categories.list.push(res[c]);
          }
        }
        screen.initAll();
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

    take_photo: {
      init: function () {
        $('#take-photo').on('tap', camera.takePhoto(
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
        $('#photo-review-retry').on('tap', camera.takePhoto(
          screen.photo_review.show_success, screen.photo_review.show_fail
        ));

        $('#photo-review-done').on('tap', screen.category.show);
      },

      show_success: function (photo_data) {
        report.photo = 'data:image/jpeg;base64,' + photo_data;

        $('#photo-review-title').text('Is this photo suitable?');
        $('.review-photo').attr('src', report.photo).show();

        $('#photo-review-done').show();

        $('.screen').hide();
        $('#photo-review-screen').show();
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
        $('#category-back').on('tap', screen.photo_review.show_last);
        $('#category-done').on('tap', screen.comment.show);

        var ul = $('#category-list');
        for (var c in categories.list) {
          var category = categories.list[c];
          var li = $('<li data-id="' + category.id + '">' + category['name_' + language] + '</li>');
          li.on('tap', screen.category.on_select);
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
        $('#comment-back').on('tap', screen.category.show);
        $('#comment-done').on('tap', screen.comment.update_and_show_review);
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
        $('#review-back').on('tap', screen.comment.show);
        $('#review-done').on('tap', sendReport);
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
        $('#success-new-report').on('tap', reload);
      },

      show: function () {
        $('.screen').hide();
        $('#send-success-screen').show();
      }
    },

    send_fail: {
      init: function () {
        $('#fail-new-report').on('tap', reload);
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
  }
)();
