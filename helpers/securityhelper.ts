import Debug from "debug";

import { GraphGroup } from "azure-devops-node-api/interfaces/GraphInterfaces";

import { AzDevApiType, IAzDevClient } from "../interfaces/azdevclient";
import { PermissionType } from "../interfaces/configurationreader";
import { IDebugLogger } from "../interfaces/debuglogger";
import { IGraphIdentity } from "../interfaces/graphhelper";
import { IIdentityPermission, INamespace, INamespaceAction, ISecurityHelper, ISecurityIdentity, ISecurityPermission } from "../interfaces/securityhelper";
import { ISecurityMapper } from "../interfaces/securitymapper";

export class SecurityHelper implements ISecurityHelper {

    private azdevClient: IAzDevClient;
    private debugLogger: Debug.Debugger;
    private mapper: ISecurityMapper;

    constructor(azdevClient: IAzDevClient, debugLogger: IDebugLogger, mapper: ISecurityMapper) {

        this.debugLogger = debugLogger.create(this.constructor.name);
        this.mapper = mapper;

        this.azdevClient = azdevClient;

    }

    public async getGroupIdentity(projectName: string, group: GraphGroup): Promise<string> {

        const debug = this.debugLogger.extend("getGroupIdentity");

        const apiVersion: string = "5.1-preview.1";
        const providerId: string = "ms.vss-admin-web.org-admin-groups-permissions-pivot-data-provider"

        const body: any = {

            contributionIds: [
                providerId,
            ],
            dataProviderContext: {
                properties: {
                    sourcePage: {
                        routeValues: {
                            project: projectName,
                        },
                    },
                    subjectDescriptor: group.descriptor,
                },
            },

        };

        const response: any = await this.azdevClient.post<any>(`_apis/Contribution/HierarchyQuery`, apiVersion, body, AzDevApiType.Core);
        const provider: any = response.dataProviders[providerId];

        if (!provider) {

            throw new Error(`Group <${group.displayName}> provider <${providerId}> not found`);

        }

        const descriptor: string = provider.identityDescriptor;

        if (!descriptor) {

            throw new Error(`Group <${group.displayName}> identity descriptor not found`);

        }

        debug(descriptor);

        return descriptor;

    }

    public async getExplicitIdentities(projectId: string, permissionSetId: string, permissionSetToken: string): Promise<ISecurityIdentity[]> {

        const debug = this.debugLogger.extend("getExplicitIdentities");

        const apiVersion: string = "5";

        const result: ISecurityIdentity[] = [];

        const response: any = await this.azdevClient.get<any>(`${projectId}/_api/_security/ReadExplicitIdentitiesJson?__v=${apiVersion}&permissionSetId=${permissionSetId}&permissionSetToken=${permissionSetToken}`, AzDevApiType.Core);
        const identities: any[] = response.identities;

        for (const identity of identities) {

            const mappedIdentity: ISecurityIdentity = this.mapper.mapSecurityIdentity(identity);

            result.push(mappedIdentity);

        }

        debug(`Found <${result.length}> explicit identities`);

        return result;
    }

    public async addIdentityToPermission(projectId: string, identity: IGraphIdentity): Promise<ISecurityIdentity> {

        const debug = this.debugLogger.extend("addIdentityToPermission");

        const apiVersion: string = "5";

        const existingUsersJson: string[] = [ identity.localId! ];
        const newUsersJson: string[] = [];

        // Target API expects JSON string values
        const body = {

            existingUsersJson: JSON.stringify(existingUsersJson),
            newUsersJson: JSON.stringify(newUsersJson),

        };

        const response: any = await this.azdevClient.post<any>(`${projectId}/_api/_security/AddIdentityForPermissions?__v=${apiVersion}`, "", body, AzDevApiType.Core);
        const addedIdentity: any = response.AddedIdentity;

        const result: ISecurityIdentity = this.mapper.mapSecurityIdentity(addedIdentity);

        debug(result);

        return result;
    }

    public async getIdentityPermission(projectId: string, identity: ISecurityIdentity, permissionSetId: string, permissionSetToken: string): Promise<IIdentityPermission> {

        const debug = this.debugLogger.extend("getIdentityPermission");

        const apiVersion: string = "5";

        const response: any = await this.azdevClient.get<any>(`${projectId}/_api/_security/DisplayPermissions?__v=${apiVersion}&tfid=${identity.teamFoundationId}&permissionSetId=${permissionSetId}&permissionSetToken=${permissionSetToken}`, AzDevApiType.Core);

        const result: IIdentityPermission = this.mapper.mapIdentityPermission(response);

        if (result) {

            debug(`Found <${result.permissions.length}> identity <${result.currentTeamFoundationId}> (${result.descriptorIdentityType}) permissions`);

        }

        return result;

    }

