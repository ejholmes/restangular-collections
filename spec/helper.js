var disableHTTP = function(context) {
  context.beforeEach(inject(function($httpBackend) {
    this.$httpBackend = $httpBackend;
  }));

  context.afterEach(inject(function($httpBackend) {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  }));
};
