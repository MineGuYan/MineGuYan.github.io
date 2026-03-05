# JavaScript 入门指南

![test](src/assets/images/posts/test.png)

JavaScript 是一种轻量级的编程语言，也是 Web 开发中不可或缺的一部分。本文将带你了解 JavaScript 的基础知识。

## 什么是 JavaScript？

JavaScript 是一种具有函数优先特性的轻量级、解释型或即时编译型的编程语言。虽然它是作为开发 Web 页面的脚本语言而出名，但是它也被用到了很多非浏览器环境中。

## 变量声明

在 JavaScript 中，有三种声明变量的方式：

### var

`var` 是传统的变量声明方式，具有函数作用域：

```javascript
var name = 'John';
var age = 25;
```

### let

`let` 是 ES6 引入的新语法，具有块级作用域：

```javascript
let city = 'Beijing';
let population = 21540000;
```

### const

`const` 用于声明常量，声明后不能重新赋值：

```javascript
const PI = 3.14159;
const MAX_SIZE = 100;
```

## 数据类型

JavaScript 有以下几种基本数据类型：

| 类型 | 描述 | 示例 |
|------|------|------|
| String | 字符串 | `'Hello'` 或 `"World"` |
| Number | 数字 | `42` 或 `3.14` |
| Boolean | 布尔值 | `true` 或 `false` |
| Undefined | 未定义 | `undefined` |
| Null | 空值 | `null` |
| Symbol | 符号 | `Symbol('id')` |
| BigInt | 大整数 | `9007199254740991n` |

## 函数

函数是 JavaScript 中的核心概念之一。

### 函数声明

```javascript
function greet(name) {
    return 'Hello, ' + name + '!';
}

console.log(greet('World')); // 输出: Hello, World!
```

### 箭头函数

ES6 引入了更简洁的箭头函数语法：

```javascript
const add = (a, b) => a + b;

const multiply = (a, b) => {
    return a * b;
};

console.log(add(2, 3));      // 输出: 5
console.log(multiply(2, 3)); // 输出: 6
```

## 条件语句

```javascript
const score = 85;

if (score >= 90) {
    console.log('优秀');
} else if (score >= 80) {
    console.log('良好');
} else if (score >= 60) {
    console.log('及格');
} else {
    console.log('不及格');
}
```

## 循环

### for 循环

```javascript
for (let i = 0; i < 5; i++) {
    console.log('计数: ' + i);
}
```

### while 循环

```javascript
let count = 0;
while (count < 5) {
    console.log('计数: ' + count);
    count++;
}
```

### for...of 循环

```javascript
const fruits = ['苹果', '香蕉', '橙子'];
for (const fruit of fruits) {
    console.log(fruit);
}
```

## 数组操作

JavaScript 提供了丰富的数组方法：

```javascript
const numbers = [1, 2, 3, 4, 5];

// map - 映射
const doubled = numbers.map(n => n * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// filter - 过滤
const evens = numbers.filter(n => n % 2 === 0);
console.log(evens); // [2, 4]

// reduce - 归约
const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log(sum); // 15

// find - 查找
const found = numbers.find(n => n > 3);
console.log(found); // 4
```

## 对象

对象是 JavaScript 中最常用的数据结构之一：

```javascript
const person = {
    name: '张三',
    age: 28,
    city: '北京',
    greet() {
        console.log(`你好，我是${this.name}`);
    }
};

// 访问属性
console.log(person.name);     // 张三
console.log(person['age']);   // 28

// 调用方法
person.greet();               // 你好，我是张三
```

## 异步编程

### Promise

```javascript
const fetchData = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('数据获取成功');
        }, 1000);
    });
};

fetchData()
    .then(data => console.log(data))
    .catch(error => console.error(error));
```

### async/await

```javascript
async function getData() {
    try {
        const response = await fetch('https://api.example.com/data');
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('获取数据失败:', error);
    }
}

getData();
```

## 总结

JavaScript 是一门功能强大且灵活的编程语言。通过本文，你已经了解了：

- 变量声明（var、let、const）
- 基本数据类型
- 函数的定义和使用
- 条件语句和循环
- 数组和对象的操作
- 异步编程基础

继续学习和实践，你会发现 JavaScript 的更多精彩之处！

---

*参考资料：[MDN Web Docs](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)*
