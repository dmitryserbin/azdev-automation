import { IConsoleLogger } from "../interfaces/consolelogger";

export class ConsoleLogger implements IConsoleLogger {

    constructor() { /* */ }

    public log(message: any): void {

        console.log(message);

    }

}
