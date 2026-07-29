import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core'
import { mountIsland, type IslandDispose } from '@jacare/core/island'
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

  private island?: IslandDispose

  ngAfterViewInit(): void {
    this.island = mountIsland(this.host.nativeElement, CounterIsland, {
      props: { start: this.start, label: this.label },
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.island) return
    if (changes['start'] || changes['label']) {
      this.island.update({ start: this.start, label: this.label })
    }
  }

  ngOnDestroy(): void {
    this.island?.()
    this.island = undefined
  }
}
