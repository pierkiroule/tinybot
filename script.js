import * as webllm from "https://esm.run/webllm";

const chatEl = document.getElementById("chat");
const formEl = document.getElementById("composer");
const inputEl = document.getElementById("message-input");
const statusEl = document.getElementById("model-status");
const sendBtn = document.getElementById("send");

let enginePromise;
const messages = [
  {
    role: "system",
    content:
      "Tu es un compagnon d'échange bienveillant. Réponds de façon brève et claire.",
  },
];

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
  statusEl.textContent = "Chargement du modèle…";
  sendBtn.disabled = true;
  inputEl.disabled = true;

  enginePromise = webllm.CreateEngine({
    model:
      "https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q0f32-MLC/resolve/main/",
    initProgressCallback: (info) => {
      if (info?.text) {
        statusEl.textContent = info.text;
      }
    },
  });

  try {
    await enginePromise;
    statusEl.textContent = "Modèle chargé. Commence à écrire.";
  } catch (error) {
    statusEl.textContent = "Erreur de chargement. Réessaie plus tard.";
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

    if (reply) {
      appendMessage("assistant", reply);
    }
  } catch (error) {
    placeholder.remove();
    appendMessage(
      "assistant",
      "Je rencontre un souci pour répondre maintenant. Merci de réessayer."
    );
    console.error(error);
  } finally {
    sendBtn.disabled = false;
    inputEl.focus();
  }
});
