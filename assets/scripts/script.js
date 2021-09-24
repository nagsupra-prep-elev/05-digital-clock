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
const allDropdownSelectElems = document.querySelectorAll('.select');
const allDropdownOptionsListElems =
  document.querySelectorAll('.custom-options');
const mainActionMessageElem = document
  .querySelector('.main-actions-message')
  .querySelector('span');
const mainActionButtonElem = document.querySelector(
  '.main-actions-button'
);
const resetButtonElement = document.querySelector(
  '.main-action-input-reset'
);
const mainDisplayElem = document.querySelector('.main-display');
const mainDisplayHeadingElem = document
  .querySelector('.main-display')
  .querySelector('.main-display-heading');
const overlayElement = document.querySelector('.overlay');
const modalElement = document.querySelector('.modal');
const modalContentTextElement = document.querySelector(
  '.modal-content-text'
);
const modalCloseBtn = document.querySelector('.modal-close-btn');
const modalContentBtn = document.querySelector(
  '.modal-content-btn button'
);
//#endregion - dom elements

//#region - data
const wakeup = 'wakeup';
const night = 'night';
const lunch = 'lunch';
const party = 'party';
const open = 'open';
const selected = 'selected';
const headingMessages = 'heading-messages';
const mainMessages = 'main-messages';
const timeRanges = 'time-ranges';

// app data
const data = {};
const dataFiles = [headingMessages, mainMessages, timeRanges];

// html template for runtime
const newTimeItem = (text, value) => `
  <span
    class="custom-option" data-value=${value}
  >${text}</span>
`;
//#endregion - data

//#region - states
let currentTime = new Date();
const allTimeStates = {
  wakeup: +localStorage.getItem('time-wakeup') || 8,
  lunch: +localStorage.getItem('time-lunch') || 12,
  night: +localStorage.getItem('time-night') || 20,
};
let timeState;

// #endregion - states

//#region - actions
const getRange = (value) => {
  if (value === '12P01P') return 12;
  if (value === '12A01A') return 0;
  return +value.slice(0, 2) + (value.slice(2, 3) === 'A' ? 0 : 12);
};
const getReverseRange = (range) => {
  const value = +allTimeStates[range];
  const getUnit = (value) => {
    if (value === 0) return 'P';
    return value < 12 ? 'A' : 'P';
  };
  const modfValueL =
    (value <= 12 ? value : value - 12) + getUnit(value);
  const modfValueU =
    (value <= 11 ? value + 1 : value - 11) + getUnit(value + 1);
  const modfValue =
    String(modfValueL).padStart(3, 0) +
    String(modfValueU).padStart(3, 0);
  return data[timeRanges][range].find((v) => v.value === modfValue)
    .text;
};
const checkTimeState = (init = false) => {
  if (timeState === party) return;
  if (
    (currentTime.getMinutes() === 0 &&
      currentTime.getSeconds() === 0) ||
    init
  ) {
    const currentHours = currentTime.getHours();
    if (
      currentHours >= allTimeStates.wakeup &&
      currentHours < allTimeStates.lunch
    ) {
      timeState = wakeup;
    } else if (
      currentHours >= allTimeStates.lunch &&
      (currentHours < allTimeStates.night ||
        allTimeStates.night < allTimeStates.wakeup)
    ) {
      timeState = lunch;
    } else {
      timeState = night;
    }
    updateUI();
  }
};
const setTimeState = (timeType, timeValue) => {
  const timeState = timeType.slice(0, -5);
  localStorage.setItem(`time-${timeState}`, +getRange(timeValue));
  allTimeStates[timeState] = getRange(timeValue);
  checkTimeState(true);
};
const loadData = async () => {
  for (const filename of dataFiles) {
    await fetch(`../../data/${filename}.json`)
      .then((res) => res.json())
      .then((d) => (data[filename] = d));
  }
};
const loadDropdownData = () => {
  allDropdownElems.forEach((elem) => {
    let range = elem.parentElement.id.slice(0, -5);
    // dropdown selected option display
    const dropdownSelectedValueEl = elem.querySelector(
      '.select .select-trigger span'
    );
    dropdownSelectedValueEl.textContent = getReverseRange(range);
    // dropdown options
    const dropdownEl = elem.querySelector('.custom-options');
    dropdownEl.innerHTML = '';
    data[timeRanges][range].forEach((timedata) =>
      dropdownEl.insertAdjacentHTML(
        'beforeend',
        newTimeItem(timedata.text, timedata.value)
      )
    );
  });
};
const updateUI = () => {
  mainDisplayElem.classList.replace(
    mainDisplayElem.classList[1],
    `main-display-${timeState}`
  );
  mainDisplayHeadingElem.textContent =
    data[headingMessages][timeState];
  mainActionMessageElem.textContent = data[mainMessages][timeState];
  if (currentTime.getHours() === allTimeStates[timeState]) {
    mainActionMessageElem.parentElement.classList.remove('hidden');
  } else {
    mainActionMessageElem.parentElement.classList.add('hidden');
  }
};
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
const resetTimeStates = () => {
  localStorage.removeItem('time-wakeup');
  localStorage.removeItem('time-lunch');
  localStorage.removeItem('time-night');
  allTimeStates.wakeup = 8;
  allTimeStates.lunch = 12;
  allTimeStates.night = 20;
  loadDropdownData();
  checkTimeState(true);
  updateUI();
};
//#endregion - actions

