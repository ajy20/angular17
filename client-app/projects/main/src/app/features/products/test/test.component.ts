import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
declare var ThingView: any;

@Component({
  selector: 'csps-test',
  standalone: true,
  imports: [],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent implements OnInit, AfterViewInit {
  @ViewChild('CreoViewWebGLDiv') creoView: any;
  data!: string;
  app!: any;
  session!: any;
  model!: any;
  structure!: any;

  ngOnInit() {

  }

  ngAfterViewInit() {
    ThingView.init("assets/js/ptc/thingview", () => {
      console.log("Creo View WebGL Viewer is now initialized");
      this.app = ThingView.CreateCVApplication("CreoViewWebGLDiv");
      this.session = this.app.GetSession();
      this.structure = this.session.LoadStructureWithURL("assets/test/default2.pvz", true, (success: any, errors: any) => {
        const shapeScene = this.session.MakeShapeScene(true);
        const shapeView = shapeScene.MakeShapeView(this.creoView.nativeElement.childNodes[0].id, true);
        this.model = shapeScene.MakeModel();
        this.model.LoadStructure(this.structure, true, true, (success: any, isStructure: any, errorStack: any) => {
          console.log("Model LoadStructure - success: " + success + ", isStructure: " + isStructure);
        });

        this.model.SetSelectionCallback((si: any, id: any, selected: any) => {
          this.data = selected + '   ' + this.model.GetShapeInstanceFromIdPath(selected)?.GetDisplayName();
        });

      });
    });
  };

  test(): void {
    debugger;
  }

}
