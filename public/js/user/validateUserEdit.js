let Errors = [];
function validateFirstName(firstName) {
  const nameRegex = /^[a-zA-Z]+$/;
  firstName = firstName.trim();
  if (firstName === "") {
    Errors.push("First Name is required");
  }
  if (firstName.length < 2) {
    Errors.push("First Name must be at least 2 characters long");
  }
  if (firstName.length > 20) {
    Errors.push("First Name must be less than 20 characters long");
  }
  if (!nameRegex.test(firstName)) {
    Errors.push("First Name can only contain letters");
  }

  return firstName;
}

function validateLastName(lastName) {
  const nameRegex = /^[a-zA-Z]+$/;
  lastName = lastName.trim();
  if (lastName === "") {
    Errors.push("Last Name is required");
  }
  if (lastName.length < 2) {
    Errors.push("Last Name must be at least 2 characters long");
  }
  if (lastName.length > 20) {
    Errors.push("Last Name must be less than 20 characters long");
  }
  if (!nameRegex.test(lastName)) {
    Errors.push("Last Name can only contain letters");
  }
  return lastName;
}

function validateBio(bio) {
  bio = bio.trim();
  if (bio === "") {
    Errors.push("Bio is required");
  }
  if (bio.length < 2) {
    Errors.push("Bio must be at least 2 characters long");
  }
  if (bio.length > 200) {
    Errors.push("Bio must be less than 200 characters long");
  }
  return bio;
}

function validateEmail(email) {
  const emailRegex = /^\S+@\S+\.\S+$/;
  email = email.trim();
  if (email === "") {
    Errors.push("Email is required");
  }
  if (!emailRegex.test(email)) {
    Errors.push("Please enter a valid email");
  }
  return email;
}

function validatePhone(phone) {
  const phoneRegex = /^\d{10}$/;
  phone = phone.trim();
  if (phone === "") {
    Errors.push("Phone is required");
  }
  if (phone.length < 10) {
    Errors.push("Phone must be at least 10 characters long");
  }
  if (phone.length > 10) {
    Errors.push("Phone must be less than 10 characters long");
  }
  if (!phoneRegex.test(phone)) {
    Errors.push("Please enter a valid phone number");
  }
  return phone;
}
function validateDateOfBirth(dateString) {
  dateString = dateString.trim();
  const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)\d{2}$/;
  if (dateString === "") {
    Errors.push("Date of Birth is required");
  }
  if (!regex.test(dateString)) {
    Errors.push("Please enter a valid date");
  }

  const [month, day, year] = dateString.split("/").map(Number);
  const date = new Date(year, month - 1, day);

  const today = new Date();
  const eighteenYearsAgo = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  );
  if (date > eighteenYearsAgo) {
    Errors.push("You must be at least 18 years old");
  }
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonth = [
    31,
    isLeapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  if (day > daysInMonth[month - 1]) {
    Errors.push("Please enter a valid date");
  }

  return dateString;
}

