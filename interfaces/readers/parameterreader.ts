export interface IParameterReader {

    newParameters(usage: string, flags: any): IConsoleParameters;
    readParameters(): IConsoleParameters;

}

export interface IConsoleParameters {

    [name: string]: any;

}
