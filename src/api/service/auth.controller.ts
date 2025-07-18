import { AxiosInstance } from "axios";
import { Executor } from "../Executor";
import ApiResponse from "../common";
import { TokenInfo } from "../ApiType";

export class AuthController {
    executor: Executor;
    constructor(executor: Executor) {
        this.executor = executor;
    }

    async login(walletAddress: string): Promise<ApiResponse<TokenInfo>> {
        return this.executor({
            uri: '/api/auth/login',
            method: 'POST',
            body: {
                walletAddress
            }
        });
    }
}