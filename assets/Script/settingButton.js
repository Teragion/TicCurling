cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    settingButtonCallback() {
        cc.director.loadScene("SettingScene");
    },

    aboutButtonCallback() {
        cc.director.loadScene("AboutScene");
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // update (dt) {},
});
