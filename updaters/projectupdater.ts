import Debug from "debug";

import { OperationReference } from "azure-devops-node-api/interfaces/common/OperationsInterfaces";
import { Process, ProjectVisibility, TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { GraphGroup, GraphMembership } from "azure-devops-node-api/interfaces/GraphInterfaces";

import { IProject, IProjectPermission, PermissionType } from "../interfaces/configurationreader";
import { IConsoleLogger } from "../interfaces/consolelogger";
import { IDebugLogger } from "../interfaces/debuglogger";
import { IGraphHelper } from "../interfaces/graphhelper";
import { IHelper } from "../interfaces/helper";
import { IProjectHelper } from "../interfaces/projecthelper";
import { IProjectUpdater } from "../interfaces/projectupdater";
import { INamespace, INamespaceAction, ISecurityHelper } from "../interfaces/securityhelper";

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

        this.logger.log(`Applying <${policy.name}> project permissions policy`);

        const viewAccess: string = "View project-level information";
        const namespace: INamespace = await this.securityHelper.getNamespace("Project");
        const accessAction: INamespaceAction = namespace.actions.filter((i) => i.displayName === viewAccess)[0];

        if (!accessAction) {

            throw new Error(`Namespace <${namespace.name}> action <${viewAccess}> not found`);

        }

        await Promise.all(policy.definition.map(async (group) => {

            const groupName: string = `[${project.name}]\\${group.name}`;

            this.logger.log(`Updating <${groupName}> group members`);

            // Slow down parallel calls to address
            // Intermittent API connectivity issues
            await this.helper.wait(500, 3000);

            let targetGroup: GraphGroup = await this.projectHelper.getProjectGroup(groupName, project.id!);

            // Create group
            if (!targetGroup) {

                this.logger.log(`Creating new <${groupName}> group`);

                targetGroup = await this.projectHelper.createProjectGroup(group.name, `Members of this group have custom access to the project.`, project.id!);

                // It takes a few seconds to before
                // New group data provider is available
                await this.helper.wait(5000, 5000);

                // Set minimum project permissions
                const groupIdentity: string = await this.securityHelper.getGroupIdentity(project.name!, targetGroup);
                const updatedPermission: any = await this.securityHelper.setGroupAccessControl(project.id!, groupIdentity, accessAction, PermissionType.Allow);

            }

            let validMemberships: GraphMembership[] = [];

            // Adding new memberships
            if (group.members.length > 0) {

                validMemberships = await this.graphHelper.addGroupMemberships(targetGroup, group.members);

            }

            const obsoleteMemberships: GraphMembership[] = await this.graphHelper.getObsoleteGroupMemberships(targetGroup, validMemberships);

            // Removing obsolete memberships
            if (obsoleteMemberships.length > 0) {

                await this.graphHelper.removeGroupMemberships(targetGroup, obsoleteMemberships);

            }

        }));

    }

}
