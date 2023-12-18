(function () {
  "use strict";
  window.addEventListener(
    "load",
    function () {
      var forms = document.getElementsByClassName("needs-validation");
      var firstNameInput = document.getElementById("firstName");
      var lastNameInput = document.getElementById("lastName");
      var trainerNameInput = document.getElementById("trainerName");
      var emailInput = document.getElementById("email");
      var passwordInput = document.getElementById("password");
      var passwordConfirmInput = document.getElementById("passwordConfirm");
      var workoutTypeInput = document.getElementById("workoutType");
      var streetInput = document.getElementById("street");
      var cityInput = document.getElementById("city");
      var stateInput = document.getElementById("state");
      var zipInput = document.getElementById("zip");
      var phoneInput = document.getElementById("phone");
      var backendError = document.getElementById("backendError");

      var validation = Array.prototype.filter.call(forms, function (form) {
        form.addEventListener(
          "submit",
          function (event) {
            if (backendError) backendError.hidden = true;
            if (form.checkValidity() === false) {
              event.preventDefault();
              event.stopPropagation();
            }

            if (
              firstNameInput.checkValidity() === false ||
              firstNameInput.value.trim() === "" ||
              firstNameInput.value.trim().length < 3 ||
              firstNameInput.value.trim().length > 50
            ) {
              firstNameInput.classList.add("is-invalid");
            } else {
              firstNameInput.classList.remove("is-invalid");
            }

            if (
              lastNameInput.checkValidity() === false ||
              lastNameInput.value.trim() === "" ||
              lastNameInput.value.trim().length < 3 ||
              lastNameInput.value.trim().length > 50
            ) {
              lastNameInput.classList.add("is-invalid");
            } else {
              lastNameInput.classList.remove("is-invalid");
            }

            if (
              trainerNameInput.checkValidity() === false ||
              trainerNameInput.value.trim() === "" ||
              trainerNameInput.value.trim().length < 3 ||
              trainerNameInput.value.trim().length > 50
            ) {
              trainerNameInput.classList.add("is-invalid");
            } else {
              trainerNameInput.classList.remove("is-invalid");
            }

            if (
              emailInput.checkValidity() === false ||
              emailInput.value.trim() === "" ||
              !isValidEmail(emailInput.value.trim())
            ) {
              emailInput.classList.add("is-invalid");
            } else {
              emailInput.classList.remove("is-invalid");
            }

            if (
              passwordInput.checkValidity() === false ||
              passwordInput.value.trim() === "" ||
              !isValidTrainerPassword(passwordInput.value.trim())
            ) {
              passwordInput.classList.add("is-invalid");
            } else {
              passwordInput.classList.remove("is-invalid");
            }

            if (
              passwordConfirmInput.checkValidity() === false ||
              passwordConfirmInput.value.trim() === "" ||
              passwordConfirmInput.value.trim() !== passwordInput.value.trim()
            ) {
              passwordConfirmInput.classList.add("is-invalid");
            } else {
              passwordConfirmInput.classList.remove("is-invalid");
            }

            var selectedWorkouts = Array.from(workoutTypeInput.selectedOptions);
            if (selectedWorkouts.length === 0) {
              workoutTypeInput.classList.add("is-invalid");
            } else {
              workoutTypeInput.classList.remove("is-invalid");
            }

            if (
              streetInput.checkValidity() === false ||
              streetInput.value.trim() === "" ||
              streetInput.value.trim().length < 3 ||
              streetInput.value.trim().length > 50
            ) {
              streetInput.classList.add("is-invalid");
            } else {
              streetInput.classList.remove("is-invalid");
            }

            if (
              cityInput.checkValidity() === false ||
              cityInput.value.trim() === "" ||
              cityInput.value.trim().length < 3 ||
              cityInput.value.trim().length > 50
            ) {
              cityInput.classList.add("is-invalid");
            } else {
              cityInput.classList.remove("is-invalid");
            }

            if (
              stateInput.checkValidity() === false ||
              stateInput.value.trim() === "" ||
              stateInput.value.trim().length < 3 ||
              stateInput.value.trim().length > 50
            ) {
              stateInput.classList.add("is-invalid");
            } else {
              stateInput.classList.remove("is-invalid");
            }

            if (
              zipInput.checkValidity() === false ||
              zipInput.value.trim() === "" ||
              !isValidZip(zipInput.value.trim())
            ) {
              zipInput.classList.add("is-invalid");
            } else {
              zipInput.classList.remove("is-invalid");
            }

            if (
              phoneInput.checkValidity() === false ||
              phoneInput.value.trim() === "" ||
              !isValidPhone(phoneInput.value.trim())
            ) {
              phoneInput.classList.add("is-invalid");
            } else {
              phoneInput.classList.remove("is-invalid");
            }

            if (form.checkValidity()) {
              form.classList.add("was-validated");
            }
          },
          false
        );
      });
    },
    false
  );
})();
