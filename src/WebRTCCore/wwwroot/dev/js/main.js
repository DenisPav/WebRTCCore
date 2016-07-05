import Adapter from 'webrtc-adapter';
import {Config} from './config.js';
import {Socket} from './socket.js';

class WebRTC {
    constructor() {
        this.peerConnectionSettings = {
            'iceServers': [
                { 'urls': 'stun:stun.services.mozilla.com' },
                { 'urls': 'stun:stun.l.google.com:19302' },
            ]
        };

        this.videoPlayer = document.getElementById('video-src');
        this.remotePlayer = document.getElementById('remote-src');       

        this.localConstraints = {
            audio: false,
            video: true
        };

        this.remoteConstraints = {
            audio: true,
            video: true
        };

        this.socket = new Socket(this.createSocketHandler());
    }

    createSocketHandler(){
        return (message) => { 
            var parsed = JSON.parse(message.data);
            console.log(parsed);
            
            if(parsed.closed){
                this.remotePlayer.src = '';

                this.peerConnection.close();

                delete this.peerConnection;
            }

            if (!this.id) {
                this.id = parsed.id;
            }

            if (!this.peerConnection) {
                this.createVideoStream().then((stream) => {
                    this.localStream = stream;
                    this.videoPlayer.src = URL.createObjectURL(stream);
                    this.startRemoteStream(false);
                }).catch(Config.errorHandler);
            }

            if (parsed.id !== this.id) {
                if (parsed.sdp) {
                    this.peerConnection.setRemoteDescription(new RTCSessionDescription(parsed.sdp)).then(() => {
                        if (parsed.sdp.type == 'offer') {
                            this.peerConnection.createAnswer().then((description) => {
                                this.peerConnection.setLocalDescription(description).then(() => {
                                    this.socket.send(JSON.stringify({ sdp: this.peerConnection.localDescription, id: this.id }));
                                }).catch(Config.errorHandler);
                            }).catch(Config.errorHandler);
                        }
                    }).catch(Config.errorHandler);
                } else if (parsed.ice) {
                    
                    this.peerConnection.addIceCandidate(new RTCIceCandidate(parsed.ice)).catch(Config.errorHandler);
                    
                }
            }
        
        }; 
    };

    createVideoStream() {
        return navigator.mediaDevices.getUserMedia(this.localConstraints);
    }

    startRemoteStream(isCaller) {
        try {
            this.peerConnection = new RTCPeerConnection(this.peerConnectionSettings);
            this.peerConnection.onicecandidate = (ice) => {
                this.socket.send(JSON.stringify({ ice: ice.candidate, id: this.id }));
            };
            this.peerConnection.onaddstream = (data) => {
                this.remotePlayer.src = URL.createObjectURL(data.stream, this.remoteConstraints);
            };

            this.peerConnection.addStream(this.localStream);

            if (isCaller) {
                this.peerConnection.createOffer().then((description) => {
                    this.peerConnection.setLocalDescription(description).then(() => {
                        this.socket.send(JSON.stringify({ sdp: this.peerConnection.localDescription, id: this.id }));
                    });
                }).catch(Config.errorHandler);
            }
        } catch (ex) {
            Config.errorHandler(ex);
        }
    }

    closeCall(){
        this.remotePlayer.src = '';

        this.peerConnection.close();

        this.startRemoteStream(false);

        this.socket.send(JSON.stringify({ id: this.id, closed: true }));
    }
}

export {WebRTC};