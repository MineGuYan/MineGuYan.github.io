/**
 * 博客主应用
 */
const BlogApp = {
    // 文章数据
    articles: [],
    // 合集数据
    collections: [],
    
    // 当前页面
    currentPage: 1,
    
    // 当前分类
    currentCategory: null,
    
    // 当前标签
    currentTag: null,
    // 当前合集
    currentCollection: null,

    /**
     * 初始化应用
     */
    async init() {
        await BlogConfig.load();
        
        this.initTheme();
        
        await this.loadArticles();
        await this.loadCollections();
        
        this.initRoutes();
        
        this.initEventListeners();
        
        this.initNavigation();
        
        this.initSearch();
        
        this.initBackToTop();
        
        this.renderSidebar();
        
        this.updateStaticContent();
    },

    /**
     * 初始化主题
     */
    initTheme() {
        const savedTheme = Utils.storage.get(BlogConfig.storageKeys.theme);
        const theme = savedTheme || BlogConfig.defaultTheme;
        document.documentElement.setAttribute('data-theme', theme);
        
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            Utils.storage.set(BlogConfig.storageKeys.theme, newTheme);
        });
    },

    /**
     * 加载文章数据
     */
    async loadArticles() {
        try {
            const response = await fetch('src/data/articles.json');
            const data = await response.json();
            this.articles = data.articles || [];
            
            // 按日期排序（倒序）
            this.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error('加载文章数据失败:', error);
            this.articles = [];
        }
    },

    async loadCollections() {
        try {
            const response = await fetch('src/data/collections.json');
            this.collections = await response.json() || [];
        } catch (error) {
            console.error('加载合集数据失败:', error);
            this.collections = [];
        }
    },

    initRoutes() {
        Router.register('/', () => this.showHomePage());
        
        Router.register('/article/:id', (params) => this.showArticlePage(params.id));
        
        Router.register('/categories', () => this.showCategoriesPage());
        Router.register('/category/:id', (params) => this.showCategoryPage(params.id));
        
        Router.register('/tags', () => this.showTagsPage());
        Router.register('/tag/:name', (params) => this.showTagPage(params.name));
        
        Router.register('/archives', () => this.showArchivesPage());
        
        Router.register('/collections', () => this.showCollectionsPage());
        Router.register('/collection/:id', (params) => this.showCollectionPage(params.id));
        Router.register('/collection/:collectionId/article/:articleId', (params) => {
            this.showArticlePage(params.articleId, params.collectionId);
        });
        
        Router.register('/about', () => this.showAboutPage());
        
        Router.register('/search', (params) => this.showSearchPage(params.q));
        
        Router.init();
    },

    /**
     * 初始化事件监听
     */
    initEventListeners() {
        window.addEventListener('scroll', Utils.throttle(() => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, 100));
        
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
        
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });
        
        const filterClear = document.getElementById('filter-clear');
        if (filterClear) {
            filterClear.addEventListener('click', () => {
                this.currentCategory = null;
                this.currentPage = 1;
                this._scrollToArticlesOnHome = true;
                Router.navigate('/');
            });
        }
        
        const heroBtnPrimary = document.querySelector('.hero-btn-primary');
        if (heroBtnPrimary) {
            heroBtnPrimary.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionHeader = document.querySelector('.section-header');
                if (sectionHeader) {
                    const navbarHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) || 64;
                    const elementPosition = sectionHeader.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - navbarHeight - 20;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        }
    },

    /**
     * 初始化导航
     */
    initNavigation() {
        // 导航链接点击
        document.querySelectorAll('[data-route]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const route = link.dataset.route;
                
                if (route === 'home') {
                    Router.navigate('/');
                } else {
                    Router.navigate('/' + route);
                }
            });
        });
    },

    /**
     * 初始化搜索
     */
    initSearch() {
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        const searchResults = document.getElementById('search-results');
        
        // 搜索输入
        const performSearch = Utils.debounce((query) => {
            if (query.length < 2) {
                searchResults.classList.remove('active');
                return;
            }
            
            const results = this.searchArticles(query);
            this.renderSearchResults(results, searchResults);
        }, 300);
        
        searchInput.addEventListener('input', (e) => {
            performSearch(e.target.value);
        });
        
        // 搜索按钮点击
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                Router.navigate('/search', { q: query });
                searchResults.classList.remove('active');
            }
        });
        
        // 回车搜索
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    Router.navigate('/search', { q: query });
                    searchResults.classList.remove('active');
                }
            }
        });
        
        // 点击外部关闭搜索结果
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-box')) {
                searchResults.classList.remove('active');
            }
        });
    },

    /**
     * 搜索文章
     */
    searchArticles(query) {
        const lowerQuery = query.toLowerCase();
        return this.articles.filter(article => {
            return article.title.toLowerCase().includes(lowerQuery) ||
                   article.excerpt.toLowerCase().includes(lowerQuery) ||
                   article.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
                   article.category.toLowerCase().includes(lowerQuery);
        }).slice(0, 5);
    },

    /**
     * 渲染搜索结果
     */
    renderSearchResults(results, container) {
        if (results.length === 0) {
            container.innerHTML = '<div class="search-result-item"><span class="search-result-title">未找到相关文章</span></div>';
        } else {
            container.innerHTML = results.map(article => `
                <div class="search-result-item" data-article-id="${article.id}">
                    <div class="search-result-title">${article.title}</div>
                    <div class="search-result-excerpt">${article.excerpt}</div>
                </div>
            `).join('');
            
            // 点击搜索结果
            container.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const articleId = item.dataset.articleId;
                    Router.navigate('/article/' + articleId);
                    container.classList.remove('active');
                    document.getElementById('search-input').value = '';
                });
            });
        }
        container.classList.add('active');
    },

    /**
     * 初始化回到顶部
     */
    initBackToTop() {
        const backToTop = document.getElementById('back-to-top');
        
        window.addEventListener('scroll', Utils.throttle(() => {
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }, 100));
        
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    },

    /**
     * 显示页面
     */
    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
        });
        document.getElementById(pageId).style.display = 'block';
    },

    showHeroSection(show) {
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.style.display = show ? 'flex' : 'none';
        }
    },

    /**
     * 显示首页
     */
    showHomePage() {
        const shouldScroll = this._scrollToArticlesOnHome;
        this._scrollToArticlesOnHome = false;
        
        this.showPage('home-page');
        this.currentCategory = null;
        this.currentPage = Router.getParams().page || 1;
        this.showHeroSection(true);
        this.renderArticleList();
        document.title = BlogConfig.site.title;
        
        if (shouldScroll) {
            setTimeout(() => {
                const sectionHeader = document.querySelector('.section-header');
                if (sectionHeader) {
                    const navbarHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) || 64;
                    const elementPosition = sectionHeader.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - navbarHeight - 20;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    },

    /**
     * 显示文章详情页
     */
    async showArticlePage(articleId) {
        this.showPage('article-page');
        this._currentArticleId = articleId;
        
        const article = this.articles.find(a => a.id === articleId);
        if (!article) {
            this.show404();
            return;
        }
        
        let content = article.content;
        if (article.file) {
            try {
                const response = await fetch('src/posts/' + article.file);
                content = await response.text();
            } catch (error) {
                console.error('加载文章内容失败:', error);
                content = article.excerpt;
            }
        }
        
        document.getElementById('article-title').textContent = article.title;
        document.getElementById('article-date').textContent = Utils.formatDate(article.date);
        document.getElementById('article-category').textContent = this.getCategoryName(article.category);
        document.getElementById('article-reading-time').textContent = Utils.calculateReadingTime(content) + ' 分钟阅读';
        
        const tagsContainer = document.getElementById('article-tags');
        tagsContainer.innerHTML = article.tags.map(tag => 
            `<span class="tag" data-tag="${tag}">${tag}</span>`
        ).join('');
        
        tagsContainer.querySelectorAll('.tag').forEach(tagEl => {
            tagEl.addEventListener('click', () => {
                Router.navigate('/tag/' + tagEl.dataset.tag);
            });
        });
        
        const articleBody = document.getElementById('article-body');
        articleBody.innerHTML = MarkdownParser.parse(content);
        
        this.renderToc(content);
        
        this.renderArticleNav(articleId);
        
        this.renderCollectionToc(articleId);
        
        this.initArticleBackBtn();
        
        document.title = article.title + ' - ' + BlogConfig.site.title;
    },

    /**
     * 渲染目录
     */
    renderToc(content) {
        const toc = MarkdownParser.extractToc(content);
        const tocNav = document.getElementById('toc-nav');
        
        if (toc.length === 0) {
            tocNav.innerHTML = '<p style="color: var(--color-text-tertiary);">暂无目录</p>';
            return;
        }
        
        const renderTocTree = (items) => {
            if (items.length === 0) return '';
            
            let html = '<ul>';
            items.forEach(item => {
                const hasChildren = item.children && item.children.length > 0;
                const collapseIcon = hasChildren 
                    ? '<span class="toc-collapse-icon" data-collapsed="false">▼</span>' 
                    : '';
                
                const escapedText = item.text
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
                
                html += `<li class="toc-item toc-level-${item.level}" data-level="${item.level}">`;
                html += `<div class="toc-item-content">${collapseIcon}<a href="#${item.id}" data-level="${item.level}">${escapedText}</a></div>`;
                
                if (hasChildren) {
                    html += `<div class="toc-children">${renderTocTree(item.children)}</div>`;
                }
                
                html += '</li>';
            });
            html += '</ul>';
            return html;
        };
        
        tocNav.innerHTML = renderTocTree(toc);
        
        tocNav.querySelectorAll('.toc-collapse-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                const li = icon.closest('.toc-item');
                const children = li.querySelector('.toc-children');
                
                if (children) {
                    const isCollapsed = icon.dataset.collapsed === 'true';
                    icon.dataset.collapsed = !isCollapsed;
                    icon.textContent = isCollapsed ? '▼' : '▶';
                    children.style.display = isCollapsed ? 'block' : 'none';
                }
            });
        });
        
        tocNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const id = link.getAttribute('href').slice(1);
                const targetElement = document.getElementById(id);
                if (targetElement) {
                    Utils.scrollToElement(targetElement);
                }
            });
        });
        
        this.initTocHighlight();
    },

    initTocHighlight() {
        const headers = document.querySelectorAll('.article-body h1, .article-body h2, .article-body h3, .article-body h4');
        const tocNav = document.getElementById('toc-nav');
        
        const highlightToc = Utils.throttle(() => {
            let currentHeader = null;
            
            headers.forEach(header => {
                const rect = header.getBoundingClientRect();
                if (rect.top <= 100) {
                    currentHeader = header;
                }
            });
            
            tocNav.querySelectorAll('a').forEach(link => {
                link.classList.remove('active');
                if (currentHeader && link.getAttribute('href') === '#' + currentHeader.id) {
                    link.classList.add('active');
                    
                    let parent = link.closest('.toc-children');
                    while (parent) {
                        parent.style.display = 'block';
                        const parentLi = parent.closest('.toc-item');
                        if (parentLi) {
                            const icon = parentLi.querySelector(':scope > .toc-item-content .toc-collapse-icon');
                            if (icon) {
                                icon.dataset.collapsed = 'false';
                                icon.textContent = '▼';
                            }
                        }
                        parent = parent.parentElement.closest('.toc-children');
                    }
                }
            });
        }, 100);
        
        window.addEventListener('scroll', highlightToc);
        highlightToc();
    },

    initArticleBackBtn() {
        const backBtn = document.getElementById('article-back-btn');
        if (backBtn) {
            backBtn.onclick = () => {
                this._scrollToArticlesOnHome = true;
                Router.navigate('/');
            };
        }
    },

    renderCollectionToc(articleId) {
        const collectionTocWidget = document.getElementById('collection-toc-widget');
        const collectionTocNav = document.getElementById('collection-toc-nav');
        const collectionTocTitle = document.getElementById('collection-toc-title');
        
        const article = this.articles.find(a => a.id === articleId);
        if (!article || !article.collections || article.collections.length === 0) {
            collectionTocWidget.style.display = 'none';
            return;
        }
        
        const collectionId = article.collections[0];
        const collection = this.collections.find(c => c.id === collectionId);
        
        if (!collection || !collection.articles || collection.articles.length === 0) {
            collectionTocWidget.style.display = 'none';
            return;
        }
        
        collectionTocTitle.textContent = collection.title;
        
        let html = '<ul>';
        collection.articles.forEach((articleIdInCollection, index) => {
            const articleInCollection = this.articles.find(a => a.id === articleIdInCollection);
            if (articleInCollection) {
                const isActive = articleIdInCollection === articleId;
                html += `<li>
                    <a href="#" data-article-id="${articleIdInCollection}" class="${isActive ? 'active' : ''}">
                        <span class="toc-number">${index + 1}</span>
                        <span class="toc-title">${articleInCollection.title}</span>
                    </a>
                </li>`;
            }
        });
        html += '</ul>';
        
        collectionTocNav.innerHTML = html;
        collectionTocWidget.style.display = 'block';
        
        collectionTocNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                Router.navigate('/article/' + link.dataset.articleId);
            });
        });
    },

    renderArticleNav(currentId) {
        const prevEl = document.getElementById('article-prev');
        const nextEl = document.getElementById('article-next');
        
        const article = this.articles.find(a => a.id === currentId);
        
        if (!article || !article.collections || article.collections.length === 0) {
            prevEl.style.display = 'none';
            nextEl.style.display = 'none';
            return;
        }
        
        const collectionId = article.collections[0];
        const collection = this.collections.find(c => c.id === collectionId);
        
        if (!collection || !collection.articles || collection.articles.length === 0) {
            prevEl.style.display = 'none';
            nextEl.style.display = 'none';
            return;
        }
        
        const currentIndex = collection.articles.indexOf(currentId);
        
        if (currentIndex === -1) {
            prevEl.style.display = 'none';
            nextEl.style.display = 'none';
            return;
        }
        
        const prevArticleId = currentIndex > 0 ? collection.articles[currentIndex - 1] : null;
        const nextArticleId = currentIndex < collection.articles.length - 1 ? collection.articles[currentIndex + 1] : null;
        
        if (prevArticleId) {
            const prevArticle = this.articles.find(a => a.id === prevArticleId);
            if (prevArticle) {
                prevEl.style.display = 'block';
                prevEl.querySelector('.nav-title').textContent = prevArticle.title;
                prevEl.onclick = (e) => {
                    e.preventDefault();
                    Router.navigate('/article/' + prevArticleId);
                };
            } else {
                prevEl.style.display = 'none';
            }
        } else {
            prevEl.style.display = 'none';
        }
        
        if (nextArticleId) {
            const nextArticle = this.articles.find(a => a.id === nextArticleId);
            if (nextArticle) {
                nextEl.style.display = 'block';
                nextEl.querySelector('.nav-title').textContent = nextArticle.title;
                nextEl.onclick = (e) => {
                    e.preventDefault();
                    Router.navigate('/article/' + nextArticleId);
                };
            } else {
                nextEl.style.display = 'none';
            }
        } else {
            nextEl.style.display = 'none';
        }
    },

    /**
     * 显示分类页
     */
    showCategoriesPage() {
        this.showPage('categories-page');
        this.renderCategoriesGrid();
        document.title = '分类 - ' + BlogConfig.site.title;
    },

    /**
     * 显示分类文章页
     */
    showCategoryPage(categoryId) {
        this.showPage('home-page');
        this.currentCategory = categoryId;
        this.currentPage = 1;
        this.showHeroSection(false);
        this.renderArticleList();
        document.title = this.getCategoryName(categoryId) + ' - ' + BlogConfig.site.title;
    },

    /**
     * 显示标签页
     */
    showTagsPage() {
        this.showPage('tags-page');
        this.renderTagsCloud();
        document.getElementById('tag-articles').style.display = 'none';
        document.title = '标签 - ' + BlogConfig.site.title;
    },

    /**
     * 显示标签文章页
     */
    showTagPage(tagName) {
        this.showPage('tags-page');
        this.renderTagsCloud();
        this.currentTag = tagName;
        this.renderTagArticles(tagName);
        document.title = tagName + ' - ' + BlogConfig.site.title;
    },

    /**
     * 显示归档页
     */
    showArchivesPage() {
        this.showPage('archives-page');
        this.renderArchives();
        document.title = '归档 - ' + BlogConfig.site.title;
    },

    showCollectionsPage() {
        this.showPage('collections-page');
        this.renderCollections();
        document.title = '合集 - ' + BlogConfig.site.title;
    },

    showCollectionPage(collectionId) {
        this.showPage('collection-detail-page');
        this.currentCollection = collectionId;
        this.renderCollectionDetail(collectionId);
        const collection = this.collections.find(c => c.id === collectionId);
        document.title = (collection ? collection.title : collectionId) + ' - ' + BlogConfig.site.title;
    },

    showAboutPage() {
        this.showPage('about-page');
        document.title = '关于 - ' + BlogConfig.site.title;
    },

    /**
     * 显示搜索结果页
     */
    showSearchPage(query) {
        this.showPage('search-page');
        document.getElementById('search-query').textContent = `搜索 "${query}" 的结果`;
        
        const results = this.searchArticles(query);
        const container = document.getElementById('search-results-list');
        
        if (results.length === 0) {
            container.innerHTML = '<p style="color: var(--color-text-secondary);">未找到相关文章</p>';
        } else {
            this.renderArticles(results, container);
        }
        
        document.title = '搜索: ' + query + ' - ' + BlogConfig.site.title;
    },

    /**
     * 显示404页面
     */
    show404() {
        this.showPage('home-page');
        document.getElementById('articles-list').innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <h2 style="font-size: 2rem; margin-bottom: 1rem;">文章不存在</h2>
                <p style="color: var(--color-text-secondary);">您访问的文章可能已被删除或移动</p>
                <a href="#" data-route="home" style="display: inline-block; margin-top: 2rem; padding: 10px 20px; background: var(--color-accent); color: white; border-radius: 8px;">返回首页</a>
            </div>
        `;
    },

    /**
     * 渲染文章列表
     */
    renderArticleList() {
        let articles = [...this.articles];
        
        const sectionTitle = document.getElementById('section-title');
        const filterInfo = document.getElementById('filter-info');
        const filterCategory = document.getElementById('filter-category');
        
        if (this.currentCategory) {
            articles = articles.filter(a => a.category === this.currentCategory);
            sectionTitle.textContent = this.getCategoryName(this.currentCategory);
            filterCategory.textContent = this.getCategoryName(this.currentCategory);
            filterInfo.style.display = 'flex';
        } else {
            sectionTitle.textContent = '最新文章';
            filterInfo.style.display = 'none';
        }
        
        const postsPerPage = BlogConfig.pagination.postsPerPage;
        const totalPages = Math.ceil(articles.length / postsPerPage);
        const startIndex = (this.currentPage - 1) * postsPerPage;
        const endIndex = startIndex + postsPerPage;
        const pageArticles = articles.slice(startIndex, endIndex);
        
        const container = document.getElementById('articles-list');
        this.renderArticles(pageArticles, container);
        
        this.renderPagination(totalPages);
    },

    /**
     * 渲染文章卡片
     */
    renderArticles(articles, container) {
        container.innerHTML = articles.map(article => `
            <article class="article-card fade-in">
                <div class="article-card-header">
                    <h2 class="article-card-title">
                        <a href="#" data-article-id="${article.id}">${article.title}</a>
                    </h2>
                    <div class="article-card-meta">
                        <span>
                            <svg viewBox="0 0 24 24" width="14" height="14">
                                <path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
                            </svg>
                            ${Utils.formatDate(article.date)}
                        </span>
                        <span>
                            <svg viewBox="0 0 24 24" width="14" height="14">
                                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            ${this.getCategoryName(article.category)}
                        </span>
                    </div>
                    <p class="article-card-excerpt">${article.excerpt}</p>
                    <div class="article-card-tags">
                        ${article.tags.map(tag => `<span class="tag" data-tag="${tag}">${tag}</span>`).join('')}
                    </div>
                </div>
            </article>
        `).join('');
        
        // 绑定事件
        container.querySelectorAll('[data-article-id]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                Router.navigate('/article/' + link.dataset.articleId);
            });
        });
        
        container.querySelectorAll('.tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.stopPropagation();
                Router.navigate('/tag/' + tag.dataset.tag);
            });
        });
    },

    /**
     * 渲染分页
     */
    renderPagination(totalPages) {
        const container = document.getElementById('pagination');
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        
        let html = '';
        
        // 上一页
        html += `<button class="pagination-btn" ${this.currentPage <= 1 ? 'disabled' : ''} data-page="${this.currentPage - 1}">上一页</button>`;
        
        // 页码
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                html += `<button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                html += '<span style="padding: 0 8px;">...</span>';
            }
        }
        
        // 下一页
        html += `<button class="pagination-btn" ${this.currentPage >= totalPages ? 'disabled' : ''} data-page="${this.currentPage + 1}">下一页</button>`;
        
        container.innerHTML = html;
        
        // 绑定分页事件
        container.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.disabled) return;
                this.currentPage = parseInt(btn.dataset.page);
                this.renderArticleList();
                
                const sectionHeader = document.querySelector('.section-header');
                if (sectionHeader) {
                    const navbarHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) || 64;
                    const elementPosition = sectionHeader.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - navbarHeight - 20;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    },

    /**
     * 渲染侧边栏
     */
    renderSidebar() {
        // 渲染分类
        const categoryList = document.getElementById('sidebar-categories');
        const categoryCount = this.getCategoryCount();
        
        categoryList.innerHTML = BlogConfig.categories.map(cat => `
            <li>
                <a href="#" data-category="${cat.id}">
                    ${cat.name}
                    <span class="category-count">${categoryCount[cat.id] || 0}</span>
                </a>
            </li>
        `).join('');
        
        categoryList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                Router.navigate('/category/' + link.dataset.category);
            });
        });
        
        // 渲染标签
        const tagCloud = document.getElementById('sidebar-tags');
        const tagCount = this.getTagCount();
        
        tagCloud.innerHTML = Object.entries(tagCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([tag, count]) => `<span class="tag" data-tag="${tag}">${tag}</span>`)
            .join('');
        
        tagCloud.querySelectorAll('.tag').forEach(tag => {
            tag.addEventListener('click', () => {
                Router.navigate('/tag/' + tag.dataset.tag);
            });
        });
    },

    /**
     * 渲染分类网格
     */
    renderCategoriesGrid() {
        const container = document.getElementById('categories-grid');
        const categoryCount = this.getCategoryCount();
        
        container.innerHTML = BlogConfig.categories.map(cat => `
            <div class="category-card" data-category="${cat.id}">
                <h3 class="category-card-title">${cat.name}</h3>
                <p class="category-card-count">${categoryCount[cat.id] || 0} 篇文章</p>
                <p style="color: var(--color-text-tertiary); font-size: 0.875rem; margin-top: 0.5rem;">${cat.description}</p>
            </div>
        `).join('');
        
        container.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                Router.navigate('/category/' + card.dataset.category);
            });
        });
    },

    /**
     * 渲染标签云
     */
    renderTagsCloud() {
        const container = document.getElementById('tags-cloud');
        const tagCount = this.getTagCount();
        
        container.innerHTML = Object.entries(tagCount)
            .sort((a, b) => b[1] - a[1])
            .map(([tag, count]) => `<span class="tag" data-tag="${tag}">${tag} (${count})</span>`)
            .join('');
        
        container.querySelectorAll('.tag').forEach(tag => {
            tag.addEventListener('click', () => {
                Router.navigate('/tag/' + tag.dataset.tag);
            });
        });
    },

    /**
     * 渲染标签文章
     */
    renderTagArticles(tagName) {
        const articles = this.articles.filter(a => a.tags.includes(tagName));
        
        document.getElementById('tag-title').textContent = `标签: ${tagName}`;
        document.getElementById('tag-articles').style.display = 'block';
        
        const container = document.getElementById('tag-articles-list');
        this.renderArticles(articles, container);
    },

    /**
     * 渲染归档
     */
    renderArchives() {
        const container = document.getElementById('archives-timeline');
        const archives = this.groupArticlesByDate();
        
        let html = '';
        
        Object.entries(archives).sort((a, b) => b[0].localeCompare(a[0])).forEach(([year, months]) => {
            html += `<div class="archive-year">
                <h2 class="archive-year-title">${year}年</h2>`;
            
            Object.entries(months).sort((a, b) => b[0].localeCompare(a[0])).forEach(([month, articles]) => {
                html += `<div class="archive-month">
                    <h3 class="archive-month-title">${month}月</h3>`;
                
                articles.forEach(article => {
                    html += `<div class="archive-article" data-article-id="${article.id}">
                        <span class="archive-article-date">${Utils.formatDate(article.date, 'MM-DD')}</span>
                        <span class="archive-article-title">${article.title}</span>
                    </div>`;
                });
                
                html += '</div>';
            });
            
            html += '</div>';
        });
        
        container.innerHTML = html;
        
        // 绑定点击事件
        container.querySelectorAll('.archive-article').forEach(article => {
            article.addEventListener('click', () => {
                Router.navigate('/article/' + article.dataset.articleId);
            });
        });
    },

    renderCollections() {
        const container = document.getElementById('collections-grid');
        
        if (this.collections.length === 0) {
            container.innerHTML = '<p class="empty-message">暂无合集</p>';
            return;
        }
        
        let html = '';
        this.collections.forEach(collection => {
            const articleCount = collection.articles ? collection.articles.length : 0;
            
            html += `<div class="collection-card" data-collection-id="${collection.id}">
                <img src="${collection.cover || 'src/assets/images/collections/default.png'}" 
                     alt="${collection.title}" 
                     class="collection-card-cover"
                     onerror="this.src='src/assets/images/collections/default.png'">
                <div class="collection-card-content">
                    <h3 class="collection-card-title">${collection.title}</h3>
                    <p class="collection-card-description">${collection.description || ''}</p>
                    <div class="collection-card-meta">
                        <span class="collection-card-count">${articleCount} 篇文章</span>
                    </div>
                </div>
            </div>`;
        });
        
        container.innerHTML = html;
        
        container.querySelectorAll('.collection-card').forEach(card => {
            card.addEventListener('click', () => {
                Router.navigate('/collection/' + card.dataset.collectionId);
            });
        });
    },

    renderCollectionDetail(collectionId) {
        const collection = this.collections.find(c => c.id === collectionId);
        
        if (!collection) {
            document.getElementById('collection-title').textContent = '合集不存在';
            document.getElementById('collection-description').textContent = '';
            document.getElementById('collection-article-count').textContent = '0';
            document.getElementById('collection-articles').innerHTML = '<p class="empty-message">该合集不存在</p>';
            return;
        }
        
        const coverImg = document.getElementById('collection-cover');
        coverImg.src = collection.cover || 'src/assets/images/collections/default.png';
        coverImg.alt = collection.title;
        coverImg.onerror = function() {
            this.src = 'src/assets/images/collections/default.png';
        };
        
        document.getElementById('collection-title').textContent = collection.title;
        document.getElementById('collection-description').textContent = collection.description || '';
        document.getElementById('collection-article-count').textContent = collection.articles ? collection.articles.length : 0;
        
        const articlesContainer = document.getElementById('collection-articles');
        
        if (!collection.articles || collection.articles.length === 0) {
            articlesContainer.innerHTML = '<p class="empty-message">该合集暂无文章</p>';
            return;
        }
        
        let html = '';
        collection.articles.forEach((articleId, index) => {
            const article = this.articles.find(a => a.id === articleId);
            if (article) {
                html += `<div class="collection-article-item" data-article-id="${article.id}">
                    <span class="collection-article-number">${index + 1}</span>
                    <div class="collection-article-content">
                        <h4 class="collection-article-title">${article.title}</h4>
                        <p class="collection-article-excerpt">${article.excerpt || ''}</p>
                    </div>
                    <span class="collection-article-date">${Utils.formatDate(article.date)}</span>
                </div>`;
            }
        });
        
        articlesContainer.innerHTML = html || '<p class="empty-message">该合集暂无文章</p>';
        
        articlesContainer.querySelectorAll('.collection-article-item').forEach(item => {
            item.addEventListener('click', () => {
                Router.navigate('/article/' + item.dataset.articleId);
            });
        });
        
        const backBtn = document.getElementById('collection-back-btn');
        if (backBtn) {
            backBtn.onclick = () => {
                Router.navigate('/collections');
            };
        }
    },

    /**
     * 按日期分组文章
     */
    groupArticlesByDate() {
        const archives = {};
        
        this.articles.forEach(article => {
            const date = new Date(article.date);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            
            if (!archives[year]) {
                archives[year] = {};
            }
            if (!archives[year][month]) {
                archives[year][month] = [];
            }
            archives[year][month].push(article);
        });
        
        return archives;
    },

    /**
     * 获取分类名称
     */
    getCategoryName(categoryId) {
        return BlogConfig.getCategoryName(categoryId);
    },

    /**
     * 获取分类文章数量
     */
    getCategoryCount() {
        const count = {};
        this.articles.forEach(article => {
            count[article.category] = (count[article.category] || 0) + 1;
        });
        return count;
    },

    /**
     * 获取标签文章数量
     */
    getTagCount() {
        const count = {};
        this.articles.forEach(article => {
            article.tags.forEach(tag => {
                count[tag] = (count[tag] || 0) + 1;
            });
        });
        return count;
    },
    
    updateStaticContent() {
        document.querySelector('.logo-text').textContent = BlogConfig.site.title;
        document.querySelector('.hero-title').textContent = '欢迎来到' + BlogConfig.site.title;
        document.querySelector('.hero-subtitle').textContent = BlogConfig.site.description;
        
        const authorAvatar = document.querySelector('.author-avatar');
        const authorName = document.querySelector('.author-name');
        const authorBio = document.querySelector('.author-bio');
        
        if (authorAvatar && BlogConfig.author) {
            authorAvatar.src = BlogConfig.author.avatar;
            authorAvatar.alt = BlogConfig.author.name;
        }
        if (authorName && BlogConfig.author) {
            authorName.textContent = BlogConfig.author.name;
        }
        if (authorBio && BlogConfig.author) {
            authorBio.textContent = BlogConfig.author.bio;
        }
        
        const copyright = document.querySelector('.copyright');
        const poweredBy = document.querySelector('.powered-by');
        if (copyright && BlogConfig.site.footer) {
            const year = new Date().getFullYear();
            copyright.textContent = `© ${year} ${BlogConfig.site.footer.copyright}`;
        }
        if (poweredBy && BlogConfig.site.footer) {
            poweredBy.textContent = BlogConfig.site.footer.poweredBy;
        }
        
        const aboutAvatar = document.querySelector('.about-avatar');
        const aboutName = document.querySelector('.about-name');
        const aboutBio = document.querySelector('.about-bio');
        
        if (aboutAvatar && BlogConfig.author) {
            aboutAvatar.src = BlogConfig.author.avatar;
            aboutAvatar.alt = BlogConfig.author.name;
        }
        if (aboutName && BlogConfig.author) {
            aboutName.textContent = BlogConfig.author.name;
        }
        if (aboutBio && BlogConfig.author) {
            aboutBio.textContent = BlogConfig.author.bio;
        }
        
        const aboutSkills = document.getElementById('about-skills');
        if (aboutSkills && BlogConfig.author && BlogConfig.author.skills) {
            const skills = BlogConfig.author.skills;
            const labels = BlogConfig.author.skillLabels || {};
            
            let skillsHtml = '';
            Object.keys(skills).forEach(key => {
                const categoryName = labels[key] || key;
                const items = Array.isArray(skills[key]) ? skills[key].join(', ') : skills[key];
                skillsHtml += `<li>${categoryName}：${items}</li>`;
            });
            aboutSkills.innerHTML = skillsHtml;
        }
        
        const aboutSocial = document.getElementById('about-social');
        if (aboutSocial && BlogConfig.author && BlogConfig.author.social) {
            const social = BlogConfig.author.social;
            const labels = BlogConfig.author.socialLabels || {};
            
            let socialHtml = '';
            Object.keys(social).forEach(key => {
                const socialName = labels[key] || key;
                const value = social[key];
                
                if (key === 'email') {
                    socialHtml += `<li>${socialName}: <a href="mailto:${value}">${value}</a></li>`;
                } else {
                    if (value.startsWith('http')) {
                        socialHtml += `<li>${socialName}: <a href="${value}" target="_blank" rel="noopener">${value}</a></li>`;
                    } else {
                        socialHtml += `<li>${socialName}: ${value}</li>`;
                    }
                }
            });
            aboutSocial.innerHTML = socialHtml;
        }
    }
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    BlogApp.init();
});
