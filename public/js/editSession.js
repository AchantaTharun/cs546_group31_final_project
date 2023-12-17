async function editSession(sessionId) {
  try {
    const apiUrl = `/session/${sessionId}`;
    const response = await apiRequest("get", apiUrl);

    if (response && response.session) {
      populateFormWithSessionData(response.session);
      document.getElementById("css").classList.add("active");

      document.getElementById("createSession").textContent = "Update";
      document.getElementById("createSession").id = "updateSession";
      inactiveSessionErrorDiv.hidden = true;
    } else {
      console.error("Error fetching session details:", response);
    }
  } catch (error) {
    console.error("Error fetching session details:", error);
  }
}

function populateFormWithSessionData(sessionData) {
  document.getElementById("name").value = sessionData.name;
  document.getElementById("place").value = sessionData.place;
  document.getElementById("capacity").value = sessionData.capacity;
  document.getElementById("workoutType").value = sessionData.workoutType;
  document.getElementById("startDate").value = formatDate(
    sessionData.startDate
  );
  document.getElementById("endDate").value = formatDate(sessionData.endDate);
  clearSessionSlots();

  const sessionSlotsContainer = document.getElementById(
    "sessionSlotsContainer"
  );
  sessionData.sessionSlots.forEach((slot) => {
    const sessionSlotGroup = document.createElement("div");
    sessionSlotGroup.classList.add("sessionSlotGroup");

    const weekdaysSelect = createWeekdaysSelect(slot.weekday);
    const timeSlotsSelect = createTimeSlotsSelect(slot.timeSlot);

    sessionSlotGroup.appendChild(weekdaysSelect);
    sessionSlotGroup.appendChild(timeSlotsSelect);
    //sessionSlotGroup.appendChild(removeButton);

    sessionSlotsContainer.appendChild(sessionSlotGroup);
  });
  const sessionIdInput = document.createElement("input");
  sessionIdInput.type = "hidden";
  sessionIdInput.name = "sessionId";
  sessionIdInput.value = sessionData._id;
  document.getElementById("createSessionForm").appendChild(sessionIdInput);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}

function createWeekdaysSelect(selectedValue) {
  const select = document.createElement("select");
  select.name = "weekdays[]";
  select.required = true;

  const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  weekdays.forEach((day) => {
    const option = document.createElement("option");
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
  const select = document.createElement("select");
  select.name = "timeSlots[]";
  select.required = true;

  const timeSlots = [
    "08:00-09:00",
    "09:00-10:00",
    "10:00-11:00",
    "11:00-12:00",
    "12:00-13:00",
    "13:00-14:00",
    "14:00-15:00",
    "15:00-16:00",
    "16:00-17:00",
    "17:00-18:00",
    "18:00-19:00",
    "19:00-20:00",
    "20:00-21:00",
    "21:00-22:00",
  ];

  timeSlots.forEach((slot) => {
    const option = document.createElement("option");
    option.value = slot;
    option.text = slot;
    if (slot === selectedValue) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  return select;
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("updateSession").addEventListener("click", () => {
    const name = document.getElementById("name").value;
    const place = document.getElementById("place").value;
    const capacity = document.getElementById("capacity").value;
    const workoutType = document.getElementById("workoutType").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    const sessionSlotsContainer = document.getElementById(
      "sessionSlotsContainer"
    );
    const sessionSlots = Array.from(
      sessionSlotsContainer.getElementsByClassName("sessionSlotGroup")
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
      sessionId,
    };

    updateSession(formData);
  });
});

async function updateSession(formData) {
  try {
    const form = document.getElementById("createSessionForm");
    const apiUrl = `/updatesession/${formData.sessionId}`;
    const response = await apiRequest("put", apiUrl, formData);

    //console.log('Session created successfully!', response);
    window.location.href = "/trainer/sessions";
  } catch (error) {
    console.error("Error creating session:", error);
    const errorsList = error.errors
      .map((error) => `<li>${error}</li>`)
      .join("");
    createSessionErrorDiv.hidden = false;
    createSessionErrorDiv.innerHTML = `<p>Please correct the errors:</p><ul>${errorsList}</ul>`;
  }
}
