import Debug from "debug";

import { OperationReference } from "azure-devops-node-api/interfaces/common/OperationsInterfaces";
import { Process, ProjectVisibility, TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { GraphGroup } from "azure-devops-node-api/interfaces/GraphInterfaces";

import { IProject, IProjectPermission } from "../interfaces/readers/configurationreader";
import { IConsoleLogger } from "../interfaces/common/consolelogger";
import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IHelper } from "../interfaces/common/helper";
import { IProjectHelper } from "../interfaces/helpers/projecthelper";
import { IProjectUpdater } from "../interfaces/updaters/projectupdater";
import { ISecurityHelper } from "../interfaces/helpers/securityhelper";

export class ProjectUpdater implements IProjectUpdater {

    public projectHelper: IProjectHelper;
    public securityHelper: ISecurityHelper;
    private helper: IHelper;

    private debugLogger: Debug.Debugger;
    private logger: IConsoleLogger;

    constructor(projectHelper: IProjectHelper, securityHelper: ISecurityHelper, helper: IHelper, debugLogger: IDebugLogger, consoleLogger: IConsoleLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);
        this.logger = consoleLogger;

        this.projectHelper = projectHelper;
        this.securityHelper = securityHelper;
        this.helper = helper;

    }

    public async getProject(name: string): Promise<TeamProject> {

        const debug = this.debugLogger.extend(this.getProject.name);

        const targetProject: TeamProject = await this.projectHelper.findProject(name);

        return targetProject;

    }

    public async getProjects(name: string): Promise<TeamProject[]> {

        const debug = this.debugLogger.extend(this.getProject.name);

        const targetProjects: TeamProject[] = await this.projectHelper.findProjects(name);

        return targetProjects;

    }

    public async createProject(project: IProject): Promise<TeamProject> {

        this.logger.log(`Creating new <${project.name}> team project`);

        const sourceControlType = "Git";
        const projectVisibility: ProjectVisibility = ProjectVisibility.Private;
        const processTemplate: Process = await this.projectHelper.getDefaultTemplate();

        const result: OperationReference = await this.projectHelper.createProject(project.name, project.description, processTemplate, sourceControlType, projectVisibility);

        await this.helper.wait(5000, 5000);

        const targetProject: TeamProject = await this.projectHelper.findProject(project.name);

        return targetProject;

    }

    public async updateProject(project: IProject): Promise<TeamProject> {

        this.logger.log(`Updating existing <${project.name}> team project`);

        const targetProject: TeamProject = await this.projectHelper.findProject(project.name);

        if (!targetProject) {

            throw new Error(`Project <${project.name}> not found`);

        }

        targetProject.description = project.description;

        // Update settings
        await this.projectHelper.updateProject(targetProject);

        return targetProject;

    }

    public async updatePermissions(project: TeamProject, policy: IProjectPermission): Promise<void> {

        const debug = this.debugLogger.extend(this.updatePermissions.name);

        this.logger.log(`Applying <${policy.name}> project permissions policy`);

        await Promise.all(policy.definition.map(async (group) => {

            const groupName = `[${project.name}]\\${group.name}`;

            debug(`Updating <${groupName}> group configuration`);

            // Slow down parallel calls to address
            // Intermittent API connectivity issues
            await this.helper.wait(500, 3000);

            let targetGroup: GraphGroup = await this.projectHelper.getProjectGroup(groupName, project.id!);

            // Create group
            if (!targetGroup) {

                this.logger.log(`Creating new <${groupName}> group`);

                targetGroup = await this.projectHelper.createProjectGroup(group.name, "Members of this group have custom access to the project.", project.id!);

                // It may take up to a few seconds before
                // New group identity becomes available
                await this.helper.wait(5000, 5000);

            }

            // Update permissions
            if (group.permissions && group.permissions.length) {

                this.logger.log(`Updating <${groupName}> group permissions`);

                await this.securityHelper.updateGroupPermissions(project.name!, targetGroup, group.permissions);

            }

            // Update members
            if (group.members && group.members.length) {

                this.logger.log(`Updating <${groupName}> group members`);

                await this.securityHelper.updateGroupMembers(group.members, targetGroup);

            }

        }));

    }

}
