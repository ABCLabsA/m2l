import { AxiosInstance } from "axios";
import { Executor } from "../Executor";
import { CompileResponse } from "../ApiType";
import ApiResponse from "../common";

export class MoveController {
    executor: Executor;
    constructor(executor: Executor) {
        this.executor = executor;
    }

    async compile(code: string): Promise<ApiResponse<CompileResponse>> {
        return this.executor({
            uri: '/api/move/compile',
            method: 'POST',
            body: {
                code
            }
        });
    }
    
}