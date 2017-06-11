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
import * as path from "path";
import * as shelljs from "shelljs";

import { OptionsParser } from "../src/OptionsParser";

describe("OptionsParser", () => {
    let parser: OptionsParser | null;
    let cdStub: sinon.SinonStub;
    let checkStub: sinon.SinonStub;
    let echoStub: sinon.SinonStub;
    let execStub: sinon.SinonStub;
    let exitStub: sinon.SinonStub;
    let testStub: sinon.SinonStub;
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
        });

        describe("help()", () => {
            let catStub: sinon.SinonStub;
            beforeEach((): void => {
                parser = new (OptionsParser as any)(emptyArgs);
                catStub = sinon.stub(shelljs, "cat");
                exitStub = sinon.stub(parser, "exit");
            });

            it("should only print when specified", (): any => {
                (parser as any).help();
                catStub.called.should.be.false;
                (parser as any).help({ help: true });
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
                parser = null;
            });
        });

        describe("applyRequiredBooleans()", (): void => {
            beforeEach((): void => {
                parser = new (OptionsParser as any)(emptyArgs);
            });

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

            afterEach((): void => {
                parser = null;
            });
        });

        describe("updateAndCreateWorkingDirectory()", (): void => {
            let mkdirStub: sinon.SinonStub;

            beforeEach((): void => {
                parser = new (OptionsParser as any)(emptyArgs);
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
                exitStub.restore();
                parser = null;
            });
        });

        describe("pullRepository()", (): void => {
            let rmStub: sinon.SinonStub;

            beforeEach((): void => {
                parser = new (OptionsParser as any)(emptyArgs);
                cdStub = sinon.stub(shelljs, "cd");
                rmStub = sinon.stub(shelljs, "rm");
                testStub = sinon.stub(shelljs, "test");
                execStub = sinon.stub(shelljs, "exec");
                exitStub = sinon.stub(parser, "exit");
            });

            it("should wipe the existing repo or die when asked", (): any => {
                (parser as any).pullRepository(true);
                rmStub.called.should.be.true;
                rmStub.throws();
                (parser as any).pullRepository(true);
                exitStub.calledWith(1).should.be.true;
            });

            it("should pull existing repos", (): any => {
                testStub.returns(true);
                (parser as any).pullRepository();
                execStub.calledWith("git pull").should.be.true;
            });

            it("should clone if nothing is found", (): any => {
                const repo = (parser as any).options.repository;
                testStub.returns(false);
                (parser as any).pullRepository();
                execStub.calledWith(`git clone ${repo} .`).should.be.true;
            });

            it("should exit if git fails", (): any => {
                execStub.throws();
                (parser as any).pullRepository();
                exitStub.calledWith(1).should.be.true;
            });

            afterEach((): void => {
                cdStub.restore();
                rmStub.restore();
                testStub.restore();
                execStub.restore();
                exitStub.restore();
                parser = null;
            });
        });

        describe("getAceRootDirectory()", (): void => {
            beforeEach((): void => {
                parser = new (OptionsParser as any)();
            });

            it("should properly create the source ace permutation", (): any => {
                for (const minified of [true, false]) {
                    for (const noConflict of [true, false]) {
                        const tail = "src"
                            + (minified ? "-min" : "")
                            + (noConflict ? "-noconflict" : "");
                        (parser as any).options.minified = minified;
                        (parser as any).options.noConflict = noConflict;
                        (parser as any).getAceRootDirectory(true)
                            .should.equal(path.join(
                                (parser as any).options.workingDirectory,
                                "source",
                                tail,
                            ));
                    }
                }
            });

            it("should properly pass through the out string", (): any => {
                (parser as any).getAceRootDirectory()
                    .should.equal((OptionsParser as any).DEFAULT_OPTIONS.out);
            });

            afterEach((): void => {
                parser = null;
            });
        });

        // describe("verifyRepository()", (): void => {
        //     let pullStub: sinon.SinonStub;

        //     beforeEach((): void => {
        //         parser = new (OptionsParser as any)(emptyArgs);
        //         pullStub = sinon.stub(parser, "pullRepository");
        //         cdStub = sinon.stub(shelljs, "cd");
        //         testStub = sinon.stub(shelljs, "test");
        //         exitStub = sinon.stub(parser, "exit");
        //     });

        //     it("apply default options and pull without a wipe", (): any => {
        //         (parser as any).updateAndVerifyRepository();
        //         (parser as any).options.workingDirectory
        //             .should.equal((OptionsParser as any).DEFAULT_OPTIONS.workingDirectory);
        //         pullStub.calledWith(false).should.be.true;
        //     });

        //     it("apply changed options and pull with a wipe", (): any => {
        //         const repository = "qqq";
        //         (parser as any).updateAndVerifyRepository({ repository });
        //         (parser as any).options.repository.should.equal(repository);
        //         pullStub.calledWith(true).should.be.true;
        //     });
        //     // TODO: move this to an ace string method
        //     it("should properly create the ace string", (): any => {
        //         // This is the default location using the default config
        //         const ace = `src-noconflict/ace.js`;
        //         console.log(ace);
        //         (parser as any).updateAndVerifyRepository();
        //         testStub.calledWith(ace).should.be.true;
        //     });

        //     it("should die without Ace", (): any => {
        //         testStub.returns(false);
        //         (parser as any).updateAndVerifyRepository();
        //         exitStub.calledWith(1).should.be.true;
        //     });

        //     afterEach((): void => {
        //         cdStub.restore();
        //         testStub.restore();
        //         execStub.restore();
        //         exitStub.restore();
        //         parser = null;
        //     });
        // });

        describe("exit", (): void => {
            beforeEach((): void => {
                parser = new (OptionsParser as any)(emptyArgs);
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
                parser = null;
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
