#!/usr/bin/env node

// TODO: pull this out into its own module

let Bluebird, chalk, fsb, toc, path, shelljs;
try {
    Bluebird = require("bluebird");
    chalk = require("chalk");
    fsb = require("fs");
    toc = require("markdown-toc");
    path = require("path");
    shelljs = require("shelljs");
    log("Starting");
} catch (error) {
    console.error(`[${timestamp()}][pre-commit hook]: You must run 'npm install' before the pre-commit hook will run`);
    process.exit(1);
}

shelljs.set("-e");
Bluebird.promisifyAll(fsb, { suffix: "Bluebird" });

const tocRegExp = /<!-- toc -->\n?([\s\S]*)<!-- tocstop -->/gi;

const rootDirectory = path.join(__dirname, "..");
shelljs.cd(rootDirectory);

let exitCode = 0;

checkAndRebuildReadmeToc()
    .catch((error) => {
        log(error.message, true);
        exitCode = 1;
    })
    .finally(() => {
        log("Finished\n", exitCode);
        shelljs.exit(exitCode);
    });

function timestamp() {
    return (new Date()).toTimeString().substring(0, 8);
}

function log(message, isError) {
    const color = isError ? chalk.red.bold : chalk.green;
    shelljs.echo(
        chalk.white(`[${timestamp()}]`) + (isError ? chalk.red.bold : chalk.green)("[pre-commit] ") + message
    );
}

function checkIfFileIsStaged(filename) {
    return new Bluebird((resolve, reject) => {
        try {
            shelljs.exec(`git diff --name-only --cached | grep '${filename}'`, { silent: true });
            return resolve();
        } catch (error) {
            return reject(chalk.dim(`${filename} not staged; skipping`));
        }
    });
}

function checkIfFileExists(filepath, shortName) {
    return new Bluebird((resolve, reject) => {
        if (shelljs.test("-f", filepath)) {
            return resolve();
        }
        return reject(chalk.dim(`${shortName ? shortName : path} not found; skipping`));
    });
}

function loadFile(filepath, shortName) {
    return checkIfFileExists(filepath, shortName)
        .then(() => {
            return checkIfFileIsStaged(shortName);
        })
        .then(() => {
            return fsb.readFileBluebird(filepath, "utf-8")
                .catch((error) => {
                    // The file exists but cannot be opened
                    error.isError = true;
                    return Bluebird.reject(error);
                });
        });
}

function writeFile(filepath, contents, shortName) {
    log(chalk.dim(`Rebuilding ${shortName ? shortName : filepath}`));
    return fsb.writeFileBluebird(filepath, contents, "utf-8")
        .catch((error) => {
            error.isError = true;
            return Bluebird.reject(error);
        })
}

function stageFile(filepath, shortName) {
    return new Bluebird((resolve, reject) => {
        try {
            log(chalk.dim(`Restaging ${shortName ? shortName : filepath}`));
            shelljs.exec(`git add ${filepath}`);
            return resolve();
        } catch (error) {
            error.isError = true;
            return reject(error);
        };
    });
}

function findToc(contents) {
    return new Bluebird((resolve, reject) => {
        const searchContents = tocRegExp.exec(contents);
        if (searchContents) {
            return resolve([searchContents[1], `${toc(contents).content}\n`]);
        } else {
            return reject(chalk.dim("README TOC comments not found; skipping"));
        }
    });
}

function rejectUnchangedTocs([found, built]) {
    return new Bluebird((resolve, reject) => {
        if (found === built) {
            return reject(chalk.dim("No README TOC changes"));
        }
        return resolve();
    });
}

function parseReadmeToc(contents) {
    return findToc(contents)
        .then(rejectUnchangedTocs)
        .then(() => {
            return contents.replace(tocRegExp, `<!-- toc -->\n${built}<!-- tocstop -->`);
        });
}

function checkAndRebuildReadmeToc() {
    const readmePath = path.join(rootDirectory, "README.md");
    let isError = false;
    let readmeContents;
    return loadFile(readmePath, "README")
        .then(parseReadmeToc)
        .then((contents) => {
            return writeFile(readmePath, contents);
        })
        .then(() => {
            return stageFile(readmePath, "README");
        })
        .catch((error) => {
            if (error.isError) {
                return Bluebird.reject(error);
            }
            log(error);
        });
}
