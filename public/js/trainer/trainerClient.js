const createSessionForm = document.getElementById('createSessionForm');
const createSessionErrorDiv = document.querySelector('.add-session-error');
const inactiveSessionErrorDiv = document.querySelector(
  '.inactivesession-operation-error'
);
const section = document.querySelector('section'),
  overlay = document.querySelector('.overlay'),
  showBtn = document.querySelector('.show-modal'),
  closeBtn = document.querySelector('.close-btn');

showBtn.addEventListener('click', () => {
  section.classList.add('active');
  inactiveSessionErrorDiv.hidden = true;
});

overlay.addEventListener('click', () => section.classList.remove('active'));

closeBtn.addEventListener('click', () => {
  section.classList.remove('active');
  createSessionErrorDiv.hidden = true;
  createSessionErrorDiv.innerHTML = '';
  createSessionForm.reset();
  clearSessionSlots();
  inactiveSessionErrorDiv.hidden = true;
});

document.getElementById('createSession').addEventListener('click', () => {
  const name = document.getElementById('name').value;
  const place = document.getElementById('place').value;
  const capacity = document.getElementById('capacity').value;
  const workoutType = document.getElementById('workoutType').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  const sessionSlotsContainer = document.getElementById(
    'sessionSlotsContainer'
  );
  const sessionSlots = Array.from(
    sessionSlotsContainer.getElementsByClassName('sessionSlotGroup')
  ).map((group) => {
    const weekday = group.querySelector('[name="weekdays[]"]').value;
    const timeSlot = group.querySelector('[name="timeSlots[]"]').value;
    return { weekday, timeSlot };
  });

  const formData = {
    sessionName: name,
    sessionPlace: place,
    sessionCapacity: capacity,
    sessionSlots,
    workoutType,
    startDate,
    endDate,
  };

  createSession(formData);
});

async function createSession(formData) {
  try {
    const form = document.getElementById('createSessionForm');
    const apiUrl = '/session/createsession';
    const response = await apiRequest('post', apiUrl, formData);

    //console.log('Session created successfully!', response);
    window.location.href = '/trainer/sessions';
  } catch (error) {
    console.error('Error creating session:', error);
    const errorsList = error.errors
      .map((error) => `<li>${error}</li>`)
      .join('');
    createSessionErrorDiv.hidden = false;
    createSessionErrorDiv.innerHTML = `<p>Please correct the errors:</p><ul>${errorsList}</ul>`;
  }
}

document.addEventListener('DOMContentLoaded', function () {
  inactiveSessionErrorDiv.hidden = true;
  const sessionSlotsContainer = document.getElementById(
    'sessionSlotsContainer'
  );
  const addSessionSlotButton = document.getElementById('addSessionSlot');

  addSessionSlotButton.addEventListener('click', function () {
    addSessionSlot();
  });

  sessionSlotsContainer.addEventListener('click', function (event) {
    if (event.target.classList.contains('removeSlot')) {
      removeSessionSlot(event.target.parentNode);
    }
  });

  function addSessionSlot() {
    const sessionSlotGroup = document.createElement('div');
    sessionSlotGroup.classList.add('sessionSlotGroup');

    const weekdaysSelect = createWeekdaysSelect();
    const timeSlotsSelect = createTimeSlotsSelect();
    const removeButton = createRemoveButton();

    sessionSlotGroup.appendChild(weekdaysSelect);
    sessionSlotGroup.appendChild(timeSlotsSelect);
    sessionSlotGroup.appendChild(removeButton);

    sessionSlotsContainer.appendChild(sessionSlotGroup);
  }

  function createWeekdaysSelect() {
    const select = document.createElement('select');
    select.name = 'weekdays[]';
    select.required = true;

    const weekdays = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];

    weekdays.forEach((day) => {
      const option = document.createElement('option');
      option.value = day;
      option.text = day;
      select.appendChild(option);
    });

    return select;
  }

  function createTimeSlotsSelect() {
    const select = document.createElement('select');
    select.name = 'timeSlots[]';
    select.required = true;

    const timeSlots = [
      '08:00-09:00',
      '09:00-10:00',
      '10:00-11:00',
      '11:00-12:00',
      '12:00-13:00',
      '13:00-14:00',
      '14:00-15:00',
      '15:00-16:00',
      '16:00-17:00',
      '17:00-18:00',
      '18:00-19:00',
      '19:00-20:00',
      '20:00-21:00',
      '21:00-22:00',
    ];

    timeSlots.forEach((day) => {
      const option = document.createElement('option');
      option.value = day;
      option.text = day;
      select.appendChild(option);
    });

    return select;
  }

  function createRemoveButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('removeSlot');
    button.textContent = 'Remove';

    return button;
  }

  function removeSessionSlot(sessionSlotGroup) {
    sessionSlotsContainer.removeChild(sessionSlotGroup);
  }
});

async function endSession(sessionId, sessionType, registeredUsersCount) {
  try {
    if (
      registeredUsersCount > 0 &&
      !confirm(
        'There are registered users for this session. Are you sure you want to end the session?'
      )
    ) {
      return;
    }
    const apiUrl = `/session/toggle/${sessionId}`;
    const response = await apiRequest('post', apiUrl);

    //console.log(`Session ${sessionId} ended successfully!`, response);
    window.location.href = '/trainer/sessions';
  } catch (error) {
    console.error(`Error toggling session ${sessionId}:`, error);
    const errorDiv = document.querySelector(
      `.${sessionType}session-operation-error`
    );
    errorDiv.hidden = false;
    errorDiv.innerHTML = `Error: ${error.errors}`;
  }
}

function clearSessionSlots() {
  sessionSlotsContainer.innerHTML = '';
}
