import React, { useState } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { MessageSquare, Trash2, Edit3, Check, X } from "lucide-react";
import { ConfirmModal } from "./Modal";
import type { ChatSession } from "../types";

interface SessionItemProps {
	session: ChatSession;
	isActive: boolean;
	onClick: () => void;
	onDelete: () => void;
	onRename: (newTitle: string) => void;
	onShowToast?: (message: string, type?: "success" | "error" | "warning" | "info") => void;
}

export function SessionItem({ session, isActive, onClick, onDelete, onRename, onShowToast }: SessionItemProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editTitle, setEditTitle] = useState(session.title);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleRename = () => {
		if (editTitle.trim() && editTitle !== session.title) {
			onRename(editTitle.trim());
		}
		setIsEditing(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleRename();
		} else if (e.key === "Escape") {
			setEditTitle(session.title);
			setIsEditing(false);
		}
	};

	const handleDeleteClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShowDeleteConfirm(true);
	};

	const handleConfirmDelete = async () => {
		setIsDeleting(true);
		try {
			onDelete();
			onShowToast?.("对话已删除", "success");
		} catch (error) {
			onShowToast?.("删除失败，请重试", "error");
		} finally {
			setIsDeleting(false);
			setShowDeleteConfirm(false);
		}
	};

	const handleEditClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsEditing(true);
	};

	return (
		<>
			<div
				className={`
					group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200
					${isActive ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"}
				`}
				onClick={onClick}>
				<div className="flex-1 min-w-0">
					{isEditing ? (
						<div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
							<input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onKeyDown={handleKeyDown} onBlur={handleRename} className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
							<button onClick={handleRename} className="p-1 text-green-500 hover:bg-green-100 dark:hover:bg-green-900 rounded">
								<Check size={12} />
							</button>
							<button
								onClick={() => {
									setEditTitle(session.title);
									setIsEditing(false);
								}}
								className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded">
								<X size={12} />
							</button>
						</div>
					) : (
						<div className="text-sm font-medium truncate">{session.title}</div>
					)}
				</div>

				{!isEditing && (
					<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
						<button onClick={handleEditClick} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" title="重命名">
							<Edit3 size={14} />
						</button>
						<button onClick={handleDeleteClick} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="删除">
							<Trash2 size={14} />
						</button>
					</div>
				)}
			</div>

			{/* 删除确认对话框 */}
			<ConfirmModal key={`delete-confirm-${session.id}`} isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={handleConfirmDelete} title="确认删除" message="确定要删除这个对话吗？此操作无法撤销。" confirmText="删除" cancelText="取消" confirmType="danger" isLoading={isDeleting} />
		</>
	);
}
