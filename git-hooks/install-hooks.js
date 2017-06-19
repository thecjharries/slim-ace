const chalk = require("chalk");
const path = require("path");
const readline = require('readline');
const shelljs = require("shelljs");
const winston = require("winston");

// Build variables for winston usage
// TODO: modularize this

// Determine the script's name
const scriptName = path.basename(__filename).replace(/\.\w+$/, "");
// const scriptName = __filename.replace(/^.*[\/\\]([^\/\\]+)\.\w+$/, "$1");
// Create logs dir if DNE
shelljs.mkdir("-p", "./logs");
// Build logger with transports
const logger = new winston.Logger({
    level: "info",
    transports: [
          new (winston.transports.Console)({
              colorize: true,
              formatter: consoleFormatter,
              level: "silly",
              timestamp: true
          })
        , new (winston.transports.File)({
            filename: path.join("logs", scriptName + ".log")
          })
    ]
});
// Assign color values
const colorLevels = [
    chalk.bold.red,
    chalk.yellow.bold,
    chalk.green,
    chalk.cyan,
    chalk.dim,
    chalk.magenta
];
// Add named level aliases
colorLevels.error = colorLevels[0];
colorLevels.warn = colorLevels[1];
colorLevels.info = colorLevels[2];
colorLevels.verbose = colorLevels[3];
colorLevels.debug = colorLevels[4];
colorLevels.silly = colorLevels[5];

// Wrap `toISOString` in case I decide to change it
function timestamp() {
    return (new Date).toISOString();
}

// Determine color for `level` or return no color for unknowns
function colorize(level) {
    const parsedLevel = level.toLowerCase();
    if (colorLevels[parsedLevel]) {
        return colorLevels[parsedLevel];
    }
    return String;
}

// Log colorized script name
function specifyLogScript(options) {
    return (options.colorize ? colorize(options.level) : String)(`[${scriptName}]`);
}

// Format the console transport
// Example (pretend `install-hooks` is colored):
// `[2017-06-19T03:41:10.732Z][install-hooks] Nothing entered`
function consoleFormatter(options) {
    return `[${timestamp()}]${specifyLogScript(options)} ${options.message}`;
}

// Run installation
shelljs.echo(chalk.bold.red("\nWARNING: THESE HOOKS HAVE NOT BEEN RIGOROUSLY TESTED. USE AT YOUR OWN RISK."));

// Get all hooks
const hookFiles = shelljs.ls(__dirname);

// Built prompt
// Literally taken from `readline` docs
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Make sure user wants to make bad decisions
rl.question(`Type ${chalk.black.bgGreen("SOFT")} (ln -s) for careful linking or ${chalk.black.bgRed("FORCE")} (ln -sf) for brutal linking:\n`, (answer) => {
    // Force an empty line after input
    // TODO: figure out if there's an option for this
    shelljs.echo();
    if (/SOFT|FORCE/.test(answer)) {
        if (installHooks(answer === "FORCE")) {
            log("All hooks installed");
        } else {
            log("At least one hook failed to install; check the above output for details", true);
        }
    } else {
        if (answer === "") {
            log("Nothing entered", true);
        } else {
            log(`/SOFT|FORCE/.test("${answer}") === false`, true);
        }
        log("Skipping hook installation for now", true)
    }
    rl.close();
});

// Wrap `winston.log` because it used to be something else
// Also because I haven't completely decided yet
function log(message, isCaution) {
    logger.log(isCaution ? "warn" : "info", message);
}

function installHooks(force) {
    let everythingInstalled = true;
    for (const filename of hookFiles) {
        // Have to use a conditional instead of negative globbing
        // (i.e. path.join(__dirname, "!(install*).js")) because shelljs (or maybe
        // their glob module) doesn't like negating Windows paths
        // ---
        // Used a conditional instead of filter because there's no point in walking
        // the array twice
        if (filename.search(/install/gi) > -1) {
            continue;
        }

        const hook = filename.replace(/\.[a-z]*$/, '');
        log(`Linking ${hook}`);
        try {
            shelljs.ln(`-s${force ? "f" : ""}`, path.join(__dirname, filename), path.join(__dirname, "..", ".git", "hooks", hook))
            log(`Installed ${hook}${force ? " forcibly" : ""}`);
        } catch(error) {
            everythingInstalled = false;
            log(`Unable to link ${hook}; ${error.message}`, true);
        }
    }
    return everythingInstalled;
}
