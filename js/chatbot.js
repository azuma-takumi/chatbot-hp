/* ==========================================
   chatbot.js
   Claude API を使ったAIチャットボット
   ストリーミング対応・会話履歴管理
   ========================================== */

// 会話履歴（Claude API に送る形式で保持）
let conversationHistory = [];

// チャットボットが処理中かどうかのフラグ
let isProcessing = false;

// DOM読み込み完了後に実行
document.addEventListener('DOMContentLoaded', () => {
  initChatbot();
});

/* ------------------------------------------
   チャットボット初期化
   ------------------------------------------ */
function initChatbot() {
  const trigger   = document.getElementById('chatTrigger');
  const widget    = document.getElementById('chatWidget');
  const closeBtn  = document.getElementById('chatClose');
  const form      = document.getElementById('chatForm');
  const input     = document.getElementById('chatInput');
  const sendBtn   = document.getElementById('chatSend');

  if (!trigger || !widget) return;

  // トリガーボタンクリックでウィジェット開閉
  trigger.addEventListener('click', () => {
    const isOpen = widget.classList.toggle('open');
    trigger.setAttribute('aria-label', isOpen ? 'チャットを閉じる' : 'チャットを開く');

    // 初回オープン時にウェルカムメッセージを表示
    if (isOpen && conversationHistory.length === 0) {
      showWelcomeMessage();
    }

    // 開いたときに入力フォームにフォーカス
    if (isOpen) {
      setTimeout(() => input && input.focus(), 300);
    }
  });

  // 閉じるボタン
  closeBtn && closeBtn.addEventListener('click', () => {
    widget.classList.remove('open');
    trigger.setAttribute('aria-label', 'チャットを開く');
  });

  // フォーム送信（Enterキーまたは送信ボタン）
  form && form.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage(input, sendBtn);
  });

  // Shift+Enter で改行、Enter で送信
  input && input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input, sendBtn);
    }
  });

  // 入力内容に応じて送信ボタンを有効化
  input && input.addEventListener('input', () => {
    if (sendBtn) {
      sendBtn.disabled = input.value.trim() === '' || isProcessing;
    }
  });
}

/* ------------------------------------------
   ウェルカムメッセージを表示
   ------------------------------------------ */
function showWelcomeMessage() {
  const welcomeText = `こんにちは！株式会社サンプルのAIアシスタントです😊

サービス内容・料金・導入フローなど、どんなことでもお気軽にご質問ください。`;

  appendBotMessage(welcomeText);

  // クイックリプライボタンを表示
  const quickReplies = [
    'サービス内容を教えて',
    '料金はどのくらい？',
    '導入の流れを知りたい',
    'サポート体制について',
  ];
  appendQuickReplies(quickReplies);
}

/* ------------------------------------------
   メッセージ送信処理
   ------------------------------------------ */
async function sendMessage(input, sendBtn) {
  const text = input ? input.value.trim() : '';

  if (!text || isProcessing) return;

  // 入力フィールドをリセット
  if (input) input.value = '';
  if (sendBtn) sendBtn.disabled = true;

  // ユーザーメッセージを表示
  appendUserMessage(text);

  // 会話履歴に追加
  conversationHistory.push({
    role: 'user',
    content: text,
  });

  // Claude API に送信してストリーミング表示
  await streamBotResponse();
}

/* ------------------------------------------
   クイックリプライのメッセージ送信
   ------------------------------------------ */
async function sendQuickReply(text) {
  if (isProcessing) return;

  // ユーザーメッセージを表示
  appendUserMessage(text);

  // 会話履歴に追加
  conversationHistory.push({
    role: 'user',
    content: text,
  });

  // Claude API に送信してストリーミング表示
  await streamBotResponse();
}

/* ------------------------------------------
   Claude API にリクエストを送り
   ストリーミングでボットの応答を表示
   ------------------------------------------ */
async function streamBotResponse() {
  isProcessing = true;

  // タイピングインジケーターを表示
  const typingId = appendTypingIndicator();

  // ストリーミング用のメッセージ要素を準備
  let botMessageEl = null;
  let fullText = '';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: conversationHistory,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // タイピングインジケーターを削除
    removeTypingIndicator(typingId);

    // SSE ストリームを読み込む
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE の行を処理
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // 最後の不完全な行はバッファに残す

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();

          if (data === '[DONE]') {
            // ストリーム完了
            break;
          }

          try {
            const parsed = JSON.parse(data);

            if (parsed.error) {
              // エラーメッセージを表示
              if (botMessageEl) {
                updateBotMessage(botMessageEl, parsed.error);
              } else {
                appendBotMessage(parsed.error);
              }
              break;
            }

            if (parsed.text) {
              fullText += parsed.text;

              // ボットメッセージ要素を初回作成 or 更新
              if (!botMessageEl) {
                botMessageEl = createStreamingBotMessage();
              }
              updateBotMessage(botMessageEl, fullText);
            }
          } catch (e) {
            // JSON パースエラーは無視
          }
        }
      }
    }

    // 会話履歴にボットの応答を追加
    if (fullText) {
      conversationHistory.push({
        role: 'assistant',
        content: fullText,
      });
    }

  } catch (error) {
    console.error('チャットボットエラー:', error);

    // タイピングインジケーターを削除
    removeTypingIndicator(typingId);

    // エラーメッセージを表示
    appendBotMessage('申し訳ございません。接続エラーが発生しました。\nしばらくしてから再度お試しください。');
  }

  isProcessing = false;

  // 入力フォームを再有効化
  const input   = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');
  if (input) input.focus();
  if (sendBtn) sendBtn.disabled = false;

  // 会話履歴が長くなりすぎた場合はトリミング（最新20件を保持）
  if (conversationHistory.length > 20) {
    conversationHistory = conversationHistory.slice(-20);
  }
}

