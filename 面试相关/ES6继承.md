# ES6 继承

## ES5 和 ES6 继承的区别

ES5的继承时通过 `prototype` 或构造函数机制来实现。ES5的继承实质上是先创建子类的实例对象，然后再将父类的方法添加到 `this` 上（`Parent.apply(this)`）。

ES6的继承机制完全不同，实质上是先创建父类的实例对象this（所以必须先调用父类的 `super()` 方法），然后再用子类的构造函数修改`this`。

注意：**在子类的构造函数中，只有调用 `super` 之后，才可以使用 `this` 关键字，因为子类实例的构建基于对父类的加工，只有 `super` 方法才能发挥父类的实例**

```js
 //ES5
function A(name, id) {
    this.name = name;
    this.id = id;
    this.sex = 'nv'
}
A.prototype.say = function() {
    console.log(this.name)
}
A.job = 'teacher';

function B(name, id, age) {
    A.call(this, name, id)
    this.age = age
}
let obA = new A()

Object.setPrototypeOf(B, A) // B继承A的静态属性 ==> B.__proto__ = A
Object.setPrototypeOf(B.prototype, A.prototype) //B的实例继承A的实例 ==> B.prototype.__proto__=A.prototype
/*
** 这里有2条继承链
** 1) 作为一个对象，子类B的原型(__proto__属性)是父类
** 2) 作为一个构造函数，子类B的原型(prototype属性)是父类的实例
*/

let ob = new B('mht', 1, 22)
ob.say()
console.log(A.job)
console.log(B.job)

// ES6

class C {
    constructor(name, id) {
        this.name = name;
        this.id = id;
    }
    say() {
        console.log(this.name)
    }
}

class D extends C {
    constructor(name, id, age) {
        super(name, id); // 这里必须先调用super方法
        this.age = age;
    }
}

let obD = new D('mht', 22, 33)
obD.say()
```