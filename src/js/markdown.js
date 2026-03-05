/**
 * Markdown 解析器
 * 支持标题、段落、列表、代码块、引用、链接、图片、表格等
 */
const MarkdownParser = {
    languageMap: {
        'js': 'javascript',
        'ts': 'typescript',
        'py': 'python',
        'rb': 'ruby',
        'sh': 'bash',
        'shell': 'bash',
        'yml': 'yaml',
        'md': 'markdown',
        'c++': 'cpp',
        'h': 'c',
        'hpp': 'cpp',
        'hxx': 'cpp',
        'cxx': 'cpp',
        'cc': 'cpp',
        'cs': 'csharp',
        'docker': 'dockerfile',
        'dockerfile': 'dockerfile',
        'make': 'makefile',
        'mk': 'makefile',
        'pl': 'perl',
        'pm': 'perl',
        'rs': 'rust',
        'go': 'go',
        'golang': 'go',
        'kt': 'kotlin',
        'kts': 'kotlin',
        'swift': 'swift',
        'php': 'php',
        'ps1': 'powershell',
        'psm1': 'powershell',
        'vue': 'vue',
        'svelte': 'svelte',
        'jsx': 'javascript',
        'tsx': 'typescript',
        'json': 'json',
        'xml': 'xml',
        'html': 'html',
        'htm': 'html',
        'css': 'css',
        'scss': 'scss',
        'sass': 'sass',
        'less': 'less',
        'sql': 'sql',
        'db': 'sql',
        'sqlite': 'sql',
        'mysql': 'sql',
        'pgsql': 'sql',
        'postgresql': 'sql'
    },

    /**
     * 解析Markdown文本
     */
    parse(markdown) {
        if (!markdown) return '';
        
        let html = markdown;
        
        html = html.replace(/\r\n/g, '\n');
        
        const placeholders = [];
        const savePlaceholder = (content) => {
            const index = placeholders.length;
            placeholders.push(content);
            return `%%PLACEHOLDER_${index}%%`;
        };
        
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
            lang = this.languageMap[lang] || lang || 'plaintext';
            const escapedCode = this.escapeHtml(code.trim());
            const highlighted = this.highlightCode(escapedCode, lang);
            return savePlaceholder(`<pre><code class="language-${lang}">${highlighted}</code></pre>`);
        });
        
        html = html.replace(/^( {4}|\t)([\s\S]*?)(?=\n[^\s]|\n$|$)/gm, (match, indent, code) => {
            const escapedCode = this.escapeHtml(code.trim());
            return savePlaceholder(`<pre><code>${escapedCode}</code></pre>`);
        });
        
        html = html.replace(/\n?\|(.+)\|\n\|[-:\| ]+\|\n((?:\|.+\|\n?)+)/g, (match, headerRow, bodyRows) => {
            const headers = headerRow.split('|').map(h => h.trim()).filter(h => h);
            const rows = bodyRows.trim().split('\n').map(row => 
                row.split('|').map(cell => cell.trim()).filter(cell => cell)
            );
            
            let tableHtml = '<table>\n<thead>\n<tr>\n';
            headers.forEach(h => {
                tableHtml += `<th>${this.parseInlineElements(h)}</th>\n`;
            });
            tableHtml += '</tr>\n</thead>\n<tbody>\n';
            
            rows.forEach(row => {
                tableHtml += '<tr>\n';
                row.forEach(cell => {
                    tableHtml += `<td>${this.parseInlineElements(cell)}</td>\n`;
                });
                tableHtml += '</tr>\n';
            });
            tableHtml += '</tbody>\n</table>';
            
            return savePlaceholder(tableHtml);
        });
        
        html = this.parseHeaders(html);
        
        html = this.parseBlockquotes(html);
        
        html = this.parseLists(html);
        
        html = this.parseHorizontalRules(html);
        
        html = this.parseParagraphs(html);
        
        html = this.parseInlineElements(html);
        
        placeholders.forEach((content, index) => {
            html = html.replace(`%%PLACEHOLDER_${index}%%`, content);
        });
        
        return html;
    },

    highlightCode(code, lang) {
        const keywords = {
            javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'extends', 'import', 'export', 'from', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'true', 'false', 'null', 'undefined', 'typeof', 'instanceof', 'break', 'continue', 'switch', 'case', 'default', 'do'],
            typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'extends', 'import', 'export', 'from', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'true', 'false', 'null', 'undefined', 'interface', 'type', 'enum', 'implements', 'private', 'public', 'protected', 'readonly', 'abstract', 'namespace', 'declare', 'module', 'as', 'typeof', 'keyof', 'infer', 'never', 'unknown', 'any', 'void', 'string', 'number', 'boolean', 'object'],
            python: ['def', 'if', 'else', 'elif', 'for', 'while', 'return', 'import', 'from', 'as', 'try', 'except', 'finally', 'with', 'lambda', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is', 'pass', 'break', 'continue', 'global', 'nonlocal', 'assert', 'yield', 'raise', 'del', 'async', 'await'],
            java: ['public', 'private', 'protected', 'interface', 'extends', 'implements', 'return', 'if', 'else', 'for', 'while', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super', 'static', 'final', 'void', 'int', 'String', 'boolean', 'true', 'false', 'null', 'abstract', 'synchronized', 'volatile', 'transient', 'native', 'strictfp', 'enum', 'assert', 'package', 'import', 'throws', 'instanceof', 'byte', 'short', 'long', 'float', 'double', 'char'],
            cpp: ['int', 'float', 'double', 'char', 'void', 'bool', 'long', 'short', 'unsigned', 'signed', 'const', 'static', 'extern', 'register', 'volatile', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'goto', 'sizeof', 'typedef', 'struct', 'union', 'enum', 'class', 'public', 'private', 'protected', 'virtual', 'override', 'final', 'friend', 'inline', 'template', 'typename', 'namespace', 'using', 'new', 'delete', 'this', 'true', 'false', 'nullptr', 'try', 'catch', 'throw', 'include', 'define', 'ifdef', 'ifndef', 'endif', 'pragma', 'auto', 'constexpr', 'noexcept', 'mutable', 'explicit', 'operator'],
            c: ['int', 'float', 'double', 'char', 'void', 'bool', 'long', 'short', 'unsigned', 'signed', 'const', 'static', 'extern', 'register', 'volatile', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'goto', 'sizeof', 'typedef', 'struct', 'union', 'enum', 'include', 'define', 'ifdef', 'ifndef', 'endif', 'pragma', 'NULL', 'true', 'false'],
            csharp: ['public', 'private', 'protected', 'internal', 'static', 'readonly', 'const', 'void', 'int', 'float', 'double', 'char', 'bool', 'string', 'decimal', 'long', 'short', 'byte', 'object', 'var', 'dynamic', 'return', 'if', 'else', 'for', 'while', 'do', 'foreach', 'in', 'switch', 'case', 'default', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'base', 'true', 'false', 'null', 'using', 'namespace', 'class', 'interface', 'struct', 'enum', 'abstract', 'virtual', 'override', 'sealed', 'partial', 'async', 'await', 'get', 'set', 'value', 'where', 'select', 'from', 'join', 'group', 'orderby', 'let', 'into'],
            go: ['package', 'import', 'func', 'return', 'var', 'const', 'type', 'struct', 'interface', 'map', 'chan', 'if', 'else', 'for', 'range', 'switch', 'case', 'default', 'break', 'continue', 'goto', 'fallthrough', 'defer', 'go', 'select', 'true', 'false', 'nil', 'int', 'int8', 'int16', 'int32', 'int64', 'uint', 'uint8', 'uint16', 'uint32', 'uint64', 'float32', 'float64', 'complex64', 'complex128', 'bool', 'string', 'byte', 'rune', 'error', 'make', 'new', 'len', 'cap', 'append', 'copy', 'delete', 'close', 'panic', 'recover'],
            rust: ['fn', 'let', 'mut', 'const', 'static', 'pub', 'mod', 'use', 'crate', 'self', 'super', 'struct', 'enum', 'trait', 'impl', 'type', 'where', 'for', 'loop', 'while', 'if', 'else', 'match', 'return', 'break', 'continue', 'move', 'ref', 'as', 'in', 'unsafe', 'extern', 'true', 'false', 'Self', 'static', 'dyn', 'async', 'await', 'box', 'macro_rules', 'i8', 'i16', 'i32', 'i64', 'i128', 'isize', 'u8', 'u16', 'u32', 'u64', 'u128', 'usize', 'f32', 'f64', 'bool', 'char', 'str', 'String', 'Vec', 'Option', 'Result', 'Some', 'None', 'Ok', 'Err'],
            php: ['function', 'return', 'if', 'else', 'elseif', 'for', 'foreach', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new', 'class', 'interface', 'trait', 'extends', 'implements', 'public', 'private', 'protected', 'static', 'final', 'abstract', 'const', 'var', 'global', 'echo', 'print', 'isset', 'unset', 'empty', 'include', 'require', 'include_once', 'require_once', 'true', 'false', 'null', 'TRUE', 'FALSE', 'NULL', 'array', 'object', 'string', 'int', 'float', 'bool', 'void', 'mixed', 'callable', 'iterable', 'namespace', 'use', 'as'],
            ruby: ['def', 'end', 'if', 'else', 'elsif', 'unless', 'case', 'when', 'while', 'until', 'for', 'do', 'begin', 'rescue', 'ensure', 'raise', 'return', 'yield', 'class', 'module', 'require', 'require_relative', 'include', 'extend', 'attr_reader', 'attr_writer', 'attr_accessor', 'public', 'private', 'protected', 'self', 'true', 'false', 'nil', 'and', 'or', 'not', 'in', 'then', 'alias', 'defined', 'super', 'lambda', 'proc', 'puts', 'print', 'p'],
            swift: ['func', 'var', 'let', 'const', 'if', 'else', 'guard', 'switch', 'case', 'default', 'for', 'while', 'repeat', 'do', 'try', 'catch', 'throw', 'throws', 'rethrows', 'return', 'break', 'continue', 'fallthrough', 'import', 'class', 'struct', 'enum', 'protocol', 'extension', 'init', 'deinit', 'subscript', 'typealias', 'associatedtype', 'self', 'Self', 'super', 'true', 'false', 'nil', 'in', 'where', 'as', 'is', 'private', 'fileprivate', 'internal', 'public', 'open', 'static', 'final', 'override', 'mutating', 'nonmutating', 'lazy', 'weak', 'unowned', 'async', 'await', 'actor', 'some', 'any'],
            kotlin: ['fun', 'val', 'var', 'if', 'else', 'when', 'for', 'while', 'do', 'try', 'catch', 'finally', 'throw', 'return', 'break', 'continue', 'class', 'interface', 'object', 'trait', 'companion', 'package', 'import', 'as', 'typealias', 'public', 'private', 'protected', 'internal', 'open', 'final', 'abstract', 'override', 'lateinit', 'lazy', 'by', 'in', 'out', 'is', '!is', 'true', 'false', 'null', 'this', 'super', 'constructor', 'init', 'get', 'set', 'field', 'where', 'suspend', 'data', 'sealed', 'enum', 'annotation', 'inline', 'noinline', 'crossinline', 'reified', 'external', 'tailrec', 'operator', 'infix', 'const', 'vararg'],
            sql: ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL', 'AS', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'FULL', 'ON', 'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'OFFSET', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'DATABASE', 'INDEX', 'VIEW', 'DROP', 'ALTER', 'ADD', 'COLUMN', 'CONSTRAINT', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE', 'DEFAULT', 'CHECK', 'UNION', 'ALL', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'IF', 'EXISTS', 'CAST', 'CONVERT', 'COALESCE', 'NULLIF', 'WITH', 'RECURSIVE', 'select', 'from', 'where', 'and', 'or', 'not', 'in', 'like', 'between', 'is', 'null', 'as', 'join', 'inner', 'left', 'right', 'outer', 'full', 'on', 'group', 'by', 'having', 'order', 'asc', 'desc', 'limit', 'offset', 'insert', 'into', 'values', 'update', 'set', 'delete', 'create', 'table', 'database', 'index', 'view', 'drop', 'alter', 'add', 'column', 'primary', 'key', 'foreign', 'unique', 'distinct', 'count', 'sum', 'avg', 'min', 'max', 'case', 'when', 'then', 'else', 'end', 'if', 'exists', 'with'],
            css: ['@import', '@media', '@keyframes', '@font-face', '@supports', '@layer', '@container', '@charset', '@namespace', '@page', '@property', '@scope', '@starting-style'],
            bash: ['if', 'then', 'else', 'elif', 'fi', 'for', 'do', 'done', 'while', 'until', 'case', 'esac', 'function', 'echo', 'cd', 'ls', 'mkdir', 'rm', 'cp', 'mv', 'cat', 'grep', 'find', 'chmod', 'sudo', 'source', 'export', 'alias', 'unset', 'read', 'printf', 'test', 'true', 'false', 'exit', 'return', 'break', 'continue', 'shift', 'set', 'unset', 'trap', 'wait', 'exec', 'eval', 'let', 'declare', 'typeset', 'local', 'readonly', 'pushd', 'popd', 'dirs'],
            shell: ['if', 'then', 'else', 'elif', 'fi', 'for', 'do', 'done', 'while', 'until', 'case', 'esac', 'function', 'echo', 'cd', 'ls', 'mkdir', 'rm', 'cp', 'mv', 'cat', 'grep', 'find', 'chmod', 'sudo', 'source', 'export', 'alias', 'unset', 'read', 'printf', 'test', 'true', 'false', 'exit', 'return', 'break', 'continue', 'shift', 'set', 'unset', 'trap', 'wait', 'exec', 'eval', 'let', 'declare', 'typeset', 'local', 'readonly'],
            json: [],
            xml: [],
            html: [],
            yaml: ['true', 'false', 'null', 'yes', 'no', 'on', 'off', 'True', 'False', 'TRUE', 'FALSE', 'Yes', 'No', 'YES', 'NO', 'On', 'Off', 'ON', 'OFF', '~'],
            markdown: [],
            dockerfile: ['FROM', 'RUN', 'CMD', 'LABEL', 'MAINTAINER', 'EXPOSE', 'ENV', 'ADD', 'COPY', 'ENTRYPOINT', 'VOLUME', 'USER', 'WORKDIR', 'ARG', 'ONBUILD', 'STOPSIGNAL', 'HEALTHCHECK', 'SHELL', 'from', 'run', 'cmd', 'label', 'maintainer', 'expose', 'env', 'add', 'copy', 'entrypoint', 'volume', 'user', 'workdir', 'arg', 'onbuild', 'stopsignal', 'healthcheck', 'shell'],
            vue: ['v-if', 'v-else', 'v-else-if', 'v-for', 'v-model', 'v-bind', 'v-on', 'v-show', 'v-slot', 'v-text', 'v-html', 'v-pre', 'v-cloak', 'v-once', 'v-memo', 'setup', 'defineProps', 'defineEmits', 'defineExpose', 'defineComponent', 'ref', 'reactive', 'computed', 'watch', 'watchEffect', 'onMounted', 'onUpdated', 'onUnmounted', 'onBeforeMount', 'onBeforeUpdate', 'onBeforeUnmount', 'onErrorCaptured', 'onRenderTracked', 'onRenderTriggered', 'provide', 'inject', 'toRef', 'toRefs', 'unref', 'isRef', 'shallowRef', 'shallowReactive', 'readonly', 'shallowReadonly', 'markRaw', 'toRaw'],
            react: ['useState', 'useEffect', 'useContext', 'useReducer', 'useCallback', 'useMemo', 'useRef', 'useImperativeHandle', 'useLayoutEffect', 'useDebugValue', 'useDeferredValue', 'useTransition', 'useId', 'useSyncExternalStore', 'useInsertionEffect', 'createContext', 'createElement', 'cloneElement', 'isValidElement', 'Fragment', 'Component', 'PureComponent', 'memo', 'forwardRef', 'lazy', 'Suspense', 'StrictMode', 'Profiler', 'Children', 'defaultProps', 'propTypes', 'displayName']
        };

        const langKeywords = keywords[lang] || [];
        
        const placeholder = '%%HLJS_';
        const placeholders = [];
        
        const savePlaceholder = (content) => {
            const index = placeholders.length;
            placeholders.push(content);
            return `${placeholder}${index}%%`;
        };
        
        code = code.replace(/(&quot;|&#039;|`)(?:(?!\1)[^]|&[^;]+;)*?\1/g, (match) => {
            return savePlaceholder(`<span class="hljs-string">${match}</span>`);
        });
        
        code = code.replace(/\b(\d+\.?\d*)\b/g, (match) => {
            return savePlaceholder(`<span class="hljs-number">${match}</span>`);
        });
        
        if (langKeywords.length > 0) {
            const keywordRegex = new RegExp(`\\b(${langKeywords.join('|')})\\b`, 'g');
            code = code.replace(keywordRegex, (match) => {
                return savePlaceholder(`<span class="hljs-keyword">${match}</span>`);
            });
        }
        
        code = code.replace(/(\/\/.*$)/gm, (match) => {
            return savePlaceholder(`<span class="hljs-comment">${match}</span>`);
        });
        code = code.replace(/(#.*$)/gm, (match) => {
            return savePlaceholder(`<span class="hljs-comment">${match}</span>`);
        });
        code = code.replace(/(\/\*[\s\S]*?\*\/)/g, (match) => {
            return savePlaceholder(`<span class="hljs-comment">${match}</span>`);
        });
        
        code = code.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, (match, name) => {
            return savePlaceholder(`<span class="hljs-function">${name}</span>`);
        });
        
        placeholders.forEach((content, index) => {
            code = code.replace(`${placeholder}${index}%%`, content);
        });
        
        return code;
    },

    parseHeaders(text) {
        const generateId = (headerText) => {
            let cleanText = headerText.replace(/`([^`]+)`/g, '$1');
            return cleanText.toLowerCase()
                .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
                .replace(/^-+|-+$/g, '');
        };
        
        return text
            .replace(/^###### (.+)$/gm, (match, content) => `<h6 id="${generateId(content)}">${content}</h6>`)
            .replace(/^##### (.+)$/gm, (match, content) => `<h5 id="${generateId(content)}">${content}</h5>`)
            .replace(/^#### (.+)$/gm, (match, content) => `<h4 id="${generateId(content)}">${content}</h4>`)
            .replace(/^### (.+)$/gm, (match, content) => `<h3 id="${generateId(content)}">${content}</h3>`)
            .replace(/^## (.+)$/gm, (match, content) => `<h2 id="${generateId(content)}">${content}</h2>`)
            .replace(/^# (.+)$/gm, (match, content) => `<h1 id="${generateId(content)}">${content}</h1>`);
    },

    /**
     * 解析引用块
     */
    parseBlockquotes(text) {
        return text.replace(/^(>+\s*.+\n?)+/gm, (match) => {
            const lines = match.trim().split('\n');
            let html = '<blockquote>';
            lines.forEach(line => {
                const content = line.replace(/^>+\s*/, '');
                html += this.parseInlineElements(content) + '<br>';
            });
            html = html.replace(/<br>$/, '') + '</blockquote>';
            return html;
        });
    },

    /**
     * 解析列表
     */
    parseLists(text) {
        text = text.replace(/^(\s*)([*+-])\s+(.+)$/gm, '<li data-type="ul" data-indent="$1">$3</li>');
        text = text.replace(/(<li data-type="ul"[^>]*>.*?<\/li>\n?)+/g, (match) => {
            const items = match.trim();
            return '<ul>' + items.replace(/ data-type="ul"[^>]*>/g, '>').replace(/\n/g, '') + '</ul>\n';
        });
        
        text = text.replace(/^(\s*)\d+\.\s+(.+)$/gm, '<li data-type="ol" data-indent="$1">$2</li>');
        text = text.replace(/(<li data-type="ol"[^>]*>.*?<\/li>\n?)+/g, (match) => {
            const items = match.trim();
            return '<ol>' + items.replace(/ data-type="ol"[^>]*>/g, '>').replace(/\n/g, '') + '</ol>\n';
        });
        
        return text;
    },

    /**
     * 解析水平线
     */
    parseHorizontalRules(text) {
        return text.replace(/^[-*_]{3,}$/gm, '<hr>');
    },

    /**
     * 解析段落
     */
    parseParagraphs(text) {
        const blocks = text.split(/\n\n+/);
        
        return blocks.map(block => {
            block = block.trim();
            
            if (!block) return '';
            
            if (block.match(/^<(h[1-6]|ul|ol|li|blockquote|pre|table|hr|%%PLACEHOLDER)/)) {
                return block;
            }
            
            if (block.match(/<\/(h[1-6]|ul|ol|blockquote|pre|table)>$/)) {
                return block;
            }
            
            return `<p>${block}</p>`;
        }).join('\n');
    },

    /**
     * 解析行内元素
     */
    parseInlineElements(text) {
        if (text.includes('%%PLACEHOLDER_')) {
            const parts = text.split(/(%%PLACEHOLDER_\d+%%)/);
            return parts.map(part => {
                if (part.match(/%%PLACEHOLDER_\d+%%/)) {
                    return part;
                }
                return this.parseInlineElementsInner(part);
            }).join('');
        }
        return this.parseInlineElementsInner(text);
    },

    parseInlineElementsInner(text) {
        text = text.replace(/`([^`]+)`/g, (match, code) => {
            return `<code>${this.escapeHtml(code)}</code>`;
        });
        
        text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
        
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
        
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
        
        text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        text = text.replace(/_([^_]+)_/g, '<em>$1</em>');
        
        text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');
        
        text = text.replace(/\n/g, '<br>');
        
        return text;
    },

    /**
     * HTML转义
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    },

    /**
     * 提取目录
     */
    extractToc(markdown) {
        const toc = [];
        const headerRegex = /^(#{1,6})\s+(.+)$/gm;
        let match;
        
        while ((match = headerRegex.exec(markdown)) !== null) {
            const level = match[1].length;
            let text = match[2].trim();
            
            text = text.replace(/`([^`]+)`/g, '$1');
            
            const id = text.toLowerCase()
                .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
                .replace(/^-+|-+$/g, '');
            
            toc.push({
                level,
                text,
                id
            });
        }
        
        return this.buildTocTree(toc);
    },

    buildTocTree(flatToc) {
        if (flatToc.length === 0) return [];
        
        const root = { children: [] };
        const stack = [root];
        
        flatToc.forEach(item => {
            const node = { ...item, children: [] };
            
            while (stack.length > 1 && stack[stack.length - 1].level >= item.level) {
                stack.pop();
            }
            
            stack[stack.length - 1].children.push(node);
            stack.push(node);
        });
        
        return root.children;
    },

    /**
     * 提取纯文本摘要
     */
    extractExcerpt(markdown, maxLength = 200) {
        // 移除代码块
        let text = markdown.replace(/```[\s\S]*?```/g, '');
        // 移除行内代码
        text = text.replace(/`[^`]+`/g, '');
        // 移除链接
        text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        // 移除图片
        text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, '');
        // 移除标题标记
        text = text.replace(/^#+\s+/gm, '');
        // 移除其他Markdown语法
        text = text.replace(/[*_~`#]/g, '');
        // 合并空白
        text = text.replace(/\s+/g, ' ').trim();
        
        return Utils.truncateText(text, maxLength);
    }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarkdownParser;
}
