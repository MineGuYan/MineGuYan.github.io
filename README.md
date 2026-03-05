# 个人博客

一个纯静态的个人博客网站，无需后端服务，支持Markdown文章渲染、代码高亮、主题切换等功能。

## 功能特性

- Markdown文章渲染
- 代码语法高亮（支持20+编程语言）
- 文章分类与标签系统
- 文章合集功能
- 深色/浅色主题切换
- 响应式设计，适配移动端
- SPA单页应用体验
- SEO友好

## 项目结构

```
├── index.html              # 主页面
├── server.js               # 本地开发服务器
├── package.json            # 项目配置
├── src/
│   ├── assets/             # 静态资源
│   │   ├── icons/          # 图标文件
│   │   └── images/         # 图片资源
│   ├── data/               # 数据文件
│   │   ├── config/         # 配置文件
│   │   │   ├── author.json     # 作者信息
│   │   │   ├── categories.json # 分类配置
│   │   │   ├── pagination.json # 分页配置
│   │   │   ├── settings.json   # 系统设置
│   │   │   └── site.json       # 网站配置
│   │   ├── articles.json   # 文章元数据
│   │   └── collections.json # 合集数据
│   ├── js/                 # JavaScript模块
│   │   ├── app.js          # 主应用逻辑
│   │   ├── config.js       # 配置加载
│   │   ├── markdown.js     # Markdown解析器
│   │   ├── router.js       # 路由系统
│   │   └── utils.js        # 工具函数
│   ├── posts/              # Markdown文章
│   └── styles/             # 样式文件
│       └── main.css        # 主样式
└── README.md
```

## 快速开始

### 本地开发

1. 克隆项目
```bash
git clone https://github.com/yourusername/blog.git
cd blog
```

2. 启动本地服务器
```bash
node server.js
```

3. 访问 `http://localhost:3000`

### 部署

本项目为纯静态网站，可部署到任何静态文件服务器：

- GitHub Pages
- Vercel
- Netlify
- 传统Web服务器（Nginx、Apache等）

## 配置说明

### 网站配置 (`src/data/config/site.json`)

```json
{
    "title": "我的博客",
    "description": "记录技术、生活与思考",
    "footer": {
        "copyright": "Your Name. All rights reserved.",
        "poweredBy": "Powered by 纯静态HTML"
    }
}
```

### 作者信息 (`src/data/config/author.json`)

```json
{
    "name": "你的名字",
    "avatar": "src/assets/images/Avatar.png",
    "bio": "个人简介",
    "social": {
        "github": "github.com/yourusername",
        "email": "your@email.com"
    },
    "skills": {
        "frontend": ["HTML5", "CSS3", "JavaScript"],
        "backend": ["Node.js", "Python"]
    },
    "skillLabels": {
        "frontend": "前端",
        "backend": "后端"
    },
    "socialLabels": {
        "github": "GitHub",
        "email": "邮箱"
    }
}
```

### 分类配置 (`src/data/config/categories.json`)

```json
[
    {
        "id": "tech",
        "name": "技术",
        "description": "技术相关文章",
        "icon": "💻"
    }
]
```

## 文章管理

### 添加新文章

1. 在 `src/posts/` 目录下创建Markdown文件

2. 在 `src/data/articles.json` 中添加文章元数据：

```json
{
    "id": "article-id",
    "title": "文章标题",
    "date": "2024-01-01",
    "category": "tech",
    "tags": ["标签1", "标签2"],
    "excerpt": "文章摘要",
    "file": "article-id.md",
    "collections": ["collection-id"]
}
```

### 文章合集

在 `src/data/collections.json` 中配置：

```json
[
    {
        "id": "collection-id",
        "title": "合集标题",
        "description": "合集描述",
        "cover": "src/assets/images/collections/cover.png",
        "articles": ["article-1", "article-2"]
    }
]
```

## Markdown支持

### 基础语法

- 标题（h1-h6）
- 段落
- 无序列表（`*`、`-`、`+`）
- 有序列表
- 代码块（带语法高亮）
- 行内代码
- 引用块
- 链接和图片
- 表格
- 水平线
- 删除线
- 加粗和斜体

### 代码高亮

支持的语言包括：

| 语言 | 标识符 |
|------|--------|
| JavaScript | `javascript`, `js`, `jsx` |
| TypeScript | `typescript`, `ts`, `tsx` |
| Python | `python`, `py` |
| Java | `java` |
| C/C++ | `c`, `cpp`, `c++` |
| C# | `csharp`, `cs` |
| Go | `go`, `golang` |
| Rust | `rust`, `rs` |
| PHP | `php` |
| Ruby | `ruby`, `rb` |
| Swift | `swift` |
| Kotlin | `kotlin`, `kt` |
| SQL | `sql` |
| CSS | `css` |
| HTML | `html` |
| JSON | `json` |
| YAML | `yaml`, `yml` |
| Bash | `bash`, `sh`, `shell` |
| Dockerfile | `dockerfile`, `docker` |
| Vue | `vue` |
| React | `react` |

### 图片引用

文章中的图片统一存放在 `src/assets/images/posts/` 目录下：

```markdown
![图片描述](./assets/images/posts/image.png)
```

## 主题定制

### CSS变量

主要CSS变量定义在 `src/styles/main.css` 中：

```css
:root {
    --color-primary: #4a90d9;
    --color-accent: #4a90d9;
    --color-bg-primary: #ffffff;
    --color-text-primary: #1a1a2e;
}

[data-theme="dark"] {
    --color-bg-primary: #0f0f1a;
    --color-text-primary: #e4e4e7;
}
```

## 技术栈

- HTML5
- CSS3（CSS变量、Flexbox、Grid）
- JavaScript（ES6+）
- Markdown解析器（自定义实现）
- 代码高亮（自定义实现）

## 浏览器支持

- Chrome（推荐）
- Firefox
- Safari
- Edge

## 许可证

MIT License
