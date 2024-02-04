'use strict';
const timer = $('#timer');
let startButton = $('#start-button');
let stopButton = $('#stop-button');
let okButton = $('#ok-button');
let timerId;
let remainingTime;
let formattedTime;
const timerSound = new Audio('../sounds/timer-sound.mp3');
let playPromise;
const workTime = 1; // タイマーの作業時間(分)

timerInit();
function timerInit() {
  remainingTime = workTime * 60 * 1000;
  formattedTime = dayjs(remainingTime).format('mm:ss');
  timer.text(formattedTime);
  $('title').html('トマトタイマー');
}

// タイマーのカウントダウン
function setTimer(finishTime) {
  const now = new Date();
  remainingTime = finishTime.diff(now);
  formattedTime = dayjs(remainingTime + 999).format('mm:ss'); // ミリ秒以下を切り上げてフォーマット

  if (remainingTime <= 0) {
    formattedTime = '00:00';
    timerEnd();
  }

  timer.text(formattedTime);
  $('title').html(`${formattedTime} トマトタイマー`);
}

function timerEnd() {
  stopButton = $('#stop-button');
  stopButton.replaceWith(
    '<button id="ok-button" type="button">OK</button>'
  );

  timerSound.loop = true;
  playPromise = timerSound.play();
  clearInterval(timerId);
}

$('body').on('click', '#start-button', () => {
  startButton = $('#start-button');
  startButton.replaceWith(
    '<button id="stop-button" type="button">STOP</button>'
  );

  timerSound.load();
  const finishTime = dayjs().add(remainingTime, 'ms');
  timerId = setInterval(function(){setTimer(finishTime)}, 50);
});

$('body').on('click', '#stop-button', () => {
  stopButton = $('#stop-button');
  stopButton.replaceWith(
    '<button id="start-button" type="button">START</button>'
  );

  clearInterval(timerId);
});

$('body').on('click', '#ok-button', () => {
  okButton = $('#ok-button');
  okButton.replaceWith(
    '<button id="start-button" type="button">START</button>'
  );

  if (playPromise !== undefined) {
    playPromise.then(_ => {
      timerSound.pause();
      timerSound.load();
    });
  }

  timerInit();
});