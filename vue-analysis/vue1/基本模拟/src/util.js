'use strict';

/**
 * 混入属性合并
 * @param  {[type]} to   [description]
 * @param  {[type]} from [description]
 * @return {[type]}      [description]
 */
function extend(to,from) {
  //Object.keys()要返回其枚举自身属性的对象。 与for in区别在于不能遍历出原型链上的属性；
  Object.keys(from).forEach((i)=>to[i] = from[i])
}

/**
* 绑定事件
* @param {Element} el
* @param {String} event
* @param {Function} cb
* @param {Boolean} [useCapture]
*/
function on(el, event, cb, useCapture) {
  el.addEventListener(event, cb, useCapture);
}

/**
 * 检查对象上是否有指定的属性
 * @param {Object} obj
 * @param {String} key
 * @return {Boolean}
 */
function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj,key)
}

function isObject(obj) {
    return obj !== null && (typeof obj === 'undefined' ? 'undefined' : typeof obj === 'object')
}

function mergeData(to, from){

}


/**
 * 文本输出
 * 如果是null 返回空
 * 如果有值，通过toString强制转字符串
 * @param {*} value
 * @return {String}
 */

function _toString(value) {
    return value == null ? '' : value.toString();
}

/**
 * 定义一个属性
 *
 * @param {Object} obj
 * @param {String} key
 * @param {*} val
 * @param {Boolean} [enumerable]
 */

function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true
    });
}


/**
 * 数组检测
 *
 * @param {*} obj
 * @return {Boolean}
 */
var isArray = Array.isArray;

/**
 * 错误提示
 */
var warn$2 = void 0;
var hasConsole = typeof console !== 'undefined';
warn$2 = function warn(msg, e) {
    if (hasConsole) {
        console.warn('[Ue warn]: ' + msg);
    }
};


/**
 * 查询节点
 * @param  {[type]} el [description]
 * @return {[type]}    [description]
 */
function query(el) {
  if (typeof el === 'string') {
    var selector = el;
    el = document.querySelector(el);
    if (!el) {
      warn('Cannot find element: ' + selector);
    }
  }
  return el;
}


/**
 * 通过el替换target节点
 *
 * @param {Element} target
 * @param {Element} el
 */

function replace(target, el) {
  var parent = target.parentNode;
  if (parent) {
    parent.replaceChild(el, target);
  }
}

var isScript = function isScript(el) {
    return el.tagName === 'SCRIPT' && (!el.hasAttribute('type') || el.getAttribute('type') === 'text/javascript');
};

/**
 * 转化数组
 * @param  {[type]} list  [description]
 * @param  {[type]} start [description]
 * @return {[type]}       [description]
 */
var toArray = function(list, start) {
    start = start || 0;
    var i = list.length - start;
    var ret = new Array(i);
    while (i--) {
        ret[i] = list[i + start];
    }
    return ret;
}