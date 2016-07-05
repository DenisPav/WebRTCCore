import {Config} from './config.js';

class Socket {
    constructor(onMessage, onOpen, onClose, onError) {
        this.socket = new WebSocket(Config.socketUrl);
        this.assignCallbacks(onMessage, onOpen, onClose, onError);
    }

    assignCallbacks(onMsg, onOpen, onClose, onError){
        this.socket.onmessage = onMsg;
        this.socket.onopen = onOpen;
        this.socket.onclose = onClose;
        this.socket.onerror = onError;
    }

    send(data){
        this.socket.send(data);
    }
}

export {Socket};