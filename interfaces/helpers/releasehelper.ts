import { ReleaseDefinition } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

export interface IReleaseHelper {

    findDefinitionsWithArtifact(projectName: string, artifactName: string, artifactType: string): Promise<ReleaseDefinition[]>;
    findDefinitionsWithTasks(projectName: string, taskIDs: string[]): Promise<ReleaseDefinition[]>;
    removeDefinitionArtifact(definition: ReleaseDefinition, artifactName: string, artifactType: string): Promise<ReleaseDefinition>;
    removeDefinitionTasks(definition: ReleaseDefinition, taskIDs: string[]): Promise<ReleaseDefinition>;
    updateDefinitionTasks(definition: ReleaseDefinition, taskIDs: string[], taskParameters: { [name: string]: any }): Promise<ReleaseDefinition>;
    updateDefinition(definition: ReleaseDefinition, projectName: string): Promise<void>;

}
