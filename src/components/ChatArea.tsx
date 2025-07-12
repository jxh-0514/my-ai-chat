import React, { useEffect, useRef } from "react";
import { MessageSquare, Menu } from "lucide-react";
import type { ChatSession } from "../types";
import { Message } from "./Message";

interface ChatAreaProps {
	session: ChatSession | null;
	isLoading: boolean;
	onToggleSidebar: () => void;
	onSendMessage?: (message: string) => void;
	onShowToast?: (message: string, type?: "success" | "error" | "warning" | "info") => void;
}

export function ChatArea({ session, isLoading, onToggleSidebar, onSendMessage, onShowToast }: ChatAreaProps) {
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [session?.messages]);

	if (!session) {
		return (
			<div className="flex-1 flex flex-col">
				{/* Header */}
				<div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
					<button onClick={onToggleSidebar} className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
						<Menu size={20} />
					</button>
					<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">ChatGPT</h2>
				</div>

				{/* Empty state */}
				<div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
					<div className="text-center max-w-md mx-auto px-4">
						<h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">你好！我能为你做些什么？</h3>
						<div className="grid grid-cols-1 gap-3 text-sm">
							<div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors" onClick={() => onSendMessage?.("帮我写一个关于未来科技的短故事")}>
								<div className="font-medium text-gray-900 dark:text-gray-100 mb-1">创意写作</div>
								<div className="text-gray-600 dark:text-gray-400">帮我写一个关于未来科技的短故事</div>
							</div>
							<div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors" onClick={() => onSendMessage?.("帮我解释这段代码的功能")}>
								<div className="font-medium text-gray-900 dark:text-gray-100 mb-1">代码助手</div>
								<div className="text-gray-600 dark:text-gray-400">帮我解释这段代码的功能</div>
							</div>
							<div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors" onClick={() => onSendMessage?.("解释一个复杂的概念")}>
								<div className="font-medium text-gray-900 dark:text-gray-100 mb-1">学习助手</div>
								<div className="text-gray-600 dark:text-gray-400">解释一个复杂的概念</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 flex flex-col min-h-0">
			{/* Header */}
			<div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
				<button onClick={onToggleSidebar} className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
					<Menu size={20} />
				</button>
				<div className="flex-1">
					<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{session.title}</h2>
				</div>
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 chat-scrollbar min-h-0">
				{session.messages.length === 0 ? (
					<div className="flex items-center justify-center h-full">
						<div className="text-center">
							<p className="text-gray-500 dark:text-gray-400">开始新的对话吧！</p>
						</div>
					</div>
				) : (
					<div className="max-w-3xl mx-auto">
						{session.messages.map((message) => (
							<Message key={message.id} message={message} onShowToast={onShowToast} isLoading={isLoading} />
						))}
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>
		</div>
	);
}
