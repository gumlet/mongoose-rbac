'use strict'

module.exports = function role (schema, options) {
  // Set the default options
  options = Object.assign(
    {
      roles: [],
      accessLevels: {},
      rolePath: 'role',
      rolesStaticPath: 'roles',
      accessLevelsStaticPath: 'accessLevels',
      hasAccessMethod: 'hasAccess',
      roleHasAccessMethod: 'roleHasAccess'
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
}
