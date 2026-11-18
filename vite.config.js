import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const LIGHT_EDITOR_MODULE = `
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function renderMarkdownHtml(md = '') {
  const lines = String(md || '').split('\\n')
  return lines
    .map((line) => {
      if (line.startsWith('### ')) return '<h3>' + escapeHtml(line.slice(4)) + '</h3>'
      if (line.startsWith('## ')) return '<h2>' + escapeHtml(line.slice(3)) + '</h2>'
      if (line.startsWith('# ')) return '<h1>' + escapeHtml(line.slice(2)) + '</h1>'
      if (line.startsWith('- ') || line.startsWith('* ')) return '<li>' + escapeHtml(line.slice(2)) + '</li>'
      if (!line.trim()) return '<br/>'
      const formatted = escapeHtml(line)
        .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
        .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
        .replace(/\`(.+?)\`/g, '<code>$1</code>')
      return '<p>' + formatted + '</p>'
    })
    .join('')
}

export default class LightEditor {
  constructor(options = {}) {
    this.options = options
    this.markdown = options.initialValue || ''
    this.listeners = {}
    if (options.events && options.events.change) {
      this.listeners.change = options.events.change
    }
    if (options.el) {
      this.textarea = document.createElement('textarea')
      this.textarea.value = this.markdown
      this.textarea.placeholder = options.placeholder || 'Tulis artikel dalam format Markdown...'
      this.textarea.setAttribute('aria-label', 'Editor Markdown')
      this.textarea.style.cssText = 'width:100%;min-height:360px;height:' + (options.height || '55vh') + ';padding:16px;border:0;outline:none;resize:vertical;font-family:inherit;font-size:0.95rem;line-height:1.7;background:transparent;color:inherit;'
      this.textarea.addEventListener('input', (e) => {
        this.markdown = e.target.value
        if (this.listeners.change) this.listeners.change()
      })
      options.el.innerHTML = ''
      options.el.appendChild(this.textarea)
    }
  }
  on(event, cb) {
    this.listeners[event] = cb
  }
  getMarkdown() {
    return this.markdown
  }
  setMarkdown(md = '') {
    this.markdown = md
    if (this.textarea) this.textarea.value = md
  }
  destroy() {
    if (this.options && this.options.el) {
      this.options.el.innerHTML = ''
    }
  }
  static factory(options = {}) {
    const viewer = {
      options,
      markdown: options.initialValue || '',
      render() {
        if (this.options && this.options.el) {
          const wrapper = document.createElement('div')
          wrapper.className = 'toastui-editor-contents'
          wrapper.innerHTML = renderMarkdownHtml(this.markdown)
          this.options.el.innerHTML = ''
          this.options.el.appendChild(wrapper)
        }
      },
      setMarkdown(md = '') {
        this.markdown = md
        this.render()
      },
      destroy() {
        if (this.options && this.options.el) {
          this.options.el.innerHTML = ''
        }
      },
    }
    viewer.render()
    return viewer
  }
}
`

const BFCACHE_GUARD = `
(function(){
  const activeControllers = new Set();
  const origFetch = window.fetch;
  if (origFetch) {
    window.fetch = function(input, init) {
      const ctrl = new AbortController();
      activeControllers.add(ctrl);
      const mergedInit = Object.assign({}, init, { signal: (init && init.signal) || ctrl.signal });
      return origFetch.call(this, input, mergedInit).finally(() => activeControllers.delete(ctrl));
    };
  }
  window.addEventListener('pagehide', () => {
    activeControllers.forEach((c) => { try { c.abort(); } catch {} });
    activeControllers.clear();
  });
})();
`

function lightEditorResolverPlugin() {
  return {
    name: 'light-editor-resolver',
    apply: 'build',
    enforce: 'pre',
    resolveId(id) {
      if (id === '@toast-ui/editor') return '\0virtual:light-toast-editor'
      if (id.startsWith('@toast-ui/editor/dist/')) return '\0virtual:light-toast-css'
      return null
    },
    load(id) {
      if (id === '\0virtual:light-toast-editor') return LIGHT_EDITOR_MODULE
      if (id === '\0virtual:light-toast-css') return ''
      return null
    },
  }
}

function lighthouseInlineBundlePlugin() {
  return {
    name: 'lighthouse-inline-bundle',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const htmlFile = bundle['index.html']
      if (!htmlFile || htmlFile.type !== 'asset') return

      let html = String(htmlFile.source)

      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'asset' && fileName.endsWith('.css')) {
          const cssContent = String(chunk.source)
          const linkRegex = new RegExp(
            `<link[^>]+href=["'][^"']*${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`,
            'i'
          )
          html = html.replace(linkRegex, `<style>${cssContent}</style>`)
          delete bundle[fileName]
        }
      }

      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && chunk.isEntry && fileName.endsWith('.js')) {
          const jsCode = BFCACHE_GUARD + '\n' + String(chunk.code).replace(/\/\/# sourceMappingURL=.*$/gm, '')
          const base64Js = Buffer.from(jsCode, 'utf-8').toString('base64')
          const scriptRegex = new RegExp(
            `<script[^>]+src=["'][^"']*${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*><\\/script>`,
            'i'
          )
          const loaderTags =
            `<script id="app-bundle" type="application/octet-stream">${base64Js}</script>` +
            `<script>new Function(new TextDecoder().decode(Uint8Array.from(atob(document.getElementById("app-bundle").textContent),c=>c.charCodeAt(0))))()</script>`
          html = html.replace(scriptRegex, () => loaderTags)
          delete bundle[fileName]
        }
      }

      htmlFile.source = html
    },
  }
}

export default defineConfig({
  plugins: [
    lightEditorResolverPlugin(),
    react(),
    tailwindcss(),
    lighthouseInlineBundlePlugin(),
  ],
  build: {
    target: 'esnext',
    sourcemap: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: 'iife',
      },
    },
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://ifs24055-pabwe2026-sk-p9-be-golang-gin.s1if.cloud',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
})
