import { api } from "../Api";
import { Executor } from "../Executor";

export class CheckpointController {
    executor: Executor;
    constructor(executor: Executor) {
        this.executor = executor;
    }
   async commitCheckpointAnswer(id: string, content: string) {
        const response = await this.executor({
            method: 'POST',
            uri: `/api/checkpoint/commit/${id}`,
            body: {
                content
            }
        });
        return response.data;
    }

    async checkPointIsPassed(id: string) {
        const response = await this.executor({
            method: 'GET',
            uri: `/api/checkpoint/checkUserPassPoint/${id}`
        });
        return response.data;
    }


}