const { defineConfig } = require("cypress");
const chalk = require('chalk');
module.exports = defineConfig({
  e2e: {
	defaultCommandTimeout: 10000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
	  on('task', {
        log(data) {
		  // black, red, green, yellow, blue, magenta, cyan, white, gray (or grey)
		  if (chalk[data.color] && typeof chalk[data.color] === 'function') {
			//console.log(chalk[color](JSON.stringify(message, null, 2)));
			console.log(chalk[data.color](data.message));
		  } else {
			console.log(chalk.green(`${data.message}`));
		  }
		  return null;
        },
      });
    },
  },
});
