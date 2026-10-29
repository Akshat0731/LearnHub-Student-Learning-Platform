# LearnHub – Student Learning Platform

LearnHub is a full-stack student learning platform designed to make online learning more organized and accessible. It allows students to explore courses, enroll in learning content, track their progress, and share feedback through course ratings and reviews.

## Features

- **Course Browsing:** Explore available courses and view course details.
- **User Authentication:** Register and log in securely.
- **Course Enrollment:** Enroll in courses and manage enrolled content.
- **Learning Progress:** Track progress through enrolled courses.
- **Course Reviews:** Submit ratings and feedback for courses.
- **Admin Dashboard:** View platform statistics and monitor course enrollments through interactive charts.

## Tech Stack

- **Frontend:** EJS, HTML, CSS, JavaScript, Bootstrap
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** Passport.js, Express Session
- **Visualization:** Chart.js
- **Other Tools:** Git, GitHub

## Application Routes

| Route | Description |
|---|---|
| `/` | Displays the home page |
| `/register` | Creates a new user account |
| `/login` | Authenticates registered users |
| `/logout` | Logs out the current user |
| `/courses` | Displays available courses |
| `/courses/:id` | Shows detailed course information |
| `/courses/:id/enroll` | Handles course enrollment |
| `/courses/:id/reviews` | Manages course ratings and reviews |
| `/my-courses` | Displays enrolled courses |
| `/admin` | Displays the administrative dashboard |

*Note: Adjust the route paths to match the actual endpoints defined in the project.*

## Database Models

- **User:** Stores user account and authentication-related information.
- **Course:** Stores course details and learning content.
- **Enrollment:** Connects users with their enrolled courses and tracks learning progress.
- **Feedback:** Stores course ratings and reviews.

## Key Highlights

- Full-stack web application with server-side rendering.
- MongoDB-based data persistence using Mongoose.
- Session-based authentication and protected routes.
- Course enrollment and progress management.
- Interactive analytics for monitoring learning activity.

## Author

**Akshat Chauhan**

- GitHub: [Akshat0731](https://github.com/Akshat0731)
- Project Repository: [LearnHub – Student Learning Platform](https://github.com/Akshat0731/LearnHub-Student-Learning-Platform)
