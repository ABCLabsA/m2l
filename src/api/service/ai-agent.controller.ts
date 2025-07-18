import { Executor } from "../Executor";
import ApiResponse from "../common";
import { AiAgentSessionDto, AiAgentResponseDto, AiAgentUsageDto, AiAgentUsageLogDto, AssistantQuestionDto, AssistantErrorDto } from "../ApiType";

export class AiAgentController {
    executor: Executor;
    constructor(executor: Executor) {
        this.executor = executor;
    }

    // AI会话创建（非流式响应）
    async createSession(question: string): Promise<ApiResponse<AiAgentResponseDto>> {
        return this.executor({
            uri: '/api/ai-agent/session',
            method: 'POST',
            body: {
                question
            } as AiAgentSessionDto
        });
    }

    // 兼容旧的方法名
    async createSessionSync(question: string): Promise<ApiResponse<AiAgentResponseDto>> {
        return this.createSession(question);
    }

    // 助手提示方法（非流式响应）
    async assistantQuestion(question: string): Promise<ApiResponse<AiAgentResponseDto>> {
        return this.executor({
            uri: '/api/ai-agent/assistant-question',
            method: 'POST',
            body: {
                question
            } as AssistantQuestionDto
        });
    }

    // 错误分析方法（非流式响应）
    async assistantError(question: string, errorMsg: string): Promise<ApiResponse<AiAgentResponseDto>> {
        return this.executor({
            uri: '/api/ai-agent/assistant-error',
            method: 'POST',
            body: {
                question,
                errorMsg
            } as AssistantErrorDto
        });
    }
}