import { AdminSignResponseDto, SignRequestDto } from "../ApiType";
import ApiResponse from "../common";
import { Executor } from "../Executor";

export class ContractAdminAuthController {
    executor: Executor;

    constructor(executor: Executor) {
        this.executor = executor;
    }

    getNonce(SignRequestDto: SignRequestDto): Promise<ApiResponse<AdminSignResponseDto>> {
        return this.executor({
            uri: `/api/contract/sign`,
            method: 'POST',
            body: SignRequestDto,
        })
    }

    updateCertificate(courseId: string): Promise<ApiResponse<null>> {
        return this.executor({
            uri: `/api/contract/update-certificate`,
            method: 'POST',
            body: {
                courseId,
            }
        })
    }

}