/* ------------------------------------------
   ユーザーメッセージをチャットに追加
   ------------------------------------------ */
function appendUserMessage(text) {
  const body = document.getElementById('chatBody');
  if (!body) return;

  const el = document.createElement('div');
  el.className = 'chat-message chat-message--user';
  el.innerHTML = `<p class="chat-message__text">${escapeHtml(text)}</p>`;

  body.appendChild(el);
  scrollToBottom(body);
}

/* ------------------------------------------
   ボットメッセージをチャットに追加
   ------------------------------------------ */
function appendBotMessage(text) {
  const body = document.getElementById('chatBody');
  if (!body) return;

  const el = document.createElement('div');
  el.className = 'chat-message chat-message--bot';
  el.innerHTML = `
    <div class="chat-message__avatar">AI</div>
    <p class="chat-message__text">${formatBotText(text)}</p>
  `;

  body.appendChild(el);
  scrollToBottom(body);
  return el;
}

/* ------------------------------------------
   ストリーミング用のボットメッセージ要素を作成
   ------------------------------------------ */
function createStreamingBotMessage() {
  const body = document.getElementById('chatBody');
  if (!body) return null;

  const el = document.createElement('div');
  el.className = 'chat-message chat-message--bot chat-message--streaming';
  el.innerHTML = `
    <div class="chat-message__avatar">AI</div>
    <p class="chat-message__text"></p>
  `;

  body.appendChild(el);
  scrollToBottom(body);
  return el;
}

/* ------------------------------------------
   ストリーミング中のボットメッセージを更新
   ------------------------------------------ */
function updateBotMessage(el, text) {
  if (!el) return;

  const textEl = el.querySelector('.chat-message__text');
  if (textEl) {
    textEl.innerHTML = formatBotText(text);
  }

  // ストリーミング完了後にクラスを削除
  el.classList.remove('chat-message--streaming');

  const body = document.getElementById('chatBody');
  if (body) scrollToBottom(body);
}

/* ------------------------------------------
   タイピングインジケーターを表示
   ------------------------------------------ */
function appendTypingIndicator() {
  const body = document.getElementById('chatBody');
  if (!body) return null;

  const id = 'typing-' + Date.now();
  const el = document.createElement('div');
  el.id = id;
  el.className = 'chat-message chat-message--bot chat-message--typing';
  el.innerHTML = `
    <div class="chat-message__avatar">AI</div>
    <div class="chat-typing">
      <span></span><span></span><span></span>
    </div>
  `;

  body.appendChild(el);
  scrollToBottom(body);
  return id;
}

/* ------------------------------------------
   タイピングインジケーターを削除
   ------------------------------------------ */
function removeTypingIndicator(id) {
  if (!id) return;
  const el = document.getElementById(id);
  if (el) el.remove();
}

/* ------------------------------------------
   クイックリプライボタンを表示
   ------------------------------------------ */
function appendQuickReplies(replies) {
  const body = document.getElementById('chatBody');
  if (!body) return;

  const el = document.createElement('div');
  el.className = 'chat-quick-replies';
  el.innerHTML = replies
    .map(r => `<button class="chat-quick-reply" type="button">${escapeHtml(r)}</button>`)
    .join('');

  // クリックイベントを設定
  el.querySelectorAll('.chat-quick-reply').forEach(btn => {
    btn.addEventListener('click', () => {
      if (isProcessing) return;
      const text = btn.textContent;
      // クイックリプライを非表示にする
      el.remove();
      sendQuickReply(text);
    });
  });

  body.appendChild(el);
  scrollToBottom(body);
}

/* ------------------------------------------
   ボットテキストをフォーマット（改行・コード対応）
   ------------------------------------------ */
function formatBotText(text) {
  return escapeHtml(text)
    .replace(/\n/g, '<br>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

/* ------------------------------------------
   XSS 対策：HTML エスケープ
   ------------------------------------------ */
function escapeHtml(str) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return String(str).replace(/[&<>"']/g, m => map[m]);
}

/* ------------------------------------------
   チャット本文を最下部にスクロール
   ------------------------------------------ */
function scrollToBottom(el) {
  requestAnimationFrame(() => {
    el.scrollTop = el.scrollHeight;
  });
}
