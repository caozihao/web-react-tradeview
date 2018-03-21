
import $ from "jQuery";
const datafeedConfig = (params) => {
  let { resolution, Datafeeds, serverUrl, pushInterval } = params;

  return {
    debug: false,
    fullscreen: false,
    symbol: 'BTC/USDT',
    interval: resolution,
    container_id: 'tv_chart_container',
    datafeed: new Datafeeds.UDFCompatibleDatafeed(serverUrl, pushInterval),
    width: "1000",
    // libraryPath: 'http://192.168.6.75/charting_library/',
    locale: 'zh',
    drawings_access: {
      type: 'black',
      tools: [{
        name: 'Regression Trend',
      }],
    },
    // autosize: true,
    "timezone": "Asia/Shanghai",
    disabled_features: [
      'header_symbol_search',
      'use_localstorage_for_settings',
      'symbol_search_hot_key',
      'header_chart_type',
      'header_compare',
      'header_undo_redo',
      'header_screenshot',
      'header_saveload',
      'timeframes_toolbar',
      'context_menus',
      'left_toolbar',
      'header_indicators', //图表指标
      // 'header_settings', //设置
      'header_resolutions',  //时间下拉框
      // 'header_fullscreen_button' //全屏按钮
    ],
    enabled_features: ['study_templates'],
    charts_storage_url: 'http://saveload.tradingview.com',
    charts_storage_api_version: '1.1',
    client_id: 'tradingview.com',
    user_id: 'public_user_id',
    /*         time_frames: [
              { text: "1min", resolution: "5s", description: "1 min" },
              { text: "1h", resolution: "1", description: "1 hour" },
              { text: "1d", resolution: "5", description: "1 Days" },
            ], */
    overrides: {
      // 'mainSeriesProperties.style': 1,
      // 'mainSeriesProperties.showPriceLine': true,
      // "paneProperties.legendProperties.showLegend": false,
      // 'paneProperties.topMargin': 15,
      // 'paneProperties.bottomMargin': 15,
      // 'paneProperties.background': '#000',
      // 'paneProperties.vertGridProperties.color': '#000',
      // 'paneProperties.horzGridProperties.color': '#000',
      // 'scalesProperties.lineColor': '#ccc',
      // 'mainSeriesProperties.candleStyle.borderColor': '#000',
      // 'mainSeriesProperties.candleStyle.drawBorder': true,
      // 'mainSeriesProperties.haStyle.borderColor': '#000',
      // 'scalesProperties.lineColor': '#000'
    },
  }
}

const chartReady = (widget) => {
  let buttonArr = [
    {
      value: "1",
      period: "1min",
      text: "分时",
    },
    {
      value: "1",
      period: "1min",
      text: "1min",
    },
    {
      value: "5",
      period: "5min",
      text: "5min",
    },
    {
      value: "15",
      period: "15min",
      text: "15min",
    },
    {
      value: "30",
      period: "30min",
      text: "30min",
    },
    {
      value: "60",
      period: "1hour",
      text: "1hour",
    },
    {
      value: "120",
      period: "2hour",
      text: "2hour",
    },
    {
      value: "240",
      period: "4hour",
      text: "4hour",
    },
    {
      value: "360",
      period: "6hour",
      text: "6hour",
    },
    {
      value: "720",
      period: "12hour",
      text: "12hour",
    },
    {
      value: "1D",
      period: "1D",
      text: "日线",
    },
    {
      value: "1W",
      period: "1W",
      text: "周线",
    },
  ]

  let btn = {};

  let handleClick = (e, value) => {
    widget.chart().setResolution(value);
    $(e.target).addClass('select').closest('div.space-single').siblings('div.space-single').find('div.button').removeClass('select');
  }

  buttonArr.forEach((v, i) => {
    btn = widget.createButton().on('click', function (e) {
      handleClick(e, v.value);
    });
    btn[0].innerHTML = v.text;
    btn[0].title = v.text;
  })
}

export default {
  datafeedConfig,
  chartReady
}
