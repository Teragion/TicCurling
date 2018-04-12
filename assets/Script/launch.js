cc.Class({
    extends: cc.Component,

    properties: {
        launch: {
            type: cc.Node,
            default: null
        },
        touched: false
    },

    setInputControlTouch: function () {
        this.launch.on(cc.Node.EventType.TOUCH_START, function (event){
            this.touched = true;
        }, this.launch);
        this.launch.on(cc.Node.EventType.TOUCH_CANCEL, function (event){
            this.touched = false;
        }, this.launch);
        this.launch.on(cc.Node.EventType.TOUCH_END, function (event){
            this.touched = false;
        }, this.launch);
    },

    start () {

    },

    onLoad() {
        this.setInputControlTouch();
    }

});
