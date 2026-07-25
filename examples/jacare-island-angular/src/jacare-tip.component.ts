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
    this.dispose = mountIsland(this.host.nativeElement, TipIsland, {
      props: { topic: this.topic },
      shadow: true,
    })
  }
}
