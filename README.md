# web-react-tradeview

参考[火币网K线图](https://www.huobipro.com/zh-cn/btc_usdt/exchange/)，react版的简易tradeview项目

请务必配合我的另一个项目[node-websocket-tradeview](https://github.com/caozihao/node-websocket-tradeview)来使用！！！那个项目使用websocket提供数据服务

## 申明（重要！）

* #### 本项目仅供自己学习！不要用来作为商业用途！本人不负法律责任！

* 想要发布到外网，必须要填表申请资格！

## 启动


    npm install
    npm start

## 说明

* 项目跑不起来请联系我，QQ：1154791107。正常安装执行命令的话是没什么问题的

* Tradeview图表版本是最新版的1.12

* datafeed.js采用的是1.4版本的（群文件内有），不是1.12TS版本的

* datafeed.js实际只改动了 getBars 里的方法，具体实现并不难：把http获取的方式改为用websocket来订阅，并且返回图表的数据格式要和之前保持一致，看代码即可

* 如果页面被刷新或者websocket被中断，需重启后台服务（另一个项目）

