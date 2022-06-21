import path from "path";
import url from "url";

import tl = require("azure-pipelines-task-lib");

import { IEndpoint, IParameters } from "azdev-automation/interfaces/automation";

export async function getEndpoint(): Promise<IEndpoint> {

    const endpointName: any = tl.getInput("ConnectedService", true);
    const endpointUrl: any = tl.getEndpointUrl(endpointName, true);
    const accountName: any = url.parse(endpointUrl).pathname!.replace("/", "");
    const accountToken: any = tl.getEndpointAuthorizationParameter(endpointName, "ApiToken", false);

    const endpoint: IEndpoint = {

        url: endpointUrl,
        account: accountName,
        token: accountToken,

    };

    return endpoint;

}

export async function getParameters(): Promise<IParameters> {

    const configPath: any = tl.getInput("Config", true);
    const policiesPath: any = tl.getInput("Policies", true);
    const schemasPath: string = path.join(__dirname, "node_modules\\azdev-automation\\schemas");

    const projectSetup: boolean = tl.getBoolInput("ProjectSetup");
    const accessPermissions: boolean = tl.getBoolInput("AccessPermissions");
    const branchPolicies: boolean = tl.getBoolInput("BranchPolicies");
    const serviceConnections: boolean = tl.getBoolInput("ServiceConnections");

    const parameters: IParameters = {

        config: configPath,
        policies: policiesPath,
        schemas: schemasPath,
        projectSetup,
        accessPermissions,
        branchPolicies,
        serviceConnections,

    };

    return parameters;

}
