# 《设计模式》读书笔记：创建型模式

设计模式是软件开发中的重要知识，它们是前人在实践中总结出的可复用的解决方案。本文总结《设计模式》一书中的创建型模式，包括单例、工厂、建造者等模式。

## 什么是创建型模式？

创建型模式关注对象的创建过程，它们帮助我们将对象的创建和使用分离，使系统更加灵活。主要包括以下几种模式：

- 单例模式（Singleton）
- 工厂方法模式（Factory Method）
- 抽象工厂模式（Abstract Factory）
- 建造者模式（Builder）
- 原型模式（Prototype）

## 单例模式

### 定义

确保一个类只有一个实例，并提供一个全局访问点。

### 实现

```javascript
class Singleton {
    constructor() {
        if (Singleton.instance) {
            return Singleton.instance;
        }
        Singleton.instance = this;
    }
    
    static getInstance() {
        if (!Singleton.instance) {
            Singleton.instance = new Singleton();
        }
        return Singleton.instance;
    }
}

// 使用
const instance1 = new Singleton();
const instance2 = Singleton.getInstance();
console.log(instance1 === instance2); // true
```

### 应用场景

- 配置管理器
- 日志记录器
- 数据库连接池
- 缓存系统

### 注意事项

- 多线程环境下需要考虑线程安全
- 可能导致全局状态污染
- 测试时可能造成问题

## 工厂方法模式

### 定义

定义一个创建对象的接口，让子类决定实例化哪一个类。

### 实现

```javascript
// 产品接口
class Product {
    operation() {
        throw new Error('子类必须实现此方法');
    }
}

// 具体产品A
class ConcreteProductA extends Product {
    operation() {
        return '产品A的操作';
    }
}

// 具体产品B
class ConcreteProductB extends Product {
    operation() {
        return '产品B的操作';
    }
}

// 工厂接口
class Factory {
    createProduct() {
        throw new Error('子类必须实现此方法');
    }
}

// 具体工厂A
class ConcreteFactoryA extends Factory {
    createProduct() {
        return new ConcreteProductA();
    }
}

// 具体工厂B
class ConcreteFactoryB extends Factory {
    createProduct() {
        return new ConcreteProductB();
    }
}

// 使用
const factoryA = new ConcreteFactoryA();
const productA = factoryA.createProduct();
console.log(productA.operation()); // 产品A的操作
```

### 应用场景

- 日志记录器（文件日志、数据库日志）
- 数据库连接（MySQL、PostgreSQL）
- 支付方式（支付宝、微信）

## 抽象工厂模式

### 定义

提供一个创建一系列相关或相互依赖对象的接口，而无需指定它们具体的类。

### 实现

```javascript
// 抽象产品
class Button {
    render() {
        throw new Error('子类必须实现此方法');
    }
}

class Checkbox {
    render() {
        throw new Error('子类必须实现此方法');
    }
}

// 具体产品 - Windows风格
class WindowsButton extends Button {
    render() {
        return 'Windows按钮';
    }
}

class WindowsCheckbox extends Checkbox {
    render() {
        return 'Windows复选框';
    }
}

// 具体产品 - Mac风格
class MacButton extends Button {
    render() {
        return 'Mac按钮';
    }
}

class MacCheckbox extends Checkbox {
    render() {
        return 'Mac复选框';
    }
}

// 抽象工厂
class GUIFactory {
    createButton() {
        throw new Error('子类必须实现此方法');
    }
    
    createCheckbox() {
        throw new Error('子类必须实现此方法');
    }
}

// 具体工厂
class WindowsFactory extends GUIFactory {
    createButton() {
        return new WindowsButton();
    }
    
    createCheckbox() {
        return new WindowsCheckbox();
    }
}

class MacFactory extends GUIFactory {
    createButton() {
        return new MacButton();
    }
    
    createCheckbox() {
        return new MacCheckbox();
    }
}

// 使用
function createUI(factory) {
    const button = factory.createButton();
    const checkbox = factory.createCheckbox();
    
    console.log(button.render());
    console.log(checkbox.render());
}

const factory = new WindowsFactory();
createUI(factory);
```

