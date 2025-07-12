import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
	/** 是否显示模态框 */
	isOpen: boolean;
	/** 关闭模态框的回调 */
	onClose: () => void;
	/** 模态框标题 */
	title?: string;
	/** 模态框内容 */
	children: React.ReactNode;
	/** 是否显示关闭按钮 */
	showCloseButton?: boolean;
	/** 点击遮罩层是否关闭模态框 */
	closeOnOverlayClick?: boolean;
	/** 自定义样式类名 */
	className?: string;
	/** 模态框大小 */
	size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ isOpen, onClose, title, children, showCloseButton = true, closeOnOverlayClick = true, className = "", size = "md" }: ModalProps) {
	// 处理遮罩层点击
	const handleOverlayClick = (e: React.MouseEvent) => {
		if (closeOnOverlayClick && e.target === e.currentTarget) {
			onClose();
		}
	};

	// 处理ESC键关闭
	React.useEffect(() => {
		if (!isOpen) return;

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};

		document.addEventListener("keydown", handleEscape);
		// 防止背景滚动
		document.body.style.overflow = "hidden";

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, onClose]);

	// 如果不显示，直接返回null
	if (!isOpen) return null;

	// 根据size确定宽度
	const sizeClasses = {
		sm: "max-w-sm",
		md: "max-w-md",
		lg: "max-w-lg",
		xl: "max-w-xl",
	};

	return createPortal(
		<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-[9999]" onClick={handleOverlayClick}>
			<div
				className={`
					bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full ${sizeClasses[size]}
					transform transition-all duration-200 scale-100 opacity-100
					max-h-[90vh] overflow-y-auto
					${className}
				`}
				onClick={(e) => e.stopPropagation()}>
				{/* 头部 */}
				{(title || showCloseButton) && (
					<div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
						{title && <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>}
						{showCloseButton && (
							<button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="关闭">
								<X size={20} />
							</button>
						)}
					</div>
				)}

				{/* 内容 */}
				<div className={title || showCloseButton ? "p-6" : "p-6"}>{children}</div>
			</div>
		</div>,
		document.body
	);
}

// 确认对话框组件
interface ConfirmModalProps {
	/** 是否显示 */
	isOpen: boolean;
	/** 关闭回调 */
	onClose: () => void;
	/** 确认回调 */
	onConfirm: () => void;
	/** 标题 */
	title: string;
	/** 描述文本 */
	message: string;
	/** 确认按钮文本 */
	confirmText?: string;
	/** 取消按钮文本 */
	cancelText?: string;
	/** 确认按钮样式类型 */
	confirmType?: "danger" | "primary" | "success";
	/** 是否正在加载 */
	isLoading?: boolean;
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "确认", cancelText = "取消", confirmType = "primary", isLoading = false }: ConfirmModalProps) {
	const handleConfirm = () => {
		onConfirm();
		// 不在这里关闭，让调用方控制关闭时机
	};

	const confirmButtonClasses = {
		danger: "bg-red-500 hover:bg-red-600 text-white",
		primary: "bg-blue-500 hover:bg-blue-600 text-white",
		success: "bg-green-500 hover:bg-green-600 text-white",
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" showCloseButton={false}>
			<div className="space-y-4">
				<p className="text-gray-600 dark:text-gray-400">{message}</p>
				<div className="flex gap-3 justify-end">
					<button onClick={onClose} disabled={isLoading} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
						{cancelText}
					</button>
					<button onClick={handleConfirm} disabled={isLoading} className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${confirmButtonClasses[confirmType]}`}>
						{isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
						{confirmText}
					</button>
				</div>
			</div>
		</Modal>
	);
}
