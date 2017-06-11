import { ParsedArgs } from "minimist";
import * as path from "path";
import * as shelljs from "shelljs";

import * as OptionsParserInterfaces from "./OptionsParser.interfaces";

export abstract class OptionsParser {
    protected static HELP_MESSAGE_PATH: string = path.join(__dirname, "help");
    protected static DEFAULT_OPTIONS = {
        minified: false,
        noConflict: true,
        out: path.join(process.cwd(), "vendor", "ace"),
        repository: "https://github.com/ajaxorg/ace-builds",
        tidy: false,
    };

    protected options: OptionsParserInterfaces.IBuilderOptions = OptionsParser.DEFAULT_OPTIONS;

    public constructor(args: OptionsParserInterfaces.IArgs) {
        this.checkForGit();
    }

    protected exit(code: number = 0, message?: string) {
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

    private help(args: OptionsParserInterfaces.IArgsHelp) {
        if (args && args.help) {
            shelljs.cat(OptionsParser.HELP_MESSAGE_PATH);
            this.exit(0);
        }
    }

    private applyRequiredBooleans({
        minified = this.options.minified,
        noConflict = this.options.noConflict,
        tidy = this.options.tidy,
    } = {}) {
        this.options.minified = minified;
        this.options.noConflict = noConflict;
        this.options.tidy = tidy;
    }
}
