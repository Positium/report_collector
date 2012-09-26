(function () {
  var source;
  var format;

  var watch;

  var onDeviceReady = function () {
    source = navigator.camera.PictureSourceType;
    format = navigator.camera.DestinationType;

    $('#take-photo').on('tap', takePhoto);
    $('#photo').append('Ready');

    watch = navigator.geolocation.watchPosition(onGeoSuccess, onGeoFail, {
      enableHighAccuracy: true
    });
  };

  var onGeoSuccess = function (position) {
    $('#geo').text('lat: ' + position.coords.latitude + 
                   ', lng: ' + position.coords.longitude + 
                   ', acc: ' + position.accuracy +
                   ', time: ' + position.timestamp
                  );
  };

  var onGeoFail = function (error) {
    $('#geo').text('Geolocation fail, code: ' + error.code + ', msg: ' + error.message);
  };

  var onPhotoSuccess = function (data) {
    $('#photo').children().remove();
    $('#photo').append('<img style="width: 100%" src="data:image/jpeg;base64,' + data + '" />');
  };

  var onPhotoFail = function (result) {
    $('#photo').children().remove();
    $('#photo').append('<p>Failed to take a photo: ' + result + '</p>');
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
  
  document.addEventListener('deviceready', onDeviceReady, false);
})();
