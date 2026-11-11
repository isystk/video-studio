# video.config.json リファレンス

動画 1 本の内容は、すべて `video.config.json` に書きます。Remotion のコードを変更する必要はありません。
型定義は [`remotion/src/types/VideoConfig.ts`](../remotion/src/types/VideoConfig.ts)、描画は [`DynamicVideo.tsx`](../remotion/src/compositions/DynamicVideo.tsx) が担当します。
動くサンプルは [`examples/sample/video.config.json`](../examples/sample/video.config.json) です。

## 全体像

```json
{
  "id": "MyVideo",
  "fps": 30,
  "width": 1080,
  "height": 1920,
  "durationSec": 30,
  "bgm": { "path": "current/bgm/my-bgm.mp3", "volume": 0.3 },
  "layers": [
    { "type": "video", "path": "current/clips/intro.mp4", "startSec": 0, "endSec": 8, "loop": true }
  ],
  "audioTracks": [
    { "path": "current/audio/01_hook.wav", "startSec": 0 }
  ],
  "subtitles": [
    { "startSec": 0, "endSec": 4, "text": "字幕の1行目\n2行目" }
  ],
  "endcard": {
    "startSec": 26,
    "mainText": "メインのテキスト",
    "ctaText": "↓ 概要欄をチェック",
    "disclaimerText": "免責などの小さな文章",
    "logoPath": "current/images/logo.png"
  },
  "logoMini": { "path": "current/images/logo-mini.png", "ranges": [{ "startSec": 0, "endSec": 8 }] },
  "persistentDisclaimer": "※ 常に表示する免責テロップ"
}
```

## 項目

### 基本

| 項目 | 必須 | 説明 |
|---|---|---|
| `id` | ○ | Composition の ID。作品ごとに重複しない名前にします。`make render-work` がこの ID で書き出します |
| `fps` | ○ | フレームレート。ショート動画では 30 が標準です |
| `width` / `height` | ○ | 解像度。縦型は 1080 / 1920 です |
| `durationSec` | ○ | 動画の長さ（秒） |

### `bgm`（任意）

| 項目 | 説明 |
|---|---|
| `path` | BGM のパス。全編でループ再生します |
| `volume` | 音量（0〜1）。ナレーションと両立させるなら 0.2〜0.3 が目安です |

### `layers[]`（映像・画像レイヤー）

配列の後ろにあるものほど手前に重なります。`startSec` 〜 `endSec` の間だけ表示します。

| 項目 | 対象 | 説明 |
|---|---|---|
| `type` | 共通 | `"video"` または `"image"` |
| `path` | 共通 | 素材のパス |
| `startSec` / `endSec` | 共通 | 表示する区間（秒） |
| `opacity` | 共通 | 不透明度（0〜1、既定 1）。オーバーレイ映像は 0.25 前後が目安です |
| `volume` | video | 映像の音量（既定 0。BGM とナレーションを別に扱うため通常は 0） |
| `loop` | video | `true` で素材が区間より短いときに繰り返します。AI 生成クリップのように短い素材の延長に使います |

`image` は区間のあいだ、ゆっくりズームします（1.0 倍 → 1.08 倍）。

### `audioTracks[]`（ナレーションなどの音声）

| 項目 | 説明 |
|---|---|
| `path` | 音声ファイルのパス |
| `startSec` | 再生を始める秒数。直前の音声の長さ（`ffprobe` で測った実測値）から決めます |
| `volume` | 音量（既定 1） |

### `subtitles[]`（字幕）

| 項目 | 説明 |
|---|---|
| `startSec` / `endSec` | 表示区間（秒）。前後 5 フレームでフェードします |
| `text` | 字幕。`\n` で改行します |

画面の上から 38% の位置に、80px の白文字で表示します。1080px 幅では 1 行 11 文字前後が目安で、超えると折り返します。

### `endcard`（最後の画面）

`startSec` から動画の終わりまで表示します。

