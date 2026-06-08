# DSO101 — Continuous Integration & Continuous Deployment
**Choki Wangchuk | Student ID: 02240336**
Bachelor of Engineering in Software Engineering — Royal University of Bhutan

---

> This repository documents my journey through four assignments in DSO101, where I went from building a basic todo app all the way to automating its deployment using Jenkins, GitHub Actions, Docker, and Render.com. It wasn't always smooth sailing — but that's kind of the point.

---

## 📁 Repository Structure

```
/
├── frontend/               # React frontend for the todo app
├── backend/                # Node.js/Express backend API
│   └── Dockerfile
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions CI/CD workflow
├── Jenkinsfile             # Jenkins pipeline definition
├── render.yaml             # Render.com multi-service blueprint
└── README.md
```

---

## Assignment 1 — Building & Deploying the Todo App 

**Submitted:** 12th March

### What I built

A full-stack todo list application with:
- A **React frontend** where you can add, edit, and delete tasks
- A **Node.js + Express backend** serving a CRUD REST API
- A **PostgreSQL database** for persistent storage (hosted on Render)

### Part A — Pushing Docker Images to DockerHub

The first real challenge was containerizing both the frontend and backend separately and pushing them to DockerHub with my student ID as the image tag.

```bash
# Backend image
docker build -t chodukwangchuk/be-todo:02240336 ./backend
docker push chodukwangchuk/be-todo:02240336

# Frontend image
docker build -t chodukwangchuk/fe-todo:02240336 ./frontend
docker push chodukwangchuk/fe-todo:02240336
```

Once the images were on DockerHub, I deployed them on Render.com by selecting **"Deploy from existing image"** and wiring up the environment variables.

**Environment variables configured on Render:**

| Variable | Purpose |
|----------|---------|
| `DB_HOST` | PostgreSQL host from Render dashboard |
| `DB_USER` | Database username |
| `DB_PASSWORD` | Database password |
| `PORT` | Backend server port (5000) |
| `REACT_APP_API_URL` | Live backend URL for the frontend |

> 💡 Important: `.env` files are never committed to Git. All sensitive values go into Render's environment variable settings or GitHub Secrets.

### Part B — Automated Builds with render.yaml

Instead of manually rebuilding images, I configured a `render.yaml` blueprint so Render automatically builds and redeploys on every new git push. This was my first taste of what "automated deployment" actually means in practice.

```yaml
services:
  - type: web
    name: be-todo
    env: docker
    dockerfilePath: ./backend/Dockerfile
    envVars:
      - key: DB_HOST
        value: your-render-db-host
      - key: PORT
        value: 5000

  - type: web
    name: fe-todo
    env: docker
    dockerfilePath: ./frontend/Dockerfile
    envVars:
      - key: REACT_APP_API_URL
        value: https://be-todo.onrender.com
```

### Challenges
- Getting the `.env` variables to work correctly across local and production environments took some trial and error
- The frontend kept pointing to `localhost` in production until I properly set `REACT_APP_API_URL`

---

## Assignment 2 — Jenkins CI/CD Pipeline 🔧

**Submitted:** 25th March

### What I built

A full Jenkins pipeline that automatically runs every time code is pushed to the `main` branch — checkout, install, build, test, and deploy, all without touching anything manually.

### Pipeline Stages

```
Checkout → Tool Install → Install Dependencies → Build → Test → Deploy
```

Here's the Jenkinsfile I wrote:

```groovy
pipeline {
    agent any
    tools {
        nodejs 'NodeJS'
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                url: 'https://github.com/ChokiWangchuk-bot/assignment1-node-app.git'
            }
        }
        stage('Install') {
            steps {
                sh 'npm install'
            }
        }
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
            post {
                always {
                    junit 'junit.xml'
                }
            }
        }
        stage('Deploy') {
            steps {
                script {
                    docker.build('chodukwangchuk/todo-app:latest')
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-creds') {
                        docker.image('chodukwangchuk/todo-app:latest').push()
                    }
                }
            }
        }
    }
}
```

### Jenkins Setup

1. Installed Jenkins locally at `http://localhost:8080`
2. Installed plugins: NodeJS, Pipeline, GitHub Integration, Docker Pipeline
3. Configured Node.js LTS v20 under **Manage Jenkins > Tools**
4. Added GitHub credentials (Personal Access Token) to Jenkins

### Pipeline Results

After a few failed attempts (the deploy stage kept failing because of Docker registry authentication), I got it fully working:

