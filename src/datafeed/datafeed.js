"use strict";
/*
	This class implements interaction with UDF-compatible datafeed.

	See UDF protocol reference at
	https://github.com/tradingview/charting_library/wiki/UDF
*/

//  将http请求改成websocket订阅

import datafeedConfig from './datafeedConfig';
import datafeedUtil from "./datafeedUtil";

let { configJSON, symbolResolveJSON } = datafeedConfig;

var Datafeeds = {};

import $ from "jquery";

Datafeeds.UDFCompatibleDatafeed = function (datafeedURL, updateFrequency, protocolVersion) {

  this._datafeedURL = datafeedURL;
  this._configuration = undefined;

  this._symbolSearch = null;
  this._symbolsStorage = null;
  // 实时订阅
  this._barsPulseUpdater = new Datafeeds.DataPulseUpdater(this, updateFrequency || 1000 * 10);
  // 交易终端
  this._quotesPulseUpdater = new Datafeeds.QuotesPulseUpdater(this);
  this._protocolVersion = protocolVersion || 2;

  this._enableLogging = false;
  this._initializationFinished = false;
  this._callbacks = {};

  this._initialize();
};

Datafeeds.UDFCompatibleDatafeed.prototype.defaultConfiguration = function () {
  return {
    supports_search: false,
    supports_group_request: true,
    supported_resolutions: ["1", "5", "15", "30", "60", "1D"],
    supports_marks: false,
    supports_timescale_marks: false
  };
};

// 获取服务器时间
Datafeeds.UDFCompatibleDatafeed.prototype.getServerTime = function (callback) {
  callback(new Date().getTime())

  /*   if (this._configuration.supports_time) {
      this._send(this._datafeedURL + "/time", {})
        .done(function (response) {
          callback(+response);
        })
        .fail(function () {

        });
    } */
};

Datafeeds.UDFCompatibleDatafeed.prototype.on = function (event, callback) {

  if (!this._callbacks.hasOwnProperty(event)) {
    this._callbacks[event] = [];
  }

  this._callbacks[event].push(callback);
  return this;
};


Datafeeds.UDFCompatibleDatafeed.prototype._fireEvent = function (event, argument) {
  if (this._callbacks.hasOwnProperty(event)) {
    var callbacksChain = this._callbacks[event];
    for (var i = 0; i < callbacksChain.length; ++i) {
      callbacksChain[i](argument);
    }
    this._callbacks[event] = [];
  }
};

Datafeeds.UDFCompatibleDatafeed.prototype.onInitialized = function () {
  this._initializationFinished = true;
  this._fireEvent("initialized");
};

Datafeeds.UDFCompatibleDatafeed.prototype._logMessage = function (message) {
  if (this._enableLogging) {
    var now = new Date();
    // console.log(now.toLocaleTimeString() + "." + now.getMilliseconds() + "> " + message);
  }
};

Datafeeds.UDFCompatibleDatafeed.prototype._send = function (url, params) {
  var request = url;
  if (params) {
    for (var i = 0; i < Object.keys(params).length; ++i) {
      var key = Object.keys(params)[i];
      var value = encodeURIComponent(params[key]);
      request += (i === 0 ? "?" : "&") + key + "=" + value;
    }
  }

  this._logMessage("New request: " + request);

  return $.ajax({
    type: 'GET',
    url: request,
    contentType: 'text/plain'
  });

};

// 初始化 获取配置文件
Datafeeds.UDFCompatibleDatafeed.prototype._initialize = function () {

  // console.log('_initialize');
  var that = this;
  that._setupWithConfiguration(configJSON);

  /*   this._send(this._datafeedURL + "/config")
      .done(function (response) {
        var configurationData = JSON.parse(response);
        that._setupWithConfiguration(configurationData);
      })
      .fail(function (reason) {
        that._setupWithConfiguration(that.defaultConfiguration());
      }); */
};

