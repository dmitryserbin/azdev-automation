import { IIdentityPermission, INamespace, ISecurityIdentity, IGroupProvider } from "../helpers/securityhelper";

export interface ISecurityMapper {

    mapSecurityIdentity(input: any): ISecurityIdentity;
    mapIdentityPermission(input: any): IIdentityPermission;
    mapGroupProvider(input: any): IGroupProvider;
    mapNamespace(input: any): INamespace;

}
