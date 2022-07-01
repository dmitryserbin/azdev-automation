import { IReleaseApi } from "azure-devops-node-api/ReleaseApi";
import { Artifact, DeployPhase, Release, ReleaseDefinition, ReleaseDefinitionEnvironment, ReleaseEnvironment, WorkflowTask } from "azure-devops-node-api/interfaces/ReleaseInterfaces";
import { TaskDefinition } from "azure-devops-node-api/interfaces/TaskAgentInterfaces";

import { IReleaseHelper } from "./ireleasehelper";
import { IDebug } from "../loggers/idebug";
import { ILogger } from "../loggers/ilogger";

export class ReleaseHelper implements IReleaseHelper {

    private debugLogger: IDebug;

    private releaseApi: IReleaseApi;

    constructor(releaseApi: IReleaseApi, logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

        this.releaseApi = releaseApi;

    }

    public async getDefinitions(projectName: string): Promise<ReleaseDefinition[]> {

        const debug = this.debugLogger.extend(this.getDefinitions.name);

        const result = await this.releaseApi.getReleaseDefinitions(projectName);

        debug(`Found <${projectName}> project <${result.length}> definition(s)`);

        return result;

    }

    public async findDefinitionsWithArtifact(projectName: string, artifactName: string, artifactType: string): Promise<ReleaseDefinition[]> {

        const debug = this.debugLogger.extend(this.findDefinitionsWithArtifact.name);

        const result: ReleaseDefinition[] = [];
        const projectDefinitions: ReleaseDefinition[] = await this.releaseApi.getReleaseDefinitions(projectName);

        debug(`Found <${projectName}> project <${projectDefinitions.length}> definition(s)`);

        for (const definitioin of projectDefinitions) {

            const targetDefinition: ReleaseDefinition = await this.releaseApi.getReleaseDefinition(projectName, definitioin.id!);

            const exists: boolean = targetDefinition.artifacts!.some((a) => a.alias === artifactName && a.type === artifactType);

            if (exists) {

                debug(`Artifact ${artifactName} found`);

                result.push(targetDefinition);

            }

        }

        debug(`Found <${result.length}> filtered definition(s)`);

        return result;

    }

    public async findDefinitionsWithTasks(name: string, projectName: string, tasks: TaskDefinition[]): Promise<ReleaseDefinition[]> {

        const debug = this.debugLogger.extend(this.findDefinitionsWithTasks.name);

        const result: ReleaseDefinition[] = [];
        const projectDefinitions: ReleaseDefinition[] = await this.releaseApi.getReleaseDefinitions(projectName, name);
        const taskIDs: string[] = tasks.map((t: TaskDefinition) => t.id!);

        debug(`Found <${projectName}> project <${projectDefinitions.length}> definition(s)`);

        await Promise.all(projectDefinitions.map(async (definition) => {

            const targetDefinition: ReleaseDefinition = await this.releaseApi.getReleaseDefinition(projectName, definition.id!);

            const taskExists: boolean = targetDefinition.environments!.some((e: ReleaseDefinitionEnvironment) =>
                e.deployPhases!.some((p: DeployPhase) => p.workflowTasks!.some((t: WorkflowTask) => taskIDs.some((i: string) => i === t.taskId))));

            if (taskExists) {

                debug("Task(s) mathing ID found");

                result.push(targetDefinition);

            }

        }));

        debug(`Found <${result.length}> filtered definition(s)`);

        return result;

    }

    public async findDefinitionReleasesWithTasks(definitionId: number, projectName: string, tasks: TaskDefinition[]): Promise<Release[]> {

        const debug = this.debugLogger.extend(this.findDefinitionReleasesWithTasks.name);

        const result: Release[] = [];
        const definitionReleases: Release[] = await this.releaseApi.getReleases(projectName, definitionId);
        const taskIDs: string[] = tasks.map((t: TaskDefinition) => t.id!);

        debug(`Found <${definitionId}> definition <${definitionReleases.length}> release(s)`);

        await Promise.all(definitionReleases.map(async (release) => {

            const targetRelease: Release = await this.releaseApi.getRelease(projectName, release.id!);

            const exists: boolean = targetRelease.environments!.some((e: ReleaseEnvironment) =>
                e.deployPhasesSnapshot!.some((p: DeployPhase) => p.workflowTasks!.some((t: WorkflowTask) => taskIDs.some((i: string) => i === t.taskId))));

            if (exists) {

                debug("Target task(s) found");

                result.push(targetRelease);

            }

        }));

        debug(`Found <${result.length}> filtered release(s)`);

        return result;

    }

    public async removeDefinitionTasks(definition: ReleaseDefinition, tasks: TaskDefinition[]): Promise<ReleaseDefinition> {

        const debug = this.debugLogger.extend(this.removeDefinitionTasks.name);

        const taskIDs: string[] = tasks.map((t) => t.id!);
        const removedTasks: string[] = [];

        for (const stage of definition.environments!) {

            for (const phase of stage.deployPhases!) {

                const updatedTasks: WorkflowTask[] = [];

                for (const task of phase.workflowTasks!) {

                    if (taskIDs.some((t) => t === task.taskId)) {

                        debug(`Removing <${stage.name}> stage <${task.name}> task`);

                        if (!removedTasks.includes(task.name!)) {

                            removedTasks.push(task.name!);

                        }

                        continue;

                    }

                    updatedTasks.push(task);

                }

                phase.workflowTasks = updatedTasks;

            }

        }

        if (removedTasks.length > 0) {

            definition.comment = `Remove ${removedTasks.join(", ")} task(s)`;

        }

        return definition;

    }

