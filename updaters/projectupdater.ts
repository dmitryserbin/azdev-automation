import Debug from "debug";

import { OperationReference } from "azure-devops-node-api/interfaces/common/OperationsInterfaces";
import { Process, ProjectVisibility, TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { GraphGroup, GraphMembership } from "azure-devops-node-api/interfaces/GraphInterfaces";

import { IProject, IProjectPermission, PermissionType, IPermission } from "../interfaces/configurationreader";
import { IConsoleLogger } from "../interfaces/consolelogger";
import { IDebugLogger } from "../interfaces/debuglogger";
import { IGraphHelper } from "../interfaces/graphhelper";
import { IHelper } from "../interfaces/helper";
import { IProjectHelper } from "../interfaces/projecthelper";
import { IProjectUpdater } from "../interfaces/projectupdater";
import { ISecurityHelper, IGroupProvider, ISubjectPermission } from "../interfaces/securityhelper";

export class ProjectUpdater implements IProjectUpdater {

    public projectHelper: IProjectHelper;
    public graphHelper: IGraphHelper;
    public securityHelper: ISecurityHelper;

    private debugLogger: Debug.Debugger;
    private logger: IConsoleLogger;
    private helper: IHelper;

    constructor(projectHelper: IProjectHelper, graphHelper: IGraphHelper, securityHelper: ISecurityHelper, debugLogger: IDebugLogger, consoleLogger: IConsoleLogger, helper: IHelper) {

        this.debugLogger = debugLogger.create(this.constructor.name);
        this.logger = consoleLogger;
        this.helper = helper;

        this.projectHelper = projectHelper;
        this.graphHelper = graphHelper;
        this.securityHelper = securityHelper;

    }

    public async getProject(name: string): Promise<TeamProject> {

        const debug = this.debugLogger.extend("getProject");

        const targetProject: TeamProject = await this.projectHelper.findProject(name);

        return targetProject;

    }

    public async createProject(project: IProject): Promise<TeamProject> {

        this.logger.log(`Creating new <${project.name}> team project`);

        const sourceControlType: string = "Git";
        const projectVisibility: ProjectVisibility = ProjectVisibility.Private;
        const processTemplate: Process = await this.projectHelper.getDefaultTemplate();

        const result: OperationReference = await this.projectHelper.createProject(project.name, project.description, processTemplate, sourceControlType, projectVisibility);

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

        const debug = this.debugLogger.extend("updatePermissions");

        this.logger.log(`Applying <${policy.name}> project permissions policy`);

        await Promise.all(policy.definition.map(async (group) => {

            const groupName: string = `[${project.name}]\\${group.name}`;

            debug(`Updating <${groupName}> group configuration`);

            // Slow down parallel calls to address
            // Intermittent API connectivity issues
            await this.helper.wait(500, 3000);

            let targetGroup: GraphGroup = await this.projectHelper.getProjectGroup(groupName, project.id!);

            // Create group
            if (!targetGroup) {

                this.logger.log(`Creating new <${groupName}> group`);

                targetGroup = await this.projectHelper.createProjectGroup(group.name, `Members of this group have custom access to the project.`, project.id!);

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

                await this.graphHelper.updateGroupMembers(group.members, targetGroup);

            }

        }));

    }

}
