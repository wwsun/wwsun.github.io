---
title: 深入解读 JavaScript 中的面向对象编程
date: 2017-06-19
---

面向对象编程是用抽象方式创建基于现实世界模型的一种编程模式，主要包括模块化、多态、和封装几种技术。
对 JavaScript 而言，其核心是支持面向对象的，同时它也提供了强大灵活的基于原型的面向对象编程能力。
本文将会深入的探讨有关使用 JavaScript 进行面向对象编程的一些核心基础知识，包括对象的创建，继承机制，
最后还会简要的介绍如何借助 ES6 提供的新的类机制重写传统的JavaScript面向对象代码。

## 面向对象的几个概念

在进入正题前，先了解传统的面向对象编程（例如Java）中常会涉及到的概念，大致可以包括：

- 类：定义对象的特征。它是对象的属性和方法的模板定义。
- 对象（或称实例）：类的一个实例。
- 属性：对象的特征，比如颜色、尺寸等。
- 方法：对象的行为，比如行走、说话等。
- 构造函数：对象初始化的瞬间被调用的方法。
- 继承：子类可以继承父类的特征。例如，猫继承了动物的一般特性。
- 封装：一种把数据和相关的方法绑定在一起使用的方法。
- 抽象：结合复杂的继承、方法、属性的对象能够模拟现实的模型。
- 多态：不同的类可以定义相同的方法或属性。

在 JavaScript 的面向对象编程中大体也包括这些。不过在称呼上可能稍有不同，例如，JavaScript 中没有原生的“类”的概念，
而只有**对象**的概念。因此，随着你认识的深入，我们会混用对象、实例、构造函数等概念。

## 对象（类）的创建

在JavaScript中，我们通常可以使用构造函数来创建特定类型的对象。诸如 Object 和 Array 这样的原生构造函数，在运行时会自动出现在执行环境中。此外，我们也可以创建自定义的构造函数。例如：

```js
function Person(name, age, job) {
  this.name = name;
  this.age = age;
  this.job = job;
}

var person1 = new Person('Weiwei', 27, 'Student');
var person2 = new Person('Lily', 25, 'Doctor');
```

按照惯例，构造函数始终都应该以一个大写字母开头（和Java中定义的类一样），普通函数则小写字母开头。
要创建 `Person` 的新实例，必须使用 [`new`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/new) 操作符。
以这种方式调用构造函数实际上会经历以下4个步骤：

1. 创建一个新对象（实例）
2. **将构造函数的作用域赋给新对象**（也就是重设了`this`的指向，`this`就指向了这个新对象）
3. **执行构造函数中的代码**（为这个新对象添加属性）
4. 返回新对象

在上面的例子中，我们创建了 `Person` 的两个实例 `person1` 和 `person2` 。
这两个对象默认都有一个 `constructor` 属性，该属性指向它们的构造函数 `Person`，也就是说：

```javascript 
console.log(person1.constructor == Person);  //true
console.log(person2.constructor == Person);  //true
```

### 自定义对象的类型检测

我们可以使用`instanceof`操作符进行类型检测。我们创建的所有对象既是`Object`的实例，同时也是`Person`的实例。
因为所有的对象都继承自`Object`。

```javascript
console.log(person1 instanceof Object);  //true
console.log(person1 instanceof Person);  //true
console.log(person2 instanceof Object);  //true
console.log(person2 instanceof Person);  //true
```

### 构造函数的问题

我们**不建议在构造函数中直接定义方法**，如果这样做的话，每个方法都要在每个实例上重新创建一遍，这将非常损耗性能。
——不要忘了，ECMAScript中的**函数是对象**，每定义一个函数，也就实例化了一个对象。

幸运的是，在ECMAScript中，我们可以借助**原型对象**来解决这个问题。

### 借助原型模式定义对象的方法

我们创建的每个函数都有一个`prototype`属性，这个属性是一个指针，指向该函数的**原型对象**，
该对象包含了由特定类型的**所有实例共享的属性和方法**。也就是说，我们可以利用原型对象来让所有对象实例共享它所包含的属性和方法。

```javascript
function Person(name, age, job) {
  this.name = name;
  this.age = age;
  this.job = job;
}

// 通过原型模式来添加所有实例共享的方法
// sayName() 方法将会被Person的所有实例共享，而避免了重复创建
Person.prototype.sayName = function () {
  console.log(this.name);
};

var person1 = new Person('Weiwei', 27, 'Student');
var person2 = new Person('Lily', 25, 'Doctor');

console.log(person1.sayName === person2.sayName); // true

person1.sayName(); // Weiwei
person2.sayName(); // Lily
```

