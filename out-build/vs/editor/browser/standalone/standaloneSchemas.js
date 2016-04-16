/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", 'vs/nls!vs/editor/browser/standalone/standaloneSchemas'], function (require, exports, nls) {
    'use strict';
    this.MonacoEditorSchemas = this.MonacoEditorSchemas || {};
    var MonacoEditorSchemas = this.MonacoEditorSchemas;
    MonacoEditorSchemas['http://json.schemastore.org/project'] = {
        'title': nls.localize(0, null),
        '$schema': 'http://json-schema.org/draft-04/schema#',
        'id': 'http://json.schemastore.org/project',
        'type': 'object',
        'definitions': {
            'compilationOptions': {
                'description': nls.localize(1, null),
                'type': 'object',
                'properties': {
                    'define': {
                        'type': 'array',
                        'items': {
                            'type': 'string',
                            'uniqueItems': true
                        }
                    },
                    'warningsAsErrors': {
                        'type': 'boolean',
                        'default': false
                    },
                    'allowUnsafe': {
                        'type': 'boolean',
                        'default': false
                    },
                    'optimize': {
                        'type': 'boolean',
                        'default': false
                    },
                    'languageVersion': {
                        'type': 'string',
                        'enum': ['csharp1', 'csharp2', 'csharp3', 'csharp4', 'csharp5', 'csharp6', 'experimental']
                    }
                }
            },
            'configType': {
                'type': 'object',
                'properties': {
                    'dependencies': { '$ref': '#/definitions/dependencies' },
                    'compilationOptions': { '$ref': '#/definitions/compilationOptions' },
                    'frameworkAssemblies': { '$ref': '#/definitions/dependencies' }
                }
            },
            'dependencies': {
                'type': 'object',
                'additionalProperties': {
                    'type': ['string', 'object'],
                    'properties': {
                        'version': {
                            'type': 'string',
                            'description': nls.localize(2, null)
                        },
                        'type': {
                            'type': 'string',
                            'default': 'default',
                            'enum': ['default', 'build'],
                            'description': nls.localize(3, null)
                        }
                    },
                    'id': 'nugget-package'
                },
                'description': nls.localize(4, null),
                'id': 'nugget-packages'
            },
            'script': {
                'type': ['string', 'array'],
                'items': {
                    'type': 'string'
                },
                'description': nls.localize(5, null)
            }
        },
        'properties': {
            'authors': {
                'description': nls.localize(6, null),
                'type': 'array',
                'items': {
                    'type': 'string',
                    'uniqueItems': true
                }
            },
            'bundleExclude': {
                'description': nls.localize(7, null),
                'type': ['string', 'array'],
                'items': {
                    'type': 'string'
                },
                'default': ''
            },
            'code': {
                'description': nls.localize(8, null),
                'type': ['string', 'array'],
                'items': {
                    'type': 'string'
                },
                'default': '**\\*.cs'
            },
            'commands': {
                'description': nls.localize(9, null),
                'type': 'object',
                'additionalProperties': {
                    'type': 'string'
                }
            },
            'compilationOptions': { '$ref': '#/definitions/compilationOptions' },
            'configurations': {
                'type': 'object',
                'description': nls.localize(10, null),
                'additionalProperties': {
                    'type': 'object',
                    'properties': {
                        'compilationOptions': { '$ref': '#/definitions/compilationOptions' }
                    }
                }
            },
            'dependencies': { '$ref': '#/definitions/dependencies' },
            'description': {
                'description': nls.localize(11, null),
                'type': 'string'
            },
            'exclude': {
                'description': nls.localize(12, null),
                'type': ['string', 'array'],
                'items': {
                    'type': 'string'
                },
                'default': ['bin/**/*.*', 'obj/**/*.*']
            },
            'frameworks': {
                'description': nls.localize(13, null),
                'type': 'object',
                'additionalProperties': { '$ref': '#/definitions/configType' }
            },
            'preprocess': {
                'description': nls.localize(14, null),
                'type': 'string',
                'default': 'Compiler\\Preprocess\\**\\*.cs'
            },
            'resources': {
                'description': nls.localize(15, null),
                'type': ['string', 'array'],
                'items': {
                    'type': 'string'
                },
                'default': 'Compiler\\Resources\\**\\*.cs'
            },
            'scripts': {
                'type': 'object',
                'description': nls.localize(16, null),
                'properties': {
                    'prepack': { '$ref': '#/definitions/script' },
                    'postpack': { '$ref': '#/definitions/script' },
                    'prebundle': { '$ref': '#/definitions/script' },
                    'postbundle': { '$ref': '#/definitions/script' },
                    'prerestore': { '$ref': '#/definitions/script' },
                    'postrestore': { '$ref': '#/definitions/script' },
                    'prepare': { '$ref': '#/definitions/script' }
                }
            },
            'shared': {
                'description': nls.localize(17, null),
                'type': ['string', 'array'],
                'items': {
                    'type': 'string'
                },
                'default': 'Compiler\\Shared\\**\\*.cs'
            },
            'version': {
                'description': nls.localize(18, null),
                'type': 'string'
            },
            'webroot': {
                'description': nls.localize(19, null),
                'type': 'string'
            }
        }
    };
    MonacoEditorSchemas['http://json.schemastore.org/bower'] = {
        'title': nls.localize(20, null),
        '$schema': 'http://json-schema.org/draft-04/schema#',
        'id': 'http://json.schemastore.org/bower',
        'type': 'object',
        'required': ['name'],
        'patternProperties': {
            '^_': {
                'description': nls.localize(21, null),
                'additionalProperties': true,
                'additionalItems': true
            }
        },
        'properties': {
            'name': {
                'description': nls.localize(22, null),
                'type': 'string',
                'maxLength': 50
            },
            'description': {
                'description': nls.localize(23, null),
                'type': 'string'
            },
            'version': {
                'description': nls.localize(24, null),
                'type': 'string'
            },
            'main': {
                'description': nls.localize(25, null),
                'type': ['string', 'array']
            },
            'license': {
                'description': nls.localize(26, null),
                'type': ['string', 'array'],
                'maxLength': 140
            },
            'ignore': {
                'description': nls.localize(27, null),
                'type': ['string', 'array']
            },
            'keywords': {
                'description': nls.localize(28, null),
                'type': 'array',
                'items': {
                    'type': 'string',
                    'maxLength': 50
                }
            },
            'authors': {
                'description': nls.localize(29, null),
                'type': 'array',
                'items': {
                    'type': ['string', 'object']
                }
            },
            'homepage': {
                'description': nls.localize(30, null),
                'type': 'string'
            },
            'repository': {
                'description': nls.localize(31, null),
                'type': 'object',
                'properties': {
                    'type': {
                        'type': 'string',
                        'enum': ['git']
                    },
                    'url': {
                        'type': 'string'
                    }
                }
            },
            'dependencies': {
                'id': 'bower-packages',
                'description': nls.localize(32, null),
                'type': 'object',
                'additionalProperties': {
                    'id': 'bower-package',
                    'type': 'string'
                }
            },
            'devDependencies': {
                'id': 'bower-packages',
                'description': nls.localize(33, null),
                'type': 'object',
                'additionalProperties': {
                    'id': 'bower-package',
                    'type': 'string'
                }
            },
            'resolutions': {
                'description': nls.localize(34, null),
                'type': 'object'
            },
            'private': {
                'description': nls.localize(35, null),
                'type': 'boolean'
            },
            'exportsOverride': {
                'description': nls.localize(36, null),
                'type': 'object',
                'additionalProperties': {
                    'type': 'object',
                    'additionalProperties': {
                        'type': 'string'
                    }
                }
            },
            'moduleType': {
                'description': nls.localize(37, null),
                'type': 'array',
                'items': {
                    'enum': ['amd', 'es6', 'globals', 'node', 'yui']
                }
            }
        }
    };
    MonacoEditorSchemas['http://json.schemastore.org/package'] = {
        'id': 'http://json.schemastore.org/package',
        'description': nls.localize(38, null),
        'type': 'object',
        'required': ['name', 'version'],
        'definitions': {
            'person': {
                'description': nls.localize(39, null),
                'type': ['object', 'string'],
                'required': ['name'],
                'properties': {
                    'name': {
                        'type': 'string'
                    },
                    'url': {
                        'type': 'string',
                        'format': 'uri'
                    },
                    'email': {
                        'type': 'string',
                        'format': 'email'
                    }
                }
            },
            'dependency': {
                'id': 'npm-packages',
                'description': nls.localize(40, null),
                'type': 'object',
                'additionalProperties': {
                    'type': 'string'
                }
            }
        },
        'patternProperties': {
            '^_': {
                'description': nls.localize(41, null),
                'additionalProperties': true,
                'additionalItems': true
            }
        },
        'properties': {
            'name': {
                'description': nls.localize(42, null),
                'type': 'string'
            },
            'version': {
                'description': nls.localize(43, null),
                'type': 'string'
            },
            'description': {
                'description': nls.localize(44, null),
                'type': 'string'
            },
            'icon': {
                'description': nls.localize(45, null),
                'type': 'string'
            },
            'keywords': {
                'description': nls.localize(46, null),
                'type': 'array'
            },
            'homepage': {
                'description': nls.localize(47, null),
                'type': 'string'
            },
            'bugs': {
                'description': nls.localize(48, null),
                'type': ['object', 'string'],
                'properties': {
                    'url': {
                        'type': 'string',
                        'description': nls.localize(49, null),
                        'format': 'uri'
                    },
                    'email': {
                        'type': 'string',
                        'description': nls.localize(50, null)
                    }
                }
            },
            'license': {
                'type': 'string',
                'description': nls.localize(51, null)
            },
            'licenses': {
                'description': nls.localize(52, null),
                'type': 'array',
                'items': {
                    'type': 'object',
                    'properties': {
                        'type': {
                            'type': 'string'
                        },
                        'url': {
                            'type': 'string',
                            'format': 'uri'
                        }
                    }
                }
            },
            'author': {
                '$ref': '#/definitions/person'
            },
            'contributors': {
                'description': nls.localize(53, null),
                'type': 'array',
                'items': {
                    '$ref': '#/definitions/person'
                }
            },
            'maintainers': {
                'description': nls.localize(54, null),
                'type': 'array',
                'items': {
                    '$ref': '#/definitions/person'
                }
            },
            'files': {
                'description': nls.localize(55, null),
                'type': 'array',
                'items': {
                    'type': 'string'
                }
            },
            'main': {
                'description': nls.localize(56, null),
                'type': 'string'
            },
            'bin': {
                'type': ['string', 'object'],
                'additionalProperties': {
                    'type': 'string'
                }
            },
            'man': {
                'type': ['array', 'string'],
                'description': nls.localize(57, null),
                'items': {
                    'type': 'string'
                }
            },
            'directories': {
                'type': 'object',
                'properties': {
                    'bin': {
                        'description': nls.localize(58, null),
                        'type': 'string'
                    },
                    'doc': {
                        'description': nls.localize(59, null),
                        'type': 'string'
                    },
                    'example': {
                        'description': nls.localize(60, null),
                        'type': 'string'
                    },
                    'lib': {
                        'description': nls.localize(61, null),
                        'type': 'string'
                    },
                    'man': {
                        'description': nls.localize(62, null),
                        'type': 'string'
                    },
                    'test': {
                        'type': 'string'
                    }
                }
            },
            'repository': {
                'description': nls.localize(63, null),
                'type': 'object',
                'properties': {
                    'type': {
                        'type': 'string'
                    },
                    'url': {
                        'type': 'string'
                    }
                }
            },
            'scripts': {
                'description': nls.localize(64, null),
                'type': 'object',
                'additionalProperties': {
                    'type': 'string'
                }
            },
            'config': {
                'description': nls.localize(65, null),
                'type': 'object',
                'additionalProperties': true
            },
            'dependencies': {
                '$ref': '#/definitions/dependency'
            },
            'devDependencies': {
                '$ref': '#/definitions/dependency'
            },
            'bundleDependencies': {
                'type': 'array',
                'description': nls.localize(66, null),
                'items': {
                    'type': 'string'
                }
            },
            'bundledDependencies': {
                'type': 'array',
                'description': nls.localize(67, null),
                'items': {
                    'type': 'string'
                }
            },
            'optionalDependencies': {
                '$ref': '#/definitions/dependency'
            },
            'peerDependencies': {
                '$ref': '#/definitions/dependency'
            },
            'engines': {
                'type': 'object',
                'additionalProperties': {
                    'type': 'string'
                }
            },
            'engineStrict': {
                'type': 'boolean'
            },
            'os': {
                'type': 'array',
                'items': {
                    'type': 'string'
                }
            },
            'cpu': {
                'type': 'array',
                'items': {
                    'type': 'string'
                }
            },
            'preferGlobal': {
                'type': 'boolean',
                'description': nls.localize(68, null)
            },
            'private': {
                'type': 'boolean',
                'description': nls.localize(69, null)
            },
            'publishConfig': {
                'type': 'object',
                'additionalProperties': true
            },
            'dist': {
                'type': 'object',
                'properties': {
                    'shasum': {
                        'type': 'string'
                    },
                    'tarball': {
                        'type': 'string'
                    }
                }
            },
            'readme': {
                'type': 'string'
            }
        }
    };
    MonacoEditorSchemas['http://json.schemastore.org/global'] = {
        'title': nls.localize(70, null),
        'type': 'object',
        'additionalProperties': true,
        'required': ['projects'],
        'properties': {
            'projects': {
                'type': 'array',
                'description': nls.localize(71, null),
                'items': {
                    'type': 'string'
                }
            },
            'sources': {
                'type': 'array',
                'description': nls.localize(72, null),
                'items': {
                    'type': 'string'
                }
            },
            'sdk': {
                'type': 'object',
                'description': nls.localize(73, null),
                'properties': {
                    'version': {
                        'type': 'string',
                        'description': nls.localize(74, null)
                    },
                    'runtime': {
                        'type': 'string',
                        'description': nls.localize(75, null),
                    },
                    'architecture': {
                        'type': 'string',
                        'description': nls.localize(76, null)
                    }
                }
            }
        }
    };
    MonacoEditorSchemas['http://json.schemastore.org/tsconfig'] = {
        'title': nls.localize(77, null),
        '$schema': 'http://json-schema.org/draft-04/schema#',
        'type': 'object',
        'default': { 'compilerOptions': { 'target': 'ES5', 'module': 'commonjs' } },
        'properties': {
            'compilerOptions': {
                'type': 'object',
                'description': nls.localize(78, null),
                'properties': {
                    'charset': {
                        'description': nls.localize(79, null),
                        'type': 'string'
                    },
                    'declaration': {
                        'description': nls.localize(80, null),
                        'type': 'boolean'
                    },
                    'diagnostics': {
                        'description': nls.localize(81, null),
                        'type': 'boolean'
                    },
                    'emitBOM': {
                        'description': nls.localize(82, null),
                        'type': 'boolean'
                    },
                    'inlineSourceMap': {
                        'description': nls.localize(83, null),
                        'type': 'boolean'
                    },
                    'inlineSources': {
                        'description': nls.localize(84, null),
                        'type': 'boolean'
                    },
                    'listFiles': {
                        'description': nls.localize(85, null),
                        'type': 'boolean'
                    },
                    'locale': {
                        'description': nls.localize(86, null),
                        'type': 'string'
                    },
                    'mapRoot': {
                        'description': nls.localize(87, null),
                        'type': 'string',
                        'format': 'uri'
                    },
                    'module': {
                        'description': nls.localize(88, null),
                        'enum': ['commonjs', 'amd', 'umd', 'system']
                    },
                    'newLine': {
                        'description': nls.localize(89, null),
                        'enum': ['CRLF', 'LF']
                    },
                    'noEmit': {
                        'description': nls.localize(90, null),
                        'type': 'boolean'
                    },
                    'noEmitOnError': {
                        'description': nls.localize(91, null),
                        'type': 'boolean'
                    },
                    'noEmitHelpers': {
                        'description': nls.localize(92, null),
                        'type': 'boolean'
                    },
                    'noImplicitAny': {
                        'description': nls.localize(93, null),
                        'type': 'boolean'
                    },
                    'noLib': {
                        'description': nls.localize(94, null),
                        'type': 'boolean'
                    },
                    'noResolve': {
                        'description': nls.localize(95, null),
                        'type': 'boolean'
                    },
                    'out': {
                        'description': nls.localize(96, null),
                        'type': 'string',
                        'format': 'uri'
                    },
                    'outDir': {
                        'description': nls.localize(97, null),
                        'type': 'string',
                        'format': 'uri'
                    },
                    'preserveConstEnums': {
                        'description': nls.localize(98, null),
                        'type': 'boolean'
                    },
                    'removeComments': {
                        'description': nls.localize(99, null),
                        'type': 'boolean'
                    },
                    'rootDir': {
                        'description': nls.localize(100, null),
                        'type': 'string'
                    },
                    'sourceMap': {
                        'description': nls.localize(101, null),
                        'type': 'boolean'
                    },
                    'sourceRoot': {
                        'description': nls.localize(102, null),
                        'type': 'string',
                        'format': 'uri'
                    },
                    'suppressImplicitAnyIndexErrors': {
                        'description': nls.localize(103, null),
                        'type': 'boolean'
                    },
                    'target': {
                        'description': nls.localize(104, null),
                        'enum': ['ES3', 'ES5', 'ES6', 'es3', 'es5', 'es6'],
                        'default': 'ES3'
                    },
                    'watch': {
                        'description': nls.localize(105, null),
                        'type': 'boolean'
                    },
                    'jsx': {
                        'description': nls.localize(106, null),
                        'enum': ['react', 'preserve'],
                        'default': 'react'
                    },
                    'emitDecoratorMetadata': {
                        'description': nls.localize(107, null),
                        'type': 'boolean'
                    },
                    'isolatedModules': {
                        'description': nls.localize(108, null),
                        'type': 'boolean'
                    },
                    'experimentalDecorators': {
                        'description': nls.localize(109, null),
                        'type': 'boolean'
                    },
                    'experimentalAsyncFunctions': {
                        'description': nls.localize(110, null),
                        'type': 'boolean'
                    }
                }
            },
            'files': {
                'type': 'array',
                'description': nls.localize(111, null),
                'items': {
                    'type': 'string',
                    'format': 'uri'
                }
            }
        }
    };
    MonacoEditorSchemas['http://opentools.azurewebsites.net/jsconfig'] = {
        'title': nls.localize(112, null),
        'type': 'object',
        'default': { 'compilerOptions': { 'target': 'ES6' } },
        'properties': {
            'compilerOptions': {
                'type': 'object',
                'description': nls.localize(113, null),
                'properties': {
                    'charset': {
                        'description': nls.localize(114, null),
                        'type': 'string'
                    },
                    'diagnostics': {
                        'description': nls.localize(115, null),
                        'type': 'boolean'
                    },
                    'locale': {
                        'description': nls.localize(116, null),
                        'type': 'string'
                    },
                    'mapRoot': {
                        'description': nls.localize(117, null),
                        'type': 'string',
                        'format': 'uri'
                    },
                    'module': {
                        'description': nls.localize(118, null),
                        'enum': ['commonjs', 'amd', 'system', 'umd']
                    },
                    'noLib': {
                        'description': nls.localize(119, null),
                        'type': 'boolean'
                    },
                    'target': {
                        'description': nls.localize(120, null),
                        'enum': ['ES3', 'ES5', 'ES6', 'es3', 'es5', 'es6'],
                        'default': 'ES3'
                    },
                    'experimentalDecorators': {
                        'description': nls.localize(121, null),
                        'type': 'boolean'
                    }
                }
            },
            'files': {
                'type': 'array',
                'description': nls.localize(122, null),
                'items': {
                    'type': 'string',
                    'format': 'uri'
                }
            },
            'exclude': {
                'type': 'array',
                'description': nls.localize(123, null),
                'items': {
                    'type': 'string',
                    'format': 'uri'
                }
            }
        }
    };
});
//# sourceMappingURL=standaloneSchemas.js.map