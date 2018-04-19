
import $ from 'jquery';

const datafeedConfig = (params) => {
  const { resolution, Datafeeds, serverUrl, pushInterval } = params;

  return {
    debug: false,
    fullscreen: false,
    symbol: 'BTC/USDT',
    interval: resolution,
    container_id: 'tv_chart_container',
    datafeed: new Datafeeds.UDFCompatibleDatafeed(serverUrl, pushInterval),
    width: '1000',
    // libraryPath: 'http://192.168.6.75/charting_library/',
    locale: 'zh',
    drawings_access: {
      type: 'black',
      tools: [{
        name: 'Regression Trend',
      }],
    },
    // autosize: true,
    timezone: 'Asia/Shanghai',
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
      'header_indicators', // 图表指标
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
  };
};

const chartReady = (widget) => {
  const buttonArr = [
    {
      value: '1',
      period: '1min',
      text: '分时',
      chartType: 3,
    },
    {
      value: '15',
      period: '15min',
      text: '15分',
    },
    {
      value: '60',
      period: '1hour',
      text: '1小时',
    },
    {
      value: '240',
      period: '4hour',
      text: '4小时',
    },
    {
      value: '1D',
      period: '1D',
      text: '日线',
    },
    {
      value: '1W',
      period: '1W',
      text: '周线',
    },
    {
      value: '1M',
      period: '1M',
      text: '月线',
    },
  ];


  let btn = {};

  const handleClick = (e, value) => {
    widget.chart().setResolution(value);
    $(e.target).addClass('select').closest('div.space-single').siblings('div.space-single').find('div.button').removeClass('select');
  };

  buttonArr.forEach((v, i) => {
    btn = widget.createButton().on('click', (e) => {
      handleClick(e, v.value);
    });
    btn[0].innerHTML = v.text;
    btn[0].title = v.text;
  });
};

export default {
  datafeedConfig,
  chartReady,
};
