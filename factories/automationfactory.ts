import * as ba from "azure-devops-node-api/BuildApi";
import * as ca from "azure-devops-node-api/CoreApi";
import * as ga from "azure-devops-node-api/GitApi";
import * as ra from "azure-devops-node-api/ReleaseApi";
import * as ta from "azure-devops-node-api/TaskAgentApi";
import * as vc from "azure-devops-node-api/VsoClient";

import { AzDevClient } from "../common/azdevclient";
import { Helper } from "../common/helper";
import { BuildHelper } from "../helpers/buildhelper";
import { GraphHelper } from "../helpers/graphhelper";
import { ProjectHelper } from "../helpers/projecthelper";
import { ReleaseHelper } from "../helpers/releasehelper";
import { RepositoryHelper } from "../helpers/repositoryhelper";
import { SecurityHelper } from "../helpers/securityhelper";
import { TaskAgentHelper } from "../helpers/taskagenthelper";
import { IApiFactory } from "../interfaces/apifactory";
import { IAutomationFactory } from "../interfaces/automationfactory";
import { AzDevApiType, IAzDevClient } from "../interfaces/azdevclient";
import { IBuildHelper } from "../interfaces/buildhelper";
import { IBuildUpdater } from "../interfaces/buildupdater";
import { IConsoleLogger } from "../interfaces/consolelogger";
import { IDebugLogger } from "../interfaces/debuglogger";
import { IGraphHelper } from "../interfaces/graphhelper";
import { IHelper } from "../interfaces/helper";
import { IProjectHelper } from "../interfaces/projecthelper";
import { IProjectUpdater } from "../interfaces/projectupdater";
import { IReleaseHelper } from "../interfaces/releasehelper";
import { IReleaseUpdater } from "../interfaces/releaseupdater";
import { IRepositoryHelper } from "../interfaces/repositoryhelper";
import { IRepositoryUpdater } from "../interfaces/repositoryupdater";
import { ISecurityHelper } from "../interfaces/securityhelper";
import { ISecurityMapper } from "../interfaces/securitymapper";
import { ITaskAgentHelper } from "../interfaces/taskagenthelper";
import { SecurityMapper } from "../mappers/securitymapper";
import { BuildUpdater } from "../updaters/buildupdater";
import { ProjectUpdater } from "../updaters/projectupdater";
import { ReleaseUpdater } from "../updaters/releaseupdater";
import { RepositoryUpdater } from "../updaters/repositoryupdater";

export class AutomationFactory implements IAutomationFactory {

    private debugLogger: IDebugLogger;
    private consoleLogger: IConsoleLogger;

    private apiFactory: IApiFactory;

    constructor(apiFactory: IApiFactory, debugLogger: IDebugLogger, consoleLogger: IConsoleLogger) {

        this.debugLogger = debugLogger;
        this.consoleLogger = consoleLogger;

        this.apiFactory = apiFactory;

    }

    public async createProjectUpdater(): Promise<IProjectUpdater> {

        const coreApi: ca.ICoreApi = await this.apiFactory.createCoreApi();
        const vsoClient: vc.VsoClient = await this.apiFactory.createVsoClient();
        const azdevClient: IAzDevClient = new AzDevClient(vsoClient.restClient, AzDevApiType.Core, vsoClient.basePath, this.debugLogger);

        const helper: IHelper = new Helper(this.debugLogger);
        const securityMapper: ISecurityMapper = new SecurityMapper(this.debugLogger);
        const projectHelper: IProjectHelper = new ProjectHelper(coreApi, azdevClient, this.debugLogger);
        const graphHelper: IGraphHelper = new GraphHelper(azdevClient, this.debugLogger, helper);
        const securityHelper: ISecurityHelper = new SecurityHelper(azdevClient, this.debugLogger, securityMapper);

        return new ProjectUpdater(projectHelper, graphHelper, securityHelper, this.debugLogger, this.consoleLogger, helper);

    }

    public async createReleaseUpdater(): Promise<IReleaseUpdater> {

        const vsoClient: vc.VsoClient = await this.apiFactory.createVsoClient();
        const azdevClient: IAzDevClient = new AzDevClient(vsoClient.restClient, AzDevApiType.Core, vsoClient.basePath, this.debugLogger);

        const releaseApi: ra.IReleaseApi = await this.apiFactory.createReleaseApi();
        const releaseHelper: IReleaseHelper = new ReleaseHelper(releaseApi, this.debugLogger);

        const helper: IHelper = new Helper(this.debugLogger);
        const securityMapper: ISecurityMapper = new SecurityMapper(this.debugLogger);
        const taskAgentApi: ta.ITaskAgentApi = await this.apiFactory.createTaskAgentApi();
        const taskAgentHelper: ITaskAgentHelper = new TaskAgentHelper(taskAgentApi, this.debugLogger);
        const graphHelper: IGraphHelper = new GraphHelper(azdevClient, this.debugLogger, helper);
        const securityHelper: ISecurityHelper = new SecurityHelper(azdevClient, this.debugLogger, securityMapper);

        return new ReleaseUpdater(releaseHelper, taskAgentHelper, graphHelper, securityHelper, this.debugLogger, this.consoleLogger, helper);

    }

    public async createBuildUpdater(): Promise<IBuildUpdater> {

        const vsoClient: vc.VsoClient = await this.apiFactory.createVsoClient();
        const azdevClient: IAzDevClient = new AzDevClient(vsoClient.restClient, AzDevApiType.Core, vsoClient.basePath, this.debugLogger);

        const buildApi: ba.IBuildApi = await this.apiFactory.createBuildApi();
        const buildHelper: IBuildHelper = new BuildHelper(buildApi, this.debugLogger);

        const helper: IHelper = new Helper(this.debugLogger);
        const securityMapper: ISecurityMapper = new SecurityMapper(this.debugLogger);
        const graphHelper: IGraphHelper = new GraphHelper(azdevClient, this.debugLogger, helper);
        const securityHelper: ISecurityHelper = new SecurityHelper(azdevClient, this.debugLogger, securityMapper);

        return new BuildUpdater(buildHelper, graphHelper, securityHelper, this.debugLogger, this.consoleLogger, helper);

    }

    public async createRepositoryUpdater(): Promise<IRepositoryUpdater> {

        const vsoClient: vc.VsoClient = await this.apiFactory.createVsoClient();
        const azdevClient: IAzDevClient = new AzDevClient(vsoClient.restClient, AzDevApiType.Core, vsoClient.basePath, this.debugLogger);

        const gitApi: ga.IGitApi = await this.apiFactory.createGitApi();
        const repositoryHelper: IRepositoryHelper = new RepositoryHelper(gitApi, this.debugLogger);

        const helper: IHelper = new Helper(this.debugLogger);
        const securityMapper: ISecurityMapper = new SecurityMapper(this.debugLogger);
        const graphHelper: IGraphHelper = new GraphHelper(azdevClient, this.debugLogger, helper);
        const securityHelper: ISecurityHelper = new SecurityHelper(azdevClient, this.debugLogger, securityMapper);

        return new RepositoryUpdater(repositoryHelper, graphHelper, securityHelper, this.debugLogger, this.consoleLogger, helper);

    }

}
