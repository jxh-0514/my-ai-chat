/**
 * 消息接口定义
 * 用于表示聊天中的单条消息
 */
export interface Message {
	/** 消息的唯一标识符 */
	id: string;
	/** 消息内容文本 */
	content: string;
	/** 消息角色：用户或AI助手 */
	role: "user" | "assistant";
	/** 消息创建时间 */
	timestamp: Date;
	/** 是否正在流式输出中（仅用于AI回复） */
	isStreaming?: boolean;
}

/**
 * 聊天会话接口定义
 * 用于表示一个完整的对话会话
 */
export interface ChatSession {
	/** 会话的唯一标识符 */
	id: string;
	/** 会话标题（通常是第一条消息的摘要） */
	title: string;
	/** 会话中的所有消息列表 */
	messages: Message[];
	/** 会话创建时间 */
	createdAt: Date;
	/** 会话最后更新时间 */
	updatedAt: Date;
}

/**
 * API响应接口定义
 * 用于处理非流式API响应
 */
export interface ApiResponse {
	/** 响应选择列表 */
	choices: Array<{
		/** 消息内容 */
		message: {
			/** 回复内容 */
			content: string;
			/** 回复角色 */
			role: string;
		};
	}>;
}

/**
 * 流式响应接口定义
 * 用于处理流式API响应（实时打字效果）
 */
export interface StreamResponse {
	/** 响应选择列表 */
	choices: Array<{
		/** 增量数据 */
		delta: {
			/** 增量内容（每次推送的文本片段） */
			content?: string;
			/** 角色信息 */
			role?: string;
		};
	}>;
}

/**
 * 文件上传接口定义
 * 用于处理用户上传的文件
 */
export interface FileUpload {
	/** 文件唯一标识符 */
	id: string;
	/** 文件名 */
	name: string;
	/** 文件MIME类型 */
	type: string;
	/** 文件大小（字节） */
	size: number;
	/** 文件内容（base64编码或文本） */
	content: string;
	/** 文件访问URL（可选） */
	url?: string;
}

/**
 * 聊天配置接口定义
 * 用于存储API相关配置信息
 */
export interface ChatConfig {
	/** API服务器地址 */
	apiUrl: string;
	/** API密钥 */
	apiKey: string;
	/** 使用的AI模型名称（可选，默认gpt-3.5-turbo） */
	model?: string;
	/** 温度参数，控制回复的随机性（0-1，可选） */
	temperature?: number;
	/** 最大token数量限制（可选） */
	maxTokens?: number;
}

/**
 * 应用状态接口定义
 * 用于管理整个应用的全局状态
 */
export interface AppState {
	/** 所有聊天会话列表 */
	sessions: ChatSession[];
	/** 当前活跃的会话ID */
	currentSessionId: string | null;
	/** 是否正在加载中 */
	isLoading: boolean;
	/** 错误信息（如果有） */
	error: string | null;
	/** 聊天配置 */
	config: ChatConfig;
	/** 主题模式：浅色或深色 */
	theme: "light" | "dark";
}
