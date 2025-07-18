import { AxiosInstance } from "axios";
import { Executor } from "../Executor";
import { CourseDetailDto, CourseDto, CourseTypeDto } from "../ApiType";
import ApiResponse from "../common";

export class CourseController {
    executor: Executor;
    constructor(executor: Executor) {
        this.executor = executor;
    }

    async getAllCourses(typeId?: string): Promise<ApiResponse<CourseDto[]>> {
        return this.executor({
            uri: typeId ? `/api/courses?typeId=${typeId}` : '/api/courses',
            method: 'GET'
        });
    }

    async buyCourse(id: string): Promise<ApiResponse<CourseDto>> {
        return this.executor({
            uri: `/api/courses/buy/${id}`,
            method: 'GET'
        });
    }

    async getPrivateCourses(): Promise<ApiResponse<CourseDto[]>> {
        return this.executor({
            uri: '/api/courses/private-courses',
            method: 'GET'
        });
    }

    async getCourseTypes(): Promise<ApiResponse<CourseTypeDto[]>> {
        return this.executor({
            uri: '/api/courses/types',
            method: 'GET'
        });
    }

    async getCourseById(id: string): Promise<ApiResponse<CourseDetailDto>> {
        return this.executor({
            uri: `/api/courses/${id}`,
            method: 'GET'
        });
    }
    
}