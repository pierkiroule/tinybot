# Tinybot — POC APK Android IA locale

Ce dépôt ne contient qu'un prototype Android prêt à être ouvert dans Android Studio. L'application charge un petit modèle GGUF compatible **llama.cpp** directement depuis les assets pour fournir une IA embarquée entièrement hors-ligne.

## Structure conservée
- `android/` — projet Android (Kotlin UI + JNI)
  - `app/src/main/java/` — activités et pont natif.
  - `app/src/main/cpp/` — intégration llama.cpp minimale.
  - `app/src/main/assets/model.gguf` — modèle local embarqué.
- Fichiers Gradle et CMake nécessaires au build (`build.gradle.kts`, `settings.gradle.kts`, `CMakeLists.txt`).

## Modèle
- Format : **GGUF** (compatible llama.cpp).
- Emplacement : `android/app/src/main/assets/model.gguf` copié au premier lancement vers le stockage interne avant chargement.

## Build
1. Ouvrir le dossier `android/` dans Android Studio.
2. Laisser Gradle synchroniser puis lancer un build ou installer l'APK sur un appareil/émulateur ARM64.
3. Le chargement du modèle se fait localement via JNI : aucun appel réseau ni dépendance externe.
