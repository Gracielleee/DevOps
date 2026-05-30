# BrainBytes AI Tutoring Platform

## Project Overview
BrainBytes is an AI-powered tutoring platform designed to provide accessible academic assistance to Filipino students. This project implements the platform using modern DevOps practices and containerization.

### Key Features
- **Dual Modes:** Anonymous Guest (privacy-first) & Authenticated (persistent memory).
- **Smart Context:** AI adapts to selected subjects and detects question intent.
- **Secure & Scalable:** Built with Node.js, Express, and MongoDB.

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

## Quickstart 

### Prerequisites
- Git
-  Docker & Docker Compose

### Setup & Run

    Clone repository
        git clone
    Configure environment
        visit .env.example and follow the instructions.
    Start with Docker Compose
        docker-compose up
    Open the app
        http://localhost:8080/
    Stop
        Ctrl+C then docker-compose down


### First Run
1. Start the server.
2. Import the Postman Collection to test endpoints.
3. Register a user or try the Guest mode.

----

## Documentation

For detailed technical information, please refer to the dedicated docs:
|Topic	| Description	| Link
|---------|-----------|--------|
**API Reference**	| Full endpoint list, auth requirements, and examples | View API Docs
**Database Schema** |	ERD, field definitions, and indexing strategies |	View DB Schema
**Dev Workflow**|	Branching strategy, PR rules, and team process	| View Workflow
