import { Automation } from "./automation";
import { DebugLogger } from "./common/debuglogger";
import { IAutomation, IEndpoint, IParameters } from "./interfaces/automation";
import { IDebugLogger } from "./interfaces/common/debuglogger";
import { IConsoleParameters } from "./interfaces/readers/parameterreader";
import { ParameterReader } from "./readers/parameterreader";

const debugLogger: IDebugLogger = new DebugLogger("azdev-console");
const parameterReader: ParameterReader = new ParameterReader(debugLogger);

function newEndpoint(account: string, token: string): IEndpoint {

    const debug = debugLogger.create("newEndpoint");

    const endpoint: IEndpoint = {

        account: account,
        token: token,
        url: `https://dev.azure.com/${account}`,

    };

    debug(endpoint);

    return endpoint;

}

function readParameters(): IConsoleParameters {

    const usage: string = `
        Usage:
            $ ./console.js <parameters>

        Options:
            --config, -c [string], path to configuration file
            --policies, -p [string], path to policies directory
            --schemas, -s [string], path to schemas directory
            --account, -a [string], Azure DevOps account name
            --token, -t [string], Azure DevOps account PAT token
            --projectSetup [boolean], control project setup feature
            --accessPermissions [boolean], control access permissions feature
            --serviceConnections [boolean], control service connections feature
            --branchPolicies [boolean], control branch policies feature`;

    const flags: any = {

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

    }

    const parameters: IConsoleParameters = parameterReader.newParameters(usage, flags);

    return parameters;

}

async function run(): Promise<void> {

    const consoleParameters: IConsoleParameters = readParameters();
    const endpoint: IEndpoint = newEndpoint(consoleParameters.account, consoleParameters.token);

    const parameters: IParameters = {

        config: consoleParameters.config,
        policies: consoleParameters.policies,
        schemas: consoleParameters.schemas,
        projectSetup: consoleParameters.projectSetup,
        accessPermissions: consoleParameters.accessPermissions,
        branchPolicies: consoleParameters.branchPolicies,
        serviceConnections: consoleParameters.serviceConnections,

    };

    const automation: IAutomation = new Automation(endpoint, parameters);

    await automation.run();

}

run();
