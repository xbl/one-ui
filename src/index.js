// import '@webcomponents/custom-elements';
export const defineComponent = function (componentClazz) {
  let ElementTemplate;
  if (isNative(customElements.define)) {
    // ElementTemplate = class extends HTMLElement {}
    const createHostConstructor = new Function('', 'return class extends HTMLElement{}');
    ElementTemplate = createHostConstructor();
  } else {
    ElementTemplate = function(self) {
      return HTMLElement.call(this, self);
    };
  }
  const vm = new componentClazz();
  ElementTemplate.prototype.connectedCallback = function() {
      const documentFlagment = strToHtml(vm.template.trim());
      registerDefineProperty(vm);
      registerDom(documentFlagment, vm);
      this.appendChild(documentFlagment);
      bindEvent(this, vm);
  }
  const attrs = Object.keys(vm.props);
  ElementTemplate.observedAttributes = attrs;
  ElementTemplate.prototype.attributeChangedCallback = function() {
      vm.attributeChangedCallback.apply(this, arguments);
  }
  const tagName = vm.tagName || getTagNameByClazzName(componentClazz.name);
  customElements.define(tagName, ElementTemplate);
};

function isNative(fn) {
  return (/\{\s*\[native code\]\s*\}/).test('' + fn);
}

const getTagNameByClazzName = function (clazzName) {
  return clazzName
          .replace(/[A-Z]/g, (match) => '-' + match.toLowerCase())
          .slice(1);
};

const strToHtml = function(str) {
  const template = document.createElement('template');
  template.innerHTML = str;
  return template.content;
};

const eventListener = event => event.currentTarget.events[event.type](event);

const bindEvent = function(documentFragment, context) {
  documentFragment.childNodes.forEach((node) => {
    if (!node.tagName) return ;
    bindEvent(node, context);
    const { attributes } = node;
    for (let i = 0; i < attributes.length; i++) {
      let { name } = attributes[i];
      if (!name.startsWith('@')) continue;
      const methodName = node.getAttribute(name);
      name = name.slice(1);
      if (!node.events) {
          node.events = {};
      }
      node.events[name] = function (event) {
          if (context.methods) context.methods[methodName].call(context, event);
      };
      node.addEventListener(name, eventListener);
    }
  });
};

const strTemplateRegExp = /\{\{((?:.|\n)+?)\}\}/g;

const registerDom = function(documentFragment, context) {
    documentFragment.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            const strTemplate = node.nodeValue;
            if (!strTemplateRegExp.test(strTemplate)) return;
            const protoNameArr = Object.keys(context.data);
            const refreshDom = function () {
                let resultStr = strTemplate;
                resultStr.replace(strTemplateRegExp, function(match, expression) {
                    const keys = protoNameArr.join(',');
                    const evalFn = new Function(`{${keys}}`, `return ${expression}`);
                    resultStr = resultStr.replace(match, evalFn(context.data));
                });
                if(node.nodeValue !== resultStr)
                    node.nodeValue = resultStr;
            };
            refreshDom();
            watcher.push(refreshDom);
        }
        registerDom(node, context);
    });
};

const watcher = [];

const registerDefineProperty = function(context) {
    Object.keys(context.data()).forEach((protoName) => {
        context.data['_' + protoName] = context.data()[protoName];
        Object.defineProperty(context.data, protoName, {
            set: function(newVal) {
                if (context.data['_' + protoName] === newVal) return;
                context.data['_' + protoName] = newVal;
                // newVal is Object
                if(newVal instanceof Object)
                    register(newVal);
                watcher.forEach((callback) => callback());

            },
            get: function() {
                return context.data['_' + protoName];
            },
            enumerable: true,
            configurable: true
        });
        if(context.data[protoName] instanceof Object)
            register(context.data[protoName]);
    });
};

const register = function(obj) {
    Object.keys(obj).forEach((protoName) => {
        obj['_' + protoName] = obj[protoName];

        Object.defineProperty(obj, protoName, {
            set: function(newVal) {
                if (obj['_' + protoName] === newVal) return;
                obj['_' + protoName] = newVal;
                watcher.forEach((callback) => callback());
            },
            get: function() {
                return obj['_' + protoName];
            },
            enumerable: true,
            configurable: true
        });
        if(obj[protoName] instanceof Object)
            register(obj[protoName]);
    });
};