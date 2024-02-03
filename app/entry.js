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
let startButton = $('#start-button');
let stopButton = $('#stop-button');
let restartButton = $('#restart-button');
const cancelButton = $('#cancel-button');
let timerId;
let remainingTime;
let formattedTime;
const workTime = 25; // タイマーの作業時間(分)

// タイマーのカウントダウン
function setTimer(finishTime) {
  const now = new Date();

  if (dayjs(now).isBefore(dayjs(finishTime))) {
    remainingTime = finishTime.diff(now);
    formattedTime = dayjs(remainingTime).tz().format('mm:ss');
    timer.text(formattedTime);
    $('title').html(formattedTime);
  } else {
  }
}

$('body').on('click', '#start-button', () => {
  startButton = $('#start-button');
  startButton.replaceWith(
    '<button id="stop-button" type="button">一時停止</button>'
  );

  const finishTime = dayjs().add(workTime, 'm');
  timerId = setInterval(function(){setTimer(finishTime)}, 500);
});

$('body').on('click', '#stop-button', () => {
  stopButton = $('#stop-button');
  stopButton.replaceWith(
    '<button id="restart-button" type="button">再開</button>'
  );

  clearInterval(timerId);
});

$('body').on('click', '#restart-button', () => {
  restartButton = $('#restart-button');
  restartButton.replaceWith(
    '<button id="stop-button" type="button">一時停止</button>'
  );

  const finishTime = dayjs().add(remainingTime, 'ms');
  timerId = setInterval(function(){setTimer(finishTime)}, 500);
});

cancelButton.click(() => {
  stopButton = $('#stop-button');
  restartButton = $('#restart-button');
  
  if (stopButton.length) {
    stopButton.replaceWith(
      '<button id="start-button" type="button">開始</button>'
    );
  } else if (restartButton.length) {
    restartButton.replaceWith(
      '<button id="start-button" type="button">開始</button>'
    );
  }

  remainingTime = workTime * 60 * 1000;
  formattedTime = dayjs(remainingTime).tz().format('mm:ss');
  timer.text(formattedTime);
  clearInterval(timerId);
});