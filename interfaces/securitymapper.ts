import { IIdentityPermission, INamespace, ISecurityIdentity } from "./securityhelper";

export interface ISecurityMapper {

    mapSecurityIdentity(input: any): ISecurityIdentity;
    mapIdentityPermission(input: any): IIdentityPermission;
    mapNamespace(input: any): INamespace;

}
