// JavaScript Document
var config = [{
    "level": 0,
    "map": [[0, 0, 0, 0, 0, 0, 0], [0, 1, 1, 0, 1, 1, 0], [1, 1, 1, 1, 1, 1, 1], [0, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 0, 0], [0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]]
}, {
    "level": 1,
    "map": [[0, 1, 1, 0, 1, 1, 0], [1, 1, 1, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1], [0, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 0, 0], [0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]]
}, {
    "level": 2,
    "map": [[1, 1, 1, 1, 1, 1, 0], [1, 1, 1, 1, 1, 1, 0], [1, 1, 1, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 1, 1, 1], [0, 1, 1, 1, 1, 1, 1], [0, 1, 1, 1, 1, 1, 1]]
}, {
    "level": 3,
    "map": [[0, 1, 1, 1, 1, 1, 1], [1, 0, 1, 1, 1, 1, 1], [1, 1, 0, 1, 1, 1, 1], [1, 1, 1, 0, 1, 1, 1], [1, 1, 1, 1, 0, 1, 1], [1, 1, 1, 1, 1, 0, 1], [1, 1, 1, 1, 1, 1, 0]]
}, {
    "level": 4,
    "map": [[1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1]]
}];

var resources = [{
        "level": 0,
        "count": 5
}, {
        "level": 1,
        "count": 4
}, {
        "level": 2,
        "count": 3
}, {
        "level": 3,
        "count": 3
}, {
        "level": 4,
        "count": 3
}
]

