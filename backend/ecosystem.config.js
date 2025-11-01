// PM2 configuration file for managing the backend application.
// This ensures the application restarts automatically if it crashes.

module.exports = {
  apps: [{
    name: "backend-app", // A friendly name for your application
    script: "./server.js", // The path to the script you want to run
    // Specify environment variables here if needed
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
};