// 此方法旨在提供填充配置数据的对象
Datafeeds.UDFCompatibleDatafeed.prototype.onReady = function (callback) {

  if (this._configuration) {
    callback(this._configuration);
  }
  else {
    var that = this;
    this.on("configuration_ready", function () {
      callback(that._configuration);
    });
  }
};

Datafeeds.UDFCompatibleDatafeed.prototype._setupWithConfiguration = function (configurationData) {

  this._configuration = configurationData;

  if (!configurationData.exchanges) {
    configurationData.exchanges = [];
  }

  //	@obsolete; remove in 1.5
  var supportedResolutions = configurationData.supported_resolutions || configurationData.supportedResolutions;
  configurationData.supported_resolutions = supportedResolutions;

  //	@obsolete; remove in 1.5
  var symbolsTypes = configurationData.symbols_types || configurationData.symbolsTypes;
  configurationData.symbols_types = symbolsTypes;

  if (!configurationData.supports_search && !configurationData.supports_group_request) {
    throw "Unsupported datafeed configuration. Must either support search, or support group request";
  }

  if (!configurationData.supports_search) {
    this._symbolSearch = new Datafeeds.SymbolSearchComponent(this);
  }

  if (configurationData.supports_group_request) {
    //	this component will call onInitialized() by itself
    this._symbolsStorage = new Datafeeds.SymbolsStorage(this);
  }
  else {
    this.onInitialized();
  }

  this._fireEvent("configuration_ready");
  this._logMessage("Initialized with " + JSON.stringify(configurationData));
};

// 图书馆调用这个函数来获得可见的K线范围的标记。 图表预期每调用一次getMarks就会调用一次onDataCallback。
Datafeeds.UDFCompatibleDatafeed.prototype.getMarks = function (symbolInfo, rangeStart, rangeEnd, onDataCallback, resolution) {
  // console.log('getMarks rangeStart ->', rangeStart);
  // console.log('getMarks rangeEnd ->', rangeEnd);
  onDataCallback([]);
  /*   if (this._configuration.supports_marks) {
      this._send(this._datafeedURL + "/marks", {
        symbol: symbolInfo.ticker.toUpperCase(),
        from: rangeStart,
        to: rangeEnd,
        resolution: resolution
      })
        .done(function (response) {
          // console.log('getMarks ->', response);
          onDataCallback(JSON.parse(response));
        })
        .fail(function () {
          onDataCallback([]);
        });
    } */
};

// 图表库调用此函数获取可见K线范围的时间刻度标记。图表预期您每个调用getTimescaleMarks会调用一次onDataCallback。
Datafeeds.UDFCompatibleDatafeed.prototype.getTimescaleMarks = function (symbolInfo, rangeStart, rangeEnd, onDataCallback, resolution) {

  // console.log('getTimescaleMarks rangeStart->', rangeStart);
  // console.log('getTimescaleMarks rangeEnd->', rangeEnd);
  onDataCallback([]);

  /*   if (this._configuration.supports_timescale_marks) {
      this._send(this._datafeedURL + "/timescale_marks", {
        symbol: symbolInfo.ticker.toUpperCase(),
        from: rangeStart,
        to: rangeEnd,
        resolution: resolution
      })
        .done(function (response) {
          // console.log('getTimescaleMarks response ->', response);
          onDataCallback(JSON.parse(response));
        })
        .fail(function () {
          onDataCallback([]);
        });
    } */
}

