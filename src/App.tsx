// React核心库导入
import React, { useState, useEffect } from "react";
// 自定义聊天Hook导入
import { useChat } from "./hooks/useChat";
// 本地存储工具导入
import { storage } from "./utils/storage";
// 组件导入
import { Sidebar } from "./components/Sidebar";
import { ChatArea } from "./components/ChatArea";
import { InputArea } from "./components/InputArea";
import { useToast } from "./components/Toast";

/**
 * 主应用组件
 * 整合所有功能模块，管理全局状态和布局
 */
function App() {
	// ===== 本地状态管理 =====
	/** 主题模式：深色或浅色 */
	const [theme, setTheme] = useState<"light" | "dark">("dark");
	/** 侧边栏是否打开（主要用于移动端） */
	const [sidebarOpen, setSidebarOpen] = useState(false);

	// ===== Toast通知系统 =====
	const { showToast, ToastContainer } = useToast();

	// ===== 聊天功能Hook =====
	// 从useChat Hook中解构出所有需要的状态和方法
	const {
		sessions, // 所有会话列表
		currentSession, // 当前活跃的会话
		currentSessionId, // 当前会话ID
		isLoading, // 是否正在加载
		error, // 错误信息
		config, // API配置
		setConfig, // 更新配置的方法
		createNewSession, // 创建新会话的方法
		deleteSession, // 删除会话的方法
		updateSessionTitle, // 更新会话标题的方法
		setCurrentSessionId, // 切换当前会话的方法
		sendMessage, // 发送消息的方法
		clearError, // 清除错误的方法
	} = useChat();

	// ===== 副作用处理 =====
	/**
	 * 组件挂载时从本地存储加载主题设置
	 */
	useEffect(() => {
		const savedTheme = storage.getTheme(); // 获取保存的主题
		setTheme(savedTheme); // 应用主题
	}, []); // 空依赖数组，只在组件挂载时执行一次

	/**
	 * 监听主题变化并应用到DOM
	 */
	useEffect(() => {
		console.log("应用主题到DOM:", theme);
		if (theme === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
		// 保存主题到本地存储
		storage.setTheme(theme);
	}, [theme]);

	/**
	 * 主题变化时应用到DOM并保存到本地存储
	 */
	useEffect(() => {
		if (theme === "dark") {
			// 深色主题：添加dark类到html元素
			document.documentElement.classList.add("dark");
		} else {
			// 浅色主题：移除dark类
			document.documentElement.classList.remove("dark");
		}
		storage.setTheme(theme); // 保存主题设置到本地存储
	}, [theme]); // 依赖theme，主题变化时执行

	// ===== 事件处理函数 =====
	/**
	 * 切换主题模式（深色/浅色）
	 */
	const toggleTheme = () => {
		const newTheme = theme === "dark" ? "light" : "dark";
		console.log("切换主题:", theme, "->", newTheme);
		setTheme(newTheme);
	};

	/**
	 * 切换侧边栏显示状态（主要用于移动端）
	 */
	const toggleSidebar = () => {
		setSidebarOpen((prev) => !prev);
	};

	/**
	 * 处理发送消息的逻辑
	 * @param message 要发送的消息内容
	 */
	const handleSendMessage = async (message: string) => {
		// 检查是否已配置API密钥
		if (!config.apiKey) {
			showToast("请先在设置中配置API密钥", "warning");
			return;
		}

		// 清除之前的错误信息
		clearError();
		// 发送消息
		await sendMessage(message);
	};

	// ===== 组件渲染 =====
	return (
		<div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
			{/* 侧边栏组件 */}
			<Sidebar sessions={sessions} currentSessionId={currentSessionId} config={config} theme={theme} isOpen={sidebarOpen} onToggle={toggleSidebar} onNewSession={createNewSession} onSelectSession={setCurrentSessionId} onDeleteSession={deleteSession} onRenameSession={updateSessionTitle} onConfigChange={setConfig} onThemeToggle={toggleTheme} onShowToast={showToast} />

			{/* 主内容区域 */}
			<div className="flex flex-col flex-1 min-w-0">
				{/* 聊天显示区域 */}
				<ChatArea
					session={currentSession} // 传入当前会话
					isLoading={isLoading} // 传入加载状态
					onToggleSidebar={toggleSidebar} // 传入切换侧边栏的方法（移动端用）
					onSendMessage={handleSendMessage} // 传入发送消息的方法
					onShowToast={showToast} // 传入Toast通知方法
				/>

				{/* 消息输入区域 */}
				<InputArea
					onSendMessage={handleSendMessage} // 传入发送消息的处理方法
					isLoading={isLoading} // 传入加载状态
					disabled={!config.apiKey} // 根据是否有API密钥决定是否禁用
				/>

				{/* 错误信息显示 */}
				{error && (
					<div className="p-3 mx-4 mb-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
						<div className="flex items-center justify-between">
							<p className="text-sm text-red-700 dark:text-red-300">{error}</p>
							{/* 关闭错误信息的按钮 */}
							<button onClick={clearError} className="ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-300" title="关闭错误信息">
								×
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Toast通知容器 */}
			<ToastContainer />
		</div>
	);
}

export default App;
