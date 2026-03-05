/**
 * 路由系统
 * 基于URL hash的单页应用路由
 */
const Router = {
    // 路由配置
    routes: {},
    
    // 当前路由
    currentRoute: null,
    
    // 路由参数
    params: {},

    /**
     * 初始化路由
     */
    init() {
        // 监听hash变化
        window.addEventListener('hashchange', () => this.handleRouteChange());
        
        // 监听页面加载
        window.addEventListener('load', () => this.handleRouteChange());
        
        // 处理初始路由
        this.handleRouteChange();
    },

    /**
     * 注册路由
     */
    register(path, handler) {
        this.routes[path] = handler;
    },

    /**
     * 处理路由变化
     */
    handleRouteChange() {
        const hash = window.location.hash.slice(1) || '/';
        const [path, queryString] = hash.split('?');
        
        const decodedPath = decodeURIComponent(path);
        
        // 解析查询参数
        this.params = {};
        if (queryString) {
            queryString.split('&').forEach(param => {
                const [key, value] = param.split('=');
                this.params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            });
        }
        
        // 查找匹配的路由
        let matchedRoute = null;
        let routeParams = {};
        
        for (const route in this.routes) {
            const match = this.matchRoute(route, decodedPath);
            if (match) {
                matchedRoute = route;
                routeParams = match;
                break;
            }
        }
        
        this.params = { ...this.params, ...routeParams };
        
        if (matchedRoute && this.routes[matchedRoute]) {
            this.currentRoute = matchedRoute;
            this.routes[matchedRoute](this.params);
        } else if (this.routes['/']) {
            this.currentRoute = '/';
            this.routes['/'](this.params);
        }
        
        this.updateNavState(decodedPath);
        
        // 滚动到顶部
        window.scrollTo(0, 0);
    },

    /**
     * 匹配路由
     */
    matchRoute(route, path) {
        const routeParts = route.split('/').filter(Boolean);
        const pathParts = path.split('/').filter(Boolean);
        
        if (routeParts.length !== pathParts.length) {
            return null;
        }
        
        const params = {};
        
        for (let i = 0; i < routeParts.length; i++) {
            const routePart = routeParts[i];
            const pathPart = pathParts[i];
            
            if (routePart.startsWith(':')) {
                // 动态参数
                params[routePart.slice(1)] = pathPart;
            } else if (routePart !== pathPart) {
                return null;
            }
        }
        
        return params;
    },

    /**
     * 导航到指定路由
     */
    navigate(path, params = {}) {
        const pathParts = path.split('/');
        const encodedPath = pathParts.map(part => encodeURIComponent(part)).join('/');
        let url = '#' + encodedPath;
        
        const queryString = Object.entries(params)
            .filter(([_, value]) => value !== undefined && value !== null)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
        
        if (queryString) {
            url += '?' + queryString;
        }
        
        window.location.hash = url;
    },

    /**
     * 更新导航状态
     */
    updateNavState(path) {
        // 更新导航链接的active状态
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
            const route = link.dataset.route;
            link.classList.remove('active');
            
            if (route === 'home' && (path === '/' || path === '')) {
                link.classList.add('active');
            } else if (route && path.startsWith('/' + route)) {
                link.classList.add('active');
            }
        });
    },

    /**
     * 获取当前路由
     */
    getCurrentRoute() {
        return this.currentRoute;
    },

    /**
     * 获取路由参数
     */
    getParams() {
        return this.params;
    }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Router;
}
