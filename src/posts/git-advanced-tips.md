# Git 高级技巧与最佳实践

Git 是现代软件开发中最重要的版本控制工具之一。掌握 Git 的高级用法可以大大提高开发效率，本文介绍一些实用的 Git 技巧和团队协作最佳实践。

## 基础配置

### 用户配置

```bash
# 设置用户名和邮箱
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# 查看配置
git config --list
```

### 常用别名

```bash
# 设置常用别名
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.lg "log --oneline --graph --all"
git config --global alias.unstage "reset HEAD --"
git config --global alias.last "log -1 HEAD"
```

## 分支管理

### 分支命名规范

```
feature/xxx  - 新功能分支
bugfix/xxx   - Bug 修复分支
hotfix/xxx   - 紧急修复分支
release/xxx  - 发布分支
```

### 分支操作

```bash
# 创建并切换分支
git checkout -b feature/new-feature

# 推送新分支到远程
git push -u origin feature/new-feature

# 删除本地分支
git branch -d feature/new-feature

# 删除远程分支
git push origin --delete feature/new-feature

# 重命名分支
git branch -m old-name new-name
```

### 查看分支

```bash
# 查看所有分支
git branch -a

# 查看分支详细信息
git branch -vv

# 查看已合并的分支
git branch --merged

# 查看未合并的分支
git branch --no-merged
```

## 提交技巧

### 交互式暂存

```bash
# 交互式添加
git add -p

# 交互式重置
git reset -p
```

### 修改提交

```bash
# 修改最后一次提交信息
git commit --amend -m "新的提交信息"

# 修改最后一次提交内容（添加遗漏的文件）
git add forgotten-file
git commit --amend --no-edit
```

### 交互式变基

```bash
# 交互式变基最近 3 次提交
git rebase -i HEAD~3
```

在编辑器中可以：

- `pick`：保留提交
- `reword`：修改提交信息
- `squash`：合并到前一个提交
- `drop`：删除提交

## 暂存工作

### 使用 stash

```bash
# 暂存当前工作
git stash

# 暂存并添加描述
git stash save "工作进度描述"

# 查看暂存列表
git stash list

# 恢复最近的暂存
git stash pop

# 恢复指定暂存
git stash apply stash@{2}

# 删除暂存
git stash drop stash@{0}

# 清空所有暂存
git stash clear
```

## 历史操作

### 查看历史

```bash
# 查看提交历史
git log --oneline --graph --all

# 查看文件修改历史
git log -p filename

# 查看某人的提交
git log --author="username"

# 查看某个时间段的提交
git log --since="2024-01-01" --until="2024-03-01"

# 搜索提交信息
git log --grep="关键词"
```

### 搜索代码

```bash
# 搜索代码内容
git grep "search-term"

# 搜索特定文件
git grep "search-term" -- "*.js"

# 搜索特定分支
git grep "search-term" branch-name
```

### 撤销操作

```bash
# 撤销工作区的修改
git checkout -- filename

# 撤销暂存区的修改
git reset HEAD filename

# 撤销提交（保留修改）
git reset --soft HEAD~1

# 撤销提交（不保留修改）
git reset --hard HEAD~1

# 创建反向提交
git revert commit-hash
```

## 合并与变基

### 合并分支

```bash
# 合并指定分支到当前分支
git merge feature/branch

# 不使用快进模式合并（保留分支历史）
git merge --no-ff feature/branch

# 压缩合并（将多个提交压缩为一个）
git merge --squash feature/branch
```

### 变基操作

```bash
# 将当前分支变基到 main
git rebase main

# 解决冲突后继续变基
git rebase --continue

# 放弃变基
git rebase --abort
```

### Merge vs Rebase

| 操作 | 优点 | 缺点 |
|------|------|------|
| Merge | 保留完整历史，安全 | 产生额外的合并提交 |
| Rebase | 历史更清晰，线性 | 改变历史，需谨慎使用 |

## Cherry-pick

选择性合并提交：

