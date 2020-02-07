import Debug from "debug";

import { GraphGroup, GraphMembership, GraphMember } from "azure-devops-node-api/interfaces/GraphInterfaces";

import { AzDevApiType, IAzDevClient } from "../interfaces/common/azdevclient";
import { PermissionType, IPermission } from "../interfaces/readers/configurationreader";
import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IIdentityPermission, INamespace, ISecurityHelper, ISecurityIdentity, ISecurityPermission, IGroupProvider, ISubjectPermission, IGraphIdentity } from "../interfaces/helpers/securityhelper";
import { ISecurityMapper } from "../interfaces/mappers/securitymapper";
import { IHelper } from "../interfaces/common/helper";

export class SecurityHelper implements ISecurityHelper {

    private azdevClient: IAzDevClient;
    private debugLogger: Debug.Debugger;
    private helper: IHelper;
    private mapper: ISecurityMapper;

    constructor(azdevClient: IAzDevClient, debugLogger: IDebugLogger, helper: IHelper, mapper: ISecurityMapper) {

        this.debugLogger = debugLogger.create(this.constructor.name);
        this.helper = helper;
        this.mapper = mapper;

        this.azdevClient = azdevClient;

    }

    public async findIdentity(name: string): Promise<IGraphIdentity> {

        const debug = this.debugLogger.extend("findIdentity");

        debug(`Attempting to find <${name}> identity`);

        let targetIdentity: IGraphIdentity;

        const searchRequest: any = {
            query: name,
            identityTypes: [
                "user",
                "group",
            ],
            operationScopes: [
                "ims",
                "source",
            ],
            properties: [
                "DisplayName",
                "IsMru",
                "ScopeName",
                "SamAccountName",
                "Active",
                "SubjectDescriptor",
                "SignInAddress",
                "Surname",
                "Description",
            ],
            options: {
                MinResults: 10,
                MaxResults: 10,
            },
        };

        // Narrow filter for user identities
        if (/[\w-]+@([\w-]+\.)+[\w-]+/.test(name)) {

            searchRequest.identityTypes = [ "user" ];

        }

        const result = await this.azdevClient.post<any>(`_apis/IdentityPicker/Identities`, "5.2-preview.1", searchRequest);

        if (result.results.length > 0) {

            if (result.results[0].identities.length > 1) {

                debug(`Found <${result.results[0].identities.length}> identities matching <${name}> name filter`);

            }

            // Get target identity matching name filter
            // Use displayName for users OR samAccountName for groups
            targetIdentity = result.results[0].identities.filter((i: IGraphIdentity) =>
                new RegExp([ i.displayName!, i.samAccountName].join("|"), "i").test(name))[0];

            debug(targetIdentity!);

        }

        return targetIdentity!;

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

    public async getGroupProvider(id: string, projectName: string, group: GraphGroup): Promise<IGroupProvider> {

        const debug = this.debugLogger.extend("getGroupProvider");

        const apiVersion: string = "5.1-preview.1";

        const body: any = {

            contributionIds: [
                id,
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
        const provider: any = response.dataProviders[id];

        if (!provider) {

            throw new Error(`Group <${group.displayName}> provider <${id}> not found`);

        }

        const mappedProvider: IGroupProvider = this.mapper.mapGroupProvider(provider);

        debug(mappedProvider);

        return mappedProvider;

    }

    public async getIdentityMembership(group: GraphGroup, identity: IGraphIdentity): Promise<GraphMembership> {

        const debug = this.debugLogger.extend("getIdentityMembership");

        debug(`Retrieving <${identity.displayName}> identity group <${group.principalName}> membership`);

        let membership: GraphMembership;

        if (identity.subjectDescriptor) {

            membership = await this.azdevClient.get<GraphMembership>(`_apis/Graph/Memberships/${identity.subjectDescriptor}/${group.descriptor}`, AzDevApiType.Graph);

            if (membership) {

                debug(membership);

            }

        }

        return membership!;
    }

    public async addIdentityMembership(group: GraphGroup, identity: IGraphIdentity): Promise<GraphMembership> {

        const debug = this.debugLogger.extend("addIdentityMembership");

        debug(`Adding <${identity.displayName}> identity to <${group.principalName}> group membership`);

        const body: any = {

            origin: "",
            originId: identity.originId,
            storageKey: "",

        };

        let member: GraphMember;
        let membership: GraphMembership;

        switch (identity.entityType) {

            case "User": {

                body.origin = identity.originDirectory;
                body.storageKey = identity.localId;

                member = await this.azdevClient.post<GraphMember>(`_apis/Graph/Users?groupDescriptors=${group.descriptor}`, "5.2-preview.1", body, AzDevApiType.Graph);

                break;

            } case "Group": {

                member = await this.azdevClient.post<GraphMember>(`_apis/Graph/Groups?groupDescriptors=${group.descriptor}`, "5.2-preview.1", body, AzDevApiType.Graph);

                break;

            }

        }

        if (member!) {

            const result = await this.azdevClient.get<any>(`_apis/Graph/Memberships/${member!.descriptor}`, AzDevApiType.Graph);

            membership = result.value[0];

        }

        debug(membership!);

        return membership!;

    }

    public async getGroupMemberships(group: GraphGroup): Promise<GraphMembership[]> {

        const debug = this.debugLogger.extend("getGroupMemberships");

        const result = await this.azdevClient.get<any>(`_apis/Graph/Memberships/${group.descriptor}?direction=1`, AzDevApiType.Graph);

        const memberships: GraphMembership[] = result.value as GraphMembership[];

        debug(`Found <${memberships.length}> group <${group.principalName}> memberships`);

        return memberships;

    }

    public async removeGroupMembership(group: GraphGroup, member: GraphMembership): Promise<void> {

        const debug = this.debugLogger.extend("removeGroupMembership");

        debug(`Removing <${member.memberDescriptor}> principal from <${group.principalName}> group membership`);

        const result = await this.azdevClient.delete(`_apis/Graph/Memberships/${member.memberDescriptor}/${group.descriptor}`, "5.2-preview.1", AzDevApiType.Graph);

    }

    public async addGroupMemberships(group: GraphGroup, members: string[]): Promise<GraphMembership[]> {

        const debug = this.debugLogger.extend("addGroupMemberships");

        debug(`Adding <${members.length}> group <${group.principalName}> memberships`);

        const validMemberships: GraphMembership[] = [];

        await Promise.all(members.map(async (name) => {

            // Slow down parallel calls to address
            // Intermittent API connectivity issues
            await this.helper.wait(500, 3000);

            const targetIdentity: IGraphIdentity = await this.findIdentity(name);

            if (!targetIdentity) {

                throw new Error(`Identity <${name}> not found`);

            }

            const existingMembership: GraphMembership = await this.getIdentityMembership(group, targetIdentity);

            if (existingMembership) {

                debug(`Identity <${name}> already <${group.principalName}> group member`);

                validMemberships.push(existingMembership);

                return;

            }

            const updatedMembership: GraphMembership = await this.addIdentityMembership(group, targetIdentity);

            debug(`Principal <${name}> group <${group.principalName}> member added`);

            validMemberships.push(updatedMembership);

        }));

        return validMemberships;

    }

    public async removeGroupMemberships(group: GraphGroup, memberships: GraphMembership[]): Promise<void> {

        const debug = this.debugLogger.extend("removeGroupMemberships");

        debug(`Removing <${memberships.length}> group <${group.principalName}> memberships`);

        // Slow down parallel calls to address
        // Intermittent API connectivity issues
        await this.helper.wait(500, 3000);

        await Promise.all(memberships.map(async (membership) => {

            await this.removeGroupMembership(group, membership);

        }));

    }

    public async getObsoleteGroupMemberships(group: GraphGroup, validMemberships: GraphMembership[]): Promise<GraphMembership[]> {

        const debug = this.debugLogger.extend("getObsoleteGroupMemberships");

        debug(`Retrieving obsolete group <${group.principalName}> memberships`);

        const validDescriptors: string[] = validMemberships.map((v) => v.memberDescriptor!);

        debug(`Group <${group.principalName}> should have <${validDescriptors.length}> valid memberships`);

        const currentMemberships: GraphMembership[] = await this.getGroupMemberships(group);
        const obsoleteMemberships: GraphMembership[] = currentMemberships.filter((m) => !validDescriptors.includes(m.memberDescriptor!));

        debug(`Found <${obsoleteMemberships.length}> obsolete <${group.principalName}> group memberships`);

        if (obsoleteMemberships.length > 0) {

            debug(obsoleteMemberships.map((m) => m.memberDescriptor!));

        }

        return obsoleteMemberships;

    }

    public async updateGroupMembers(members: string[], group: GraphGroup): Promise<void> {

        const debug = this.debugLogger.extend("updateGroupMembers");

        let validMemberships: GraphMembership[] = [];

        // Adding new memberships
        if (members.length > 0) {

            validMemberships = await this.addGroupMemberships(group, members);

        }

        const obsoleteMemberships: GraphMembership[] = await this.getObsoleteGroupMemberships(group, validMemberships);

        // Removing obsolete memberships
        if (obsoleteMemberships.length > 0) {

            await this.removeGroupMemberships(group, obsoleteMemberships);

        }

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

    public async setGroupAccessControl(identity: string, permission: ISubjectPermission, type: PermissionType): Promise<any> {

        const debug = this.debugLogger.extend("setGroupAccessControl");

        const permissionsApiVersion: string = "5.0";
        const accessControlApiVersion: string = "5.1-preview.1";

        let result: any = {};

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

                entry.allow = entry.extendedInfo.effectiveAllow = entry.extendedInfo.inheritedAllow = permission.bit;

                break;

            }

            case PermissionType.Deny: {

                entry.deny = entry.extendedInfo.effectiveDeny = entry.extendedInfo.inheritedDeny = permission.bit;

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

            result = await this.azdevClient.delete<any>(`_apis/Permissions/${permission.namespaceId}/${permission.bit}?descriptor=${entry.descriptor}&token=${permission.token}`, permissionsApiVersion, AzDevApiType.Core);

        } else {

            const body: any = {

                accessControlEntries: [ entry ],
                token: permission.token,
                merge: true,

            };

            result = await this.azdevClient.post<any>(`_apis/AccessControlEntries/${permission.namespaceId}`, accessControlApiVersion, body, AzDevApiType.Core);

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

    public async updateGroupPermissions(projectName: string, group: GraphGroup, permissions: IPermission[]): Promise<void> {

        const debug = this.debugLogger.extend("updateGroupPermissions");

        const groupProvider: IGroupProvider = await this.getGroupProvider("ms.vss-admin-web.org-admin-groups-permissions-pivot-data-provider", projectName, group);

        for (const permission of permissions) {

            const targetPermission: ISubjectPermission = groupProvider.subjectPermissions.filter((i) => i.displayName === permission.name)[0];

            if (!targetPermission) {

                throw new Error(`Permission <${permission.name}> not found`);

            }

            // Skip updating identical explicit permission
            if (this.isSubjectPermissionEqual(permission, targetPermission)) {

                debug(`Permission <${permission.name}> (${permission.type}) is identical`);

                continue;

            }

            debug(`Configuring <${permission.name}> (${permission.type}) permission`);

            const type: PermissionType = this.getPermissionType(permission);

            const updatedPermission: any = await this.setGroupAccessControl(groupProvider.identityDescriptor, targetPermission, type);

        }

    }

    public async updateIdentityPermissions(projectId: string, identity: ISecurityIdentity, permissions: IPermission[], permissionSetId: string, permissionSetToken: string): Promise<void> {

        const debug = this.debugLogger.extend("updateIdentityPermissions");

        const identityPermission: IIdentityPermission = await this.getIdentityPermission(projectId, identity, permissionSetId, permissionSetToken);

        for (const permission of permissions) {

            const targetPermission: ISecurityPermission = identityPermission.permissions.filter((i) => i.displayName.trim() === permission.name)[0];

            if (!targetPermission) {

                throw new Error(`Permission <${permission.name}> not found`);

            }

            // Skip updating identical permission
            if (this.isSecurityPermissionEqual(permission, targetPermission)) {

                debug(`Permission <${permission.name}> (${permission.type}) is identical`);

                continue;

            }

            debug(`Configuring <${permission.name}> (${permission.type}) permission`);

            const type: PermissionType = this.getPermissionType(permission);

            const updatedPermission: any = await this.setIdentityAccessControl(permissionSetToken, identityPermission, targetPermission, type);

        }

    }

    private isSecurityPermissionEqual(permission: IPermission, targetPermission: ISecurityPermission): boolean {

        const type: PermissionType = this.getPermissionType(permission);

        const result: boolean = targetPermission.permissionId === type && targetPermission.explicitPermissionId === type;

        return result;

    }

    private isSubjectPermissionEqual(permission: IPermission, targetPermission: ISubjectPermission): boolean {

        const type: PermissionType = this.getPermissionType(permission);

        const result: boolean = targetPermission.explicitPermissionValue === type;

        return result;

    }

    private getPermissionType(permission: IPermission): PermissionType {

        // Some magic to address JSON enum parsing issue
        // To be fixed with configuration reader refactoring
        const type: PermissionType = PermissionType[permission.type.toString() as keyof typeof PermissionType];

        return type;

    }

}
