package com.example.tinybot

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.tinybot.databinding.ActivityMainBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val modelPath = copyModel()
        val ok = NativeBridge.initModel(modelPath)
        binding.status.text = if (ok) "Modèle prêt" else "Modèle absent"

        binding.runButton.setOnClickListener {
            val prompt = binding.promptInput.text.toString()
            binding.response.text = "..."
            lifecycleScope.launch {
                val reply = withContext(Dispatchers.IO) {
                    NativeBridge.run(prompt)
                }
                binding.response.text = reply
            }
        }
    }

    private fun copyModel(): String {
        val target = File(filesDir, "model.gguf")
        if (target.exists()) return target.absolutePath
        assets.open("model.gguf").use { input ->
            target.outputStream().use { output ->
                input.copyTo(output)
            }
        }
        return target.absolutePath
    }
}