// 提供一个匹配用户搜索的商品列表
Datafeeds.UDFCompatibleDatafeed.prototype.searchSymbolsByName = function (ticker, exchange, type, onResultReadyCallback) {
  var MAX_SEARCH_RESULTS = 30;

  if (!this._configuration) {
    onResultReadyCallback([]);
    return;
  }

  if (this._configuration.supports_search) {

    this._send(this._datafeedURL + "/search", {
      limit: MAX_SEARCH_RESULTS,
      query: ticker.toUpperCase(),
      type: type,
      exchange: exchange
    })
      .done(function (response) {
        var data = JSON.parse(response);

        for (var i = 0; i < data.length; ++i) {
          if (!data[i].params) {
            data[i].params = [];
          }
        }

        if (typeof data.s == "undefined" || data.s != "error") {
          onResultReadyCallback(data);
        }
        else {
          onResultReadyCallback([]);
        }

      })
      .fail(function (reason) {
        onResultReadyCallback([]);
      });
  } else {

    if (!this._symbolSearch) {
      throw "Datafeed error: inconsistent configuration (symbol search)";
    }

    var searchArgument = {
      ticker: ticker,
      exchange: exchange,
      type: type,
      onResultReadyCallback: onResultReadyCallback
    };

    if (this._initializationFinished) {
      this._symbolSearch.searchSymbolsByName(searchArgument, MAX_SEARCH_RESULTS);
    } else {

      var that = this;

      this.on("initialized", function () {
        that._symbolSearch.searchSymbolsByName(searchArgument, MAX_SEARCH_RESULTS);
      });
    }
  }
};


Datafeeds.UDFCompatibleDatafeed.prototype._symbolResolveURL = "/symbols";


//通过商品名称解析商品信息
Datafeeds.UDFCompatibleDatafeed.prototype.resolveSymbol = function (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {

  var that = this;

  if (!this._initializationFinished) {
    this.on("initialized", function () {
      that.resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback);
    });
    return;
  }

  var resolveRequestStartTime = Date.now();
  that._logMessage("Resolve requested");

  function onResultReady(data) {
    var postProcessedData = data;
    if (that.postProcessSymbolInfo) {
      postProcessedData = that.postProcessSymbolInfo(postProcessedData);
    }

    that._logMessage("Symbol resolved: " + (Date.now() - resolveRequestStartTime));
    onSymbolResolvedCallback(postProcessedData);

  }

  if (!this._configuration.supports_group_request) {
    // console.log('symbolResolveJSON ->', symbolResolveJSON);
    onResultReady(symbolResolveJSON);

    /*     this._send(this._datafeedURL + this._symbolResolveURL, {
          symbol: symbolName ? symbolName.toUpperCase() : ""
        })
          .done(function (response) {
            var data = JSON.parse(response);
            console.log('_symbolResolveURL data ->', data);
            if (data.s && data.s != "ok") {
              onResolveErrorCallback("unknown_symbol");
            }
            else {
              onResultReady(data);
            }
          })
          .fail(function (reason) {
            that._logMessage("Error resolving symbol: " + JSON.stringify([reason]));
            onResolveErrorCallback("unknown_symbol");
          });
     */
  } else {
    if (this._initializationFinished) {
      this._symbolsStorage.resolveSymbol(symbolName, onResultReady, onResolveErrorCallback);
    } else {
      this.on("initialized", function () {
        that._symbolsStorage.resolveSymbol(symbolName, onResultReady, onResolveErrorCallback);
      });
    }
  }
};


Datafeeds.UDFCompatibleDatafeed.prototype._historyURL = "/history";

