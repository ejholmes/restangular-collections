describe('restangularCollection', function() {
  var client, Collection;

  beforeEach(module('restangularCollections'));

  beforeEach(inject(function(Restangular, RestangularCollection) {
    client = Restangular.withConfig(function(c) {
      c.extendCollection('posts', function(posts) {
        posts.create = function(attributes) {
          return posts.post(attributes);
        };

        posts.update = function(attributes) {
          return posts.patch(attributes);
        };

        return posts;
      });
    });

    Collection = RestangularCollection;
  }));

  disableHTTP(this);

  describe('getCollection()', function() {
    var elem, posts;

    beforeEach(function() {
      elem = client.all('posts');
      posts = elem.getCollection();
    });

    it('is a collection', function() {
      expect(posts).to.be.an.instanceof(Collection);
    });

    describe('create', function() {
      var post;

      beforeEach(function() {
        this.$httpBackend.expectPOST('/posts').respond({ id: 1, body: 'Foobar' });
        post = posts.create({ body: 'Foobar' });
        this.$httpBackend.flush();
      });

      it('creates the model and adds it to the collection', function() {
        expect(posts.models.length).to.eq(1);
      });
    });
  });
});
