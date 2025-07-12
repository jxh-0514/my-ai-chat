import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, X, FileText, Image, File } from "lucide-react";

interface InputAreaProps {
	onSendMessage: (message: string, files?: File[]) => void;
	isLoading: boolean;
	disabled?: boolean;
}

export function InputArea({ onSendMessage, isLoading, disabled }: InputAreaProps) {
	const [message, setMessage] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Auto-resize textarea
	useEffect(() => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = "auto";
			textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
		}
	}, [message]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (message.trim() && !isLoading && !disabled) {
			onSendMessage(message.trim(), files.length > 0 ? files : undefined);
			setMessage("");
			setFiles([]);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = Array.from(e.target.files || []);
		setFiles((prev) => [...prev, ...selectedFiles]);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const removeFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	// 获取文件图标
	const getFileIcon = (file: File) => {
		const fileType = file.type;
		if (fileType.startsWith("image/")) {
			return <Image size={16} className="text-blue-500" />;
		} else if (fileType.includes("text") || fileType.includes("document")) {
			return <FileText size={16} className="text-green-500" />;
		} else {
			return <File size={16} className="text-gray-500" />;
		}
	};

	// 检查是否为图片文件
	const isImageFile = (file: File) => {
		return file.type.startsWith("image/");
	};

	return (
		<div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
			{/* 文件附件 */}
			{files.length > 0 && (
				<div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
					<div className="flex flex-wrap gap-2">
						{files.map((file, index) => (
							<div key={index} className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center gap-2 p-2 max-w-xs">
								{/* 图片预览 */}
								{isImageFile(file) ? (
									<div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
										<img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover rounded" onLoad={() => URL.revokeObjectURL(URL.createObjectURL(file))} />
									</div>
								) : (
									<div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">{getFileIcon(file)}</div>
								)}

								{/* 文件信息 */}
								<div className="flex-1 min-w-0">
									<div className="font-medium text-gray-800 dark:text-gray-200 truncate text-sm">{file.name}</div>
									<div className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</div>
								</div>

								{/* 删除按钮 */}
								<button onClick={() => removeFile(index)} className="p-1 text-gray-400 hover:text-red-500 rounded flex-shrink-0" title="删除文件">
									<X size={14} />
								</button>
							</div>
						))}
					</div>
				</div>
			)}

			{/* 输入表单 */}
			<form onSubmit={handleSubmit} className="p-4">
				<div className="max-w-3xl mx-auto">
					<div className="relative flex items-end gap-2 bg-gray-100 dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 focus-within:border-gray-300 dark:focus-within:border-gray-600">
						{/* 文件上传按钮 */}
						<button type="button" onClick={() => fileInputRef.current?.click()} disabled={disabled} className="flex-shrink-0 p-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" title="上传文件">
							<Paperclip size={20} />
						</button>

						{/* 隐藏的文件输入 */}
						<input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" accept="image/*,.pdf,.doc,.docx,.txt,.md" />

						{/* 消息输入框 */}
						<textarea
							ref={textareaRef}
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={disabled ? "请先配置API密钥" : "给ChatGPT发消息"}
							disabled={disabled}
							className="flex-1 px-4 py-3 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none border-none outline-none disabled:opacity-50 disabled:cursor-not-allowed"
							rows={1}
							style={{ minHeight: "24px", maxHeight: "200px" }}
						/>

						{/* 发送按钮 */}
						<button
							type="submit"
							disabled={!message.trim() || isLoading || disabled}
							className={`flex-shrink-0 p-2 m-1 rounded-full transition-colors ${!message.trim() || isLoading || disabled ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed" : "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"}`}
							title="发送消息">
							{isLoading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Send size={16} />}
						</button>
					</div>

					{/* 提示文本 */}
					{disabled && <div className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">请在设置中配置API密钥后开始聊天</div>}
				</div>
			</form>
		</div>
	);
}
