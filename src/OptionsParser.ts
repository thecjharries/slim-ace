import { ParsedArgs } from "minimist";
import * as path from "path";
import * as shelljs from "shelljs";

import * as OptionsParserInterfaces from "./OptionsParser.interfaces";

export abstract class OptionsParser {
    private static HELP_MESSAGE_PATH: string = path.join(__dirname, "help");

    public constructor(args: OptionsParserInterfaces.IArgs) {
        this.checkForGit();
    }

    private checkForGit(): void {
        // Literally pulled from the docs. Also it"s perfect.
        if (!shelljs.which("git")) {
            this.exit(1, "Sorry, this script requires git");
        }
    }

    private help(args: OptionsParserInterfaces.IArgsHelp) {
        if (args.help) {
            shelljs.cat(OptionsParser.HELP_MESSAGE_PATH);
            shelljs.exit(0);
        }
    }

    private exit(code: number = 0, message?: string) {
        if (message) {
            shelljs.echo(message);
        }
        shelljs.exit(code);
    }
}
