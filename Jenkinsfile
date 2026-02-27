pipeline {
    agent any 

    options {
        timeout(time: 15, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '5'))
    }

    stages {
        stage('Cypress Execution') {
            agent {
                docker {
                    image 'cypress/included:latest' 
                    args '--ipc=host --entrypoint=' 
                }
            }

            steps {
                script {
                    checkout scm
                    sh 'npx cypress run'
                }
            }
        }
    }

    post {
        always {
            node('built-in') { 
                archiveArtifacts artifacts: 'cypress/screenshots/**, cypress/videos/**', allowEmptyArchive: true
            }
        }
    }
}
