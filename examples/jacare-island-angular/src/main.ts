import 'zone.js'
import '@angular/compiler'
import './host.css'

async function boot() {
  const { bootstrapApplication } = await import('@angular/platform-browser')
  const { AppComponent } = await import('./app.component')
  await bootstrapApplication(AppComponent)
}

boot().catch((err) => console.error(err))
