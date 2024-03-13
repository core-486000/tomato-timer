'use strict';
const timer = $('#timer');
const timerStatus = $('#timer-status');

let timerId;
let timerSoundExpire;
let remainingTime;
let formattedTime;
let previousTime;
const timerSound = new Audio('../sounds/timer-sound.mp3');
let playPromise;
let wakeLock = null;
const workTime = Cookies.get('workTime') || 25;
const breakTime = Cookies.get('breakTime') || 5;
const loop = Cookies.get('loop') || 4;
const lastBreakTime = Cookies.get('lastBreakTime') || 15;
const sortedTime = [];
let iterator = sortedTime[Symbol.iterator]();
let settingTime;
let workAndBreakCount = 0;

(() => {
  // workTime, breakTime, loop, lastBreakTimeをまとめる
  for (let i = 1; i <= loop; i++) {
    sortedTime.push(workTime);
    if (i < loop) {
      sortedTime.push(breakTime);
    } else {
      sortedTime.push(lastBreakTime);
    }
  }

  denySleepMode();
  init();
})();

function init() {
  clearInterval(timerId);
  clearTimeout(timerSoundExpire);
  allowSleepMode();
  workAndBreakCount++;
  timerStatus.text(workAndBreakCount % 2 === 0 ? '次:休憩時間' : '次:作業時間');
  timerStatus.append(`, ${Math.ceil(workAndBreakCount / 2)}周目`);

  $('#stop-button').replaceWith(
    `<button id="start-button" class="btn btn-outline-light btn-lg me-2" type="button">
      <i class="bi bi-play-fill"></i>
    </button>`
  );
  $('#ok-button').replaceWith(
    `<button id="start-button" class="btn btn-outline-light btn-lg me-2" type="button">
      <i class="bi bi-play-fill"></i>
    </button>`
  );

  if (playPromise !== undefined) {
    playPromise.then(_ => {
      timerSound.pause();
      timerSound.load();
    });
  }

  // lastBreakTimeが終了したら最初に戻る
  settingTime = iterator.next().value;
  if (settingTime === undefined) {
    iterator = sortedTime[Symbol.iterator]();
    settingTime = iterator.next().value;
  }

  remainingTime = settingTime * 1000 * 60;
  // ミリ秒以下を切り上げてフォーマット
  formattedTime = dayjs(remainingTime + 999).format('mm:ss');
  timer.text(formattedTime);
  $('title').html('トマトタイマー');
}

// タイマーのカウントダウン
function setTimer(finishTime) {
  const now = dayjs();
  remainingTime = finishTime.diff(now);
  // ミリ秒以下を切り上げてフォーマット
  formattedTime = dayjs(remainingTime + 999).format('mm:ss');

  // 経過したworkTimeをCookieに保存
  if (workAndBreakCount % 2 === 1) {
    const elapsedWorkTimeMap = Cookies.get('elapsedWorkTimeJson') ?
      new Map(Object.entries(JSON.parse(Cookies.get('elapsedWorkTimeJson')))) : new Map;
    const timeDifference = now.diff(previousTime);
    previousTime = dayjs();
    let elapsedWorkTimeMapKey = dayjs().format('YYYY/MM/DD');
    const elapsedWorkTimeMapValue = elapsedWorkTimeMap.get(elapsedWorkTimeMapKey) || 0;
    elapsedWorkTimeMap.set(elapsedWorkTimeMapKey, elapsedWorkTimeMapValue + timeDifference);
    const elapsedWorkTimeJson = JSON.stringify(Object.fromEntries(elapsedWorkTimeMap));
    Cookies.set('elapsedWorkTimeJson', elapsedWorkTimeJson, { expires: 365 });
  }

  if (remainingTime <= 0) {
    formattedTime = '00:00';
    finishTimer();
  }

  timer.text(formattedTime);
  $('title').html(`${formattedTime} トマトタイマー`);
}

function finishTimer() {
  clearInterval(timerId);
  $('#stop-button').replaceWith(
    `<button id="ok-button" class="btn btn-outline-light btn-lg me-2" type="button">
      <i class="bi bi-check"></i>
    </button>`
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
    `<button id="stop-button" class="btn btn-outline-light btn-lg me-2" type="button">
      <i class="bi bi-pause-fill"></i>
    </button>`
  );
  timerSound.load();
  timerStatus.text(workAndBreakCount % 2 === 0 ? '現在:休憩時間' : '現在:作業時間');
  timerStatus.append(`, ${Math.ceil(workAndBreakCount / 2)}周目`);

  previousTime = dayjs();
  const finishTime = dayjs().add(remainingTime, 'ms');
  timerId = setInterval(setTimer, 1000, finishTime);
  denySleepMode();
});

$('body').on('click', '#stop-button', () => {
  clearInterval(timerId);
  $('#stop-button').replaceWith(
    `<button id="start-button" class="btn btn-outline-light btn-lg me-2" type="button">
    <i class="bi bi-play-fill"></i>
    </button>`
  );
  allowSleepMode();
});

$('body').on('click', '#ok-button', init);

$('#skip-button').click(init);

// #change-time-dropdownが開かれた時
$('#change-time-dropdown').on('show.bs.dropdown', () => {
  // csrfTokenの有効期限が切れないように更新
  $('#csrf-token-div').load('/timer #csrf-token-input');
});

$('#default-button').click(() => {
  if (window.confirm('デフォルト値に戻しますか？')) {
    $('#work-time').val(25);
    $('#break-time').val(5);
    $('#loop').val(4);
    $('#last-break-time').val(15);
  }
});

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