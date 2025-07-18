/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface LoginDto {
  /**
   * 钱包地址
   * @example "0x1234567890abcdef1234567890abcdef12345678"
   */
  walletAddress: string;
}

export interface UserDto {
  /** 用户ID */
  id: string;
  /**
   * 最后登录时间
   * @format date-time
   */
  lastLogin: string;
  /**
   * 创建时间
   * @format date-time
   */
  createdAt: string;
  /**
   * 更新时间
   * @format date-time
   */
  updatedAt: string;
  /** 链ID */
  chainId: number;
  /**
   * 首次登录时间
   * @format date-time
   */
  firstLogin: string;
  /** 是否已初始化 */
  isInitialized: boolean;
  /** 配置文件ID */
  profileId?: string;
  /** 钱包地址 */
  walletAddress: string;
  /** 购买的课程 */
  courseBuy?: string[];
}

export interface TokenInfo {
  /** JWT token */
  token: string;
  /** 用户信息 */
  user: UserDto;
}

export interface CourseTypeDto {
  /** 类型ID */
  id: string;
  /** 类型名称 */
  name: string;
  /** 类型描述 */
  description?: string;
}

export interface BaseCourseDto {
  /** 课程ID */
  id: string;
  /** 课程标题 */
  title: string;
  /** 课程描述 */
  description: string;
  /** 课程图片 */
  image?: string;
  /** 课程徽章图片 */
  badge?: string;
  /**
   * 创建时间
   * @format date-time
   */
  createdAt: string;
  /**
   * 更新时间
   * @format date-time
   */
  updatedAt: string;
  /** 课程价格 */
  price: number;
  /** 完成奖励 */
  finishReward: number;
  /** 课程类型ID */
  typeId?: string;
  /** 课程类型 */
  type?: CourseTypeDto;
  /** 课程长度 */
  courseLength?: number;
  /** 用户进度长度 */
  userProgressLength?: number;
  /** 用户是否已购买 */
  isBought?: boolean;
  /** 证书是否已发放 */
  certificateIssued?: boolean;
}

export interface UserProgressDto {
  /** 进度ID */
  id: string;
  /** 用户ID */
  userId: string;
  /** 课程ID */
  courseId: string;
  /** 章节ID */
  chapterId: string;
  /** 是否完成 */
  completed: boolean;
  /**
   * 完成时间
   * @format date-time
   */
  completedAt?: string;
  /**
   * 创建时间
   * @format date-time
   */
  createdAt: string;
  /**
   * 更新时间
   * @format date-time
   */
  updatedAt: string;
  /** 章节信息 */
  chapter?: ChapterDto;
}

export interface ChapterDto {
  /** 章节ID */
  id: string;
  /** 章节标题 */
  title: string;
  /** 章节描述 */
  description: string;
  /** 章节内容 */
  content?: string;
  /** 章节顺序 */
  order: number;
  /** 课程ID */
  courseId: string;
  /** 所属课程 */
  course?: BaseCourseDto;
  /** 下一章节ID */
  nextChapterId?: string;
  /** 下一章节 */
  nextChapter?: ChapterDto;
  /**
   * 创建时间
   * @format date-time
   */
  createdAt: string;
  /**
   * 更新时间
   * @format date-time
   */
  updatedAt: string;
  /** 章节类型 */
  type?: string;
  /** 用户进度 */
  progress?: UserProgressDto;
}

export interface CourseDto {
  /** 课程ID */
  id: string;
  /** 课程标题 */
  title: string;
  /** 课程描述 */
  description: string;
  /** 课程图片 */
  image?: string;
  /** 课程徽章图片 */
  badge?: string;
  /**
   * 创建时间
   * @format date-time
   */
  createdAt: string;
  /**
   * 更新时间
   * @format date-time
   */
  updatedAt: string;
  /** 课程价格 */
  price: number;
  /** 完成奖励 */
  finishReward: number;
  /** 课程类型ID */
  typeId?: string;
  /** 课程类型 */
  type?: CourseTypeDto;
  /** 课程长度 */
  courseLength?: number;
  /** 用户进度长度 */
  userProgressLength?: number;
  /** 用户是否已购买 */
  isBought?: boolean;
  /** 证书是否已发放 */
  certificateIssued?: boolean;
  /** 章节列表 */
  chapters?: ChapterDto[];
  /** 用户是否已购买 */
  userBrought?: boolean;
  /** 总章节数 */
  totalChapterLength?: number;
  /** 已学习章节数 */
  learnedChapterLength?: number;
}