正如上面的代码所示，通过原型模式定义的方法`sayName()`为所有的实例所共享。也就是，
`person1`和`person2`访问的是同一个`sayName()`函数。同样的，公共属性也可以使用原型模式进行定义。例如：

```javascript
function Chinese (name) {
    this.name = name;
}

Chinese.prototype.country = 'China'; // 公共属性，所有实例共享
```

当我们`new Person()`时，返回的`Person`实例会结合构造函数中定义的属性、行为和原型中定义的属性、行为，
生成最终属于`Person`实例的属性和行为。

构造函数中定义的属性和行为的优先级要比原型中定义的属性和行为的优先级高，如果构造函数和原型中定义了同名的属性或行为，
构造函数中的属性或行为会覆盖原型中的同名的属性或行为。

### 原型对象

现在我们来深入的理解一下什么是原型对象。

只要创建了一个新函数，就会根据一组特定的规则为该函数创建一个`prototype`属性，这个属性指向函数的原型对象。
在默认情况下，所有原型对象都会自动获得一个`constructor`属性，这个属性包含一个指向`prototype`属性所在函数的指针。
也就是说：`Person.prototype.constructor`指向`Person`构造函数。

创建了自定义的构造函数之后，其原型对象默认只会取得`constructor`属性；至于其他方法，则都是从`Object`继承而来的。
当调用构造函数创建一个新实例后，该实例内部将包含一个指针（内部属性），指向构造函数的原型对象。ES5中称这个指针为`[[Prototype]]`，
在Firefox、Safari和Chrome在每个对象上都支持一个属性`__proto__`（目前已被废弃）；而在其他实现中，这个属性对脚本则是完全不可见的。
要注意，**这个链接存在于实例与构造函数的原型对象之间，而不是实例与构造函数之间**。

这三者关系的示意图如下：

