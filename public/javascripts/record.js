'use strict';
dayjs.extend(dayjs_plugin_utc);
const canvas = $('#myChart');
const timeWorkedMap = new Map(Object.entries(JSON.parse(Cookies.get('timeWorkedJson'))));

// ミリ秒を分に変換
timeWorkedMap.forEach((value, key, map) => {
  map.set(key, Math.floor(value / 1000 / 60));
});

const data = {
  labels: Array.from(timeWorkedMap.keys()),
  datasets: [
    {
      label: '作業した時間',
      hoverBackgroundColor: "rgba(255,99,132,0.3)",
      data: Array.from(timeWorkedMap.values())
    }
  ]
};

const options = {
  plugins: {
    title: {
      display: true,
      text: '記録'
    }
  },  
  scales: {
    y: {
      ticks: {
        callback: (val) => {
          return dayjs(val * 60 * 1000).utc().format('HH時間mm分');
        }
      }
    }
  },
  maintainAspectRatio: false
};

const chart = new Chart(canvas, {
  type: 'bar',
  data: data,
  options: options
});