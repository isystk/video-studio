SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c

BASE_DIR      := $(CURDIR)
DOCKER_HOME   := $(BASE_DIR)/docker
COMPOSE_FILE  := $(DOCKER_HOME)/docker-compose.yml
DOCKER_CMD    := docker compose -f $(COMPOSE_FILE)
EXEC          := $(DOCKER_CMD) exec remotion
C_BASE        := /workspace
C_REMOTION    := $(C_BASE)/remotion
C_SCRIPTS     := $(C_BASE)/docker/scripts

COMP        ?= Sample
OUT         ?= $(BASE_DIR)/output/out.mp4
WORK        ?=
TEXT        ?= テキストを指定してください
SPEAKER     ?= 1

C_OUT = $(patsubst $(BASE_DIR)/%,$(C_BASE)/%,$(abspath $(OUT)))

.DEFAULT_GOAL := help

.PHONY: help
help: ## ヘルプを表示します。
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "} {printf "%-22s %s\n", $$1, $$2}'

# --- Docker ---

.PHONY: init
init: ## イメージ・ボリュームを初期化します（コンテナ・ローカルイメージ・キャッシュを全削除）。
	$(DOCKER_CMD) down --rmi local --volumes
	rm -rf "$(BASE_DIR)/remotion/public/current" && mkdir -p "$(BASE_DIR)/remotion/public/current"

.PHONY: up
up: ## コンテナを起動します（remotionはnpm install自動実行）。
	@for d in works output; do [ -e "$(BASE_DIR)/$$d" ] || [ -L "$(BASE_DIR)/$$d" ] || mkdir -p "$(BASE_DIR)/$$d"; done
	docker network inspect docker_default >/dev/null 2>&1 || docker network create docker_default
	$(DOCKER_CMD) up -d --wait

.PHONY: down
down: ## コンテナを停止します。
	$(DOCKER_CMD) down

.PHONY: restart
restart: ## コンテナを再起動します。
	@$(MAKE) down
	@$(MAKE) up

.PHONY: ps
ps: ## コンテナの状態を表示します。
	$(DOCKER_CMD) ps

.PHONY: logs
logs: ## コンテナのログを表示します。
	$(DOCKER_CMD) logs -f

# --- VOICEVOX ---

.PHONY: voicevox-gen
voicevox-gen: ## 音声を生成します。 (TEXT="..." OUT=path/to/output.wav SPEAKER=1)
	@$(EXEC) bash -c 'mkdir -p "$(dir $(C_OUT))" && curl -s -X POST "http://voicevox:50021/audio_query?speaker=$(SPEAKER)" --get --data-urlencode "text=$(TEXT)" | curl -s -X POST "http://voicevox:50021/synthesis?speaker=$(SPEAKER)" -H "Content-Type: application/json" -d @- -o "$(C_OUT)"'
	@echo "Generated: $(OUT)"

.PHONY: voicevox-speakers
voicevox-speakers: ## 利用可能な話者一覧を表示します。
	@$(EXEC) bash -c 'curl -s http://voicevox:50021/speakers | jq .'

# --- Remotion ---

.PHONY: generate-registry
generate-registry: ## works/*/video.config.json からCompositionレジストリを生成します。
	@$(EXEC) bash $(C_SCRIPTS)/generate-registry.sh "$(WORK)"

.PHONY: copy-assets
copy-assets: ## worksアセットと共有assetsをremotionのpublicにコピーします。 (WORK=works/YYYY-MM-DD_タイトル で特定フォルダ指定可、省略時は最新)
	@$(EXEC) bash $(C_SCRIPTS)/copy-assets.sh "$(WORK)"
	@$(MAKE) generate-registry

.PHONY: install
install: ## Remotionの依存パッケージを再インストールします。
	$(EXEC) bash -c 'cd $(C_REMOTION) && npm install'

.PHONY: ensure-registry
ensure-registry:
	@[ -f "$(BASE_DIR)/remotion/src/registry.json" ] || $(MAKE) generate-registry

.PHONY: studio
studio: ensure-registry ## Remotion Studioを起動します。
	$(EXEC) bash -c 'cd $(C_REMOTION) && npx remotion studio src/index.ts'

.PHONY: render
render: ensure-registry ## 動画をレンダリングします。 (COMP=Sample OUT=output/out.mp4)
	$(EXEC) bash -c 'cd $(C_REMOTION) && npx remotion render src/index.ts $(COMP) $(C_OUT)'

.PHONY: render-work
render-work: ## JSON設定で動画をレンダリングします。 (WORK=works/YYYY-MM-DD_タイトル)
	@if [ -z "$(WORK)" ]; then \
	  echo "エラー: WORK を指定してください（例: WORK=works/2026-05-14_タイトル）"; \
	  exit 1; \
	fi
	@$(MAKE) copy-assets WORK=$(WORK)
	$(EXEC) bash $(C_SCRIPTS)/render-work.sh "$(WORK)"
