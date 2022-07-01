import Debug from "debug";

import * as az from "azure-devops-node-api";
import * as ba from "azure-devops-node-api/BuildApi";
import * as ca from "azure-devops-node-api/CoreApi";
import * as ga from "azure-devops-node-api/GitApi";
import * as ra from "azure-devops-node-api/ReleaseApi";
import * as sa from "azure-devops-node-api/SecurityRolesApi";
import * as ta from "azure-devops-node-api/TaskAgentApi";
import * as vc from "azure-devops-node-api/VsoClient";

import * as vi from "azure-devops-node-api/interfaces/common/VsoBaseInterfaces";

import { IApiFactory } from "./iapifactory";
import { IDebugLogger } from "../common/idebuglogger";

export class ApiFactory implements IApiFactory {

    private webApi: az.WebApi;
    private debugLogger: Debug.Debugger;

    constructor(accountName: string, token: string, debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

        const auth = az.getPersonalAccessTokenHandler(token);

        // Use integrated retry mechanism to address
        // Intermittent Azure DevOps connectivity errors
        const options = {

            allowRetries: true,
            maxRetries: 100,
            socketTimeout: 30000,

        } as vi.IRequestOptions;

        this.webApi = new az.WebApi(`https://dev.azure.com/${accountName}`, auth, options);

    }

    public async createCoreApi(): Promise<ca.CoreApi> {

        const debug = this.debugLogger.extend(this.createCoreApi.name);

        const coreApi: ca.CoreApi = await this.webApi.getCoreApi();

        debug("Azure DevOps Core API initialized");

        return coreApi;

    }

    public async createReleaseApi(): Promise<ra.ReleaseApi> {

        const debug = this.debugLogger.extend(this.createReleaseApi.name);

        const releaseApi: ra.ReleaseApi = await this.webApi.getReleaseApi();

        debug("Azure DevOps Release API initialized");

        return releaseApi;

    }

    public async createBuildApi(): Promise<ba.BuildApi> {

        const debug = this.debugLogger.extend(this.createBuildApi.name);

        const buildApi: ba.BuildApi = await this.webApi.getBuildApi();

        debug("Azure DevOps Build API initialized");

        return buildApi;

    }

    public async createGitApi(): Promise<ga.GitApi> {

        const debug = this.debugLogger.extend(this.createGitApi.name);

        const getApi: ga.GitApi = await this.webApi.getGitApi();

        debug("Azure DevOps Git API initialized");

        return getApi;

    }

    public async createTaskAgentApi(): Promise<ta.ITaskAgentApi> {

        const debug = this.debugLogger.extend(this.createTaskAgentApi.name);

        const taskAgentApi: ta.ITaskAgentApi = await this.webApi.getTaskAgentApi();

        debug("Azure DevOps Task Agent API initialized");

        return taskAgentApi;

    }

    public async createSecurityRolesApi(): Promise<sa.ISecurityRolesApi> {

        const debug = this.debugLogger.extend(this.createSecurityRolesApi.name);

        const securityRolesApi: sa.ISecurityRolesApi = await this.webApi.getSecurityRolesApi();

        debug("Azure DevOps Security Roles API initialized");

        return securityRolesApi;

    }

    public async createVsoClient(): Promise<vc.VsoClient> {

        const debug = this.debugLogger.extend(this.createVsoClient.name);

        debug("Azure DevOps API client initialized");
        debug(this.webApi.options);

        return this.webApi.vsoClient;

    }

}
