// React Hooks导入
import { useState, useEffect, useCallback, useRef } from "react";
// UUID生成库，用于创建唯一标识符
import { v4 as uuidv4 } from "uuid";
// 类型定义导入
import type { Message, ChatSession, ChatConfig } from "../types";
// 本地存储工具导入
import { storage } from "../utils/storage";
// API服务导入
import { ChatAPI } from "../services/api";

/**
 * 聊天功能的自定义Hook
 * 管理聊天会话、消息发送、本地存储等核心功能
 * @returns 聊天相关的状态和方法
 */
export function useChat() {
	// ===== 状态管理 =====
	/** 所有聊天会话的列表 */
	const [sessions, setSessions] = useState<ChatSession[]>([]);
	/** 当前活跃会话的ID */
	const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
	/** 是否正在发送消息或等待回复 */
	const [isLoading, setIsLoading] = useState(false);
	/** 错误信息，如果有的话 */
	const [error, setError] = useState<string | null>(null);
	/** API配置信息 */
	const [config, setConfig] = useState<ChatConfig>({
		apiUrl: "https://ai.huan666.de", // 默认API地址
		apiKey: "", // API密钥，需要用户在设置中配置
		model: "gpt-4o-mini", // 默认使用的AI模型
		temperature: 0.7, // 回复的随机性（0-1）
		maxTokens: 2000, // 最大token限制
	});

	/** API服务实例，用于发送请求 */
	const [api, setApi] = useState<ChatAPI | null>(null);
	/** 标记是否已完成初始化，避免初始化时保存空数据 */
	const [isInitialized, setIsInitialized] = useState(false);

	// 组件挂载时从本地存储加载数据（使用ref确保只执行一次）
	const hasInitialized = useRef(false);
	useEffect(() => {
		// 防止重复初始化
		if (hasInitialized.current) {
			console.log("跳过重复初始化");
			return;
		}

		console.log("开始初始化数据加载...");
		hasInitialized.current = true;

		const savedSessions = storage.getSessions();
		const savedConfig = storage.getConfig();
		const savedCurrentSessionId = storage.getCurrentSessionId();

		console.log("加载数据:", { savedSessions, savedConfig, savedCurrentSessionId });

		setSessions(savedSessions);
		setCurrentSessionId(savedCurrentSessionId);
		setConfig((prev) => ({ ...prev, ...savedConfig }));

		// 不再自动创建默认会话，改为按需创建
		// 如果没有保存的当前会话ID且有会话存在，选择第一个会话
		if (!savedCurrentSessionId && savedSessions.length > 0) {
			setCurrentSessionId(savedSessions[0].id);
		}

		// 标记初始化完成
		setIsInitialized(true);
		console.log("初始化完成");
	}, []);

	// 保存会话数据到本地存储（使用防抖，避免频繁保存）
	useEffect(() => {
		if (!isInitialized || !hasInitialized.current) {
			console.log("跳过保存，尚未初始化");
			return;
		}

		// 避免保存空数据
		if (sessions.length === 0) {
			console.log("跳过保存，会话数据为空");
			return;
		}

		console.log("准备保存会话数据，设置防抖延时...");
		const saveTimer = setTimeout(() => {
			console.log("执行保存会话数据:", sessions);
			storage.saveSessions(sessions);
		}, 1000); // 1秒防抖延时

		// 清理函数，取消之前的定时器
		return () => {
			console.log("取消之前的保存定时器");
			clearTimeout(saveTimer);
		};
	}, [sessions, isInitialized]);

	// 保存配置到本地存储（使用防抖）
	useEffect(() => {
		if (!isInitialized) return;

		console.log("准备保存配置，设置防抖延时...");
		const configTimer = setTimeout(() => {
			console.log("执行保存配置:", config);
			storage.saveConfig(config);
		}, 500); // 配置变化500ms后保存

		return () => {
			clearTimeout(configTimer);
		};
	}, [config, isInitialized]);

	// 保存当前会话ID到本地存储
	useEffect(() => {
		storage.setCurrentSessionId(currentSessionId);
	}, [currentSessionId]);

	// 页面卸载时强制保存数据
	useEffect(() => {
		const handleBeforeUnload = () => {
			if (isInitialized) {
				console.log("页面卸载，强制保存数据");
				storage.saveSessions(sessions);
				storage.saveConfig(config);
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [sessions, config, isInitialized]);

	// 配置变化时初始化API实例
	useEffect(() => {
		if (config.apiKey) {
			setApi(new ChatAPI(config));
		}
	}, [config]);

	// 会话列表变化时保存到本地存储
	useEffect(() => {
		storage.saveSessions(sessions);
	}, [sessions]);

	// 当前会话ID变化时保存到本地存储
	useEffect(() => {
		storage.setCurrentSessionId(currentSessionId);
	}, [currentSessionId]);

	// 配置变化时保存到本地存储
	useEffect(() => {
		storage.saveConfig(config);
	}, [config]);

	/** 获取当前活跃的会话对象 */
	const currentSession = sessions.find((s) => s.id === currentSessionId) || null;

	/**
	 * 创建新的聊天会话
	 * @returns 新创建的会话对象
	 */
	const createNewSession = useCallback(() => {
		const newSession: ChatSession = {
			id: uuidv4(),
			title: "新对话",
			messages: [],
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		setSessions((prev) => [newSession, ...prev]);
		setCurrentSessionId(newSession.id);
		return newSession;
	}, []);

	/**
	 * 删除指定的聊天会话
	 * @param sessionId 要删除的会话ID
	 */
	const deleteSession = useCallback(
		(sessionId: string) => {
			setSessions((prev) => prev.filter((s) => s.id !== sessionId));
			if (currentSessionId === sessionId) {
				const remainingSessions = sessions.filter((s) => s.id !== sessionId);
				setCurrentSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
			}
		},
		[currentSessionId, sessions]
	);

	/**
	 * 更新会话标题
	 * @param sessionId 会话ID
	 * @param title 新标题
	 */
	const updateSessionTitle = useCallback((sessionId: string, title: string) => {
		setSessions((prev) => prev.map((session) => (session.id === sessionId ? { ...session, title, updatedAt: new Date() } : session)));
	}, []);

	/**
	 * 向指定会话添加消息
	 * @param sessionId 会话ID
	 * @param message 消息内容（不包含id和timestamp）
	 */
	const addMessage = useCallback((sessionId: string, message: Omit<Message, "id" | "timestamp">) => {
		const newMessage: Message = {
			...message,
			id: uuidv4(),
			timestamp: new Date(),
		};

		setSessions((prev) =>
			prev.map((session) =>
				session.id === sessionId
					? {
							...session,
							messages: [...session.messages, newMessage],
							updatedAt: new Date(),
					  }
					: session
			)
		);

		return newMessage;
	}, []);

	/**
	 * 更新指定消息的内容
	 * @param sessionId 会话ID
	 * @param messageId 消息ID
	 * @param updates 要更新的消息属性
	 */
	const updateMessage = useCallback((sessionId: string, messageId: string, updates: Partial<Message>) => {
		setSessions((prev) =>
			prev.map((session) =>
				session.id === sessionId
					? {
							...session,
							messages: session.messages.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg)),
							updatedAt: new Date(),
					  }
					: session
			)
		);
	}, []);

	/**
	 * 发送消息到AI并获取回复
	 * @param content 用户输入的消息内容
	 * @param files 可选的文件附件
	 */
	const sendMessage = useCallback(
		async (content: string, files?: File[]) => {
			if (!api || !config.apiKey) {
				setError("请先配置API密钥");
				return;
			}

			let session = currentSession;
			if (!session) {
				session = createNewSession();
			}

			// 处理文件内容
			let messageContent = content;
			if (files && files.length > 0) {
				const fileDescriptions = files.map((file) => `[文件: ${file.name} (${file.size} bytes)]`).join("\n");
				messageContent = `${content}\n\n附件:\n${fileDescriptions}`;
			}

			// 添加用户消息
			const userMessage = addMessage(session.id, {
				content: messageContent,
				role: "user",
			});

			// 为新会话自动生成标题
			if (session.messages.length === 0) {
				const title = content.length > 30 ? content.substring(0, 30) + "..." : content;
				updateSessionTitle(session.id, title);
			}

			// 添加AI助手消息占位符
			const assistantMessage = addMessage(session.id, {
				content: "",
				role: "assistant",
				isStreaming: true,
			});

			setIsLoading(true);
			setError(null);

			try {
				const messages = [...session.messages, userMessage];
				let fullResponse = "";

				// 使用流式API获取回复
				for await (const chunk of api.sendMessageStream(messages)) {
					fullResponse += chunk;
					updateMessage(session.id, assistantMessage.id, {
						content: fullResponse,
						isStreaming: true,
					});
				}

				// 标记流式传输完成
				updateMessage(session.id, assistantMessage.id, {
					content: fullResponse,
					isStreaming: false,
				});
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : "发送消息失败";
				setError(errorMessage);

				// 更新AI助手消息显示错误信息
				updateMessage(session.id, assistantMessage.id, {
					content: `错误: ${errorMessage}`,
					isStreaming: false,
				});
			} finally {
				setIsLoading(false);
			}
		},
		[api, config.apiKey, currentSession, createNewSession, addMessage, updateSessionTitle, updateMessage]
	);

	/**
	 * 清除错误信息
	 */
	const clearError = useCallback(() => setError(null), []);

	// ===== 返回值 =====
	return {
		// 状态数据
		sessions, // 所有会话列表
		currentSession, // 当前活跃会话
		currentSessionId, // 当前会话ID
		isLoading, // 是否正在加载
		error, // 错误信息
		config, // API配置

		// 配置方法
		setConfig: (newConfig: Partial<ChatConfig>) => {
			setConfig((prev) => ({ ...prev, ...newConfig }));
		},

		// 会话管理方法
		createNewSession, // 创建新会话
		deleteSession, // 删除会话
		updateSessionTitle, // 更新会话标题
		setCurrentSessionId, // 设置当前会话ID

		// 消息相关方法
		sendMessage, // 发送消息
		clearError, // 清除错误
	};
}
