'use strict';
//#region - dom elements
const bodyElem = document.querySelector('body');
const hoursElem = document
  .querySelector('#header-time-display-section-hours')
  .querySelector('.value');
const minsElem = document
  .querySelector('#header-time-display-section-mins')
  .querySelector('.value');
const secsElem = document
  .querySelector('#header-time-display-section-secs')
  .querySelector('.value');
const ampmElem = document
  .querySelector('#header-time-display-section-ampm')
  .querySelector('span');
const allDropdownElems = document.querySelectorAll(
  '.main-actions-input-list'
);
const mainActionMessageElem = document
  .querySelector('.main-actions-message')
  .querySelector('span');
const mainActionButtonElem = document.querySelector(
  '.main-actions-button'
);
const mainDisplayElem = document.querySelector('.main-display');
const mainDisplayHeadingElem = document
  .querySelector('.main-display')
  .querySelector('.main-display-heading');

//#endregion - dom elements

//#region - data

const wakeup = 'wakeup';
const night = 'night';
const lunch = 'lunch';
const open = 'open';
const selected = 'selected';
const headingMessages = 'heading-messages';
const mainMessages = 'main-messages';

const data = {};
const dataFiles = [headingMessages, mainMessages];
//#endregion - data

// states
let currentTime;
let timeState;
timeState = wakeup;
timeState = night;
timeState = lunch;

//actions

const setTimeDisplay = () => {
  currentTime = new Date();
  const hours = currentTime.getHours();
  const mins = currentTime.getMinutes();
  const secs = currentTime.getSeconds();
  //prettier-ignore
  hoursElem.textContent = `0${hours > 12 ? hours - 12 : hours}`.slice(-2);
  minsElem.textContent = `0${mins}`.slice(-2);
  secsElem.textContent = `0${secs}`.slice(-2);
  ampmElem.textContent = hours > 12 ? 'PM' : 'AM';
};
const setTimeState = (timeType, timeValue) => {
  console.log(timeType, timeValue);
};
const loadData = async () => {
  for (const filename of dataFiles) {
    await fetch(`../../data/${filename}.json`)
      .then((res) => res.json())
      .then((d) => (data[filename] = d));
  }
};
const updateUI = () => {
  mainDisplayElem.classList.replace(
    mainDisplayElem.classList[1],
    `main-display-${timeState}`
  );
  mainDisplayHeadingElem.textContent =
    data[headingMessages][timeState];
};
const init = async () => {
  await loadData();
  updateUI();
};
init();

//events
window.addEventListener('load', () => {
  setInterval(setTimeDisplay, 1000);
  bodyElem.style.opacity = 1;
});

allDropdownElems.forEach((elem) =>
  elem.addEventListener('click', function () {
    this.querySelector('.select').classList.toggle(open);
  })
);

document.addEventListener('click', function (e) {
  const selects = document.querySelectorAll('.select');
  selects.forEach((select) => {
    if (!select.contains(e.target)) {
      select.classList.remove(open);
    }
  });
});

document.querySelectorAll('.custom-option').forEach((option) => {
  option.addEventListener('click', () => {
    option.parentElement.childNodes.forEach(
      (node) =>
        node.nodeName === 'SPAN' && node.classList.remove(selected)
    );
    const timeType =
      option.parentElement.parentElement.parentElement.parentElement
        .attributes['id'].value;
    const timeValue = option.attributes['data-value'].value;
    setTimeState(timeType, timeValue);
    option.classList.add('selected');
    option.parentElement.parentElement
      .querySelector('.select-trigger')
      .querySelector('span').textContent = option.textContent;
  });
});

mainActionButtonElem.addEventListener('mouseover', () => {
  mainActionButtonElem.classList.toggle('main-actions-button-hover');
});
mainActionButtonElem.addEventListener('mouseout', () => {
  mainActionButtonElem.classList.toggle('main-actions-button-hover');
});
