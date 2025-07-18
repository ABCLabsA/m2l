import { Executor } from "../Executor";
import ApiResponse from "../common";
import { CourseBadgeResponseDto } from "../dto/index.dto";

export class IndexController {

    private executor: Executor; 
    constructor(executor: Executor) {
        this.executor = executor;
    }

    async courseBadge(): Promise<ApiResponse<CourseBadgeResponseDto[]>> {
        return this.executor({
            uri: "/api/index/course-badge",
            method: "GET"
        });
    }


}