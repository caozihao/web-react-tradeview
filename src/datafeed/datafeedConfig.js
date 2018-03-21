const configJSON =
  {
    "supports_search": true,
    "supports_time": true,
    "supports_timescale_marks": false,
    "supports_group_request": false,
    "supports_marks": false,
    "supported_resolutions": ["1", "5", "15", "30", "60", "120", "240", "360", "720", "1D", "1W"],
  }


const symbolResolveJSON =
  {
    "name": "BTC/USDT",
    "exchange-traded": "",
    "exchange-listed": "",
    "timezone": "Asia/Shanghai",
    "minmov": 1,
    "minmov2": 0,
    "pointvalue": 1,
    "session": "0930-1600",

    // "has_seconds": false,
    // "seconds_multipliers": ["1S", "5S", "15S", "30S"],
    "has_intraday": true,
    // "intraday_multipliers": ["120", "60", "30", "5", "1"],
    "has_daily": true,
    "has_empty_bars": false,
    "has_no_volume": false,
    "description": "",
    "type": "Index",
    "supported_resolutions": ["1", "5", "15", "30", "60", "120", "240", "360", "720", "1D", "1W"],
    "pricescale": 1000,
    "ticker": "BTC/USDT"
  }
export default {
  configJSON,
  symbolResolveJSON,
  // originSymbolResolveJSON
}
