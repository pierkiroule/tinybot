#pragma once
#include <string>

namespace tinyllama {
bool load_model(const std::string &path);
std::string run_inference(const std::string &prompt);
}
