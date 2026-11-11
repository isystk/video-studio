# video-studio プロジェクト情報

台本からショート動画のレンダリングまでを、JSON 設定で進める動画制作パイプライン（縦型 1080×1920、30fps）。
利用者向けの説明は [README.md](README.md)、設定の詳細は [docs/video-config.md](docs/video-config.md)、制作手順は [docs/動画制作手順書.md](docs/動画制作手順書.md)。

## 技術スタック

| レイヤー | 技術 |
|---|---|
| 動画合成 | Remotion（React / TypeScript） |
| 音声合成 | VOICEVOX |
| AI 動画生成 | Google Flow / Veo 3.1 など（手動） |
| 実行環境 | Docker（Node.js / ffmpeg / jq / 日本語フォント） |

## 作業の方針

- ドキュメントとコミットメッセージは日本語で書く。技術用語・コード識別子は原文のまま。
- 回答は簡潔にまとめる。
- 動画ごとの内容は `video.config.json` に書き、Remotion のコードは変更しない。
- BGM・映像クリップ・ロゴ・音声などの素材はコミットしない（`assets/` の中身と `works/`・`output/` は Git 管理外）。

## 制作フロー

| # | ステップ | 担当 | ツール |
|---|---|---|---|
| 1 | works フォルダを作る | AI | Claude Code など |
| 2 | 台本を書く（`01_script.md`） | AI | 同上 |
| 3 | 映像生成用のプロンプトを書く（`02_flow-prompts.md`） | AI | 同上 |
| 4 | 音声を生成する | AI | VOICEVOX |
| 5 | 映像クリップを生成する | 手動 | Google Flow など |
| 6 | 画面録画をする | 手動 | OS 標準の録画など |
| 7 | `video.config.json` を書く | AI | Claude Code など |
| 8 | プレビューで確認・調整する | 手動 | Remotion Studio |
| 9 | 書き出す | 手動 | `make render-work` |

## ディレクトリ規則

```
works/YYYY-MM-DD_タイトル/
├── video.config.json   # 動画の設定（タイミング・字幕・素材のパスをすべて定義）
├── 01_script.md        # 台本
├── 02_flow-prompts.md  # 映像生成用のプロンプト
├── audio/              # VOICEVOX の音声（動画ごと）
└── assets/             # 画面録画など（動画ごと）

assets/                 # 複数の動画で共有する素材（各自で用意。中身は Git 管理外）
├── bgm/
├── clips/
└── images/
```

素材の名前: 映像クリップ・BGM は内容を英語で表す（`city-night-timelapse.mp4`）、画面録画は `screen_` を付ける、音声は連番 + セクション名（`01_hook.wav`）。

## コマンド

```bash
make up                                          # コンテナを起動（VOICEVOX・Remotion）
make down                                        # コンテナを停止
make voicevox-gen TEXT="..." OUT=works/.../audio/01_hook.wav SPEAKER=3   # 音声を生成
make copy-assets WORK=works/YYYY-MM-DD_タイトル  # 素材を remotion/public/current/ に取り込み、レジストリも再生成
make generate-registry                           # works/*/video.config.json → registry.json
make studio                                      # Remotion Studio（http://localhost:3000）
make render-work WORK=works/YYYY-MM-DD_タイトル  # 設定ファイルから書き出し（推奨）
make render COMP=Sample OUT=output/xxx.mp4       # Composition の ID を指定して書き出し
```

## JSON 駆動の仕組み

動画固有のデータはすべて `video.config.json` に書く。`make copy-assets` が `remotion/src/registry.json`（生成物・Git 管理外）を作り、`Root.tsx` がそれを読んで Composition を登録する。`Root.tsx` を手で編集する必要はない。

新しい動画を作る手順:

1. `works/YYYY-MM-DD_タイトル/` を作る。
2. `examples/sample/video.config.json` か既存の設定をコピーして編集する。
3. 音声を生成し、ffprobe で秒数を測って `audioTracks` と `subtitles` の `startSec` / `endSec` を更新する。
4. `make render-work WORK=works/YYYY-MM-DD_タイトル`（`copy-assets` とレジストリ生成も自動実行）。

## Remotion の構成

| ファイル | 役割 |
|---|---|
| `remotion/src/types/VideoConfig.ts` | `video.config.json` の型定義 |
| `remotion/src/compositions/DynamicVideo.tsx` | 設定ファイルを読んで描画する汎用コンポーネント |
| `remotion/src/compositions/Infographic.tsx` | 静止画（PNG）を作るテンプレート集 |
| `remotion/src/components/Subtitle.tsx` | 字幕（画面上から 38%、80px） |
| `remotion/src/Root.tsx` | `registry.json` から Composition を動的に登録 |

## 制約と注意

- 映像生成サービスには 1 クリップの長さの上限がある（Google Flow の Veo 3.1 は最大 8 秒）。`loop: true` で延長する。
- 縦型 9:16（1080×1920）をプロンプトに明記する。
- `Root.tsx` では `React.lazy` を使わず、直接 import する（使うと React error #306）。
- 素材・ツールの利用条件（Remotion・VOICEVOX・BGM・生成映像）は README の「素材とライセンスの注意」を参照。

## よくあるエラー

| エラー | 対処 |
|---|---|
| 映像が表示されない | `make copy-assets WORK=...` を実行する |
| 音声がずれる | `ffprobe` で実測して `startSec` / `endSec` を更新する |
| Studio に Composition が出ない | `make generate-registry` でレジストリを再生成する |
| `docker network` のエラー | `make up` がネットワーク `docker_default` を作る（手動なら `docker network create docker_default`） |
| 映像クリップが短い | `loop: true` を設定する |
| TS6059（rootDir） | `tsconfig.json` の `rootDir` を削除する |