// 通过日期范围获取历史K线数据。图表库希望通过onDataCallback仅一次调用，接收所有的请求历史。而不是被多次调用。
Datafeeds.UDFCompatibleDatafeed.prototype.getBars = function (symbolInfo, resolution, rangeStartDate, rangeEndDate, onDataCallback, onErrorCallback) {

  let from = rangeStartDate * 1000;
  let to = rangeEndDate * 1000;
  let resolutionTime = datafeedUtil.filteringTime(resolution);
  let period = datafeedUtil.transformTime(resolution);

  var that = this;

  var websocketGetData = function () {

    let config = {
      "type": "kline",
      period,
      from,         //开始时间戳
      to,             //结束时间戳
      "baseCurrencyId": 1,         //基准货币主键
      "targetCurrencyId": 2         //目标货币主键
    }

    if (!window.hasWsMessage) {
      // console.log('get kline data.....')
      window.ws.send(JSON.stringify(config));
      window.hasWsMessage = true;
    }

    window.ws.onmessage = (function (e) {

      // JSON格式
      let websocketParams = {
        data: e.data,
        resolutionTime,
        callback: (data) => {
          dealSuccess(data)
        }
      }
      datafeedUtil.dealWebsocket(websocketParams);

      /* let binaryParams = {
        data: e.data,
        callback: (data) => {
          dealSuccess(JSON.stringify(JSON.parse(data).data))
        }
      }

      // 二进制
      datafeedUtil.onWsMessage(binaryParams); */

    });
  }

  var httpGetData = function () {
    that._send(that._datafeedURL + that._historyURL, {
      symbol: symbolInfo.ticker.toUpperCase(),
      resolution: resolution,
      from: rangeStartDate,
      to: rangeEndDate
    })
      .done(function (response) {
        dealSuccess(response);
      })
      .fail(function (arg) {
        if (!!onErrorCallback) {
          onErrorCallback("network error: " + JSON.stringify(arg));
        }
      });
  }

  // httpGetData();
  websocketGetData();

  var dealSuccess = function (data) {
    var data = JSON.parse(data);
    var nodata = data.s == "no_data";

    if (data.s != "ok" && !nodata) {
      if (!!onErrorCallback) {
        onErrorCallback(data.s);
      }
      return;
    }

    var bars = [];
    //	data is JSON having format {s: "status" (ok, no_data, error),
    //  v: [volumes], t: [times], o: [opens], h: [highs], l: [lows], c:[closes], nb: "optional_unixtime_if_no_data"}
    var barsCount = nodata ? 0 : data.t.length;
    var volumePresent = typeof data.v != "undefined";
    var ohlPresent = typeof data.o != "undefined";

    for (var i = 0; i < barsCount; ++i) {

      var barValue = {
        time: data.t[i] * 1000,
        close: data.c[i]
      };

      if (ohlPresent) {
        barValue.open = data.o[i];
        barValue.high = data.h[i];
        barValue.low = data.l[i];
      }
      else {
        barValue.open = barValue.high = barValue.low = barValue.close;
      }

      if (volumePresent) {
        barValue.volume = data.v[i];
      }
      bars.push(barValue);
    }

    let meta = { version: that._protocolVersion, noData: true, nextTime: data.nb || data.nextTime };

    // console.log('getBars bars->', bars);
    // console.log('getBars meta->', meta);
    // 只会执行一次
    onDataCallback(bars, meta);
  }

};

// 订阅K线数据。图表库将调用onRealtimeCallback方法以更新实时数据。
Datafeeds.UDFCompatibleDatafeed.prototype.subscribeBars = function (symbolInfo, resolution, onRealtimeCallback, listenerGUID, onResetCacheNeededCallback) {
  // console.log('subscribeBars ->');
  window.hasWsMessage = "";
  this._barsPulseUpdater.subscribeDataListener(symbolInfo, resolution, onRealtimeCallback, listenerGUID, onResetCacheNeededCallback);
};

// 取消订阅K线数据。在调用subscribeBars方法时,图表库将跳过与subscriberUID相同的对象。
Datafeeds.UDFCompatibleDatafeed.prototype.unsubscribeBars = function (listenerGUID) {
  this._barsPulseUpdater.unsubscribeDataListener(listenerGUID);
};

// 图表库在它要请求一些历史数据的时候会调用这个函数，让你能够覆盖所需的历史深度。
Datafeeds.UDFCompatibleDatafeed.prototype.calculateHistoryDepth = function (period, resolutionBack, intervalBack) {
};


// -------------------- 交易终端专属-----------------------------

// 当图表需要报价数据时，将调用此函数。图表库预期在收到所有请求数据时调用onDataCallback。
Datafeeds.UDFCompatibleDatafeed.prototype.getQuotes = function (symbols, onDataCallback, onErrorCallback) {
  this._send(this._datafeedURL + "/quotes", { symbols: symbols })
    .done(function (response) {
      var data = JSON.parse(response);
      if (data.s == "ok") {
        //	JSON format is {s: "status", [{s: "symbol_status", n: "symbol_name", v: {"field1": "value1", "field2": "value2", ..., "fieldN": "valueN"}}]}
        if (onDataCallback) {
          onDataCallback(data.d);
        }
      } else {
        if (onErrorCallback) {
          onErrorCallback(data.errmsg);
        }
      }
    })
    .fail(function (arg) {
      if (onErrorCallback) {
        onErrorCallback("network error: " + arg);
      }
    });
};

