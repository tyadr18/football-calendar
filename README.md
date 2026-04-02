# ⚽ Football Calendar

**主要サッカーリーグの試合日程・結果をカレンダー形式で確認できるWebアプリです。**

🔗 **デモ: https://football-calendar-six.vercel.app**

---

## 制作の背景

初めてのWebアプリ制作をしたかったので、自分が好きなサッカーをテーマに選びました。
「見たいリーグの日程をすぐ確認できる」というシンプルなニーズを起点に、
スクレイピング・API連携・UI設計までを一人で実装しました。

---

## 機能

- **8つのコンペティション**に対応（プレミアリーグ・チャンピオンズリーグ・J1リーグなど）
- **月間カレンダー表示**で試合日程を一覧確認
- **試合タイルをクリック**するとチームエンブレム・スコア・キックオフ時刻をモーダル表示
- **ライブ更新**対応（試合中はリアルタイムスコア表示）
- **日本語 / English 切り替え**
- TBA（対戦相手未定）試合は安全にグレーアウト表示

---

## 対応コンペティション

| フラグ | リーグ名 | API |
|--------|----------|-----|
| 🏴󠁧󠁢󠁥󠁮󠁧󠁿 | Premier League | football-data.org |
| ⭐ | UEFA Champions League | football-data.org |
| 🇪🇸 | La Liga | football-data.org |
| 🇩🇪 | Bundesliga | football-data.org |
| 🇮🇹 | Serie A | football-data.org |
| 🇫🇷 | Ligue 1 | football-data.org |
| 🇯🇵 | J1リーグ | api-football.com |
| 🌍 | FIFA World Cup | football-data.org |

---

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Next.js 14 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| データソース | football-data.org API / api-football.com |
| デプロイ | Vercel |

### 設計のポイント

- **APIキーをサーバーサイドで隠蔽** — Next.js の Route Handler 経由でのみ外部APIを呼び出し、クライアントにキーが漏れない構成
- **2つのAPIを統一インターフェースで管理** — football-data.org と api-football.com のレスポンス差異をアダプタ層で吸収
- **5分キャッシュ** — `next: { revalidate: 300 }` でレートリミット内に収める設計

---

## ローカルで動かす

```bash
git clone https://github.com/tyadr18/football-calendar.git
cd football-calendar
npm install
```

`.env.local` を作成してAPIキーを設定：

```env
FOOTBALL_DATA_API_KEY=your_key   # https://www.football-data.org/
API_FOOTBALL_KEY=your_key        # https://dashboard.api-football.com/
```

```bash
npm run dev
```

`http://localhost:3000` をブラウザで開いてください。

---

## 依頼・お問い合わせ

このアプリと同様の「**API連携・データ表示系Webアプリ**」の開発を受け付けています。

- 試合日程・スポーツデータ系アプリ
- 外部API連携を含むダッシュボード・管理画面
- Next.js / TypeScript を使ったWebアプリ全般

**Coconala / CrowdWorks / Lancers** にてご依頼いただけます。
お気軽にご相談ください。

---

## ライセンス

MIT
