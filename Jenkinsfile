pipeline {
    agent none

    stages {
        stage('Cypress (docker)') {
            agent {
                docker {
                    // Updated to 'latest' to ensure Node.js compatibility (v20+)
                    image 'cypress/included:latest'
                    args '--ipc=host'
                }
            }

            environment {
                CYPRESS_baseUrl = 'https://front.serverest.dev'
            }

            steps {
                script {
                    echo 'Step 1: Checking out code from GitHub...'
                    checkout scm
                    
                    echo 'Step 2: Installing dependencies (clean install)...'
                    // --quiet reduces log noise and speeds up the process
                    sh 'npm ci --quiet'
                    
                    echo 'Step 3: Running Cypress E2E tests with Cucumber...'
                    sh 'npx cypress run'
                }
            }

            post {
                always {
                    echo 'Final Step: Archiving test artifacts (Screenshots & Videos)...'
                    archiveArtifacts artifacts: 'cypress/screenshots/**, cypress/videos/**', allowEmptyArchive: true
                }
            }
        }
    }
}
