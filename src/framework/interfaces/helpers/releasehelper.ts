import { Release, ReleaseDefinition } from "azure-devops-node-api/interfaces/ReleaseInterfaces";
import { TaskDefinition } from "azure-devops-node-api/interfaces/TaskAgentInterfaces";

export interface IReleaseHelper {

    findDefinitionsWithArtifact(projectName: string, artifactName: string, artifactType: string): Promise<ReleaseDefinition[]>;
    findDefinitionsWithTasks(name: string, projectName: string, tasks: TaskDefinition[]): Promise<ReleaseDefinition[]>;
    findDefinitionReleasesWithTasks(definitionId: number, projectName: string, tasks: TaskDefinition[]): Promise<Release[]>;
    removeDefinitionTasks(definition: ReleaseDefinition, tasks: TaskDefinition[]): Promise<ReleaseDefinition>;
    updateDefinitionTasks(definition: ReleaseDefinition, tasks: TaskDefinition[], taskParameters: { [name: string]: any }, parametersFilter: { [name: string]: any }): Promise<ReleaseDefinition>;
    updateReleaseTasks(release: Release, tasks: TaskDefinition[], taskParameters: { [name: string]: any }, parametersFilter: { [name: string]: any }): Promise<Release>;
    removeDefinitionArtifact(definition: ReleaseDefinition, artifactName: string, artifactType: string): Promise<ReleaseDefinition>;
    updateDefinition(definition: ReleaseDefinition, projectName: string): Promise<void>;
    updateRelease(release: Release, projectName: string): Promise<void>;

}
