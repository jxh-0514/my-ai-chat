import React, { useRef } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { User, Bot, Copy, Check, RotateCcw, ThumbsUp, ThumbsDown } from "lucide-react";
import type { Message as MessageType } from "../types";

interface MessageProps {
	message: MessageType;
	onRegenerate?: () => void;
	onShowToast?: (message: string, type?: "success" | "error" | "warning" | "info") => void;
	isLoading?: boolean;
}

export function Message({ message, onRegenerate, onShowToast, isLoading }: MessageProps) {
	const contentRef = useRef<HTMLDivElement>(null);
	const [copied, setCopied] = React.useState(false);

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
			onShowToast?.("内容已复制到剪贴板", "success");
		} catch (err) {
			console.error("Failed to copy text: ", err);
			onShowToast?.("复制失败，请重试", "error");
		}
	};

	// 处理文件附件显示的组件
	const FileAttachment = ({ fileName, fileSize }: { fileName: string; fileSize: string }) => (
		<div className="file-attachment">
			<span className="file-icon">📎</span>
			<span className="file-name">{fileName}</span>
			<span className="file-size">({fileSize})</span>
		</div>
	);

	// 自定义组件映射
	const components = {
		// 自定义文件附件渲染
		p: ({ children, ...props }: any) => {
			const content = children?.toString() || "";
			// 检测文件附件格式
			const fileMatch = content.match(/\[文件: ([^\]]+) \(([^)]+)\)\]/);
			if (fileMatch) {
				return <FileAttachment fileName={fileMatch[1]} fileSize={fileMatch[2]} />;
			}
			return <p {...props}>{children}</p>;
		},
	};

	const isUser = message.role === "user";

	return (
		<div className={`group flex gap-4 p-6 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
			{/* 头像 */}
			<div className="flex-shrink-0">
				<div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isUser ? "bg-blue-500 text-white" : "bg-green-500 text-white"}`}>{isUser ? "U" : "AI"}</div>
			</div>

			{/* 消息内容 */}
			<div className={`flex-1 min-w-0 ${isUser ? "flex justify-end" : "flex justify-start"}`}>
				<div className={`max-w-[80%] ${isUser ? "text-right" : "text-left"}`}>
					{/* 消息气泡 */}
					<div className={`relative rounded-2xl px-4 py-3 ${isUser ? "bg-blue-500 text-white rounded-br-md" : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md"}`}>
						{/* 如果是AI消息且内容为空且正在加载，显示加载状态 */}
						{!isUser && !message.content && isLoading ? (
							<div className="flex gap-1 py-2">
								<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
								<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
								<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
							</div>
						) : (
							<div ref={contentRef} className={`prose prose-sm max-w-none ${isUser ? "prose-invert text-white" : "text-gray-800 dark:text-gray-200"}`}>
								<ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight, rehypeRaw]} components={components}>
									{message.content}
								</ReactMarkdown>
							</div>
						)}
					</div>

					{/* 消息操作按钮 */}
					{!isUser && message.content && !message.isStreaming && (
						<div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
							<button onClick={() => copyToClipboard(message.content)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" title="复制">
								{copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
							</button>

							{onRegenerate && (
								<button onClick={onRegenerate} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" title="重新生成">
									<RotateCcw size={14} />
								</button>
							)}

							<button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" title="好评">
								<ThumbsUp size={14} />
							</button>

							<button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" title="差评">
								<ThumbsDown size={14} />
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
