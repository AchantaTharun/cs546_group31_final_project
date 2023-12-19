import mongoose from "mongoose";
import User from "../../models/userModel.js";
mongoose.connect("mongodb://localhost:27017/GymMate", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
function generateRandomBirthdate() {
  const randomMonth = Math.floor(Math.random() * 12) + 1;
  const randomDay = Math.floor(Math.random() * 28) + 1;
  const randomYear = Math.floor(Math.random() * (2003 - 1930 + 1)) + 1930;
  const formattedMonth =
    randomMonth < 10 ? `0${randomMonth}` : `${randomMonth}`;
  const formattedDay = randomDay < 10 ? `0${randomDay}` : `${randomDay}`;

  return `${formattedMonth}/${formattedDay}/${randomYear}`;
}
function generateRandomPhoneNumber() {
  const phoneNumber = Math.floor(1000000000 + Math.random() * 9000000000)
    .toString()
    .substring(0, 10);
  return `${phoneNumber}`;
}
function getRandomWorkoutType() {
  const workoutTypes = [
    "cardio",
    "strength",
    "flexibility",
    "sports",
    "crossFit",
    "bodyWeight",
  ];

  const randomIndex = Math.floor(Math.random() * workoutTypes.length);

  return workoutTypes[randomIndex];
}
function generateRandomAddress() {
  const streetNames = [
    "Maple Street",
    "Oak Avenue",
    "Cedar Lane",
    "Pine Road",
    "Elm Boulevard",
    "Willow Lane",
    "Main Street",
    "First Avenue",
    "Second Street",
    "Third Avenue",
    "Park Avenue",
    "Center Street",
  ];

  const cities = [
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Phoenix",
    "Philadelphia",
    "San Antonio",
    "San Diego",
    "Dallas",
    "San Jose",
    "Austin",
    "Jacksonville",
  ];

  const states = [
    "NY",
    "CA",
    "IL",
    "TX",
    "AZ",
    "PA",
    "FL",
    "OH",
    "GA",
    "NC",
    "MI",
    "WA",
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

  const randomStreet =
    streetNames[Math.floor(Math.random() * streetNames.length)];
  const randomApartment = `Apt ${Math.floor(Math.random() * 100) + 1}`;
  const randomCity = cities[Math.floor(Math.random() * cities.length)];
  const randomState = states[Math.floor(Math.random() * states.length)];
  const randomZip = Math.floor(10000 + Math.random() * 90000)
    .toString()
    .substring(0, 5);

  return {
    street: `${Math.floor(Math.random() * 1000) + 1} ${randomStreet}`,
    apartment: randomApartment,
    city: randomCity,
    state: randomState,
    zip: randomZip,
  };
}

function generateRandomHeight() {
  const height = Math.floor(Math.random() * 200) + 100;
  return height;
}

function generateRandomWeight() {
  const weight = Math.floor(Math.random() * 150) + 50;
  return weight;
}

function generateRandomHeightUnit() {
  const heightUnits = ["ft", "m"];
  const randomHeightUnit =
    heightUnits[Math.floor(Math.random() * heightUnits.length)];
  return randomHeightUnit;
}

function generateRandomWeightUnit() {
  const weightUnits = ["lb", "kg"];
  const randomWeightUnit =
    weightUnits[Math.floor(Math.random() * weightUnits.length)];
  return randomWeightUnit;
}

// give random coordinates within a radius of a given point
function generateRandomCoordinates(latitude, longitude, radiusInKm) {
  const earthRadius = 6371;

  const radianLatitude = (Math.PI / 180) * latitude;
  const radianLongitude = (Math.PI / 180) * longitude;

  const randomDistance = Math.random() * radiusInKm;
  const randomAngle = Math.random() * 2 * Math.PI;

  const newLatitude = Math.asin(
    Math.sin(radianLatitude) * Math.cos(randomDistance / earthRadius) +
      Math.cos(radianLatitude) *
        Math.sin(randomDistance / earthRadius) *
        Math.cos(randomAngle)
  );

  const newLongitude =
    radianLongitude +
    Math.atan2(
      Math.sin(randomAngle) *
        Math.sin(randomDistance / earthRadius) *
        Math.cos(radianLatitude),
      Math.cos(randomDistance / earthRadius) -
        Math.sin(radianLatitude) * Math.sin(newLatitude)
    );

  const finalLatitude = (newLatitude * 180) / Math.PI;
  const finalLongitude = (((newLongitude * 180) / Math.PI + 540) % 360) - 180;

  return { coordinates: [finalLongitude, finalLatitude] };
}
function getRandomGender() {
  const genders = ["male", "female", "other"];
  const randomIndex = Math.floor(Math.random() * genders.length);
  return genders[randomIndex];
}

// gives random coordinates within the continental USA

function generateRandomCoordinatesUSA() {
  function generateRandomLatitude() {
    const minLat = 24.396308;
    const maxLat = 49.384358;
    return Math.random() * (maxLat - minLat) + minLat;
  }

  function generateRandomLongitude() {
    const minLong = -125.0;
    const maxLong = -66.93457;

    return Math.random() * (maxLong - minLong) + minLong;
  }
  const latitude = generateRandomLatitude();
  const longitude = generateRandomLongitude();

  return { coordinates: [longitude, latitude] };
}

const users = [
  {
    firstName: "Walter",
    lastName: "White",
    userName: "Heisenberg",
    email: "walter@example.com",
    password: "walterpassword",
    passwordConfirm: "walterpassword",
    bio: "High school chemistry teacher turned methamphetamine manufacturer.",
  },
  {
    firstName: "Tony",
    lastName: "Soprano",
    userName: "tonysoprano",
    email: "tony@example.com",
    password: "tonypassword",
    passwordConfirm: "tonypassword",
    bio: "New Jersey mob boss trying to balance family life and organized crime.",
  },
  {
    firstName: "Tyrion",
    lastName: "Lannister",
    userName: "impinainteasy",
    email: "tyrion@example.com",
    password: "tyrionpassword",
    passwordConfirm: "tyrionpassword",
    bio: "Clever and resourceful noble known for his wit and strategic thinking.",
  },
  {
    firstName: "Jesse",
    lastName: "Pinkman",
    userName: "yomrwhite",
    email: "jesse@example.com",
    password: "jessepassword",
    passwordConfirm: "jessepassword",
    bio: "Former meth manufacturer partnering with Heisenberg. Calls everyone 'Yo.'",
  },
  {
    firstName: "Rick",
    lastName: "Sanchez",
    userName: "rickc137",
    email: "rick@example.com",
    password: "rickpassword",
    passwordConfirm: "rickpassword",
    bio: "Genius scientist with a penchant for interdimensional adventures.",
  },
  {
    firstName: "Al",
    lastName: "Swearengen",
    userName: "deadwoodboss",
    email: "al@example.com",
    password: "alpassword",
    passwordConfirm: "alpassword",
    bio: "Deadwood's notorious saloon owner and a shrewd businessman.",
  },
  {
    firstName: "Carmela",
    lastName: "Soprano",
    userName: "carm",
    email: "carmela@example.com",
    password: "carmelapassword",
    passwordConfirm: "carmelapassword",
    bio: "Dedicated wife to a mob boss, striving to maintain family values in a complicated world.",
  },
  {
    firstName: "Jon",
    lastName: "Snow",
    userName: "lordcommander",
    email: "jon@example.com",
    password: "jonpassword",
    passwordConfirm: "jonpassword",
    bio: "Former Lord Commander of the Night's Watch with a claim to the Iron Throne.",
  },
  {
    firstName: "Skyler",
    lastName: "White",
    userName: "skysky",
    email: "skyler@example.com",
    password: "skylpassword",
    passwordConfirm: "skylpassword",
    bio: "Walter White's wife caught in the chaos of his secret life as a drug manufacturer.",
  },
  {
    firstName: "Morty",
    lastName: "Smith",
    userName: "mortyadventures",
    email: "morty@example.com",
    password: "mortypassword",
    passwordConfirm: "mortypassword",
    bio: "Constantly dragged into interdimensional adventures by his genius grandfather, Rick.",
  },
];
//   {
//     firstName: "Saul",
//     lastName: "Goodman",
//     userName: "bettercallsaul",
//     email: "saul@example.com",
//     password: "saulpassword",
//     passwordConfirm: "saulpassword",
//     bio: "Savvy lawyer with a penchant for morally ambiguous cases and colorful suits.",
//   },
//   {
//     firstName: "Anthony",
//     lastName: "SopranoJr",
//     userName: "ajsoprano",
//     email: "aj@example.com",
//     password: "ajpassword",
//     passwordConfirm: "ajpassword",
//     bio: "Son of Tony Soprano, navigating life under the shadow of organized crime.",
//   },
//   {
//     firstName: "Tyrion",
//     lastName: "Soprano",
//     userName: "tyrionjr",
//     email: "tyrionjr@example.com",
//     password: "tyrionpassword",
//     passwordConfirm: "tyrionpassword",
//     bio: "Clever and strategic member of the Soprano family, handling complex situations.",
//   },
//   {
//     firstName: "Daenerys",
//     lastName: "Targaryen",
//     userName: "motherofdragons",
//     email: "daenerys@example.com",
//     password: "daeneryspassword",
//     passwordConfirm: "daeneryspassword",
//     bio: "Last surviving Targaryen, aiming to reclaim the Iron Throne with her dragons.",
//   },
//   {
//     firstName: "Hank",
//     lastName: "Schrader",
//     userName: "minerals",
//     email: "hank@example.com",
//     password: "hankpassword",
//     passwordConfirm: "hankpassword",
//     bio: "Dedicated DEA agent with a passion for collecting minerals as a hobby.",
//   },
//   {
//     firstName: "Beth",
//     lastName: "Smith",
//     userName: "spacevet",
//     email: "beth@example.com",
//     password: "bethpassword",
//     passwordConfirm: "bethpassword",
//     bio: "Veterinarian with a penchant for intergalactic adventures alongside her eccentric family.",
//   },
//   {
//     firstName: "Seth",
//     lastName: "Bullock",
//     userName: "marshalbullock",
//     email: "seth@example.com",
//     password: "sethpassword",
//     passwordConfirm: "sethpassword",
//     bio: "Honor-bound lawman in the rough and tumble town of Deadwood.",
//   },
//   {
//     firstName: "Paulie",
//     lastName: "Gualtieri",
//     userName: "paulieWalnuts",
//     email: "paulie@example.com",
//     password: "pauliepassword",
//     passwordConfirm: "pauliepassword",
//     bio: "Soprano crime family capo known for his loyal and sometimes unpredictable nature.",
//   },
//   {
//     firstName: "Arya",
//     lastName: "Stark",
//     userName: "needleBearer",
//     email: "arya@example.com",
//     password: "aryapassword",
//     passwordConfirm: "aryapassword",
//     bio: "Fearless and vengeful assassin seeking justice and reclaiming her identity.",
//   },
//   {
//     firstName: "Gus",
//     lastName: "Fring",
//     userName: "lospolloshermanos",
//     email: "gus@example.com",
//     password: "guspassword",
//     passwordConfirm: "guspassword",
//     bio: "Meticulous and calculating drug lord with a front in the fast-food industry.",
//   },
//   {
//     firstName: "Summer",
//     lastName: "Smith",
//     userName: "summersmith",
//     email: "summer@example.com",
//     password: "summerpassword",
//     passwordConfirm: "summerpassword",
//     bio: "Adventure-loving teenager, often caught up in her family's chaotic escapades.",
//   },
//   {
//     firstName: "Calamity",
//     lastName: "Jane",
//     userName: "wildwestjane",
//     email: "calamity@example.com",
//     password: "calamitypassword",
//     passwordConfirm: "calamitypassword",
//     bio: "Wild and adventurous frontierswoman with a knack for getting into trouble.",
//   },
//   {
//     firstName: "Junior",
//     lastName: "Soprano",
//     userName: "juniorsoprano",
//     email: "junior@example.com",
//     password: "juniorpassword",
//     passwordConfirm: "juniorpassword",
//     bio: "Tony Soprano's uncle, navigating life within the complex dynamics of the Soprano family.",
//   },


(async () => {
  await User.deleteMany();

  async function seedUsersNearMe() {
    try {
      for (const user of users) {
        const location = generateRandomCoordinates(40.790767, -74.0401098, 10);
        const favoriteWorkout = getRandomWorkoutType();
        const newUser = new User({
          firstName: user.firstName,
          lastName: user.lastName,
          userName: "1" + user.userName,
          email: "1" + user.email,
          password: "1" + user.password,
          passwordConfirm: "1" + user.password,
          location: location,
          favoriteWorkout,
          gender: getRandomGender(),
          height: generateRandomHeight(),
          weight: generateRandomWeight(),
          hUnit: generateRandomHeightUnit(),
          wUnit: generateRandomWeightUnit(),
          address: generateRandomAddress(),
          phone: generateRandomPhoneNumber(),
          dateOfBirth: generateRandomBirthdate(),
          bio: user.bio,
        });

        await newUser.save();
      }

      console.log("7. Users near me seeded successfully!");
    } catch (err) {
      console.error("Error seeding users:", err);
    }
  }

  async function seedUsersUSANearPoint(num, location, count) {
    try {
      for (const user of users) {
        const newLoc = generateRandomCoordinates(
          location.coordinates[1],
          location.coordinates[0],
          10
        );
        let parts = user.email.split("@");
        let newEmail =
          parts[0] + count.toString() + "@example" + num + "." + parts[1].split(".")[1];
        const favoriteWorkout = getRandomWorkoutType();
        const newUser = new User({
          firstName: user.firstName,
          lastName: user.lastName,
          userName: user.userName + num + "USA" + count.toString(),
          email: newEmail + "USA",
          password: user.password + num + "USA",
          passwordConfirm: user.password + num + "USA",
          location: newLoc,
          favoriteWorkout,
          gender: getRandomGender(),
          height: generateRandomHeight(),
          weight: generateRandomWeight(),
          hUnit: generateRandomHeightUnit(),
          wUnit: generateRandomWeightUnit(),
          address: generateRandomAddress(),
          phone: generateRandomPhoneNumber(),
          dateOfBirth: generateRandomBirthdate(),
          bio: user.bio,
        });

        await newUser.save();
      }

      // console.log("2.Users in USA seeded successfully!");
    } catch (err) {
      console.error("Error seeding users:", err);
    }
  }
  async function seedUsersUSA() {
    try {
      let count=1000;
      for (const user of users) {
        for (let i = 2; i <= 5; i++) {
          const location = generateRandomCoordinatesUSA();
          const favoriteWorkout = getRandomWorkoutType();
          const newUser = new User({
            firstName: user.firstName,
            lastName: user.lastName,
            userName: `${i}` + user.userName,
            email: `${i}` + user.email,
            password: `${i}` + user.password,
            passwordConfirm: `${i}` + user.password,
            location: location,
            favoriteWorkout,
            gender: getRandomGender(),
            height: generateRandomHeight(),
            weight: generateRandomWeight(),
            hUnit: generateRandomHeightUnit(),
            wUnit: generateRandomWeightUnit(),
            address: generateRandomAddress(),
            phone: generateRandomPhoneNumber(),
            dateOfBirth: generateRandomBirthdate(),
            bio: user.bio,
          });
          count-=1;
          await newUser.save();
          await seedUsersUSANearPoint(i, location,count);
        }
      }

      console.log("8. USA Users seeded successfully!");
    } catch (err) {
      console.error("Error seeding users:", err);
    }
  }

  await seedUsersNearMe();
  await seedUsersUSA();
  mongoose.connection.close();
})();
