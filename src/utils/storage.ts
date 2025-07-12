// 导入类型定义
import type { ChatSession, ChatConfig } from "../types";

/**
 * 本地存储的键名常量
 * 使用常量避免拼写错误，便于维护
 */
const STORAGE_KEYS = {
	/** 聊天会话列表的存储键 */
	SESSIONS: "ai-chat-sessions",
	/** 配置信息的存储键 */
	CONFIG: "ai-chat-config",
	/** 当前会话ID的存储键 */
	CURRENT_SESSION: "ai-chat-current-session",
	/** 主题设置的存储键 */
	THEME: "ai-chat-theme",
} as const;

/**
 * 本地存储工具对象
 * 提供统一的数据存储和读取接口
 */
export const storage = {
	/**
	 * 获取所有聊天会话
	 * @returns 聊天会话数组，如果没有数据或出错则返回空数组
	 */
	getSessions(): ChatSession[] {
		try {
			// 从localStorage获取会话数据
			const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
			if (!data) return []; // 如果没有数据，返回空数组

			const sessions = JSON.parse(data);
			// 将日期字符串转换回Date对象（JSON序列化会将Date转为字符串）
			return sessions.map((session: any) => ({
				...session,
				createdAt: new Date(session.createdAt), // 恢复创建时间
				updatedAt: new Date(session.updatedAt), // 恢复更新时间
				messages: session.messages.map((msg: any) => ({
					...msg,
					timestamp: new Date(msg.timestamp), // 恢复消息时间戳
				})),
			}));
		} catch (error) {
			console.error("加载会话数据时出错:", error);
			return []; // 出错时返回空数组
		}
	},

	/**
	 * 保存所有聊天会话到本地存储
	 * @param sessions 要保存的会话数组
	 */
	saveSessions(sessions: ChatSession[]): void {
		try {
			// 将会话数据序列化并保存到localStorage
			localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
		} catch (error) {
			console.error("保存会话数据时出错:", error);
		}
	},

	// Config
	getConfig(): Partial<ChatConfig> {
		try {
			const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
			return data ? JSON.parse(data) : {};
		} catch (error) {
			console.error("Error loading config:", error);
			return {};
		}
	},

	saveConfig(config: Partial<ChatConfig>): void {
		try {
			localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
		} catch (error) {
			console.error("Error saving config:", error);
		}
	},

	// Current session
	getCurrentSessionId(): string | null {
		return localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
	},

	setCurrentSessionId(sessionId: string | null): void {
		if (sessionId) {
			localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, sessionId);
		} else {
			localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
		}
	},

	// Theme
	getTheme(): "light" | "dark" {
		const theme = localStorage.getItem(STORAGE_KEYS.THEME);
		return (theme as "light" | "dark") || "dark";
	},

	setTheme(theme: "light" | "dark"): void {
		localStorage.setItem(STORAGE_KEYS.THEME, theme);
	},

	// Clear all data
	clearAll(): void {
		Object.values(STORAGE_KEYS).forEach((key) => {
			localStorage.removeItem(key);
		});
	},
};
