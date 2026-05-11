# BrainBytes AI Tutoring Platform

## Project Overview
BrainBytes is an AI-powered tutoring platform designed to provide accessible academic assistance to Filipino students. This project implements the platform using modern DevOps practices and containerization.

## Team Members
- [Gracielle] - Team Lead - [lr.gsalvador@mmdc.mcl.edu.ph]
- [J.R] - Backend Developer - [lr.jportillo@mmdc.mcl.edu.ph]
- [Krizia] - Frontend Developer - [lr.kaligado@mmdc.mcl.edu.ph]
- [Ralph] - DevOps Engineer - [lr.rrnocum@mmdc.mcl.edu.ph]

## Project Goals
- Implement a containerized application with proper networking
- Create an automated CI/CD pipeline using GitHub Actions
- Deploy the application to Oracle Cloud Free Tier
- Set up monitoring and observability tools

## Prerequisites
- Git
-  Docker & Docker Compose

## Setup & Run

    Clone repository
        git clone
    Configure environment
        visit .env.example and follow the instructions.
    Start with Docker Compose
        docker compose up --build
    Open the app
        http://localhost:8080/
    Stop
        Ctrl+C then docker-compose down

## API Overview
Authentication is not implemented yet for all endpoints. (Note: user profile endpoints are designed for auth but auth is not yet implemented.)

### 1) Learning Materials
- **GET /api/materials**  
  **Description:** Get all learning materials.

- **POST /api/materials**  
  **Description:** Create a new learning material.  
  **Body (JSON):**
  ```json
  {
    "subject": "",
    "topic": "",
    "content": ""
  }
  ```

### 2) Messages
- **POST /api/messages**  
  **Description:** Create a new message (chat history).  
  **Body (JSON):**
  ```json
  {
    "text": "",
    "isUser": true
  }
  ```

### 3) Subjects
- **GET /subjects**  
  **Description:** Get all subjects.

- **GET /subjects/:id**  
  **Description:** Get subject by ID.

- **POST /subjects**  
  **Description:** Create new subject.  
  **Body (JSON):**
  ```json
  {
    "name": "",
    "description": "",
    "tags": ["tag1", "tag2"]
  }
  ```

- **PUT /subjects/:id**  
  **Description:** Update subject.  
  **Body (JSON):** Fields to update (any of `name`, `description`, `tags`), for example:
  ```json
  {
    "name": "New Name",
    "description": "Updated description",
    "tags": ["tag1","tag3"]
  }
  ```

- **DELETE /subjects/:id**  
  **Description:** Delete subject.

### 4) User Profile (auth planned)
Note: These endpoints expect auth in the future; currently they exist but no auth enforcement is implemented.

- **POST /profile**  
  **Description:** Create new user profile.  
  **Body (JSON):**
  ```json
  {
    "name": "",
    "email": "",
    "password": "",
    "preferredSubjects": [""]
  }
  ```

- **GET /profile/:id**  
  **Description:** Get profile by ID.

- **PUT /profile/:id**  
  **Description:** Update profile.  
  **Body (JSON):** Fields to update (e.g., `name`, `email`, `password`, `preferredSubjects`).

- **DELETE /profile/:id**  
  **Description:** Delete profile.

Passwords are stored but model configuration hides them by default (select: false) in schema.

## Database Schema

Collections:

    Subject
        Purpose: Educational topics
        Key fields: name, description, tags
    UserProfile
        Purpose: User accounts
        Key fields: name, email, password, preferredSubjects (array of Subject IDs)
    LearningMaterial
        Purpose: Educational content
        Key fields: subject, topic, content
    Message
        Purpose: Chat history
        Key fields: text, isUser (boolean), createdAt

Design patterns:

- Timestamps: models use createdAt (Date.now)
- Validation: email validated, password hidden by default (select: false)
- Flat schema structure for simplicity, for noe

## AI Enhancements
- Expanded training data with more examples across subjects through hardcoded keyword matching.
- Basic question-type detection (definitions, explanations, examples)through hardcoded keyword matching.
- Basic sentiment analysis to detect user frustration/confusion through integration with a Hugging Face text classification model for intent/sentiment

## Notes:
- Comprehensive tests in Postman to be done in the future.
