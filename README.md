# CS-546-Final-Project
---

## Gym Partner/Trainer Finder Website Proposal

## Project Overview

Our project aims to create a gym partner/trainer finder website, which will provide a platform for fitness enthusiasts to connect with compatible workout partners and trainers. The website will offer two primary user types: regular users and certified trainers.
The motivation behind our project is to create a platform that simplifies and elevates the fitness experience for users. We recognize that maintaining a regular fitness routine can be challenging and, at times, solitary. Individuals often struggle to find compatible gym partners or trainers who share their fitness goals, schedules, and preferences. The current landscape of fitness apps and websites lacks the cohesion and user-centric features needed to bring fitness enthusiasts together.
Our project seeks to address these challenges by offering a user-friendly and community-oriented solution. We believe that connecting like-minded individuals and trainers can have a profound impact on one’s fitness journey. Working out with a partner not only provides motivation but also makes the journey enjoyable, while trainers offer expertise and guidance to help users reach their fitness goals.
Our website will be invaluable to users in several ways:Easy Partner/Trainer Finding, Enhanced Workout Planning, Community and Interaction, Progress Tracking By bringing these aspects together, our gym partner/trainer finder website aims to empower users in their fitness journeys, making it easier and more enjoyable for them to achieve their health and wellness goals.

## Core Features

-   Registration
    -   Streamlined registration process catering to both users and trainers, ensuring easy onboarding for all.
-   Search and Matching
    -   Seamlessly connect users with compatible partners or trainers by considering factors such as location, preferred gym, and workout preferences.
-   Profile Page
    -   Personalized user profiles that feature workout schedules and essential fitness details.
-   Threads
    -   Facilitating user interaction and the exchange of fitness experiences within the community.
-   Chat
    -   Enabling direct user-to-user communication with a built-in chat functionality.
-   Map Integration
    -   Displaying nearby gyms and users for convenient location-based connections.
-   Trainer Page \* Empowering certified trainers to post training schedules, allowing users to register for their
    sessions effortlessly.
-   Workout Plan Creation
    -   Collaborative workout plan creation, enabling users to develop customized fitness routines with their workout partners.
-   Analytics Page \* Providing users with insightful statistics on gym attendance and their partnership history,
    facilitating goal tracking and progress monitoring.

---

## Extra Features

-   Workout Routine Library: Create a library of predefined workout routines that users can select and follow.
-   Achievement Badges: Recognize and reward users for achieving fitness milestones or goals.
-   Workout Equipment Inventory: Users can list and share their available workout equipment,
    helping others find suitable partners for specific workouts.
-   User-Generated Challenges: Enable users to create and participate in fitness challenges with others.





# GymMate - Fitness Partner Finder App

GymMate is a fitness management application that helps users, trainers, and administrators manage their fitness activities, sessions, and more.

## Steps to Start the Project:

### Step 1: Clone the Repository

```bash
git clone https://github.com/AchantaTharun/cs546_group31_final_project
```

### Step 2: Rename Environment File
```Rename the env file to .env```

### Step 3: Install Dependencies

```npm install```

### Step 4: Run Seeder Command
Run the following command to seed the database. This may take around 10 minutes due to a large amount of data.

```npm run seed```
Have some snacks while the seeding process completes.

### Step 5: Start the Application

```npm run start```

The application will be available at http://localhost:3000/

### Step 6: Access the Admin Panel

To access the Admin Panel, use http://localhost:3000/api/v1/admin/login


email and password formats : 
======= USERS ===============
user email = 1-30 in string + email from users object from user seeder
user password= 1-30 in string + password from users object from user seeders

user email =   email from users object from user seeder + 2-30 + USA
user password= password from users object from user seeders +2-30+USA


email and password formats : 
============= Trainers ===================
approved
i from 2-20 and 1

`${i}` + trainer.email + "trainer",
`${i}` + trainer.password + "trainer",

non approved
i from 2-20 and 1
`${i}` + trainer.email + "Trainer",
`${i}` + trainer.password + "Trainer",

email and password formats : 
============= Gyms ===================

for approved gyms
i= 1  or between 11-20
`${i}` + gym.email + "gym",
`${i}` + gym.password + "gym"


for pending gyms
i= 1  or between 11-20
`${i}` + gym.email + "Gym",
`${i}` + gym.password + "Gym"