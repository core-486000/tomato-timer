'use strict';
const timer = $('#timer');
const timerStatus = $('#timer-status');

let timerId;
let expireTimerSound;
let remainingTime;
let formatTime;
const timerSound = new Audio('../sounds/timer-sound.mp3');
let playPromise;
let wakeLock = null;

const workTime = Cookies.get('workTime') || 25;
const breakTime = Cookies.get('breakTime') || 5;
const loop = Cookies.get('loop') || 4;
const lastBreakTime = Cookies.get('lastBreakTime') || 15;
const totalTimeMap = new Map;
// workTime, breakTime, loop, lastBreakTimeをまとめる
for (let i = 1; i <= loop; i++) {
  totalTimeMap.set(`worktime${i}`, workTime);
  if (i < loop) {
    totalTimeMap.set(`breakTime${i}`, breakTime);
  } else {
    totalTimeMap.set('lastBreakTime', lastBreakTime);
  }
}
let iterator = totalTimeMap.entries();
let workBreakCount = 0;

(async () => {
  // 画面の自動スリープを禁止
  wakeLock = await navigator.wakeLock.request('screen');
})()
.then(init);

async function init() {
  clearInterval(timerId);
  clearTimeout(expireTimerSound);
  workBreakCount++;
  timerStatus.text(workBreakCount % 2 === 0 ? '次:休憩時間' : '次:作業時間');
  timerStatus.append(`, ${Math.ceil(workBreakCount / 2)}周目`);  
  changeToStartButton();

  if (wakeLock !== null) {
  // 画面の自動スリープを許可
    wakeLock.release().then(() => {
      wakeLock = null;
    });
  }

  if (playPromise !== undefined) {
    playPromise.then(_ => {
      timerSound.pause();
      timerSound.load();
    });
  }

  // lastBreakTimeが終了したら最初に戻る
  let nextIterator = iterator.next().value;
  if (nextIterator === undefined) {
    iterator = totalTimeMap.entries();
    nextIterator = iterator.next().value;
  }

  remainingTime = nextIterator[1] * 1000 * 60;
  formatTime = getFormatTime(remainingTime);
  timer.text(formatTime);
  $('title').html('トマトタイマー');
}

// タイマーのカウントダウン
function setTimer(finishTime) {
  const now = new Date();
  remainingTime = finishTime.getTime() - now.getTime();
  formatTime = getFormatTime(remainingTime);
  timer.text(formatTime);
  $('title').html(`${formatTime} トマトタイマー`);

  if (remainingTime <= 0) {
    timerEnd();
  }
}

function timerEnd() {
  clearInterval(timerId);
  $('#stop-button').replaceWith(
    '<button id="ok-button" type="button">OK</button>'
  );
  timerSound.loop = true;
  playPromise = timerSound.play();

  expireTimerSound = setTimeout(() => {
    if (playPromise !== undefined) {
      playPromise.then(_ => {
        timerSound.pause();
        timerSound.load();
      });
    }

    wakeLock.release().then(() => {
      wakeLock = null;
    });
  }, 1000 * 60 * 10);
}

$('#reset-button').click(() => {
  workBreakCount = 0;
  iterator = totalTimeMap.entries();
  init();
});

$('body').on('click', '#start-button', async () => {
  $('#start-button').replaceWith(
    '<button id="stop-button" type="button">STOP</button>'
  );
  timerSound.load();
  timerStatus.text(workBreakCount % 2 === 0 ? '現在:休憩時間' : '現在:作業時間');
  timerStatus.append(`, ${Math.ceil(workBreakCount / 2)}周目`);

  const now = new Date();
  const finishTime = new Date();
  finishTime.setMilliseconds(now.getMilliseconds() + remainingTime);
  timerId = setInterval(function(){setTimer(finishTime)}, 50);

  wakeLock = await navigator.wakeLock.request('screen');
});

$('body').on('click', '#stop-button', () => {
  clearInterval(timerId);
  changeToStartButton();
  wakeLock.release().then(() => {
    wakeLock = null;
  });
});

$('body').on('click', '#ok-button', init);

$('#skip-button').click(init);

function changeToStartButton() {
  $('#stop-button').replaceWith(
    '<button id="start-button" type="button">START</button>'
  );
  $('#ok-button').replaceWith(
    '<button id="start-button" type="button">START</button>'
  );
}

function getFormatTime(remainingTime) {
  // ミリ秒以下を切り上げ
  let ceilRemainingTime = Math.ceil(remainingTime / 10) * 10;
  ceilRemainingTime = Math.ceil(ceilRemainingTime / 100) * 100;
  ceilRemainingTime = Math.ceil(ceilRemainingTime / 1000) * 1000;

  let minutes = new Date(ceilRemainingTime).getMinutes();
  // 60分以上の時、正しく表示する
  if (ceilRemainingTime >= 1000 * 60 * 60) {
    minutes += 60;
  }
  minutes = ('0' + minutes).slice(-2);

  let seconds = new Date(ceilRemainingTime).getSeconds();
  seconds = ('0' + seconds).slice(-2);
  return `${minutes}:${seconds}`;
}