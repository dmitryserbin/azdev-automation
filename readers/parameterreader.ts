import Debug from "debug";
import meow from "meow";

import { IDebugLogger } from "../interfaces/debuglogger";
import { IConsoleParameters, IParameterReader } from "../interfaces/parameterreader";

export class ParameterReader implements IParameterReader {

    private debugLogger: Debug.Debugger;

    constructor(debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

    }

    public readParameters(): IConsoleParameters {

        const debug = this.debugLogger.extend("readParameters");

        const usage: string = `
            Usage
                $ ./automation.js <parameters>

            Options
                --config, -c [string], path to configuration file
                --policies, -p [string], path to policies directory
                --schemas, -s [string], path to schemas directory
                --account, -a [string], Azure DevOps account name
                --token, -t [string], Azure DevOps account PAT token
                --projectSetup [boolean], control project setup feature
                --accessPermissions [boolean], control access permissions feature
                --serviceConnections [boolean], control service connections feature
                --branchPolicies [boolean], control branch policies feature`;

        const options: meow.Options = {

            flags: {

                config: {

                    type: "string",
                    alias: "c",

                },
                policies: {

                    type: "string",
                    alias: "p",
                    default: "policies",

                },
                schemas: {

                    type: "string",
                    alias: "s",
                    default: "schemas",

                },
                account: {

                    type: "string",
                    alias: "a",

                },
                token: {

                    type: "string",
                    alias: "t",

                },
                projectSetup: {

                    type: "boolean",
                    default: false,

                },
                accessPermissions: {

                    type: "boolean",
                    default: false,

                },
                serviceConnections: {

                    type: "boolean",
                    default: false,

                },
                branchPolicies: {

                    type: "boolean",
                    default: false,

                },

            },

        }

        const parameters: meow.Result = meow(usage, options);

        debug(parameters.flags);

        return parameters.flags;

    }

    public readConsoleParameters(): IConsoleParameters {

        const debug = this.debugLogger.extend("readConsoleParameters");

        const usage: string = `
            Usage
                $ ./console.js <parameters>

            Options
                --config, -c [string], path to configuration file
                --account, -a [string], Azure DevOps account name
                --token, -t [string], Azure DevOps account PAT token
                --project, -p [string], target project name filter
                --feature, -f [string], feature name to execute
                --mock, -m [boolean], enable mock`;

        const options: meow.Options = {

            flags: {

                config: {

                    type: "string",
                    alias: "c",

                },
                account: {

                    type: "string",
                    alias: "a",

                },
                token: {

                    type: "string",
                    alias: "t",

                },
                project: {

                    type: "string",
                    alias: "p",

                },
                feature: {

                    type: "string",
                    alias: "f",

                },
                mock: {

                    type: "boolean",
                    alias: "m",

                },

            },

        };

        const parameters: meow.Result = meow(usage, options);

        debug(parameters.flags);

        return parameters.flags;

    }

}