| 項目 | 説明 |
|---|---|
| `startSec` | 表示を始める秒数 |
| `mainText` | 画面中央の大きな文章（80px、`\n` で改行可） |
| `ctaText` | その下の行動喚起（44px、金色） |
| `disclaimerText` | 下側の小さな文章（30px、灰色。免責・出典などに使います） |
| `logoPath` | 最下部のロゴ（幅 300px）。省略可 |

### `logoMini`（任意）

画面右下（下から 20px、右から 20px、幅 140px）に小さなロゴを重ねます。`ranges` に書いた区間だけ表示します。
映像クリップの隅に何かを重ねたい区間がある場合などに使います。重ねる内容が、素材の提供元の規約に反しないか確認してください。

| 項目 | 説明 |
|---|---|
| `path` | ロゴ画像のパス |
| `ranges[]` | 表示する区間（`startSec` / `endSec`）の配列 |

### `persistentDisclaimer`（任意）

動画の最初から `endcard.startSec` の直前まで、画面下部に常時表示する免責テロップです。
広告向けの短い尺（6 秒のバンパー広告など）では、エンドカードを長く出せません。そのような場合に設定すると、動画全体で免責が途切れません。

## 素材のパス

設定ファイルのパスは、`make copy-assets` が素材を取り込んだあとの場所（`remotion/public/current/`）を基準に書きます。

| 素材 | 置き場所 | 設定ファイルでのパス |
|---|---|---|
| ナレーション音声 | `works/<作業フォルダ>/audio/` | `current/audio/<ファイル名>` |
| この動画だけの素材（画面録画など） | `works/<作業フォルダ>/assets/` | `current/assets/<ファイル名>` |
| 共有の BGM | `assets/bgm/` | `current/bgm/<ファイル名>` |
| 共有の映像クリップ | `assets/clips/` | `current/clips/<ファイル名>` |
| 共有の画像（ロゴなど） | `assets/images/` | `current/images/<ファイル名>` |

取り込み時に、すべての mp4 を `faststart` 形式に変換します。ファイルが見つからなくてもエラーにならず、描画時に初めて欠落が分かります。素材の置き忘れに注意してください。

## Infographic コンポジション

`DynamicVideo` とは別に、静止画（PNG）を作る `Infographic` コンポジションがあります。
作った PNG は `layers` の `image` として使えます。

```bash
docker compose -f docker/docker-compose.yml exec remotion bash -c \
  'cd /workspace/remotion && npx remotion still src/index.ts Infographic /workspace/output/card.png --props=/workspace/works/card.props.json'
```

`--props` に渡す JSON の `template` で見た目を選びます。

| `template` | 使う項目 | 用途 |
|---|---|---|
| `hook` | `headline` | 冒頭の大きな見出し |
| `steps` | `title`, `steps[{label, sub}]` | 手順の一覧 |
| `compare` | `title`, `left{head, body}`, `right{head, body}` | 左右の比較 |
| `list` | `title`, `items[]` | 注意点などのリスト |
| `summary` | `title`, `headline` | まとめの見出し |
| `priceBoard` | `title`, `updatedAt`, `rows[{symbol, usd, jpy, change}]`, `news[]` | 銘柄・価格・騰落率の一覧 |
| `newsCard` | `page`, `headline`, `summary`, `source` | ニュース 1 件のカード |

共通の項目は次のとおりです。

| 項目 | 説明 |
|---|---|
| `bg` | 背景パターンを決める数値（同じ値なら同じ背景） |
| `bgImage` | 背景に敷く画像のパス（`remotion/public/` 基準）。指定すると `bg` は使いません |
| `brand` | `priceBoard` / `newsCard` の上部に出す名前。省略すると表示しません |
| `credit` | `priceBoard` の最下部に出す出典表記。省略すると表示しません |

`priceBoard` と `newsCard` は、データ提供元の利用規約と出典表記の要件を確認してから使ってください。
