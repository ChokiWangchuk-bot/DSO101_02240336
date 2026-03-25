# DSO101_02240336
DSO assignments are done here


Assignment Two: CI/CD Practices
📌 Project Overview
This setup demonstrates the end-to-end automation of a Node.js application using Jenkins. Whenever new code is submitted, it automatically initiates a series of steps—building the application, running tests, and deploying updates—without manual intervention. The process flows sequentially, with each stage triggered by the completion of the previous one. Configuration files define the workflow, ensuring smooth transitions between phases. Operations such as compiling code, running validations, and deployment occur in a structured order, requiring minimal human input. Each pipeline execution starts upon code submission, activating predefined scripts that carry out the necessary tasks. The system relies solely on configured automation, with no additional tools involved. The goal is consistent, reliable, and repeatable deployments. Every update follows the exact same path, maintaining uniformity across releases.
---
Tools and technologies used
- Jenkins (for CI/CD automation)
- GitHub (to manage source code)
- Node.js & npm (application runtime and dependency management)
- Jest (testing framework)
- Docker (optional, for containerized deployment)
---
⚙️ Pipeline Configuration
The pipeline is defined in a file named Jenkinsfile, located in the root of the project directory. It outlines a linear sequence of stages: first pulling the latest code, then installing dependencies, running tests, building components, deploying changes, and finally sharing outcome reports.
1. Checkout
- Fetches the latest source code from the GitHub repository.
2. Install Dependencies
- Downloads and sets up required packages using:
