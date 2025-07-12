import axios from "axios";
import type { Message, ChatConfig, ApiResponse, StreamResponse } from "../types";

export class ChatAPI {
	private config: ChatConfig;

	constructor(config: ChatConfig) {
		this.config = config;
	}

	updateConfig(config: Partial<ChatConfig>) {
		this.config = { ...this.config, ...config };
	}

	async sendMessage(messages: Message[]): Promise<string> {
		try {
			const response = await axios.post<ApiResponse>(
				`${this.config.apiUrl}/v1/chat/completions`,
				{
					model: this.config.model || "gpt-3.5-turbo",
					messages: messages.map((msg) => ({
						role: msg.role,
						content: msg.content,
					})),
					temperature: this.config.temperature || 0.7,
					max_tokens: this.config.maxTokens || 2000,
				},
				{
					headers: {
						Authorization: `Bearer ${this.config.apiKey}`,
						"Content-Type": "application/json",
					},
					timeout: 30000,
				}
			);

			return response.data.choices[0]?.message?.content || "";
		} catch (error) {
			console.error("API Error:", error);
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error("API密钥无效，请检查配置");
				} else if (error.response?.status === 429) {
					throw new Error("请求过于频繁，请稍后再试");
				} else if (error.code === "ECONNABORTED") {
					throw new Error("请求超时，请检查网络连接");
				}
				throw new Error(`API请求失败: ${error.response?.data?.error?.message || error.message}`);
			}
			throw new Error("发送消息失败，请重试");
		}
	}

	async *sendMessageStream(messages: Message[]): AsyncGenerator<string, void, unknown> {
		try {
			const response = await fetch(`${this.config.apiUrl}/v1/chat/completions`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${this.config.apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: this.config.model || "gpt-3.5-turbo",
					messages: messages.map((msg) => ({
						role: msg.role,
						content: msg.content,
					})),
					temperature: this.config.temperature || 0.7,
					max_tokens: this.config.maxTokens || 2000,
					stream: true,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				if (response.status === 401) {
					throw new Error("API密钥无效，请检查配置");
				} else if (response.status === 429) {
					throw new Error("请求过于频繁，请稍后再试");
				}
				throw new Error(`API请求失败: ${errorData.error?.message || response.statusText}`);
			}

			const reader = response.body?.getReader();
			if (!reader) {
				throw new Error("无法读取响应流");
			}

			const decoder = new TextDecoder();
			let buffer = "";

			try {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					buffer += decoder.decode(value, { stream: true });
					const lines = buffer.split("\n");
					buffer = lines.pop() || "";

					for (const line of lines) {
						const trimmed = line.trim();
						if (trimmed === "" || trimmed === "data: [DONE]") continue;

						if (trimmed.startsWith("data: ")) {
							try {
								const jsonStr = trimmed.slice(6);
								const data: StreamResponse = JSON.parse(jsonStr);
								const content = data.choices[0]?.delta?.content;
								if (content) {
									yield content;
								}
							} catch (parseError) {
								console.warn("Failed to parse SSE data:", trimmed);
							}
						}
					}
				}
			} finally {
				reader.releaseLock();
			}
		} catch (error) {
			console.error("Stream API Error:", error);
			if (error instanceof Error) {
				throw error;
			}
			throw new Error("流式请求失败，请重试");
		}
	}

	async testConnection(): Promise<boolean> {
		try {
			await this.sendMessage([{ id: "test", content: "Hello", role: "user", timestamp: new Date() }]);
			return true;
		} catch {
			return false;
		}
	}
}
