import { Executor } from "../Executor";
import { AuthController } from "./auth.controller";
import { ChapterController } from "./chapter.controller";
import { CourseController } from "./course.controller";
import { MoveController } from "./move.controller";
import { UserProgressController } from "./userProgress.controller";
import { ContractAdminAuthController } from "./contract-admin-auth.controller";
import { IndexController } from "./index.controller";
import { CheckpointController } from "./checkpoint.controller";
import { AiAgentController } from "./ai-agent.controller";

export class Api {
    readonly authController: AuthController;
    readonly chapterController: ChapterController;
    readonly courseController: CourseController;
    readonly moveController: MoveController;
    readonly userProgressController: UserProgressController;
    readonly contractAdminAuthController: ContractAdminAuthController;
    readonly indexController: IndexController;
    readonly checkpointController: CheckpointController;
    readonly aiAgentController: AiAgentController;
    constructor(executor: Executor) {
        this.authController = new AuthController(executor);
        this.chapterController = new ChapterController(executor);
        this.courseController = new CourseController(executor);
        this.moveController = new MoveController(executor);
        this.userProgressController = new UserProgressController(executor);
        this.contractAdminAuthController = new ContractAdminAuthController(executor);
        this.indexController = new IndexController(executor);
        this.checkpointController = new CheckpointController(executor);
        this.aiAgentController = new AiAgentController(executor);
    }
}

