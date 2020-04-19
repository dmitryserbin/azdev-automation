export interface IParameterReader {

    newParameters(usage: string, flags: any): IConsoleParameters;

}

export interface IConsoleParameters {

    [name: string]: any;

}
