# Vue 3 Composition API 实战教程

Vue 3 引入的 Composition API 是一种全新的组件逻辑组织方式。相比 Options API，它提供了更好的逻辑复用和代码组织能力。本文通过实例讲解如何使用 Composition API 开发复杂应用。

## 什么是 Composition API？

Composition API 是一组函数，允许你在 `setup()` 函数中组织组件逻辑。主要特点包括：

- 更好的逻辑复用
- 更灵活的代码组织
- 更好的 TypeScript 支持
- 更小的打包体积

## 基础概念

### setup 函数

`setup` 是 Composition API 的入口点：

```javascript
import { ref, reactive, onMounted } from 'vue';

export default {
    setup() {
        // 响应式数据
        const count = ref(0);
        
        // 方法
        const increment = () => {
            count.value++;
        };
        
        // 生命周期
        onMounted(() => {
            console.log('组件已挂载');
        });
        
        // 返回模板需要使用的数据和方法
        return {
            count,
            increment
        };
    }
};
```

### `<script setup>` 语法糖

Vue 3.2 引入了更简洁的 `<script setup>` 语法：

```vue
<script setup>
import { ref, onMounted } from 'vue';

const count = ref(0);

const increment = () => {
    count.value++;
};

onMounted(() => {
    console.log('组件已挂载');
});
</script>

<template>
    <button @click="increment">
        Count: {{ count }}
    </button>
</template>
```

## 响应式系统

### ref

`ref` 用于创建基本类型的响应式数据：

```javascript
import { ref } from 'vue';

const count = ref(0);
const message = ref('Hello');

// 访问和修改需要使用 .value
console.log(count.value); // 0
count.value = 1;
```

### reactive

`reactive` 用于创建对象类型的响应式数据：

```javascript
import { reactive } from 'vue';

const state = reactive({
    user: {
        name: 'John',
        age: 25
    },
    settings: {
        theme: 'dark'
    }
});

// 直接访问和修改
console.log(state.user.name); // John
state.user.age = 26;
```

### ref vs reactive

| 特性 | ref | reactive |
|------|-----|----------|
| 适用类型 | 基本类型 + 对象 | 仅对象 |
| 访问方式 | 需要 .value | 直接访问 |
| 解构 | 保持响应性 | 失去响应性 |
| 替换 | 可以整体替换 | 不能整体替换 |

### computed

计算属性：

```javascript
import { ref, computed } from 'vue';

const firstName = ref('John');
const lastName = ref('Doe');

const fullName = computed(() => {
    return `${firstName.value} ${lastName.value}`;
});

// 只读计算属性
console.log(fullName.value); // John Doe
```

### watch 和 watchEffect

侦听器：

```javascript
import { ref, watch, watchEffect } from 'vue';

const count = ref(0);

// watch：明确指定侦听源
watch(count, (newValue, oldValue) => {
    console.log(`count 从 ${oldValue} 变为 ${newValue}`);
});

// watchEffect：自动追踪依赖
watchEffect(() => {
    console.log(`count 的值是 ${count.value}`);
});
```

## 生命周期钩子

Composition API 中的生命周期钩子：

| Options API | Composition API |
|-------------|-----------------|
| beforeCreate | setup() |
| created | setup() |
| beforeMount | onBeforeMount |
| mounted | onMounted |
| beforeUpdate | onBeforeUpdate |
| updated | onUpdated |
| beforeUnmount | onBeforeUnmount |
| unmounted | onUnmounted |

示例：

```javascript
import { 
    onBeforeMount, 
    onMounted, 
    onBeforeUpdate, 
    onUpdated,
    onBeforeUnmount,
    onUnmounted 
} from 'vue';

export default {
    setup() {
        onBeforeMount(() => {
            console.log('组件即将挂载');
        });
        
        onMounted(() => {
            console.log('组件已挂载');
        });
        
        onBeforeUpdate(() => {
            console.log('组件即将更新');
        });
        
        onUpdated(() => {
            console.log('组件已更新');
        });
        
        onBeforeUnmount(() => {
            console.log('组件即将卸载');
        });
        
        onUnmounted(() => {
            console.log('组件已卸载');
        });
    }
};
```

## 组合式函数（Composables）

组合式函数是 Composition API 的核心优势，用于逻辑复用。

### 创建组合式函数

```javascript
// useCounter.js
import { ref, computed } from 'vue';

export function useCounter(initialValue = 0) {
    const count = ref(initialValue);
    
    const doubleCount = computed(() => count.value * 2);
    
    const increment = () => {
        count.value++;
    };
    
    const decrement = () => {
        count.value--;
    };
    
    const reset = () => {
        count.value = initialValue;
    };
    
    return {
        count,
        doubleCount,
        increment,
        decrement,
        reset
    };
}
```

### 使用组合式函数

```vue
<script setup>
import { useCounter } from './useCounter';

const { count, doubleCount, increment, decrement, reset } = useCounter(10);
</script>

<template>
    <div>
        <p>Count: {{ count }}</p>
        <p>Double: {{ doubleCount }}</p>
        <button @click="increment">+1</button>
        <button @click="decrement">-1</button>
        <button @click="reset">Reset</button>
    </div>
</template>
```

