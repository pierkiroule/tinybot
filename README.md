# Tiny Psybot — IA locale (WebLLM + Qwen Tiny)

Webapp statique qui tourne sur GitHub Pages sans backend. Elle charge le modèle **Qwen2.5-0.5B-Instruct-q0f32-MLC** depuis `/models/qwen/` et l'interprète dans le navigateur via WebLLM.

## Structure
- `index.html` — shell de la page, importe `webllm.min.js` et le front.
- `static/style.css` — thème sombre et layout du chat.
- `static/app.js` — logique de chat, chargement du modèle local, formatage métaphore + emoji + 3 tags.
- `models/qwen/` — dossier où placer les fichiers du modèle.
- `webllm.min.js` — bundle WebLLM (à télécharger).

## Téléchargement du modèle
Utilise le script ci-dessous depuis la racine du projet pour récupérer les artefacts Hugging Face et le bundle WebLLM :

```bash
mkdir -p models/qwen

files=(
  "mlc-chat-config.json"
  "ndarray-cache.json"
  "tensor-cache.json"
  "params_shard_0.bin"
  "params_shard_1.bin"
  "params_shard_2.bin"
  "params_shard_3.bin"
  "params_shard_4.bin"
  "params_shard_5.bin"
  "params_shard_6.bin"
  "params_shard_7.bin"
  "params_shard_8.bin"
  "params_shard_9.bin"
  "params_shard_10.bin"
  "params_shard_11.bin"
  "params_shard_12.bin"
  "params_shard_13.bin"
  "params_shard_14.bin"
  "params_shard_15.bin"
  "params_shard_16.bin"
  "params_shard_17.bin"
  "params_shard_18.bin"
  "params_shard_19.bin"
)

for f in "${files[@]}"; do
  curl -L -o models/qwen/$f \
  "https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q0f32-MLC/resolve/main/$f"
done

curl -L -o webllm.min.js \
"https://raw.githubusercontent.com/mlc-ai/web-llm/main/min/webllm.min.js"
```

> Remarque : dans cet environnement, le téléchargement direct peut être bloqué (erreur 403). Relance le script quand tu es connecté à Internet ou via Codespaces/HF autorisé.

## Utilisation
1. Ouvre `index.html` dans ton navigateur ou déploie sur GitHub Pages (racine `/`).
2. Attends que l'état affiche « Modèle local prêt ».
3. Envoie tes messages. Les réponses suivent le format métaphore courte + emoji + 3 tags.

## Déploiement Pages
1. Commite `index.html`, `static/`, `webllm.min.js` et le dossier `models/qwen/` (tous les fichiers du modèle).
2. Active GitHub Pages sur la branche principale, dossier racine.
3. L'URL finale sera du type `https://USERNAME.github.io/tinybot/`.
