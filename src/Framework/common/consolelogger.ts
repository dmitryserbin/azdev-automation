import { IConsoleLogger } from "./iconsolelogger";

export class ConsoleLogger implements IConsoleLogger {

    constructor() { /* */ }

    public log(message: any): void {

        console.log(message);

    }

}
