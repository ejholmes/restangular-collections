/*
 * Returns a little wrapper around $q.defer() that calls resolve and reject
 * inside a $scope.$apply.
 */
function promise() {
  var p;

  inject(function($rootScope, $q) {
    var apply;

    deferred = $q.defer();

    apply = function(name) {
      return function() {
        var args = arguments;
        $rootScope.$apply(function() {
          deferred[name].apply(deferred, args);
        });
      };
    };

    p = {
      promise: deferred.promise,
      resolve: apply('resolve'),
      reject: apply('reject')
    };
  });

  return p;
}
