import Debug from "debug";
import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

import { IAzDevClient } from "../../common/iazdevclient";
import { IDebugLogger } from "../../loggers/idebuglogger";
import { IWorkHelper } from "../../helpers/iworkhelper";
import { WorkHelper } from "../../helpers/workhelper";

const azdevClientMock = TypeMoq.Mock.ofType<IAzDevClient>();

const debuggerMock = TypeMoq.Mock.ofType<Debug.Debugger>();
const debugLoggerMock = TypeMoq.Mock.ofType<IDebugLogger>();
debugLoggerMock.setup((x) => x.create(TypeMoq.It.isAnyString())).returns(() => debuggerMock.target);
debuggerMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debuggerMock.target);

const projectOne: TeamProject = {

    name: "MyProjectOne",
    id: "1",

};

describe("WorkHelper", () => {

    const workHelper: IWorkHelper = new WorkHelper(azdevClientMock.target, debugLoggerMock.target);

    it("Should get node identifier", async () => {

        const areaNode = {

            structureType: "area",
            identifier: 1,

        };

        // Arrange
        azdevClientMock.setup((x) => x.get(TypeMoq.It.isAnyString(), TypeMoq.It.isAny())).returns(() => Promise.resolve({ value: [ areaNode ] }));

        // Act
        const result: string = await workHelper.getNodeIdentifier(projectOne.id!, "area");

        // Assert
        chai.expect(result).not.eq(null);
        chai.expect(result).eq(areaNode.identifier);

    });

});
