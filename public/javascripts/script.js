'use strict';
const timer = $('#timer');
const timerStatus = $('#timer-status');

let timerId;
let timerSoundExpire;
let remainingTime;
let formattedTime;
const timerSound = new Audio('../sounds/timer-sound.mp3');
let playPromise;
let wakeLock = null;

const workTime = Cookies.get('workTime') || 25;
const breakTime = Cookies.get('breakTime') || 5;
const loop = Cookies.get('loop') || 4;
const lastBreakTime = Cookies.get('lastBreakTime') || 15;
const sortedTime = [];
// workTime, breakTime, loop, lastBreakTimeをまとめる
for (let i = 1; i <= loop; i++) {
  sortedTime.push(workTime);
  if (i < loop) {
    sortedTime.push(breakTime);
  } else {
    sortedTime.push(lastBreakTime);
  }
}
let iterator = sortedTime[Symbol.iterator]();
let workAndBreakCount = 0;

denySleepMode().then(init);

async function init() {
  clearInterval(timerId);
  clearTimeout(timerSoundExpire);
  allowSleepMode();
  workAndBreakCount++;
  timerStatus.text(workAndBreakCount % 2 === 0 ? '次:休憩時間' : '次:作業時間');
  timerStatus.append(`, ${Math.ceil(workAndBreakCount / 2)}周目`);  

  $('#stop-button').replaceWith(
    '<button id="start-button" type="button">START</button>'
  );
  $('#ok-button').replaceWith(
    '<button id="start-button" type="button">START</button>'
  );

  if (playPromise !== undefined) {
    playPromise.then(_ => {
      timerSound.pause();
      timerSound.load();
    });
  }

  // lastBreakTimeが終了したら最初に戻る
  let nextIterator = iterator.next().value;
  if (nextIterator === undefined) {
    iterator = sortedTime[Symbol.iterator]();
    nextIterator = iterator.next().value;
  }

  remainingTime = nextIterator * 1000 * 60;
  formattedTime = getformattedTime(remainingTime);
  timer.text(formattedTime);
  $('title').html('トマトタイマー');
}

// タイマーのカウントダウン
function setTimer(finishTime) {
  const now = new Date();
  remainingTime = finishTime.getTime() - now.getTime();
  formattedTime = getformattedTime(remainingTime);

  if (remainingTime <= 0) {
    formattedTime = '00:00';
    timerEnd();
  }

  timer.text(formattedTime);
  $('title').html(`${formattedTime} トマトタイマー`);
}

function timerEnd() {
  clearInterval(timerId);
  $('#stop-button').replaceWith(
    '<button id="ok-button" type="button">OK</button>'
  );
  timerSound.loop = true;
  playPromise = timerSound.play();

  timerSoundExpire = setTimeout(() => {
    if (playPromise !== undefined) {
      playPromise.then(_ => {
        timerSound.pause();
        timerSound.load();
      });
    }

    allowSleepMode();
  }, 1000 * 60 * 10);
}

$('#reset-button').click(() => {
  workAndBreakCount = 0;
  iterator = sortedTime[Symbol.iterator]();
  init();
});

$('body').on('click', '#start-button', async () => {
  $('#start-button').replaceWith(
    '<button id="stop-button" type="button">STOP</button>'
  );
  timerSound.load();
  timerStatus.text(workAndBreakCount % 2 === 0 ? '現在:休憩時間' : '現在:作業時間');
  timerStatus.append(`, ${Math.ceil(workAndBreakCount / 2)}周目`);

  const now = new Date();
  const finishTime = new Date();
  finishTime.setMilliseconds(now.getMilliseconds() + remainingTime);
  timerId = setInterval(function(){setTimer(finishTime)}, 50);

  denySleepMode();
});

$('body').on('click', '#stop-button', () => {
  clearInterval(timerId);
  $('#stop-button').replaceWith(
    '<button id="start-button" type="button">START</button>'
  );
  
  allowSleepMode();
});

$('body').on('click', '#ok-button', init);

$('#skip-button').click(init);

function getformattedTime(remainingTime) {
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

async function denySleepMode() {
  // wakeLockに対応している場合のみ、自動スリープを禁止
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
    } catch (err) {
      console.error(err.name, err.message);
    }
  }
}

function allowSleepMode() {
  if (wakeLock !== null) {
      wakeLock.release().then(() => {
        wakeLock = null;
      });
  }
}