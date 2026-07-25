import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core'
import { mountIsland } from '@jacare/core/island'
import CounterIsland from './islands/CounterIsland.jcr'

@Component({
  selector: 'app-jacare-counter',
  standalone: true,
  template: `<div #host class="island-host"></div>`,
})
export class JacareCounterComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() start = 0
  @Input() label = 'Clicks'

  @ViewChild('host', { static: true })
  host!: ElementRef<HTMLDivElement>

  private dispose?: () => void
  private ready = false

  ngAfterViewInit(): void {
    this.ready = true
    this.remount()
  }

  ngOnChanges(): void {
    if (this.ready) this.remount()
  }

  ngOnDestroy(): void {
    this.dispose?.()
    this.dispose = undefined
  }

  private remount(): void {
    this.dispose?.()
    this.dispose = mountIsland(this.host.nativeElement, CounterIsland, {
      props: { start: this.start, label: this.label },
    })
  }
}