### 应用场景

- 跨平台UI组件
- 数据库访问层
- 主题切换

## 建造者模式

### 定义

将一个复杂对象的构建与它的表示分离，使得同样的构建过程可以创建不同的表示。

### 实现

```javascript
// 产品
class Computer {
    constructor() {
        this.parts = [];
    }
    
    addPart(part) {
        this.parts.push(part);
    }
    
    show() {
        console.log('电脑配置：' + this.parts.join(', '));
    }
}

// 建造者
class ComputerBuilder {
    constructor() {
        this.computer = new Computer();
    }
    
    addCPU(cpu) {
        this.computer.addPart(`CPU: ${cpu}`);
        return this;
    }
    
    addMemory(memory) {
        this.computer.addPart(`内存: ${memory}`);
        return this;
    }
    
    addStorage(storage) {
        this.computer.addPart(`存储: ${storage}`);
        return this;
    }
    
    addGPU(gpu) {
        this.computer.addPart(`显卡: ${gpu}`);
        return this;
    }
    
    build() {
        const result = this.computer;
        this.computer = new Computer();
        return result;
    }
}

// 使用
const builder = new ComputerBuilder();

const computer1 = builder
    .addCPU('Intel i7')
    .addMemory('16GB')
    .addStorage('512GB SSD')
    .build();

computer1.show();
// 电脑配置：CPU: Intel i7, 内存: 16GB, 存储: 512GB SSD
```

### 应用场景

- 构建复杂对象
- 配置对象
- SQL查询构建器

## 原型模式

### 定义

通过复制现有的实例来创建新的实例，而不是通过new关键字。

### 实现

```javascript
class Prototype {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    
    clone() {
        return new Prototype(this.name, this.age);
    }
    
    deepClone() {
        return JSON.parse(JSON.stringify(this));
    }
}

// 使用
const prototype = new Prototype('John', 25);
const clone1 = prototype.clone();
const clone2 = prototype.deepClone();

console.log(clone1.name); // John
console.log(clone2.age);  // 25
```

### JavaScript 中的原型

JavaScript 本身就是基于原型的语言：

```javascript
// 使用 Object.create
const person = {
    name: 'John',
    greet() {
        console.log(`Hello, I'm ${this.name}`);
    }
};

const john = Object.create(person);
john.greet(); // Hello, I'm John

// 使用展开运算符
const johnCopy = { ...person };
```

### 应用场景

- 创建成本较高的对象
- 动态加载对象
- 保护性拷贝

## 模式对比

| 模式 | 目的 | 适用场景 |
|------|------|----------|
| 单例 | 保证唯一实例 | 配置、日志、连接池 |
| 工厂方法 | 延迟创建到子类 | 多种产品类型 |
| 抽象工厂 | 创建产品家族 | 跨平台组件 |
| 建造者 | 分步骤构建复杂对象 | 复杂配置对象 |
| 原型 | 克隆现有对象 | 创建成本高 |

## 最佳实践

### 选择合适的模式

1. **简单场景不需要模式**：不要过度设计
2. **考虑扩展性**：未来可能的变化
3. **权衡复杂度**：模式带来的复杂度是否值得

### 常见问题

1. **过度使用单例**：可能导致全局状态混乱
2. **工厂过于复杂**：简单场景用简单工厂即可
3. **建造者滥用**：简单对象不需要建造者

## 总结

创建型模式帮助我们更好地管理对象的创建：

1. **单例模式**：确保唯一实例
2. **工厂方法**：灵活创建对象
3. **抽象工厂**：创建产品家族
4. **建造者模式**：分步构建复杂对象
5. **原型模式**：克隆创建对象

掌握这些模式，可以让我们在面对不同的创建需求时，选择最合适的解决方案。

---

*参考资料：[《设计模式：可复用面向对象软件的基础》](https://book.douban.com/subject/1052241/)*
