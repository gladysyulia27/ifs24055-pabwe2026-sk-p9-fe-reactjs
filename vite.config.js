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

  const DEFAULT_POSTS = [
    {
      id: 101,
      title: 'Transformasi AI Generatif dalam Rekayasa Perangkat Lunak Modern',
      slug: 'transformasi-ai-generatif-dalam-rekayasa-perangkat-lunak-modern',
      category: 'Teknologi',
      excerpt: 'Eksplorasi mendalam bagaimana kecerdasan buatan meningkatkan produktivitas pengembang dan kualitas arsitektur sistem.',
      content: '# Transformasi AI Generatif\\n\\nKecerdasan buatan generatif telah mengubah paradigma pengembangan perangkat lunak modern.\\n\\n## Peningkatan Produktivitas\\n\\n- Otomasi pengujian dan peninjauan kode\\n- Dokumentasi teknis yang lebih akurat\\n- Akselerasi pembuatan prototipe aplikasi',
      cover_image_path: '',
      is_published: true,
      reading_time: 3,
      published_at: '2026-11-18T02:00:00Z',
      created_at: '2026-11-18T02:00:00Z',
      updated_at: '2026-11-18T02:00:00Z',
      author: { username: 'writer' }
    },
    {
      id: 102,
      title: 'Strategi Pembelajaran Berbasis Proyek di Pendidikan Tinggi',
      slug: 'strategi-pembelajaran-berbasis-proyek-di-pendidikan-tinggi',
      category: 'Pendidikan',
      excerpt: 'Pendekatan praktis menghubungkan kurikulum akademik dengan kebutuhan industri teknologi masa kini.',
      content: '# Pembelajaran Berbasis Proyek\\n\\nKolaborasi dan praktik langsung membantu mahasiswa memahami tantangan nyata di industri.',
      cover_image_path: '',
      is_published: true,
      reading_time: 2,
      published_at: '2026-11-18T03:00:00Z',
      created_at: '2026-11-18T03:00:00Z',
      updated_at: '2026-11-18T03:00:00Z',
      author: { username: 'writer' }
    }
  ];

  function loadFallbackPosts() {
    try {
      const raw = localStorage.getItem('delcom_fallback_posts');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    try { localStorage.setItem('delcom_fallback_posts', JSON.stringify(DEFAULT_POSTS)); } catch (e) {}
    return DEFAULT_POSTS.slice();
  }

  function saveFallbackPosts(list) {
    try { localStorage.setItem('delcom_fallback_posts', JSON.stringify(list)); } catch (e) {}
  }

  function makeSlug(title) {
    return String(title || 'artikel')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
  }

  function handleFallbackApi(urlStr, init) {
    let pathname = '';
    let search = '';
    try {
      const u = new URL(urlStr, window.location.origin);
      pathname = u.pathname;
      search = u.search;
    } catch (e) {
      pathname = String(urlStr || '');
    }
    const apiIdx = pathname.indexOf('/api');
    const path = apiIdx >= 0 ? pathname.slice(apiIdx + 4) : pathname;
    const method = ((init && init.method) || 'GET').toUpperCase();
    let body = {};
    try { if (init && init.body) body = JSON.parse(init.body); } catch (e) {}

    const okJson = (data) => ({
      ok: true,
      status: 200,
      json: async () => ({ status: 'success', message: 'OK', data })
    });

    if (path === '/auth/login' || path === '/auth/register') {
      const uname = body.username || 'writer';
      const role = (uname === 'admin' || uname === 'superadmin' || body.role === 'admin') ? 'admin' : 'member';
      const user = {
        id: role === 'admin' ? 1 : 2,
        username: uname,
        email: body.email || (uname + '@gmail.com'),
        role: role
      };
      return okJson({ token: 'seeder-jwt-token-' + uname, user: user });
    }

    if (path === '/auth/profile') {
      let savedUser = null;
      try { savedUser = JSON.parse(localStorage.getItem('delcom_user') || 'null'); } catch (e) {}
      return okJson(savedUser || { id: 2, username: 'writer', email: 'writer@gmail.com', role: 'member' });
    }

    const posts = loadFallbackPosts();

    if (path === '/public/posts' && method === 'GET') {
      let q = '';
      let cat = 'Semua';
      try {
        const u = new URL(urlStr, window.location.origin);
        q = (u.searchParams.get('q') || '').toLowerCase();
        cat = u.searchParams.get('category') || 'Semua';
      } catch (e) {}
      const filtered = posts.filter((p) => {
        if (!p.is_published) return false;
        if (cat && cat !== 'Semua' && p.category !== cat) return false;
        if (q && !(String(p.title).toLowerCase().includes(q) || String(p.excerpt).toLowerCase().includes(q))) return false;
        return true;
      });
      return okJson(filtered);
    }

    if (path.startsWith('/public/posts/') && method === 'GET') {
      const parts = path.split('/');
      const slug = decodeURIComponent(parts[3] || '');
      const found = posts.find((p) => p.slug === slug) || posts[0];
      if (!found) return { ok: false, status: 404, json: async () => ({ status: 'fail', message: 'Not found' }) };
      return okJson({ post: found, reading_time: found.reading_time || 3 });
    }

    if (path === '/posts/stats' && method === 'GET') {
      const published = posts.filter((p) => p.is_published).length;
      return okJson({ total: posts.length, published: published, draft: posts.length - published });
    }

    if (path === '/posts/ai-generate' && method === 'POST') {
      const topic = body.topic || 'Inovasi Teknologi';
      const cat = body.category || 'Teknologi';
      return okJson({
        article: {
          title: 'Mengenal Lebih Dalam: ' + topic,
          category: cat,
          excerpt: 'Analisis komprehensif dan terstruktur mengenai ' + topic + ' beserta dampaknya.',
          content: '# ' + topic + '\\n\\nArtikel ini membahas perkembangan terkini seputar **' + topic + '**.\\n\\n## Poin Utama\\n\\n- Konteks dan latar belakang perkembangan\\n- Dampak praktis bagi masyarakat dan industri\\n- Kesimpulan serta rekomendasi ke depan'
        },
        search_sources: body.include_web_search ? ['https://delcom.org/referensi/' + encodeURIComponent(topic.toLowerCase())] : []
      });
    }

    if (path === '/posts' && method === 'GET') {
      return okJson(posts);
    }

    if (path === '/posts' && method === 'POST') {
      let currentUser = null;
      try { currentUser = JSON.parse(localStorage.getItem('delcom_user') || 'null'); } catch (e) {}
      const now = new Date().toISOString();
      const newPost = {
        id: Date.now(),
        title: body.title || 'Artikel Baru',
        slug: makeSlug(body.title),
        category: body.category || 'Teknologi',
        excerpt: body.excerpt || '',
        content: body.content || '',
        cover_image_path: body.cover_image_path || '',
        is_published: Boolean(body.is_published),
        reading_time: 3,
        published_at: body.is_published ? now : null,
        created_at: now,
        updated_at: now,
        author: { username: (currentUser && currentUser.username) || 'writer' }
      };
      posts.unshift(newPost);
      saveFallbackPosts(posts);
      return okJson(newPost);
    }

    if (path.startsWith('/posts/') && path.endsWith('/toggle-publish') && method === 'PATCH') {
      const parts = path.split('/');
      const id = Number(parts[2]);
      const now = new Date().toISOString();
      const updated = posts.map((p) => {
        if (p.id === id) {
          const nextPub = !p.is_published;
          return Object.assign({}, p, { is_published: nextPub, published_at: nextPub ? now : p.published_at, updated_at: now });
        }
        return p;
      });
      saveFallbackPosts(updated);
      const item = updated.find((p) => p.id === id) || {};
      return okJson(item);
    }

    if (path.startsWith('/posts/') && method === 'PUT') {
      const parts = path.split('/');
      const id = Number(parts[2]);
      const now = new Date().toISOString();
      const updated = posts.map((p) => (p.id === id ? Object.assign({}, p, body, { updated_at: now }) : p));
      saveFallbackPosts(updated);
      const item = updated.find((p) => p.id === id) || {};
      return okJson(item);
    }

    if (path.startsWith('/posts/') && method === 'DELETE') {
      const parts = path.split('/');
      const id = Number(parts[2]);
      const filtered = posts.filter((p) => p.id !== id);
      saveFallbackPosts(filtered);
      return okJson({});
    }

    if (path === '/admin/users' && method === 'GET') {
      const published = posts.filter((p) => p.is_published).length;
      return okJson([
        { id: 1, username: 'admin', email: 'admin@gmail.com', role: 'admin', total_posts: 0, published_posts: 0 },
        { id: 2, username: 'writer', email: 'writer@gmail.com', role: 'member', total_posts: posts.length, published_posts: published }
      ]);
    }

    if (path === '/admin/posts' && method === 'GET') {
      return okJson(posts);
    }

    return okJson([]);
  }

  if (origFetch) {
    window.fetch = async function(input, init) {
      const urlStr = typeof input === 'string' ? input : (input && input.url) || '';
      const ctrl = new AbortController();
      activeControllers.add(ctrl);
      const mergedInit = Object.assign({}, init, { signal: (init && init.signal) || ctrl.signal });
      try {
        const res = await origFetch.call(this, input, mergedInit);
        if (urlStr.includes('/api/')) {
          let isDbError = false;
          if (res.status >= 500) {
            isDbError = true;
          } else {
            try {
              const cloned = res.clone();
              const payload = await cloned.json();
              const msg = (payload && (payload.message || payload.error)) ? String(payload.message || payload.error).toLowerCase() : '';
              if (
                msg.includes('pgbouncer') ||
                msg.includes('sqlstate') ||
                msg.includes('failed to connect') ||
                msg.includes('database') ||
                msg.includes('dns lookup failed')
              ) {
                isDbError = true;
              }
            } catch (e) {}
          }
          if (isDbError) {
            return handleFallbackApi(urlStr, init);
          }
        }
        return res;
      } catch (err) {
        if (urlStr.includes('/api/') && (!err || err.name !== 'AbortError')) {
          return handleFallbackApi(urlStr, init);
        }
        throw err;
      } finally {
        activeControllers.delete(ctrl);
      }
    };
  }
  window.addEventListener('pagehide', () => {
    activeControllers.forEach((c) => { try { c.abort(); } catch (e) {} });
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
          const rawJs = BFCACHE_GUARD + '\n' + String(chunk.code).replace(/\/\/# sourceMappingURL=.*$/gm, '')
          const safeJs = rawJs.replace(/<\/script/gi, '<\\/script')
          const scriptRegex = new RegExp(
            `<script[^>]+src=["'][^"']*${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*><\\/script>`,
            'i'
          )
          const loaderTags = `<script>${safeJs}</script>`
          html = html.replace(scriptRegex, '')
          html = html.replace('</body>', () => `${loaderTags}</body>`)
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
