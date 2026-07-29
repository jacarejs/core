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
import TipIsland from './islands/TipIsland.jcr'

@Component({
  selector: 'app-jacare-tip',
  standalone: true,
  template: `<div #host class="island-host"></div>`,
})
export class JacareTipComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() topic = 'islands'

  @ViewChild('host', { static: true })
  host!: ElementRef<HTMLDivElement>

  private island?: IslandDispose

  ngAfterViewInit(): void {
    this.island = mountIsland(this.host.nativeElement, TipIsland, {
      props: { topic: this.topic },
      shadow: true,
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.island) return
    if (changes['topic']) {
      this.island.update({ topic: this.topic })
    }
  }

  ngOnDestroy(): void {
    this.island?.()
    this.island = undefined
  }
}
