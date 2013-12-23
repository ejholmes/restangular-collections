## Restangular Collections

[![Build Status](https://travis-ci.org/ejholmes/restangular-collections.png?branch=master)](https://travis-ci.org/ejholmes/restangular-collections)

This is a small extension to restangular that adds a `getCollection()` function
to restangularized routes.

### Usage

```js
controller: 'PostsCtrl',
resolve: {
  posts: function (api) {
    api.all('posts').getCollection();
  }
}
```

```js
function PostsCtrl (posts) {
  // Create a new post:
  // Same as api.all('posts').post(body: "Foobar"), except once the promise is
  // resolved. The new post will be added to the posts collection.
  posts.create(body: "Foobar").then(function(post) {
    // Destroy an existing post and remove it from the collection.
    post.destroy();
  });
}
```

### Releasing

1. Bump the version number in `bower.json`
2. Run `grunt build` and commit.
3. Run `grunt-release`.
