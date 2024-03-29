import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { IIdentityPermission, ISecurityIdentity } from "../../helpers/isecurityhelper";
import { ISecurityMapper } from "../../mappers/isecuritymapper";
import { SecurityMapper } from "../../mappers/securitymapper";
import { ILogger } from "../../loggers/ilogger";
import { IDebug } from "../../loggers/idebug";

const loggerMock = TypeMoq.Mock.ofType<ILogger>();
const debugMock = TypeMoq.Mock.ofType<IDebug>();

loggerMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugMock.object);
debugMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugMock.object);

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

    const securityMapper: ISecurityMapper = new SecurityMapper(loggerMock.target);

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