/*
@global gameController 游戏控制器，提供五个函数接口
    @func void start
        @param void
        	开始新一关游戏
        	Start a new game.
    @func number stop
        @param void
        	结束游戏，返回值为已消除的方块数
        	Stop the game. The return value is the number of squares that have been eliminated.
    @func void pause
        @param void
        	暂停游戏
        	Pause the game.
    @func void resume
        @param void
        	继续游戏
        	Continue from the pause.
    @func void setLevel
        @param number
        	设置当前关卡，参数值为选择的关卡
        	Set the level, the parameter is the selecting level.
    @func void setRatio
        @param number
        	设置缩放，当使用transform:scale时可设置此项以保证正常显示
        	when you use 'transform: scale', you can set this to ensure proper display.

@interface 页面需要实现的接口
    @func void gameFinish
        @param void
        	完成游戏之后的回调函数
        	The callback function of finish the game.
    @array config
    		每关的方格布局样式
    		The style of how blocks display.
    @array resources
    		方块的源文件，命名格式为"f<level><index>.jpg"或"m<level><index>.jpg"
    		The resources of images, name them as "f<level><index>.jpg" or "m<level><index>.jpg".
*/
var gameController = (function () {
    var canvas = document.getElementById('canvas');
    var cxt = canvas.getContext('2d'); //获取画板
    var devicePixelRatio = window.devicePixelRatio || 1,
        backingStoreRatio = cxt.webkitBackingStorePixelRatio ||
        cxt.mozBackingStorePixelRatio ||
        cxt.msBackingStorePixelRatio ||
        cxt.oBackingStorePixelRatio ||
        cxt.backingStorePixelRatio || 1,

        ratio = devicePixelRatio / backingStoreRatio;
    var eleArr = []; //所有元素存放区
    var xCount = 7; //横向多少个元素
    var yCount = 7; //纵向多少个元素
    var block = 0;
    var screenRatio = 1;
    var margin = 2; //元素间距
    var padding = 35;
    var eleSize = 58; //元素大小
    var diff = Infinity; //圆角百分比
    var radius = eleSize / diff; //圆角大小
    var numArr = []; //元素内容
    var pathArr = [];
    var index = 0;
    var thisArr = [];
    var over = (xCount * yCount - block) / 2;
    var key = null;
    var time = 0;
    var name = 'null';
    var level = 0;
    var ctner = document.createElement("div");
    var resType = "ontouchstart" in document ? "touchstart" : "click";
    ctner.style.display = "none";
    var img;
    for (var i = 0; i < resources.length; i++) {
        for (var j = 0; j < resources[i].count; j++) {
            img = document.createElement("img");
            img.src = "images/f" + resources[i].level + j + ".jpg";
            img.id = "f" + resources[i].level + j;
            ctner.appendChild(img);
            img = document.createElement("img");
            img.src = "images/m" + resources[i].level + j + ".jpg";
            img.id = "m" + resources[i].level + j;
            ctner.appendChild(img);
        }
    }
    canvas.appendChild(ctner);

    init(); //界面初始化

    function gameHandle(e) {
        e = e || window.event;
        e.stopPropagation();
        e.preventDefault();
        var x, y;
        if (resType == "touchstart") {
            x = e.touches[0].clientX - canvas.getBoundingClientRect().left;
            y = e.touches[0].clientY - canvas.getBoundingClientRect().top;
        } else {
            x = e.clientX - canvas.getBoundingClientRect().left;
            y = e.clientY - canvas.getBoundingClientRect().top;
        }
        x *= ratio / screenRatio;
        y *= ratio / screenRatio;
        for (var i = 0; i < yCount + 2; i++) {
            for (var j = 0; j < xCount + 2; j++) {
                var thisEle = eleArr[i][j];
                drawRoundByTran(cxt, thisEle.x, thisEle.y, eleSize, eleSize, radius);
                if ((thisEle.num == 'f' || thisEle.isOver) && thisArr.length > 0 && cxt.isPointInPath(x, y)) {
                    restore(thisArr[0], false);
                    thisArr[0].click = false;
                    thisArr.length = 0;
                    continue;
                }
                if (cxt.isPointInPath(x, y) && !thisEle.isOver && thisArr.length !== 2) {
                    restore(thisEle, true);
                    if (!thisEle.click) {
                        thisArr.push(thisEle);
                        thisEle.click = true;
                    } else {
                        restore(thisArr[0], false);
                        thisArr[0].click = false;
                        thisArr.length = 0;
                    }
                    if (thisArr.length == 2) {
                        if ((thisArr[0].num + thisArr[1].num % 2) && ((thisArr[0].num % 2 && thisArr[0].num == thisArr[1].num + 1) || (thisArr[1].num % 2 && thisArr[1].num == thisArr[0].num + 1)) && (lineOver(thisArr) || lineTwo(thisArr) || threeLine(thisArr))) {
                            cxt.fillStyle = '#fff';
                            pathArr.unshift(thisArr[0]);
                            pathArr.push(thisArr[1]);
                            drawLine(cxt, pathArr, '#000');

                            setTimeout(function () {
                                for (var i = 0; i < pathArr.length; i++) {
                                    cxt.restore();
                                    cxt.fillStyle = "#fdfbf0";
                                    cxt.fillRect(pathArr[i].x, pathArr[i].y, eleSize, eleSize);
                                    if (i < pathArr.length - 1) {
                                        cxt.fillRect(Math.min(pathArr[i + 1].x, pathArr[i].x), Math.min(pathArr[i + 1].y, pathArr[i].y), (Math.abs(pathArr[i + 1].xIndex - pathArr[i].xIndex) + 1) * eleSize, (Math.abs(pathArr[i + 1].yIndex - pathArr[i].yIndex) + 1) * eleSize);
                                    }
                                }
                                cxt.restore();
                                thisArr.length = 0;
                                pathArr.length = 0;
                                drawBGLine(cxt, $("#canvas").width(), $("#canvas").height())
                            }, 200);

                            thisArr[0].isOver = true;
                            thisArr[1].isOver = true;
                            over--;
                            if (over <= 0) {
                                canvas.removeEventListener(resType, gameHandle);
                                init();
                                gameFinish();
                            }
                            eliminate();
                        } else {
                            restore(thisArr[0], false);
                            restore(thisArr[1], false);
                            thisArr[0].click = false;
                            thisArr[1].click = false;
                            thisArr.length = 0;
                        }
                    }
                }
            }
        }
    }


    //直线判断
    function lineOver(arr) {
        var ele0 = arr[0];
        var ele1 = arr[1];
        var min;
        var max;
        if (ele0.xIndex == ele1.xIndex) {
            min = Math.min(ele0.yIndex, ele1.yIndex);
            max = Math.max(ele0.yIndex, ele1.yIndex);
            for (var i = min + 1; i < max; i++) {
                if (!eleArr[i][ele0.xIndex].isOver) {
                    return false;
                }
            }
            return true;
        }
        if (ele0.yIndex == ele1.yIndex) {
            min = Math.min(ele0.xIndex, ele1.xIndex);
            max = Math.max(ele0.xIndex, ele1.xIndex);
            for (var i = min + 1; i < max; i++) {
                if (!eleArr[ele0.yIndex][i].isOver) {
                    return false;
                }
            }
            return true;
        }
    }


    //两条线判断
    function lineTwo(arr) {
        var ele0 = eleArr[arr[1].yIndex][arr[0].xIndex];
        var ele1 = eleArr[arr[0].yIndex][arr[1].xIndex];
        if (ele0.isOver && lineOver([ele0, arr[0]]) && lineOver([ele0, arr[1]])) {
            pathArr.push(ele0);
            return true;
        }
        if (ele1.isOver && lineOver([ele1, arr[0]]) && lineOver([ele1, arr[1]])) {
            pathArr.push(ele1);
            return true;
        }

        return false;
    }

    //三线
    function threeLine(arr) {
        var ele0 = arr[0];
        var ele1 = arr[1];
        //x轴向右
        for (var a = ele0.xIndex; a < xCount + 2; a++) {
            var ele = eleArr[ele0.yIndex][a];
            pathArr.push(ele);
            if (ele.isOver && lineOver([ele, ele0]) && lineTwo([ele, ele1])) {
                return true;
            }
            pathArr.pop(ele);
        }
        //x轴向左
        for (var b = ele0.xIndex; b >= 0; b--) {
            var ele = eleArr[ele0.yIndex][b];
            pathArr.push(ele);
            if (ele.isOver && lineOver([ele, ele0]) && lineTwo([ele, ele1])) {
                return true;
            }
            pathArr.pop(ele);
        }
        for (var c = ele0.yIndex; c < yCount + 2; c++) {
            var ele = eleArr[c][ele0.xIndex];
            pathArr.push(ele);
            if (ele.isOver && lineOver([ele, ele0]) && lineTwo([ele, ele1])) {
                return true;
            }
            pathArr.pop(ele);
        }
        for (var d = ele0.yIndex; d >= 0; d--) {
            var ele = eleArr[d][ele0.xIndex];
            pathArr.push(ele);
            if (ele.isOver && lineOver([ele, ele0]) && lineTwo([ele, ele1])) {
                return true;
            }
            pathArr.pop(ele);
        }

        return false;
    }




    //还原
    function restore(obj, bool) {
        if (obj.num % 2)
            var mark = "m" + level + (obj.num - 1) / 2;
        else
            var mark = "f" + level + obj.num / 2;
        drawIcon(cxt, document.getElementById(mark), obj.x, obj.y, eleSize, eleSize);
        if (bool) {
            cxt.globalAlpha = 0.5;
            cxt.fillStyle = "#000";
            cxt.fillRect(obj.x, obj.y, eleSize, eleSize);
            cxt.globalAlpha = 1;
        }
    }
    //动态设置canvas内容；
    function setCanvasSize() {
        var w = $("#canvas").width();
        var h = $("#canvas").height();
        $("#canvas")[0].width = w * ratio;
        $("#canvas")[0].height = h * ratio;
        $("#canvas")[0].style.width = w + "px";
        $("#canvas")[0].style.height = h + "px";
        w = Math.min(w, h);
        eleSize = (w - 2 * padding) / xCount - margin;
        radius = eleSize / diff;
        cxt.scale(ratio, ratio);
    }

    function init() {
        setCanvasSize();
        drawBG(cxt, $("#canvas").width(), $("#canvas").height());
    }

    function generate() {
        index = 0;
        block = 0;
        config[level].map.forEach(function (r) {
            r.forEach(function (c) {
                if (!c) block++;
            })
        })
        randomNum();
        over = (xCount * yCount - block) / 2;
        drawBG(cxt, $("#canvas").width(), $("#canvas").height());
        for (var i = 0; i < yCount + 2; i++) {
            eleArr[i] = [];
            for (var j = 0; j < xCount + 2; j++) {
                var a = i == 0 || j == 0 || j == xCount + 1 || i == yCount + 1 || !config[level].map[i - 1][j - 1];
                var w = $("#canvas").width();
                var h = $("#canvas").height();
                var v = Math.min(w, h);
                var ox = (w - v) / 2,
                    oy = (h - v) / 2;
                var x = (j - 1) * (eleSize + margin) + margin / 2 + ox + padding;
                var y = (i - 1) * (eleSize + margin) + margin / 2 + oy + padding;
                var obj = {
                    'x': x,
                    'y': y,
                    'xIndex': j,
                    'yIndex': i,
                    'num': a ? 'f' : numArr[index++],
                    'isOver': a ? true : false
                };
                if (!a && obj.num >= 0) {
                    if (obj.num % 2)
                        var mark = "m" + level + (obj.num - 1) / 2;
                    else
                        var mark = "f" + level + obj.num / 2;
                    drawIcon(cxt, document.getElementById(mark), obj.x, obj.y, eleSize, eleSize);
                }
                if (!a && obj.num < 0) {
                    obj.isOver = true;
                }
                eleArr[i][j] = obj;
            }
        }
    }

    //数字成双后排序
    function randomNum() {
        numArr = [];
        for (var i = 0; i < (yCount * xCount - block) - (yCount * xCount - block) % 2; i += 2) {
            var n = Math.floor(Math.random() * resources[level].count) * 2;
            numArr[i] = n, numArr[i + 1] = n + 1;
        }
        if ((yCount * xCount - block) % 2) {
            numArr[yCount * xCount - block] = -1;
        }
        numArr.sort(function () {
            return Math.random() > 0.5 ? 1 : -1;
        });
    }

    //绘制棋盘
    function drawBG(c, w, h) {
        c.restore();
        c.fillStyle = "#fdfbf0";
        c.fillRect(0, 0, w, h);
        c.fill();
        drawBGLine(c, w, h);
        c.restore();
    }

    function drawBGLine(c, w, h) {
        c.restore();
        c.fillStyle = "#fdfbf0";
        c.strokeStyle = "#ddc07b";
        var v = Math.min(w, h);
        var ox = (w - v) / 2,
            oy = (h - v) / 2;
        var u = (v - 2 * padding) / xCount;
        c.fillRect(0, 0, w, oy + padding);
        c.fillRect(0, h - oy - padding, w, oy + padding);
        c.fillRect(0, 0, ox + padding, h);
        c.fillRect(w - ox - padding, 0, ox + padding, h);
        c.beginPath();
        c.lineWidth = 2;
        for (var i = 0; i < yCount + 2; i++) {
            for (var j = 0; j < xCount + 2; j++) {
                c.moveTo(ox + padding + u * j, oy + padding);
                c.lineTo(ox + padding + u * j, oy - padding + v);
                c.moveTo(ox + padding, oy + padding + u * i);
                c.lineTo(ox - padding + v, oy + padding + u * i);
            }
        }
        c.stroke();
        c.restore();
    }
    //绘制矩形元素
    function drawRoundByTran(c, x, y, w, h, r) {
        c.restore();
        c.save();
        c.translate(x, y);
        c.beginPath();
        c.lineWidth = 1;
        c.arc(r, r, r, Math.PI, Math.PI * 1.5);
        c.lineTo(w - r, 0);
        c.arc(w - r, r, r, Math.PI * 1.5, 0);
        c.lineTo(w, h - r);
        c.arc(w - r, h - r, r, 0, 0.5 * Math.PI);
        c.lineTo(r, h);
        c.arc(r, h - r, r, 0.5 * Math.PI, Math.PI);
        c.closePath();
    }
    //绘制图标
    function drawIcon(c, m, x, y, w, h) {
        c.restore();
        c.drawImage(m, x, y, w, h);
        c.restore();
    }
    //画线
    function drawLine(c, arr, style) {
        c.restore();
        c.strokeStyle = style;
        c.beginPath();
        c.lineWidth = 2;
        for (var x = 0; x < arr.length; x++) {
            c.lineTo(arr[x].x + eleSize / 2, arr[x].y + eleSize / 2);
        }
        c.stroke();
        c.restore();
    }

    return {
        setLevel: function (i) {
            level = i >= config.length ? i % config.length : i;
        },
        start: function () {
            generate();
            canvas.addEventListener(resType, gameHandle);
        },
        resume: function () {
            canvas.addEventListener(resType, gameHandle);
        },
        pause: function () {
            canvas.removeEventListener(resType, gameHandle);
        },
        stop: function () {
            canvas.removeEventListener(resType, gameHandle);
            init();
            return xCount * yCount - block - over * 2;
        },
        setRatio: function (i) {
            if (Number(i))
                screenRatio = Number(i);
        }
    };
})();
