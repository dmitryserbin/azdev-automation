import { ReleaseDefinition } from "azure-devops-node-api/interfaces/ReleaseInterfaces";
import { TaskDefinition } from "azure-devops-node-api/interfaces/TaskAgentInterfaces";

export interface IReleaseHelper {

    findDefinitionsWithArtifact(projectName: string, artifactName: string, artifactType: string): Promise<ReleaseDefinition[]>;
    findDefinitionsWithTasks(name: string, projectName: string, tasks: TaskDefinition[]): Promise<ReleaseDefinition[]>;
    removeDefinitionTasks(definition: ReleaseDefinition, tasks: TaskDefinition[]): Promise<ReleaseDefinition>;
    updateDefinitionTasks(definition: ReleaseDefinition, tasks: TaskDefinition[], taskParameters: { [name: string]: any }): Promise<ReleaseDefinition>;
    removeDefinitionArtifact(definition: ReleaseDefinition, artifactName: string, artifactType: string): Promise<ReleaseDefinition>;
    updateDefinition(definition: ReleaseDefinition, projectName: string): Promise<void>;

}