    public async updateDefinitionTasks(definition: ReleaseDefinition, tasks: TaskDefinition[], taskParameters: { [name: string]: any }, parametersFilter: { [name: string]: any }): Promise<ReleaseDefinition> {

        const debug = this.debugLogger.extend(this.updateDefinitionTasks.name);

        const updatedStages: string[] = [];

        for (const stage of definition.environments!) {

            for (const phase of stage.deployPhases!) {

                const stageTasks: WorkflowTask[] = [];

                for (let task of phase.workflowTasks!) {

                    debug(`Processing <${stage.name}> stage <${task.name}> task`);

                    const match: boolean = this.isTaskMatch(task, tasks, parametersFilter);

                    if (match) {

                        debug(`Updating <${stage.name}> stage <${task.name}> (${task.taskId}) task`);

                        task = this.updateTaskParameters(task, taskParameters);

                        if (!updatedStages.includes(stage.name!)) {

                            updatedStages.push(stage.name!);

                        }

                    }

                    stageTasks.push(task);

                }

                phase.workflowTasks = stageTasks;

            }

        }

        if (updatedStages.length > 0) {

            definition.comment = `Update <${updatedStages.join("|")}> stage(s) task parameters`;

        }

        return definition;

    }

    public async updateReleaseTasks(release: Release, tasks: TaskDefinition[], taskParameters: { [name: string]: any }, parametersFilter: { [name: string]: any }): Promise<Release> {

        const debug = this.debugLogger.extend(this.updateReleaseTasks.name);

        const updatedStages: string[] = [];

        for (const stage of release.environments!) {

            for (const phase of stage.deployPhasesSnapshot!) {

                const stageTasks: WorkflowTask[] = [];

                for (let task of phase.workflowTasks!) {

                    debug(`Processing <${stage.name}> stage <${task.name}> task`);

                    const match: boolean = this.isTaskMatch(task, tasks, parametersFilter);

                    if (match) {

                        debug(`Updating <${stage.name}> stage <${task.name}> (${task.taskId}) task`);

                        task = this.updateTaskParameters(task, taskParameters);

                        if (!updatedStages.includes(stage.name!)) {

                            updatedStages.push(stage.name!);

                        }

                    }

                    stageTasks.push(task);

                }

                phase.workflowTasks = stageTasks;

            }

        }

        if (updatedStages.length > 0) {

            release.comment = `Update <${updatedStages.join("|")}> stage(s) task parameters`;

        }

        return release;

    }

    public async removeDefinitionArtifact(definition: ReleaseDefinition, artifactName: string, artifactType: string): Promise<ReleaseDefinition> {

        const debug = this.debugLogger.extend(this.removeDefinitionArtifact.name);

        const updatedArtifacts: Artifact[] = [];

        for (const artifact of definition.artifacts!) {

            if (artifact.alias === artifactName && artifact.type === artifactType) {

                debug(`Removing <${artifact.alias}> type <${artifact.type}> artifact`);

                continue;

            }

            updatedArtifacts.push(artifact);

        }

        definition.artifacts = updatedArtifacts;
        definition.comment = `Remove <${artifactName}> artifact`;

        return definition;

    }

    public async updateDefinition(definition: ReleaseDefinition, projectName: string): Promise<void> {

        const debug = this.debugLogger.extend(this.updateDefinition.name);

        debug(`Updating <${projectName}> project <${definition.name}> definition`);

        await this.releaseApi.updateReleaseDefinition(definition, projectName);

    }

    public async updateRelease(release: Release, projectName: string): Promise<void> {

        const debug = this.debugLogger.extend(this.updateRelease.name);

        debug(`Updating <${release.releaseDefinition!.id}> definition <${release.name}> definition`);

        await this.releaseApi.updateRelease(release, projectName, release.id!);

    }

    private updateTaskParameters(task: WorkflowTask, parameters: { [name: string]: any }): WorkflowTask {

        const debug = this.debugLogger.extend(this.updateTaskParameters.name);

        for (const parameter of Object.keys(parameters)) {

            const value: string = parameters[parameter];

            if (Object.prototype.hasOwnProperty.call(task.inputs!, parameter)) {

                debug(`Updating existing <${parameter}:${value}> parameter`);

            } else {

                debug(`Adding new <${parameter}:${value}> parameter`);

            }

            task.inputs![parameter] = value;

        }

        return task;

    }

    private isTaskMatch(task: WorkflowTask, tasks: TaskDefinition[], filter: { [name: string]: any }): boolean {

        const debug = this.debugLogger.extend(this.isTaskMatch.name);

        const taskIDs: string[] = tasks.map((t) => t.id!);

        let taskMatch = false;

        if (Object.keys(filter).length > 0) {

            let totalMatches = 0;

            // Apply task parameter maching filter
            // When at least one parameter value maches
            for (const parameter of Object.keys(filter)) {

                const taskValue: string = task.inputs![parameter];
                const filterValue: string = filter[parameter];

                const matchExpression = new RegExp(`^${filterValue}$`);
                const parameterMatch: boolean = matchExpression.test(taskValue);

                if (parameterMatch) {

                    totalMatches++;

                    // Must match all task parameters
                    if (totalMatches === Object.keys(filter).length) {

                        debug(`Found maching <${matchExpression}> parameter(s) filter <${task.name}> task`);

                        taskMatch = true;

                    }

                }

            }

        } else {

            taskMatch = taskIDs.some((t: string) => t === task.taskId);

            if (taskMatch) {

                debug(`Found maching ID filter <${task.name}> task`);

            }

        }

        return taskMatch;

    }

}
