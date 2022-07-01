import { WebApi, getPersonalAccessTokenHandler } from "azure-devops-node-api";
import { IRequestOptions } from "azure-devops-node-api/interfaces/common/VsoBaseInterfaces";
import { CoreApi } from "azure-devops-node-api/CoreApi";
import { ReleaseApi } from "azure-devops-node-api/ReleaseApi";
import { BuildApi } from "azure-devops-node-api/BuildApi";
import { GitApi } from "azure-devops-node-api/GitApi";
import { ITaskAgentApi } from "azure-devops-node-api/TaskAgentApi";
import { ISecurityRolesApi } from "azure-devops-node-api/SecurityRolesApi";
import { VsoClient } from "azure-devops-node-api/VsoClient";

import { IApiFactory } from "./iapifactory";
import { ILogger } from "../loggers/ilogger";
import { IDebug } from "../loggers/idebug";

export class ApiFactory implements IApiFactory {

    private debugLogger: IDebug;

    private webApi: WebApi;

    constructor(accountName: string, token: string, logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

        const auth = getPersonalAccessTokenHandler(token);

        // Use integrated retry mechanism to address
        // Intermittent Azure DevOps connectivity errors
        const options = {

            allowRetries: true,
            maxRetries: 100,
            socketTimeout: 30000,

        } as IRequestOptions;

        this.webApi = new WebApi(`https://dev.azure.com/${accountName}`, auth, options);

    }

    public async createCoreApi(): Promise<CoreApi> {

        const debug = this.debugLogger.extend(this.createCoreApi.name);

        const coreApi: CoreApi = await this.webApi.getCoreApi();

        debug("Azure DevOps Core API initialized");

        return coreApi;

    }

    public async createReleaseApi(): Promise<ReleaseApi> {

        const debug = this.debugLogger.extend(this.createReleaseApi.name);

        const releaseApi: ReleaseApi = await this.webApi.getReleaseApi();

        debug("Azure DevOps Release API initialized");

        return releaseApi;

    }

    public async createBuildApi(): Promise<BuildApi> {

        const debug = this.debugLogger.extend(this.createBuildApi.name);

        const buildApi: BuildApi = await this.webApi.getBuildApi();

        debug("Azure DevOps Build API initialized");

        return buildApi;

    }

    public async createGitApi(): Promise<GitApi> {

        const debug = this.debugLogger.extend(this.createGitApi.name);

        const getApi: GitApi = await this.webApi.getGitApi();

        debug("Azure DevOps Git API initialized");

        return getApi;

    }

    public async createTaskAgentApi(): Promise<ITaskAgentApi> {

        const debug = this.debugLogger.extend(this.createTaskAgentApi.name);

        const taskAgentApi: ITaskAgentApi = await this.webApi.getTaskAgentApi();

        debug("Azure DevOps Task Agent API initialized");

        return taskAgentApi;

    }

    public async createSecurityRolesApi(): Promise<ISecurityRolesApi> {

        const debug = this.debugLogger.extend(this.createSecurityRolesApi.name);

        const securityRolesApi: ISecurityRolesApi = await this.webApi.getSecurityRolesApi();

        debug("Azure DevOps Security Roles API initialized");

        return securityRolesApi;

    }

    public async createVsoClient(): Promise<VsoClient> {

        const debug = this.debugLogger.extend(this.createVsoClient.name);

        debug("Azure DevOps API client initialized");
        debug(this.webApi.options);

        return this.webApi.vsoClient;

    }

}