export interface CourseDetailDto {
  /** 课程ID */
  id: string;
  /** 课程标题 */
  title: string;
  /** 课程描述 */
  description: string;
  /** 课程图片 */
  image?: string;
  /** 课程徽章图片 */
  badge?: string;
  /**
   * 创建时间
   * @format date-time
   */
  createdAt: string;
  /**
   * 更新时间
   * @format date-time
   */
  updatedAt: string;
  /** 课程价格 */
  price: number;
  /** 完成奖励 */
  finishReward: number;
  /** 课程类型ID */
  typeId?: string;
  /** 课程类型 */
  type?: CourseTypeDto;
  /** 课程长度 */
  courseLength?: number;
  /** 用户进度长度 */
  userProgressLength?: number;
  /** 用户是否已购买 */
  isBought?: boolean;
  /** 证书是否已发放 */
  certificateIssued?: boolean;
  /** 章节列表 */
  chapters?: ChapterDto[];
  /** 用户是否已购买 */
  userBrought?: boolean;
  /** 总章节数 */
  totalChapterLength?: number;
  /** 已学习章节数 */
  learnedChapterLength?: number;
  /** 用户进度 */
  userProgress?: string[];
  /** 用户是否已经完成课程 */
  isFinished?: boolean;
}

export interface CompileDto {
  /**
   * Move 代码
   * @example "module playground::hello {
   *     public fun hello() {
   *         // Your Move code here
   *     }
   * }"
   */
  code: string;
}

export type CompileResponse = object;

export interface SignRequestDto {
  /** 用户地址 */
  userAddress: string;
  /** 课程ID */
  courseId: string;
  /** 积分 */
  points: number;
}

export interface AdminSignResponseDto {
  /** nonce */
  nonce: string;
  /** publicKey */
  publicKey: string[];
}

export interface UpatdeCertificateDto {
  /** courseId */
  courseId: string;
}

export interface UpdateProgressDto {
  /** 章节ID */
  chapterId: string;
  /** 课程ID */
  courseId: string;
}

export interface AiAgentSessionDto {
  /** 用户问题 */
  question: string;
}

export interface AiAgentResponseDto {
  /** AI回复内容 */
  content: string;
  /** 会话ID */
  sessionId: string;
  /** token使用量 */
  tokenUsed?: number;
}

export interface AiAgentUsageDto {
  /** 今日使用次数 */
  todayUsage: number;
  /** 每日限制 */
  dailyLimit: number;
  /** 是否可以使用 */
  canUse: boolean;
}

export interface AiAgentUsageLogDto {
  /** 日志ID */
  id: string;
  /** 用户ID */
  userId: string;
  /** 用户查询 */
  userQuery: any;
  /** API响应 */
  apiResponse: any;
  /** 请求类型 */
  requestType?: string;
  /** 使用的token数量 */
  tokenUsed?: number;
  /** 请求持续时间 */
  duration?: number;
  /** 会话ID */
  sessionId?: string;
  /** 创建时间 */
  createdAt: string;
}

/** 助手问题DTO - 用于获取提示 */
export interface AssistantQuestionDto {
  /** 用户问题 */
  question: string;
}

