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
    const title = document.getElementById("title").value.trim();
    const session = document.getElementById("session").value;
    const assignedTo = document.getElementById("assignedTo").value;
    const description = document.getElementById("description").value.trim();
    const mealSlotsContainer = document.getElementById("mealsContainer");
    const errorContainer = document.getElementById("errorContainer");
    errorContainer.innerHTML = "";
    let errors = [];
    const mealSlots = Array.from(
      mealSlotsContainer.getElementsByClassName("mealSlotGroup")
    ).map((group) => {
      const name = group.querySelector('[name="mealName[]"]').value;
      const description = group.querySelector(
        '[name="mealDescription[]"]'
      ).value;
      if (!name.trim() || !description.trim()) {
        errors.push("Please enter name and description of each meal section");
      }
      return { name: name.trim(), description: description.trim };
    });

    if (!title) {
      errors.push("Please enter title");
    } else if (title.length < 5 || title.length > 20) {
      errors.push("Title should be between 5 and 20 characters long");
    }
    if (!session) {
      errors.push("Please select session");
    }
    if (!assignedTo) {
      errors.push("Please select assign to");
    }
    if (!description) {
      errors.push("Please enter description");
    } else if (description.length < 5 || description.length > 50) {
      errors.push("Description should be between 5 and 50 characters long");
    }
    if (mealSlots.length < 1) {
      errors.push("Please enter at least one meal section");
    }
    if (errors.length > 0) {
      errorContainer.innerHTML = `
        <div class='alert alert-danger mt-3'>
          <ul>
            ${errors.map((error) => `<li>${error}</li>`).join("")}
          </ul>
        </div>
      `;
      return;
    }
    const formData = {
      title,
      assignedTo,
      session,
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
    }, 100);
  } catch (err) {
    errorContainer.innerHTML = `
      <div class='alert alert-danger mt-3'>
        <p>Error: ${err.message}</p>
      </div>
    `;
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
    const errorContainer = document.getElementById("errorContainer");
    errorContainer.innerHTML = `
      <div class='alert alert-danger mt-3'>
        <p>Error: ${err.message}</p>
      </div>
    `;
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
