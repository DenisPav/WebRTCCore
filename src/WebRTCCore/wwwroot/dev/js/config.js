class Config {
    settings(){
        return {
            errorHandler: (err) => { 
                console.log(err);
            },
            socketUrl: this.createSocketUrl()
        }
    }

    createSocketUrl(){
        var secure = window.location.protocol === 'https:' ? true : false;

        var url = window.location.hostname;

        if(window.location.port)
            url += ':' + window.location.port;

        return secure ? 'wss://' + url : 'ws://' + url;
    }
}

const inst = new Config().settings();

export {inst as Config}