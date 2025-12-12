#include <jni.h>
#include <string>
#include <android/log.h>
#include "llama_stub.h"

#define LOG_TAG "TinyLlama"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)

extern "C" JNIEXPORT jboolean JNICALL
Java_com_example_tinybot_NativeBridge_initModel(
        JNIEnv *env,
        jobject /* this */,
        jstring modelPath) {
    const char *path = env->GetStringUTFChars(modelPath, nullptr);
    bool ok = tinyllama::load_model(path);
    env->ReleaseStringUTFChars(modelPath, path);
    LOGI("Model load %s", ok ? "ok" : "failed");
    return static_cast<jboolean>(ok);
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_example_tinybot_NativeBridge_run(
        JNIEnv *env,
        jobject /* this */,
        jstring prompt) {
    const char *cPrompt = env->GetStringUTFChars(prompt, nullptr);
    std::string response = tinyllama::run_inference(cPrompt);
    env->ReleaseStringUTFChars(prompt, cPrompt);
    return env->NewStringUTF(response.c_str());
}
