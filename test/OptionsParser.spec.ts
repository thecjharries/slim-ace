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
