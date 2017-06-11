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

export interface IArgsRequiredBooleans extends IArgsIndex {
    m?: boolean;
    minified: boolean;
    n?: boolean;
    "no-conflict"?: boolean;
    noConflict: boolean;
    t?: boolean;
    tidy: boolean;
}

export interface IArgsHelp extends IArgsIndex {
    h?: boolean;
    help: boolean;
}

/* tslint:disable-next-line:max-line-length */
export interface IArgs extends ParsedArgs, IArgsHelp, IArgsOutDirectory, IArgsRepository, IArgsRequiredBooleans {
    // This is seriously just a container
}

export interface IBuilderConfig {
    mode: string | string[];
}

export interface IBuilderOptions {
    configFile?: IBuilderConfig;
    minified: boolean;
    noConflict: boolean;
    out: string;
    repository: string;
    tidy: boolean;
    workingDirectory: string;
}
