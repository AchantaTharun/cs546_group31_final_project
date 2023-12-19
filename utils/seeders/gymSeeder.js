import mongoose from "mongoose";
import Trainer from "../../models/trainerModel.js";
import SignUpRequest from "../../models/signUpRequestModel.js";
import Gym from "../../models/gymModel.js";

//This comment is to hide the last delete env commit on github
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

function generateRandomAddress() {
  const street = generateRandomString(4, 50);
  const city = generateRandomString(4, 50);
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

const gyms = [
  {
    ownerFName: "Walter",
    ownerLName: "White",
    email: "walter@example.com",
    password: "walterpassword",
    passwordConfirm: "walterpassword",
  },
  {
    ownerFName: "Tony",
    ownerLName: "Soprano",

    email: "tony@example.com",
    password: "tonypassword",
    passwordConfirm: "tonypassword",
  },
  {
    ownerFName: "Tyrion",
    ownerLName: "Lannister",

    email: "tyrion@example.com",
    password: "tyrionpassword",
    passwordConfirm: "tyrionpassword",
  },
  {
    ownerFName: "Jesse",
    ownerLName: "Pinkman",

    email: "jesse@example.com",
    password: "jessepassword",
    passwordConfirm: "jessepassword",
  },
  {
    ownerFName: "Rick",
    ownerLName: "Sanchez",

    email: "rick@example.com",
    password: "rickpassword",
    passwordConfirm: "rickpassword",
  },
  {
    ownerFName: "Alcc",
    ownerLName: "Swearengen",

    email: "al@example.com",
    password: "alpassword",
    passwordConfirm: "alpassword",
  },
  {
    ownerFName: "Carmela",
    ownerLName: "Soprano",

    email: "carmela@example.com",
    password: "carmelapassword",
    passwordConfirm: "carmelapassword",
  },
  {
    ownerFName: "Jon",
    ownerLName: "Snow",

    email: "jon@example.com",
    password: "jonpassword",
    passwordConfirm: "jonpassword",
  },
  {
    ownerFName: "Skyler",
    ownerLName: "White",

    email: "skyler@example.com",
    password: "skylpassword",
    passwordConfirm: "skylpassword",
  },
  {
    ownerFName: "Morty",
    ownerLName: "Smith",

    email: "morty@example.com",
    password: "mortypassword",
    passwordConfirm: "mortypassword",
  },
  {
    ownerFName: "Saul",
    ownerLName: "Goodman",

    email: "saul@example.com",
    password: "saulpassword",
    passwordConfirm: "saulpassword",
  },
  {
    ownerFName: "Anthony",
    ownerLName: "SopranoJr",

    email: "aj@example.com",
    password: "ajpassword",
    passwordConfirm: "ajpassword",
  },
  {
    ownerFName: "Tyrion",
    ownerLName: "Soprano",

    email: "tyrionjr@example.com",
    password: "tyrionpassword",
    passwordConfirm: "tyrionpassword",
  },
  {
    ownerFName: "Daenerys",
    ownerLName: "Targaryen",

    email: "daenerys@example.com",
    password: "daeneryspassword",
    passwordConfirm: "daeneryspassword",
  },
  {
    ownerFName: "Hank",
    ownerLName: "Schrader",

    email: "hank@example.com",
    password: "hankpassword",
    passwordConfirm: "hankpassword",
  },
  {
    ownerFName: "Beth",
    ownerLName: "Smith",

    email: "beth@example.com",
    password: "bethpassword",
    passwordConfirm: "bethpassword",
  },
  {
    ownerFName: "Seth",
    ownerLName: "Bullock",

    email: "seth@example.com",
    password: "sethpassword",
    passwordConfirm: "sethpassword",
  },
  {
    ownerFName: "Paulie",
    ownerLName: "Gualtieri",

    email: "paulie@example.com",
    password: "pauliepassword",
    passwordConfirm: "pauliepassword",
  },
  {
    ownerFName: "Arya",
    ownerLName: "Stark",

    email: "arya@example.com",
    password: "aryapassword",
    passwordConfirm: "aryapassword",
  },
  {
    ownerFName: "Gus",
    ownerLName: "Fring",

    email: "gus@example.com",
    password: "guspassword",
    passwordConfirm: "guspassword",
  },
  {
    ownerFName: "Summer",
    ownerLName: "Smith",

    email: "summer@example.com",
    password: "summerpassword",
    passwordConfirm: "summerpassword",
  },
  {
    ownerFName: "Calamity",
    ownerLName: "Jane",

    email: "calamity@example.com",
    password: "calamitypassword",
    passwordConfirm: "calamitypassword",
  },
  {
    ownerFName: "Junior",
    ownerLName: "Soprano",

    email: "junior@example.com",
    password: "juniorpassword",
    passwordConfirm: "juniorpassword",
  },
];

(async () => {
  // await Gym.deleteMany();
  await SignUpRequest.deleteMany();

  async function seedGymsNearMe() {
    try {
      for (const gym of gyms) {
        const location = generateRandomCoordinates(40.790767, -74.0401098, 10);
        const workoutType = [
          getRandomWorkoutType(),
          getRandomWorkoutType(),
          getRandomWorkoutType(),
        ];
        const phone = generateRandomPhoneNumber();
        const address = generateRandomAddress();
        const newgym = new Gym({
          ownerFName: gym.ownerFName,
          ownerLName: gym.ownerLName,
          gymName: "1" + gym.ownerLName + "Gym",

          email: "1" + gym.email + "Gym",
          password: "1" + gym.password + "Gym",
          passwordConfirm: "1" + gym.password + "Gym",
          location: location,
          workoutType,
          address,
          phone,
        });

        await newgym.save();
        await SignUpRequest.create({
          requestType: "gym",
          requestedBy: newgym._id,
        });
      }

      console.log("5. Gyms near me seeded successfully!");
    } catch (err) {
      console.error("Error seeding Trainers:", err);
    }
  }

  async function seedGymsUSA() {
    try {
      for (const gym of gyms) {
        for (let i = 2; i <= 10; i++) {
          const location = generateRandomCoordinatesUSA();
          const workoutType = [
            getRandomWorkoutType(),
            getRandomWorkoutType(),
            getRandomWorkoutType(),
          ];
          const phone = generateRandomPhoneNumber();
          const address = generateRandomAddress();
          const newgym = new Gym({
            ownerFName: gym.ownerFName,
            ownerLName: gym.ownerLName,
            gymName: `${i}` + gym.ownerLName + "Gym",
            email: `${i}` + gym.email + "Gym",
            password: `${i}` + gym.password + "Gym",
            passwordConfirm: `${i}` + gym.password + "Gym",
            location: location,
            workoutType,
            address,
            phone,
          });

          await newgym.save();
          await SignUpRequest.create({
            requestType: "gym",
            requestedBy: newgym._id,
          });
        }
      }
      console.log("6. USA Gyms seeded successfully!");
    } catch (err) {
      console.error("Error seeding Gyms:", err);
    }
  }

  await seedGymsNearMe();
  await seedGymsUSA();
  mongoose.connection.close();
})();
