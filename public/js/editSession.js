async function editSession(sessionId) {
  try {
    const apiUrl = `/session/${sessionId}`;
    const response = await apiRequest('get', apiUrl);

    if (response && response.session) {
      populateFormWithSessionData(response.session);
      section.classList.add('active');
      inactiveSessionErrorDiv.hidden = true;
    } else {
      console.error('Error fetching session details:', response);
    }
  } catch (error) {
    console.error('Error fetching session details:', error);
  }
}

function populateFormWithSessionData(sessionData) {
  document.getElementById('name').value = sessionData.name;
  document.getElementById('place').value = sessionData.place;
  document.getElementById('capacity').value = sessionData.capacity;
  document.getElementById('workoutType').value = sessionData.workoutType;
  document.getElementById('startDate').value = formatDate(
    sessionData.startDate
  );
  document.getElementById('endDate').value = formatDate(sessionData.endDate);

  clearSessionSlots();

  const sessionSlotsContainer = document.getElementById(
    'sessionSlotsContainer'
  );
  sessionData.sessionSlots.forEach((slot) => {
    const sessionSlotGroup = document.createElement('div');
    sessionSlotGroup.classList.add('sessionSlotGroup');

    const weekdaysSelect = createWeekdaysSelect(slot.weekday);
    const timeSlotsSelect = createTimeSlotsSelect(slot.timeSlot);

    sessionSlotGroup.appendChild(weekdaysSelect);
    sessionSlotGroup.appendChild(timeSlotsSelect);
    //sessionSlotGroup.appendChild(removeButton);

    sessionSlotsContainer.appendChild(sessionSlotGroup);
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

function createWeekdaysSelect(selectedValue) {
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
    if (day === selectedValue) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  return select;
}

function createTimeSlotsSelect(selectedValue) {
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

  timeSlots.forEach((slot) => {
    const option = document.createElement('option');
    option.value = slot;
    option.text = slot;
    if (slot === selectedValue) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  return select;
}
