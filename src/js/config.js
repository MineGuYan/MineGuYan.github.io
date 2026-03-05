const BlogConfig = {
    site: null,
    categories: null,
    author: null,
    pagination: null,
    settings: null,
    
    _loaded: false,
    
    async load() {
        if (this._loaded) return this;
        
        const basePath = 'src/data/config/';
        
        try {
            const [site, categories, author, pagination, settings] = await Promise.all([
                fetch(basePath + 'site.json').then(r => r.json()),
                fetch(basePath + 'categories.json').then(r => r.json()),
                fetch(basePath + 'author.json').then(r => r.json()),
                fetch(basePath + 'pagination.json').then(r => r.json()),
                fetch(basePath + 'settings.json').then(r => r.json())
            ]);
            
            this.site = { ...site, url: window.location.origin };
            this.categories = categories;
            this.author = author;
            this.pagination = pagination;
            this.settings = settings;
            
            this._loaded = true;
            return this;
        } catch (error) {
            console.error('Failed to load config:', error);
            this._loadDefaults();
            return this;
        }
    },
    
    _loadDefaults() {
        this.site = {
            title: '我的博客',
            description: '记录技术成长、生活感悟与阅读思考',
            url: window.location.origin,
            footer: {
                copyright: '我的博客. All rights reserved.',
                poweredBy: 'Powered by 纯静态HTML'
            }
        };
        this.categories = [
            { id: 'tech', name: '技术', description: '技术学习与开发经验' },
            { id: 'life', name: '生活', description: '生活感悟与日常记录' },
            { id: 'reading', name: '读书笔记', description: '阅读心得与书评' },
            { id: 'tutorial', name: '教程', description: '技术教程与指南' }
        ];
        this.author = {
            name: '博主',
            avatar: 'src/assets/images/Avatar.png',
            bio: '一名热爱技术的开发者，喜欢探索新技术，分享学习心得。'
        };
        this.pagination = { postsPerPage: 5 };
        this.settings = {
            defaultTheme: 'dark',
            storageKeys: { theme: 'blog-theme' }
        };
        this._loaded = true;
    },
    
    getCategoryName(categoryId) {
        const category = this.categories?.find(c => c.id === categoryId);
        return category?.name || categoryId;
    },
    
    get defaultTheme() {
        return this.settings?.defaultTheme || 'dark';
    },
    
    get storageKeys() {
        return this.settings?.storageKeys || { theme: 'blog-theme' };
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlogConfig;
}
