/* ==========================================
   chatbot.js
   FAQチャットボットのUI制御・応答ロジックを管理
   外部APIなし・純粋なJavaScriptで実装
   ========================================== */

// ==========================================
// FAQ データベース定義
// カテゴリとQ&Aを管理する
// ==========================================
const FAQ_DATA = {
  // --- 料金・料金体系 ---
  price: {
    label: '💴 料金・料金体系',
    questions: [
      {
        triggers: ['料金', '価格', 'いくら', '費用', 'コスト', '見積もり', '見積', '金額'],
        answer: `料金はプロジェクトの規模・要件によって異なります。\n\n【目安】\n・Webサイト制作：30万円〜\n・Webシステム開発：100万円〜\n・クラウド移行支援：50万円〜\n・DX推進コンサル：月額20万円〜\n\nまずは無料でお見積もりいたします。お気軽にご相談ください😊`,
      },
      {
        triggers: ['月額', 'サブスク', '定額', '保守費'],
        answer: `保守・運用の月額プランもご用意しています。\n\n【月額プラン例】\n・ライトプラン：5万円/月（障害対応・軽微な修正）\n・スタンダード：10万円/月（定期アップデート含む）\n・フルサポート：20万円〜/月（専任担当者付き）\n\n詳細はお問い合わせください。`,
      },
      {
        triggers: ['無料', '無償', 'フリー'],
        answer: `はい、以下は無料でご対応しています！\n\n✅ 初回ご相談・ヒアリング\n✅ お見積もり作成\n✅ 簡易的な課題診断\n\nまずはお気軽にお問い合わせください。`,
      },
    ],
  },

  // --- サービス内容・機能 ---
  service: {
    label: '🛠️ サービス内容・機能',
    questions: [
      {
        triggers: ['サービス', '何ができる', 'できること', '対応', '業務'],
        answer: `株式会社サンプルでは以下のサービスを提供しています。\n\n1️⃣ Webシステム開発\n業務システム・ECサイト・API開発など\n\n2️⃣ DX推進支援\n業務自動化・RPA導入・社内デジタル化\n\n3️⃣ クラウド導入支援\nAWS・GCP・Azure の移行・設計・運用\n\n4️⃣ スマホアプリ開発\niOS / Android 対応のネイティブアプリ\n\nどのサービスについて詳しくお知りになりたいですか？`,
        quickReplies: ['Webシステム開発について', 'DX推進について', 'クラウドについて', 'アプリ開発について'],
      },
      {
        triggers: ['web', 'ウェブ', 'システム開発', 'ホームページ', 'サイト制作'],
        answer: `Webシステム開発では以下に対応しています。\n\n✅ 要件定義〜設計・開発・テスト・リリース\n✅ 業務管理システム・社内ツール\n✅ ECサイト・予約システム\n✅ REST API・外部サービス連携\n✅ 既存システムのリプレイス\n\n使用技術：React / Vue / Laravel / Node.js など`,
      },
      {
        triggers: ['dx', 'デジタル', 'rpa', '自動化', '業務改善'],
        answer: `DX推進支援では以下をサポートしています。\n\n✅ 現状業務フローの分析・課題整理\n✅ RPAツール（UiPath / Power Automate）導入\n✅ 紙・Excel業務のデジタル化\n✅ 社内向けDX研修・勉強会\n✅ 継続的な改善サポート\n\n小さな自動化から全社DXまで対応可能です。`,
      },
      {
        triggers: ['クラウド', 'aws', 'azure', 'gcp', 'サーバー'],
        answer: `クラウド導入支援では以下を提供しています。\n\n✅ 現行インフラの課題分析\n✅ AWS / GCP / Azure の選定・設計\n✅ オンプレミスからの移行支援\n✅ セキュリティ設計・コスト最適化\n✅ 移行後の監視・運用サポート\n\n多くの企業でコスト30〜50%削減を実現しています。`,
      },
      {
        triggers: ['アプリ', 'スマホ', 'ios', 'android', 'モバイル'],
        answer: `スマホアプリ開発では以下に対応しています。\n\n✅ iOS / Android ネイティブアプリ\n✅ React Native によるクロスプラットフォーム開発\n✅ UI/UXデザインからリリースまで一貫対応\n✅ App Store / Google Play への申請サポート\n✅ リリース後の保守・アップデート\n\nまずは無料でヒアリングいたします！`,
      },
    ],
  },

  // --- 導入・流れ ---
  flow: {
    label: '📋 導入・流れ',
    questions: [
      {
        triggers: ['流れ', 'プロセス', '手順', 'どうすれば', '始め方', 'ステップ', '進め方'],
        answer: `ご依頼から納品までの流れをご説明します。\n\n【STEP 1】 無料相談・ヒアリング\n課題や要件をお聞きします（約1〜2時間）\n\n【STEP 2】 提案・お見積もり\n最適なプランと費用感をご提示します（1週間以内）\n\n【STEP 3】 契約・キックオフ\n合意後、開発チームをアサインします\n\n【STEP 4】 設計・開発\n定期的な進捗報告を行いながら開発します\n\n【STEP 5】 テスト・納品\n品質確認後、本番リリース\n\n【STEP 6】 保守・サポート\n運用開始後も継続してサポートします`,
      },
      {
        triggers: ['期間', 'いつ', 'どれくらい', 'スケジュール', '納期'],
        answer: `開発期間はプロジェクト規模によって異なります。\n\n【目安】\n・シンプルなWebサイト：1〜2ヶ月\n・業務システム：3〜6ヶ月\n・大規模システム：6ヶ月〜1年\n・アプリ開発：3〜6ヶ月\n\n急ぎの場合はご相談ください。スピード対応プランもご用意しています。`,
      },
      {
        triggers: ['契約', '発注', '依頼'],
        answer: `ご契約の流れは以下の通りです。\n\n1. 無料相談・ヒアリング\n2. 提案書・見積書のご提示\n3. 内容の確認・調整\n4. 契約書の締結（電子契約対応可）\n5. 着手金のお支払い（目安：契約金額の50%）\n6. 開発スタート\n\n不明な点はお気軽にご質問ください。`,
      },
    ],
  },

  // --- サポート・対応時間 ---
  support: {
    label: '🕐 サポート・対応時間',
    questions: [
      {
        triggers: ['サポート', '対応', 'サービス時間', '問い合わせ', '連絡'],
        answer: `サポート対応時間は以下の通りです。\n\n📞 電話サポート\n平日 9:00〜18:00\n\n📧 メール・チャット\n24時間受付（返信：翌営業日以内）\n\n🚨 緊急対応\n保守契約のお客様は24時間365日の緊急対応が可能です。\n\nお気軽にご連絡ください！`,
      },
      {
        triggers: ['営業時間', '営業日', '休み', '祝日', '土日'],
        answer: `営業時間は以下の通りです。\n\n🗓️ 営業日：月曜〜金曜\n🕐 営業時間：9:00〜18:00\n🚫 休業日：土・日・祝日・年末年始\n\n※保守契約のお客様は休日の緊急対応も承っています。`,
      },
      {
        triggers: ['緊急', '障害', 'トラブル', '停止', 'エラー'],
        answer: `緊急時の対応についてご案内します。\n\n🚨 緊急連絡先\n保守契約のお客様には専用の緊急連絡先をご提供しています。\n\n⏱️ 初動対応目標\n・重大障害（サービス停止）：1時間以内\n・軽微な障害：4時間以内\n\nまずはお問い合わせフォームまたはお電話にてご連絡ください。`,
      },
    ],
  },
};

