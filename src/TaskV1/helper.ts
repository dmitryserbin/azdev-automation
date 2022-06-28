import path from "path";
import url from "url";

import tl = require("azure-pipelines-task-lib");

import { IEndpoint, IParameters } from "azdev-automation/interfaces/automation";

export async function getEndpoint(): Promise<IEndpoint> {

    const endpointName: any = tl.getInput("endpointName", true);
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

    const configPath: any = tl.getInput("configPath", true);
    const policiesPath: any = tl.getInput("policiesPath", true);
    const schemasPath: string = path.join(__dirname, "node_modules", "azdev-automation", "schemas");

    const projectSetup: boolean = tl.getBoolInput("projectSetup");
    const accessPermissions: boolean = tl.getBoolInput("accessPermissions");

    const parameters: IParameters = {

        config: configPath,
        policies: policiesPath,
        schemas: schemasPath,
        projectSetup,
        accessPermissions,
        branchPolicies: false,
        serviceConnections: false,

    };

    return parameters;

}
