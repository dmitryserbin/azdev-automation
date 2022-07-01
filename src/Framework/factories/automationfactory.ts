
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
import { ILogger } from "../loggers/ilogger";
import { IDebug } from "../loggers/idebug";

export class AutomationFactory implements IAutomationFactory {

    private logger: ILogger;
    private debugLogger: IDebug;

    private apiFactory: IApiFactory;

    constructor(apiFactory: IApiFactory, logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

        this.apiFactory = apiFactory;

    }

    public async createProjectUpdater(): Promise<IProjectUpdater> {

        const coreApi: ICoreApi = await this.apiFactory.createCoreApi();
        const vsoClient: VsoClient = await this.apiFactory.createVsoClient();
        const azdevClient: IAzDevClient = new AzDevClient(vsoClient.restClient, AzDevApiType.Core, vsoClient.basePath, this.logger);

        const helper: IHelper = new Helper(this.logger);
        const securityMapper: ISecurityMapper = new SecurityMapper(this.logger);
        const projectHelper: IProjectHelper = new ProjectHelper(coreApi, azdevClient, this.logger);
        const securityHelper: ISecurityHelper = new SecurityHelper(azdevClient, helper, securityMapper, this.logger);

        return new ProjectUpdater(projectHelper, securityHelper, helper, this.logger);

    }

    public async createBuildUpdater(): Promise<IBuildUpdater> {

        const vsoClient: VsoClient = await this.apiFactory.createVsoClient();
        const azdevClient: IAzDevClient = new AzDevClient(vsoClient.restClient, AzDevApiType.Core, vsoClient.basePath, this.logger);

        const buildApi: IBuildApi = await this.apiFactory.createBuildApi();
        const buildHelper: IBuildHelper = new BuildHelper(buildApi, this.logger);

        const helper: IHelper = new Helper(this.logger);
        const securityMapper: ISecurityMapper = new SecurityMapper(this.logger);
        const securityHelper: ISecurityHelper = new SecurityHelper(azdevClient, helper, securityMapper, this.logger);

        return new BuildUpdater(buildHelper, securityHelper, helper, this.logger);

    }

    public async createReleaseUpdater(): Promise<IReleaseUpdater> {

        const vsoClient: VsoClient = await this.apiFactory.createVsoClient();
        const azdevClient: IAzDevClient = new AzDevClient(vsoClient.restClient, AzDevApiType.Core, vsoClient.basePath, this.logger);

        const releaseApi: IReleaseApi = await this.apiFactory.createReleaseApi();
        const releaseHelper: IReleaseHelper = new ReleaseHelper(releaseApi, this.logger);

        const helper: IHelper = new Helper(this.logger);
        const securityMapper: ISecurityMapper = new SecurityMapper(this.logger);
        const taskAgentApi: ITaskAgentApi = await this.apiFactory.createTaskAgentApi();
        const taskAgentHelper: ITaskAgentHelper = new TaskAgentHelper(taskAgentApi, this.logger);
        const securityHelper: ISecurityHelper = new SecurityHelper(azdevClient, helper, securityMapper, this.logger);

        return new ReleaseUpdater(releaseHelper, taskAgentHelper, securityHelper, helper, this.logger);

    }

    public async createRepositoryUpdater(): Promise<IRepositoryUpdater> {

        const vsoClient: VsoClient = await this.apiFactory.createVsoClient();
        const azdevClient: IAzDevClient = new AzDevClient(vsoClient.restClient, AzDevApiType.Core, vsoClient.basePath, this.logger);

        const gitApi: IGitApi = await this.apiFactory.createGitApi();
        const repositoryHelper: IRepositoryHelper = new RepositoryHelper(gitApi, this.logger);

        const helper: IHelper = new Helper(this.logger);
        const securityMapper: ISecurityMapper = new SecurityMapper(this.logger);
        const securityHelper: ISecurityHelper = new SecurityHelper(azdevClient, helper, securityMapper, this.logger);

        return new RepositoryUpdater(repositoryHelper, securityHelper, helper, this.logger);

    }

    public async createWorkUpdater(): Promise<IWorkUpdater> {

        const vsoClient: VsoClient = await this.apiFactory.createVsoClient();
        const azdevClient: IAzDevClient = new AzDevClient(vsoClient.restClient, AzDevApiType.Core, vsoClient.basePath, this.logger);

        const helper: IHelper = new Helper(this.logger);
        const workHelper: IWorkHelper = new WorkHelper(azdevClient, this.logger);
        const securityMapper: ISecurityMapper = new SecurityMapper(this.logger);
        const securityHelper: ISecurityHelper = new SecurityHelper(azdevClient, helper, securityMapper, this.logger);

        return new WorkUpdater(workHelper, securityHelper, helper, this.logger);

    }

    public async createEndpointUpdater(): Promise<IEndpointUpdater> {

        const vsoClient: VsoClient = await this.apiFactory.createVsoClient();
        const azdevClient: IAzDevClient = new AzDevClient(vsoClient.restClient, AzDevApiType.Core, vsoClient.basePath, this.logger);

        const helper: IHelper = new Helper(this.logger);
        const endpointHelper: IEndpointHelper = new EndpointHelper(azdevClient, this.logger);

        return new EndpointUpdater(endpointHelper, helper, this.logger);

    }

}
