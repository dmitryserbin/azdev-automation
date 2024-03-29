import { ICoreApi } from "azure-devops-node-api/CoreApi";
import { OperationReference } from "azure-devops-node-api/interfaces/common/OperationsInterfaces";
import { Process, ProjectVisibility, TeamProject, TeamProjectReference } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { GraphDescriptorResult, GraphGroup } from "azure-devops-node-api/interfaces/GraphInterfaces";

import { AzDevApiType, IAzDevClient } from "../common/iazdevclient";
import { IDebug } from "../loggers/idebug";
import { ILogger } from "../loggers/ilogger";
import { IProjectHelper } from "./iprojecthelper";

export class ProjectHelper implements IProjectHelper {

    private debugLogger: IDebug;

    private azdevClient: IAzDevClient;
    private coreApi: ICoreApi;

    constructor(coreApi: ICoreApi, azdevClient: IAzDevClient, logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

        this.azdevClient = azdevClient;
        this.coreApi = coreApi;

    }

    public async createProject(name: string, description: string, processTemplate: Process, sourceControlType: string, visibility: ProjectVisibility): Promise<OperationReference> {

        const debug = this.debugLogger.extend(this.createProject.name);

        const projectRequest: TeamProject = {

            name,
            description,
            visibility,
            capabilities: {
                versioncontrol: {
                    sourceControlType,
                },
                processTemplate: {
                    templateTypeId: processTemplate.id!,
                },
            },

        };

        debug(projectRequest);

        const result = await this.coreApi.queueCreateProject(projectRequest);

        return result;

    }

    public async updateProject(project: TeamProject): Promise<void> {

        const debug = this.debugLogger.extend(this.updateProject.name);

        const updatedProject: TeamProject = {

            description: project.description,

        };

        debug(updatedProject);

        const result = await this.coreApi.updateProject(updatedProject, project.id!);

    }

    public async findProject(name: string): Promise<TeamProject> {

        const debug = this.debugLogger.extend(this.findProject.name);

        const result: TeamProject = await this.coreApi.getProject(name);

        debug(result);

        return result;

    }

    public async findProjects(nameFilter?: string): Promise<TeamProjectReference[]> {

        const debug = this.debugLogger.extend(this.findProjects.name);

        let result: TeamProjectReference[] = [];

        const availableProjects: TeamProjectReference[] = await this.coreApi.getProjects();

        debug(`Found ${availableProjects.length} total projects`);

        if (nameFilter) {

            debug(`Using ${nameFilter} project name filter`);

            result = availableProjects.filter((i) => i.name!.match(nameFilter));

            debug(`Found ${result.length} filtered projects`);

        } else {

            result = availableProjects;

        }

        return result;

    }

    public async getProjectGroup(name: string, projectId: string): Promise<GraphGroup> {

        const debug = this.debugLogger.extend(this.getProjectGroup.name);

        const descriptor = await this.azdevClient.get<GraphDescriptorResult>(`_apis/graph/descriptors/${projectId}`, AzDevApiType.Graph);
        const descriptorId = descriptor.value;

        const groups = await this.azdevClient.get<any>(`_apis/graph/groups?scopeDescriptor=${descriptorId}`, AzDevApiType.Graph);
        const allGroups = groups.value as GraphGroup[];

        const filteredGroup = allGroups.find((g) => g.origin === "vsts" && g.principalName === name);

        if (filteredGroup) {

            debug(filteredGroup);

        }

        return filteredGroup!;

    }

    public async getProjectGroups(projectId: string): Promise<GraphGroup[]> {

        const debug = this.debugLogger.extend(this.getProjectGroups.name);

        const descriptor = await this.azdevClient.get<GraphDescriptorResult>(`_apis/graph/descriptors/${projectId}`, AzDevApiType.Graph);
        const descriptorId = descriptor.value;

        const groups = await this.azdevClient.get<any>(`_apis/graph/groups?scopeDescriptor=${descriptorId}`, AzDevApiType.Graph);
        const allGroups = groups.value as GraphGroup[];

        const filteredGroups = allGroups.filter((g) => g.origin === "vsts");

        debug(`Found <${filteredGroups.length}> filtered groups`);

        return filteredGroups;

    }

    public async createProjectGroup(name: string, description: string, projectId: string): Promise<GraphGroup> {

        const debug = this.debugLogger.extend(this.createProjectGroup.name);

        const descriptor = await this.azdevClient.get<GraphDescriptorResult>(`_apis/graph/descriptors/${projectId}`, AzDevApiType.Graph);
        const descriptorId = descriptor.value;

        const body: any = {

            displayName: name,
            description,

        };

        const group = await this.azdevClient.post<GraphGroup>(`_apis/graph/groups?scopeDescriptor=${descriptorId}`, "5.1-preview.1", body, AzDevApiType.Graph);

        debug(group);

        return group;

    }

    public async getDefaultTemplate(): Promise<Process> {

        const allTemplates: Process[] = await this.coreApi.getProcesses();

        const defaultTemplate: Process = allTemplates.filter((p) => p.isDefault === true)[0];

        return defaultTemplate;

    }

}
