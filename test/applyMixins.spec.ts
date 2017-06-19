// Things like ...be.true; or ...be.rejected; dont play nice with TSLint
/* tslint:disable:no-unused-expression */
// This is testing mixins, so it has declare multiple classes
/* tslint:disable:max-classes-per-file */
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

import applyMixins from "../src/applyMixins";

class AClass {
    public aProperty: string;

    public aMethod(): string {
        return this.aProperty;
    }
}

class BClass {
    public bProperty: string;

    public bMethod(): string {
        return this.bProperty;
    }
}

class CClass {
    public cProperty: string;

    public cMethod(): string {
        return this.cProperty;
    }
}

class MixesEverything implements AClass, BClass, CClass {
    public aProperty: any = "a";
    public bProperty: any = "b";
    public cProperty: any = "c";

    public aMethod: () => any;
    public bMethod: () => any;
    public cMethod: () => any;

    public constructor() {
        // do nothing;
    }
}

applyMixins(MixesEverything, [AClass, BClass, CClass]);

describe("applyMixins", (): any => {
    it("should copy methods and their logic to the new object", (): any => {
        const testMix = new MixesEverything();
        testMix.should.respondTo("aMethod");
        testMix.aMethod().should.equal("a");
        testMix.should.respondTo("bMethod");
        testMix.bMethod().should.equal("b");
        testMix.should.respondTo("cMethod");
        testMix.cMethod().should.equal("c");
    });

    it("should copy properties to the new object", (): any => {

    });
});
