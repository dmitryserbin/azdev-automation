import * as ba from "azure-devops-node-api/BuildApi";
import * as ca from "azure-devops-node-api/CoreApi";
import * as ga from "azure-devops-node-api/GitApi";
import * as ra from "azure-devops-node-api/ReleaseApi";
import * as ta from "azure-devops-node-api/TaskAgentApi";
import * as vc from "azure-devops-node-api/VsoClient";

import { AzDevClient } from "../common/azdevclient";
import { Helper } from "../common/helper";
import { BuildHelper } from "../helpers/buildhelper";
import { ProjectHelper } from "../helpers/projecthelper";
import { ReleaseHelper } from "../helpers/releasehelper";
import { RepositoryHelper } from "../helpers/repositoryhelper";
import { SecurityHelper } from "../helpers/securityhelper";
import { TaskAgentHelper } from "../helpers/taskagenthelper";
import { IApiFactory } from "../interfaces/factories/apifactory";
import { IAutomationFactory } from "../interfaces/factories/automationfactory";
import { AzDevApiType, IAzDevClient } from "../interfaces/common/azdevclient";
import { IBuildHelper } from "../interfaces/helpers/buildhelper";
import { IBuildUpdater } from "../interfaces/updaters/buildupdater";
import { IConsoleLogger } from "../interfaces/common/consolelogger";
import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IHelper } from "../interfaces/common/helper";
import { IProjectHelper } from "../interfaces/helpers/projecthelper";
import { IProjectUpdater } from "../interfaces/updaters/projectupdater";
import { IReleaseHelper } from "../interfaces/helpers/releasehelper";
import { IReleaseUpdater } from "../interfaces/updaters/releaseupdater";
import { IRepositoryHelper } from "../interfaces/helpers/repositoryhelper";
import { IRepositoryUpdater } from "../interfaces/updaters/repositoryupdater";
import { ISecurityHelper } from "../interfaces/helpers/securityhelper";
import { ISecurityMapper } from "../interfaces/mappers/securitymapper";
import { ITaskAgentHelper } from "../interfaces/helpers/taskagenthelper";
import { SecurityMapper } from "../mappers/securitymapper";
import { BuildUpdater } from "../updaters/buildupdater";
import { ProjectUpdater } from "../updaters/projectupdater";
import { ReleaseUpdater } from "../updaters/releaseupdater";
import { RepositoryUpdater } from "../updaters/repositoryupdater";
import { IWorkUpdater } from "../interfaces/updaters/workupdater";
import { IWorkHelper } from "../interfaces/helpers/workhelper";
import { WorkHelper } from "../helpers/workhelper";
import { WorkUpdater } from "../updaters/workupdater";
import { IEndpointUpdater } from "../interfaces/updaters/endpointupdater";
import { EndpointUpdater } from "../updaters/endpointupdater";
import { EndpointHelper } from "../helpers/endpointhelper";
import { IEndpointHelper } from "../interfaces/helpers/endpointhelper";

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
        const securityHelper: ISecurityHelper = new SecurityHelper(azdevClient, helper, securityMapper, this.debugLogger);

        return new ProjectUpdater(projectHelper, securityHelper, helper, this.debugLogger, this.consoleLogger);

    }

    public async createBuildUpdater(): Promise<IBuildUpdater> {

        const vsoClient: vc.VsoClient = await this.apiFactory.createVsoClient();
        const azdevClient: IAzDevClient = new AzDevClient(vsoClient.restClient, AzDevApiType.Core, vsoClient.basePath, this.debugLogger);

        const buildApi: ba.IBuildApi = await this.apiFactory.createBuildApi();
        const buildHelper: IBuildHelper = new BuildHelper(buildApi, this.debugLogger);

        const helper: IHelper = new Helper(this.debugLogger);
        const securityMapper: ISecurityMapper = new SecurityMapper(this.debugLogger);
        const securityHelper: ISecurityHelper = new SecurityHelper(azdevClient, helper, securityMapper, this.debugLogger);

        return new BuildUpdater(buildHelper, securityHelper, helper, this.debugLogger, this.consoleLogger);

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
        const securityHelper: ISecurityHelper = new SecurityHelper(azdevClient, helper, securityMapper, this.debugLogger);

        return new ReleaseUpdater(releaseHelper, taskAgentHelper, securityHelper, helper, this.debugLogger, this.consoleLogger);

    }

    public async createRepositoryUpdater(): Promise<IRepositoryUpdater> {

        const vsoClient: vc.VsoClient = await this.apiFactory.createVsoClient();
        const azdevClient: IAzDevClient = new AzDevClient(vsoClient.restClient, AzDevApiType.Core, vsoClient.basePath, this.debugLogger);

        const gitApi: ga.IGitApi = await this.apiFactory.createGitApi();
        const repositoryHelper: IRepositoryHelper = new RepositoryHelper(gitApi, this.debugLogger);

        const helper: IHelper = new Helper(this.debugLogger);
        const securityMapper: ISecurityMapper = new SecurityMapper(this.debugLogger);
        const securityHelper: ISecurityHelper = new SecurityHelper(azdevClient, helper, securityMapper, this.debugLogger);

        return new RepositoryUpdater(repositoryHelper, securityHelper, helper, this.debugLogger, this.consoleLogger);

    }

    public async createWorkUpdater(): Promise<IWorkUpdater> {

        const vsoClient: vc.VsoClient = await this.apiFactory.createVsoClient();
        const azdevClient: IAzDevClient = new AzDevClient(vsoClient.restClient, AzDevApiType.Core, vsoClient.basePath, this.debugLogger);

        const helper: IHelper = new Helper(this.debugLogger);
        const workHelper: IWorkHelper = new WorkHelper(azdevClient, this.debugLogger);
        const securityMapper: ISecurityMapper = new SecurityMapper(this.debugLogger);
        const securityHelper: ISecurityHelper = new SecurityHelper(azdevClient, helper, securityMapper, this.debugLogger);

        return new WorkUpdater(workHelper, securityHelper, helper, this.debugLogger, this.consoleLogger);

    }

    public async createEndpointUpdater(): Promise<IEndpointUpdater> {

        const vsoClient: vc.VsoClient = await this.apiFactory.createVsoClient();
        const azdevClient: IAzDevClient = new AzDevClient(vsoClient.restClient, AzDevApiType.Core, vsoClient.basePath, this.debugLogger);

        const helper: IHelper = new Helper(this.debugLogger);
        const endpointHelper: IEndpointHelper = new EndpointHelper(azdevClient, this.debugLogger);

        return new EndpointUpdater(endpointHelper, helper, this.debugLogger, this.consoleLogger);

    }

}
