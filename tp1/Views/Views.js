export class Views {
  
  constructor() {
    this.views = [];
    this.defaultCam = null;
  }

  setDefaultCam(defaultCam) { this.defaultCam = defaultCam; }

  addView = (view) => {
    this.views.push(view);
  }

  displayAllViews = (scene) => {
    for (const view of this.views) {
      view.display(scene);
    }
  }
}