// ==========================================
// チャットボット初期化
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initChatbot();
});

function initChatbot() {
  const chatbot       = document.getElementById('chatbot');
  const trigger       = document.getElementById('chatbotTrigger');
  const closeBtn      = document.getElementById('chatbotClose');
  const body          = document.getElementById('chatbotBody');
  const input         = document.getElementById('chatbotInput');
  const sendBtn       = document.getElementById('chatbotSend');

  if (!chatbot) return;

  let isOpen = false;

  // チャットを開く／閉じるトグル
  trigger.addEventListener('click', () => {
    isOpen = !isOpen;
    chatbot.classList.toggle('open', isOpen);

    // 初回オープン時にウェルカムメッセージを表示
    if (isOpen && body.children.length === 0) {
      showWelcomeMessage(body);
    }
  });

  // 閉じるボタン
  closeBtn.addEventListener('click', () => {
    isOpen = false;
    chatbot.classList.remove('open');
  });

  // 送信ボタン
  sendBtn.addEventListener('click', () => handleUserInput(input, body));

  // Enterキーで送信（Shift+Enterは改行）
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserInput(input, body);
    }
  });
}

// ==========================================
// ウェルカムメッセージの表示
// ==========================================
function showWelcomeMessage(body) {
  appendBotMessage(
    body,
    'こんにちは！株式会社サンプルのサポートBotです😊\n\nよくあるご質問をカテゴリからお選びいただくか、お気軽にご質問をどうぞ。',
    getCategoryQuickReplies()
  );
}

