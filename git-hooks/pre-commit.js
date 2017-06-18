#!/usr/bin/env node

let Bluebird, chalk, fsb, toc, path, shelljs;
try {
    Bluebird = require("bluebird");
    chalk = require("chalk");
    fsb = require("fs");
    toc = require("markdown-toc");
    path = require("path");
    shelljs = require("shelljs");
} catch (error) {
    console.log(chalk.red.bold("You must run 'npm install' before the pre-commit hook will run"));
    process.exit(1);
}

shelljs.echo(chalk.green("\nRunning pre-commit hook..."));
shelljs.set("-e");

Bluebird.promisifyAll(fsb, {suffix: "Bluebird"});

const rootDirectory = path.join(__dirname, "..");
shelljs.cd(rootDirectory);

function checkIfFileIsStaged(filename) {
    try {
        shelljs.exec(`git diff --name-only --cached | grep '${filename}'`, {silent: true});
        return true;
    } catch (error) {
        return false;
    }
}

let exitCode = 0;

function checkAndRebuildReadmeToc() {
    const readmePath = path.join(rootDirectory, "README.md");
    if (!shelljs.test("-f", readmePath)) {
        shelljs.echo(chalk.dim("\tNo README found"));
        return Bluebird.resolve();
    }
    if (!checkIfFileIsStaged("README.md")) {
        shelljs.echo(chalk.dim("\tREADME not staged"));
        return Bluebird.resolve();
    }
    return fsb.readFileBluebird(readmePath, "utf-8")
        .then((contents) => {
            const tocRegExp = /<!-- toc -->\n?([\s\S]*)<!-- tocstop -->/gi;
            const searchContents = tocRegExp.exec(contents);
            if (searchContents && searchContents[1]) {
                const found = searchContents[1];
                const built = `${toc(contents).content}\n`;
                if (found !== built) {
                    shelljs.echo(chalk.dim("\tRebuilding README TOC"));
                    return fsb.writeFileBluebird(
                            readmePath,
                            contents.replace(
                                tocRegExp,
                                `<!-- toc -->\n${built}<!-- tocstop -->`
                            ),
                            "utf-8"
                        );
                }
            }
            shelljs.echo(chalk.dim("\tNo changes to README TOC"));
        })
        .then(() => {
            shelljs.exec(`git add ${readmePath}`);
        });
}

checkAndRebuildReadmeToc()
    .catch((error) => {
        shelljs.echo(chalk.red.bold("Error in pre-commit hook:"));
        shelljs.echo(error.message);
        exitCode = 1;
    })
    .finally(() => {
        const color = exitCode !== 0 ? chalk.red.bold : chalk.green;
        shelljs.echo(color("pre-commit hook finished\n"));
        shelljs.exit(exitCode);
    });
