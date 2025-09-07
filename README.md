 Hangman Game

A modern, responsive Hangman word guessing game built with Next.js, featuring user authentication, score tracking, and leaderboard functionality for the assignment as mentioned in the document,i got on email.

 Tech Stack

 Frontend: Next.js 14, React, Tailwind CSS
 Backend: Next.js API Routes, Node.js
 Database: MongoDB with Mongoose ODM
 Authentication: JWT tokens with HTTPonly cookies
 Deployment: Docker, AWS EC2, GitHub Actions CI/CD
 Styling: Tailwind CSS with custom design system

 Project Overview

 State Management
 React Context for global user state
 Local state management with useState and useEffect hooks
 localStorage for clientside token persistence

 API Endpoints
 POST /api/auth/signup  User registration
 POST /api/auth/login  User authentication
 GET /api/auth/me  Get current user
 POST /api/auth/logout  User logout
 GET /api/game/random  Fetch random word
 POST /api/score/submit  Submit game score
 GET /api/leaderboard  Get top players

 Data Flow
1. User authentication via JWT tokens stored in HTTPonly cookies
2. Game state managed locally with React hooks
3. Score submission to MongoDB via API routes
4. Realtime leaderboard updates from database

 Key Features
 Guest mode and authenticated user modes
 Score calculation based on wins and wrong guesses
 Responsive design optimized for mobile and desktop
 Rate limiting and input validation
 Error handling and user feedback

 Setup Instructions

 Development

1. Clone the repository
bash
git clone 
cd HangMan


2. Install dependencies
bash
npm install


3. Set up environment variables
bash
cp .env.example .env.local

Add your MongoDB connection string and JWT secret.

4. Run the development server
bash
npm run dev


5. Open [http://localhost:3000](http://localhost:3000) in your browser

 Production

1. Build the application
bash
npm run build


2. Start the production server
bash
npm start


 Docker Setup

The application is containerized using Docker for consistent deployment.

1. Build Docker image
bash
docker build t hangmanapp .


2. Run container
bash
docker run p 3000:3000 hangmanapp


3. Using Docker Compose
bash
dockercompose up d


 Deployment

 Live Application
URL: [http://16.170.237.155:3000/](http://16.170.237.155:3000/)

 Infrastructure
 Server: AWS EC2 instance
 Containerization: Docker
 CI/CD: GitHub Actions
 Database: MongoDB Atlas

 CI/CD Pipeline

 GitHub Actions Workflow

The project uses GitHub Actions for automated deployment to EC2:

1. Trigger: Push to main branch
2. Build: Docker image creation
3. Deploy: SSH to EC2 and update application
4. Restart: Container restart for zerodowntime deployment

 Environment Variables Setup

Required GitHub Secrets:
 EC2_HOST: EC2 instance IP address
 EC2_USER: SSH username
 EC2_SSH_KEY: Private SSH key
 MONGODB_URI: Database connection string
 JWT_SECRET: JWT signing secret

 Deployment Flow

1. Code changes pushed to main branch
2. GitHub Actions workflow triggered
3. Application built and tested
4. Docker image created
5. SSH connection to EC2 established
6. New container deployed
7. Application restarted with zero downtime

 Project Structure


src/
├── app/
│   ├── api/            API routes
│   ├── dashboard/      User dashboard
│   ├── game/           Game interface
│   ├── leaderboard/    Leaderboard page
│   ├── login/          Authentication pages
│   └── signup/
├── lib/                Utility functions
└── models/             Database models

 Features

 Authentication: Secure user registration and login
 Game Modes: Guest play and authenticated user modes
 Score Tracking: Persistent score storage and leaderboard
 Responsive Design: Mobilefirst design approach
 Error Handling: Comprehensive validation and error management
 Rate Limiting: API protection against abuse
 Security: Input sanitization and XSS protection

