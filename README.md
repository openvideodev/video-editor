<p align="center">
  <a href="https://github.com/openvideodev/openvideo">
    <img width="150px" height="150px" src="https://cdn.scenify.io/openvideo-logo.png"/>
  </a>
</p>
<h1 align="center">OpenVideo Editor</h1>

<p align="center">A lightweight, high-performance, client-side web video editor. It serves as a showcase for the OpenVideo engine and a starter kit for building video-editing SaaS applications.</p>

<p align="center">
    <a href="https://openvideo.dev/">Website</a>
    ·
    <a href="https://discord.gg/SCfMrQx8kr">Discord</a>
    ·
    <a href="https://docs.openvideo.dev">Docs</a>
</p>

<p align="center">
    <a href="https://github.com/openvideodev/openvideo">
        <img src="https://cdn.scenify.io/openpreview1.png" alt="OpenVideo Preview" />
    </a>
</p>

---

## Key Features

- **Client-Side Rendering**: Hardware-accelerated rendering and exporting using WebCodecs and PixiJS v8 via `@openvideo/engine-pixi`.
- **Multi-Track Timeline**: Layered editing for video, audio, and images with drag-and-drop, splitting, trimming, and snapping.
- **Interactive Canvas**: Real-time viewport preview supporting drag, resize, rotate, and layer re-ordering.
- **Asset Management**: Local and cloud storage (e.g., Cloudflare R2, AWS S3) for media uploads.
- **Effects & Transitions**: Custom shader-based transitions and effects applied between clips.
- **Local Exporting**: Direct timeline rendering into MP4 files using browser APIs with zero server rendering costs.
- **Modern UI/UX**: Dark-mode interface built with Tailwind CSS v4, Radix UI, and Framer Motion.


---

## Tech Stack

| Component | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router) |
| **Rendering** | PixiJS v8 via `@openvideo/engine-pixi` |
| **Timeline & Core** | `@openvideo/core`, `@openvideo/timeline` |
| **State** | Zustand |
| **Styling** | Tailwind CSS v4 |
| **UI & Animation** | Radix UI, shadcn/ui, Framer Motion |

---

## Getting Started

### 1. Installation

Install dependencies from the monorepo root or directly in this directory:

```bash
# From the monorepo root
pnpm install

# Or within this directory (standalone)
npm install
```

### 2. Environment Setup

Copy `.env.sample` to `.env` and configure the required keys:

```bash
cp .env.sample .env
```

| Variable | Description |
| :--- | :--- |
| `R2_*` | Cloudflare R2 / S3 credentials and public CDN domain for asset uploads. |
| `DEEPGRAM_API_KEY` | API key for audio and video transcription. |
| `PEXELS_API_KEY` | API key for the stock media library. |


### 3. Run the Development Server

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## License & Commercial Usage

OpenVideo is available under a dual-license model:

- **Free License**: Free for individuals, non-profits, and organizations with up to 3 employees.
- **Company License**: Required for organizations with more than 3 employees.


For commercial licensing, custom integrations, or enterprise support, contact us at [cloud@openvideo.dev](mailto:cloud@openvideo.dev).
