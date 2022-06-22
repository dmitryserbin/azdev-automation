import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

import { ConsoleLogger } from "./common/consolelogger";
import { DebugLogger } from "./common/debuglogger";
import { ApiFactory } from "./factories/apifactory";
import { ArtifactFactory } from "./factories/artifactfactory";
import { AutomationFactory } from "./factories/automationfactory";
import { IApiFactory } from "./interfaces/factories/apifactory";
import { IArtifactFactory } from "./interfaces/factories/artifactfactory";
import { IAutomation, IEndpoint, IParameters } from "./interfaces/automation";
import { IAutomationFactory } from "./interfaces/factories/automationfactory";
import { IBuildUpdater } from "./interfaces/updaters/buildupdater";
import { IProject } from "./interfaces/readers/configurationreader";
import { IConsoleLogger } from "./interfaces/common/consolelogger";
import { IDebugLogger } from "./interfaces/common/debuglogger";
import { IProjectUpdater } from "./interfaces/updaters/projectupdater";
import { IReleaseUpdater } from "./interfaces/updaters/releaseupdater";
import { IRepositoryUpdater } from "./interfaces/updaters/repositoryupdater";
import { ConfigurationReader } from "./readers/configurationreader";
import { IWorkUpdater } from "./interfaces/updaters/workupdater";

export class Automation implements IAutomation {

    private endpoint: IEndpoint;
    private parameters: IParameters;

    private debugLogger: IDebugLogger;
    private consoleLogger: IConsoleLogger;

    private configurationReader: ConfigurationReader;
    private automationFactory: IAutomationFactory;

    constructor(endpoint: IEndpoint, parameters: IParameters) {

        this.endpoint = endpoint;
        this.parameters = parameters;

        this.debugLogger = new DebugLogger("azdev-automation");
        this.consoleLogger = new ConsoleLogger();

        const apiFactory: IApiFactory = new ApiFactory(this.endpoint.account, this.endpoint.token, this.debugLogger);
        const artifactFactory: IArtifactFactory = new ArtifactFactory(this.parameters.config, this.parameters.policies, this.parameters.schemas);

        this.configurationReader = new ConfigurationReader(artifactFactory, this.debugLogger);
        this.automationFactory = new AutomationFactory(apiFactory, this.debugLogger, this.consoleLogger);

    }

    public async run(): Promise<void> {

        // Read configuration
        const projects: IProject[] = await this.configurationReader.read();

        // Initialize updaters
        const projectUpdater: IProjectUpdater = await this.automationFactory.createProjectUpdater();
        const buildUpdater: IBuildUpdater = await this.automationFactory.createBuildUpdater();
        const releaseUpdater: IReleaseUpdater = await this.automationFactory.createReleaseUpdater();
        const repositoryUpdater: IRepositoryUpdater = await this.automationFactory.createRepositoryUpdater();
        const workUpdater: IWorkUpdater = await this.automationFactory.createWorkUpdater();

        for (const project of projects) {

            this.consoleLogger.log(`Configuring <${project.name}> project automation`);

            let targetProject: TeamProject = await projectUpdater.getProject(project.name);

            if (targetProject) {

                // Update project
                if (this.parameters.projectSetup) {

                    targetProject = await projectUpdater.updateProject(project);

                }

            } else {

                // Create project
                if (this.parameters.projectSetup) {

                    targetProject = await projectUpdater.createProject(project);

                } else {

                    throw new Error(`Target project <${project.name}> not found`);

                }

            }

            // Update access permissions
            if (this.parameters.accessPermissions) {

                // Project
                if (project.permissions.project) {

                    await projectUpdater.updatePermissions(targetProject, project.permissions.project);

                }

                // Build
                if (project.permissions.build) {

                    await buildUpdater.updatePermissions(targetProject, project.permissions.build);

                }

                // Release
                if (project.permissions.release) {

                    await releaseUpdater.updatePermissions(targetProject, project.permissions.release);

                }

                // Repository
                if (project.permissions.repository) {

                    await repositoryUpdater.updatePermissions(targetProject, project.permissions.repository);

                }

                // Work items
                if (project.permissions.work) {

                    await workUpdater.updatePermissions(targetProject, project.permissions.work);

                }

            }

            // Update branch policies
            if (this.parameters.branchPolicies) {

                throw new Error("Feature not implemented");

            }

            // Create service connections
            if (this.parameters.serviceConnections) {

                throw new Error("Feature not implemented");

            }

        }

    }

}
