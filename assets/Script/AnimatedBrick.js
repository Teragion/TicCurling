const BLOCK_WIDTH = 63;

cc.Class({
    extends: cc.Component,

    properties: {
        size: 0.5,
        piTime: 0,
    },

    getSizeChange: function(dt) {
        this.piTime += dt;
        var dSize = (0.4 - this.piTime) * (0.5 / 1.5);
        return dSize;  
    },

    updateSprite: function() {
        this.node.width = BLOCK_WIDTH * this.size;
        this.node.height = BLOCK_WIDTH * this.size;
        this.node.opacity = 255 - 100 * this.size;
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    update (dt) {
        var dSize = this.getSizeChange(dt);
        this.size += dSize;
        this.updateSprite();
        // cc.log(this.piTime);
        if(this.piTime >= 0.8) this.node.destroy();
    },
});