| Build | Result | Notes |
|-------|--------|-------|
| #6 | ❌ Failed | Test + Deploy failed |
| #7 | ❌ Failed | Deploy stage failing |
| #8 | ✅ Passed | All stages green |
| #9 | ✅ Passed | Clean run, ~13s total |

### Challenges
- The deploy stage failed twice before I figured out the Docker credentials weren't configured properly in Jenkins
- Had to make sure Jest was generating JUnit XML reports for Jenkins to pick up under Test Results

---

## Assignment 3 — GitHub Actions + Render Deployment 

**Submitted:** 29th April

### What I built

Moved CI/CD from my local Jenkins setup to the cloud using **GitHub Actions**. Now every push to `main` automatically builds and pushes a Docker image to DockerHub, then triggers a live redeployment on Render.com.

### Why this is different from Assignment 2

| | Assignment 2 (Jenkins) | Assignment 3 (GitHub Actions) |
|--|------------------------|-------------------------------|
| Runs on | My local machine | GitHub's cloud servers |
| Trigger | Manual or webhook | Automatic on git push |
| Deployment | DockerHub only | DockerHub + live Render URL |
| Availability | Only when my laptop is on | Always available |

### The Workflow (deploy.yml)

```yaml
name: Deploy to Render

on:
  push:
    branches: ["main"]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Login to DockerHub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and Push Docker Image
        run: |
          docker build -t ${{ secrets.DOCKERHUB_USERNAME }}/todo-app:latest ./backend
          docker push ${{ secrets.DOCKERHUB_USERNAME }}/todo-app:latest

      - name: Trigger Render Deployment
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

### GitHub Secrets Configured

| Secret | Purpose |
|--------|---------|
| `DOCKERHUB_USERNAME` | DockerHub account username |
| `DOCKERHUB_TOKEN` | DockerHub access token |
| `RENDER_DEPLOY_HOOK` | Render.com deploy webhook URL |

### Workflow Results

| Run | Trigger | Result | Duration |
|-----|---------|--------|----------|
| #2 | Fix Docker build path | ✅ Passed | 33s |
| #3 | Update Dockerfile | ✅ Passed | 31s |

### Render Deployment

Both services are live on Render:
- **todo-backend** — Status: Deployed ✅
- **todo-app:latest** — Status: Deployed ✅

**Live URL:** https://dashboard.render.com/web/srv-d82lp357vvec7386tna0

### Challenges
- The Docker build was initially pointing to the wrong path — it was trying to build from the repo root instead of `./backend`
- The secret name in `deploy.yml` didn't match what was saved in GitHub Secrets (`RENDER_DEPLOY_HOOK_URL` vs `RENDER_DEPLOY_HOOK`) — a small typo that caused a failed run

---

## Assignment 4 — First Deployment with GitHub & Render 

**Submitted:** 13th May

### What I built

A streamlined deployment setup where pushing code to GitHub automatically triggers a deployment on Render.com — no Docker, no complex pipeline, just clean and simple CI/CD.

### GitHub Actions Workflow

```yaml
name: Deploy to Render

on:
  push:
    branches: ["main"]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Notify deployment
        run: echo "Code pushed successfully! Render will auto-deploy."
```

### Deployment

Connected the GitHub repository directly to Render.com as a **Web Service**. Render detects new commits and rebuilds automatically.

 **Live URL:** https://todo-backend.onrender.com

### Challenges
- Understanding the difference between deploying from a Docker image vs deploying directly from a GitHub repo
- Making sure the start command was correctly configured on Render

---

## Overall Learning Outcomes

Going through all four assignments, here's what genuinely clicked for me:

**CI/CD isn't magic — it's just automation.** Every stage in Jenkins or GitHub Actions is something I would have done manually anyway. The pipeline just does it faster and without me being there.

**Environment variables matter more than I expected.** Getting the right values to the right place — local, Docker, Render — was the source of most of my bugs.

**Failing builds are part of the process.** Build #6 and #7 failing in Jenkins wasn't a setback, it was how I learned what was actually going wrong with Docker credentials.

**Local CI/CD (Jenkins) vs cloud CI/CD (GitHub Actions)** serve different purposes. Jenkins gives you full control; GitHub Actions gives you convenience and scalability.

---

##  Links

- **GitHub Repository:** https://github.com/ChokiWangchuk-bot/DSO101_02240336.git
- **DockerHub Image:** https://hub.docker.com/r/chodukwangchuk/todo-app
- **Live App (Render):** https://dashboard.render.com/web/srv-d82lp357vvec7386tna0