// 交易终端当需要接收商品的实时报价时调用此功能。图表预期您每次要更新报价时都会调用onRealtimeCallback。
Datafeeds.UDFCompatibleDatafeed.prototype.subscribeQuotes = function (symbols, fastSymbols, onRealtimeCallback, listenerGUID) {
  this._quotesPulseUpdater.subscribeDataListener(symbols, fastSymbols, onRealtimeCallback, listenerGUID);
};

// 交易终端当不需要再接收商品的实时报价时调用此函数。当图表库遇到listenerGUID相同的对象会跳过subscribeQuotes方法。
Datafeeds.UDFCompatibleDatafeed.prototype.unsubscribeQuotes = function (listenerGUID) {
  this._quotesPulseUpdater.unsubscribeDataListener(listenerGUID);
};

//	==================================================================================================================================================
//	==================================================================================================================================================
//	==================================================================================================================================================

/*
	It's a symbol storage component for ExternalDatafeed. This component can
	  * interact to UDF-compatible datafeed which supports whole group info requesting
	  * do symbol resolving -- return symbol info by its name
*/
Datafeeds.SymbolsStorage = function (datafeed) {
  this._datafeed = datafeed;

  this._exchangesList = ["AAPL", "NYSE", "FOREX", "AMEX"];
  this._exchangesWaitingForData = {};
  this._exchangesDataCache = {};

  this._symbolsInfo = {};
  this._symbolsList = [];

  this._requestFullSymbolsList();
};


// 设置商品集合信息
Datafeeds.SymbolsStorage.prototype._requestFullSymbolsList = function () {

  var that = this;
  var datafeed = this._datafeed;

  for (var i = 0; i < this._exchangesList.length; ++i) {

    var exchange = this._exchangesList[i];

    if (this._exchangesDataCache.hasOwnProperty(exchange)) {
      continue;
    }

    this._exchangesDataCache[exchange] = true;
    this._exchangesWaitingForData[exchange] = "waiting_for_data";

    let response = {
      symbol: ["AAPL", "NYSE", "FOREX", "AMEX"],
      description: ["AAPL Inc", "NYSE corp", "FOREX index", "AMEX index"],
      "exchange-listed": "NYSE",
      "exchange-traded": "NYSE",
      minmov: 1,
      minmov2: 0,
      pricescale: [1, 1, 100],
      "has-dwm": true,
      "has-intraday": true,
      "has-no-volume": [false, false, true, false],
      "type": ["stock", "stock", "index", "index"],
      "ticker": ["AAPL~0", "MSFT~0", "$SPX500"],
      "timezone": "Asia/Shanghai",
      "session-regular": "0900-1600",
    }

    // console.log('response ->', response);

    that._onExchangeDataReceived(exchange, response);
    that._onAnyExchangeResponseReceived(exchange);

    /*     this._datafeed._send(this._datafeed._datafeedURL + "/symbol_info", {
          group: exchange
        })
          .done(function (exchange) {

            return function (response) {
              that._onExchangeDataReceived(exchange, JSON.parse(response));
              that._onAnyExchangeResponseReceived(exchange);
            };
          }(exchange)) //jshint ignore:line
          .fail(function (exchange) {
            return function (reason) {
              that._onAnyExchangeResponseReceived(exchange);
            };
          }(exchange)); //jshint ignore:line
     */
  }
};

