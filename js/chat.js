class ChatUI {
    constructor() {
        this.messagesContainer = document.querySelector('.chat-messages');
        this.inputField = document.querySelector('.chat-input textarea');
        this.sendButton = document.querySelector('.chat-input button');
        this.typingIndicator = document.querySelector('.typing-indicator');
        this.errorMessage = document.querySelector('.error-message');
        this.modelButtons = document.querySelectorAll('.model-btn');
        
        this.isProcessing = false;
        this.messageQueue = [];
        this.currentMessageDiv = null;
        this.lastRequestTime = 0;
        
        // API配置
        this.currentModel = 'standard'; // 默认使用通用版
        this.apiConfig = {
            standard: {
                apiKey: 'cacca7eb262381e7eff5f9a2c03ff8c5.GyevOrAKZSxFTHod',
                apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
                model: 'glm-4-flash'
            },
            premium: {
                apiKey: 'sk-VQeqFqLUcjaRwmlMESuXsPNBNgCyRTYPZw9S7NTlpB5fAV6c',
                apiUrl: 'https://api.moonshot.cn/v1/chat/completions',
                model: 'moonshot-v1-8k'
            }
        };
        
        this.MIN_REQUEST_INTERVAL = 2000;
        this.MAX_RETRIES = 3;
        
        this.initEventListeners();
    }

    initEventListeners() {
        this.sendButton.addEventListener('click', () => this.handleSend());

        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });

        this.inputField.addEventListener('input', () => {
            this.inputField.style.height = 'auto';
            this.inputField.style.height = (this.inputField.scrollHeight) + 'px';
        });

        // 添加模型切换事件监听
        this.modelButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.modelButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentModel = btn.dataset.model;
            });
        });
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async waitForNextRequest() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
            const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
            await this.sleep(waitTime);
        }
        this.lastRequestTime = Date.now();
    }

    async handleSend() {
        const userMessage = this.inputField.value.trim();
        if (!userMessage) return;

        this.inputField.value = '';
        this.inputField.style.height = 'auto';

        this.messageQueue.push(userMessage);
        this.updateUI(this.isProcessing);

        if (!this.isProcessing) {
            await this.processMessageQueue();
        }
    }

    async processMessageQueue() {
        if (this.messageQueue.length === 0) {
            this.isProcessing = false;
            this.updateUI(false);
            return;
        }

        this.isProcessing = true;
        this.updateUI(true);

        try {
            const message = this.messageQueue[0];
            this.addMessage(message, 'user');

            // 创建一个新的消息div用于流式显示回复
            await this.waitForNextRequest();
            
            this.currentMessageDiv = this.createMessageDiv('bot');
            this.messagesContainer.appendChild(this.currentMessageDiv);
            
            await this.streamResponse(message);
            this.messageQueue.shift();

        } catch (error) {
            console.error('Error:', error);
            this.showError('发生错误，请稍后重试');
            if (this.messageQueue.length > 0) {
                this.messageQueue.shift();
            }
        }

        setTimeout(async () => {
            if (this.messageQueue.length > 0) {
                await this.processMessageQueue();
            } else {
                this.isProcessing = false;
                this.updateUI(false);
            }
        }, 1000);
    }

    async streamResponse(message, retryCount = 0) {
        const config = this.apiConfig[this.currentModel];
        try {
            const response = await fetch(config.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`
                },
                body: JSON.stringify({
                    model: config.model,
                    messages: [
                        {
                            "role": "system",
                            "content": `你是小森同学，一个由Forest创建的人工智能助手。你会为用户提供安全，有帮助，准确的回答。
                            
在回答中，请遵循以下格式规范：
1. 当需要展示代码时，使用以下格式：
   - 完整代码块：使用 \`\`\`language\\n代码内容\`\`\`
   - 行内代码：使用 \`代码\`
2. 代码语言说明：
   - Python代码：\`\`\`python
   - JavaScript代码：\`\`\`javascript
   - HTML代码：\`\`\`html
   - CSS代码：\`\`\`css
3. 代码格式要求：
   - 保持适当的缩进
   - 包含必要的注释
   - 使用清晰的变量命名
4. 文本格式：
   - 使用换行来分隔不同的段落
   - 重要概念使用加粗或斜体
   - 使用列表来组织多个要点

同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。`
                        },
                        {
                            "role": "user",
                            "content": message
                        }
                    ],
                    temperature: 0.3,
                    stream: true
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error?.message || `API请求失败: ${response.status}`;
                
                // 如果是频率限制错误，尝试重试
                if (response.status === 429 && retryCount < this.MAX_RETRIES) {
                    const waitTime = Math.pow(2, retryCount) * 1000; // 指数退避
                    await this.sleep(waitTime);
                    return this.streamResponse(message, retryCount + 1);
                }
                
                throw new Error(errorMessage);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                
                // 处理缓冲区中的数据
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // 保留最后一个不完整的行

                for (const line of lines) {
                    if (line.trim() === '') continue;
                    if (line.trim() === 'data: [DONE]') continue;
                    
                    try {
                        const data = JSON.parse(line.replace(/^data: /, ''));
                        const content = data.choices[0]?.delta?.content || '';
                        if (content) {
                            this.appendToMessage(content);
                        }
                    } catch (e) {
                        console.warn('Failed to parse line:', line, e);
                    }
                }
            }

            // 处理最后可能残留的数据
            if (buffer.trim() && buffer.trim() !== 'data: [DONE]') {
                try {
                    const data = JSON.parse(buffer.replace(/^data: /, ''));
                    const content = data.choices[0]?.delta?.content || '';
                    if (content) {
                        this.appendToMessage(content);
                    }
                } catch (e) {
                    console.warn('Failed to parse final buffer:', buffer, e);
                }
            }

        } catch (error) {
            console.error('Stream Error:', error);
            if (retryCount < this.MAX_RETRIES) {
                const waitTime = Math.pow(2, retryCount) * 1000;
                await this.sleep(waitTime);
                return this.streamResponse(message, retryCount + 1);
            }
            throw error;
        }
    }

    createMessageDiv(type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = '<div class="message-content"></div>';
        return messageDiv;
    }

    appendToMessage(content) {
        if (this.currentMessageDiv) {
            const contentDiv = this.currentMessageDiv.querySelector('.message-content');
            contentDiv.innerHTML += this.formatMessage(content);
            // 触发代码高亮
            if (window.Prism) {
                Prism.highlightAllUnder(contentDiv);
            }
            this.scrollToBottom();
        }
    }

    addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `<div class="message-content">${this.formatMessage(content)}</div>`;
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    formatMessage(message) {
        // 首先转义HTML特殊字符
        message = message.replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');

        // 处理代码块 (```language code```)
        message = message.replace(/```(\w*)\n([\s\S]*?)```/g, (match, language, code) => {
            // 处理代码缩进
            const lines = code.split('\n');
            
            // 找到最小的非空行缩进
            let minIndent = Infinity;
            lines.forEach(line => {
                if (line.trim().length > 0) {
                    const indent = line.match(/^\s*/)[0].length;
                    if (indent < minIndent) {
                        minIndent = indent;
                    }
                }
            });
            
            // 如果所有行都是空行，重置最小缩进
            if (minIndent === Infinity) {
                minIndent = 0;
            }

            // 移除每行的最小缩进，保持相对缩进
            const formattedCode = lines.map(line => {
                if (line.trim().length === 0) {
                    return '';
                }
                // 确保行首空格是4的倍数
                const currentIndent = line.match(/^\s*/)[0].length;
                const relativeIndent = currentIndent - minIndent;
                const spacesNeeded = Math.ceil(relativeIndent / 4) * 4;
                return ' '.repeat(spacesNeeded) + line.slice(currentIndent);
            }).join('\n');

            const copyButton = `<button class="copy-button" onclick="navigator.clipboard.writeText(\`${formattedCode.trim()}\`)">复制代码</button>`;
            
            // 添加代码块的语言标识
            const languageClass = language ? `language-${language}` : 'language-plaintext';
            
            return `<div class="code-block ${language || 'plaintext'}">
                        ${copyButton}
                        <pre><code class="${languageClass}">${formattedCode.trim()}</code></pre>
                    </div>`;
        });

        // 处理行内代码 (`code`)
        message = message.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

        // 处理标题 (### 或 ## 或 #)
        message = message.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, content) => {
            const level = hashes.length;
            return `<h${level} class="chat-heading">${content}</h${level}>`;
        });

        // 处理列表
        message = message.replace(/^(\s*)-\s+(.+)$/gm, '<li class="chat-list-item">$2</li>');
        message = message.replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="chat-list">$&</ul>');

        // 处理粗体
        message = message.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

        // 处理斜体
        message = message.replace(/\*([^*]+)\*/g, '<em>$1</em>');

        // 处理链接
        message = message.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        message = message.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank">$1</a>');

        // 处理换行
        message = message.replace(/\n/g, '<br>');

        return message;
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    updateUI(isProcessing) {
        this.sendButton.disabled = isProcessing;
        this.typingIndicator.classList.toggle('active', isProcessing);
        
        if (!isProcessing) {
            this.errorMessage.classList.remove('active');
        }
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.add('active');
        
        setTimeout(() => {
            if (this.errorMessage.textContent === message) {
                this.errorMessage.classList.remove('active');
            }
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChatUI();
});
