<p align="center">
  <img src="./resources/yume.iconset/icon_128x128@2x.png" width="128" alt="yv icon" />
</p>

<h1 align="center">yv</h1>

<p align="center">
  <strong>A lightweight C-based WebView runtime for macOS.</strong>
</p>

<p align="center">
  Build desktop applications with C, HTML, CSS, and JavaScript.
</p>

<br>
<br>

## Table of Contents

* [1. What is this?](#1-what-is-this)
* [2. Current Status](#2-current-status)
* [3. How It Works](#3-how-it-works)
* [4. Build](#4-build)
* [5. Project Structure](#5-project-structure)
* [6. Roadmap](#6-roadmap)

<br>
<br>

## 1. What is this?

`yv` is a small desktop application runtime written in C.

The name comes from:

> **yume + view**

`yume` comes from the author's name, and `view` refers to the WebView at the core of the runtime.

The basic idea is simple:

* **C** for the native runtime
* **HTML / CSS / JavaScript** for the application UI
* **WebView** for rendering
* **HTTP** for serving local application assets

The goal is to provide a lightweight foundation for building desktop applications without requiring a large application runtime.

<br>

## 2. Current Status

### 0.1.4 — WebView MVP

`yv 0.1.4` is the first minimal working MVP.

Currently supported:

* macOS
* WebView-based desktop applications
* Local static asset serving
* HTML / CSS / JavaScript
* Basic macOS application menu
* Custom application icon

The first release intentionally keeps the runtime small.

There is currently no built-in:

* IPC layer
* WebSocket layer
* LLM runtime
* WASM runtime
* Python runtime
* Updater
* Installer
* System tray
* Cross-platform support

These are outside the scope of `0.1.4`.

<br>

## 3. How It Works

At a high level, `yv` combines a few small components:

```text
┌───────────────────────────────┐
│        HTML / CSS / JS        │
├───────────────────────────────┤
│            WebView            │
├───────────────────────────────┤
│              yv               │
│     native application layer  │
├───────────────────────────────┤
│      Local HTTP server        │
├───────────────────────────────┤
│             macOS             │
└───────────────────────────────┘
```

`yv` does not implement the platform WebView itself.

Instead, it uses the existing [`webview/webview`](https://github.com/webview/webview) project as the WebView abstraction layer and [`CivetWeb`](https://github.com/civetweb/civetweb) for serving local application assets.

This keeps the runtime focused on the application layer rather than reimplementing platform-specific WebView functionality.

<br>

## 4. Build

### Requirements

* macOS
* CMake
* Ninja
* C compiler with C17 support

### Build

```bash
git clone https://github.com/kuchinashi4yume/yv.git
cd yv

make
```

The generated application bundle will be placed under:

```text
build/yv.app
```

A release build can be created with:

```bash
make build
```

which installs the application into:

```text
dist/yv.app
```

<br>

## 5. Project Structure

```text
yv/
├── include/
│   └── yv.h
├── src/
│   ├── main.c
│   ├── yv.c
│   ├── yv_www.c
│   ├── yv_www.h
│   └── yv/
│       ├── yv_macos_menu.h
│       └── yv_macos_menu.m
├── resources/
│   ├── yume.iconset
│   └── yume.icns
├── www/
│   └── index.html
├── CMakeLists.txt
└── Makefile
```

The intended application entry point is deliberately small:

```c
#include <yv.h>

int main(void) {
    yv_run();
    return 0;
}
```

The application itself can be built around the `www/` directory using ordinary web technologies.

<br>

## 6. Roadmap

`yv` is being developed incrementally.

The current priority is to keep the core runtime small and understandable before adding higher-level features.

Possible future directions include:

* Windows and Linux support
* Native application APIs
* Local LLM integration
* AI-oriented application features
* WASM-based computation
* Additional runtime integrations

The exact direction may evolve as the project develops.

<br>
---

**yv** is a small experiment in building desktop applications with a simple stack:

**C + WebView + HTML/CSS/JavaScript**

Built incrementally from small, focused components.
