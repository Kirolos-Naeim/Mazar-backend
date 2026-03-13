pipeline {
  agent {
    docker { image 'node:20-alpine' } 
  }
  options {
    timestamps()
    // Discard old builds: keep last 10
    buildDiscarder(logRotator(numToKeepStr: '10'))
  }

  environment {
    NODE_ENV = 'test'
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
        echo "Checked out branch: ${env.BRANCH_NAME ?: 'unknown'}"
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'npm ci || npm install'
      }
    }

    stage('Test') {
      steps {
        sh 'npm test'
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }

  }

  post {
    always {
      echo "Pipeline finished with status: ${currentBuild.currentResult}"
    }
    success {
      echo 'Build succeeded!'
    }
    failure {
      echo 'Build FAILED. Check the logs above for details.'
    }
  }
}
