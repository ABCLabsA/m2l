import { AxiosInstance } from "axios";
import { Executor } from "../Executor";
import { ChapterDto } from "../ApiType";
import ApiResponse from "../common";

export class ChapterController {
    executor: Executor;
    constructor(executor: Executor) {
        this.executor = executor;
    }

    async getChapterById(id: string): Promise<ApiResponse<ChapterDto>> {
        return this.executor({
            uri: `/api/chapters/${id}`,
            method: 'GET'
        });
    }

    async getAllChapters(): Promise<ApiResponse<ChapterDto[]>> {
        return this.executor({
            uri: '/api/chapters/',
            method: 'GET'
        });
    }
    
    
}