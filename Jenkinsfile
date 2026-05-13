pipeline {
    agent any
    tools {
        nodejs 'NodeJS'
    }
    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/ChokiWangchuk-bot/DSO101_02240336.git',
                    credentialsId: 'github-creds'
            }
        }

        stage('Install') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Build') {
            steps {
                dir('backend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Test') {
            steps {
                dir('backend') {
                    sh 'npm test'
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'backend/junit.xml', allowEmptyArchive: true
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    docker.build('chokiwangchuk-bot/todo-app:latest')
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-creds') {
                        docker.image('chokiwangchuk-bot/todo-app:latest').push()
                    }
                }
            }
        }

    }
}