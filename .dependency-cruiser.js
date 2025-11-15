module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'This dependency is part of a circular relationship',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment: 'This module is orphaned (not used by any other module)',
      from: {
        orphan: true,
        pathNot: [
          '\\.d\\.ts$',
          '(^|/)\\.[^/]+\\.ts$',
          '\\.test\\.(ts|tsx|js|jsx)$',
          '(^|/)(__tests__|test|tests)/',
          '^client/src/main\\.tsx$',
          '^server/index\\.ts$',
        ],
      },
      to: {},
    },
    {
      name: 'no-deprecated-core',
      severity: 'warn',
      comment: 'A module depends on a node core module that has been deprecated',
      from: {},
      to: {
        dependencyTypes: ['core'],
        path: ['^(punycode|domain|constants|sys|_linklist)$'],
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+',
      },
      archi: {
        collapsePattern: '^(node_modules|packages|src|lib|app)/[^/]+',
      },
    },
  },
};