/**
 * カテゴリ選択のクイックリプライを返す
 * @returns {string[]}
 */
function getCategoryQuickReplies() {
  return Object.values(FAQ_DATA).map(cat => cat.label);
}

// ==========================================
// ユーザー入力の処理
// ==========================================
function handleUserInput(input, body) {
  const text = input.value.trim();
  if (!text) return;

  // ユーザーメッセージを表示
  appendUserMessage(body, text);
  input.value = '';

  // タイピングアニメーションを表示してから回答
  const typingEl = appendTyping(body);
  setTimeout(() => {
    typingEl.remove();
    const response = getResponse(text);
    appendBotMessage(body, response.answer, response.quickReplies || null);
  }, 700 + Math.random() * 400); // 少しランダム感を出す
}

// ==========================================
// 応答テキストの取得（キーワードマッチング）
// ==========================================
/**
 * ユーザーの入力テキストからFAQを検索して回答を返す
 * @param {string} text - ユーザーの入力
 * @returns {{ answer: string, quickReplies?: string[] }}
 */
function getResponse(text) {
  const normalized = text.toLowerCase().replace(/\s+/g, '');

  // カテゴリラベルが直接選択された場合（クイックリプライ）
  for (const [, category] of Object.entries(FAQ_DATA)) {
    const labelNorm = category.label.replace(/^.+?\s/, '').toLowerCase(); // 絵文字を除いた部分
    if (text.includes(category.label) || normalized.includes(labelNorm)) {
      // そのカテゴリの代表的な質問一覧をクイックリプライで返す
      const replies = category.questions.flatMap(q =>
        q.quickReplies ? q.quickReplies : []
      );
      return {
        answer: `${category.label} についてのよくある質問です。\n以下からご選択いただくか、具体的な質問を入力してください。`,
        quickReplies: replies.length
          ? replies
          : category.questions[0].triggers.slice(0, 3).map(t => `${t}について知りたい`),
      };
    }
  }

  // トリガーキーワードでFAQを検索
  for (const [, category] of Object.entries(FAQ_DATA)) {
    for (const qa of category.questions) {
      const matched = qa.triggers.some(trigger =>
        normalized.includes(trigger.toLowerCase())
      );
      if (matched) {
        return {
          answer: qa.answer,
          quickReplies: qa.quickReplies || ['他の質問を見る', 'お問い合わせする'],
        };
      }
    }
  }

  // マッチしない場合のフォールバック
  return {
    answer: `ご質問ありがとうございます。\n申し訳ありませんが、その内容はBotでは対応できませんでした😥\n\n以下のカテゴリからお探しいただくか、直接お問い合わせください。`,
    quickReplies: [...getCategoryQuickReplies(), 'お問い合わせフォームへ'],
  };
}

// ==========================================
// DOM操作：メッセージ追加ユーティリティ
// ==========================================

