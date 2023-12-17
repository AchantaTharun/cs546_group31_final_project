import mongoose from "mongoose";
import Trainer from "../../models/trainerModel.js";
import SignUpRequest from "../../models/signUpRequestModel.js";
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
    "body Weight",
  ];

  const randomIndex = Math.floor(Math.random() * workoutTypes.length);

  return workoutTypes[randomIndex];
}
function generateRandomAddress() {
  const street = generateRandomString(3, 50);
  const city = generateRandomString(3, 50);
  const state = generateRandomState();
  const zip = generateRandomZip();

  return { street, city, state, zip };
}

function generateRandomString(minLength, maxLength) {
  const length =
    Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}
function generateRandomPhoneNumber() {
  const phoneNumber = Math.floor(1000000000 + Math.random() * 9000000000)
    .toString()
    .substring(0, 10);
  return phoneNumber;
}
function generateRandomState() {
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
    "MN",
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
    "WY",
  ];

  return states[Math.floor(Math.random() * states.length)];
}

function generateRandomZip() {
  const zip = Math.floor(10000 + Math.random() * 90000).toString();
  return zip.substring(0, 5);
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

const trainers = [
  {
    firstName: "Walter",
    lastName: "White",
    trainerName: "Heisenberg",
    email: "walter@example.com",
    password: "walterpassword",
    passwordConfirm: "walterpassword",
  },
  {
    firstName: "Tony",
    lastName: "Soprano",
    trainerName: "tonysoprano",
    email: "tony@example.com",
    password: "tonypassword",
    passwordConfirm: "tonypassword",
  },
  {
    firstName: "Tyrion",
    lastName: "Lannister",
    trainerName: "impinainteasy",
    email: "tyrion@example.com",
    password: "tyrionpassword",
    passwordConfirm: "tyrionpassword",
  },
  {
    firstName: "Jesse",
    lastName: "Pinkman",
    trainerName: "yomrwhite",
    email: "jesse@example.com",
    password: "jessepassword",
    passwordConfirm: "jessepassword",
  },
  {
    firstName: "Rick",
    lastName: "Sanchez",
    trainerName: "rickc137",
    email: "rick@example.com",
    password: "rickpassword",
    passwordConfirm: "rickpassword",
  },
  {
    firstName: "Al",
    lastName: "Swearengen",
    trainerName: "deadwoodboss",
    email: "al@example.com",
    password: "alpassword",
    passwordConfirm: "alpassword",
  },
  {
    firstName: "Carmela",
    lastName: "Soprano",
    trainerName: "carm",
    email: "carmela@example.com",
    password: "carmelapassword",
    passwordConfirm: "carmelapassword",
  },
  {
    firstName: "Jon",
    lastName: "Snow",
    trainerName: "lordcommander",
    email: "jon@example.com",
    password: "jonpassword",
    passwordConfirm: "jonpassword",
  },
  {
    firstName: "Skyler",
    lastName: "White",
    trainerName: "skysky",
    email: "skyler@example.com",
    password: "skylpassword",
    passwordConfirm: "skylpassword",
  },
  {
    firstName: "Morty",
    lastName: "Smith",
    trainerName: "mortyadventures",
    email: "morty@example.com",
    password: "mortypassword",
    passwordConfirm: "mortypassword",
  },
  {
    firstName: "Saul",
    lastName: "Goodman",
    trainerName: "bettercallsaul",
    email: "saul@example.com",
    password: "saulpassword",
    passwordConfirm: "saulpassword",
  },
  {
    firstName: "Anthony",
    lastName: "SopranoJr",
    trainerName: "ajsoprano",
    email: "aj@example.com",
    password: "ajpassword",
    passwordConfirm: "ajpassword",
  },
  {
    firstName: "Tyrion",
    lastName: "Soprano",
    trainerName: "tyrionjr",
    email: "tyrionjr@example.com",
    password: "tyrionpassword",
    passwordConfirm: "tyrionpassword",
  },
  {
    firstName: "Daenerys",
    lastName: "Targaryen",
    trainerName: "motherofdragons",
    email: "daenerys@example.com",
    password: "daeneryspassword",
    passwordConfirm: "daeneryspassword",
  },
  {
    firstName: "Hank",
    lastName: "Schrader",
    trainerName: "minerals",
    email: "hank@example.com",
    password: "hankpassword",
    passwordConfirm: "hankpassword",
  },
  {
    firstName: "Beth",
    lastName: "Smith",
    trainerName: "spacevet",
    email: "beth@example.com",
    password: "bethpassword",
    passwordConfirm: "bethpassword",
  },
  {
    firstName: "Seth",
    lastName: "Bullock",
    trainerName: "marshalbullock",
    email: "seth@example.com",
    password: "sethpassword",
    passwordConfirm: "sethpassword",
  },
  {
    firstName: "Paulie",
    lastName: "Gualtieri",
    trainerName: "paulieWalnuts",
    email: "paulie@example.com",
    password: "pauliepassword",
    passwordConfirm: "pauliepassword",
  },
  {
    firstName: "Arya",
    lastName: "Stark",
    trainerName: "needleBearer",
    email: "arya@example.com",
    password: "aryapassword",
    passwordConfirm: "aryapassword",
  },
  {
    firstName: "Gus",
    lastName: "Fring",
    trainerName: "lospolloshermanos",
    email: "gus@example.com",
    password: "guspassword",
    passwordConfirm: "guspassword",
  },
  {
    firstName: "Summer",
    lastName: "Smith",
    trainerName: "summersmith",
    email: "summer@example.com",
    password: "summerpassword",
    passwordConfirm: "summerpassword",
  },
  {
    firstName: "Calamity",
    lastName: "Jane",
    trainerName: "wildwestjane",
    email: "calamity@example.com",
    password: "calamitypassword",
    passwordConfirm: "calamitypassword",
  },
  {
    firstName: "Junior",
    lastName: "Soprano",
    trainerName: "juniorsoprano",
    email: "junior@example.com",
    password: "juniorpassword",
    passwordConfirm: "juniorpassword",
  },
];

(async () => {
  await Trainer.deleteMany();
  await SignUpRequest.deleteMany();
  async function seedTrainersNearMe() {
    try {
      for (const trainer of trainers) {
        const location = generateRandomCoordinates(40.790767, -74.0401098, 10);
        const workoutType = [
          getRandomWorkoutType(),
          getRandomWorkoutType(),
          getRandomWorkoutType(),
        ];
        const phone = generateRandomPhoneNumber();
        const address = generateRandomAddress();
        const newTrainer = new Trainer({
          firstName: trainer.firstName,
          lastName: trainer.lastName,
          trainerName: "1" + trainer.trainerName + "Trainer",
          email: "1" + trainer.email + "Trainer",
          password: "1" + trainer.password + "Trainer",
          passwordConfirm: "1" + trainer.password + "Trainer",
          location: location,
          workoutType,
          address,
          phone,
        });

        await newTrainer.save();
        await SignUpRequest.create({
          requestType: "trainer",
          requestedBy: newTrainer._id,
        });
      }

      //console.log("Trainers seeded successfully!");
    } catch (err) {
      console.error("Error seeding Trainers:", err);
    }
  }

  async function seedTrainersUSA() {
    try {
      for (const trainer of trainers) {
        for (let i = 2; i <= 20; i++) {
          const location = generateRandomCoordinatesUSA();
          const workoutType = [
            getRandomWorkoutType(),
            getRandomWorkoutType(),
            getRandomWorkoutType(),
          ];
          const phone = generateRandomPhoneNumber();
          const address = generateRandomAddress();
          const newTrainer = new Trainer({
            firstName: trainer.firstName,
            lastName: trainer.lastName,
            trainerName: `${i}` + trainer.trainerName + "Trainer",
            email: `${i}` + trainer.email + "Trainer",
            password: `${i}` + trainer.password + "Trainer",
            passwordConfirm: `${i}` + trainer.password + "Trainer",
            location: location,
            workoutType,
            address,
            phone,
          });

          await newTrainer.save();
          await SignUpRequest.create({
            requestType: "trainer",
            requestedBy: newTrainer._id,
          });
        }
      }
      //console.log("Trainers seeded successfully!");
    } catch (err) {
      console.error("Error seeding Trainers:", err);
    }
  }

  await seedTrainersNearMe();
  await seedTrainersUSA();
  mongoose.connection.close();
})();
