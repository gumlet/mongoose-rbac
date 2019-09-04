'use strict'

var mongoose = require('mongoose')
var role = require('../src/index')

var Schema = mongoose.Schema
var testSchema = {
  name: String
}

beforeAll(() => {
  return mongoose.connect(
    'mongodb://127.0.0.1/mongoose-role-test', {
      useNewUrlParser: true
    }
  );
});

afterAll(() => {
  return mongoose.connection.db
    .dropDatabase()
    .then(() => mongoose.disconnect())
});

test('should give accurate user account lockage', () => {
  var TestSchema = new Schema(testSchema)
  TestSchema.plugin(role, {
    roles: ['user', 'admin'],
    accessLevels: {
      user: ['user', 'admin'],
      admin: ['admin']
    }
  })
  var Test = mongoose.model('Test1', TestSchema)
  var model1 = new Test({
    name: 'test1',
    role: 'user'
  })
  var model2 = new Test({
    name: 'test2',
    role: 'admin'
  })
  expect(model1.hasAccess('user')).toBe(true)
  expect(model1.hasAccess('admin')).toBe(false)
  expect(model2.hasAccess('user')).toBe(true)
  expect(model2.hasAccess('admin')).toBe(true)
  expect(model1.hasAccess()).toBe(false)
  expect(model1.hasAccess('public')).toBe(false)
});

test("should not break completely if options aren't passed", function(done) {
  var TestSchema = new Schema(testSchema)
  TestSchema.plugin(role)
  var Test = mongoose.model('Test2', TestSchema)
  var model1 = new Test({
    name: 'test1',
    role: 'user'
  })
  var model2 = new Test({
    name: 'test2',
    role: 'admin'
  })
  expect(model1.hasAccess('user')).toBe(false)
  expect(model1.hasAccess('admin')).toBe(false)
  expect(model2.hasAccess('user')).toBe(false)
  expect(model2.hasAccess('admin')).toBe(false)
  expect(model1.hasAccess()).toBe(false)
  expect(model1.hasAccess('public')).toBe(false)
  model1.save(function(err, model) {
    expect(err.errors.role.kind).toBe('enum')
    done();
  });
});

test('should work with an array of access levels', function() {
  var TestSchema = new Schema(testSchema)
  TestSchema.plugin(role, {
    roles: ['anon', 'user', 'admin'],
    accessLevels: {
      public: ['anon', 'user', 'admin'],
      private: ['user', 'admin'],
      protected: ['admin']
    }
  })
  var Test = mongoose.model('Test3', TestSchema)
  var model1 = new Test({
    name: 'test1',
    role: 'anon'
  })
  var model2 = new Test({
    name: 'test2',
    role: 'user'
  })
  var model3 = new Test({
    name: 'test3',
    role: 'admin'
  })
  expect(model1.hasAccess()).toBe(false)
  expect(model1.hasAccess('public')).toBe(true)
  expect(model1.hasAccess(['public', 'private'])).toBe(false)
  expect(model2.hasAccess(['public', 'private'])).toBe(true)
  expect(model2.hasAccess(['private', 'protected'])).toBe(false)
  expect(model3.hasAccess(['public', 'private', 'protected'])).toBe(true)
});
