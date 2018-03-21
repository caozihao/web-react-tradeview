# web-react-tradeview

参考[火币网K线图](https://www.huobipro.com/zh-cn/btc_usdt/exchange/)，react版的简易tradeview项目

请务必配合我的另一个项目[node-websocket-tradeview](https://github.com/caozihao/node-websocket-tradeview)来使用！！！那个项目使用websocket提供数据服务

## 启动


    npm install
    npm start


## 说明

* Tradeview图表版本是最新版的1.12，要想正式使用必须要填表申请（群文件内有，仅供学习）
* datafeed.js采用的是1.4版本的（群文件内有），不是1.12TS版本的
* datafeed.js实际只改动了 getBars 里的方法，把http获取的方式改为用websocket来订阅，并且返回图表的数据格式要和之前保持一致，具体实现并不难，看代码即可
* 如果页面被刷新或者websocket被中断，需重启后台服务（另一个项目）

