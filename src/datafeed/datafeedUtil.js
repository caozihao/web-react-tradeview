

// 处理二进制流
const onWsMessage = (params) => {
  let { data, callback } = params;

  let initFileReader = function () {
    let reader = new FileReader();
    reader.onloadend = (e) => {
      let text = e.srcElement.result;
      callback(text)
    }
    return reader;
  }

  let reader = initFileReader();

  if (reader) {
    reader.readAsText(data);
  }

}

// 处理websocket返回的数据
const dealWebsocket = (params) => {
  let { data, resolutionTime, callback } = params;

  data = JSON.parse(data);
  let dataString = "";
  let dataJSON = "";
  let wsLocalStorage = "wsTradeViewDataHistory";

  switch (data.type) {
    // k线历史图
    case "kline":
      dataString = JSON.stringify(data.data);
      break;
    // 实时获取推送
    case "dealSuccess":
      dataString = localStorage.getItem(wsLocalStorage);
      dataJSON = JSON.parse(dataString);
      let lastDataLength = dataJSON["t"].length - 1;
      let newData = data.data.kLine;
      let lastDataTime = dataJSON["t"][lastDataLength];
      let newDataTime = parseInt(newData["t"]);

      // 判断当前时间 + 时间间隔 和 最新时间的大小
      if (lastDataTime + resolutionTime > newDataTime) {
        // 替换最后一个
        dataJSON["c"][lastDataLength] = newData["c"];
        dataJSON["o"][lastDataLength] = newData["o"];
        dataJSON["h"][lastDataLength] = newData["h"];
        dataJSON["l"][lastDataLength] = newData["l"];
        dataJSON["v"][lastDataLength] = newData["v"];
      } else {
        // 放入最新的
        dataJSON["t"].push(newData["t"]);
        dataJSON["c"].push(newData["c"]);
        dataJSON["o"].push(newData["o"]);
        dataJSON["h"].push(newData["h"]);
        dataJSON["l"].push(newData["l"]);
        dataJSON["v"].push(newData["v"]);
      }

      dataString = JSON.stringify(dataJSON);
      break;
  }

  localStorage.setItem(wsLocalStorage, dataString);
  callback(dataString);
}


const filteringTime = (time) => {
  let minuteTime = 60;
  let dayTime = 60 * 60 * 24;
  let longTime = 0;
  switch (time) {
    case "1D":
      longTime = dayTime * 1;
      break;
    case "D":
      longTime = dayTime * 7;
      break;
    default:
      longTime = parseInt(time) * minuteTime;
      break;
  }
  return longTime;
}

const transformTime = (time) => {
  let period = "";
  if (time.toString().indexOf('D') !== -1) {
    if (time === "D") {
      period = "1W";
    } else {
      let dayNumber = parseInt(time.split('W')[0]);
      period = `${dayNumber}D`;
    }
  } else {
    if (parseInt(time) < 60) {
      period = `${time}min`;
    } else {
      let hourNumber = Math.floor(parseInt(time) / 60);
      period = `${hourNumber}hour`;
    }
  }

  return period;
}


export default {
  onWsMessage,
  dealWebsocket,
  filteringTime,
  transformTime
};
