

// 处理二进制流
const onWsMessage = (params) => {
  const { data, callback } = params;

  const initFileReader = function () {
    const reader = new FileReader();
    reader.onloadend = (e) => {
      const text = e.srcElement.result;
      callback(text);
    };
    return reader;
  };

  const reader = initFileReader();

  if (reader) {
    reader.readAsText(data);
  }
};

// 处理websocket返回的数据
const dealWebsocket = (params) => {
  let { data, resolutionTime, callback } = params;

  data = JSON.parse(data);
  let dataString = '';
  let dataJSON = '';
  const wsLocalStorage = 'wsTradeViewDataHistory';

  switch (data.type) {
    // k线历史图
    case 'kline':
      dataString = JSON.stringify(data.data.kLine);
      break;
    // 实时获取推送
    case 'dealSuccess':
      dataString = localStorage.getItem(wsLocalStorage);
      dataJSON = JSON.parse(dataString);
      const lastDataLength = dataJSON.t.length - 1;
      const newData = data.data.kLine;
      const lastDataTime = dataJSON.t[lastDataLength];
      const newDataTime = parseInt(newData.t);

      // 判断当前时间 + 时间间隔 和 最新时间的大小
      if (lastDataTime + resolutionTime > newDataTime) {
        // 替换最后一个
        for (const key in dataJSON) {
          if (key !== 's' && key !== 't' && newData[key]) {
            dataJSON[key][lastDataLength] = newData[key];
          }
        }
      } else {
        for (const key in dataJSON) {
          if (key !== 's' && newData[key]) {
            dataJSON[key].push(newData[key]);
          }
        }
      }
      dataString = JSON.stringify(dataJSON);
      break;
    default: break;
  }

  localStorage.setItem(wsLocalStorage, dataString);
  callback(dataString);
};


const filteringTime = (time) => {
  const minuteTime = 60;
  const dayTime = 60 * 60 * 24;
  let longTime = 0;
  switch (time) {
    case '1D':
      longTime = dayTime * 1;
      break;
    case '1W':
      longTime = dayTime * 7;
      break;
    case '1M':
      longTime = dayTime * 30;
      break;
    default:
      longTime = parseInt(time) * minuteTime;
      break;
  }
  return longTime;
};

const transformTime = (time) => {
  let period = '';
  if (time.indexOf('D') !== -1 || time.indexOf('W') !== -1 || time.indexOf('M') !== -1) {
    period = time;
  } else if (parseInt(time) < 60) {
    period = `${time}min`;
  } else if (parseInt(time) <= 720) {
    const hourNumber = Math.floor(parseInt(time) / 60);
    period = `${hourNumber}hour`;
  }

  return period;
};


export default {
  onWsMessage,
  dealWebsocket,
  filteringTime,
  transformTime,
};
