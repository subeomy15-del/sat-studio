#!/bin/zsh
set -e
cd "$(dirname "$0")"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
mkdir -p .runtime
if ! curl --fail --silent --max-time 2 http://127.0.0.1:11434/api/tags >/dev/null; then
  if command -v ollama >/dev/null; then
    margin_models="$HOME/Documents/Codex/2026-09-21/hey/work/ollama-models"
    if [[ -d "$margin_models/manifests" ]]; then
      export OLLAMA_MODELS="$margin_models"
    fi
    nohup ollama serve >.runtime/ollama.log 2>&1 &
    disown
  fi
fi
if ! curl --fail --silent --max-time 2 http://127.0.0.1:4317/api/health >/dev/null; then
  if ! command -v node >/dev/null; then
    echo 'Margin needs Node.js 24 or newer. Install it and open this launcher again.'
    read -k 1
    exit 1
  fi
  nohup node --env-file-if-exists=.env server.mjs >.runtime/server.log 2>&1 &
  disown
  for attempt in {1..30}; do
    if curl --fail --silent --max-time 1 http://127.0.0.1:4317/api/health >/dev/null; then break; fi
    sleep 1
  done
fi
if curl --fail --silent --max-time 3 http://127.0.0.1:4317/api/health >/dev/null; then
  open http://127.0.0.1:4317
  echo 'Margin is open in your browser. You can close this window.'
else
  echo 'Margin could not start. Check .runtime/server.log in this folder.'
  read -k 1
  exit 1
fi
