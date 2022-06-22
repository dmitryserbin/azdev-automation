import Debug from "debug";
import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { IDebugLogger } from "../../interfaces/common/debuglogger";
import { IIdentityPermission, ISecurityIdentity } from "../../interfaces/helpers/securityhelper";
import { ISecurityMapper } from "../../interfaces/mappers/securitymapper";
import { SecurityMapper } from "../../mappers/securitymapper";

const debuggerMock = TypeMoq.Mock.ofType<Debug.Debugger>();
const debugLoggerMock = TypeMoq.Mock.ofType<IDebugLogger>();
debugLoggerMock.setup((x) => x.create(TypeMoq.It.isAnyString())).returns(() => debuggerMock.target);
debuggerMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debuggerMock.target);

describe("SecurityMapper", () => {

    const identityOne: any = {

        IdentityType: "group",
        FriendlyDisplayName: "Identity One",
        DisplayName: "Identity One",
        SubHeader: "Header",
        TeamFoundationId: "1",
        EntityId: "1",

    };

    const permissionOne: any = {

        currentTeamFoundationId: "1",
        descriptorIdentityType: "Identity Type",
        descriptorIdentifier: "1",
        permissions: [
            {
                displayName: "Permission One",
                permissionBit: "1",
                namespaceId: "1",
            },
        ],

    };

    const securityMapper: ISecurityMapper = new SecurityMapper(debugLoggerMock.target);

    it("Should map ISecurityIdentity object", async () => {

        // Act
        const result: ISecurityIdentity = securityMapper.mapSecurityIdentity(identityOne);

        // Assert
        chai.expect(result).not.eq(null);
        chai.expect(result.displayName).eq(identityOne.FriendlyDisplayName);

    });

    it("Should map IIdentityPermission object", async () => {

        // Act
        const result: IIdentityPermission = securityMapper.mapIdentityPermission(permissionOne);

        // Assert
        chai.expect(result).not.eq(null);
        chai.expect(result.currentTeamFoundationId).eq(permissionOne.currentTeamFoundationId);
        chai.expect(result.permissions.length).eq(permissionOne.permissions.length);

    });

});
