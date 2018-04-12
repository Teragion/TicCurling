const DOT_SPACING = 50;
const LAUNCH_POS_Y = 297;
const BLOCK_WIDTH = 63;
const BLOCK_SEQ = [[-1, 1], [1, 1], [1, -1], [-1, 1]];
Array.prototype.contains = function ( needle ) {
    for (i in this) {
      if (this[i].toString() == needle.toString()) return true;
    }
    return false;
}

cc.Class({
    extends: cc.Component,

    properties: {
        launch: {
            type: cc.Node,
            default: null
        },
        game: {
            type: cc.Node,
            default: null
        },
        draw: {
            default: null
        },
        curlPrefab: {
            default: null,
            type: cc.Prefab
        },
        brickPrefab: {
            default: null,
            type: cc.Prefab
        },
        animatedBrickPrefab: {
            default: null,
            type: cc.Prefab
        },
        borderVerticalPrefab: {
            default: null,
            type: cc.Prefab
        },
        borderHorizontalPrefab: {
            default: null,
            type: cc.Prefab
        },
        summaryPanelPrefab: {
            default: null,
            type: cc.Prefab
        },
        playerID: 0,
        blockArray: [],
        // rewrite this to be the 2-d Array! immediately!
        blockMap: [],
        // should be written as (yIndex, xIndex)
        mapWidth: 8, // unit: blocks, should be a even number
        mapHeight: 0 // unit: blocks
    },

    setInputControlTouch: function () {
        // initiate the touch control listeners 
        var launch = this.launch.getComponent('launch');
        this.node.on(cc.Node.EventType.TOUCH_START, function (event){
            var point = this.game.convertTouchToNodeSpace(event);
            point = this.game.convertToNodeSpaceAR(point);
            point.y += (667 - LAUNCH_POS_Y);
            // cc.log(point.x);
            // cc.log(point.y);
            if(this.launch.touched == true) {
                this.drawDots(point.x, point.y);
            }
        }, this);

        this.game.on(cc.Node.EventType.TOUCH_MOVE, function (event){
            if(this.launch.touched == true) {
                var point = this.game.convertTouchToNodeSpace(event);
                point = this.game.convertToNodeSpaceAR(point);
                point.y += (667 - LAUNCH_POS_Y);
                this.drawDots(point.x, point.y);
            }
        }, this);

        this.game.on(cc.Node.EventType.TOUCH_END, function (event){
            this.draw.clear();
        }, this);

        this.game.on(cc.Node.EventType.TOUCH_CANCEL, function (event){
            this.draw.clear();
            var point = this.game.convertTouchToNodeSpace(event);
            point = this.game.convertToNodeSpaceAR(point);
            point.y += (667 - LAUNCH_POS_Y);
            this.spawnCurl(point);
        }, this);
    },

    drawDots: function(x, y) {
        // drawing a line of dots marking the pulling direction
        // To do: to add a line indicating the launching direction
        // cc.log("drawDots...");
        this.draw.clear();
        var dotNumber = Math.sqrt(x * x + y * y);
        dotNumber = Math.round(dotNumber / DOT_SPACING);
        var xStep = x / dotNumber;
        var yStep = y / dotNumber;
        for (var i = 0; i < dotNumber; i++) {
            var point = this.game.convertToWorldSpaceAR(cc.v2(i * xStep, i * yStep - (667 - LAUNCH_POS_Y)));
            this.draw.drawDot(point, 6, new cc.Color(0, 0, 0, 255));
        }
    },

    getBlockTag: function(xIndex, yIndex) {
        return xIndex * 100 + yIndex;
    },

    checkBlockOwnership: function(xIndex, yIndex) {
        // checks if nearby blocks are owned by the same player
        // NEED TO ADD ANOTHER PARAMETER (PLAYER) AND RESPECTIVE CODE
        // return value: UPPER_LEFT: 1, UPPER_RIGHT: 2
        //               LOWER_RIGHT: 4, LOWER_LEFT: 8
        var return_val = 0;
        if(this.blockArray.contains([xIndex, yIndex + 1])) {
            if(this.blockArray.contains([xIndex - 1, yIndex])) 
                return_val += 1;
            if(this.blockArray.contains([xIndex + 1, yIndex]))
                return_val += 2;
        }
        if(this.blockArray.contains([xIndex, yIndex - 1])) {
            if(this.blockArray.contains([xIndex - 1, yIndex])) 
                return_val += 8;
            if(this.blockArray.contains([xIndex + 1, yIndex]))
                return_val += 4;
        }
        cc.log(return_val);
        return return_val;
    },

    spawnBloc: function(xIndex, yIndex, playerID = 1) {
        // check and spawn other blocks 
        // var blocksToSpawn = this.checkBlockOwnership(xIndex, yIndex);
        //     for(var i = 0; i < 4; i++) {
        //         if(blocksToSpawn == 0) break;
        //         if(blocksToSpawn % 2 == 1) {
        //             this.spawnBlockByIndex(xIndex + BLOCK_SEQ[i][0], yIndex + BLOCK_SEQ[i][1]);
        //             blocksToSpawn -= 1;
        //         }
        //         blocksToSpawn /= 2;
        //     }
        cc.log("checking");
        for(var dy = -1; dy < 2; dy++) {
            for(var dx = -1; dx < 2; dx++) {
                if(dy == 0 && dx == 0) continue;
                if(xIndex + dx < 0 || xIndex + dx > this.mapWidth ||
                    yIndex + dy < 0 || yIndex + dy > this.mapHeight)
                    continue;
                // cc.log(dx + " " + dy);
                if(dy == dx || dy == -dx)
                    if(this.blockMap[yIndex + dy][xIndex] == playerID && 
                        this.blockMap[yIndex][xIndex + dx] == playerID)
                        this.spawnBlockByIndex(xIndex + dx, yIndex + dy);
                if(dx == 0)
                    if((this.blockMap[yIndex + dy][xIndex - 1] == playerID && 
                        this.blockMap[yIndex][xIndex - 1] == playerID) ||
                       (this.blockMap[yIndex + dy][xIndex + 1] == playerID && 
                        this.blockMap[yIndex][xIndex + dx + 1] == playerID))
                        this.spawnBlockByIndex(xIndex + dx, yIndex + dy);
                if(dy == 0)
                    if((this.blockMap[yIndex - 1][xIndex + dx] == playerID && 
                        this.blockMap[yIndex - 1][xIndex] == playerID) ||
                       (this.blockMap[yIndex + 1][xIndex + dx] == playerID && 
                        this.blockMap[yIndex + 1][xIndex] == playerID))
                        this.spawnBlockByIndex(xIndex + dx, yIndex + dy);
            }
        }
    },

    ifEnd: function(yIndex) {
        var i;
        for(i = 0; i < this.mapWidth; i++) 
            if(this.blockMap[yIndex][i] == 0)
                break;
        cc.log(i);
        if(i == this.mapWidth)
            this.matchEnds();
    },

    matchEnds: function() {
        var panel = cc.instantiate(this.summaryPanelPrefab);
        this.node.addChild(panel);
        panel.setPosition(cc.v2(0,0));
    },

    // convertToLocal: function(point) {
    //     return cc.v2((point.x - this.node.width / 2), (point.y - LAUNCH_POS_Y));
    // },

    // convertToWorld: function(point) {
    //     return cc.v2((point.x + this.node.width / 2), (point.y + LAUNCH_POS_Y));
    // },

    spawnCurl: function(point) {
        var newCurl = cc.instantiate(this.curlPrefab);
        this.node.addChild(newCurl);
        newCurl.setPosition(cc.v2(0, -(667 - LAUNCH_POS_Y)));
        var Curl = newCurl.getComponent('Curl');
        Curl.Speed = Math.sqrt(point.x * point.x + point.y * point.y) * 3;
        Curl.xRatio = -(3 * point.x) / Curl.Speed;
        Curl.yRatio = -(3 * point.y) / Curl.Speed;
        Curl.game = this;
    },

    spawnBlock: function(point, curl) {
        //deleting the existing curling
        curl.destroy();
        //spawn blocker
        var xIndex = Math.round((point.x + BLOCK_WIDTH / 2) / BLOCK_WIDTH);
        var yIndex = Math.round((point.y + BLOCK_WIDTH / 2) / BLOCK_WIDTH);
        this.spawnBlockByIndex(xIndex + this.mapWidth / 2 - 1, yIndex - 1);
    },

    spawnBlockByIndex: function(xIndex, yIndex, playerID = 1) {
        var blockPosition;
        var xCenteredIndex = xIndex + 1 - this.mapWidth / 2;
        var yCenteredIndex = yIndex + 1;
        if(!this.blockArray.contains([xIndex, yIndex])) {
            cc.log("spawning at" + xIndex + " " + yIndex);
            blockPosition = cc.v2(BLOCK_WIDTH * xCenteredIndex - BLOCK_WIDTH / 2,
                BLOCK_WIDTH * yCenteredIndex - BLOCK_WIDTH / 2);
            var animation = cc.instantiate(this.animatedBrickPrefab);
            this.node.addChild(animation);
            animation.setPosition(blockPosition);
            var newBlock = cc.instantiate(this.brickPrefab);
            this.node.addChild(newBlock);
            newBlock.setPosition(blockPosition);
            newBlock.tag = this.getBlockTag(xIndex, yIndex);
            this.blockArray.push([xIndex, yIndex]);
            this.blockMap[yIndex][xIndex] = playerID;
            this.spawnBloc(xIndex, yIndex, 1);
            // if(this.blockArray.contains([xIndex + 1, yIndex]))
            // this.spawnBloc(xIndex + 1, yIndex);
            // if(this.blockArray.contains([xIndex - 1, yIndex]))
            // this.spawnBloc(xIndex - 1, yIndex);
            // if(this.blockArray.contains([xIndex, yIndex + 1]))
            // this.spawnBloc(xIndex, yIndex + 1);
            // if(this.blockArray.contains([xIndex, yIndex - 1]))
            // this.spawnBloc(xIndex, yIndex - 1);
            this.ifEnd(yIndex);
            cc.log(this.blockMap);
        }
    },

    spawnBorderVertical: function() {
        var oneSideDistance = this.mapWidth / 2 * BLOCK_WIDTH;
        cc.log(oneSideDistance);
        var borderLeft = cc.instantiate(this.borderVerticalPrefab);
        this.node.addChild(borderLeft);
        borderLeft.setPosition(cc.v2(-oneSideDistance, 0));
        var borderRight = cc.instantiate(this.borderVerticalPrefab);
        this.node.addChild(borderRight);
        borderRight.setPosition(cc.v2(oneSideDistance, 0));
    },

    spawnBorderDown: function() {
        var Distance = this.node.height / 2 - this.mapHeight * BLOCK_WIDTH - 5;
        var borderDown = cc.instantiate(this.borderHorizontalPrefab);
        this.node.addChild(borderDown);
        borderDown.setPosition(cc.v2(0, Distance));
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.setInputControlTouch();
        this.draw = new cc.DrawNode();
        cc.Canvas.instance.node.parent._sgNode.addChild(this.draw);
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        for(var i = 0; i < this.mapHeight; i++) {
            this.blockMap[i] = new Array(this.mapWidth);
            for(var j = 0; j < this.mapWidth; j++)
                this.blockMap[i][j] = 0;
        }
        // cc.log(this.blockMap);
        cc.view.enableAntiAlias(true);
        this.spawnBorderVertical();
        this.spawnBorderDown();
    },

    start () {

    },

    // update (dt) {},
});
