import {WebRTC} from './main.js';

var rtc = new WebRTC();

$(() => {
    $(document).on('click', '#start-call', (e) => {
        e.preventDefault();

        rtc.startRemoteStream(true);
    });

    $(document).on('click', '#close-call', (e) => {
        e.preventDefault();

        rtc.closeCall();
    });
});