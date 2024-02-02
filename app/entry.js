'use strict';
import $ from 'jquery';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isBefore from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBefore);
dayjs.tz.setDefault('Asia/Tokyo');

let timerId;
const timer = $('#timer');

// タイマーのカウントダウン
function startTimer(finishTime) {
  const now = new Date();

  // タイマーが終了したかどうか
  if (dayjs(now).isBefore(dayjs(finishTime))) {
    const remainingTime = finishTime.diff(now);
    const formattedTime = dayjs(remainingTime).tz().format('mm:ss');
    timer.text(formattedTime);
    $('title').html(formattedTime);
    console.log('タイマー動作中だよ');
  } else {
    console.log('タイマー終了したよ');
  }
}

// タイマーの開始ボタンをクリックした時
$('body').on('click', '#start-button', () => {
  const startButton = $('#start-button');
  startButton.replaceWith(
    '<button id="stop-button" type="button">一時停止</button>'
  );

  // 終了時間を計算してstartTimer()に渡す
  const minutes = 25;
  const finishTime = dayjs(new Date()).add(minutes, 'm');
  timerId = setInterval(function(){startTimer(finishTime)}, 500);
});

// タイマーの一時停止ボタンをクリックした時
$('body').on('click', '#stop-button', () => {
  const stopButton = $('#stop-button');
  stopButton.replaceWith(
    '<button id="restart-button" type="button">再開</button>'
  );

  clearInterval(timerId);
});

// TODO タイマーの再開ボタンをクリックした時