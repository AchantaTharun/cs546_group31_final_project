function showSuccessBanner() {
  const successBanner = document.getElementById("successBanner");
  successBanner.style.display = "block";
  setTimeout(() => {
    successBanner.style.display = "none";
  }, 3000);
}

async function createMealPlan(trainerId) {
  try {
    event.preventDefault();
    const title = document.getElementById("title").value;
    const session = document.getElementById("session").value;
    const assignedTo = document.getElementById("assignedTo").value;
    const description = document.getElementById("description").value;
    const mealSlotsContainer = document.getElementById("mealsContainer");
    const mealSlots = Array.from(
      mealSlotsContainer.getElementsByClassName("mealSlotGroup")
    ).map((group) => {
      const name = group.querySelector('[name="mealName[]"]').value;
      const description = group.querySelector(
        '[name="mealDescription[]"]'
      ).value;
      return { name, description };
    });
    const formData = {
      title,
      assignedTo,
      assignedBy: trainerId,
      description,
      meals: mealSlots,
    };
    let assignedToName = document.getElementById("assignedTo").textContent;
    const apiUrl = "/meal-plans";
    await apiRequest("post", apiUrl, formData);
    alert(`Meal plan created successfully and assigned to ${assignedToName}!`);
    setTimeout(() => {
      window.location.href = "/trainer/mealplans";
    }, 200);
  } catch (err) {
    console.log(err);
  }
}

async function loadAssignToOptions(sessionId) {
  try {
    const assignedToSelect = document.getElementById("assignedTo");
    assignedToSelect.innerHTML = "";
    const apiUrl = `/session/${sessionId}/users`;

    const response = await apiRequest("get", apiUrl);
    const users = response.users;

    users.forEach((user) => {
      const option = document.createElement("option");
      option.value = user._id;
      option.textContent = user.userName;
      assignedToSelect.appendChild(option);
    });
  } catch (err) {
    console.log(err);
  }
}
document.addEventListener("DOMContentLoaded", function () {
  const mealsContainer = document.getElementById("mealsContainer");
  const addMealSlotButton = document.getElementById("addMealSlot");

  addMealSlotButton.addEventListener("click", function () {
    addMealSlot();
  });

  mealsContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("removeSlot")) {
      removeMealSlot(event.target.parentNode);
    }
  });

  function addMealSlot() {
    const mealSlotGroup = document.createElement("div");

    mealSlotGroup.classList.add("mealSlotGroup");
    mealSlotGroup.classList.add("col-md-3");
    const mealName = createMealNameInput();
    const mealDescription = createMealDescriptonInput();
    const removeButton = createRemoveButton();

    mealSlotGroup.appendChild(mealName);
    mealSlotGroup.appendChild(mealDescription);
    mealSlotGroup.appendChild(removeButton);

    mealsContainer.appendChild(mealSlotGroup);
  }

  function createMealNameInput() {
    const input = document.createElement("input");
    input.name = "mealName[]";
    input.classList.add("form-control");
    input.placeholder = "meal name";
    input.required = true;

    return input;
  }

  function createMealDescriptonInput() {
    const input = document.createElement("textarea");
    input.name = "mealDescription[]";
    input.classList.add("form-control");
    input.placeholder = "meal details";
    input.required = true;

    return input;
  }

  function createRemoveButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("removeSlot");
    button.classList.add("btn");
    button.classList.add("btn-danger");
    button.classList.add("btn-sm");
    button.textContent = "Remove";

    return button;
  }

  function removeMealSlot(sessionSlotGroup) {
    mealsContainer.removeChild(sessionSlotGroup);
  }
});
