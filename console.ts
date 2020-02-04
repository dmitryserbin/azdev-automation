import { Automation } from "./automation";
import { DebugLogger } from "./common/debuglogger";
import { IAutomation, IEndpoint, IParameters } from "./interfaces/automation";
import { IDebugLogger } from "./interfaces/common/debuglogger";
import { IConsoleParameters } from "./interfaces/readers/parameterreader";
import { ParameterReader } from "./readers/parameterreader";

async function run(): Promise<void> {

    const debugLogger: IDebugLogger = new DebugLogger("azdev-console");
    const parameterReader: ParameterReader = new ParameterReader(debugLogger);
    const consoleParameters: IConsoleParameters = parameterReader.readParameters();

    // Get endpoint
    const endpoint: IEndpoint = {

        account: consoleParameters.account,
        token: consoleParameters.token,
        url: `https://dev.azure.com/${consoleParameters.account}`,

    };

    // Get parameters
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
