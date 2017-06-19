const chalk = require("chalk");
const path = require("path");
const readline = require('readline');
const shelljs = require("shelljs");
shelljs.set("-e");

shelljs.echo(chalk.bold.red("\nWARNING: THESE HOOKS HAVE NOT BEEN RIGOROUSLY TESTED. USE AT YOUR OWN RISK."));

const hookFiles = shelljs.ls(__dirname);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question(`Type ${chalk.black.bgGreen("SOFT")} (ln -s) for careful linking or ${chalk.black.bgRed("FORCE")} (ln -sf) for brutal linking:\n`, (answer) => {
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

function timestamp() {
    return (new Date()).toTimeString().substring(0, 8);
}

function log(message, isCaution) {
    shelljs.echo(
        chalk.white(`[${timestamp()}]`) + (isCaution ? chalk.yellow.bold : chalk.green)("[install-hooks] ") + message
    );
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
