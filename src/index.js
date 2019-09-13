'use strict'

module.exports = function role (schema, options) {
  // Set the default options
  options = Object.assign(
    {
      roles: [],
      accessLevels: {},
      maxLevel: Number,
      rolePath: 'role',
      rolesStaticPath: 'roles',
      accessLevelsStaticPath: 'accessLevels',
      maxLevelPath: 'maxLevel',
      hasAccessMethod: 'hasAccess',
      roleHasAccessMethod: 'roleHasAccess',
      hasAccessOnRoute: 'hasAccessOnRoute'
    },
    options
  )

  // Set the role path
  schema
    .path(options.rolePath, [])
    .path(options.rolePath)
    .required(true)

  // Expose the roles
  schema.static(options.rolesStaticPath, options.roles)
  schema.static(options.accessLevelsStaticPath, options.accessLevels)
  schema.static(options.maxLevelPath, options.maxLevel)

  // Set the hasAccess method
  schema.method(options.hasAccessMethod, function (accessLevels) {
    var userRoles = this.get(options.rolePath)
    return roleHasAccess(userRoles, accessLevels)
  })

  // Set the roleHasAccess method
  schema.static(options.roleHasAccessMethod, roleHasAccess)

  function roleHasAccess (roles, accessLevels) {
    if (typeof accessLevels === 'undefined') {
      return false
    }
    accessLevels = [].concat(accessLevels)
    // Goes through all access levels, and if any one of the access levels
    // doesn't exist in the roles, return false
    return !accessLevels.some(level => {
      var accesses = options.accessLevels[level] || []
      var intersection = roles.filter(value => accesses.includes(value))
      if(intersection.length==0)
        return true;
      return false;

    })
  }

  schema.method(options.hasAccessOnRoute, function (routes) {
    let userRoles = this.get(options.rolePath)
    let maxLevel = options.maxLevel
    return hasAccessOnRoute(userRoles, routes, maxLevel)
  })


  function hasAccessOnRoute (userRoles,route, maxLevel) {
    let levels = route.split('/');
    if(levels.length<1){
      return false;
    }
    return roleHasAccess(userRoles,levels.slice(1,maxLevel+1));

  }

}
