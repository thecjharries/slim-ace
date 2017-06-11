import { ParsedArgs } from "minimist";
import * as shelljs from "shelljs";


export abstract class OptionsParser {
    public constructor(args: ParsedArgs) {
        this.checkForGit();
    }

    private checkForGit(): void {
        // Literally pulled from the docs. Also it"s perfect.
        if (!shelljs.which("git")) {
            this.exit(1, "Sorry, this script requires git");
        }
    }

    private exit(code: number = 0, message?: string) {
        if (message) {
            shelljs.echo(message);
        }
        shelljs.exit(code);
    }
}
