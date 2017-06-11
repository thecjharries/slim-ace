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

import * as shelljs from "shelljs";

import { AceBuilder } from "../src/AceBuilder";

describe("AceBuilder", (): void => {
    // let builder: AceBuilder | null;
    // let checkStub: sinon.SinonStub;

    // describe("creation", (): void => {
    //     describe("checkForGit()", (): void => {
    //         let whichStub: sinon.SinonStub;
    //         let echoStub: sinon.SinonStub;
    //         let exitStub: sinon.SinonStub;

    //         beforeEach((): void => {
    //             whichStub = sinon.stub(shelljs, "which").returns("some/path/to/git");
    //             echoStub = sinon.stub(shelljs, "echo");
    //             exitStub = sinon.stub(shelljs, "exit");
    //             builder = new AceBuilder();
    //         });

    //         it("should do nothing when git is found", () => {
    //             (builder as any).checkForGit();
    //             exitStub.called.should.be.false;
    //         });

    //         it("should kill the process without git", () => {
    //             whichStub.returns(null);
    //             (builder as any).checkForGit();
    //             exitStub.calledWith(1).should.be.true;
    //         });

    //         afterEach((): void => {
    //             whichStub.restore();
    //             echoStub.restore();
    //             exitStub.restore();
    //         });
    //     });
    // });

    // describe("post-creation", (): void => {
    //     beforeEach((): void => {
    //         checkStub = sinon.stub(builder, "checkForGit");
    //         builder = new AceBuilder();
    //     });

    //     afterEach((): void => {
    //         checkStub.restore();
    //     });
    // });

    // afterEach((): void => {
    //     builder = null;
    // });
});
