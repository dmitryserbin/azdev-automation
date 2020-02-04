export interface IParameterReader {

    readParameters(): { [name: string]: any };
    readConsoleParameters(): { [name: string]: any };

}

export interface IConsoleParameters {

    [name: string]: any;

}
