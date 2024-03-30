module.exports = {
    apps : [{
      name: "caly_backend_app",
      script: "./dist/main.js",
      cwd: ".",
      watch: true,
      env: {
        NODE_ENV: "production",
      }
    }]
  };
