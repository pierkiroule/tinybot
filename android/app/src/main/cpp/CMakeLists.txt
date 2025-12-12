cmake_minimum_required(VERSION 3.22.1)
project(tinybot_llama LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

include(FetchContent)

set(LLAMA_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
set(LLAMA_BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(LLAMA_BUILD_SERVER OFF CACHE BOOL "" FORCE)
set(LLAMA_ACCELERATE OFF CACHE BOOL "" FORCE)
set(LLAMA_METAL OFF CACHE BOOL "" FORCE)
set(LLAMA_CUBLAS OFF CACHE BOOL "" FORCE)
set(GGML_VULKAN OFF CACHE BOOL "" FORCE)

FetchContent_Declare(
    llama_cpp
    GIT_REPOSITORY https://github.com/ggerganov/llama.cpp.git
    GIT_TAG b5c0f27113de2790fb0f27a07f0ddc37390f0b9d
)

FetchContent_MakeAvailable(llama_cpp)

add_library(tinyllama SHARED
    native-lib.cpp
    llama_stub.cpp)

set_target_properties(tinyllama PROPERTIES OUTPUT_NAME llama)

target_include_directories(tinyllama PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${llama_cpp_SOURCE_DIR})

target_link_libraries(
    tinyllama
    llama
    android
    log)
