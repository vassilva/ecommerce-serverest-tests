pipeline {
    agent none

    // Adicionado um timeout global para o build não ficar preso para sempre
    options {
        timeout(time: 15, unit: 'MINUTES')
    }

    stages {
        stage('Cypress (docker)') {
            agent {
                docker {
                    image 'cypress/included:latest'
                    // Aumentamos a memória compartilhada para evitar que o Cypress trave
                    args '--ipc=host'
                }
            }

            environment {
                CYPRESS_baseUrl = 'https://front.serverest.dev'
                // Força o Node a ter mais fôlego de memória dentro do container
                NODE_OPTIONS = '--max-old-space-size=2048'
            }

            steps {
                script {
                    echo 'Step 1: Checking out code from GitHub...'
                    checkout scm

                    echo 'Step 2: Installing dependencies (clean install)...'
                    // Adicionamos flags para ignorar auditorias e telemetria (mais rápido e estável)
                    sh 'npm ci --quiet --no-audit --no-fund'

                    echo 'Step 3: Running Cypress E2E tests with Cucumber...'
                    sh 'npx cypress run'
                }
            }
        }
    }

    post {
        always {
            echo 'Final Step: Archiving test artifacts (Screenshots & Videos)...'
            archiveArtifacts artifacts: 'cypress/screenshots/**, cypress/videos/**', allowEmptyArchive: true
        }
    }
}
