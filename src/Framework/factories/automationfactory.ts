
import { VsoClient } from "azure-devops-node-api/VsoClient";
import { IBuildApi } from "azure-devops-node-api/BuildApi";
import { ICoreApi } from "azure-devops-node-api/CoreApi";
import { IReleaseApi } from "azure-devops-node-api/ReleaseApi";
import { ITaskAgentApi } from "azure-devops-node-api/TaskAgentApi";
import { IGitApi } from "azure-devops-node-api/GitApi";

import { AzDevClient } from "../common/azdevclient";
import { Helper } from "../common/helper";
import { BuildHelper } from "../helpers/buildhelper";
import { ProjectHelper } from "../helpers/projecthelper";
import { ReleaseHelper } from "../helpers/releasehelper";
import { RepositoryHelper } from "../helpers/repositoryhelper";
import { SecurityHelper } from "../helpers/securityhelper";
import { TaskAgentHelper } from "../helpers/taskagenthelper";
import { IApiFactory } from "./iapifactory";
import { IAutomationFactory } from "./iautomationfactory";
import { AzDevApiType, IAzDevClient } from "../common/iazdevclient";
import { IBuildHelper } from "../helpers/ibuildhelper";
import { IBuildUpdater } from "../updaters/ibuildupdater";
import { IConsoleLogger } from "../common/iconsolelogger";
import { IDebugLogger } from "../loggers/idebuglogger";
import { IHelper } from "../common/ihelper";
import { IProjectHelper } from "../helpers/iprojecthelper";
import { IProjectUpdater } from "../updaters/iprojectupdater";
import { IReleaseHelper } from "../helpers/ireleasehelper";
import { IReleaseUpdater } from "../updaters/ireleaseupdater";
import { IRepositoryHelper } from "../helpers/irepositoryhelper";
import { IRepositoryUpdater } from "../updaters/irepositoryupdater";
import { ISecurityHelper } from "../helpers/isecurityhelper";
import { ISecurityMapper } from "../mappers/isecuritymapper";
import { ITaskAgentHelper } from "../helpers/itaskagenthelper";
import { SecurityMapper } from "../mappers/securitymapper";
import { BuildUpdater } from "../updaters/buildupdater";
import { ProjectUpdater } from "../updaters/projectupdater";
import { ReleaseUpdater } from "../updaters/releaseupdater";
import { RepositoryUpdater } from "../updaters/repositoryupdater";
import { IWorkUpdater } from "../updaters/iworkupdater";
import { IWorkHelper } from "../helpers/iworkhelper";
import { WorkHelper } from "../helpers/workhelper";
import { WorkUpdater } from "../updaters/workupdater";
import { IEndpointUpdater } from "../updaters/iendpointupdater";
import { EndpointUpdater } from "../updaters/endpointupdater";
import { EndpointHelper } from "../helpers/endpointhelper";
import { IEndpointHelper } from "../helpers/iendpointhelper";

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

        const coreApi: ICoreApi = await this.apiFactory.createCoreApi();
        const vsoClient: VsoClient = await this.apiFactory.createVsoClient();
        const azdevClient: IAzDevClient = new AzDevClient(vsoClient.restClient, AzDevApiType.Core, vsoClient.basePath, this.debugLogger);

        const helper: IHelper = new Helper(this.debugLogger);
        const securityMapper: ISecurityMapper = new SecurityMapper(this.debugLogger);
        const projectHelper: IProjectHelper = new ProjectHelper(coreApi, azdevClient, this.debugLogger);
        const securityHelper: ISecurityHelper = new SecurityHelper(azdevClient, helper, securityMapper, this.debugLogger);

        return new ProjectUpdater(projectHelper, securityHelper, helper, this.debugLogger, this.consoleLogger);

    }

    public async createBuildUpdater(): Promise<IBuildUpdater> {

        const vsoClient: VsoClient = await this.apiFactory.createVsoClient();
        const azdevClient: IAzDevClient = new AzDevClient(vsoClient.restClient, AzDevApiType.Core, vsoClient.basePath, this.debugLogger);

        const buildApi: IBuildApi = await this.apiFactory.createBuildApi();
        const buildHelper: IBuildHelper = new BuildHelper(buildApi, this.debugLogger);

        const helper: IHelper = new Helper(this.debugLogger);
        const securityMapper: ISecurityMapper = new SecurityMapper(this.debugLogger);
        const securityHelper: ISecurityHelper = new SecurityHelper(azdevClient, helper, securityMapper, this.debugLogger);

        return new BuildUpdater(buildHelper, securityHelper, helper, this.debugLogger, this.consoleLogger);

    }

    public async createReleaseUpdater(): Promise<IReleaseUpdater> {

        const vsoClient: VsoClient = await this.apiFactory.createVsoClient();
        const azdevClient: IAzDevClient = new AzDevClient(vsoClient.restClient, AzDevApiType.Core, vsoClient.basePath, this.debugLogger);

        const releaseApi: IReleaseApi = await this.apiFactory.createReleaseApi();
        const releaseHelper: IReleaseHelper = new ReleaseHelper(releaseApi, this.debugLogger);

        const helper: IHelper = new Helper(this.debugLogger);
        const securityMapper: ISecurityMapper = new SecurityMapper(this.debugLogger);
        const taskAgentApi: ITaskAgentApi = await this.apiFactory.createTaskAgentApi();
        const taskAgentHelper: ITaskAgentHelper = new TaskAgentHelper(taskAgentApi, this.debugLogger);
        const securityHelper: ISecurityHelper = new SecurityHelper(azdevClient, helper, securityMapper, this.debugLogger);

        return new ReleaseUpdater(releaseHelper, taskAgentHelper, securityHelper, helper, this.debugLogger, this.consoleLogger);

    }

    public async createRepositoryUpdater(): Promise<IRepositoryUpdater> {

        const vsoClient: VsoClient = await this.apiFactory.createVsoClient();
        const azdevClient: IAzDevClient = new AzDevClient(vsoClient.restClient, AzDevApiType.Core, vsoClient.basePath, this.debugLogger);

        const gitApi: IGitApi = await this.apiFactory.createGitApi();
        const repositoryHelper: IRepositoryHelper = new RepositoryHelper(gitApi, this.debugLogger);

        const helper: IHelper = new Helper(this.debugLogger);
        const securityMapper: ISecurityMapper = new SecurityMapper(this.debugLogger);
        const securityHelper: ISecurityHelper = new SecurityHelper(azdevClient, helper, securityMapper, this.debugLogger);

        return new RepositoryUpdater(repositoryHelper, securityHelper, helper, this.debugLogger, this.consoleLogger);

    }

    public async createWorkUpdater(): Promise<IWorkUpdater> {

        const vsoClient: VsoClient = await this.apiFactory.createVsoClient();
        const azdevClient: IAzDevClient = new AzDevClient(vsoClient.restClient, AzDevApiType.Core, vsoClient.basePath, this.debugLogger);

        const helper: IHelper = new Helper(this.debugLogger);
        const workHelper: IWorkHelper = new WorkHelper(azdevClient, this.debugLogger);
        const securityMapper: ISecurityMapper = new SecurityMapper(this.debugLogger);
        const securityHelper: ISecurityHelper = new SecurityHelper(azdevClient, helper, securityMapper, this.debugLogger);

        return new WorkUpdater(workHelper, securityHelper, helper, this.debugLogger, this.consoleLogger);

    }

    public async createEndpointUpdater(): Promise<IEndpointUpdater> {

        const vsoClient: VsoClient = await this.apiFactory.createVsoClient();
        const azdevClient: IAzDevClient = new AzDevClient(vsoClient.restClient, AzDevApiType.Core, vsoClient.basePath, this.debugLogger);

        const helper: IHelper = new Helper(this.debugLogger);
        const endpointHelper: IEndpointHelper = new EndpointHelper(azdevClient, this.debugLogger);

        return new EndpointUpdater(endpointHelper, helper, this.debugLogger, this.consoleLogger);

    }

}
