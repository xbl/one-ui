// import '@webcomponents/custom-elements';
const watcher = [];
const attributeChangedArr = [];

export const defineComponent = function (componentClazz) {
  let ElementTemplate = getElementTemplate();
  const vm = new componentClazz();
  let renderd = false;
  ElementTemplate.prototype.connectedCallback = function() {
      const documentFlagment = strToHtml(vm.template.trim());
      registerData(vm);
      registerDom(documentFlagment, vm);
      let targetDom = this;
      if (isNative(this.attachShadow)) {
        targetDom = this.attachShadow({mode: 'open'});
      }
      targetDom.appendChild(documentFlagment);
      if (vm.style) {
        const styleDom = document.createElement('style');
        styleDom.textContent = vm.style.trim();
        targetDom.appendChild(styleDom);
      }
      bindEvent(targetDom, vm);
      const _this = this;
      vm.$emit = function(eventName, detail) {
        _this.dispatchEvent(new CustomEvent(eventName, {detail}));
      }

      attributeChangedCallback(vm);
      renderd = true;
  }
  const attrs = Object.keys(vm.props);
  ElementTemplate.observedAttributes = attrs;
  ElementTemplate.prototype.attributeChangedCallback = function(name, oldVal, newVal) {
    if (!renderd) {
      return attributeChangedArr.push({name, oldVal, newVal});
    }
    attributeChangedCallback(vm);
  }
  const tagName = vm.tagName || getTagNameByClazzName(componentClazz.name);
  customElements.define(tagName, ElementTemplate);
};

export default {
  defineComponent
}

const getElementTemplate = function () {
  const createHostConstructor = new Function('', 'return class extends HTMLElement{}');
  return createHostConstructor();
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

const registerData = function (vm) {
  if (!vm.data)
    return ;
  vm._data = vm.data();
  register(vm._data);
  Object.defineProperty(vm, 'data', {
    get: function() {
      return vm._data;
    },
    enumerable: true,
    configurable: true
  });
};

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
          const evalFn = new Function(`{${keys}}`, `try{return ${expression}}catch(e){}`);
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

const register = function(obj) {
  Object.keys(obj).forEach((protoName) => {
    obj['_' + protoName] = obj[protoName];

    Object.defineProperty(obj, protoName, {
      set: function(newVal) {
        if (obj['_' + protoName] === newVal) return;
        obj['_' + protoName] = newVal;
        if(newVal instanceof Object)
          register(obj[protoName]);
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

const attributeChangedCallback = function (vm) {
  attributeChangedArr.forEach(({name, oldVal, newVal}) => {
    const propType = vm.props[name];
    if (!propType)
      return ;
    if (typeof propType === 'function' && propType !== Object) {
      vm[name] = propType(newVal);
    } else if (propType === JSON || propType === Object) {
      vm[name] = JSON.parse(newVal);
    }
  });
};
