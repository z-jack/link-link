# link-link 连连看核心组件
It's a core component of link game. Based on canvas of HTML 5. But you should eliminate couples instead of same elements just as other link game. 

Maybe later it'll support the same elements elimination.

The form below is the interfaces that supplied by game and the interfaces that should be supplied by developer.

这是连连看游戏的核心组件，基于HTML 5 canvas开发。但是游戏规则为消除同组元素而不是像其他游戏一样消除相同元素。

可能近期会提供相同元素消除的功能。

下面为游戏提供的接口以及页面应该提供的接口。

```
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
```

