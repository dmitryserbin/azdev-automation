import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

import { ApiFactory } from "./factories/apifactory";
import { ArtifactFactory } from "./factories/artifactfactory";
import { AutomationFactory } from "./factories/automationfactory";
import { IApiFactory } from "./factories/iapifactory";
import { IArtifactFactory } from "./factories/iartifactfactory";
import { IAutomation, IEndpoint, IParameters } from "./iautomation";
import { IAutomationFactory } from "./factories/iautomationfactory";
import { IBuildUpdater } from "./updaters/ibuildupdater";
import { IProject } from "./readers/iconfigurationreader";
import { IProjectUpdater } from "./updaters/iprojectupdater";
import { IReleaseUpdater } from "./updaters/ireleaseupdater";
import { IRepositoryUpdater } from "./updaters/irepositoryupdater";
import { ConfigurationReader } from "./readers/configurationreader";
import { IWorkUpdater } from "./updaters/iworkupdater";
import { IEndpointUpdater } from "./updaters/iendpointupdater";
import { ILogger } from "./loggers/ilogger";
import { Logger } from "./loggers/logger";

export class Automation implements IAutomation {

    private endpoint: IEndpoint;
    private parameters: IParameters;

    private logger: ILogger;

    private configurationReader: ConfigurationReader;
    private automationFactory: IAutomationFactory;

    constructor(endpoint: IEndpoint, parameters: IParameters) {

        this.endpoint = endpoint;
        this.parameters = parameters;

        this.logger = new Logger("azdev-automation", false);

        const apiFactory: IApiFactory = new ApiFactory(this.endpoint.account, this.endpoint.token, this.logger);
        const artifactFactory: IArtifactFactory = new ArtifactFactory(this.parameters.config, this.parameters.policies, this.parameters.schemas);

        this.configurationReader = new ConfigurationReader(artifactFactory, this.logger);
        this.automationFactory = new AutomationFactory(apiFactory, this.logger);

    }

    public async run(): Promise<void> {

        const projectUpdater: IProjectUpdater = await this.automationFactory.createProjectUpdater();
        const buildUpdater: IBuildUpdater = await this.automationFactory.createBuildUpdater();
        const releaseUpdater: IReleaseUpdater = await this.automationFactory.createReleaseUpdater();
        const repositoryUpdater: IRepositoryUpdater = await this.automationFactory.createRepositoryUpdater();
        const workUpdater: IWorkUpdater = await this.automationFactory.createWorkUpdater();
        const endpointUpdater: IEndpointUpdater = await this.automationFactory.createEndpointUpdater();

        const configuration: IProject[] = await this.configurationReader.read();

        for (const project of configuration) {

            this.logger.log(`Configuring <${project.name}> project automation`);

            let targetProject: TeamProject = await projectUpdater.getProject(project.name);

            if (targetProject) {

                if (this.parameters.projectSetup) {

                    targetProject = await projectUpdater.updateProject(project);

                }

            } else {

                if (this.parameters.projectSetup) {

                    targetProject = await projectUpdater.createProject(project);

                } else {

                    throw new Error(`Target project <${project.name}> not found`);

                }

            }

            // Features first time initialization is required for
            // Related policies to work correctly (permissions, etc)
            await releaseUpdater.initialize(targetProject.name!);
            await endpointUpdater.initialize(targetProject.name!, targetProject.id!);

            if (this.parameters.accessPermissions) {

                if (project.permissions.project) {

                    await projectUpdater.updatePermissions(targetProject, project.permissions.project);

                }

                if (project.permissions.build) {

                    await buildUpdater.updatePermissions(targetProject, project.permissions.build);

                }

                if (project.permissions.release) {

                    await releaseUpdater.updatePermissions(targetProject, project.permissions.release);

                }

                if (project.permissions.repository) {

                    await repositoryUpdater.updatePermissions(targetProject, project.permissions.repository);

                }

                if (project.permissions.work) {

                    await workUpdater.updatePermissions(targetProject, project.permissions.work);

                }

            }

            if (this.parameters.branchPolicies) {

                throw new Error("Feature not implemented");

            }

            if (this.parameters.serviceConnections) {

                throw new Error("Feature not implemented");

            }

        }

    }

}
