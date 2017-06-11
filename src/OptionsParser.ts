import { ParsedArgs } from "minimist";
import * as shelljs from "shelljs";

export class OptionsParser {
    public constructor(args: ParsedArgs) {
        this.checkForGit();
    }

    private checkForGit(): void {
        // Literally pulled from the docs. Also it"s perfect.
        if (!shelljs.which("git")) {
            shelljs.echo("Sorry, this script requires git");
            shelljs.exit(1);
        }
    }
}
