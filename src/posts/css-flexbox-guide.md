# CSS Flexbox 布局完全指南

Flexbox（弹性盒子）是 CSS3 引入的一种新的布局模式，它提供了更有效的方式来排列、对齐和分配容器中项目的空间。

## 什么是 Flexbox？

Flexbox 是一种一维布局模型，它给 flexbox 的子元素之间提供了强大的空间分布和对齐能力。使用 Flexbox，我们可以轻松实现各种复杂的布局效果。

## 基本概念

### Flex 容器和 Flex 项目

```css
.container {
    display: flex;
}
```

当一个元素设置了 `display: flex`，它就变成了一个 **flex 容器**，它的所有直接子元素就变成了 **flex 项目**。

### 主轴和交叉轴

- **主轴（Main Axis）**：flex 项目沿着它排列的轴
- **交叉轴（Cross Axis）**：垂直于主轴的轴

## 容器属性

### flex-direction

定义主轴的方向：

```css
.container {
    flex-direction: row;            /* 默认值，水平方向，从左到右 */
    flex-direction: row-reverse;    /* 水平方向，从右到左 */
    flex-direction: column;         /* 垂直方向，从上到下 */
    flex-direction: column-reverse; /* 垂直方向，从下到上 */
}
```

### flex-wrap

控制项目是否换行：

```css
.container {
    flex-wrap: nowrap;    /* 默认值，不换行 */
    flex-wrap: wrap;      /* 换行，第一行在上方 */
    flex-wrap: wrap-reverse; /* 换行，第一行在下方 */
}
```

### justify-content

定义项目在主轴上的对齐方式：

```css
.container {
    justify-content: flex-start;    /* 默认值，左对齐 */
    justify-content: flex-end;      /* 右对齐 */
    justify-content: center;        /* 居中 */
    justify-content: space-between; /* 两端对齐，项目间隔相等 */
    justify-content: space-around;  /* 项目两侧间隔相等 */
    justify-content: space-evenly;  /* 项目间隔完全相等 */
}
```

### align-items

定义项目在交叉轴上的对齐方式：

```css
.container {
    align-items: stretch;     /* 默认值，拉伸填满 */
    align-items: flex-start;  /* 交叉轴起点对齐 */
    align-items: flex-end;    /* 交叉轴终点对齐 */
    align-items: center;      /* 交叉轴居中 */
    align-items: baseline;    /* 基线对齐 */
}
```

### align-content

定义多根轴线的对齐方式（当有多行时）：

```css
.container {
    align-content: flex-start;
    align-content: flex-end;
    align-content: center;
    align-content: space-between;
    align-content: space-around;
    align-content: stretch;
}
```

### 简写属性 flex-flow

`flex-flow` 是 `flex-direction` 和 `flex-wrap` 的简写：

```css
.container {
    flex-flow: row wrap;
}
```

## 项目属性

### flex-grow

定义项目的放大比例：

```css
.item {
    flex-grow: 0; /* 默认值，不放大 */
    flex-grow: 1; /* 放大，占据剩余空间 */
}
```

### flex-shrink

定义项目的缩小比例：

```css
.item {
    flex-shrink: 1; /* 默认值，空间不足时缩小 */
    flex-shrink: 0; /* 不缩小 */
}
```

### flex-basis

定义项目在分配多余空间之前的默认大小：

```css
.item {
    flex-basis: auto;   /* 默认值 */
    flex-basis: 200px;  /* 固定宽度 */
    flex-basis: 25%;    /* 百分比 */
}
```

### 简写属性 flex

`flex` 是 `flex-grow`、`flex-shrink` 和 `flex-basis` 的简写：

```css
.item {
    flex: 0 1 auto;    /* 默认值 */
    flex: 1;           /* 等同于 flex: 1 1 0% */
    flex: auto;        /* 等同于 flex: 1 1 auto */
    flex: none;        /* 等同于 flex: 0 0 auto */
}
```

### align-self

允许单个项目有不同于其他项目的对齐方式：

```css
.item {
    align-self: auto;       /* 继承父元素 */
    align-self: flex-start;
    align-self: flex-end;
    align-self: center;
    align-self: baseline;
    align-self: stretch;
}
```

### order

定义项目的排列顺序：

```css
.item {
    order: 0;  /* 默认值 */
    order: 1;  /* 排在后面 */
    order: -1; /* 排在前面 */
}
```

## 实用示例

### 水平垂直居中

```css
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}
```

### 等宽列布局

```css
.container {
    display: flex;
}

.item {
    flex: 1;
}
```

### 圣杯布局

```css
.layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.header, .footer {
    flex: 0 0 auto;
}

.main {
    display: flex;
    flex: 1;
}

.content {
    flex: 1;
}

.sidebar {
    flex: 0 0 200px;
}
```

### 响应式导航

```css
.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-menu {
    display: flex;
    gap: 1rem;
}

@media (max-width: 768px) {
    .nav {
        flex-direction: column;
    }
    
    .nav-menu {
        flex-direction: column;
        width: 100%;
    }
}
```

## 常见问题

### 为什么项目没有换行？

确保设置了 `flex-wrap: wrap`，并且容器宽度不足以容纳所有项目。

### 如何让项目等宽？

使用 `flex: 1` 或者设置相同的 `flex-basis` 值。

### 如何实现固定宽度侧边栏？

```css
.sidebar {
    flex: 0 0 250px; /* 不放大、不缩小、固定250px */
}

.content {
    flex: 1; /* 占据剩余空间 */
}
```

## 浏览器兼容性

Flexbox 在现代浏览器中有很好的支持。对于需要支持旧版浏览器的情况，可以使用以下方式：

```css
.container {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
}
```

## 总结

Flexbox 是一个强大的布局工具，掌握它可以让你轻松实现各种复杂的布局需求。关键点包括：

1. 理解主轴和交叉轴的概念
2. 掌握容器属性和项目属性
3. 多实践，多尝试不同的组合

---

*参考资料：[CSS-Tricks Flexbox 指南](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)*