    public async setGroupAccessControl(projectId: string, identity: string, action: INamespaceAction, type: PermissionType): Promise<any> {

        const debug = this.debugLogger.extend("setGroupAccessControl");

        const permissionsApiVersion: string = "5.0";
        const accessControlApiVersion: string = "5.1-preview.1";

        let result: any = {};

        const token: string = `$PROJECT:vstfs:///Classification/TeamProject/${projectId}:`;

        const entry: any = {

            allow: 0,
            deny: 0,
            descriptor: identity,
            extendedInfo: {
                effectiveAllow: 0,
                effectiveDeny: 0,
                inheritedAllow: 0,
                inheritedDeny: 0,
            },

        };

        switch (type) {

            case PermissionType.Allow: {

                entry.allow = entry.extendedInfo.effectiveAllow = entry.extendedInfo.inheritedAllow = action.bit;

                break;

            }

            case PermissionType.Deny: {

                entry.deny = entry.extendedInfo.effectiveDeny = entry.extendedInfo.inheritedDeny = action.bit;

                break;

            }

            case PermissionType.NotSet: {

                break;

            }

            default: {

                throw new Error(`Permission type <${type}> not implemeted`);

            }

        }

        if (type === PermissionType.NotSet) {

            result = await this.azdevClient.delete<any>(`_apis/Permissions/${action.namespaceId}/${action.bit}?descriptor=${entry.descriptor}&token=${token}`, permissionsApiVersion, AzDevApiType.Core);

        } else {

            const body: any = {

                accessControlEntries: [ entry ],
                token,
                merge: true,

            };

            result = await this.azdevClient.post<any>(`_apis/AccessControlEntries/${action.namespaceId}`, accessControlApiVersion, body, AzDevApiType.Core);

        }

        debug(result);

        return result;

    }

    public async setIdentityAccessControl(token: string, identity: IIdentityPermission, permission: ISecurityPermission, type: PermissionType): Promise<any> {

        const debug = this.debugLogger.extend("setIdentityAccessControl");

        const permissionsApiVersion: string = "5.0";
        const accessControlApiVersion: string = "5.1-preview.1";

        let result: any = {};

        const entry = {
            allow: 0,
            deny: 0,
            descriptor: `${identity.descriptorIdentityType};${identity.descriptorIdentifier}`,
            extendedInfo: {
                effectiveAllow: 0,
                effectiveDeny: 0,
                inheritedAllow: 0,
                inheritedDeny: 0,
            },
        };

        switch (type) {

            case PermissionType.Allow: {

                entry.allow = entry.extendedInfo.effectiveAllow = entry.extendedInfo.inheritedAllow = permission.permissionBit;

                break;

            }

            case PermissionType.Deny: {

                entry.deny = entry.extendedInfo.effectiveDeny = entry.extendedInfo.inheritedDeny = permission.permissionBit;

                break;

            }

            case PermissionType.NotSet: {

                break;

            }

            default: {

                throw new Error(`Permission type <${type}> not implemeted`);

            }

        }

        if (type === PermissionType.NotSet) {

            result = await this.azdevClient.delete<any>(`_apis/Permissions/${permission.namespaceId}/${permission.permissionBit}?descriptor=${entry.descriptor}&token=${token}`, permissionsApiVersion, AzDevApiType.Core);

        } else {

            const body: any = {

                accessControlEntries: [ entry ],
                token,
                merge: true,

            };

            result = await this.azdevClient.post<any>(`_apis/AccessControlEntries/${permission.namespaceId}`, accessControlApiVersion, body, AzDevApiType.Core);

        }

        debug(result);

        return result;

    }

    public async getNamespace(name: string, actionFilter?: string): Promise<INamespace> {

        const debug = this.debugLogger.extend("getNamespace");

        const response: any = await this.azdevClient.get<any>(`_apis/securitynamespaces`, AzDevApiType.Core);
        const allNamespaces: any[] = response.value;

        if (!allNamespaces) {

            throw new Error("No namespaces found");

        }

        const namespaces: any[] = allNamespaces.filter((i) => i.name === name);

        let namespace: any;

        // Apply namespace action filter
        if (actionFilter) {

            namespace = namespaces.filter((i: any) => i.actions.some((a: any) => a.displayName === actionFilter))[0];

        } else {

            namespace = namespaces[0];

        }

        if (!namespace) {

            throw new Error(`Namespace <${name}> not found`);

        }

        const mappedNamespace: INamespace = this.mapper.mapNamespace(namespace);

        debug(`Found <${mappedNamespace.name}> (${mappedNamespace.namespaceId}) namespace with <${mappedNamespace.actions.length}> actions`);

        return mappedNamespace;

    }

}
