# BrainBytes AI Tutoring Platform

## Project Overview
BrainBytes is an AI-powered tutoring platform designed to provide accessible academic assistance to Filipino students. This project implements the platform using modern DevOps practices and containerization.

### Key Features
- **Dual Modes:** Anonymous Guest (privacy-first) & Authenticated (persistent memory).
- **Smart Context:** AI adapts to selected subjects and detects question intent.
- **Secure & Scalable:** Built with Node.js, Express, and MongoDB.

## AI Tutor Capabilities
Our AI assistant is designed to be flexible, supporting both anonymous interactions and personalized learning experiences.

### User Modes
| Mode | Description | Data Privacy & Memory |
|------|-------------|-----------------------|
| **Guest Mode** | Fully anonymous access. Ideal for quick, private queries. |  **Zero Retention:** Messages are **not** saved, logged, or stored anywhere. No history is kept. |
| **Authenticated Mode** | Personalized learning with persistent progress. |  **Context-Aware:** Chat history is securely saved and fed back to the AI, enabling "memory" for follow-up questions, continuity, and tailored responses. |

### Intelligent Context Handling
The AI adapts its responses based on user input and selected context:

*   **Smart Intent Detection:**
    *   Automatically identifies question types (e.g., *definitions*, *explanations*, *examples*) using keyword matching.
    *   Adjusts response depth and format accordingly (e.g., providing a concise definition vs. a detailed breakdown).

*   **Subject-Specific Context:**
    *   Users select a **Subject** via the chat dropdown menu.
    *   The selected subject is passed directly to the AI model, providing essential context to ensure responses are relevant and accurate to the specific domain.
 
---
### Architecture
#### Architecture Components
|Component	|Role	|Technology	|Port|
|----|-----|------|-------|
|User/Browser|	Client interface for application acces|s	Web browser|	N/A|
|Frontend Container (Next.js)	|Serves the user interface and handles client-side rendering|	Next.js	|3000-3020|
|Backend Container (Node.js)|	Processes business logic and manages API requests|	Node.js|	3000-3020|
|MongoDB (Cloud)	Persists application data	MongoDB Atlas	|27017/27017|
|Inference Provider	|External machine learning service for AI operations|	Hugging Face API	|N/A|

#### Request Flow
1. User interacts with the browser
2. Frontend Container serves the UI and sends API requests to the Backend Container
3. ackend Container processes requests and may call external services (Inference Provider or MongoDB)
4. Responses flow back through the stack to the user's browser
   
#### Key Benefits of This Architecture
- Containerization: Each service runs in isolation, ensuring independence and scalability
- Separation of concerns: Frontend, backend, and database have distinct responsibilities
- Scalability: Services can be scaled independently based on demand
- Cloud integration: Uses managed cloud services (MongoDB Atlas, Hugging Face) to offload infrastructure burden

### Project Goals
- Implement a containerized application with proper networking
- Create an automated CI/CD pipeline using GitHub Actions
- Deploy the application to Oracle Cloud Free Tier
- Set up monitoring and observability tools

### Team Members
- Gracielle - Team Lead - lr.gsalvador@mmdc.mcl.edu.ph
- J.R - Backend Developer - lr.jportillo@mmdc.mcl.edu.ph
- Krizia - Frontend Developer - lr.kaligado@mmdc.mcl.edu.ph
- Ralph - DevOps Engineer - lr.rrnocum@mmdc.mcl.edu.ph

---


## Setup & Installation

This project uses **Docker Compose** to orchestrate the Frontend (Next.js), Backend (Node.js/Express), and external services.

### Prerequisites

Ensure the following software is installed on your machine:

- **Docker Desktop** (v20.10+ or latest stable)
- **Docker Compose** (usually included with Docker Desktop)
- **Git**
- **Node.js** (v24+ required for local development, though Docker handles the runtime)

> **Hardware Note:** No special hardware is required. Ensure you have at least **4GB of RAM** available for Docker containers to run smoothly.

---

### Environment Variables

Create a `.env` file in the **root directory** of the project (same level as `docker-compose.yml`).

```bash
# Root .env file
HF_TOKEN=your_huggingface_api_token_here

MONGO_URI=mongodb://mongo:27017/brainbytes
# If using MongoDB Atlas, replace the line above with your connection string
# MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/brainbytes

```

----

### Running the Project

    Clone the repository:

    git clone <your-repo-url>
    cd brainbytes

    Configure Environment: Create the .env file as described above and fill in your credentials.

    Start the Containers:

    docker compose up --build

    The --build flag ensures the latest code changes are included.

    Access the Application:
        Frontend: http://localhost:8080
        Backend API: http://localhost:3000
        Health Check: http://localhost:3000/health

    Stop the Containers:

    docker compose down

### Common Errors & Troubleshooting
#### 1. Error: connect ECONNREFUSED 127.0.0.1:3000

Cause: The backend container hasn't started yet, or the health check failed. Fix:

    Run docker compose logs backend to check for startup errors.
    Ensure your .env file exists and MONGO_URI is correct.
    Wait 30 seconds for the start_period in the health check to pass.

#### 2. HuggingFace Inference Error: 401 Unauthorized

Cause: Invalid or missing HF_TOKEN. Fix:

    Check your .env file. Ensure HF_TOKEN is set correctly.
    Verify the token has valid permissions on the Hugging Face dashboard.
    Restart the backend: docker compose restart backend.

#### 3. MongoServerError: Authentication failed

Cause: Incorrect MongoDB URI or credentials. Fix:

    If using MongoDB Atlas: Ensure your IP address is whitelisted in the Atlas network access settings.
    If using Local Docker: Ensure the MONGO_URI points to mongodb://mongo:27017/brainbytes (not localhost).

#### 4. CORS Error in Browser Console

Cause: The frontend is trying to access the backend from a different origin without permission. Fix:

    Ensure FE_URL in the backend environment includes your frontend URL.
    In docker-compose.yml, the backend env is set to http://localhost:8080,http://frontend:3000. If you change the port, update this list.

#### 5. npm install fails inside container

Cause: Node version mismatch or corrupted cache. Fix:

    Delete the node_modules folders in both ./frontend and ./backend directories locally.
    Run docker compose down -v to remove volumes, then docker compose up --build.

#### 6. Port Already in Use (bind: address already in use)

Cause: Another application is using port 8080 or 3000. Fix:

    Change the port mapping in docker-compose.yml (e.g., "8081:3000").
    Or stop the conflicting application.


## Documentation

For detailed technical information, please refer to the dedicated docs:
|Topic	| Description	| Link
|---------|-----------|--------|
**API Reference**	| Full endpoint list, auth requirements, and examples | View API Docs
**Database Schema** |	ERD, field definitions, and indexing strategies |	View DB Schema
**Dev Workflow**|	Branching strategy, PR rules, and team process	| View Workflow
