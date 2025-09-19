process.on('unhandledRejection', (reason, promise) => {
  console.error('🛑 Unhandled Promise Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err);
  process.exit(1);
});

module.exports = {
  default: [
    '--require tests/support/setup.js',
    '--require tests/steps/**/*.js',
    '--format json:reports/json/cucumber_report.json', // ✅ JSON output path
    'tests/features/**/*.feature'
  ].join(' ')
};