### 实用组合式函数示例

#### useFetch

```javascript
import { ref, watchEffect } from 'vue';

export function useFetch(url) {
    const data = ref(null);
    const error = ref(null);
    const loading = ref(false);
    
    const fetchData = async () => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await fetch(url.value || url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            data.value = await response.json();
        } catch (e) {
            error.value = e;
        } finally {
            loading.value = false;
        }
    };
    
    if (typeof url === 'object') {
        watchEffect(fetchData);
    } else {
        fetchData();
    }
    
    return { data, error, loading, refetch: fetchData };
}
```

#### useLocalStorage

```javascript
import { ref, watch } from 'vue';

export function useLocalStorage(key, defaultValue) {
    const stored = localStorage.getItem(key);
    const data = ref(stored ? JSON.parse(stored) : defaultValue);
    
    watch(data, (newValue) => {
        localStorage.setItem(key, JSON.stringify(newValue));
    }, { deep: true });
    
    return data;
}
```

## 依赖注入

### provide 和 inject

```javascript
// 父组件
import { provide, ref } from 'vue';

const theme = ref('dark');
provide('theme', theme);

// 子组件
import { inject } from 'vue';

const theme = inject('theme');
```

### 提供响应式数据

```javascript
// 提供者
import { provide, ref, readonly } from 'vue';

const count = ref(0);
const updateCount = (value) => {
    count.value = value;
};

provide('count', readonly(count));
provide('updateCount', updateCount);

// 消费者
import { inject } from 'vue';

const count = inject('count');
const updateCount = inject('updateCount');
```

## 模板引用

```vue
<script setup>
import { ref, onMounted } from 'vue';

const inputRef = ref(null);

onMounted(() => {
    inputRef.value.focus();
});
</script>

<template>
    <input ref="inputRef" type="text">
</template>
```

## 完整示例：Todo 应用

```vue
<script setup>
import { ref, computed, watch } from 'vue';

// 响应式数据
const newTodo = ref('');
const todos = ref([]);
const filter = ref('all');

// 从本地存储加载
const savedTodos = localStorage.getItem('todos');
if (savedTodos) {
    todos.value = JSON.parse(savedTodos);
}

// 计算属性
const filteredTodos = computed(() => {
    switch (filter.value) {
        case 'active':
            return todos.value.filter(t => !t.completed);
        case 'completed':
            return todos.value.filter(t => t.completed);
        default:
            return todos.value;
    }
});

const remaining = computed(() => {
    return todos.value.filter(t => !t.completed).length;
});

// 方法
const addTodo = () => {
    if (newTodo.value.trim()) {
        todos.value.push({
            id: Date.now(),
            text: newTodo.value.trim(),
            completed: false
        });
        newTodo.value = '';
    }
};

const removeTodo = (id) => {
    todos.value = todos.value.filter(t => t.id !== id);
};

const toggleTodo = (todo) => {
    todo.completed = !todo.completed;
};

const clearCompleted = () => {
    todos.value = todos.value.filter(t => !t.completed);
};

// 保存到本地存储
watch(todos, (newValue) => {
    localStorage.setItem('todos', JSON.stringify(newValue));
}, { deep: true });
</script>

<template>
    <div class="todo-app">
        <h1>Todo List</h1>
        
        <form @submit.prevent="addTodo">
            <input 
                v-model="newTodo" 
                placeholder="添加新任务"
            >
            <button type="submit">添加</button>
        </form>
        
        <div class="filters">
            <button 
                @click="filter = 'all'"
                :class="{ active: filter === 'all' }"
            >全部</button>
            <button 
                @click="filter = 'active'"
                :class="{ active: filter === 'active' }"
            >进行中</button>
            <button 
                @click="filter = 'completed'"
                :class="{ active: filter === 'completed' }"
            >已完成</button>
        </div>
        
        <ul class="todo-list">
            <li 
                v-for="todo in filteredTodos" 
                :key="todo.id"
                :class="{ completed: todo.completed }"
            >
                <input 
                    type="checkbox" 
                    :checked="todo.completed"
                    @change="toggleTodo(todo)"
                >
                <span>{{ todo.text }}</span>
                <button @click="removeTodo(todo.id)">删除</button>
            </li>
        </ul>
        
        <div class="footer">
            <span>{{ remaining }} 项待完成</span>
            <button 
                v-if="todos.some(t => t.completed)"
                @click="clearCompleted"
            >清除已完成</button>
        </div>
    </div>
</template>

<style scoped>
.todo-app {
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
}

.completed span {
    text-decoration: line-through;
    color: #999;
}

.filters button.active {
    background-color: #4a90d9;
    color: white;
}
</style>
```

## 总结

Composition API 的核心优势：

1. **更好的逻辑复用**：通过组合式函数实现
2. **更灵活的代码组织**：按功能而非选项组织代码
3. **更好的类型推断**：TypeScript 支持更完善
4. **更小的打包体积**：Tree-shaking 更有效

掌握 Composition API 是 Vue 3 开发的关键，建议多实践、多总结。

---

*参考资料：[Vue 3 官方文档](https://vuejs.org/guide/extras/composition-api-faq.html)*
