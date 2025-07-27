const chalk = require('chalk');
const figlet = require('figlet');
const config = require("@config/host");
const printStartupBanner = () => {
  console.log('');
  console.log(chalk.red(figlet.textSync('blockman', { horizontalLayout: 'default' })));
  console.log('');
  console.log(chalk.green.bold('╔══════════════════════════════════════════╗'));
  console.log(chalk.green.bold('║') + ` 🚀 Listening on: ${chalk.cyan(`http://localhost:${config.apiPort}`)} ` + chalk.green.bold('║'));
  console.log(chalk.green.bold('╚══════════════════════════════════════════╝'));
  console.log('');
  console.log(chalk.green.bold('╔══════════════════════════════════════════╗'));
  console.log(chalk.green.bold('║') + ` 🔥 Version ${chalk.cyan(`1.9.17`)} ` + chalk.green.bold('║'));
  console.log(chalk.green.bold('╚══════════════════════════════════════════╝'));
  console.log('');
};

module.exports = printStartupBanner;
