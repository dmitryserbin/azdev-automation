import Debug from "debug";

import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IGroupProvider, IIdentityPermission, INamespace, INamespaceAction, ISecurityIdentity, ISecurityPermission, ISubjectPermission } from "../interfaces/helpers/securityhelper";
import { ISecurityMapper } from "../interfaces/mappers/securitymapper";

export class SecurityMapper implements ISecurityMapper {

    private debugLogger: Debug.Debugger;

    constructor(debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

    }

    public mapSecurityIdentity(input: any): ISecurityIdentity {

        const debug = this.debugLogger.extend(this.mapSecurityIdentity.name);

        const result: ISecurityIdentity = {

            identityType: input.IdentityType,
            friendlyDisplayName: input.FriendlyDisplayName,
            displayName: input.DisplayName,
            subHeader: input.SubHeader,
            teamFoundationId: input.TeamFoundationId,
            entityId: input.EntityId,

        };

        return result;

    }

    public mapIdentityPermission(input: any): IIdentityPermission {

        const debug = this.debugLogger.extend(this.mapIdentityPermission.name);

        const result: IIdentityPermission = {

            currentTeamFoundationId: input.currentTeamFoundationId,
            descriptorIdentityType: input.descriptorIdentityType,
            descriptorIdentifier: input.descriptorIdentifier,
            permissions: [],

        };

        if (input.permissions) {

            for (const permission of input.permissions) {

                result.permissions.push({

                    permissionId: permission.permissionId,
                    explicitPermissionId: permission.explicitPermissionId,
                    originalPermissionId: permission.originalPermissionId,
                    permissionBit: permission.permissionBit,
                    namespaceId: permission.namespaceId,
                    displayName: permission.displayName,

                } as ISecurityPermission);

            }

        }

        return result;

    }

    public mapGroupProvider(input: any): IGroupProvider {

        const debug = this.debugLogger.extend(this.mapGroupProvider.name);

        const result: IGroupProvider = {

            identityDescriptor: input.identityDescriptor,
            subjectPermissions: [],

        };

        if (input.subjectPermissions) {

            for (const permission of input.subjectPermissions) {

                result.subjectPermissions.push({

                    displayName: permission.displayName,
                    namespaceId: permission.namespaceId,
                    token: permission.token,
                    bit: permission.bit,
                    canEdit: permission.canEdit,
                    effectivePermissionValue: permission.effectivePermissionValue,
                    explicitPermissionValue: permission.explicitPermissionValue,
                    isPermissionInherited: permission.isPermissionInherited,

                } as ISubjectPermission);

            }

        }

        return result;

    }

    public mapNamespace(input: any): INamespace {

        const debug = this.debugLogger.extend(this.mapNamespace.name);

        const result: INamespace = {

            namespaceId: input.namespaceId,
            name: input.name,
            displayName: input.displayName,
            separatorValue: input.separatorValue,
            writePermission: input.writePermission,
            readPermission: input.readPermission,
            dataspaceCategory: input.dataspaceCategory,
            actions: [],

        };

        if (input.actions) {

            for (const action of input.actions) {

                result.actions.push({

                    bit: action.bit,
                    name: action.name,
                    displayName: action.displayName,
                    namespaceId: action.namespaceId,

                } as INamespaceAction);

            }

        }

        return result;

    }

}
