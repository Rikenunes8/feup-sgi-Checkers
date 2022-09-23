export class Views {
  views = [];
  defaultCam = null;

  constructor(defaultCam) {
    this.defaultCam = defaultCam;
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