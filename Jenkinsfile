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
          sh 'npx cypress install'

          sh 'npm install @bahmutov/cypress-esbuild-preprocessor esbuild @badeball/cypress-cucumber-preprocessor --no-save --prefer-offline'

          echo 'Running tests...'
          sh 'mkdir -p cypress/results'

          // Run Cypress and generate JUnit XML test results for Jenkins
          sh '''
            npx cypress run \
              --reporter junit \
              --reporter-options "mochaFile=cypress/results/junit-[hash].xml,toConsole=true"
          '''
        }
      }
    }
  }

  post {
    always {
      // Publish test results in Jenkins (Test Result page)
      junit testResults: 'cypress/results/*.xml', allowEmptyResults: true

      // Archive evidence + test result files
      archiveArtifacts artifacts: 'cypress/results/**, cypress/screenshots/**, cypress/videos/**', allowEmptyArchive: true
    }
  }
}