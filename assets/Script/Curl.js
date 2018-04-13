cc.Class({
    extends: cc.Component,

    properties: {
        Speed: 0,
        xRatio: 0,
        yRatio: 0,
        deaccel: 0,
        playerID: 0,
        game: {
            type: cc.Node,
            default: null
        },
        inCollide: false
    },

    CheckXCollision: function() {

    },

    CheckYCollision: function() {

    },

    onCollisionEnter: function (other, self) {
        if(this.inCollide) return;
        if(other.node.group == "borderDown") {
            if(self.node.y > other.node.y) {
                cc.log("destroying");
                self.node.destroy();
            }
            else return;
        }
        this.inCollide = true;
        var selfPoints = self.world.points;
        var otherPoints = other.world.points;
        var dx = self.node.x - other.node.x;
        var dy = self.node.y - other.node.y;
        dx = Math.abs(Math.abs(dx) - self.node.width / 2 - other.node.width / 2);
        dy = Math.abs(Math.abs(dy) - self.node.height / 2 - other.node.height / 2);
        // cc.log(Math.abs(Math.abs(dx) - self.node.width / 2 - other.node.width / 2));
        if(dx < dy)
            //collision on the vertical edges
            this.xRatio = -this.xRatio;
        else
            //collision on the horizontal edges
            this.yRatio = -this.yRatio;
        var manager = cc.director.getCollisionManager();
        manager.enabled = false;
        manager.enabled = true;
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad()
    {

    },

    start() {

    },

    update(dt) {
        if (Math.abs(this.Speed) > this.deaccel * dt) {
            this.Speed = (Math.abs(this.Speed) - this.deaccel * dt) * Math.abs(this.Speed) / this.Speed;
        } else {
            this.Speed = 0;
            this.game.spawnBlock(this.node.position, this.node, this.playerID);
        }
        this.node.x += this.Speed * dt * this.xRatio;
        this.node.y += this.Speed * dt * this.yRatio;
        this.inCollide = false;

        // should add a mechanism that checks if the curling is outside the canvas
        // wait... is that possible?
    },
});
