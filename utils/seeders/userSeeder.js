import mongoose from "mongoose";
import User from "../../models/userModel.js";
mongoose.connect("mongodb://localhost:27017/GymMate", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
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
  const finalLongitude = (((newLongitude * 180) / Math.PI + 540) % 360) - 180; // Normalize longitude

  return { coordinates: [finalLongitude, finalLatitude] };
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
  },
  {
    firstName: "Tony",
    lastName: "Soprano",
    userName: "tonysoprano",
    email: "tony@example.com",
    password: "tonypassword",
    passwordConfirm: "tonypassword",
  },
  {
    firstName: "Tyrion",
    lastName: "Lannister",
    userName: "impinainteasy",
    email: "tyrion@example.com",
    password: "tyrionpassword",
    passwordConfirm: "tyrionpassword",
  },
  {
    firstName: "Jesse",
    lastName: "Pinkman",
    userName: "yomrwhite",
    email: "jesse@example.com",
    password: "jessepassword",
    passwordConfirm: "jessepassword",
  },
  {
    firstName: "Rick",
    lastName: "Sanchez",
    userName: "rickc137",
    email: "rick@example.com",
    password: "rickpassword",
    passwordConfirm: "rickpassword",
  },
  {
    firstName: "Al",
    lastName: "Swearengen",
    userName: "deadwoodboss",
    email: "al@example.com",
    password: "alpassword",
    passwordConfirm: "alpassword",
  },
  {
    firstName: "Carmela",
    lastName: "Soprano",
    userName: "carm",
    email: "carmela@example.com",
    password: "carmelapassword",
    passwordConfirm: "carmelapassword",
  },
  {
    firstName: "Jon",
    lastName: "Snow",
    userName: "lordcommander",
    email: "jon@example.com",
    password: "jonpassword",
    passwordConfirm: "jonpassword",
  },
  {
    firstName: "Skyler",
    lastName: "White",
    userName: "skysky",
    email: "skyler@example.com",
    password: "skylpassword",
    passwordConfirm: "skylpassword",
  },
  {
    firstName: "Morty",
    lastName: "Smith",
    userName: "mortyadventures",
    email: "morty@example.com",
    password: "mortypassword",
    passwordConfirm: "mortypassword",
  },
  {
    firstName: "Saul",
    lastName: "Goodman",
    userName: "bettercallsaul",
    email: "saul@example.com",
    password: "saulpassword",
    passwordConfirm: "saulpassword",
  },
  {
    firstName: "Anthony",
    lastName: "SopranoJr",
    userName: "ajsoprano",
    email: "aj@example.com",
    password: "ajpassword",
    passwordConfirm: "ajpassword",
  },
  {
    firstName: "Tyrion",
    lastName: "Soprano",
    userName: "tyrionjr",
    email: "tyrionjr@example.com",
    password: "tyrionpassword",
    passwordConfirm: "tyrionpassword",
  },
  {
    firstName: "Daenerys",
    lastName: "Targaryen",
    userName: "motherofdragons",
    email: "daenerys@example.com",
    password: "daeneryspassword",
    passwordConfirm: "daeneryspassword",
  },
  {
    firstName: "Hank",
    lastName: "Schrader",
    userName: "minerals",
    email: "hank@example.com",
    password: "hankpassword",
    passwordConfirm: "hankpassword",
  },
  {
    firstName: "Beth",
    lastName: "Smith",
    userName: "spacevet",
    email: "beth@example.com",
    password: "bethpassword",
    passwordConfirm: "bethpassword",
  },
  {
    firstName: "Seth",
    lastName: "Bullock",
    userName: "marshalbullock",
    email: "seth@example.com",
    password: "sethpassword",
    passwordConfirm: "sethpassword",
  },
  {
    firstName: "Paulie",
    lastName: "Gualtieri",
    userName: "paulieWalnuts",
    email: "paulie@example.com",
    password: "pauliepassword",
    passwordConfirm: "pauliepassword",
  },
  {
    firstName: "Arya",
    lastName: "Stark",
    userName: "needleBearer",
    email: "arya@example.com",
    password: "aryapassword",
    passwordConfirm: "aryapassword",
  },
  {
    firstName: "Gus",
    lastName: "Fring",
    userName: "lospolloshermanos",
    email: "gus@example.com",
    password: "guspassword",
    passwordConfirm: "guspassword",
  },
  {
    firstName: "Summer",
    lastName: "Smith",
    userName: "summersmith",
    email: "summer@example.com",
    password: "summerpassword",
    passwordConfirm: "summerpassword",
  },
  {
    firstName: "Calamity",
    lastName: "Jane",
    userName: "wildwestjane",
    email: "calamity@example.com",
    password: "calamitypassword",
    passwordConfirm: "calamitypassword",
  },
  {
    firstName: "Junior",
    lastName: "Soprano",
    userName: "juniorsoprano",
    email: "junior@example.com",
    password: "juniorpassword",
    passwordConfirm: "juniorpassword",
  },
];

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
        });

        await newUser.save();
      }

      console.log("Users seeded successfully!");
    } catch (err) {
      console.error("Error seeding users:", err);
    }
  }

  async function seedUsersUSA() {
    try {
      for (const user of users) {
        for (let i = 2; i <= 10; i++) {
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
          });

          await newUser.save();
        }
      }

      console.log("Users seeded successfully!");
    } catch (err) {
      console.error("Error seeding users:", err);
    }
  }

  await seedUsersNearMe();
  await seedUsersUSA();
  mongoose.connection.close();
})();
