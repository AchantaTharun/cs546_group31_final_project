import mongoose from "mongoose";
import Post from "../../models/postModel.js";

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
    const characterPosts = {
      breakingbad: [
        {
          character: "Walter White",
          title: '"Walter\'s Chemistry Chronicles"',
          description: `In this post, Walter White shares his secret formula for success - a blend of chemistry and life lessons. But remember, cooking isn't just for meth, let's cook some inspiring thoughts too!`,
        },
        {
          character: "Jesse Pinkman",
          title: '"Jesse\'s Philosophical Ramblings"',
          description: `Yo, check it out! Jesse Pinkman is here with some deep thoughts that go beyond 'yeah science'. Join in for a philosophical rollercoaster ride, B**ch!`,
        },
      ],
      thesopranos: [
        {
          character: "Tony Soprano",
          title: '"Tony\'s Wisdom Wall"',
          description: `Leave a message on Tony Soprano's Wisdom Wall, where family, fitness, and funny business collide. Remember, what's posted on the wall stays on the wall, Capisce?`,
        },
        {
          character: "Paulie Gualtieri",
          title: `"Paulie's Soprano Shenanigans"`,
          description: `Join Paulie Gualtieri for a ride through Soprano shenanigans. From mob stories to the best pasta recipes, it's a post you can't refuse!`,
        },
      ],
    };

    for (const show in characterPosts) {
      for (const post of characterPosts[show]) {
        const { character, title, description } = post;
        const newPost = new Post({
          title,
          img: `https://yourimagehost.com/${show}.jpg`,
          description,
          createdAt: getRandomDate(
            new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
            new Date()
          ),
          user: {
            userId: "userid123",
            userType: "User",
          },
          comments: {
            trainers: [],
            gyms: [],
            users: [],
          },
        });

        await newPost.save();
        //console.log(`Created post for ${character} in ${show.toUpperCase()}`);
      }
    }
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

seedDB();
