package com.example.tinybot

object NativeBridge {
    init {
        System.loadLibrary("llama")
    }

    external fun initModel(modelPath: String): Boolean
    external fun run(prompt: String): String
}
