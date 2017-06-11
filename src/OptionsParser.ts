import { ParsedArgs } from "minimist";
import * as path from "path";
import * as shelljs from "shelljs";
(shelljs.config as any).fatal = true;

import * as OptionsParserInterfaces from "./OptionsParser.interfaces";

export abstract class OptionsParser {
    protected static HELP_MESSAGE_PATH: string = path.join(__dirname, "help");
    protected static DEFAULT_OPTIONS = {
        minified: false,
        noConflict: true,
        out: path.join(process.cwd(), "vendor", "ace"),
        repository: "https://github.com/ajaxorg/ace-builds",
        tidy: false,
        workingDirectory: path.join(process.cwd(), ".slim-ace"),
    };

    protected options: OptionsParserInterfaces.IBuilderOptions = OptionsParser.DEFAULT_OPTIONS;

    public constructor(args: OptionsParserInterfaces.IArgs) {
        this.checkForGit();
    }

    protected exit(code: number = 0, message?: string): void {
        if (message && message.length > 0) {
            shelljs.echo(message);
        }
        shelljs.exit(code);
    }

    private checkForGit(): void {
        // Literally pulled from the docs. Also it"s perfect.
        if (!shelljs.which("git")) {
            this.exit(1, "Sorry, this script requires git");
        }
    }

    private help(args: OptionsParserInterfaces.IArgsHelp): void {
        if (args && args.help) {
            shelljs.cat(OptionsParser.HELP_MESSAGE_PATH);
            this.exit(0);
        }
    }

    private applyRequiredBooleans({
        minified = this.options.minified,
        noConflict = this.options.noConflict,
        tidy = this.options.tidy,
    } = {}): void {
        this.options.minified = minified;
        this.options.noConflict = noConflict;
        this.options.tidy = tidy;
    }

    private updateAndCreateWorkingDirectory({
        workingDirectory = this.options.workingDirectory,
    } = {}) {
        this.options.workingDirectory = workingDirectory;
        try {
            shelljs.mkdir("-p", `${this.options.workingDirectory}/source`);
            shelljs.cd(`${this.options.workingDirectory}/source`);
        } catch (error) {
            this.exit(
                1,
                `Unable to create working directory; Please check permissions \
                for ${path.dirname(this.options.workingDirectory)}`,
            );
        }
    }

    // private pullRepository(): void {
    //     try {
    //         if (shelljs.test("-d", ".git")) {
    //             shelljs.exec("git pull");
    //         } else {
    //             shelljs.exec(`git clone ${this.options.repository} .`);
    //         }
    //     } catch (error) {
    //         this.exit(1, "Unable to pull repo; please verify settings");
    //     }
    // }
    // private verifyRepository({ repository = this.options.repository } = {}): boolean {
    //     if (repository === OptionsParser.DEFAULT_OPTIONS.repository) {
    //         return true;
    //     }
    //     return false;
    // }
}
