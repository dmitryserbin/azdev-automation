export interface IAutomation {

    run(): Promise<void>;

}

export interface IEndpoint {

    url: string;
    account: string;
    token: string;

}

export interface IParameters {

    config: string;
    policies: string;
    schemas: string;
    projectSetup: boolean;
    accessPermissions: boolean;
    branchPolicies: boolean;
    serviceConnections: boolean;

}
