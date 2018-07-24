// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"src/index.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var efineComponent = exports.efineComponent = function efineComponent(componentClazz) {
    var ElementTemplate = function (_HTMLElement) {
        _inherits(ElementTemplate, _HTMLElement);

        function ElementTemplate() {
            _classCallCheck(this, ElementTemplate);

            return _possibleConstructorReturn(this, (ElementTemplate.__proto__ || Object.getPrototypeOf(ElementTemplate)).apply(this, arguments));
        }

        return ElementTemplate;
    }(HTMLElement);
    var vm = new componentClazz();
    ElementTemplate.prototype.connectedCallback = function () {
        var documentFlagment = strToHtml(vm.template.trim());
        registerDefineProperty(vm);
        registerDom(documentFlagment, vm);
        this.appendChild(documentFlagment);
        bindEvent(this, vm);
    };
    var attrs = Object.keys(vm.props);
    ElementTemplate.observedAttributes = attrs;
    ElementTemplate.prototype.attributeChangedCallback = function () {
        vm.attributeChangedCallback.apply(this, arguments);
    };
    var tagName = vm.tagName || getTagNameByClazzName(componentClazz.name);
    customElements.define(tagName, ElementTemplate);
};

var getTagNameByClazzName = function getTagNameByClazzName(clazzName) {
    return clazzName.replace(/[A-Z]/g, function (match) {
        return '-' + match.toLowerCase();
    }).slice(1);
};

var strToHtml = function strToHtml(str) {
    var template = document.createElement('template');
    template.innerHTML = str;
    return template.content;
};

var eventListener = function eventListener(event) {
    return event.currentTarget.events[event.type](event);
};

var bindEvent = function bindEvent(documentFragment, context) {
    documentFragment.childNodes.forEach(function (node) {
        if (!node.tagName) return;
        bindEvent(node, context);
        var attributes = node.attributes;

        var _loop = function _loop(i) {
            var name = attributes[i].name;

            if (!name.startsWith('@')) return 'continue';
            var methodName = node.getAttribute(name);
            name = name.slice(1);
            if (!node.events) {
                node.events = {};
            }
            node.events[name] = function (event) {
                if (context.methods) context.methods[methodName].call(context, event);
            };
            node.addEventListener(name, eventListener);
        };

        for (var i = 0; i < attributes.length; i++) {
            var _ret = _loop(i);

            if (_ret === 'continue') continue;
        }
    });
};

var strTemplateRegExp = /\{\{((?:.|\n)+?)\}\}/g;

var registerDom = function registerDom(documentFragment, context) {
    documentFragment.childNodes.forEach(function (node) {
        if (node.nodeType === Node.TEXT_NODE) {
            var strTemplate = node.nodeValue;
            if (!strTemplateRegExp.test(strTemplate)) return;
            var protoNameArr = Object.keys(context.data);
            var refreshDom = function refreshDom() {
                var resultStr = strTemplate;
                resultStr.replace(strTemplateRegExp, function (match, expression) {
                    var keys = protoNameArr.join(',');
                    var evalFn = new Function('{' + keys + '}', 'return ' + expression);
                    resultStr = resultStr.replace(match, evalFn(context.data));
                });
                if (node.nodeValue !== resultStr) node.nodeValue = resultStr;
            };
            refreshDom();
            watcher.push(refreshDom);
        }
        registerDom(node, context);
    });
};

var watcher = [];

var registerDefineProperty = function registerDefineProperty(context) {
    Object.keys(context.data()).forEach(function (protoName) {
        context.data['_' + protoName] = context.data()[protoName];
        Object.defineProperty(context.data, protoName, {
            set: function set(newVal) {
                if (context.data['_' + protoName] === newVal) return;
                context.data['_' + protoName] = newVal;
                // newVal is Object
                if (newVal instanceof Object) register(newVal);
                watcher.forEach(function (callback) {
                    return callback();
                });
            },
            get: function get() {
                return context.data['_' + protoName];
            },
            enumerable: true,
            configurable: true
        });
        if (context.data[protoName] instanceof Object) register(context.data[protoName]);
    });
};

var register = function register(obj) {
    Object.keys(obj).forEach(function (protoName) {
        obj['_' + protoName] = obj[protoName];

        Object.defineProperty(obj, protoName, {
            set: function set(newVal) {
                if (obj['_' + protoName] === newVal) return;
                obj['_' + protoName] = newVal;
                watcher.forEach(function (callback) {
                    return callback();
                });
            },
            get: function get() {
                return obj['_' + protoName];
            },
            enumerable: true,
            configurable: true
        });
        if (obj[protoName] instanceof Object) register(obj[protoName]);
    });
};
},{}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';

var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };

  module.bundle.hotData = null;
}

module.bundle.Module = Module;

var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = '' || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '49506' + '/');
  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();

      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');

      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);

      removeErrorOverlay();

      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;

  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';

  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","src/index.js"], null)
//# sourceMappingURL=/src.74a59c51.map