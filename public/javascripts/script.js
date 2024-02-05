'use strict';
const timer = $('#timer');
const resetButton = $('#reset-button');
let startButton = $('#start-button');
let stopButton = $('#stop-button');
let okButton = $('#ok-button');
const skipButton = $('#skip-button');

let timerId;
let remainingTime;
let formattedTime;

const timerSound = new Audio('../sounds/timer-sound.mp3');
let playPromise;

const workTime = 25; // タイマーの作業時間(分)
const breakTime = 5; // タイマーの休憩時間(分)
const longBreakTime = 15; // タイマーの最後の休憩時間(分)
const loop = 4; // workTimeとbreakTimeを何回繰り返すか
const totalTimeMap = new Map; // タイマーの作業時間と休憩時間を表したmap
for (let i = 1; i <= loop; i++) {
  totalTimeMap.set(`worktime${i}`, workTime);
  if (i !== loop) {
    totalTimeMap.set(`breakTime${i}`, breakTime);
  } else {
    totalTimeMap.set('longBreakTime', longBreakTime);
  }
}
let iterator = totalTimeMap.entries();

timerInit();
function timerInit() {
  clearInterval(timerId);
  changeToStartButton();
  if (playPromise !== undefined) {
    playPromise.then(_ => {
      timerSound.pause();
      timerSound.load();
    });
  }

  // longBreakTimeが終了したら最初に戻る
  let nextIterator = iterator.next().value;
  if (nextIterator === undefined) {
    iterator = totalTimeMap.entries();
    nextIterator = iterator.next().value;
  }

  remainingTime = nextIterator[1] * 1000 * 60; // これから開始する作業時間もしくは休憩時間を取得
  formattedTime = dayjs(remainingTime + 999).format('mm:ss'); // ミリ秒以下を切り上げてフォーマット
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
  clearInterval(timerId);
  stopButton = $('#stop-button');
  stopButton.replaceWith(
    '<button id="ok-button" type="button">OK</button>'
  );
  timerSound.loop = true;
  playPromise = timerSound.play();
}

resetButton.click(() => {
  iterator = totalTimeMap.entries();
  timerInit();
});

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
  clearInterval(timerId);
  changeToStartButton();
});

$('body').on('click', '#ok-button', () => {
  timerInit();
});

skipButton.click(() => {
  timerInit();
});

function changeToStartButton() {
  stopButton = $('#stop-button');
  stopButton.replaceWith(
    '<button id="start-button" type="button">START</button>'
  );
  okButton = $('#ok-button');
  okButton.replaceWith(
    '<button id="start-button" type="button">START</button>'
  );
}