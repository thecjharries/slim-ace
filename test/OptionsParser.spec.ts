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
    const emptyArgs: ParsedArgs = { _: [] };

    describe("creation", (): void => {
        describe("checkForGit()", (): void => {
            let whichStub: sinon.SinonStub;
            let echoStub: sinon.SinonStub;
            let exitStub: sinon.SinonStub;

            beforeEach((): void => {
                whichStub = sinon.stub(shelljs, "which").returns("some/path/to/git");
                echoStub = sinon.stub(shelljs, "echo");
                exitStub = sinon.stub(shelljs, "exit");
                parser = new OptionsParser(emptyArgs);
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
                echoStub.restore();
                exitStub.restore();
            });
        });
    });

    describe("post-creation", (): void => {
        beforeEach((): void => {
            checkStub = sinon.stub(parser, "checkForGit");
            parser = new OptionsParser(emptyArgs);
        });

        afterEach((): void => {
            checkStub.restore();
        });
    });

    afterEach((): void => {
        parser = null;
    });
});
