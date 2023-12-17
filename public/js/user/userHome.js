const followButtons = document.querySelectorAll(".follow-btn");
const errorMessage = document.getElementById("error-message");
window.addEventListener("DOMContentLoaded", () => {
  const selectUser = document.getElementById("selectUser");
  const favoriteWorkoutLabel = document.querySelector(
    'label[for="favoriteWorkout"]'
  );
  const favoriteWorkoutSelect = document.getElementById("favoriteWorkout");

  selectUser.addEventListener("change", (event) => {
    if (event.target.value === "Gyms") {
      favoriteWorkoutLabel.style.display = "none";
      favoriteWorkoutSelect.style.display = "none";
    } else {
      favoriteWorkoutLabel.style.display = "block";
      favoriteWorkoutSelect.style.display = "block";
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("search-form");
  form.addEventListener("submit", function (event) {
    const selectUser = document.getElementById("selectUser");
    const favoriteWorkout = document.getElementById("favoriteWorkout");
    const state = document.getElementById("state");

    if (selectUser.value === "Choose...") {
      event.preventDefault();
      alert("Please select a user type before submitting the form.");
    } else if (
      selectUser.value !== "Gyms" &&
      favoriteWorkout.value === "Choose..."
    ) {
      event.preventDefault();
      alert("Please select a favorite workout before submitting the form.");
    } else if (state.value === "Choose...") {
      event.preventDefault();
      alert("Please select a state before submitting the form.");
    }
  });
});

if (followButtons) {
  followButtons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.preventDefault();
      const userId = e.target.dataset.userid;
      const userType = e.target.dataset.type;
      console.log(userId);
      try {
        const response = await fetch(`/user/follow/${userId}/${userType}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          window.location.reload();
        } else {
          throw new Error("Failed to follow user");
        }
      } catch (error) {
        console.error("Error:", error);
        errorMessage.classList.remove("hidden");
        setTimeout(() => {
          errorMessage.classList.add("hidden");
        }, 3000);
      }
    });
  });
}
