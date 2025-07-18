import { AxiosInstance } from "axios";
import { Executor } from "../Executor";
import ApiResponse from "../common";
import { UserProgressDto } from "../ApiType";


export class UserProgressController {
    executor: Executor;
    constructor(executor: Executor) {
        this.executor = executor;
    }

    
    async getUserProgress(courseId: string): Promise<ApiResponse<UserProgressDto>> {
        return this.executor({
            uri: `/api/progress/${courseId}`,
            method: 'GET'
        });
    }

    async update(courseId: string, chapterId: string): Promise<ApiResponse<null>> {
        return this.executor({
            uri: `/api/progress/update`,
            method: 'POST',
            body: {
                courseId,
                chapterId
            }
        });
    }

    async finish(courseId: string, chapterId: string): Promise<ApiResponse<null>> {
        return this.executor({
            uri: `/api/progress/finish`,
            method: 'POST',
            body: {
                courseId,
                chapterId
            }
        });
    }


    
}