cmake_minimum_required(VERSION 3.20)

project(__YV_APP_NAME__ LANGUAGES C CXX OBJC)

set(CMAKE_C_STANDARD 17)
set(CMAKE_C_STANDARD_REQUIRED ON)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Older FetchContent dependencies use policy versions below 3.10.
set(CMAKE_POLICY_VERSION_MINIMUM 3.10)

set(YV_VERSION 0.1.4)


# ============================================================
# WebView dependency
# ============================================================

include(FetchContent)

FetchContent_Declare(
    webview
    GIT_REPOSITORY https://github.com/webview/webview.git
    GIT_TAG 0.12.0
)

set(WEBVIEW_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
set(WEBVIEW_BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(WEBVIEW_BUILD_DOCS OFF CACHE BOOL "" FORCE)
set(WEBVIEW_BUILD_AMALGAMATION OFF CACHE BOOL "" FORCE)
set(WEBVIEW_BUILD_STATIC_LIBRARY ON CACHE BOOL "" FORCE)
set(WEBVIEW_BUILD_SHARED_LIBRARY OFF CACHE BOOL "" FORCE)

FetchContent_MakeAvailable(webview)


# ============================================================
# HTTP server dependency
# ============================================================

FetchContent_Declare(
    civetweb
    GIT_REPOSITORY https://github.com/civetweb/civetweb.git
    GIT_TAG v1.16
)

set(CIVETWEB_BUILD_TESTING OFF CACHE BOOL "" FORCE)

set(CIVETWEB_ENABLE_SERVER_EXECUTABLE OFF CACHE BOOL "" FORCE)
set(CIVETWEB_INSTALL_EXECUTABLE OFF CACHE BOOL "" FORCE)

set(CIVETWEB_ENABLE_CXX OFF CACHE BOOL "" FORCE)

set(CIVETWEB_ENABLE_WEBSOCKETS OFF CACHE BOOL "" FORCE)
set(CIVETWEB_ENABLE_HTTP2 OFF CACHE BOOL "" FORCE)
set(CIVETWEB_ENABLE_IPV6 OFF CACHE BOOL "" FORCE)

set(CIVETWEB_ENABLE_LUA OFF CACHE BOOL "" FORCE)
set(CIVETWEB_ENABLE_DUKTAPE OFF CACHE BOOL "" FORCE)
set(CIVETWEB_ENABLE_SERVER_STATS OFF CACHE BOOL "" FORCE)
set(CIVETWEB_ENABLE_X_DOM_SOCKET OFF CACHE BOOL "" FORCE)

set(CIVETWEB_ENABLE_SSL OFF CACHE BOOL "" FORCE)
set(CIVETWEB_ENABLE_ZLIB OFF CACHE BOOL "" FORCE)

set(CIVETWEB_ENABLE_ASAN OFF CACHE BOOL "" FORCE)

FetchContent_MakeAvailable(civetweb)


# ============================================================
# Application
# ============================================================

set(YV_ICON "${CMAKE_CURRENT_SOURCE_DIR}/resources/yume.icns")

set_source_files_properties("${YV_ICON}"
    PROPERTIES
        MACOSX_PACKAGE_LOCATION "Resources"
)

add_executable(${PROJECT_NAME}
    MACOSX_BUNDLE

    src/main.c
    src/yv.c
    src/yv_www.c
    src/yv/yv_macos_menu.m

    "${YV_ICON}"
)


# ============================================================
# Include directories
# ============================================================

target_include_directories(${PROJECT_NAME}
    PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/include
        ${CMAKE_CURRENT_SOURCE_DIR}/src
)


# ============================================================
# Bundle metadata
# ============================================================

set_target_properties(${PROJECT_NAME} PROPERTIES
    MACOSX_BUNDLE TRUE

    MACOSX_BUNDLE_BUNDLE_NAME "__YV_APP_NAME__"

    MACOSX_BUNDLE_SHORT_VERSION_STRING "${YV_VERSION}"

    MACOSX_BUNDLE_BUNDLE_VERSION "${YV_VERSION}"

    MACOSX_BUNDLE_GUI_IDENTIFIER "com.sample.__YV_APP_NAME__"

    MACOSX_BUNDLE_ICON_FILE "yume.icns"
)


# ============================================================
# Web assets
# ============================================================

file(
    GLOB_RECURSE
    YV_WEB_FILES
    CONFIGURE_DEPENDS
    "${CMAKE_CURRENT_SOURCE_DIR}/www/*"
)

foreach(FILE IN LISTS YV_WEB_FILES)

    if(IS_DIRECTORY "${FILE}")
        continue()
    endif()

    file(
        RELATIVE_PATH
        RELATIVE_FILE
        "${CMAKE_CURRENT_SOURCE_DIR}/www"
        "${FILE}"
    )

    get_filename_component(
        RELATIVE_DIR
        "${RELATIVE_FILE}"
        DIRECTORY
    )

    if(RELATIVE_DIR STREQUAL "")
        set(
            BUNDLE_LOCATION
            "Resources/www"
        )
    else()
        set(
            BUNDLE_LOCATION
            "Resources/www/${RELATIVE_DIR}"
        )
    endif()

    set_source_files_properties(
        "${FILE}"
        PROPERTIES
            MACOSX_PACKAGE_LOCATION
            "${BUNDLE_LOCATION}"
    )

endforeach()

target_sources(
    ${PROJECT_NAME}
    PRIVATE
        ${YV_WEB_FILES}
)


# ============================================================
# Compiler warnings
# ============================================================

set_source_files_properties(
    src/yv/yv_macos_menu.m
    PROPERTIES
        COMPILE_OPTIONS "-fobjc-arc"
)

target_compile_options(${PROJECT_NAME}
    PRIVATE
        -Wall
        -Wextra
        -Wpedantic
)


# ============================================================
# Libraries
# ============================================================

target_link_libraries(${PROJECT_NAME}
    PRIVATE
        webview::core_static
        civetweb-c-library
        "-framework CoreFoundation"
        "-framework Cocoa"
)


# ============================================================
# Install
# ============================================================

install(
    TARGETS ${PROJECT_NAME}
    BUNDLE DESTINATION .
)