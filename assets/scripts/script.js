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
const data = {
  'heading-messages': {
    wakeup: 'wake up !!',
    lunch: "let's have some lunch !!",
    night: 'good night !!',
    party: "it's party time !!",
  },
  'main-messages': {
    wakeup: 'good morning !!',
    lunch: 'good afternoon !!',
    night: 'good night !!',
  },
  'time-ranges': {
    wakeup: [
      { text: '5 AM - 6 AM', value: '05A06A' },
      { text: '6 AM - 7 AM', value: '06A07A' },
      { text: '7 AM - 8 AM', value: '07A08A' },
      { text: '8 AM - 9 AM', value: '08A09A' },
      { text: '9 AM - 10 AM', value: '09A10A' },
      { text: '10 AM - 11 AM', value: '10A11A' },
    ],
    lunch: [
      { text: '11 AM - 12 PM', value: '11A12P' },
      { text: '12 PM - 1 PM', value: '12P01P' },
      { text: '1 PM - 2 PM', value: '01P02P' },
      { text: '2 PM - 3 PM', value: '02P03P' },
      { text: '3 PM - 4 PM', value: '03P04P' },
      { text: '4 PM - 5 PM', value: '04P05P' },
      { text: '5 PM - 6 PM', value: '05P06P' },
      { text: '6 PM - 7 PM', value: '06P07P' },
    ],
    night: [
      { text: '7 PM - 8 PM', value: '07P08P' },
      { text: '8 PM - 9 PM', value: '08P09P' },
      { text: '9 PM - 10 PM', value: '09P10P' },
      { text: '10 PM - 11 PM', value: '10P11P' },
      { text: '11 PM - 12 AM', value: '11P12A' },
      { text: '12 AM - 1 AM', value: '12A01A' },
      { text: '1 AM - 2 AM', value: '01A02A' },
      { text: '2 AM - 3 AM', value: '02A03A' },
      { text: '3 AM - 4 AM', value: '03A04A' },
      { text: '4 AM - 5 AM', value: '04A05A' },
    ],
  },
};

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
  wakeup: +localStorage.getItem('time-wakeup') || 7,
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
