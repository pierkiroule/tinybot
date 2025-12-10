const chatEl = document.getElementById("chat");
const formEl = document.getElementById("composer");
const inputEl = document.getElementById("message-input");
const statusEl = document.getElementById("model-status");
const sendBtn = document.getElementById("send");

const MODEL_PATH = "./models/qwen/";

const messages = [
  {
    role: "system",
    content:
      "Tu es Tiny Psybot, thérapeute numérique doux et concis. Réponds TOUJOURS en 1 phrase métaphorique courte (<=25 mots), ajoute un emoji, puis une ligne avec 3 tags en minuscules (format: #mot).",
  },
];

let enginePromise;
renderMessages();
initEngine();

function appendMessage(role, content) {
  messages.push({ role, content });
  renderMessages();
}

function renderMessages() {
  chatEl.innerHTML = "";

  messages
    .filter((msg) => msg.role !== "system")
    .forEach((msg) => {
      const wrapper = document.createElement("div");
      wrapper.className = `message ${msg.role}`;
      wrapper.textContent = msg.content;
      chatEl.appendChild(wrapper);
    });

  chatEl.scrollTop = chatEl.scrollHeight;
}

async function initEngine() {
  if (!window.webllm || typeof window.webllm.CreateEngine !== "function") {
    statusEl.textContent = "webllm.min.js manquant. Télécharge le bundle avant d'essayer.";
    sendBtn.disabled = true;
    inputEl.disabled = true;
    return;
  }

  statusEl.textContent = "Chargement du modèle local…";
  sendBtn.disabled = true;
  inputEl.disabled = true;

  enginePromise = window.webllm.CreateEngine({
    model: MODEL_PATH,
    chatOpts: { temperature: 0.7, max_tokens: 200 },
    initProgressCallback: (info) => {
      if (info?.text) {
        statusEl.textContent = info.text;
      }
    },
  });

  try {
    await enginePromise;
    statusEl.textContent = "Modèle local prêt. Écris ta question.";
  } catch (error) {
    statusEl.textContent = "Erreur de chargement. Vérifie les fichiers dans /models/qwen.";
    console.error(error);
  } finally {
    sendBtn.disabled = false;
    inputEl.disabled = false;
  }
}

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userInput = inputEl.value.trim();
  if (!userInput) return;

  appendMessage("user", userInput);
  inputEl.value = "";
  sendBtn.disabled = true;

  const placeholder = document.createElement("div");
  placeholder.className = "message assistant pending";
  placeholder.textContent = "…";
  chatEl.appendChild(placeholder);
  chatEl.scrollTop = chatEl.scrollHeight;

  try {
    const engine = await enginePromise;
    const response = await engine.chat.completions.create({
      messages,
      temperature: 0.7,
      max_tokens: 200,
    });

    const reply = response?.choices?.[0]?.message?.content?.trim();
    placeholder.remove();

    appendMessage("assistant", formatAssistantReply(reply));
  } catch (error) {
    placeholder.remove();
    appendMessage(
      "assistant",
      "Voile de brouillard… ✨\n#erreur #telechargement #reessaye"
    );
    console.error(error);
  } finally {
    sendBtn.disabled = false;
    inputEl.focus();
  }
});

function formatAssistantReply(text) {
  if (!text) {
    return "Comme une lanterne dans la brume, la patience éclaire le chemin ✨\n#psybot #webllm #qwen";
  }

  const [firstLine, ...rest] = text.split("\n");
  const cleaned = firstLine.trim();

  let emoji = "✨";
  const emojiMatch = cleaned.match(/[\p{Emoji}\p{Extended_Pictographic}]/u);
  if (emojiMatch) {
    emoji = emojiMatch[0];
  }

  const tags = extractTags(rest.join(" "));
  return `${cleaned} ${emoji}\n${tags.join(" ")}`;
}

function extractTags(text) {
  const normalized = text.toLowerCase();
  const found = Array.from(new Set((normalized.match(/#[a-z0-9_-]+/g) || []).slice(0, 3)));
  const defaults = ["#psybot", "#webllm", "#qwen"];

  if (found.length >= 3) return found;
  return [...found, ...defaults].slice(0, 3);
}
