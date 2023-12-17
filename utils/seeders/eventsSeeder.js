import mongoose from "mongoose";
import Event from "../../models/eventModel.js";
mongoose.connect("mongodb://localhost:27017/GymMate", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

function getRandomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

async function seedDB() {
  try {
    const characterEvents = {
      breakingbad: [
        {
          character: "Walter White",
          title: "Walt's MethFit Challenge",
          description: `Join Walter White in this high-energy workout where we'll cook up some fitness tips as hot as blue meth! Warning: No hazmat suits needed, but expect explosive results!`,
        },
        {
          character: "Jesse Pinkman",
          title: "Jesse's Yo-Yo Slimming",
          description: `B**ch! Get ready to yo-yo your way into shape with Jesse Pinkman. It's not science, it's just good old fun and fitness, yo!`,
        },
      ],
      thesopranos: [
        {
          character: "Tony Soprano",
          title: "Tony's Mob Muscle Workout",
          description: `Join Tony Soprano in this intense workout, Capisce? Leave the horse heads at home and let's strengthen those muscles before dealing with family business.`,
        },
        {
          character: "Paulie Gualtieri",
          title: "Paulie's Soprano Stroll",
          description: `Take a stroll with Paulie Gualtieri, where wise guys and fitness collide. You won't find cannolis, just abs of steel and wiseguy wisdom!`,
        },
      ],
    };

    for (const show in characterEvents) {
      for (const event of characterEvents[show]) {
        const { character, title, description } = event;
        const newEvent = new Event({
          img: `https://yourimagehost.com/${show}.jpg`,
          title,
          description,
          contactEmail: "contact@example.com",
          eventLocation: {
            streetAddress: "123 Gym Street",
            city: "Fitnessville",
            state: "CA",
            zipCode: "12345",
          },
          maxCapacity: Math.floor(Math.random() * 50) + 10,
          priceOfAdmission: Math.floor(Math.random() * 50) + 10,
          eventDate: getRandomDate(
            new Date(),
            new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
          ),
          startTime: "09:00",
          endTime: "11:00",
          totalNumberOfAttendees: 0,
          attendees: [],
        });

        await newEvent.save();
        //console.log(`Created event for ${character} in ${show.toUpperCase()}`);
      }
    }
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

seedDB();
