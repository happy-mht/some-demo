## Vue 侦测变化原理分析

js可以通过 `Object.defineProperty` 和 ES6 的 `proxy` 来侦测对象的变化。Vue使用前者。

知道 `Object.defineProperty` 可以侦测到对象的变化，那么我们瞬间可以写出这样的代码：

```js
function defineReactive(data, key, val) {
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get() {
            return val;
        },
        set(newVal) {
            if (val !== newVal) {
                val = newVal;
            }
        }
    })
}
```

封装好后，每当 `data` 的 `key` 读取数据时，`get` 这个函数会被触发，设置数据时 `set` 函数会被触发。

## 怎么观察？

我们之所以要观察一个数据，目的是为了当数据的属性发生变化时，可以通知那些使用了这个 `key` 的地方。

```html
<template>
  <div>{{ key }}</div>
  <p>{{ key }}</p>
</template>
```

如上模板中有2处使用了 `key`，所以当数据变化时，要把这2处都通知到。

So ~，需要先收集依赖，把这些使用到 `key` 的地方先收集起来，然后等属性发生变化时，把收集好的依赖循环触发一遍。即：**`getter` 中搜集依赖，`setter` 中，触发依赖**。

## 依赖收集在哪？

在 `getter` 中收集依赖，那么我们的依赖收集到哪里去呢？？

首先想到的是每个 `key` 都有一个数组，用来存储当前 `key` 的依赖，假设依赖是一个函数存在 `window.target` 上，先把 `defineReactive` 稍微改造一下：

```js
function defineReactive(data, key, val) {
    let dep=[]; // 新增
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get() {
            dep.push(window.target) // 新增
            return val;
        },
        set(newVal) {
            if (val === newVal) {
                return;
            }
            // 新增
            for(let i=0;i<dep.length;i++){
              dep[i](newVal, val)
            }
            val = newVal
        }
    })
}
```

在 `defineReactive` 中新增了数组 `dep`，用来存储被收集的依赖。  ---发布者

然后在触发 `set` 触发时，循环 `dep` 把收集到的依赖触发。

但是这样写有点耦合，我们把依赖收集这部分代码封装起来，写成下面的样子：

```js
class Dep{
  constructor(){
    this.id = uid++
    this.subs=[]
  }
  addSub(sub){
   this.subs.push(sub)
  }
  removeSub(sub){
    remove(this.subs,sub)
  }
  depend(){
    if(Dep.target){
      this.addSub(Dep.target)
    }
  }
  notify(){
    let subs = this.subs.slice()
    for (let i = 0, l=subs.length; i< l; i++){
      subs[i].update()
    }
  }
}
```

然后在改造一下 defineReactive：

```js
function defineReactive(data, key, val) {
    let dep=new Dep() // 修改
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get() {
            dep.depend() // 修改
            return val;
        },
        set(newVal) {
            if (val === newVal) {
                return;
            }
            // 修改 
            val = newVal
            dep.notify()
        }
    })
}
```

顺便回答一下上面问的问题，依赖收集到哪？收集到Dep中，Dep是专门用来存储依赖的。

## 收集谁 ？

上面我们假装 `window.target` 是需要被收集的依赖，细心的同学可能已经看到，上面的代码 `window.target` 已经改成了 `Dep.target`，那 `Dep.target`是什么？我们究竟要收集谁呢？？

收集谁，换句话说是当属性发生变化后，通知谁。 --订阅者

我们要通知那个使用到数据的地方，而使用这个数据的地方有很多，而且类型还不一样，有可能是模板，有可能是用户写的一个 `watch`，所以这个时候我们需要抽象出一个能集中处理这些不同情况的类，然后我们在依赖收集的阶段只收集这个封装好的类的实例进来，通知也只通知它一个，然后它在负责通知其他地方，所以我们要抽象的这个东西需要先起一个好听的名字，嗯，就叫它 `watcher` 吧~

所以现在可以回答上面的问题，收集谁？？收集 `Watcher`。

## 什么是 `Watcher` ？

`watcher` 是一个中介的角色，数据发生变化通知给 `watcher`，然后`watcher`在通知给其他地方。

关于`watcher`我们先看一个经典的使用方式：

```js
// keypath
vm.$watch('a.b.c', function (newVal, oldVal) {
  // do something
})
```
这段代码表示当 `data.a.b.c` 这个属性发生变化时，触发第二个参数这个函数。

思考一下怎么实现这个功能呢？

