# 《代码整洁之道》读书笔记

《代码整洁之道》（Clean Code）是 Robert C. Martin（Uncle Bob）的经典著作，是每个程序员都应该阅读的书籍之一。本文分享我的阅读心得和关键收获。

## 为什么需要整洁的代码？

> "代码是给人读的，只是顺便让机器执行。" —— Donald Knuth

代码质量直接影响软件的可维护性和开发效率。糟糕的代码会带来以下问题：

- 难以理解和修改
- 容易引入 Bug
- 开发效率低下
- 技术债务累积

## 有意义的命名

命名是编程中最基础也是最重要的技能之一。

### 原则

1. **名副其实**：变量名应该说明它为什么存在、做什么事、怎么用

```java
// 不好的命名
int d; // elapsed time in days

// 好的命名
int elapsedTimeInDays;
int daysSinceCreation;
int daysSinceModification;
int fileAgeInDays;
```

2. **避免误导**：不要使用与本意相悖的词

```java
// 不好的命名
int[] accountList; // 实际上不是 List

// 好的命名
int[] accounts;
int[] accountGroup;
```

3. **做有意义的区分**：不要添加无意义的数字或废话

```java
// 不好的命名
void copyChars(char a1[], char a2[])

// 好的命名
void copyChars(char source[], char destination[])
```

4. **使用可搜索的名字**：长名字胜过短注释

```java
// 不好的命名
for (int j=0; j<34; j++) {
    s += (t[j]*4)/5;
}

// 好的命名
int realDaysPerIdealDay = 4;
const int WORK_DAYS_PER_WEEK = 5;
int sum = 0;
for (int j=0; j < NUMBER_OF_TASKS; j++) {
    int realTaskDays = taskEstimate[j] * realDaysPerIdealDay;
    int realTaskWeeks = (realTaskDays / WORK_DAYS_PER_WEEK);
    sum += realTaskWeeks;
}
```

## 函数

函数是程序的基本组成单元，好的函数应该遵循以下原则：

### 短小精悍

函数应该短小，第一规则是要短小，第二规则是还要更短小。

```java
// 不好的做法：一个函数做太多事
public void process() {
    // 验证输入
    // 处理数据
    // 保存结果
    // 发送通知
    // 记录日志
}

// 好的做法：每个函数只做一件事
public void process() {
    validateInput();
    processData();
    saveResult();
    sendNotification();
    logResult();
}
```

### 只做一件事

函数应该做一件事，做好这件事，只做这一件事。

### 使用描述性的名称

```java
// 不好的命名
void process();

// 好的命名
void saveUserToDatabase();
```

### 函数参数

最理想的参数数量是零，其次是一，再次是二，应尽量避免三参数。

```java
// 不好的做法
void createUser(String name, String email, String phone, 
                String address, int age);

// 好的做法：使用对象
void createUser(User user);
```

## 注释

> "注释的恰当用法是弥补我们在用代码表达意图时遭遇的失败"

### 好注释

1. **法律信息**
2. **提供信息的注释**
3. **对意图的解释**
4. **阐释**
5. **警示**
6. **TODO 注释**

### 坏注释

1. **喃喃自语**
2. **多余的注释**
3. **误导性注释**
4. **循规式注释**
5. **日志式注释**
6. **废话注释**

```java
// 不好的注释
// 创建用户
public User createUser() {
    // ...
}

// 好的代码不需要注释
public User createNewUser() {
    // 代码本身已经足够清晰
}
```

## 格式

代码格式很重要，它影响代码的可读性。

### 垂直格式

- 源文件顶部应该给出高层次概念和算法
- 细节应该在往下逐渐展开
- 相关的代码应该放在一起

### 水平格式

- 一行代码应该尽量短（最好不超过 80-120 字符）
- 使用空格强调优先级
- 使用缩进展示层次结构

## 错误处理

### 使用异常而非返回码

```java
// 不好的做法
public int deleteUser(int userId) {
    if (userExists(userId)) {
        if (hasPermission(userId)) {
            return deleteUserFromDb(userId);
        } else {
            return -2; // 无权限
        }
    } else {
        return -1; // 用户不存在
    }
}

// 好的做法
public void deleteUser(int userId) {
    if (!userExists(userId)) {
        throw new UserNotFoundException(userId);
    }
    if (!hasPermission(userId)) {
        throw new PermissionDeniedException();
    }
    deleteUserFromDb(userId);
}
```

### 别返回 Null 值

返回 Null 值会增加调用方的负担，需要不断检查 Null。

```java
// 不好的做法
public List<User> getUsers() {
    if (noUsers) {
        return null;
    }
    // ...
}

// 好的做法
public List<User> getUsers() {
    if (noUsers) {
        return Collections.emptyList();
    }
    // ...
}
```

## 类

### 类的组织

类应该按照以下顺序组织：

1. 公有静态常量
2. 私有静态变量
3. 私有实例变量
4. 公有方法
5. 私有方法

### 类应该短小

对于函数，我们通过代码行数衡量大小；对于类，我们通过职责来衡量。

### 单一职责原则（SRP）

类或模块应有且只有一条加以修改的理由。

```java
// 不好的做法：一个类承担多个职责
public class User {
    // 用户数据
    // 数据库操作
    // 邮件发送
    // 报告生成
}

// 好的做法：每个类只有一个职责
public class User {
    // 用户数据
}

public class UserRepository {
    // 数据库操作
}

public class UserMailer {
    // 邮件发送
}
```

## 系统

### 依赖注入

使用依赖注入可以实现控制反转，提高系统的灵活性：

```java
// 不好的做法
public class UserService {
    private Database database = new MySQLDatabase();
}

// 好的做法
public class UserService {
    private Database database;
    
    public UserService(Database database) {
        this.database = database;
    }
}
```

## 总结

《代码整洁之道》教会我们：

1. **代码是写给人看的**：始终考虑代码的可读性
2. **命名很重要**：花时间想出好的名字
3. **函数要短小**：每个函数只做一件事
4. **注释不能弥补糟糕的代码**：用代码表达意图
5. **保持简单**：遵循 SOLID 原则

> "整洁的代码是简单直接的。整洁的代码如同优美的散文。整洁的代码从不隐藏设计者的意图，充满了干净利落的抽象和直截了当的控制语句。"

这本书值得反复阅读，每次都会有新的收获。希望这篇笔记能帮助你更好地理解书中的精华内容。

---

*推荐阅读：[《代码整洁之道》](https://book.douban.com/subject/4199741/)*
