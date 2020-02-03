import { GraphGroup } from "azure-devops-node-api/interfaces/GraphInterfaces";

import { PermissionType, IPermission } from "./configurationreader";
import { IGraphIdentity } from "./graphhelper";

export interface ISecurityHelper {

    getNamespace(name: string, actionFilter?: string): Promise<INamespace>;
    getGroupProvider(id: string, projectName: string, group: GraphGroup): Promise<IGroupProvider>;
    getExplicitIdentities(projectId: string, permissionSetId: string, permissionSetToken: string): Promise<ISecurityIdentity[]>;
    addIdentityToPermission(projectId: string, identity: IGraphIdentity): Promise<ISecurityIdentity>;
    getIdentityPermission(projectId: string, identity: ISecurityIdentity, permissionSetId: string, permissionSetToken: string): Promise<IIdentityPermission>;
    setGroupAccessControl(identity: string, action: INamespaceAction, type: PermissionType): Promise<any>;
    setIdentityAccessControl(projectId: string, identity: IIdentityPermission, permission: ISecurityPermission, type: PermissionType): Promise<any>;
    updateGroupPermissions(projectName: string, group: GraphGroup, permissions: IPermission[]): Promise<void>;

}

export interface INamespace {

    namespaceId: string;
    name: string;
    displayName: string;
    separatorValue: string;
    writePermission: number;
    readPermission: number;
    dataspaceCategory: string;
    actions: INamespaceAction[];

}

export interface INamespaceAction {

    bit: number;
    name: string;
    displayName: string;
    namespaceId: string;

}

export interface IGroupProvider {

    identityDescriptor: string;
    subjectPermissions: ISubjectPermission[];

}

export interface ISubjectPermission {

    bit: number;
    name: string;
    displayName: string;
    namespaceId: string;
    token: string;
    canEdit: boolean;
    effectivePermissionValue?: number;
    explicitPermissionValue?: number;
    isPermissionInherited?: boolean;

}

export interface ISecurityIdentity {

    identityType: string;
    friendlyDisplayName: string;
    displayName: string;
    subHeader: string;
    teamFoundationId: string;
    entityId: string;

}

export interface IIdentityPermission {

    currentTeamFoundationId: string;
    descriptorIdentityType: string;
    descriptorIdentifier: string;
    permissions: ISecurityPermission[];

}

export interface ISecurityPermission {

    permissionId: number;
    explicitPermissionId: number;
    originalPermissionId: number;
    permissionBit: number;
    namespaceId: string;
    displayName: string;

}
