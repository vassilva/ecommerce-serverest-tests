pipeline {
    // 'any' ensures Jenkins has an executor available to manage the pipeline lifecycle
    agent any 

    options {
        // Increased to 30 minutes to compensate for Docker-on-Windows disk latency
        timeout(time: 30, unit: 'MINUTES')
        // Keeps the UI clean by only saving the last 5 builds
        buildDiscarder(logRotator(numToKeepStr: '5'))
    }

    stages {
        stage('Cypress (docker)') {
            agent {
                docker {
                    image 'cypress/included:latest'
                    // --ipc=host is vital to prevent Cypress from crashing due to memory limits
                    args '--ipc=host'
                }
            }

            environment {
                CYPRESS_baseUrl = 'https://front.serverest.dev'
                // Provides more RAM to Node.js for heavy dependency processing
                NODE_OPTIONS = '--max-old-space-size=2048'
            }

            steps {
                script {
                    echo 'Step 1: Checking out code from GitHub...'
                    checkout scm

                    echo 'Step 2: Installing dependencies (Fast Mode)...'
                    // 'npm install' with these flags is more resilient on Docker/Windows than 'npm ci'
                    sh 'npm install --no-package-lock --prefer-offline --no-audit --no-fund'

                    echo 'Step 3: Running Cypress E2E tests with Cucumber...'
                    sh 'npx cypress run'
                }
            }
        }
    }

    post {
        always {
            // The 'node' block here fixes the "context" error seen in Build #7
            node('built-in') { 
                echo 'Final Step: Archiving test artifacts (Screenshots & Videos)...'
                archiveArtifacts artifacts: 'cypress/screenshots/**, cypress/videos/**', allowEmptyArchive: true
            }
        }
    }
}
