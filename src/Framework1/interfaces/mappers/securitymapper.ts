import { IGroupProvider, IIdentityPermission, INamespace, ISecurityIdentity } from "../helpers/securityhelper";

export interface ISecurityMapper {

    mapSecurityIdentity(input: any): ISecurityIdentity;
    mapIdentityPermission(input: any): IIdentityPermission;
    mapGroupProvider(input: any): IGroupProvider;
    mapNamespace(input: any): INamespace;

}
