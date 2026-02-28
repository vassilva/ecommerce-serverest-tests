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
        checkout scm

        echo 'Installing missing binary and plugins...'
        sh 'npx cypress install'

        sh 'npm install @bahmutov/cypress-esbuild-preprocessor esbuild @badeball/cypress-cucumber-preprocessor --no-save --prefer-offline'

        // Ensure folders exist so Jenkins can find them even if empty
        sh 'mkdir -p cypress/results cypress/screenshots cypress/videos'

        echo 'Running tests (with JUnit report)...'
        sh '''
          npx cypress run \
            --reporter junit \
            --reporter-options "mochaFile=cypress/results/results.xml,toConsole=true"
        '''

        // Debug aid: show what was generated
        sh 'ls -R cypress || true'
      }
    }
  }

  post {
    always {
      // Publish tests in Jenkins UI
      junit testResults: 'cypress/results/*.xml', allowEmptyResults: true

      // Archive evidence + report files
      archiveArtifacts artifacts: 'cypress/results/**, cypress/screenshots/**, cypress/videos/**', allowEmptyArchive: true
    }
  }
}