```bash
# 选择特定提交合并到当前分支
git cherry-pick commit-hash

# 选择多个提交
git cherry-pick hash1 hash2

# 选择提交范围
git cherry-pick hash1..hash2
```

## 远程仓库

### 远程操作

```bash
# 查看远程仓库
git remote -v

# 添加远程仓库
git remote add upstream https://github.com/user/repo.git

# 删除远程仓库
git remote remove upstream

# 重命名远程仓库
git remote rename old-name new-name

# 从远程仓库获取更新
git fetch upstream

# 拉取并合并
git pull origin main
```

### 同步 Fork 仓库

```bash
# 添加上游仓库
git remote add upstream https://github.com/original/repo.git

# 获取上游更新
git fetch upstream

# 合并到本地分支
git merge upstream/main

# 推送到自己的仓库
git push origin main
```

## Git Flow 工作流

### 分支模型

```
main (master)    - 生产环境代码
develop          - 开发分支
feature/*        - 功能分支
release/*        - 发布分支
hotfix/*         - 热修复分支
```

### 工作流程

```bash
# 1. 从 develop 创建功能分支
git checkout develop
git checkout -b feature/new-feature

# 2. 开发完成后合并回 develop
git checkout develop
git merge --no-ff feature/new-feature

# 3. 创建发布分支
git checkout -b release/1.0.0

# 4. 发布分支测试完成后合并到 main 和 develop
git checkout main
git merge --no-ff release/1.0.0
git tag -a v1.0.0 -m "Version 1.0.0"

git checkout develop
git merge --no-ff release/1.0.0

# 5. 紧急修复
git checkout -b hotfix/bug-fix main
# 修复后合并到 main 和 develop
```

## 最佳实践

### 提交信息规范

```
<type>(<scope>): <subject>

<body>

<footer>
```

类型（type）：

- `feat`：新功能
- `fix`：Bug 修复
- `docs`：文档更新
- `style`：代码格式调整
- `refactor`：代码重构
- `test`：测试相关
- `chore`：构建/工具相关

示例：

```
feat(user): 添加用户登录功能

- 实现邮箱密码登录
- 添加记住密码选项
- 集成第三方登录

Closes #123
```

### .gitignore 配置

```gitignore
# 依赖目录
node_modules/
vendor/

# 构建输出
dist/
build/
*.min.js

# 环境配置
.env
.env.local

# IDE 配置
.idea/
.vscode/
*.swp

# 系统文件
.DS_Store
Thumbs.db

# 日志文件
*.log
logs/
```

### 提交前检查

```bash
# 检查将要提交的内容
git diff --cached

# 检查工作区状态
git status

# 检查是否有大文件
git ls-files -s | awk '{print $4, $2}' | sort -n
```

## 实用技巧

### 二分查找 Bug

```bash
# 开始二分查找
git bisect start

# 标记当前版本有问题
git bisect bad

# 标记某个正常版本
git bisect good v1.0.0

# Git 会自动切换到中间版本，测试后标记
git bisect good  # 或 git bisect bad

# 找到问题后结束
git bisect reset
```

### 清理仓库

```bash
# 清理未跟踪的文件（预览）
git clean -n

# 清理未跟踪的文件
git clean -fd

# 清理忽略的文件
git clean -fdX

# 清理所有未跟踪的文件
git clean -fdx
```

### 统计代码

```bash
# 统计代码行数
git ls-files | xargs wc -l

# 统计每个人的提交数
git shortlog -sn

# 统计某文件的修改历史
git log --oneline --follow -- filename
```

## 总结

Git 是一个功能强大的工具，掌握这些技巧可以：

1. **提高效率**：快速完成版本控制操作
2. **减少错误**：正确处理冲突和回滚
3. **团队协作**：规范工作流程
4. **问题排查**：快速定位问题来源

持续学习和实践，你会发现 Git 的更多强大功能！

---

*参考资料：[Pro Git 书籍](https://git-scm.com/book/zh/v2)*
