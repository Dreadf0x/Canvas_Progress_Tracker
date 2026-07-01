# Canvas Progress Tracker

A modern Chrome extension that enhances Canvas LMS by providing visual progress tracking for required module items, instructor-configurable completion rules, and a streamlined progress dashboard.

> Current Status: **v0.1.0-alpha**

---

# Features

## Student Features

- Visual progress tracking by module
- Overall required course progress
- Automatic assignment grade analysis
- Missing assignment detection
- Waiting-for-grade status
- Collapsible interface
- Lightweight, fast loading

## Instructor Features

- Automatic instructor detection
- Custom required-item selection per module
- Keyword-based completion rules
- Instructor configuration panel
- Real-time progress recalculation

---

# Screenshots

*Screenshots coming soon.*

---

# Installation

## Option 1 – Development

Clone the repository:

```bash
git clone https://github.com/<YOUR USERNAME>/Canvas_Progress_Bar.git
```

Install dependencies:

```bash
npm install
```

Build the extension:

```bash
node build.js
```

Load the generated **dist** folder in Chrome.

```
chrome://extensions
```

Enable **Developer Mode**

Select:

```
Load unpacked
```

Choose:

```
dist/
```

---

## Option 2 – Release ZIP

Every build automatically generates:

```
release/
    Canvas_Progress_Bar.zip
```

Extract the ZIP.

Load the extracted folder using **Load unpacked**.

---

# Project Structure

```
src/
│
├── api/
│   ├── canvas.js
│   └── roles.js
│
├── progress/
│   └── engine.js
│
├── storage/
│   └── rules.js
│
├── ui/
│   ├── panel.js
│   ├── settings.js
│   └── shell.js
│
└── content/
```

---

# Architecture

The extension follows a modular architecture.

### API

Responsible for all Canvas API communication.

### Progress Engine

Calculates assignment completion and required module progress.

### Storage

Stores instructor rules and UI state.

### UI

Responsible for rendering the interface.

### Application

Coordinates all modules and application state.

---

# Building

```
node build.js
```

The build process automatically:

- Cleans previous builds
- Bundles JavaScript
- Copies required assets
- Generates the production `dist` folder
- Creates a ready-to-install release ZIP

---

# Roadmap

## v0.2

- Student history
- Instructor analytics
- Better error reporting
- Additional accessibility improvements

## v0.3

- Export reports
- Additional Canvas integrations
- Enhanced customization

---

# Development Status

Current Version

**v0.1.0-alpha**

This project is under active development.

Features and interfaces may change before the first stable release.

---

# Copyright

© 2026 Heber Hamilton

This software is currently provided for evaluation and internal development purposes.

No open-source license has been assigned at this time.

All rights reserved.

Licensing may be established in a future release.