//#region - initial load
const init = async () => {
  await loadData();
  loadDropdownData();
  checkTimeState(true);
  allDropdownOptionsListElems.forEach((options) => {
    const timeType =
      options.parentElement.parentElement.parentElement.attributes[
        'id'
      ].value.slice(0, -5);
    options.childNodes.forEach((node) => {
      if (node.nodeName === 'SPAN') {
        node.classList.remove(selected);
        if (
          getRange(node.dataset['value']) === allTimeStates[timeType]
        ) {
          node.classList.add('selected');
        }
      }
    });
  });
  updateUI();
};
//#endregion - initial load
init();

//#region - modal and overlay
const openModalOverlay = () => {
  modalElement.classList.remove('hidden');
  overlayElement.classList.remove('hidden');
};
const closeModalOverlay = () => {
  modalElement.classList.add('hidden');
  overlayElement.classList.add('hidden');
};
overlayElement.addEventListener('click', closeModalOverlay);
modalCloseBtn.addEventListener('click', closeModalOverlay);

//#endregion - modal and overlay

//#region - events
// events starting with body load
window.addEventListener('load', () => {
  // starting the Live Clock
  setInterval(() => {
    setTimeDisplay();
    checkTimeState();
  }, 1000);
  // making app visible | animation added in css
  bodyElem.style.opacity = 1;
});

// event - click handling on all dropdowns | toggle open/close
allDropdownElems.forEach((elem) =>
  elem.addEventListener('click', function () {
    this.querySelector('.select').classList.toggle(open);
  })
);

//event - click handling on single dropdown time range option
allDropdownOptionsListElems.forEach((options) => {
  //add event listerns to options | event delegation
  options.addEventListener('click', (e) => {
    //reset all options - remove selected
    options.childNodes.forEach(
      (node) =>
        node.nodeName === 'SPAN' && node.classList.remove(selected)
    );
    const selectedOption = e.target;
    const selectedTimeValue = selectedOption.dataset['value'];
    const timeType =
      options.parentElement.parentElement.parentElement.attributes[
        'id'
      ].value;
    setTimeState(timeType, selectedTimeValue);
    selectedOption.classList.add('selected');
    options.parentElement
      .querySelector('.select-trigger')
      .querySelector('span').textContent = selectedOption.textContent;
  });
});

// event - party-button
//hover effect
mainActionButtonElem.addEventListener('mouseover', () => {
  mainActionButtonElem.classList.toggle('main-actions-button-hover');
});
mainActionButtonElem.addEventListener('mouseout', () => {
  mainActionButtonElem.classList.toggle('main-actions-button-hover');
});
//click effect
mainActionButtonElem.addEventListener('click', () => {
  const btnTxt =
    mainActionButtonElem.querySelector('span').textContent;
  mainActionButtonElem.querySelector('span').textContent =
    btnTxt === 'party time!' ? 'end party :(' : 'party time!';
  timeState = timeState === party ? '' : party;
  checkTimeState(true);
  updateUI();
  mainDisplayHeadingElem.classList.remove('no-animation');
});

// reset schedule
resetButtonElement.addEventListener('click', () => {
  openModalOverlay();
  modalContentTextElement.textContent =
    'are you sure you want to reset all schedules?';
});
modalContentBtn.addEventListener('click', () => {
  resetTimeStates();
  closeModalOverlay();
});

// stopping party animation
mainDisplayHeadingElem.addEventListener('click', () => {
  if (mainDisplayElem.classList.contains('main-display-party')) {
    mainDisplayHeadingElem.classList.toggle('no-animation');
  }
});

// event - click handling on document
// 1. close other dropdown that is not in target
document.addEventListener('click', function (e) {
  allDropdownSelectElems.forEach((select) => {
    if (!select.contains(e.target)) {
      select.classList.remove(open);
    }
  });
});

//#endregion - events
