import { Component, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { JacareCounterComponent } from './jacare-counter.component'
import { JacareTipComponent } from './jacare-tip.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, JacareCounterComponent, JacareTipComponent],
  template: `
    <header class="host-top">
      <p class="host-brand">Angular Host</p>
      <p class="host-note">
        Angular shell · Jacaré islands via <code>mountIsland</code>
        @if (version) {
          <span class="host-version">&#64;jacare/core v{{ version }}</span>
        }
      </p>
    </header>

    <main class="host-main">
      <article class="host-article">
        <h1>Embed Jacaré inside Angular</h1>
        <p>
          This page is a normal Angular standalone app. The widgets below are compiled
          <code>.jcr</code> modules mounted with <code>&#64;jacare/core/island</code> —
          Angular owns the shell; Jacaré owns the island. Look for the green
          <strong>Jacaré · .jcr</strong> frames: they name the source file so you can
          tell host templates apart from the compiled widget.
        </p>
      </article>

      <aside class="host-aside host-aside--panel">
        <h2>Host controls (Angular state → island props)</h2>
        <p class="host-hint">
          Changing these updates the counter island props without remounting the shell.
        </p>
        <div class="host-controls">
          <label>
            Start
            <input type="number" [ngModel]="start()" (ngModelChange)="start.set(+$event || 0)" />
          </label>
          <label>
            Label
            <input type="text" [ngModel]="label()" (ngModelChange)="label.set($event)" />
          </label>
        </div>
      </aside>

      <aside class="host-aside">
        <div class="island-mark">
          <div class="island-mark-head">
            <span class="island-mark-badge">
              <img class="island-mark-logo" [src]="logoUrl" alt="" width="20" height="20" />
              Jacaré · .jcr
            </span>
            <code class="island-mark-file">CounterIsland.jcr</code>
          </div>
          <h2>Island: counter</h2>
          <p class="host-hint">Light mount — shares the host document.</p>
          <div class="island-mark-slot">
            <app-jacare-counter [start]="start()" [label]="label()" />
          </div>
        </div>
      </aside>

      <aside class="host-aside">
        <div class="island-mark island-mark-shadow">
          <div class="island-mark-head">
            <span class="island-mark-badge">
              <img class="island-mark-logo" [src]="logoUrl" alt="" width="20" height="20" />
              Jacaré · .jcr
            </span>
            <code class="island-mark-file">TipIsland.jcr</code>
            <span class="island-mark-tag">shadow</span>
          </div>
          <h2>Island: tip (shadow)</h2>
          <p class="host-hint">
            Same kit with <code>shadow: true</code> — island CSS stays inside the
            shadow root and does not leak into this Angular host.
          </p>
          <div class="island-mark-slot">
            <app-jacare-tip topic="angular + jacaré" />
          </div>
        </div>
      </aside>
    </main>

    <footer class="host-foot">
      <p>
        Source:
        <a href="https://github.com/jacarejs/core/tree/main/examples/jacare-island-angular">
          examples/jacare-island-angular
        </a>
        ·
        <a href="https://jacarejs.github.io/core/island/">Static island</a>
        ·
        <a href="https://jacarejs.github.io/core/island-react/">React</a>
        ·
        <a href="https://jacarejs.github.io/core/island-vue/">Vue</a>
      </p>
    </footer>
  `,
})
export class AppComponent {
  readonly version = import.meta.env.JACARE_VERSION
  readonly logoUrl = `${import.meta.env.BASE_URL}jacare-logo.png`
  readonly start = signal(2)
  readonly label = signal('Live clicks')
}
