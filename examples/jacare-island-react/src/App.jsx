import { useState } from 'react'
import { JacareCounter } from './JacareCounter.jsx'
import { JacareTip } from './JacareTip.jsx'

const version = import.meta.env.JACARE_VERSION

export default function App() {
  const [start, setStart] = useState(2)
  const [label, setLabel] = useState('Live clicks')

  return (
    <>
      <header className="host-top">
        <p className="host-brand">React Host</p>
        <p className="host-note">
          React shell · Jacaré islands via <code>mountIsland</code>
          {version ? (
            <span className="host-version">@jacare/core v{version}</span>
          ) : null}
        </p>
      </header>

      <main className="host-main">
        <article className="host-article">
          <h1>Embed Jacaré inside React</h1>
          <p>
            This page is a normal React app (<code>createRoot</code>, hooks, state).
            The widgets below are compiled <code>.jcr</code> modules mounted with{' '}
            <code>@jacare/core/island</code> — React owns the shell; Jacaré owns the
            island. Look for the green <strong>Jacaré · .jcr</strong> frames: they name
            the source file so you can tell host JSX apart from the compiled widget.
          </p>
        </article>

        <aside className="host-aside host-aside--panel">
          <h2>Host controls (React state → island props)</h2>
          <p className="host-hint">
            Changing these updates the counter island props without remounting the shell.
          </p>
          <div className="host-controls">
            <label>
              Start
              <input
                type="number"
                value={start}
                onChange={(e) => setStart(Number(e.target.value) || 0)}
              />
            </label>
            <label>
              Label
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </label>
          </div>
        </aside>

        <aside className="host-aside">
          <div className="island-mark">
            <div className="island-mark-head">
              <span className="island-mark-badge">
                <img
                  className="island-mark-logo"
                  src="/jacare-logo.png"
                  alt=""
                  width="20"
                  height="20"
                />
                Jacaré · .jcr
              </span>
              <code className="island-mark-file">CounterIsland.jcr</code>
            </div>
            <h2>Island: counter</h2>
            <p className="host-hint">Light mount — shares the host document.</p>
            <div className="island-mark-slot">
              <JacareCounter start={start} label={label} />
            </div>
          </div>
        </aside>

        <aside className="host-aside">
          <div className="island-mark island-mark-shadow">
            <div className="island-mark-head">
              <span className="island-mark-badge">
                <img
                  className="island-mark-logo"
                  src="/jacare-logo.png"
                  alt=""
                  width="20"
                  height="20"
                />
                Jacaré · .jcr
              </span>
              <code className="island-mark-file">TipIsland.jcr</code>
              <span className="island-mark-tag">shadow</span>
            </div>
            <h2>Island: tip (shadow)</h2>
            <p className="host-hint">
              Same kit with <code>shadow: true</code> — island CSS stays inside the
              shadow root and does not leak into this React host.
            </p>
            <div className="island-mark-slot">
              <JacareTip topic="react + jacaré" />
            </div>
          </div>
        </aside>
      </main>

      <footer className="host-foot">
        <p>
          Source:{' '}
          <a href="https://github.com/jacarejs/core/tree/main/examples/jacare-island-react">
            examples/jacare-island-react
          </a>
          {' · '}
          <a href="https://jacarejs.github.io/core/island/">Static island</a>
          {' · '}
          <a href="https://jacarejs.github.io/core/island-vue/">Vue host</a>
          {' · '}
          <a href="https://jacarejs.github.io/core/island-angular/">Angular host</a>
        </p>
      </footer>
    </>
  )
}
