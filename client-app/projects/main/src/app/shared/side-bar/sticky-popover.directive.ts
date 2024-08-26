
import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Directive, ElementRef, Inject, Input, Renderer2, TemplateRef } from '@angular/core';
import { NgbPopover } from "@ng-bootstrap/ng-bootstrap";

@Directive({
    selector: "[stickyPopover]",
    standalone: true
})
export class StickyPopoverDirective extends NgbPopover {

    @Input() stickyPopover!: TemplateRef<any>;

    override triggers!: string;

    override container!: string;

    override toggle(): void {
        super.toggle()
    }

    override  isOpen(): boolean {
        return super.isOpen()
    }

    canClosePopover!: boolean;

    constructor(private _elRef: ElementRef, private _render: Renderer2, @Inject(DOCUMENT) _document: any, _changeDetector: ChangeDetectorRef) {
        super();
        this.triggers = "manual"
        this.container = "body"
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.ngbPopover = this.stickyPopover;

        this._render.listen(this._elRef.nativeElement, "mouseenter", () => {
            this.canClosePopover = true;
            // this.open()
        });

        this._render.listen(this._elRef.nativeElement, "mouseleave", (event: Event) => {
            this.open();
            setTimeout(() => { if (this.canClosePopover) this.close() }, 200)

        })

        this._render.listen(this._elRef.nativeElement, "click", () => {
            this.close();
        })
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy()
    }

    override open() {
        super.open();
        let popover = window.document.querySelector(".popover")
        this._render.listen(popover, "mouseover", () => {
            this.canClosePopover = false;
        });

        this._render.listen(popover, "mouseout", () => {
            this.canClosePopover = true;
            setTimeout(() => { if (this.canClosePopover) this.close() }, 0)
        });
    }

    override close() {
        super.close();
    }

}
