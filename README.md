# video-studio

JSON の設定ファイルと Docker だけで、縦型ショート動画（1080×1920 / 30fps）を作る動画制作パイプラインです。
映像の合成に [Remotion](https://www.remotion.dev/)、ナレーションの生成に [VOICEVOX](https://voicevox.hiroshiba.jp/) を使います。
台本や設定ファイルを Claude Code などの AI に書かせる運用を想定していますが、手で書いても使えます。

## 特長

- **JSON 駆動**: `video.config.json` を書くだけで動画になります。Remotion のコードは変更不要です。
- **Docker だけで動作**: Node.js・ffmpeg・jq・日本語フォントはコンテナに入っています。ホストへのインストールは不要です。
- **素材なしで試せる**: BGM・映像クリップ・ロゴなしで描画できるサンプルを同梱しています。
- **ショート動画向けの部品**: 字幕、エンドカード、広告尺向けの常時表示テロップ、BGM、複数の音声トラック、動画・静止画レイヤー（静止画はゆっくりズーム）。
- **`Infographic` コンポジション**: 見出し・手順・比較・リスト・価格ボード・ニュースカードなどを静止画（PNG）として出力できます。

## 必要な環境

- Docker（Docker Compose v2）
- make
- ディスクの空き容量（目安 10GB 以上。VOICEVOX のイメージが約 4.7GB、Remotion 用のイメージが約 2.5GB です）

## クイックスタート

```bash
git clone https://github.com/isystk/video-studio.git
cd video-studio

# コンテナをビルドして起動します（初回はイメージの取得とビルドに数分かかります）
make up

# 同梱のサンプルを動画にします → output/sample.mp4
make render-work WORK=examples/sample
```

Remotion Studio（ブラウザのプレビュー）で確認するには、次を実行して <http://localhost:3000> を開きます。

```bash
make copy-assets WORK=examples/sample
make studio
```

使い終わったら `make down` でコンテナを停止します。

## 自分の動画を作る

### 1. 作業フォルダを作る

```bash
mkdir -p works/$(date +%Y-%m-%d)_my-video/{audio,assets}
```

### 2. ナレーションを作る（VOICEVOX）

```bash
# 利用できる話者の一覧
make voicevox-speakers

# テキストから WAV を生成（SPEAKER は話者のスタイル ID）
make voicevox-gen TEXT="ここにナレーション" OUT=works/YYYY-MM-DD_my-video/audio/01_hook.wav SPEAKER=3
```

音声の長さは ffprobe で測り、設定ファイルの秒数に反映します。

```bash
docker compose -f docker/docker-compose.yml exec remotion ffprobe -v quiet \
  -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 \
  works/YYYY-MM-DD_my-video/audio/01_hook.wav
```

### 3. 設定ファイルを書く

サンプルをコピーして編集します。字幕・音声・映像・エンドカードの内容とタイミングをすべてここに書きます。
各項目の意味は [docs/video-config.md](docs/video-config.md) を参照してください。

```bash
cp examples/sample/video.config.json works/YYYY-MM-DD_my-video/video.config.json
```

### 4. 確認して書き出す

```bash
make copy-assets WORK=works/YYYY-MM-DD_my-video   # 素材を Remotion に取り込む
make studio                                       # プレビュー（http://localhost:3000）
make render-work WORK=works/YYYY-MM-DD_my-video   # → output/YYYY-MM-DD_my-video.mp4
```

制作手順の詳細とトラブル対応は [docs/動画制作手順書.md](docs/動画制作手順書.md) にまとめています。

## ディレクトリ構成

```
.
├── assets/                  # 複数の動画で共有する素材（各自で用意。中身は Git 管理外）
│   ├── bgm/                 #   BGM（mp3）
│   ├── clips/               #   映像クリップ（mp4）
│   └── images/              #   ロゴなどの画像
├── works/                   # 動画ごとの作業フォルダ（Git 管理外）
│   └── YYYY-MM-DD_タイトル/
│       ├── video.config.json  # 動画の設定
│       ├── audio/             # ナレーション音声
│       └── assets/            # この動画だけで使う素材（画面録画など）
├── output/                  # 書き出した動画（Git 管理外）
├── examples/sample/         # 素材なしで動くサンプル設定
├── remotion/                # Remotion プロジェクト（DynamicVideo・Infographic など）
├── docker/                  # docker-compose.yml・Dockerfile・補助スクリプト
├── docs/                    # 手順書・設定リファレンス
└── Makefile                 # 操作コマンド
```

`works/` と `output/` は、別の場所（外付けドライブなど）に置くこともできます。
`docker/.env.example` を `docker/.env` にコピーして、実際のパスを書いてください。未設定ならリポジトリ直下の `works/` と `output/` を使います。

## コマンド一覧

`make help` で一覧を表示できます。

| コマンド | 内容 |
|---|---|
| `make up` / `make down` | コンテナの起動 / 停止 |
| `make init` | コンテナ・ローカルイメージ・ボリュームを削除して初期化 |
| `make voicevox-gen` | ナレーション音声を生成（`TEXT` `OUT` `SPEAKER`） |
| `make voicevox-speakers` | 話者の一覧を表示 |
| `make copy-assets` | 作業フォルダと共有素材を Remotion に取り込み、レジストリを再生成（`WORK` 省略時は最新の作業フォルダ） |
| `make generate-registry` | `video.config.json` から Composition の一覧を生成 |
| `make studio` | Remotion Studio を起動 |
| `make render-work` | 設定ファイルから動画を書き出す（`WORK` 必須） |
| `make render` | Composition の ID を指定して書き出す（`COMP` `OUT`） |

## 素材とライセンスの注意

このリポジトリには、BGM・映像クリップ・ロゴ・音声などの素材は含まれていません。`assets/` は空です。
素材やツールの利用条件は、利用者の責任で確認してください。

- **Remotion**: 独自ライセンスです。個人・3 名以下のチーム・非営利団体は無償で、それ以外は有償の Company License が必要です。最新の条件は [License FAQ](https://www.remotion.dev/docs/license/faq) を確認してください。
- **VOICEVOX**: 商用利用できますが、VOICEVOX を利用したことが分かる表記が必要です。音声ライブラリ（キャラクター）ごとの規約にも従います。[利用規約](https://voicevox.hiroshiba.jp/term/)
- **BGM**: 配布サイトの規約に従います。たとえば DOVA-SYNDROME は音源ファイルの再配布を禁止しているため、BGM を公開リポジトリにコミットしないでください。
- **AI 生成の映像**（Google Flow など）: 各サービスの規約に従います。
- **Infographic の価格・ニュース表示**: データ提供元の利用規約と出典表記を確認してください。

## ライセンス

このリポジトリのコードは [MIT License](LICENSE) です。上記の依存ツール・素材には、それぞれ別のライセンスが適用されます。

## Author

[isystk](https://github.com/isystk)
