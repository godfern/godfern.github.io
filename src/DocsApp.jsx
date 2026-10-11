import { useState, useEffect } from 'react'
import './DocsApp.css'

const DOCS = {
  home: { title: 'Frontend Interview Preparation', path: 'README' },
  'system-design': { title: 'System Design', path: 'system-design/README' },
  'approach': { title: 'How to Approach the Round', path: 'system-design/01-approach' },
  'pillars': { title: 'Core Pillars', path: 'system-design/02-core-pillars' },
  'component-arch': { title: 'Component Architecture', path: 'system-design/03-component-architecture' },
  'state-mgmt': { title: 'State Management', path: 'system-design/04-state-management' },
  'performance': { title: 'Performance & Rendering', path: 'system-design/05-performance-rendering' },
  'networking': { title: 'Networking & Data Fetching', path: 'system-design/06-networking-data-fetching' },
  'examples': { title: 'Real-world Examples', path: 'system-design/07-examples' },
  'sri': { title: 'Subresource Integrity (SRI)', path: 'system-design/security-sri' },
}

export default function DocsApp() {
  const [content, setContent] = useState('')
  const [currentPage, setCurrentPage] = useState('home')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadPage(currentPage)
  }, [currentPage])

  const loadPage = async (pageKey) => {
    setLoading(true)
    try {
      const filePath = DOCS[pageKey].path
      const response = await fetch(`/docs/${filePath}.md`)
      const text = await response.text()
      setContent(text)
    } catch (err) {
      setContent(`# Error\n\nFailed to load page: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="docs-container">
      <aside className="sidebar">
        <h2>📚 Wiki</h2>
        <nav>
          <button
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentPage('home')}
          >
            Home
          </button>

          <div className="nav-section">
            <h3>System Design</h3>
            {[
              'system-design',
              'approach',
              'pillars',
              'component-arch',
              'state-mgmt',
              'performance',
              'networking',
              'examples',
              'sri',
            ].map(key => (
              <button
                key={key}
                className={`nav-link ${currentPage === key ? 'active' : ''}`}
                onClick={() => setCurrentPage(key)}
              >
                {DOCS[key].title}
              </button>
            ))}
          </div>
        </nav>
      </aside>

      <main className="content">
        {loading ? <p>Loading...</p> : <MarkdownPreview markdown={content} />}
      </main>
    </div>
  )
}

function MarkdownPreview({ markdown }) {
  const html = parseMarkdown(markdown)
  return <div className="markdown" dangerouslySetInnerHTML={{ __html: html }} />
}

function parseMarkdown(md) {
  if (!md) return ''

  let html = md
    // Headers
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Code inline
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br />')

  // Code blocks
  html = html.replace(
    /```(\w+)?([\s\S]*?)```/g,
    (_, lang, code) =>
      `<pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`
  )

  // Tables
  html = html.replace(
    /\| (.*?) \|\n\| [-:|]+ \|\n((?:\| .* \|\n?)*)/g,
    (match, header, rows) => {
      const headers = header.split('|').map(h => h.trim()).filter(Boolean)
      const bodyRows = rows.split('\n').filter(Boolean)
      let table = '<table><thead><tr>'
      headers.forEach(h => (table += `<th>${h}</th>`))
      table += '</tr></thead><tbody>'
      bodyRows.forEach(row => {
        const cells = row.split('|').map(c => c.trim()).filter(Boolean)
        table += '<tr>'
        cells.forEach(c => (table += `<td>${c}</td>`))
        table += '</tr>'
      })
      table += '</tbody></table>'
      return table
    }
  )

  // Blockquotes
  html = html.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>')

  // Unordered lists
  html = html.replace(/^\- (.*?)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')

  html = '<p>' + html + '</p>'
  return html
}