Datafeeds.SymbolsStorage.prototype._onExchangeDataReceived = function (exchangeName, data) {

  function tableField(data, name, index) {
    return data[name] instanceof Array ?
      data[name][index] :
      data[name];
  }

  try {
    for (var symbolIndex = 0; symbolIndex < data.symbol.length; ++symbolIndex) {

      var symbolName = data.symbol[symbolIndex];
      var listedExchange = tableField(data, "exchange-listed", symbolIndex);
      var tradedExchange = tableField(data, "exchange-traded", symbolIndex);
      var fullName = tradedExchange + ":" + symbolName;

      //	This feature support is not implemented yet
      //	var hasDWM = tableField(data, "has-dwm", symbolIndex);

      var hasIntraday = tableField(data, "has-intraday", symbolIndex);

      var tickerPresent = typeof data.ticker != "undefined";

      var symbolInfo = {
        name: symbolName,
        base_name: [listedExchange + ":" + symbolName],
        description: tableField(data, "description", symbolIndex),
        full_name: fullName,
        legs: [fullName],
        has_intraday: hasIntraday,
        has_no_volume: tableField(data, "has-no-volume", symbolIndex),
        listed_exchange: listedExchange,
        exchange: tradedExchange,
        minmov: tableField(data, "minmovement", symbolIndex) || tableField(data, "minmov", symbolIndex),
        minmove2: tableField(data, "minmove2", symbolIndex) || tableField(data, "minmov2", symbolIndex),
        fractional: tableField(data, "fractional", symbolIndex),
        pointvalue: tableField(data, "pointvalue", symbolIndex),
        pricescale: tableField(data, "pricescale", symbolIndex),
        type: tableField(data, "type", symbolIndex),
        session: tableField(data, "session-regular", symbolIndex),
        ticker: tickerPresent ? tableField(data, "ticker", symbolIndex) : symbolName,
        timezone: tableField(data, "timezone", symbolIndex),
        supported_resolutions: tableField(data, "supported-resolutions", symbolIndex) || this._datafeed.defaultConfiguration().supported_resolutions,
        force_session_rebuild: tableField(data, "force-session-rebuild", symbolIndex) || false,
        has_daily: tableField(data, "has-daily", symbolIndex) || true,
        intraday_multipliers: tableField(data, "intraday-multipliers", symbolIndex) || ["1", "5", "15", "30", "60"],
        has_fractional_volume: tableField(data, "has-fractional-volume", symbolIndex) || false,
        has_weekly_and_monthly: tableField(data, "has-weekly-and-monthly", symbolIndex) || false,
        has_empty_bars: tableField(data, "has-empty-bars", symbolIndex) || false,
        volume_precision: tableField(data, "volume-precision", symbolIndex) || 0
      };

      this._symbolsInfo[symbolInfo.ticker] = this._symbolsInfo[symbolName] = this._symbolsInfo[fullName] = symbolInfo;
      this._symbolsList.push(symbolName);
    }
  }
  catch (error) {
    throw "API error when processing exchange `" + exchangeName + "` symbol #" + symbolIndex + ": " + error;
  }
};


Datafeeds.SymbolsStorage.prototype._onAnyExchangeResponseReceived = function (exchangeName) {

  delete this._exchangesWaitingForData[exchangeName];
  var allDataReady = Object.keys(this._exchangesWaitingForData).length === 0;

  if (allDataReady) {
    this._symbolsList.sort();
    this._datafeed._logMessage("All exchanges data ready");
    this._datafeed.onInitialized();
  }
};


