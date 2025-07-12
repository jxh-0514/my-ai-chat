import React, { useState } from "react";
import { Plus, Settings, Moon, Sun, Menu, X } from "lucide-react";
import type { ChatSession, ChatConfig } from "../types";
import { SessionItem } from "./SessionItem";

interface SidebarProps {
	sessions: ChatSession[];
	currentSessionId: string | null;
	config: ChatConfig;
	theme: "light" | "dark";
	isOpen: boolean;
	onToggle: () => void;
	onNewSession: () => void;
	onSelectSession: (sessionId: string) => void;
	onDeleteSession: (sessionId: string) => void;
	onRenameSession: (sessionId: string, title: string) => void;
	onConfigChange: (config: Partial<ChatConfig>) => void;
	onThemeToggle: () => void;
	onShowToast?: (message: string, type?: "success" | "error" | "warning" | "info") => void;
}

export function Sidebar({ sessions, currentSessionId, config, theme, isOpen, onToggle, onNewSession, onSelectSession, onDeleteSession, onRenameSession, onConfigChange, onThemeToggle, onShowToast }: SidebarProps) {
	const [showSettings, setShowSettings] = useState(false);
	const [tempConfig, setTempConfig] = useState(config);

	const handleSaveConfig = () => {
		onConfigChange(tempConfig);
		setShowSettings(false);
	};

	const handleCancelConfig = () => {
		setTempConfig(config);
		setShowSettings(false);
	};

	// 智能新建聊天逻辑
	const handleNewSession = () => {
		const currentSession = sessions.find((s) => s.id === currentSessionId);
		// 如果当前会话为空（没有消息），就不创建新会话，直接使用当前会话
		if (currentSession && currentSession.messages.length === 0) {
			return; // 当前会话已经是空的，不需要创建新会话
		}
		// 否则创建新会话
		onNewSession();
	};

	return (
		<>
			{/* Mobile overlay */}
			{isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onToggle} />}

			{/* Sidebar */}
			<div
				className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
        w-64 bg-gray-50 dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-700
        transform transition-all duration-300 ease-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        flex flex-col
      `}>
				{/* 新建对话按钮 */}
				<div className="p-3">
					<button onClick={handleNewSession} className="w-full flex items-center gap-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium border border-gray-200 dark:border-gray-700">
						<Plus size={16} />
						<span>新建聊天</span>
					</button>
				</div>

				{/* 会话列表 */}
				<div className="flex-1 overflow-y-auto px-3">
					<div className="space-y-1">
						{sessions.map((session) => (
							<SessionItem key={session.id} session={session} isActive={session.id === currentSessionId} onClick={() => onSelectSession(session.id)} onDelete={() => onDeleteSession(session.id)} onRename={(title) => onRenameSession(session.id, title)} onShowToast={onShowToast} />
						))}
						{sessions.length === 0 && (
							<div className="text-center py-8 text-gray-500 dark:text-gray-400">
								<p className="text-sm">暂无聊天记录</p>
								<p className="text-xs mt-1">发送消息开始新对话</p>
							</div>
						)}
					</div>
				</div>

				{/* Footer */}
				<div className="p-3 border-t border-gray-200 dark:border-gray-700">
					<div className="flex items-center gap-2">
						<button onClick={() => setShowSettings(true)} className="flex-1 flex items-center gap-2 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm">
							<Settings size={16} />
							设置
						</button>
						<button onClick={onThemeToggle} className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}>
							{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
						</button>
					</div>
				</div>
			</div>

			{/* Settings Modal */}
			{showSettings && (
				<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
						<div className="p-6">
							<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">API 配置</h2>

							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API 密钥</label>
									<input type="password" value={tempConfig.apiKey} onChange={(e) => setTempConfig((prev) => ({ ...prev, apiKey: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="请输入您的 API 密钥" />
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API 地址</label>
									<input type="url" value={tempConfig.apiUrl} onChange={(e) => setTempConfig((prev) => ({ ...prev, apiUrl: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">模型</label>
									<input type="text" value={tempConfig.model || ""} onChange={(e) => setTempConfig((prev) => ({ ...prev, model: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="gpt-3.5-turbo" />
								</div>
							</div>

							<div className="flex gap-3 mt-6">
								<button onClick={handleSaveConfig} className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
									保存
								</button>
								<button onClick={handleCancelConfig} className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">
									取消
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
