(function () {
  var api_url = 'http://home.pauleller.eu';

  var source;
  var format;

  var watch;

  var position = null;
  var report = {};
  var image = null;

  var onDeviceReady = function () {
    source = navigator.camera.PictureSourceType;
    format = navigator.camera.DestinationType;

    $('#take-photo').on('tap', takePhoto);
    $('#send-report').on('tap', sendReport);

    watch = navigator.geolocation.watchPosition(onGeoSuccess, onGeoFail, {
      enableHighAccuracy: true
    });
  };

  var onGeoSuccess = function (pos) {
    position = pos;
  };

  var onGeoFail = function (error) {
    position = null;
  };

  var onPhotoSuccess = function (data) {
    image = data;
    $('#send-report').show();

    $('#photo').text('');
    $('#photo').children().remove();
    $('#photo').append('<img style="width: 100%" src="data:image/jpeg;base64,' + data + '" />');
  };

  var onPhotoFail = function (result) {
    $('#send-report').hide();
    $('#photo').children().remove();
    $('#photo').text('Failed to take a photo: ' + result);
  };

  var takePhoto = function () {
    navigator.camera.getPicture(onPhotoSuccess, onPhotoFail, {
      quality: 50,
      destinationType: format.DATA_URL,
      targetWidth: 1024,
      targetHeight: 1024,
      correctOrientation: true
    });
  };

  var sendReport = function () {
    if (!image) {
      alert('Cannot send a report without a photo!');
      return;
    }

    if (!position) {
      alert('Cannot send a report without a location!');
      return;
    }

    report = {
      uuid: device.uuid,
      timestamp: (+new Date() / 1000),
      geolocation: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      },
      photo: 'data:image/jpeg;base64,' + image,
      category: 123,
      comment: $('#comment').val()
    };

    $('#send-report').hide();
    $.post(api_url + '/new', report, function (res) {
      if (res.result === 'success') {
        $('#comment').val('');
        $('#photo').children().remove();
        $('#photo').text('No photo taken');
        alert('Report #' + res.id + ' accepted');
      } else {
        $('#send-report').show();
        alert('Report not sent: ' + res.reason);
      }
    }, 'json');
  };
  
  document.addEventListener('deviceready', onDeviceReady, false);
})();
