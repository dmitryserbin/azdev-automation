export interface IParameterReader {

    readParameters(): { [name: string]: any };

}

export interface IConsoleParameters {

    [name: string]: any;

}
