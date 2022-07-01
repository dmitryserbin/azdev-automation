import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

import { IAzDevClient } from "../../common/iazdevclient";
import { IWorkHelper } from "../../helpers/iworkhelper";
import { WorkHelper } from "../../helpers/workhelper";
import { ILogger } from "../../loggers/ilogger";

const azdevClientMock = TypeMoq.Mock.ofType<IAzDevClient>();

const loggerMock = TypeMoq.Mock.ofType<ILogger>();

const projectOne: TeamProject = {

    name: "MyProjectOne",
    id: "1",

};

describe("WorkHelper", () => {

    const workHelper: IWorkHelper = new WorkHelper(azdevClientMock.target, loggerMock.target);

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