/** 助手错误DTO - 用于错误分析 */
export interface AssistantErrorDto {
  /** 用户问题 */
  question: string;
  /** 错误信息 */
  errorMsg: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response.clone() as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Move to Learn API
 * @version 1.0
 * @contact
 *
 * Move to Learn 后端 API 文档
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * @description 通过钱包地址登录系统
     *
     * @tags auth
     * @name AuthControllerLogin
     * @summary 用户登录
     * @request POST:/api/auth/login
     */
    authControllerLogin: (data: LoginDto, params: RequestParams = {}) =>
      this.request<TokenInfo, void>({
        path: `/api/auth/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 获取课程列表，可按类型筛选
     *
     * @tags courses
     * @name CourseControllerGetAllCourses
     * @summary 获取所有课程
     * @request GET:/api/courses
     * @secure
     */
    courseControllerGetAllCourses: (
      query: {
        typeId: string;
        /** 课程类型 */
        type?: any;
      },
      params: RequestParams = {},
    ) =>
      this.request<CourseDto[], any>({
        path: `/api/courses`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description 购买指定课程
     *
     * @tags courses
     * @name CourseControllerBuyCourse
     * @summary 购买课程
     * @request GET:/api/courses/buy/{id}
     * @secure
     */
    courseControllerBuyCourse: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/courses/buy/${id}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description 获取当前用户购买的课程列表
     *
     * @tags courses
     * @name CourseControllerGetPrivateCourses
     * @summary 获取我的课程
     * @request GET:/api/courses/private-courses
     * @secure
     */
    courseControllerGetPrivateCourses: (params: RequestParams = {}) =>
      this.request<CourseDto[], any>({
        path: `/api/courses/private-courses`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description 获取所有课程类型列表
     *
     * @tags courses
     * @name CourseControllerGetCourseTypes
     * @summary 获取课程类型
     * @request GET:/api/courses/types
     * @secure
     */
    courseControllerGetCourseTypes: (params: RequestParams = {}) =>
      this.request<CourseTypeDto[], any>({
        path: `/api/courses/types`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description 根据ID获取课程详细信息
     *
     * @tags courses
     * @name CourseControllerGetCourseById
     * @summary 获取课程详情
     * @request GET:/api/courses/{id}
     * @secure
     */
    courseControllerGetCourseById: (id: string, params: RequestParams = {}) =>
      this.request<CourseDetailDto, void>({
        path: `/api/courses/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description 发放指定课程的证书
     *
     * @tags courses
     * @name CourseControllerIssueCertificate
     * @summary 发放证书
     * @request POST:/api/courses/issue-certificate
     * @secure
     */
    courseControllerIssueCertificate: (
      id: string,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/api/courses/issue-certificate`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description 获取所有章节列表
     *
     * @tags chapters
     * @name ChapterControllerGetAllChapters
     * @summary 获取所有章节
     * @request GET:/api/chapters
     * @secure
     */
    chapterControllerGetAllChapters: (params: RequestParams = {}) =>
      this.request<ChapterDto[], any>({
        path: `/api/chapters`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description 根据ID获取章节详细信息
     *
     * @tags chapters
     * @name ChapterControllerGetChapterById
     * @summary 获取章节详情
     * @request GET:/api/chapters/{id}
     * @secure
     */
    chapterControllerGetChapterById: (id: string, params: RequestParams = {}) =>
      this.request<ChapterDto, void>({
        path: `/api/chapters/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description 编译用户提交的 Move 代码
     *
     * @tags move
     * @name MoveControllerCompile
     * @summary 编译 Move 代码
     * @request POST:/api/move/compile
     */
    moveControllerCompile: (data: CompileDto, params: RequestParams = {}) =>
      this.request<CompileResponse, void>({
        path: `/api/move/compile`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 获取课程非重复的nonce
     *
     * @tags contract
     * @name ContractAdminAuthControllerGetNonceAndKey
     * @summary 获取课程非重复的nonce
     * @request POST:/api/contract/sign
     */
    contractAdminAuthControllerGetNonceAndKey: (
      data: SignRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<AdminSignResponseDto, any>({
        path: `/api/contract/sign`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 更新证书状态
     *
     * @tags contract
     * @name ContractAdminAuthControllerUpdateCertificate
     * @summary 更新证书状态
     * @request POST:/api/contract/update-certificate
     */
    contractAdminAuthControllerUpdateCertificate: (
      data: UpatdeCertificateDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/contract/update-certificate`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 根据课程ID获取当前用户的学习进度
     *
     * @tags progress
     * @name UserProgressControllerGetProgress
     * @summary 获取用户课程进度
     * @request GET:/api/progress/{courseId}
     * @secure
     */
    userProgressControllerGetProgress: (
      courseId: string,
      params: RequestParams = {},
    ) =>
      this.request<UserProgressDto, void>({
        path: `/api/progress/${courseId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description 更新用户的章节学习进度
     *
     * @tags progress
     * @name UserProgressControllerUpdateProgress
     * @summary 更新学习进度
     * @request POST:/api/progress/update
     * @secure
     */
    userProgressControllerUpdateProgress: (
      data: UpdateProgressDto,
      params: RequestParams = {},
    ) =>
      this.request<UserProgressDto, void>({
        path: `/api/progress/update`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 标记课程完成并发放证书
     *
     * @tags progress
     * @name UserProgressControllerFinishedCourse
     * @summary 完成课程
     * @request POST:/api/progress/finish
     * @secure
     */
    userProgressControllerFinishedCourse: (
      data: UpdateProgressDto,
      params: RequestParams = {},
    ) =>
      this.request<UserProgressDto, void>({
        path: `/api/progress/finish`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
