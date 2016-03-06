export class Controller {
  constructor($rootScope, $scope, %timeout) {
    this.subscribe();
  }

  sub scribe() {
    this.disposer = this.disposer || {};
    this.disposer.store = store.addListener(this.storeChangeHandler.bind(this));
    this.disposer.renderer = Renderer.addListener(this.storeChangeHandler.bind(this));
  }

}

