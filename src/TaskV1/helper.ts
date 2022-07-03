import path from "path";
import url from "url";

import { getBoolInput, getEndpointAuthorizationParameter, getEndpointUrl, getInput } from "azure-pipelines-task-lib";

import { IEndpoint, IParameters } from "azdev-automation/iautomation";

export async function getEndpoint(): Promise<IEndpoint> {

    const endpointName: any = getInput("endpointName", true);
    const endpointUrl: any = getEndpointUrl(endpointName, true);
    const accountName: any = url.parse(endpointUrl).pathname!.replace("/", "");
    const accountToken: any = getEndpointAuthorizationParameter(endpointName, "ApiToken", false);

    const endpoint: IEndpoint = {

        url: endpointUrl,
        account: accountName,
        token: accountToken,

    };

    return endpoint;

}

export async function getParameters(): Promise<IParameters> {

    const configPath: any = getInput("configPath", true);
    const policiesPath: any = getInput("policiesPath", true);
    const schemasPath: string = path.join(__dirname, "node_modules", "azdev-automation", "schemas");

    const projectSetup: boolean = getBoolInput("projectSetup");
    const accessPermissions: boolean = getBoolInput("accessPermissions");

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
