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
                    
                    echo 'Installing missing binary and plugins...'
                    
                    // Garante que o executável do Cypress esteja presente
                    sh 'npx cypress install'
                    
                    // Instala os plugins do Cucumber
                    sh 'npm install @bahmutov/cypress-esbuild-preprocessor esbuild @badeball/cypress-cucumber-preprocessor --no-save --prefer-offline'
                    
                    echo 'Running Tests...'
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