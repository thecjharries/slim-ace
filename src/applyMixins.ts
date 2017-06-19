/**
 * Mixin applicator taken from the official docs with some new features and
 * tweaked to pass the local `tslint`.
 *
 * @param {any}   derivedCtor
 * Class to add things to
 * @param {any[]} baseCtors
 * Classes to add things from
 * @see [Official docs](https://www.typescriptlang.org/docs/handbook/mixins.html)
 * @todo modularize this
 * @todo instaniate new `baseCtor` to copy properties as well as methods
 */
export default function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach((baseCtor: any) => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach((name: string) => {
            if (name !== "constructor") {
                derivedCtor.prototype[name] = baseCtor.prototype[name];
            }
        });
    });
}
