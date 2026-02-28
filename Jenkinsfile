pipeline {
  agent {
    docker {
      image 'cypress/included:latest'
      args '--ipc=host --entrypoint='
    }
  }

  options {
    timeout(time: 15, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '5'))
  }

  stages {
    stage('Cypress Execution') {
      steps {
        checkout scm

        sh 'npx cypress install'

        sh 'npm install @bahmutov/cypress-esbuild-preprocessor esbuild @badeball/cypress-cucumber-preprocessor --no-save --prefer-offline'

        sh 'mkdir -p cypress/results cypress/screenshots cypress/videos'

        sh '''
          npx cypress run \
          --reporter junit \
          --reporter-options "mochaFile=cypress/results/results.xml,toConsole=true"
        '''

        // debug para confirmar
        sh 'ls -R cypress'
      }
    }
  }

  post {
    always {
      junit testResults: 'cypress/results/*.xml', allowEmptyResults: true
      archiveArtifacts artifacts: 'cypress/results/**, cypress/screenshots/**, cypress/videos/**', allowEmptyArchive: true
    }
  }
}