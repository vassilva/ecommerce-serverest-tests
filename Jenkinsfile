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

        echo 'Installing Cypress binary...'
        sh 'npx cypress install'

        echo 'Installing required plugins...'
        sh 'npm install @bahmutov/cypress-esbuild-preprocessor esbuild @badeball/cypress-cucumber-preprocessor --no-save --prefer-offline'

        sh 'npm install mocha-junit-reporter --no-save --prefer-offline'

        
        sh 'mkdir -p cypress/results cypress/screenshots cypress/videos'

        echo 'Running tests (JUnit XML)...'
        sh '''
          npx cypress run \
            --reporter mocha-junit-reporter \
            --reporter-options "mochaFile=cypress/results/results.xml,toConsole=true"
        '''

      
        sh '''
          echo "=== DEBUG: listing generated files ==="
          ls -la cypress || true
          ls -la cypress/results || true
          find cypress -maxdepth 3 -type f -print || true
        '''
      }
    }
  }

  post {
    always {
      
      junit testResults: 'cypress/results/*.xml', allowEmptyResults: false

     
      archiveArtifacts artifacts: 'cypress/results/**, cypress/screenshots/**, cypress/videos/**', allowEmptyArchive: true
    }
  }
}