好像只要把这个 `watcher` 实例添加到 `data.a.b.c` 这个属性的 `Dep` 中去就行了，然后 `data.a.b.c` 触发时，会通知到 `watcher`，然后 `watcher` 在执行参数中的这个回调函数。

```js
class Watcher {
    constructor(vm, node, key) {
        Dep.target = this;
        this.vm = vm;
        this.node = node;
        this.key = key;
        this.update()
    }
    get() {
        this.value = this.vm[this.key]
    }
    update() {
        this.get()
        if (this.node.nodeType == 3) {
            this.node.nodeValue = this.value;
        }
    }
}
```

这段代码可以把自己主动 `push` 到 `data.a.b.c` 的 `Dep` 中去。

因为我在 `get` 这个方法中，先把 `Dep.traget` 设置成了 `this`，也就是当前`watcher`实例，然后在读一下 `data.a.b.c` 的值。

因为读了 `data.a.b.c` 的值，所以肯定会触发 `getter`。

触发了 `getter` 上面我们封装的 `defineReactive` 函数中有一段逻辑就会从 `Dep.target` 里读一个依赖 `push` 到 `Dep` 中。

所以就导致，我只要先在 `Dep.target` 赋一个 `this`，然后我在读一下值，去触发一下 `getter`，就可以把 `this` 主动 `push` 到 `keypath` 的依赖中，有没有很神奇~

依赖注入到 `Dep` 中去之后，当这个 `data.a.b.c` 的值发生变化，就把所有的依赖循环触发 `update` 方法，也就是上面代码中 `update` 那个方法。

`update` 方法会触发参数中的回调函数，将`value` 和 `oldValue` 传到参数中。

所以其实不管是用户执行的 `vm.$watch('a.b.c', (value, oldValue) => {})` 还是模板中用到的`data`，都是通过 `watcher` 来通知自己是否需要发生变化的。

## 递归侦测所有key

现在其实已经可以实现变化侦测的功能了，但是我们之前写的代码只能侦测数据中的一个 key，所以我们要加工一下 defineReactive 这个函数：

```js
// 新增
function walk (obj) {
  const keys = Object.keys(obj)
  for (let i = 0; i < keys.length; i++) {
    defineReactive(obj, keys[i], obj[keys[i]])
  }
}

function defineReactive (data, key, val) {
    walk(val) // 新增
    let dep = new Dep()
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get: function () {
            dep.depend()
            return val
        },
        set: function (newVal) {
            if(val === newVal){
                return
            }
            dep.notify()
            val = newVal
        }
    })
}
```

这样我们就可以通过执行 walk(data)，把 data 中的所有 key 都加工成可以被侦测的，因为是一个递归的过程，所以 key 中的 value 如果是一个对象，那这个对象的所有key也会被侦测。

## 观察者模式

>定义了一种一对多的依赖关系，让多个观察者对象同时监听某一个主题对象。这个主题对象在状态上发生变化时，会通知所有观察者对象，使他们能够自动更新自己。

比较概念的解释是，目标和观察者是基类，目标提供维护观察者的一系列方法，观察者提供更新接口。具体观察者和具体目标继承各自的基类，然后具体观察者把自己注册到具体目标里，在具体目标发生变化时候，调度观察者的更新方法。

比如有个“天气中心”的具体目标A，专门监听天气变化，而有个显示天气的界面的观察者B，B就把自己注册到A里，当A触发天气变化，就调度B的更新方法，并带上自己的上下文。


观察者模式如下图所示：

![观察者模式](./观察者模式.png)

Vue 实现的响应式原理：

![vue](./Vue.png)

## 发布/订阅模式

**发布/订阅模式有一个调度中心，对订阅事件进行统一管理**

比较概念的解释是，订阅者把自己想订阅的事件注册到调度中心，当该事件触发时候，发布者发布该事件到调度中心（顺带上下文），由调度中心统一调度订阅者注册到调度中心的处理代码。

比如有个界面是实时显示天气，它就订阅天气事件（注册到调度中心，包括处理程序），当天气变化时（定时获取数据），就作为发布者发布天气信息到调度中心，调度中心就调度订阅者的天气处理程序。

![发布订阅模式](./发布订阅模式.png)

1. 从两张图片可以看到，最大的区别是调度的地方。

虽然两种模式都存在订阅者和发布者（具体观察者可认为是订阅者、具体目标可认为是发布者），但是观察者模式是由具体目标调度的，而发布/订阅模式是统一由调度中心调的，所以观察者模式的订阅者与发布者之间是存在依赖的，而发布/订阅模式则不会。

2. 两种模式都可以用于松散耦合，改进代码管理和潜在的复用。
