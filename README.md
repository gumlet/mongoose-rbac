# mongoose-role

[![NPM version](http://img.shields.io/npm/v/mongoose-role.svg?style=flat)](https://www.npmjs.org/package/mongoose-role)
[![Dependency Status](http://img.shields.io/gemnasium/ksmithut/mongoose-role.svg?style=flat)](https://gemnasium.com/ksmithut/mongoose-role)
[![Code Climate](http://img.shields.io/codeclimate/github/ksmithut/mongoose-role.svg?style=flat)](https://codeclimate.com/github/ksmithut/mongoose-role)
[![Build Status](http://img.shields.io/travis/ksmithut/mongoose-role.svg?style=flat)](https://travis-ci.org/ksmithut/mongoose-role)
[![Coverage Status](http://img.shields.io/codeclimate/coverage/github/ksmithut/mongoose-role.svg?style=flat)](https://codeclimate.com/github/ksmithut/mongoose-role)

A mongoose plugin to help manage user roles and user access levels.

There are many ways to handle user account access levels. This one has a very
specific methodology.

* A Model has a **single** role, and it is required.
* You can add as many roles as you want.
* An access level has many roles.
* Access levels are used to make sure a user has access to a given
  functionality.

I've thought about adding the ability to have multiple roles and add methods to
check if a user has any of the given roles and all of the given roles. The
single role and setting access levels suits my personal needs, but if you find
it would be useful to have this functionality, sound off in issues and pull
requests.

## Installation

```bash
npm install --save mongoose-role
```

## Usage

```javascript
'use strict';

var UserSchema = new require('mongoose').Schema({
  email: String
});

UserSchema.plugin(require('mongoose-role'), {
  roles: ['public', 'user', 'admin'],
  accessLevels: {
    'public': ['public', 'user', 'admin'],
    'anon': ['public'],
    'user': ['user', 'admin'],
    'admin': ['admin']
  }
});

var User = mongoose.model('User', UserSchema);

var newUser = newUser({email: 'email@email.com', role: 'user'});

// The string passed in is an access level
console.log(newUser.hasAccess('public')); // true
console.log(newUser.hasAccess('anon')); // false
console.log(newUser.hasAccess('user')); // true
console.log(newUser.hasAccess('admin')); // false
```

It it required that you pass in options to the plugin. This way you can set up
the roles and access levels. As mentioned, users must have one of the roles
passed into the `roles` option. The `accessLevels` are an easy way to configure
which types of users will have access to certain functionality of your app.

For example, you could create an express middleware that verifies a user's
permissions before they can access an API endpoint.

```javascript
function hasAccess(accessLevel) {
  return function (req, res, next) {
    if (req.session.user && req.session.user.hasAccess(accessLevel)) {
      return next();
    }
    return res.json({
      success: false,
      error: 'Unauthorized'
    });
  }
}

var router = require('express').Router();

router.get('/some-protected-route', [
  hasAccess('user'), // protection middleware
  function (req, res, next) {
    console.log('you have access!');
    res.json({
      secure: true,
      data: 'super secret data'
    });
  }
]);

```

This plugin adds a `role` String field to a schema. It's set as an enum with the
given `roles` values in the options. It is required, but I may be convinced to
make that optional and set a default value or something.

It also adds a `hasAccess()` method to the model instances. It takes in a
string of one of the accessLevels you defined in the options. If nothing is
passed in, it will return true. If a string is passed that isn't one of the
access levels, it will return false.

## Options

* `roles` (Array of Strings) - The string representation of the user roles.
  Default: `[]`
* `accessLevels` (Object) - An Object hash that has access levels as the
  property keys, and arrays of strings as the roles that have that access level.
  Default: `{}`
* `rolePath` (String) - The path that the role property will be saved to the
  model instance. Default: `'role'`
* `rolesStaticPath` (String) - The path to the exposed roles given in the
  options. Default: `'roles'`
* `accessLevelsStaticPath` (String) - The path to the exposed access levels
  given in the options. Default: `'accessLevels'`
* `hasAccessMethod` (String) - The instance method name to be used to check a
  user's access level. Default: `'hasAccess'`
