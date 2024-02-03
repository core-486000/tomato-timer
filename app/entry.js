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

const timer = $('#timer');
let timerId;
let remainingTime;

// タイマーのカウントダウン
function setTimer(finishTime) {
  const now = new Date();

  // タイマーが終了したかどうか
  if (dayjs(now).isBefore(dayjs(finishTime))) {
    console.log('タイマー動作中だよ');

    remainingTime = finishTime.diff(now);
    const formattedTime = dayjs(remainingTime).tz().format('mm:ss');
    timer.text(formattedTime);
    $('title').html(formattedTime);
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

  const minutes = 25;
  const finishTime = dayjs(new Date()).add(minutes, 'm');
  timerId = setInterval(function(){setTimer(finishTime)}, 500);
});

// タイマーの一時停止ボタンをクリックした時
$('body').on('click', '#stop-button', () => {
  const stopButton = $('#stop-button');
  stopButton.replaceWith(
    '<button id="restart-button" type="button">再開</button>'
  );

  clearInterval(timerId);
});

// タイマーの再開ボタンをクリックした時
$('body').on('click', '#restart-button', () => {
  const restartButton = $('#restart-button');
  restartButton.replaceWith(
    '<button id="stop-button" type="button">一時停止</button>'
  );

  const finishTime = dayjs(new Date()).add(remainingTime, 'ms');
  timerId = setInterval(function(){setTimer(finishTime)}, 500);
});