![prototype graph](http://7xpv9g.com1.z0.glb.clouddn.com/imgprototype-graph-1.jpg)

上图展示了`Person`构造函数、`Person`的原型对象以及`Person`现有的两个实例之间的关系。

- `Person.prototype`指向了原型对象
- `Person.prototype.constructor`又指回了`Person`构造函数
- `Person`的每个实例`person1`和`person2`都包含一个内部属性（通常为`__proto__`），`person1.__proto__`和`person2.__proto__`指向了原型对象

### 查找对象属性

从上图我们发现，虽然`Person`的两个实例都不包含属性和方法，但我们却可以调用`person1.sayName()`。
这是通过查找对象属性的过程来实现的。

1. 搜索首先从**对象实例**本身开始（实例`person1`有`sayName`属性吗？——没有）
2. 如果没找到，则继续搜索指针指向的**原型对象**（`person1.__proto__`有`sayName`属性吗？——有）

这也是多个对象实例共享原型所保存的属性和方法的基本原理。

注意，如果我们在对象的实例中重写了某个原型中已存在的属性，则该实例属性会屏蔽原型中的那个属性。
此时，可以使用`delete`操作符删除实例上的属性。

### `Object.getPrototypeOf()`

根据ECMAScript标准，`someObject.[[Prototype]]` 符号是用于指派 `someObject` 的原型。
这个等同于 JavaScript 的 `__proto__` 属性（现已弃用，因为它不是标准）。
从ECMAScript 5开始, `[[Prototype]]` 可以用`Object.getPrototypeOf()`和`Object.setPrototypeOf()`访问器来访问。

其中`Object.getPrototypeOf()`在所有支持的实现中，这个方法返回`[[Prototype]]`的值。例如：

    person1.__proto__ === Object.getPrototypeOf(person1); // true
    Object.getPrototypeOf(person1) === Person.prototype; // true

也就是说，`Object.getPrototypeOf(p1)`返回的对象实际就是这个对象的原型。
这个方法的兼容性请参考[该链接](http://caniuse.com/#search=getPrototypeOf())。

### `Object.keys()`

要取得对象上所有可枚举的实例属性，可以使用ES5中的`Object.keys()`方法。例如：

    Object.keys(p1); // ["name", "age", "job"]

此外，如果你想要得到所有实例属性，无论它是否可枚举，都可以使用`Object.getOwnPropertyName()`方法。

### 更简单的原型语法

在上面的代码中，如果我们要添加原型属性和方法，就要重复的敲一遍`Person.prototype`。为了减少这个重复的过程，
更常见的做法是用一个包含所有属性和方法的对象字面量来重写整个原型对象。
[参考资料](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyNames)。

```javascript
function Person(name, age, job) {
  this.name = name;
  this.age = age;
  this.job = job;
}

// 重写整个原型对象
Person.prototype = {
  
  // 这里务必要重新将构造函数指回Person构造函数，否则会指向这个新创建的对象
  constructor: Person, // Attention!

  sayName: function () {
    console.log(this.name);
  }
};

var person1 = new Person('Weiwei', 27, 'Student');
var person2 = new Person('Lily', 25, 'Doctor');

console.log(person1.sayName === person2.sayName); // true

person1.sayName();  // Weiwei
person2.sayName();  // Lily
```

在上面的代码中特意包含了一个`constructor`属性，并将它的值设置为`Person`，从而确保了通过该属性能够访问到适当的值。
注意，以这种方式重设`constructor`属性会导致它的`[[Enumerable]]`特性设置为`true`。默认情况下，原生的`constructor`属性是不可枚举的。
你可以使用`Object.defineProperty()`：

```javascript
// 重设构造函数，只适用于ES5兼容的浏览器
Object.defineProperty(Person.prototype, "constructor", {
  enumerable: false,
  value: Person
});
```

### 组合使用构造函数模式和原型模式

创建自定义类型的最常见方式，就是组合使用构造函数模式与原型模式。构造函数模式用于定义实例属性，
而原型模式用于定义方法和共享的属性。结果，每个实例都会有自己的一份实例属性的副本，但同时又共享着对方的引用，
最大限度的节省了内存。

## 继承

大多的面向对象语言都支持两种继承方式：接口继承和实现继承。ECMAScript只支持实现继承，而且其实现继承主要依靠原型链来实现。

前面我们知道，JavaScript中实例的属性和行为是由构造函数和原型两部分共同组成的。如果我们想让`Child`继承`Father`，
那么我们就需要把`Father`构造函数和原型中属性和行为全部传给`Child`的构造函数和原型。

### 原型链继承

使用原型链作为实现继承的基本思想是：利用原型让一个引用类型继承另一个引用类型的属性和方法。首先我们先回顾一些基本概念：

- 每个构造函数都有一个原型对象（`prototype`）
- 原型对象包含一个指向构造函数的指针（`constructor`）
- 实例都包含一个指向原型对象的内部指针（`[[Prototype]]`）

如果我们让原型对象等于另一个类型的实现，结果会怎么样？显然，**此时的原型对象将包含一个指向另一个原型的指针**，
相应的，另一个原型中也包含着一个指向另一个构造函数的指针。假如另一个原型又是另一个类型的实例，那么上述关系依然成立，
如此层层递进，就构成了实例与原型的链条。
更详细的内容可以参考[这个链接](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)。
先看一个简单的例子，它演示了使用原型链实现继承的基本框架：

```javascript
function Father () {
  this.fatherValue = true;
}

Father.prototype.getFatherValue = function () {
  console.log(this.fatherValue);
};

function Child () {
  this.childValue = false;
}

// 实现继承：继承自Father
Child.prototype = new Father();

Child.prototype.getChildValue = function () {
  console.log(this.childValue);
};

var instance = new Child();
instance.getFatherValue(); // true
instance.getChildValue();  // false
```

在上面的代码中，原型链继承的核心语句是`Child.prototype = new Father()`，它实现了`Child`对`Father`的继承，
而继承是通过创建`Father`的实例，并将该实例赋给`Child.prototype`实现的。

实现的本质是重写原型对象，代之以一个新类型的实例。也就是说，原来存在于`Father`的实例中的所有属性和方法，
现在也存在于`Child.prototype`中了。

这个例子中的实例以及构造函数和原型之间的关系如下图所示：

![prototype chain inheritance](http://7xpv9g.com1.z0.glb.clouddn.com/imgprototype-chain-inheritance.jpg)

在上面的代码中，我们没有使用`Child`默认提供的原型，而是给它换了一个新原型；这个新原型就是`Father`的实例。
于是，新原型不仅具有了作为一个`Father`的实例所拥有的全部属性和方法。而且其内部还有一个指针`[[Prototype]]`，指向了`Father`的原型。

- `instance`指向`Child`的原型对象
- `Child`的原型对象指向`Father`的原型对象
- `getFatherValue()`方法仍然还在`Father.prototype`中
- 但是，`fatherValue`则位于`Child.prototype`中
- `instance.constructor`现在指向的是`Father`

因为`fatherValue`是一个实例属性，而`getFatherValue()`则是一个原型方法。既然`Child.prototype`现在是`Father`的实例，
那么`fatherValue`当然就位于该实例中。

通过实现原型链，本质上扩展了本章前面介绍的原型搜索机制。例如，`instance.getFatherValue()`会经历三个搜索步骤：

1. 搜索实例
2. 搜索`Child.prototype`
3. 搜索`Father.prototype`

### 别忘了`Object`

所有的函数都默认原型都是`Object`的实例，因此默认原型都会包含一个内部指针`[[Prototype]]`，指向`Object.prototype`。
这也正是所有自定义类型都会继承`toString()`、`valueOf()`等默认方法的根本原因。所以，
我们说上面例子展示的原型链中还应该包括另外一个继承层次。关于`Object`的更多内容，可以参考[这篇博客](http://luopq.com/2016/02/28/Object-in-Javascript/)。

也就是说，`Child`继承了`Father`，而`Father`继承了`Object`。当调用了`instance.toString()`时，
实际上调用的是保存在`Object.prototype`中的那个方法。

### 原型链继承的问题

首先是顺序，一定要先继承父类，然后为子类添加新方法。

其次，**使用原型链实现继承时，不能使用对象字面量创建原型方法**。因为这样做就会重写原型链，如下面的例子所示：

```javascript
function Father () {
  this.fatherValue = true;
}

Father.prototype.getFatherValue = function () {
  console.log(this.fatherValue);
};

function Child () {
  this.childValue = false;
}

// 继承了Father
// 此时的原型链为 Child -> Father -> Object
Child.prototype = new Father();

// 使用字面量添加新方法，会导致上一行代码无效
// 此时我们设想的原型链被切断，而是变成 Child -> Object
// 所以我们不推荐这么写了
Child.prototype = {
  getChildValue: function () {
    console.log(this.childValue);
  }
};

var instance = new Child();
instance.getChildValue();  // false
instance.getFatherValue(); // error!
```

在上面的代码中，我们连续两次修改了`Child.prototype`的值。由于现在的原型包含的是一个`Object`的实例，
而非`Father`的实例，因此我们设想中的原型链已经被切断——`Child`和`Father`之间已经没有关系了。

最后，在创建子类型的实例时，不能向超类型的构造函数中传递参数。实际上，应该说是没有办法在不影响所有对象实例的情况下，
给超类型的构造函数传递参数。因此，我们很少单独使用原型链。

### 借用构造函数继承

借用构造函数（constructor stealing）的基本思想如下：即在子类构造函数的内部调用超类型构造函数。

```javascript
function Father (name) {
  this.name = name;
  this.colors = ['red', 'blue', 'green'];
}

function Child (name) {
  // 继承了Father，同时传递了参数
  // 之所以这么做，是为了获得Father构造函数中的所有属性和方法
  // 之所以用call，是为了修正Father内部this的指向
  Father.call(this, name);
}

var instance1 = new Child("weiwei");
instance1.colors.push('black');
console.log(instance1.colors); // [ 'red', 'blue', 'green', 'black' ]
console.log(instance1.name); // weiwei

var instance2 = new Child("lily");
console.log(instance2.colors); // [ 'red', 'blue', 'green' ]
console.log(instance2.name); // lily
```

为了确保`Father`构造函数不会重写子类型的属性，可以在调用超类型构造函数后，再添加应该在子类型中定义的属性。

### 借用构造函数的缺点

同构造函数一样，无法实现方法的复用（所有的方法会被重复创建一份）。

### 组合使用原型链和借用构造函数

通常，我们会组合使用原型链继承和借用构造函数来实现继承。也就是说，使用原型链实现对原型属性和方法的继承，
而通过借用构造函数来实现对实例属性的继承。这样，既通过在原型上定义方法实现了函数复用，又能够保证每个实例都有它自己的属性。
我们改造最初的例子如下：

```javascript
// 父类构造函数
function Person (name, age, job) {
  this.name = name;
  this.age = age;
  this.job = job;
}

// 父类方法
Person.prototype.sayName = function () {
  console.log(this.name);
};

// --------------

// 子类构造函数
function Student (name, age, job, school) {
  // 继承父类的所有实例属性（获得父类构造函数中的属性）
  Person.call(this, name, age, job);
  this.school = school; // 添加新的子类属性
}

// 继承父类的原型方法（获得父类原型链上的属性和方法）
Student.prototype = new Person();

// 新增的子类方法
Student.prototype.saySchool = function () {
  console.log(this.school);
};

var person1 = new Person('Weiwei', 27, 'Student');
var student1 = new Student('Lily', 25, 'Doctor', "Southeast University");

console.log(person1.sayName === student1.sayName); // true

person1.sayName();  // Weiwei
student1.sayName(); // Lily
student1.saySchool(); // Southeast University
```

组合集成避免了原型链和借用构造函数的缺陷，融合了它们的优点，成为了JavaScript中最常用的继承模式。
而且，`instanceof`和`isPropertyOf()`也能够用于识别基于组合继承创建的对象。

### 组合继承的改进版：使用`Object.create()`

在上面，我们继承父类的原型方法使用的是`Student.prototype = new Person()`。
这样做[有很多的问题](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript)。
改进方法是使用ES5中新增的`Object.create()`。可以调用这个方法来创建一个新对象。新对象的原型就是调用`create()`方法传入的第一个参数：

```javascript
Student.prototype = Object.create(Person.prototype);

console.log(Student.prototype.constructor); // [Function: Person]

// 设置 constructor 属性指向 Student
Student.prototype.constructor = Student;
```

详细用法可以[参考文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/create)。
关于`Object.create()`的实现，我们可以参考一个简单的polyfill：

```javascript
function createObject(proto) {
    function F() { }
    F.prototype = proto;
    return new F();
}

// Usage:
Student.prototype = createObject(Person.prototype);
```

从本质上讲，`createObject()`对传入其中的对象执行了一次浅复制。

## ES6中的面向对象语法

ES6中引入了一套新的关键字用来实现[class](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes)。
但它并不是映入了一种新的面向对象继承模式。JavaScript仍然是基于原型的，这些新的关键字包括[class](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/class)、
[constructor](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes/constructor)、
[static](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes/static)、
[extends](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes/extends)、
和[super](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/super)。

`class`关键字不过是提供了一种在本文中所讨论的基于原型模式和构造器模式的面向对象的继承方式的**语法糖(syntactic sugar)**。

对前面的代码修改如下：

```javascript
'use strict';

class Person {

  constructor (name, age, job) {
    this.name = name;
    this.age = age;
    this.job = job;
  }

  sayName () {
    console.log(this.name);
  }

}

class Student extends Person {

  constructor (name, age, school) {
    super(name, age, 'Student');
    this.school = school;
  }

  saySchool () {
    console.log(this.school);
  }

}

var stu1 = new Student('weiwei', 20, 'Southeast University');
var stu2 = new Student('lily', 22, 'Nanjing University');

stu1.sayName(); // weiwei
stu1.saySchool(); // Southeast University

stu2.sayName(); // lily
stu2.saySchool(); // Nanjing University
```

### 类：`class`

是JavaScript中现有基于原型的继承的语法糖。ES6中的**类**并不是一种新的创建对象的方法，只不过是一种“特殊的函数”，
因此也包括[类表达式](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/class)和[类声明](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/class)，
但需要注意的是，与函数声明不同的是，类声明不会被[提升](http://www.sitepoint.com/back-to-basics-javascript-hoisting/)。
[参考链接](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/class)

### 类构造器：`constructor`

`constructor()`方法是有一种特殊的和`class`一起用于创建和初始化对象的方法。注意，在ES6类中只能有一个名称为`constructor`的方法，
否则会报错。在`constructor()`方法中可以调用`super`关键字调用父类构造器。如果你没有指定一个构造器方法，
类会自动使用一个默认的构造器。[参考链接](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/constructor)

### 类的静态方法：`static`

静态方法就是可以直接使用类名调用的方法，而无需对类进行实例化，当然实例化后的类也无法调用静态方法。
静态方法常被用于创建应用的工具函数。[参考链接](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static)

### 继承父类：`extends`

`extends`关键字可以用于继承父类。使用`extends`可以扩展一个内置的对象（如`Date`），也可以是自定义对象，或者是`null`。

### 关键字：`super`

`super`关键字用于调用父对象上的函数。
`super.prop`和`super[expr]`表达式在类和[对象字面量](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer)中的任何[方法定义](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions)中都有效。

```javascript
super([arguments]); // 调用父类构造器
super.functionOnParent([arguments]); // 调用父类中的方法
```

如果是在类的构造器中，需要在`this`关键字之前使用。[参考链接](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super)

## 小结

本文对JavaScript的面向对象机制进行了较为深入的解读，尤其是构造函数和原型链方式实现对象的创建、继承、以及实例化。
此外，本文还简要介绍了如在ES6中编写面向对象代码。

## References

1. [详解Javascript中的Object对象](http://luopq.com/2016/02/28/Object-in-Javascript)
1. [`new`操作符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/new)
1. [JavaScript面向对象简介](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript)
1. [Object.create()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
1. [继承与原型链](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
1. [Understanding the prototype property in JavaScript](http://bytearcher.com/articles/understanding-prototype-property-in-javascript/)
