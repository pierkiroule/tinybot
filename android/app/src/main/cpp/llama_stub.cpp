#include "llama_stub.h"

#include <llama.h>

#include <algorithm>
#include <mutex>
#include <string>
#include <thread>
#include <vector>

namespace tinyllama {

namespace {
constexpr int32_t kContextTokens = 512;
constexpr int32_t kPredictTokens = 128;
constexpr int32_t kBatchSize = 64;

std::mutex g_mutex;
llama_model *g_model = nullptr;
llama_context *g_ctx = nullptr;

void release_model_locked() {
    if (g_ctx) {
        llama_free(g_ctx);
        g_ctx = nullptr;
    }
    if (g_model) {
        llama_free_model(g_model);
        g_model = nullptr;
    }
}
} // namespace

bool load_model(const std::string &path) {
    std::lock_guard<std::mutex> lock(g_mutex);

    llama_backend_init();

    release_model_locked();

    llama_model_params model_params = llama_model_default_params();
    model_params.use_mmap = true;

    g_model = llama_load_model_from_file(path.c_str(), model_params);
    if (!g_model) {
        return false;
    }

    llama_context_params ctx_params = llama_context_default_params();
    ctx_params.n_ctx = kContextTokens;
    ctx_params.n_batch = kBatchSize;
    ctx_params.seed = 1234;
    ctx_params.n_threads = std::max(1u, std::thread::hardware_concurrency());

    g_ctx = llama_new_context_with_model(g_model, ctx_params);
    return g_ctx != nullptr;
}

std::string run_inference(const std::string &prompt) {
    std::lock_guard<std::mutex> lock(g_mutex);
    if (!g_ctx || !g_model) {
        return "Model not loaded";
    }

    llama_kv_cache_clear(g_ctx);

    std::vector<llama_token> tokens = ::llama_tokenize(g_model, prompt, true);

    const int batch_slots = std::max<int>(kBatchSize, tokens.size());
    llama_batch batch = llama_batch_init(batch_slots, 0, 1);
    for (int i = 0; i < static_cast<int>(tokens.size()); ++i) {
        llama_batch_add(batch, tokens[i], i, {0}, false);
    }

    if (llama_decode(g_ctx, batch) != 0) {
        llama_batch_free(batch);
        return "Failed to decode prompt";
    }

    int n_past = static_cast<int>(tokens.size());
    std::string response;

    const llama_token eos_id = llama_token_eos(g_model);

    for (int i = 0; i < kPredictTokens && n_past < llama_n_ctx(g_ctx); ++i) {
        const float *logits = llama_get_logits(g_ctx);
        const int n_vocab = llama_n_vocab(g_model);

        std::vector<llama_token_data> candidates;
        candidates.reserve(n_vocab);
        for (llama_token token_id = 0; token_id < n_vocab; ++token_id) {
            candidates.push_back({token_id, logits[token_id], 0.0f});
        }

        llama_token_data_array candidates_p = {candidates.data(), candidates.size(), false};
        const llama_token new_token_id = llama_sample_token_greedy(g_ctx, &candidates_p);

        if (new_token_id == eos_id) {
            break;
        }

        const std::string piece = llama_token_to_str(g_model, new_token_id);
        response += piece;

        llama_batch_clear(batch);
        llama_batch_add(batch, new_token_id, n_past, {0}, false);

        if (llama_decode(g_ctx, batch) != 0) {
            break;
        }

        ++n_past;
    }

    llama_batch_free(batch);
    return response;
}

} // namespace tinyllama
