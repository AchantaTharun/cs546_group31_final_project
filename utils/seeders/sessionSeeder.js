import mongoose from "mongoose";
import Trainer from "../../models/trainerModel.js";
import User from "../../models/userModel.js";
import Session from "../../models/sessionModel.js"
import SignUpRequest from "../../models/signUpRequestModel.js";
mongoose.connect("mongodb://localhost:27017/GymMate", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});



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
  function generateRandomPhoneNumber() {
    const phoneNumber = Math.floor(1000000000 + Math.random() * 9000000000)
      .toString()
      .substring(0, 10);
    return phoneNumber;
  }

(async () => {
    async function seedTrainersNearMe() {
      try {

        await Session.deleteMany();

        
          const location = generateRandomCoordinates(40.790767, -74.0401098, 10);
          const workoutType = [
            getRandomWorkoutType(),
            getRandomWorkoutType(),
            getRandomWorkoutType(),
          ];
          const phone = generateRandomPhoneNumber();
          const address = {
            street : "101 S 3rd",
            city : "Hoboken",
            state: "NJ",
            zip: "07307"
          }
        
          const newTrainer1 = new Trainer({
            firstName: "Trainer1",
            lastName: "Test",
            trainerName: "TestTrainer1",
            email: "trainer1@example.com",
            password: "Trainer@123",
            passwordConfirm: "Trainer@123",
            location: location,
            workoutType,
            address,
            phone : "0000000000",
            status:"approved"
          });

          const newTrainer2 = new Trainer({
            firstName: "Trainer2",
            lastName: "Test",
            trainerName: "TestTrainer2",
            email: "trainer2@example.com",
            password: "Trainer@123",
            passwordConfirm: "Trainer@123",
            location: location,
            workoutType,
            address,
            phone : "1111111111",
            status:"approved"
          });


          const user1 = await User.create({
            firstName: "User",
            lastName: "Test",
            userName: "testUser",
            email: "test.user@example.com",
            phone: "1234511111",
            password: "testuser@123",
            passwordConfirm: "testuser@123",
            location: {
              type: "Point",
              coordinates: [-74.0059, 40.7128],
            },
            isUser: true,
            favoriteWorkout: "strength",
            bio: "Fitness enthusiast on a journey to a healthier lifestyle.",
            gender: "male",
            height: "6",
            weight: "180",
            hUnit: "ft",
            wUnit: "lb",
            address: {
              street: "123 Main St",
              apartment: "Apt 45",
              city: "New York",
              state: "NY",
              zip: "10001",
            },
            following: {
              users: [],
              gyms: [],
              trainers: [newTrainer1._id, newTrainer2._id],
            },
          });

          const user2 = await User.create({
            firstName: "Usertest",
            lastName: "Testtest",
            userName: "testUserTwo",
            email: "test.user2@example.com",
            phone: "1234501111",
            password: "testuser@123",
            passwordConfirm: "testuser@123",
            location: {
              type: "Point",
              coordinates: [-74.0059, 40.7128],
            },
            isUser: true,
            favoriteWorkout: "strength",
            bio: "Fitness enthusiast on a journey to a healthier lifestyle.",
            gender: "male",
            height: "6",
            weight: "180",
            hUnit: "ft",
            wUnit: "lb",
            address: {
              street: "123 Main St",
              apartment: "Apt 45",
              city: "New York",
              state: "NY",
              zip: "10001",
            },
            following: {
              users: [],
              gyms: [],
              trainers: [newTrainer1._id, newTrainer2._id],
            },
          });

          

          const newSession1 = await Session.create({
            name: "High-Intensity Interval Training (HIIT)",
            place: "Fitness Zone Gym",
            capacity: 20,
            workoutType: "Cardio",
            startDate: new Date("2023-12-20T09:00:00Z"),
            endDate: new Date("2023-12-30T10:00:00Z"),
            sessionSlots: [
              { weekday: "Monday", timeSlot: "09:00-10:00" },
              { weekday: "Wednesday", timeSlot: "09:00-10:00" },
              { weekday: "Friday", timeSlot: "09:00-10:00" },
            ],
            registeredUsers: [
                {
                  userId: user1._id,
                  registrationDate: new Date(),
                },
              ],
            isActive: true,
            createWhen: new Date(),
          });

          const newSession2 = await Session.create({
            name: "Strength Training Basics",
            place: "IronWorks Fitness",
            capacity: 15,
            workoutType: "Strength Training",
            startDate: new Date("2024-02-15T18:00:00Z"),
            endDate: new Date("2024-02-15T19:30:00Z"),
            sessionSlots: [
              { weekday: "Tuesday", timeSlot: "06:00-07:30" },
              { weekday: "Thursday", timeSlot: "06:00-07:30" },
            ],
            isActive: true,
            createWhen: new Date(),
          });

          const newSession3 = await Session.create({
            name: "Yoga and Meditation",
            place: "Zen Harmony Studio",
            capacity: 15,
            workoutType: "Yoga",
            startDate: new Date("2024-03-01T17:30:00Z"),
            endDate: new Date("2024-03-01T19:00:00Z"),
            sessionSlots: [
              { weekday: "Monday", timeSlot: "05:30-07:00" },
              { weekday: "Wednesday", timeSlot: "05:30-07:00" },
              { weekday: "Friday", timeSlot: "05:30-07:00" },
            ],
            isActive: false,
            createWhen: new Date(),
          });

          const newSession4 = await Session.create({
            name: "Core Workout",
            place: "Fitness Zone Gym",
            capacity: 20,
            workoutType: "Cardio",
            startDate: new Date("2023-12-20T09:00:00Z"),
            endDate: new Date("2023-12-30T10:00:00Z"),
            sessionSlots: [
              { weekday: "Monday", timeSlot: "09:00-10:00" }
            ],
            isActive: true,
            createWhen: new Date(),
          });

          
          
          
          newTrainer1.sessions.push(newSession1._id);
          newTrainer1.sessions.push(newSession3._id);
          newTrainer2.sessions.push(newSession2._id);
          newTrainer1.sessions.push(newSession4._id);
          newTrainer1.followers.users.push(user1._id);
          newTrainer2.followers.users.push(user1._id);
          await newTrainer1.save();
          await newTrainer2.save();
        
  
        //console.log("Trainers seeded successfully!");
        console.log("10. Test Data seeded successfully!");
      } catch (err) {
        console.error("Error seeding test data:", err);
      }
    }
  
    await seedTrainersNearMe();

    mongoose.connection.close();
  })();
  