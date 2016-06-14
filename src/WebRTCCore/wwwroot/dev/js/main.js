var main = (function () {
    //var videoPlayer = $('#video-src');

    var videoPlayer = document.getElementById('video-src');

    var constraints = {
        audio: true,
        video: true
    };

    function createVideoStream() {
        navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
            videoPlayer.src = URL.createObjectURL(stream);
        }).catch(function (err) {
            console.error(err);
        });
    }

    return {
        createStream: createVideoStream
    };
})();