/* ==========================================
    server.js
    Express サーバー：静的ファイル配信 +
    Claude API プロキシエンドポイント
    ========================================== */
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3456;

// Claude API クライアント初期化
const anthropic = new Anthropic({
       apiKey: process.env.ANTHROPIC_API_KEY,
});

// JSON ボディパーサー
app.use(express.json());

// 静的ファイル配信（index.html, css, js など）
app.use(express.static(path.join(__dirname)));

/* ------------------------------------------
    POST /api/chat
    チャットボットの会話を処理するエンドポイント
    Claude API にストリーミングでリクエストを送る
    ------------------------------------------ */
app.post('/api/chat', async (req, res) => {
       const { messages } = req.body;

             // リクエストバリデーション
             if (!messages || !Array.isArray(messages) || messages.length === 0) {
                        return res.status(400).json({ error: 'メッセージが不正です。' });
             }

             // SSE（Server-Sent Events）ヘッダーを設定
             res.setHeader('Content-Type', 'text/event-stream');
       res.setHeader('Cache-Control', 'no-cache');
       res.setHeader('Connection', 'keep-alive');
       res.setHeader('Access-Control-Allow-Origin', '*');

             try {
                        // API キー確認ログ
           console.log('ANTHROPIC_API_KEY set:', !!process.env.ANTHROPIC_API_KEY);
                        console.log('API key prefix:', process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.substring(0, 10) : 'NOT SET');

           // Claude API にストリーミングリクエスト
           const stream = await anthropic.messages.stream({
                          model: 'claude-3-5-sonnet-20241022',
                          max_tokens: 1024,
                          system: `あなたは株式会社サンプルのカスタマーサポートAIアシスタントです。
                          当社はIT・Web・システム開発を専門とする企業で、BtoB・BtoCの両方のお客様にサービスを提供しています。

                          【主なサービス】
                          - Webサイト・ランディングページ制作
                          - 業務システム・社内ツール開発
                          - スマートフォンアプリ開発（iOS/Android）
                          - クラウドインフラ構築・運用支援

                          【料金について】
                          - Webサイト制作：30万円〜（要件により変動）
                          - システム開発：50万円〜（規模・機能により変動）
                          - 保守・運用：月額3万円〜
                          - 無料相談・お見積もり対応可能

                          【導入フローについて】
                          1. 無料相談・ヒアリング（1〜2週間）
                          2. 提案・お見積もり提示（1週間）
                          3. ご契約・キックオフ
                          4. 開発・制作（要件により1〜6ヶ月）
                          5. テスト・検収
                          6. リリース・運用開始

                          【サポートについて】
                          - 営業時間：平日 9:00〜18:00
                          - 緊急対応：24時間365日（保守契約のお客様）
                          - 問い合わせ方法：メール・電話・チャット

                          以下のガイドラインに従って回答してください：
                          - 親切・丁寧・分かりやすく日本語で回答する
                          - 具体的な数字や事例を交えて回答する
                          - 不明な点は「詳細はお問い合わせください」と案内する
                          - 3〜5文程度の簡潔な回答を心がける
                          - 必要に応じてお問い合わせフォームへの誘導を行う`,
                          messages: messages,
           });

           // ストリーミングイベントを SSE で送信
           for await (const event of stream) {
                          if (
                                             event.type === 'content_block_delta' &&
                                             event.delta.type === 'text_delta'
                                         ) {
                                             // テキストチャンクを SSE フォーマットで送信
                              const data = JSON.stringify({ text: event.delta.text });
                                             res.write(`data: ${data}\n\n`);
                          }
           }

           // ストリーム終了を通知
           res.write('data: [DONE]\n\n');
                        res.end();

             } catch (error) {
                        console.error('Claude API エラー:', error);
                        // デバッグ用：実際のエラーメッセージをクライアントに送信
           const errorData = JSON.stringify({
                          error: `APIエラー: ${error.message || error.toString()}`,
                          debug: {
                                             type: error.constructor.name,
                                             status: error.status,
                                             apiKeySet: !!process.env.ANTHROPIC_API_KEY
                          }
           });
                        res.write(`data: ${errorData}\n\n`);
                        res.end();
             }
});

/* ------------------------------------------
    CORS プリフライトリクエスト対応
    ------------------------------------------ */
app.options('/api/chat', (req, res) => {
       res.setHeader('Access-Control-Allow-Origin', '*');
       res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
       res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
       res.sendStatus(204);
});

/* ------------------------------------------
    SPA フォールバック
    すべての未マッチルートは index.html を返す
    ------------------------------------------ */
app.get('*', (req, res) => {
       res.sendFile(path.join(__dirname, 'index.html'));
});

// サーバー起動
app.listen(PORT, () => {
       console.log(`🚀 サーバーが起動しました: http://localhost:${PORT}`);
       console.log(`ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? '設定済み ✅' : '未設定 ❌'}`);
});
