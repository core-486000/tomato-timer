'use strict';
const timer = $('#timer');
let startButton = $('#start-button');
let stopButton = $('#stop-button');
let restartButton = $('#restart-button');
let okButton = $('#ok-button');
const cancelButton = $('#cancel-button');
let timerId;
let remainingTime;
let formattedTime;
const timerSound = new Audio('../sounds/timer-sound.mp3');
let playPromise;
const workTime = 1; // タイマーの作業時間(分)

timerInit();
function timerInit() {
  stopButton = $('#stop-button');
  restartButton = $('#restart-button');
  okButton = $('#ok-button');
  if (stopButton.length) {
    stopButton.replaceWith(
      '<button id="start-button" type="button">開始</button>'
    );
  } else if (restartButton.length) {
    restartButton.replaceWith(
      '<button id="start-button" type="button">開始</button>'
    );
  } else if (okButton.length) {
    okButton.replaceWith(
      '<button id="start-button" type="button">開始</button>'
    );
  }

  if (playPromise !== undefined) {
    playPromise.then(_ => {
      timerSound.pause();
      timerSound.load();
    });
  }

  remainingTime = workTime * 60 * 1000;
  formattedTime = dayjs(remainingTime).format('mm:ss');
  timer.text(formattedTime);
  $('title').html('トマトタイマー');
  clearInterval(timerId);
}

// タイマーのカウントダウン
function setTimer(finishTime) {
  const now = new Date();

  if (dayjs(now).isBefore(dayjs(finishTime))) {
    remainingTime = finishTime.diff(now);
    formattedTime = dayjs(remainingTime).format('mm:ss');
    timer.text(formattedTime);
    $('title').html(`${formattedTime} トマトタイマー`);
  } else {
    timerEnd();
  }
}

function timerEnd() {
  stopButton = $('#stop-button');
  stopButton.replaceWith(
    '<button id="ok-button" type="button">OK</button>'
  );

  timerSound.volume = 0.3;
  timerSound.loop = true;
  playPromise = timerSound.play();
  clearInterval(timerId);
}

$('body').on('click', '#start-button', () => {
  startButton = $('#start-button');
  startButton.replaceWith(
    '<button id="stop-button" type="button">一時停止</button>'
  );

  const finishTime = dayjs().add(workTime, 'm');
  timerId = setInterval(function(){setTimer(finishTime)}, 200);
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

$('body').on('click', '#ok-button', () => {
  timerInit();
});

cancelButton.click(() => {
  timerInit();
});