import React, { useEffect, useState } from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';

export interface ToastProps {
	message: string;
	type?: 'success' | 'error' | 'warning' | 'info';
	duration?: number;
	onClose: () => void;
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
	const [isVisible, setIsVisible] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsVisible(false);
			setTimeout(onClose, 300); // 等待动画完成
		}, duration);

		return () => clearTimeout(timer);
	}, [duration, onClose]);

	const getIcon = () => {
		switch (type) {
			case 'success':
				return <Check size={20} className="text-green-500" />;
			case 'error':
				return <X size={20} className="text-red-500" />;
			case 'warning':
				return <AlertCircle size={20} className="text-yellow-500" />;
			default:
				return <Info size={20} className="text-blue-500" />;
		}
	};

	const getBackgroundColor = () => {
		switch (type) {
			case 'success':
				return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
			case 'error':
				return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
			case 'warning':
				return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
			default:
				return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
		}
	};

	return (
		<div
			className={`fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300 ${
				isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
			} ${getBackgroundColor()}`}
		>
			{getIcon()}
			<span className="text-gray-800 dark:text-gray-200 font-medium">{message}</span>
			<button
				onClick={() => {
					setIsVisible(false);
					setTimeout(onClose, 300);
				}}
				className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ml-2"
			>
				<X size={16} />
			</button>
		</div>
	);
}

// Toast管理器Hook
export function useToast() {
	const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastProps['type'] }>>([]);

	const showToast = (message: string, type: ToastProps['type'] = 'info') => {
		const id = Date.now().toString();
		setToasts(prev => [...prev, { id, message, type }]);
	};

	const removeToast = (id: string) => {
		setToasts(prev => prev.filter(toast => toast.id !== id));
	};

	const ToastContainer = () => (
		<div className="fixed top-4 right-4 z-50 space-y-2">
			{toasts.map(toast => (
				<Toast
					key={toast.id}
					message={toast.message}
					type={toast.type}
					onClose={() => removeToast(toast.id)}
				/>
			))}
		</div>
	);

	return {
		showToast,
		ToastContainer,
		success: (message: string) => showToast(message, 'success'),
		error: (message: string) => showToast(message, 'error'),
		warning: (message: string) => showToast(message, 'warning'),
		info: (message: string) => showToast(message, 'info'),
	};
}
