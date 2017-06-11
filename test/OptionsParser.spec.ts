// Things like ...be.true; or ...be.rejected; dont play nice with TSLint
/* tslint:disable:no-unused-expression */
import * as chai from "chai";
// Needed for describe, it, etc.
import { } from "mocha";
import * as sinon from "sinon";

const expect = chai.expect;
const should = chai.should();
/* tslint:disable-next-line:no-var-requires */
chai.use(require("chai-as-promised"));

import { ParsedArgs } from "minimist";
import * as shelljs from "shelljs";

import { OptionsParser } from "../src/OptionsParser";

describe("OptionsParser", () => {
    let parser: OptionsParser | null;
    let checkStub: sinon.SinonStub;
    let echoStub: sinon.SinonStub;
    let exitStub: sinon.SinonStub;
    const emptyArgs: ParsedArgs = { _: [] };
    const invalidExitCode: number = 1;
    const message = "message";
    const validExitCode: number = 0;

    describe("constructor calls", (): void => {
        describe("checkForGit()", (): void => {
            let whichStub: sinon.SinonStub;

            beforeEach((): void => {
                whichStub = sinon.stub(shelljs, "which").returns("some/path/to/git");
                exitStub = sinon.stub((OptionsParser as any).prototype, "exit");
                parser = new (OptionsParser as any)(emptyArgs);
            });

            it("should do nothing when git is found", () => {
                (parser as any).checkForGit();
                exitStub.called.should.be.false;
            });

            it("should kill the process without git", () => {
                whichStub.returns(null);
                (parser as any).checkForGit();
                exitStub.calledWith(1).should.be.true;
            });

            afterEach((): void => {
                whichStub.restore();
                exitStub.restore();
            });
        });
    });

    describe("helpers", (): void => {
        beforeEach((): void => {
            checkStub = sinon.stub((OptionsParser as any).prototype, "checkForGit");
            parser = new (OptionsParser as any)(emptyArgs);
        });

        describe("help()", () => {
            let catStub: sinon.SinonStub;
            beforeEach((): void => {
                catStub = sinon.stub(shelljs, "cat");
                exitStub = sinon.stub(parser, "exit");
            });

            it("should only print when specified", (): any => {
                (parser as any).help();
                catStub.called.should.be.false;
                (parser as any).help({help: true});
                catStub.called.should.be.true;
            });

            it("should cat the proper message and exit", (): any => {
                (parser as any).help({ help: true });
                catStub.calledWith((OptionsParser as any).HELP_MESSAGE_PATH).should.be.true;
                exitStub.called.should.be.true;
            });

            afterEach((): void => {
                catStub.restore();
                exitStub.restore();
            });
        });

        describe("applyRequiredBooleans()", (): void => {
            it("should use the instance's values as default", (): any => {
                const defaults = (OptionsParser as any).DEFAULT_OPTIONS;
                (parser as any).applyRequiredBooleans();
                const options = (parser as any).options;
                options.minified.should.equal(defaults.minified);
                options.noConflict.should.equal(defaults.noConflict);
                options.tidy.should.equal(defaults.tidy);
            });

            it("should apply the correct options", (): any => {
                const minified = Math.floor(Math.random() * 2) === 1;
                const noConflict = Math.floor(Math.random() * 2) === 1;
                const tidy = Math.floor(Math.random() * 2) === 1;
                (parser as any).applyRequiredBooleans({ minified, noConflict, tidy });
                const options = (parser as any).options;
                options.minified.should.equal(minified);
                options.noConflict.should.equal(noConflict);
                options.tidy.should.equal(tidy);
            });
        });

        describe("updateAndCreateWorkingDirectory()", (): void => {
            let mkdirStub: sinon.SinonStub;
            let cdStub: sinon.SinonStub;

            beforeEach((): void => {
                mkdirStub = sinon.stub(shelljs, "mkdir");
                cdStub = sinon.stub(shelljs, "cd");
                exitStub = sinon.stub(parser, "exit");
            });

            it("should apply default arguments", (): any => {
                (parser as any).updateAndCreateWorkingDirectory();
                (parser as any).options.workingDirectory
                    .should.equal((OptionsParser as any).DEFAULT_OPTIONS.workingDirectory);
            });

            it("should exit if permissions are bad", (): any => {
                mkdirStub.throws();
                (parser as any).updateAndCreateWorkingDirectory();
                exitStub.calledWith(1).should.be.true;
            });

            afterEach((): void => {
                mkdirStub.restore();
                cdStub.restore();
            });
        });

        // describe("pullRepository()", (): void => {
        //     let mkdirStub: sinon.SinonStub;
        //     beforeEach(mkdirStub)
        //     it("should make directories as needed", (): any => {
        //         // (shelljs.config as any).verbose = true;
        //         (parser as any).pullRepository();
        //     });

        // });

        describe("exit", (): void => {
            beforeEach((): void => {
                echoStub = sinon.stub(shelljs, "echo");
                exitStub = sinon.stub(shelljs, "exit");
            });

            it("should print a message only when provided", (): any => {
                (parser as any).exit(validExitCode);
                echoStub.called.should.be.false;
                (parser as any).exit(validExitCode, message);
                echoStub.calledWith(message).should.be.true;
            });

            it("should pass exit codes through", (): any => {
                for (const code of [validExitCode, invalidExitCode]) {
                    (parser as any).exit(code);
                    exitStub.calledWith(code).should.be.true;
                }
            });

            it("should exit normally without input", (): any => {
                (parser as any).exit();
                exitStub.calledWith(validExitCode).should.be.true;
            });

            afterEach((): void => {
                echoStub.restore();
                exitStub.restore();
            });
        });

        afterEach((): void => {
            checkStub.restore();
        });
    });

    afterEach((): void => {
        parser = null;
    });
});
