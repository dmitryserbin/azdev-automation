import { OperationReference } from "azure-devops-node-api/interfaces/common/OperationsInterfaces";
import { Process, ProjectVisibility, TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { GraphGroup } from "azure-devops-node-api/interfaces/GraphInterfaces";

import { IProject, IProjectPermission } from "../readers/iconfigurationreader";
import { ICommonHelper } from "../helpers/icommonhelper";
import { IProjectHelper } from "../helpers/iprojecthelper";
import { IProjectUpdater } from "./iprojectupdater";
import { ISecurityHelper } from "../helpers/isecurityhelper";
import { IDebug } from "../loggers/idebug";
import { ILogger } from "../loggers/ilogger";

export class ProjectUpdater implements IProjectUpdater {

    private logger: ILogger;
    private debugLogger: IDebug;

    public projectHelper: IProjectHelper;
    public securityHelper: ISecurityHelper;
    private commonHelper: ICommonHelper;

    constructor(projectHelper: IProjectHelper, securityHelper: ISecurityHelper, commonHelper: ICommonHelper, logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

        this.projectHelper = projectHelper;
        this.securityHelper = securityHelper;
        this.commonHelper = commonHelper;

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

        await this.commonHelper.wait(5000, 5000);

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
            await this.commonHelper.wait(500, 3000);

            let targetGroup: GraphGroup = await this.projectHelper.getProjectGroup(groupName, project.id!);

            // Create group
            if (!targetGroup) {

                this.logger.log(`Creating new <${groupName}> group`);

                targetGroup = await this.projectHelper.createProjectGroup(group.name, "Members of this group have custom access to the project.", project.id!);

                // It may take up to a few seconds before
                // New group identity becomes available
                await this.commonHelper.wait(5000, 5000);

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
