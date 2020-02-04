import Debug from "debug";
import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { GraphGroup, GraphMember, GraphMembership } from "azure-devops-node-api/interfaces/GraphInterfaces";

import { GraphHelper } from "../../helpers/graphhelper";
import { IAzDevClient } from "../../interfaces/common/azdevclient";
import { IDebugLogger } from "../../interfaces/common/debuglogger";
import { IGraphHelper, IGraphIdentity } from "../../interfaces/helpers/graphhelper";
import { IHelper } from "../../interfaces/common/helper";

const userIdentityOne: IGraphIdentity = {

    displayName: "MyAdUser@domain.com",
    entityType: "User",
    subjectDescriptor: "1",

};

const groupIdentityOne: IGraphIdentity = {

    displayName: "MyAdGroup",
    entityType: "Group",
    subjectDescriptor: "2",

};

const groupOne: GraphGroup = {

    principalName: "MyGroup",

};

const graphMemberMock: TypeMoq.IMock<GraphMember> = TypeMoq.Mock.ofType<GraphMember>();
const graphMembershipMock: TypeMoq.IMock<GraphMembership> = TypeMoq.Mock.ofType<GraphMembership>();

const azdevClientMock = TypeMoq.Mock.ofType<IAzDevClient>();

const debuggerMock = TypeMoq.Mock.ofType<Debug.Debugger>();
const debugLoggerMock = TypeMoq.Mock.ofType<IDebugLogger>();
debugLoggerMock.setup((x) => x.create(TypeMoq.It.isAnyString())).returns(() => debuggerMock.target);
debuggerMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debuggerMock.target);

const helperMock = TypeMoq.Mock.ofType<IHelper>();
helperMock.setup((x) => x.wait(TypeMoq.It.isAnyNumber(), TypeMoq.It.isAnyNumber())).returns(() => Promise.resolve());

describe("GraphHelper", () => {

    const graphHelper: IGraphHelper = new GraphHelper(azdevClientMock.target, debugLoggerMock.target, helperMock.target);

    it("Should find user identity", async () => {

        // Arrange
        azdevClientMock.setup((x) => x.post(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString(), TypeMoq.It.isAny())).returns(() => Promise.resolve({ results: [ { identities: [ userIdentityOne ] } ] }));

        // Act
        const result: IGraphIdentity = await graphHelper.findIdentity(userIdentityOne.displayName!);

        // Assert
        chai.expect(result).not.eq(null);
        chai.expect(result.entityType).eq(userIdentityOne.entityType);
        chai.expect(result.displayName).eq(userIdentityOne.displayName);

    });

    it("Should find group identity", async () => {

        // Arrange
        azdevClientMock.setup((x) => x.post(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString(), TypeMoq.It.isAny())).returns(() => Promise.resolve({ results: [ { identities: [ groupIdentityOne ] } ] }));

        // Act
        const result: IGraphIdentity = await graphHelper.findIdentity(groupIdentityOne.displayName!);

        // Assert
        chai.expect(result).not.eq(null);
        chai.expect(result.entityType).eq(groupIdentityOne.entityType);
        chai.expect(result.displayName).eq(groupIdentityOne.displayName);

    });

    it("Should get identity membership", async () => {

        // Arrange
        azdevClientMock.setup((x) => x.get(TypeMoq.It.isAnyString(), TypeMoq.It.isAny())).returns(() => Promise.resolve(graphMembershipMock.target));

        // Act
        const result: GraphMembership = await graphHelper.getIdentityMembership(groupOne, userIdentityOne);

        // Assert
        chai.expect(result).not.eq(null);

    });

    it("Should add identity membership", async () => {

        // Arrange
        azdevClientMock.setup((x) => x.post(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString(), TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => Promise.resolve(graphMemberMock.target));
        azdevClientMock.setup((x) => x.get(TypeMoq.It.isAnyString(), TypeMoq.It.isAny())).returns(() => Promise.resolve({ value: [ graphMembershipMock.target ]}));

        // Act
        const result: GraphMembership = await graphHelper.addIdentityMembership(groupOne, userIdentityOne);

        // Assert
        chai.expect(result).not.eq(null);

    });

});
