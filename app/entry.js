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

const startTimerButton = $('#start-timer-button');

// タイマーのカウントダウン
function timer(finishTime) {
  const now = new Date();
  const remainingTime = finishTime.diff(now);
  const formattedTime = dayjs(remainingTime).tz().format('mm:ss');

  // タイマーが終了したかどうか
  if (dayjs(now).isBefore(dayjs(finishTime))) {
    $('#timer').text(formattedTime);
    $('title').html(formattedTime);
    setTimeout(function(){timer(finishTime)}, 500);
  } else {
  }
}

startTimerButton.on('click', () => {
  startTimerButton.replaceWith(
    '<button id="stop-timer-button" type="button">一時停止</button>'
  );
  startTimer(25);
});

// timer()に終了時間を計算して渡す
function startTimer(minutes) {
  const finishTime = dayjs(new Date()).add(minutes, 'm');
  timer(finishTime);
}