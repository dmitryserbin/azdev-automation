import Debug from "debug";
import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { VsoClient } from "azure-devops-node-api/VsoClient";
import { RestClient } from "typed-rest-client";
import { AzDevClient } from "../../common/azdevclient";
import { AzDevApiType, IAzDevClient } from "../../interfaces/common/azdevclient";
import { IDebugLogger } from "../../interfaces/common/debuglogger";

const vsoClientMock = TypeMoq.Mock.ofType<VsoClient>();
const restClient = TypeMoq.Mock.ofType<RestClient>();

const debuggerMock = TypeMoq.Mock.ofType<Debug.Debugger>();
const debugLoggerMock = TypeMoq.Mock.ofType<IDebugLogger>();
debugLoggerMock.setup((x) => x.create(TypeMoq.It.isAnyString())).returns(() => debuggerMock.target);
debuggerMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debuggerMock.target);

vsoClientMock.setup((x) => x.restClient).returns(() => restClient.target);
vsoClientMock.setup((x) => x.basePath).returns(() => "MyAccount");

describe("AzDevClient", () => {

    const azdevClient: IAzDevClient = new AzDevClient(vsoClientMock.target.restClient, AzDevApiType.Core, vsoClientMock.target.basePath, debugLoggerMock.target);

    it("Should make GET request", async () => {

        // Arrange
        restClient.setup((x) => x.get(TypeMoq.It.isAnyString())).returns(() => Promise.resolve( { result: "OK", statusCode: 200 } as any ));

        // Act
        const result = await azdevClient.get<any>("_apis/get");

        // Assert
        chai.expect(result).eq("OK");

    });

    it("Should make POST request", async () => {

        // Arrange
        restClient.setup((x) => x.create(TypeMoq.It.isAnyString(), TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => Promise.resolve( { result: "OK", statusCode: 200 } as any ));

        // Act
        const result = await azdevClient.post<any>("_apis/post", TypeMoq.It.isAnyString());

        // Assert
        chai.expect(result).eq("OK");

    });

    it("Should make PATCH request", async () => {

        // Arrange
        restClient.setup((x) => x.update(TypeMoq.It.isAnyString(), TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => Promise.resolve( { result: "OK", statusCode: 200 } as any ));

        // Act
        const result = await azdevClient.patch<any>("_apis/patch", TypeMoq.It.isAnyString());

        // Assert
        chai.expect(result).eq("OK");

    });

    it("Should make PUT request", async () => {

        // Arrange
        restClient.setup((x) => x.replace(TypeMoq.It.isAnyString(), TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => Promise.resolve( { result: "OK", statusCode: 200 } as any ));

        // Act
        const result = await azdevClient.put<any>("_apis/put", TypeMoq.It.isAnyString());

        // Assert
        chai.expect(result).eq("OK");

    });

    it("Should make DELETE request", async () => {

        // Arrange
        restClient.setup((x) => x.del(TypeMoq.It.isAnyString(), TypeMoq.It.isAny())).returns(() => Promise.resolve( { result: "OK", statusCode: 200 } as any ));

        // Act
        const result = await azdevClient.delete<any>("_apis/delete", TypeMoq.It.isAnyString());

        // Assert
        chai.expect(result).eq("OK");

    });

});