/**
 * ボットのメッセージを追加する
 * @param {HTMLElement} body - チャットボディ要素
 * @param {string} text - メッセージテキスト（\nで改行可）
 * @param {string[]|null} quickReplies - クイックリプライの選択肢
 */
function appendBotMessage(body, text, quickReplies = null) {
  const wrapper = document.createElement('div');
  wrapper.className = 'chat-message chat-message--bot';

  const bubble = document.createElement('div');
  bubble.className = 'chat-message__bubble';
  // 改行をHTMLのbrタグに変換（XSS対策でtextContentを使用してからHTMLを生成）
  bubble.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
  wrapper.appendChild(bubble);

  body.appendChild(wrapper);

  // クイックリプライがあれば追加
  if (quickReplies && quickReplies.length > 0) {
    const repliesEl = createQuickReplies(quickReplies, body);
    body.appendChild(repliesEl);
  }

  scrollToBottom(body);
}

/**
 * ユーザーのメッセージを追加する
 * @param {HTMLElement} body - チャットボディ要素
 * @param {string} text - メッセージテキスト
 */
function appendUserMessage(body, text) {
  const wrapper = document.createElement('div');
  wrapper.className = 'chat-message chat-message--user';

  const bubble = document.createElement('div');
  bubble.className = 'chat-message__bubble';
  bubble.textContent = text;
  wrapper.appendChild(bubble);

  body.appendChild(wrapper);
  scrollToBottom(body);
}

/**
 * タイピングアニメーションを追加する
 * @param {HTMLElement} body - チャットボディ要素
 * @returns {HTMLElement} タイピング要素（削除用に返す）
 */
function appendTyping(body) {
  const wrapper = document.createElement('div');
  wrapper.className = 'chat-message chat-message--bot';

  const typing = document.createElement('div');
  typing.className = 'chat-typing';
  typing.innerHTML = '<span></span><span></span><span></span>';
  wrapper.appendChild(typing);

  body.appendChild(wrapper);
  scrollToBottom(body);
  return wrapper;
}

/**
 * クイックリプライボタン群を生成する
 * @param {string[]} replies - 選択肢のテキスト
 * @param {HTMLElement} body - チャットボディ要素
 * @returns {HTMLElement}
 */
function createQuickReplies(replies, body) {
  const container = document.createElement('div');
  container.className = 'chat-quick-replies';

  replies.forEach(replyText => {
    const btn = document.createElement('button');
    btn.className = 'chat-quick-reply';
    btn.textContent = replyText;

    btn.addEventListener('click', () => {
      // お問い合わせフォームへのリンク対応
      if (replyText.includes('お問い合わせフォームへ')) {
        // クイックリプライを非活性化
        container.querySelectorAll('.chat-quick-reply').forEach(b => b.disabled = true);
        appendUserMessage(body, replyText);

        const typingEl = appendTyping(body);
        setTimeout(() => {
          typingEl.remove();
          appendBotMessage(
            body,
            'お問い合わせフォームからご連絡ください。\n担当者より2営業日以内にご返信いたします😊',
            null
          );
          // スムーズスクロールでフォームへ移動
          setTimeout(() => {
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
          }, 500);
        }, 600);
        return;
      }

      // 通常のクイックリプライ処理
      container.querySelectorAll('.chat-quick-reply').forEach(b => b.disabled = true);
      appendUserMessage(body, replyText);

      const typingEl = appendTyping(body);
      setTimeout(() => {
        typingEl.remove();
        const response = getResponse(replyText);
        appendBotMessage(body, response.answer, response.quickReplies || null);
      }, 700);
    });

    container.appendChild(btn);
  });

  return container;
}

// ==========================================
// ヘルパー関数
// ==========================================

/**
 * チャットボディを最下部にスクロールする
 * @param {HTMLElement} body
 */
function scrollToBottom(body) {
  requestAnimationFrame(() => {
    body.scrollTop = body.scrollHeight;
  });
}

/**
 * HTMLエスケープ（XSS対策）
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