function validateGenderOptions(gender) {
  console.log("first");
  console.log(gender);
  gender = gender.trim();
  if (gender === "") {
    Errors.push("Gender must be selected");
  }
  if (!(gender === "male" || gender === "female" || gender === "other")) {
    Errors.push("Gender must be selected");
  }
  return gender;
}
function validateHeight(height, unit) {
  const validUnits = ["ft", "m"];

  height = height.trim();
  unit = unit.trim();
  if (height === "") {
    Errors.push("Height is required");
  }
  if (unit === "") {
    Errors.push("Unit is required");
  }
  if (!validUnits.includes(unit)) {
    Errors.push("Please select a valid unit");
  }

  const heightRegex = /^\d+(\.\d{1,2})?$/;
  const isValidHeight = heightRegex.test(height);

  if (!isValidHeight) {
    Errors.push(
      "Please enter a valid height value (numbers only) up to 2 decimal places"
    );
  }

  const heightNum = parseFloat(height);

  if (unit === "ft") {
    if (heightNum < 0 || heightNum > 10) {
      Errors.push("Please enter a valid height in feet, between 0 and 10");
    }
  } else if (unit === "m") {
    if (heightNum < 0 || heightNum > 3) {
      Errors.push("Please enter a valid height in meters, between 0 and 3");
    }
  }

  return { height, unit };
}
function validateWeight(weightValue, unit) {
  const validUnits = ["lb", "kg"];

  weightValue = weightValue.trim();
  unit = unit.trim();
  if (weightValue === "") {
    Errors.push("Weight is required");
  }
  if (unit === "") {
    Errors.push("Unit is required");
  }

  if (!validUnits.includes(unit)) {
    Errors.push("Please select a valid unit");
  }

  const weightRegex = /^\d+(\.\d{1,2})?$/;
  const isValidWeight = weightRegex.test(weightValue);

  if (!isValidWeight) {
    Errors.push(
      "Please enter a valid weight value (numbers only) up to 2 decimal places"
    );
  }

  const weightNum = parseFloat(weightValue);
  if (unit === "lb") {
    if (weightNum < 0 || weightNum > 330) {
      Errors.push("Please enter a valid weight in pounds, between 0 and 330");
    }
  } else if (unit === "kg") {
    if (weightNum < 0 || weightNum > 150) {
      Errors.push(
        "Please enter a valid weight in kilograms, between 0 and 150"
      );
    }
  }

  return { weightValue, unit };
}
function validateFavoriteWorkout(favoriteWorkout) {
  console.log(favoriteWorkout);
  favoriteWorkout = favoriteWorkout.trim();
  if (favoriteWorkout === "") {
    Errors.push("Favorite Workout is required");
  }
  if (
    !(
      favoriteWorkout === "cardio" ||
      favoriteWorkout === "strength" ||
      favoriteWorkout === "flexibility" ||
      favoriteWorkout === "sports" ||
      favoriteWorkout === "crossFit" ||
      favoriteWorkout === "bodyWeight"
    )
  ) {
    Errors.push("Please select a valid favorite workout");
  }
  return favoriteWorkout;
}
function validateStreet(street) {
  street = street.trim();
  if (street === "") {
    Errors.push("Street is required");
  }
  if (street.length < 3) {
    Errors.push("Street must be at least 3 characters long");
  }
  if (street.length > 30) {
    Errors.push("Street must be less than 30 characters long");
  }
  const streetRegex = /^[a-zA-Z0-9\s,'-]*$/;
  if (!streetRegex.test(street)) {
    Errors.push(
      "Street can only contain letters, numbers, spaces, and the following characters: , ' -"
    );
  }

  return street;
}
function validateApartment(apartment) {
  apartment = apartment.trim();
  if (apartment === "") {
    Errors.push("Apartment is required");
  }
  if (apartment.length > 0) {
    if (apartment.length < 3) {
      Errors.push("Apartment must be at least 3 characters long");
    }
    if (apartment.length > 30) {
      Errors.push("Apartment must be less than 30 characters long");
    }
    const apartmentRegex = /^[a-zA-Z0-9\s,'-]*$/;
    if (!apartmentRegex.test(apartment)) {
      Errors.push(
        "Apartment can only contain letters, numbers, spaces, and the following characters: , ' -"
      );
    }
  }
  return apartment;
}

function validateCity(city) {
  city = city.trim();
  if (city === "") {
    Errors.push("City is required");
  }
  if (city.length < 3) {
    Errors.push("City must be at least 3 characters long");
  }
  if (city.length > 30) {
    Errors.push("City must be less than 30 characters long");
  }
  const cityRegex = /^[a-zA-Z\s,'-]*$/;
  if (!cityRegex.test(city)) {
    Errors.push(
      "City can only contain letters, spaces, and the following characters: , ' -"
    );
  }
  return city;
}
function validateState(state) {
  if (typeof state !== "string")
    Errors.push("State parameter is not of string datatype");
  state = state.trim();
  if (state === "") Errors.push("State is required");
  const states = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
  ];
  if (state.length !== 2) Errors.push("State must be 2 characters long");
  if (!states.includes(state.toUpperCase()))
    Errors.push("Please enter a valid state");
  return state.toUpperCase();
}
function validateZip(zip) {
  zip = zip.trim();
  if (zip === "") Errors.push("Zip is required");
  const zipRegex = /^\d{5}$/;
  if (!zipRegex.test(zip)) Errors.push("Please enter a valid zip code");
  return zip;
}
document
  .getElementById("editForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    Errors = [];
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const bio = document.getElementById("bio").value;
    const dateOfBirth = document.getElementById("dateOfBirth").value;
    const genderOptions = document.querySelectorAll(".gridRadios");
    let gender;
    Array.from(genderOptions).forEach((option) => {
      if (option.checked) {
        gender = option.value;
      }
    });
    const height = document.getElementById("height").value;
    const hUnit = document.getElementById("hUnit").value;
    const weight = document.getElementById("weight").value;
    const wUnit = document.getElementById("wUnit").value;
    const favoriteWorkout = document.getElementById("favoriteWorkout").value;
    const street = document.getElementById("street").value;
    const apartment = document.getElementById("apartment").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    const zip = document.getElementById("zip").value;

    const isFirstNameValid = validateFirstName(firstName);
    const isLastNameValid = validateLastName(lastName);
    const isEmailValid = validateEmail(email);
    const isPhoneValid = validatePhone(phone);
    const isBioValid = validateBio(bio);
    const isDateOfBirthValid = validateDateOfBirth(dateOfBirth);
    const isGenderOptionsValid = validateGenderOptions(gender);
    const isHeightValid = validateHeight(height, hUnit);
    const isWeightValid = validateWeight(weight, wUnit);
    const isFavoriteWorkoutValid = validateFavoriteWorkout(favoriteWorkout);
    const isStreetValid = validateStreet(street);
    const isApartmentValid = validateApartment(apartment);
    const isCityValid = validateCity(city);
    const isStateValid = validateState(state);
    const isZipValid = validateZip(zip);

    if (Errors.length === 0) {
      this.submit();
    } else {
      const errorList = document.getElementById("errorList");
      errorList.innerHTML = "";
      Errors.forEach((error) => {
        const li = document.createElement("li");
        li.appendChild(document.createTextNode(error));
        errorList.appendChild(li);
      });
      errorList.style.display = "block";
      errorList.classList.remove("d-none");
      return false;
    }
  });