//	BEWARE: this function does not consider symbol's exchange
Datafeeds.SymbolsStorage.prototype.resolveSymbol = function (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {

  if (!this._symbolsInfo.hasOwnProperty(symbolName)) {
    onResolveErrorCallback("invalid symbol");
  }
  else {
    onSymbolResolvedCallback(this._symbolsInfo[symbolName]);
  }

};


//	==================================================================================================================================================
//	==================================================================================================================================================
//	==================================================================================================================================================

/*
	It's a symbol search component for ExternalDatafeed. This component can do symbol search only.
	This component strongly depends on SymbolsDataStorage and cannot work without it. Maybe, it would be
	better to merge it to SymbolsDataStorage.
*/

Datafeeds.SymbolSearchComponent = function (datafeed) {
  this._datafeed = datafeed;
};

//	searchArgument = { ticker, onResultReadyCallback}
Datafeeds.SymbolSearchComponent.prototype.searchSymbolsByName = function (searchArgument, maxSearchResults) {

  if (!this._datafeed._symbolsStorage) {
    throw "Cannot use local symbol search when no groups information is available";
  }

  var symbolsStorage = this._datafeed._symbolsStorage;

  var results = [];
  var queryIsEmpty = !searchArgument.ticker || searchArgument.ticker.length === 0;

  for (var i = 0; i < symbolsStorage._symbolsList.length; ++i) {
    var symbolName = symbolsStorage._symbolsList[i];
    var item = symbolsStorage._symbolsInfo[symbolName];

    if (searchArgument.type && searchArgument.type.length > 0 && item.type != searchArgument.type) {
      continue;
    }
    if (searchArgument.exchange && searchArgument.exchange.length > 0 && item.exchange != searchArgument.exchange) {
      continue;
    }
    if (queryIsEmpty || item.name.indexOf(searchArgument.ticker) === 0) {
      results.push({
        symbol: item.name,
        full_name: item.full_name,
        description: item.description,
        exchange: item.exchange,
        params: [],
        type: item.type,
        ticker: item.name
      });
    }

    if (results.length >= maxSearchResults) {
      break;
    }
  }

  searchArgument.onResultReadyCallback(results);
};

//	==================================================================================================================================================
//	==================================================================================================================================================
//	==================================================================================================================================================

/*
	This is a pulse updating components for ExternalDatafeed. They emulates realtime updates with periodic requests.
*/

Datafeeds.DataPulseUpdater = function (datafeed, updateFrequency) {
  this._datafeed = datafeed;
  this._subscribers = {};

  this._requestsPending = 0;
  var that = this;

  var update = function () {
    if (that._requestsPending > 0) {
      return;
    }

    for (var listenerGUID in that._subscribers) {
      var subscriptionRecord = that._subscribers[listenerGUID];
      var resolution = subscriptionRecord.resolution;

      var datesRangeRight = parseInt((new Date().valueOf()) / 1000);

      //	BEWARE: please note we really need 2 bars, not the only last one
      //	see the explanation below. `10` is the `large enough` value to work around holidays
      var datesRangeLeft = datesRangeRight - that.periodLengthSeconds(resolution, 10);

      that._requestsPending++;

      (function (_subscriptionRecord) {

        that._datafeed.getBars(_subscriptionRecord.symbolInfo, resolution, datesRangeLeft, datesRangeRight, function (bars) {
          that._requestsPending--;

          //	means the subscription was cancelled while waiting for data
          if (!that._subscribers.hasOwnProperty(listenerGUID)) {
            return;
          }

          if (bars.length === 0) {
            return;
          }

          var lastBar = bars[bars.length - 1];
          if (!isNaN(_subscriptionRecord.lastBarTime) && lastBar.time < _subscriptionRecord.lastBarTime) {
            return;
          }

          var subscribers = _subscriptionRecord.listeners;

          //	BEWARE: this one isn't working when first update comes and this update makes a new bar. In this case
          //	_subscriptionRecord.lastBarTime = NaN
          var isNewBar = !isNaN(_subscriptionRecord.lastBarTime) && lastBar.time > _subscriptionRecord.lastBarTime;

          //	Pulse updating may miss some trades data (ie, if pulse period = 10 secods and new bar is started 5 seconds later after the last update, the
          //	old bar's last 5 seconds trades will be lost). Thus, at fist we should broadcast old bar updates when it's ready.
          if (isNewBar) {

            if (bars.length < 2) {
              throw "Not enough bars in history for proper pulse update. Need at least 2.";
            }

            var previousBar = bars[bars.length - 2];
            for (var i = 0; i < subscribers.length; ++i) {
              subscribers[i](previousBar);
            }
          }

          _subscriptionRecord.lastBarTime = lastBar.time;

          for (var i = 0; i < subscribers.length; ++i) {
            subscribers[i](lastBar);
          }
        },

          //	on error
          function () {
            that._requestsPending--;
          });
      })(subscriptionRecord); //jshint ignore:line

    }
  };

  if (typeof updateFrequency != "undefined" && updateFrequency > 0) {
    setInterval(update, updateFrequency);
  }
};


Datafeeds.DataPulseUpdater.prototype.unsubscribeDataListener = function (listenerGUID) {
  this._datafeed._logMessage("Unsubscribing " + listenerGUID);
  delete this._subscribers[listenerGUID];
};


Datafeeds.DataPulseUpdater.prototype.subscribeDataListener = function (symbolInfo, resolution, newDataCallback, listenerGUID) {

  this._datafeed._logMessage("Subscribing " + listenerGUID);

  var key = symbolInfo.name + ", " + resolution;

  if (!this._subscribers.hasOwnProperty(listenerGUID)) {

    this._subscribers[listenerGUID] = {
      symbolInfo: symbolInfo,
      resolution: resolution,
      lastBarTime: NaN,
      listeners: []
    };
  }

  this._subscribers[listenerGUID].listeners.push(newDataCallback);
};


Datafeeds.DataPulseUpdater.prototype.periodLengthSeconds = function (resolution, requiredPeriodsCount) {
  var daysCount = 0;

  if (resolution == "D") {
    daysCount = requiredPeriodsCount;
  }
  else if (resolution == "M") {
    daysCount = 31 * requiredPeriodsCount;
  }
  else if (resolution == "W") {
    daysCount = 7 * requiredPeriodsCount;
  }
  else {
    daysCount = requiredPeriodsCount * resolution / (24 * 60);
  }

  return daysCount * 24 * 60 * 60;
};


Datafeeds.QuotesPulseUpdater = function (datafeed) {
  this._datafeed = datafeed;
  this._subscribers = {};
  this._updateInterval = 60 * 1000;
  this._fastUpdateInterval = 10 * 1000;
  this._requestsPending = 0;

  var that = this;

  setInterval(function () {
    that._updateQuotes(function (subscriptionRecord) { return subscriptionRecord.symbols; });
  }, this._updateInterval);

  setInterval(function () {
    that._updateQuotes(function (subscriptionRecord) { return subscriptionRecord.fastSymbols.length > 0 ? subscriptionRecord.fastSymbols : subscriptionRecord.symbols; });
  }, this._fastUpdateInterval);
};

Datafeeds.QuotesPulseUpdater.prototype.subscribeDataListener = function (symbols, fastSymbols, newDataCallback, listenerGUID) {
  if (!this._subscribers.hasOwnProperty(listenerGUID)) {
    this._subscribers[listenerGUID] = {
      symbols: symbols,
      fastSymbols: fastSymbols,
      listeners: []
    };
  }
  this._subscribers[listenerGUID].listeners.push(newDataCallback);
};

Datafeeds.QuotesPulseUpdater.prototype.unsubscribeDataListener = function (listenerGUID) {
  delete this._subscribers[listenerGUID];
};

Datafeeds.QuotesPulseUpdater.prototype._updateQuotes = function (symbolsGetter) {
  if (this._requestsPending > 0) {
    return;
  }

  var that = this;
  for (var listenerGUID in this._subscribers) {
    this._requestsPending++;

    var subscriptionRecord = this._subscribers[listenerGUID];
    this._datafeed.getQuotes(symbolsGetter(subscriptionRecord),
      // onDataCallback
      function (subscribers, guid) {
        return function (data) {
          that._requestsPending--;

          // means the subscription was cancelled while waiting for data
          if (!that._subscribers.hasOwnProperty(guid)) {
            return;
          }

          for (var i = 0; i < subscribers.length; ++i) {
            subscribers[i](data);
          }
        };
      }(subscriptionRecord.listeners, listenerGUID), //jshint ignore:line
      // onErrorCallback
      function (error) {
        that._requestsPending--;
      }); //jshint ignore:line
  }
};

export default Datafeeds;
