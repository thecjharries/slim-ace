import { ParsedArgs } from "minimist";

export interface IArgsIndex {
    [key: string]: any;
}

export interface IArgsOutDirectory extends IArgsIndex {
    o?: string;
    out: string;
}

export interface IArgsRepository extends IArgsIndex {
    r?: string;
    repository: string;
}

export interface IArgsTidy extends IArgsIndex {
    t?: boolean;
    tidy: boolean;
}

export interface IArgsNoConflict extends IArgsIndex {
    n?: boolean;
    "no-conflict": boolean;
}

export interface IArgsMinified extends IArgsIndex {
    m?: boolean;
    minified: boolean;
}

export interface IArgsHelp extends IArgsIndex {
    h?: boolean;
    help: boolean;
}

/* tslint:disable-next-line:max-line-length */
export interface IArgs extends ParsedArgs, IArgsHelp, IArgsOutDirectory, IArgsRepository, IArgsTidy, IArgsNoConflict, IArgsMinified {
    // This is seriously just a container
}

export interface IBuilderConfig {
    mode: string | string[];
}

export interface IBuilderOptions {
    minified: boolean;
    noConflict: boolean;
    repository: string;
    out: string;
    configFile?: IBuilderConfig;
}
