import Debug from "debug";
import meow from "meow";

import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IConsoleParameters, IParameterReader } from "../interfaces/readers/parameterreader";

export class ParameterReader implements IParameterReader {

    private debugLogger: Debug.Debugger;

    constructor(debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

    }

    public readParameters(): IConsoleParameters {

        const debug = this.debugLogger.extend(this.readParameters.name);

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

}
