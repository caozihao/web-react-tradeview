import React, { Component } from 'react';
import Datafeeds from '../datafeed/datafeed.js';
import tradeviewPageUtil from './TradeviewPageUtil';
import "./TradeviewPage.scss";

class TradeviewPage extends Component {
  constructor(props) {
    super(props);
    this.websocketUrl = 'ws://localhost:3001';
  }

  componentDidMount() {
    this.tradingViewGetReady();
    this.websocketStart();
  }

  componentWillReceiveProps(nextProps) {

  }

  // 开启websocket
  websocketStart() {
    window.ws = new WebSocket(this.websocketUrl);
  }

  // tradeView准备
  tradingViewGetReady() {

    let params = {
      resolution: "5",
      Datafeeds,
      serverUrl: this.websocketUrl,
      pushInterval: 1000,
    }
    TradingView.onready((() => {
      window.widget = new TradingView.widget(tradeviewPageUtil.datafeedConfig(params));

      widget.onChartReady(() => {
        tradeviewPageUtil.chartReady(widget);
      })

    })());
  }

  render() {
    return (
      <div id="tv_chart_container" />
    );
  }
}

export default TradeviewPage;
