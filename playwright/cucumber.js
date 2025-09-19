// cucumber.js
// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('🛑 Unhandled Promise Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err);
  process.exit(1);
});

module.exports = {
  default: `--require tests/support/setup.js --require tests/steps/**/*.js tests/features/**/*.feature`
};
