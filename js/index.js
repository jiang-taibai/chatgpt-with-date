// ==UserScript==
// @name            ChatGPT with Date
// @namespace       https://github.com/jiang-taibai/chatgpt-with-date
// @version         1.2.0
// @description     Tampermonkey plugin for displaying ChatGPT historical and real-time conversation time. 显示 ChatGPT 历史对话时间 与 实时对话时间的 Tampermonkey 插件。
// @author          CoderJiang
// @license         MIT
// @match           https://chat.openai.com/*
// @icon            https://cdn.coderjiang.com/project/chatgpt-with-date/logo.svg
// @grant           GM_xmlhttpRequest
// @grant           GM_registerMenuCommand
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           unsafeWindow
// @run-at          document-end
// ==/UserScript==

(function () {
    'use strict';

    class SystemConfig {
        static Common = {
            ApplicationName: 'ChatGPT with Date',
        }
        static Logger = {
            TimeFormatTemplate: "{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}.{ms}",
        }
        static TimeRender = {
            Interval: 1000,
            TimeClassName: 'chatgpt-time',
            BatchSize: 100,
            BatchTimeout: 200,
            RenderRetryCount: 3,
            RenderModes: ['AfterRoleLeft', 'AfterRoleRight', 'BelowRole'],
            RenderModeStyles: {
                AfterRoleLeft: `
                    .chatgpt-time {
                        font-weight: normal;
                    }
                `,
                AfterRoleRight: `
                    .chatgpt-time {
                        font-weight: normal;
                        float: right;
                    }
                `,
                BelowRole: `
                    .chatgpt-time {
                        font-weight: normal;
                        display: block;
                    }
                `,
            },
            TimeTagTemplates: [
                // 默认：2023-10-15 12:01:00
                `<span style="margin-left: 4px; color: #ababab; font-size: 0.9em;">{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}</span>`,
                // 美国：Oct 15, 2023 12:01 PM
                `<span style="margin-left: 4px; color: #ababab; font-size: 0.9em;">{MM#shortname@en} {dd}, {yyyy} {HH#12}:{mm} {HH#tag}</span>`,
                // 英国：01/01/2024 12:01
                `<span style="margin-left: 4px; color: #ababab; font-size: 0.9em;">{dd}/{MM}/{yyyy} {HH}:{mm}</span>`,
                // 日本：2023年10月15日 12:01
                `<span style="margin-left: 4px; color: #ababab; font-size: 0.9em;">{yyyy}年{MM}月{dd}日 {HH}:{mm}</span>`,
                // 显示毫秒数：2023-10-15 12:01:00.000
                `<span style="margin-left: 4px; color: #ababab; font-size: 0.9em;">{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}.{ms}</span>`,
                // 复杂模板
                `<span style="margin-left: 4px; background: #2B2B2b; border-radius: 8px; padding: 1px 10px; color: #717171; font-size: 0.9em;">{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}</span>`,
                `<span style="margin-left: 4px; background: #d7d7d7; border-radius: 8px; padding: 1px 10px; color: #2b2b2b; font-size: 0.9em;">{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}</span>`,
                `<span style="margin-left: 4px; color: #E0E0E0; font-size: 0.9em;"><span style="background: #333; padding: 1px 4px 1px 10px; display: inline-block; border-radius: 8px 0 0 8px;">{yyyy}-{MM}-{dd}</span><span style="background: #606060; padding: 1px 10px 1px 4px; display: inline-block; border-radius: 0 8px 8px 0;">{HH}:{mm}:{ss}</span></span>`,
                `<span style="margin-left: 4px; color: #E0E0E0; font-size: 0.9em;"><span style="background: #848484; padding: 1px 4px 1px 10px; display: inline-block; border-radius: 8px 0 0 8px;">{yyyy}-{MM}-{dd}</span><span style="background: #a6a6a6; padding: 1px 10px 1px 4px; display: inline-block; border-radius: 0 8px 8px 0;">{HH}:{mm}:{ss}</span></span>`,
            ],
            BasicStyleKey: 'time-render',
            AdditionalStyleKey: 'time-render-advanced',
            AdditionalScriptKey: 'time-render-advanced',
        }
        static ConfigPanel = {
            AppID: 'CWD-Configuration-Panel',
            Icon: {
                Close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path d="M649.179 512l212.839-212.84c37.881-37.881 37.881-99.298 0-137.179s-99.298-37.881-137.179 0L512 374.821l-212.839-212.84c-37.881-37.881-99.298-37.881-137.179 0s-37.881 99.298 0 137.179L374.821 512 161.982 724.84c-37.881 37.881-37.881 99.297 0 137.179 18.94 18.94 43.765 28.41 68.589 28.41 24.825 0 49.649-9.47 68.589-28.41L512 649.179l212.839 212.84c18.94 18.94 43.765 28.41 68.589 28.41s49.649-9.47 68.59-28.41c37.881-37.882 37.881-99.298 0-137.179L649.179 512z"></path></svg>',
            },
            StyleKey: 'config-panel',
        }
        // GM 存储的键
        static GMStorageKey = {
            UserConfig: 'ChatGPTWithDate-UserConfig',
            ConfigPanel: {
                Position: 'ChatGPTWithDate-ConfigPanel-Position', Size: 'ChatGPTWithDate-ConfigPanel-Size',
            },
        }
    }

    class Utils {

        /**
         * 按照模板格式化日期时间
         *
         * @param date      Date 对象
         * @param template  模板，例如 '{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}'
         * @returns string  格式化后的日期时间字符串
         */
        static formatDateTimeByDate(date, template) {
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const week = date.getDay();
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const seconds = date.getSeconds();
            const milliseconds = date.getMilliseconds();
            const week2zh = ['', '一', '二', '三', '四', '五', '六', '日']
            const week2enFullName = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            const week2enShortName = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            const month2zh = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']
            const month2enFullName = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            const month2enShortName = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

            const getValueByKey = (key) => {
                switch (key) {
                    case '{yyyy}':
                        return year.toString();
                    case '{yy}':
                        return (year % 100).toString().padStart(2, '0');

                    case '{MM}':
                    case '{MM:02}':
                        return month.toString().padStart(2, '0');
                    case '{MM:01}':
                        return month.toString();
                    case '{MM#name@zh}':
                        return month2zh[month];
                    case '{MM#name@en}':
                    case '{MM#fullname@en}':
                        return month2enFullName[month];
                    case '{MM#shortname@en}':
                        return month2enShortName[month];

                    case '{dd}':
                    case '{dd:02}':
                        return day.toString().padStart(2, '0');
                    case '{dd:01}':
                        return day.toString();

                    case '{HH}':
                    case '{HH:02}':
                    case '{HH#24}':
                    case '{HH#24:02}':
                        return hours.toString().padStart(2, '0');
                    case '{HH:01}':
                    case '{HH#24:01}':
                        return hours.toString();
                    case '{HH#12}':
                    case '{HH#12:02}':
                        return (hours % 12 || 12).toString().padStart(2, '0');
                    case '{HH#12:01}':
                        return (hours % 12 || 12).toString();
                    case '{HH#tag}':
                    case '{HH#tag@en}':
                        return hours >= 12 ? 'PM' : 'AM';
                    case '{HH#tag@zh}':
                        return hours >= 12 ? '下午' : '上午';

                    case '{mm}':
                    case '{mm:02}':
                        return minutes.toString().padStart(2, '0');
                    case '{mm:01}':
                        return minutes.toString();

                    case '{ss}':
                    case '{ss:02}':
                        return seconds.toString().padStart(2, '0');
                    case '{ss:01}':
                        return seconds.toString();

                    case '{ms}':
                        return milliseconds.toString().padStart(3, '0');


                    case '{week}':
                    case '{week:02}':
                        return week.toString().padStart(2, '0');
                    case '{week:01}':
                        return week.toString();
                    case '{week#name@zh}':
                        return week2zh[week];
                    case '{week#name@en}':
                    case '{week#fullname@en}':
                        return week2enFullName[week];
                    case '{week#shortname@en}':
                        return week2enShortName[week];
                    default:
                        return key;
                }
            }
            return template.replace(/\{[^}]+\}/g, match => getValueByKey(match));
        }

        /**
         * 深度合并两个对象，将源对象的属性合并到目标对象中，如果属性值为对象则递归合并。
         *
         * @param target    目标对象
         * @param source    源对象
         * @returns {*}
         */
        static deepMerge(target, source) {
            if (!source) return target
            // 遍历源对象的所有属性
            Object.keys(source).forEach(key => {
                if (source[key] && typeof source[key] === 'object') {
                    // 如果源属性是一个对象且目标中也存在同名属性且为对象，则递归合并
                    if (target[key] && typeof target[key] === 'object') {
                        Utils.deepMerge(target[key], source[key]);
                    } else {
                        // 否则直接复制（对于源中的对象，需要进行深拷贝）
                        target[key] = JSON.parse(JSON.stringify(source[key]));
                    }
                } else {
                    // 非对象属性直接复制
                    target[key] = source[key];
                }
            });
            return target;
        }

        /**
         * 检查依赖关系图（有向图）是否有循环依赖，如果没有就返回一个先后顺序（即按照此顺序实例化不会出现依赖项为空的情况）。
         * 给定依赖关系图为此结构[{node:'ComponentClass0', dependencies:['ComponentClass2', 'ComponentClass3']}, ...]
         * @param dependencyGraph   依赖关系图
         * @returns {*[]}
         */
        static dependencyAnalysis(dependencyGraph) {
            // 创建一个映射每个节点到其入度的对象
            const inDegree = {};
            const graph = {};
            const order = [];

            // 初始化图和入度表
            dependencyGraph.forEach(item => {
                const {node, dependencies} = item;
                if (!graph[node]) {
                    graph[node] = [];
                    inDegree[node] = 0;
                }
                dependencies.forEach(dependentNode => {
                    if (!graph[dependentNode]) {
                        graph[dependentNode] = [];
                        inDegree[dependentNode] = 0;
                    }
                    graph[dependentNode].push(node);
                    inDegree[node]++;
                });
            });

            // 将所有入度为0的节点加入到队列中
            const queue = [];
            for (const node in inDegree) {
                if (inDegree[node] === 0) {
                    queue.push(node);
                }
            }

            // 处理队列中的节点
            while (queue.length) {
                const current = queue.shift();
                order.push(current);
                graph[current].forEach(neighbour => {
                    inDegree[neighbour]--;
                    if (inDegree[neighbour] === 0) {
                        queue.push(neighbour);
                    }
                });
            }

            // 如果排序后的节点数量不等于图中的节点数量，说明存在循环依赖
            if (order.length !== Object.keys(graph).length) {
                // 找到循环依赖的节点
                const cycleNodes = [];
                for (const node in inDegree) {
                    if (inDegree[node] !== 0) {
                        cycleNodes.push(node);
                    }
                }
                throw new Error("存在循环依赖的节点：" + cycleNodes.join(","));
            }
            return order;
        }

    }

    class Logger {
        static EnableLog = true
        static EnableDebug = false
        static EnableInfo = true
        static EnableWarn = true
        static EnableError = true
        static EnableTable = true

        static prefix(type = 'INFO') {
            const timeFormat = Utils.formatDateTimeByDate(new Date(), SystemConfig.Logger.TimeFormatTemplate);
            return `[${timeFormat}] - [${SystemConfig.Common.ApplicationName}] - [${type}]`
        }

        static log(...args) {
            if (Logger.EnableLog) {
                console.log(Logger.prefix('INFO'), ...args);
            }
        }

        static debug(...args) {
            if (Logger.EnableDebug) {
                console.debug(Logger.prefix('DEBUG'), ...args);
            }
        }

        static info(...args) {
            if (Logger.EnableInfo) {
                console.info(Logger.prefix('INFO'), ...args);
            }
        }

        static warn(...args) {
            if (Logger.EnableWarn) {
                console.warn(Logger.prefix('WARN'), ...args);
            }
        }

        static error(...args) {
            if (Logger.EnableError) {
                console.error(Logger.prefix('ERROR'), ...args);
            }
        }

        static table(...args) {
            if (Logger.EnableTable) {
                console.table(...args);
            }
        }
    }

    class MessageBO {
        /**
         * 消息业务对象
         *
         * @param messageId 消息ID，为消息元素的data-message-id属性值
         * @param role      角色
         *                  system:     表示系统消息，并不属于聊天内容。    从 API 获取
         *                  tool:       也表示系统消息。                 从 API 获取
         *                  assistant:  表示 ChatGPT 回答的消息。        从 API 获取
         *                  user:       表示用户输入的消息。              从 API 获取
         *                  You:        表示用户输入的消息。              从页面实时获取
         *                  ChatGPT:    表示 ChatGPT 回答的消息。        从页面实时获取
         * @param timestamp 时间戳，浮点数或整数类型，单位毫秒，例如 1714398759.26881、1714398759
         * @param message   消息内容
         */
        constructor(messageId, role, timestamp, message = '') {
            this.messageId = messageId;
            this.role = role;
            this.timestamp = timestamp;
            this.message = message;
        }
    }

    class MessageElementBO {
        /**
         * 消息元素业务对象
         *
         * @param rootEle       消息的根元素，并非是总根元素，而是 roleEle 和 messageEle 的最近公共祖先元素
         * @param roleEle       角色元素，例如 <div>ChatGPT</div>
         * @param messageEle    消息元素，包含 data-message-id 属性
         *                      例如 <div data-message-id="123456">你好</div>
         */
        constructor(rootEle, roleEle, messageEle) {
            this.rootEle = rootEle;
            this.roleEle = roleEle;
            this.messageEle = messageEle;
        }
    }

    class Component {

        constructor() {
            this.dependencies = []
            Object.defineProperty(this, 'initDependencies', {
                value: function () {
                    this.dependencies.forEach(dependency => {
                        this[dependency.field] = ComponentLocator.get(dependency.clazz)
                    })
                }, writable: false,        // 防止方法被修改
                configurable: false     // 防止属性被重新定义或删除
            });
        }

        init() {
        }
    }

    class ComponentLocator {
        /**
         * 组件注册器，用于注册和获取组件
         */
        static components = {};

        /**
         * 注册组件，要求组件为 Component 的子类
         *
         * @param clazz     Component 的子类
         * @param instance  Component 的子类的实例化对象，必顧是 clazz 的实例
         * @returns obj 返回注册的实例化对象
         */
        static register(clazz, instance) {
            if (!(instance instanceof Component)) {
                throw new Error(`实例化对象 ${instance} 不是 Component 的实例。`);
            }
            if (!(instance instanceof clazz)) {
                throw new Error(`实例化对象 ${instance} 不是 ${clazz} 的实例。`);
            }
            if (ComponentLocator.components[clazz.name]) {
                throw new Error(`组件 ${clazz.name} 已经注册过了。`);
            }
            ComponentLocator.components[clazz.name] = instance;
            return instance
        }

        /**
         * 获取组件，用于完成组件之间的依赖注入
         *
         * @param clazz    Component 的子类
         * @returns {*}    返回注册的实例化对象
         */
        static get(clazz) {
            if (!ComponentLocator.components[clazz.name]) {
                throw new Error(`组件 ${clazz.name} 未注册。`);
            }
            return ComponentLocator.components[clazz.name];
        }
    }

    class UserConfig extends Component {

        init() {
            this.timeRender = {
                mode: 'AfterRoleLeft',
                format: SystemConfig.TimeRender.TimeTagTemplates[0],
                advanced: {
                    enable: false,
                    htmlTextContent: `<div class="text-tag-box">
    <span class="date">{yyyy}-{MM}-{dd}</span>
    <span class="time">{HH}:{mm}:{ss}</span>
</div>`,
                    styleTextContent: `.text-tag-box {
    border-radius: 8px;
    color: #E0E0E0;
    font-size: 0.9em;
    overflow: hidden;
    display: inline-block;
}

.text-tag-box .date {
    background: #333;
    float: left;
    padding: 2px 8px 2px 10px;
    display: inline-block;
    transition: width 0.5s ease-out;
    white-space: nowrap;
}

.text-tag-box .time {
    background: #606060;
    float: left;
    padding: 2px 10px 2px 8px;
    display: inline-block;
}`,
                    scriptTextContent: `(() => {
    const getNewWidth = (targetNode, text) => {
        // 创建一个临时元素来测量文本宽度
        const temp = targetNode.cloneNode();
        temp.style.width = 'auto'; // 自动宽度
        temp.style.visibility = 'hidden'; // 隐藏元素，不影响布局
        temp.style.position = 'absolute'; // 避免影响其他元素
        temp.style.whiteSpace = 'nowrap'; // 无换行
        temp.innerText = text;
        document.body.appendChild(temp);
        const newWidth = temp.offsetWidth;
        document.body.removeChild(temp);
        return newWidth;
    }

    window.afterCreateTimeTag = (messageId, timeTagNode) => {
        const dateNode = timeTagNode.querySelector('.date');
        const date = dateNode.innerText;
        const originalWidth = getNewWidth(dateNode, date);
        const paddingWidth = 18;
        dateNode.style.width = (originalWidth  + paddingWidth) + 'px';

        timeTagNode.addEventListener('mouseover', () => {
            const now = new Date();
            const offset = now - new Date(date);
            const days = Math.floor(offset / (24 * 60 * 60 * 1000));
            let text = '';
            if (days < 1)
                text = '今天';
            else if (days < 2)
                text = '昨天';
            else if (days < 3)
                text = '前天';
            else if (days < 7)
                text = days + '天前';
            else if (days < 30)
                text = Math.floor(days / 7) + '周前';
            else if (days < 365)
                text = Math.floor(days / 30) + '个月前';
            else
                text = Math.floor(days / 365) + '年前';
            dateNode.innerText = text;
            dateNode.style.width = (getNewWidth(dateNode, text)  + paddingWidth) + 'px';
        });

        // 鼠标移出 timeTagNode 时恢复 dateNode 的内容为原来的日期
        timeTagNode.addEventListener('mouseout', () => {
            dateNode.innerText = date;
            dateNode.style.width = (originalWidth  + paddingWidth) + 'px';
        });
    }
})()`,
                }
            }
            const userConfig = this.load()
            if (userConfig) {
                Utils.deepMerge(this.timeRender, userConfig.timeRender)
            }
        }

        save() {
            GM_setValue(SystemConfig.GMStorageKey.UserConfig, {
                timeRender: this.timeRender
            })
        }

        load() {
            return GM_getValue(SystemConfig.GMStorageKey.UserConfig)
        }

        /**
         * 更新配置并保存
         * @param newConfig 新的配置
         */
        update(newConfig) {
            Utils.deepMerge(this.timeRender, newConfig.timeRender)
            this.save()
        }
    }

    class StyleService extends Component {
        init() {
            this.styles = new Map()
        }

        /**
         * 更新样式
         *
         * @param key           样式的 key，字符串对象
         * @param styleContent  样式，字符串对象
         */
        updateStyle(key, styleContent) {
            this.removeStyle(key)
            const styleNode = document.createElement('style')
            styleNode.textContent = styleContent
            document.head.appendChild(styleNode)
            this.styles.set(key, styleNode)
        }

        /**
         * 移除样式
         *
         * @param key   样式的 key，字符串对象
         */
        removeStyle(key) {
            let styleNode = this.styles.get(key)
            if (styleNode) {
                document.head.removeChild(styleNode)
                this.styles.delete(key)
            }
        }
    }

    class JavaScriptService extends Component {
        init() {
            this.javaScriptNodes = new Map()
        }

        updateJavaScript(key, textContent) {
            this.removeJavaScript(key)
            const scriptNode = document.createElement('script')
            scriptNode.type = 'text/javascript'
            scriptNode.textContent = textContent
            document.body.appendChild(scriptNode)
            this.javaScriptNodes.set(key, scriptNode)
        }

        removeJavaScript(key) {
            let scriptNode = this.javaScriptNodes.get(key)
            if (scriptNode) {
                document.body.removeChild(scriptNode)
                this.javaScriptNodes.delete(key)
            }
        }
    }

    class MessageService extends Component {
        init() {
            this.messages = new Map();
        }

        /**
         * 解析消息元素，获取消息的所有内容。由于网页中不存在时间戳，所以时间戳使用当前时间代替。
         * 调用该方法只需要消息元素，一般用于从页面实时监测获取到的消息。
         *
         * @param messageDiv    消息元素，包含 data-message-id 属性 的 div 元素
         * @returns {MessageBO|undefined}   返回消息业务对象，如果消息元素不存在则返回 undefined
         */
        parseMessageDiv(messageDiv) {
            if (!messageDiv) {
                return;
            }
            const messageId = messageDiv.getAttribute('data-message-id');
            const messageElementBO = this.getMessageElement(messageId)
            if (!messageElementBO) {
                return;
            }
            let timestamp = new Date().getTime();
            const role = messageElementBO.roleEle.innerText;
            const message = messageElementBO.messageEle.innerHTML;
            if (!this.messages.has(messageId)) {
                const messageBO = new MessageBO(messageId, role, timestamp, message);
                this.messages.set(messageId, messageBO);
            }
            return this.messages.get(messageId);
        }

        /**
         * 添加消息，主要用于添加从 API 劫持到的消息列表。
         * 调用该方法需要已知消息的所有内容，如果只知道消息元素则应该使用 parseMessageDiv 方法获取消息业务对象。
         *
         * @param message   消息业务对象
         * @param force     是否强制添加，如果为 true 则强制添加，否则如果消息已经存在则不添加
         * @returns {boolean}   返回是否添加成功
         */
        addMessage(message, force = false) {
            if (this.messages.has(message.messageId) && !force) {
                return false;
            }
            this.messages.set(message.messageId, message);
            return true
        }

        /**
         * 通过消息 ID 获取消息元素业务对象
         *
         * @param messageId 消息 ID
         * @returns {MessageElementBO|undefined}  返回消息元素业务对象
         */
        getMessageElement(messageId) {
            const messageDiv = document.body.querySelector(`div[data-message-id="${messageId}"]`);
            if (!messageDiv) {
                return;
            }
            const rootDiv = messageDiv.parentElement.parentElement.parentElement;
            const roleDiv = rootDiv.firstChild;
            return new MessageElementBO(rootDiv, roleDiv, messageDiv);
        }

        /**
         * 通过消息 ID 获取消息业务对象
         * @param messageId
         * @returns {any}
         */
        getMessage(messageId) {
            return this.messages.get(messageId);
        }

        /**
         * 显示所有消息信息
         */
        showMessages() {
            Logger.table(Array.from(this.messages.values()));
        }
    }

    class MonitorService extends Component {
        constructor() {
            super();
            this.messageService = null
            this.timeRendererService = null
            this.dependencies = [{field: 'messageService', clazz: MessageService}, {
                field: 'timeRendererService', clazz: TimeRendererService
            },]
        }

        init() {
            this.totalTime = 0;
            this.originalFetch = window.fetch;
            this._initMonitorFetch();
            this._initMonitorAddedMessageNode();
        }

        /**
         * 初始化劫持 fetch 方法，用于监控 ChatGPT 的消息数据
         *
         * @private
         */
        _initMonitorFetch() {
            const that = this;
            const urlRegex = new RegExp("^https://chat\\.openai\\.com/backend-api/conversation/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");
            unsafeWindow.fetch = (...args) => {
                return that.originalFetch.apply(this, args)
                    .then(response => {
                        if (urlRegex.test(response.url)) {
                            // 克隆响应对象以便独立处理响应体
                            const clonedResponse = response.clone();
                            clonedResponse.json().then(data => {
                                that._parseConversationJsonData(data);
                            }).catch(error => Logger.error('解析响应体失败:', error));
                        }
                        return response;
                    });
            };
        }

        /**
         * 解析从 API 获取到的消息数据，该方法存在报错风险，需要在调用时捕获异常以防止中断后续操作。
         *
         * @param obj   从 API 获取到的消息数据
         * @private
         */
        _parseConversationJsonData(obj) {
            const mapping = obj.mapping
            const messageIds = []
            for (let key in mapping) {
                const message = mapping[key].message
                if (message) {
                    const messageId = message.id
                    const role = message.author.role
                    const createTime = message.create_time
                    const messageBO = new MessageBO(messageId, role, createTime * 1000)
                    messageIds.push(messageId)
                    this.messageService.addMessage(messageBO, true)
                }
            }
            this.timeRendererService.addMessageArrayToBeRendered(messageIds)
            this.messageService.showMessages()
        }

        /**
         * 初始化监控节点变化，用于监控在使用 ChatGPT 期间实时输入的消息。
         * 每隔 500ms 检查一次 main 节点是否存在，如果存在则开始监控节点变化。
         * @private
         */
        _initMonitorAddedMessageNode() {
            const interval = setInterval(() => {
                const mainElement = document.querySelector('main');
                if (mainElement) {
                    this._setupMonitorAddedMessageNode(mainElement);
                    clearInterval(interval); // 清除定时器，停止进一步检查
                }
            }, 500);
        }

        /**
         * 设置监控节点变化，用于监控在使用 ChatGPT 期间实时输入的消息。
         * @param supervisedNode    监控在此节点下的节点变化，确保新消息的节点在此节点下
         * @private
         */
        _setupMonitorAddedMessageNode(supervisedNode) {
            const that = this;
            const callback = function (mutationsList, observer) {
                const start = new Date().getTime();
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                let messageDiv = node.querySelector('div[data-message-id]');
                                if (!messageDiv && node.hasAttribute('data-message-id')) {
                                    messageDiv = node
                                }
                                if (messageDiv !== null) {
                                    const messageBO = that.messageService.parseMessageDiv(messageDiv);
                                    that.timeRendererService.addMessageToBeRendered(messageBO.messageId);
                                    that.messageService.showMessages()
                                }
                            }
                        });
                    }
                }
                const end = new Date().getTime();
                that.totalTime += (end - start);
                Logger.debug(`监控到节点变化，耗时 ${end - start}ms，总耗时 ${that.totalTime}ms。`);
            };
            const observer = new MutationObserver(callback);
            observer.observe(supervisedNode, {childList: true, subtree: true,});
        }
    }

    class TimeRendererService extends Component {

        constructor() {
            super();
            this.messageService = null
            this.userConfig = null
            this.styleService = null
            this.javaScriptService = null
            this.dependencies = [
                {field: 'messageService', clazz: MessageService},
                {field: 'userConfig', clazz: UserConfig},
                {field: 'styleService', clazz: StyleService},
                {field: 'javaScriptService', clazz: JavaScriptService},
            ]
        }

        init() {
            unsafeWindow.beforeCreateTimeTag = (messageId, timeTagHTML) => {
            }
            unsafeWindow.afterCreateTimeTag = (messageId, timeTagNode) => {
            }
            this.messageToBeRendered = []
            this.messageCountOfFailedToRender = new Map()
            this._setStyleAndJavaScript()
            this._initRender()
        }

        /**
         * 若为高级模式则设置用户自定义的样式和脚本，否则设置默认样式
         *
         * @private
         */
        _setStyleAndJavaScript() {
            this.styleService.updateStyle(SystemConfig.TimeRender.BasicStyleKey, SystemConfig.TimeRender.RenderModeStyles[this.userConfig.timeRender.mode])
            if (this.userConfig.timeRender.advanced.enable) {
                this.styleService.updateStyle(SystemConfig.TimeRender.AdditionalStyleKey, this.userConfig.timeRender.advanced.styleTextContent)
                this.javaScriptService.updateJavaScript(SystemConfig.TimeRender.AdditionalScriptKey, this.userConfig.timeRender.advanced.scriptTextContent)
            } else {
                this.styleService.removeStyle(SystemConfig.TimeRender.AdditionalStyleKey)
                unsafeWindow.beforeCreateTimeTag = (messageId, timeTagHTML) => {
                }
                unsafeWindow.afterCreateTimeTag = (messageId, timeTagNode) => {
                }
                this.javaScriptService.removeJavaScript(SystemConfig.TimeRender.AdditionalScriptKey)
            }
        }

        /**
         * 添加消息 ID 到待渲染队列
         * @param messageId 消息 ID
         */
        addMessageToBeRendered(messageId) {
            if (typeof messageId !== 'string') {
                return
            }
            this.messageToBeRendered.push(messageId)
            Logger.debug(`添加ID ${messageId} 到待渲染队列，当前队列 ${this.messageToBeRendered}`)
        }

        /**
         * 添加消息 ID 到待渲染队列
         * @param messageIdArray 消息 ID数组
         */
        addMessageArrayToBeRendered(messageIdArray) {
            if (!messageIdArray || !(messageIdArray instanceof Array)) {
                return
            }
            this.messageToBeRendered.push(...messageIdArray)
            Logger.debug(`添加ID ${messageIdArray} 到待渲染队列，当前队列 ${this.messageToBeRendered}`)
        }

        /**
         * 初始化渲染时间的定时器，每隔 SystemConfig.TimeRender.Interval 毫秒处理一次待渲染队列
         * 1. 备份待渲染队列
         * 2. 清空待渲染队列
         * 3. 遍历备份的队列，逐个渲染
         * 3.1 如果渲染失败则重新加入待渲染队列，失败次数加一
         * 3.2 如果渲染成功，清空失败次数
         * 4. 重复 1-3 步骤
         * 5. 如果失败次数超过 SystemConfig.TimeRender.RenderRetryCount 则不再尝试渲染，即不再加入待渲染队列。同时清空失败次数。
         *
         * @private
         */
        _initRender() {
            const that = this

            async function processTimeRender() {
                const start = new Date().getTime();
                let completeCount = 0;
                let totalCount = that.messageToBeRendered.length;
                const messageToBeRenderedClone = that.messageToBeRendered.slice()
                that.messageToBeRendered = []
                let count = 0;
                for (let messageId of messageToBeRenderedClone) {
                    count++;
                    if (count <= SystemConfig.TimeRender.BatchSize && new Date().getTime() - start <= SystemConfig.TimeRender.BatchTimeout) {
                        const result = await that._renderTime(messageId)
                        if (!result) {
                            let countOfFailed = that.messageCountOfFailedToRender.get(messageId)
                            if (countOfFailed && countOfFailed >= SystemConfig.TimeRender.RenderRetryCount) {
                                Logger.debug(`ID ${messageId} 渲染失败次数超过 ${SystemConfig.TimeRender.RenderRetryCount} 次，将不再尝试。`)
                                that.messageCountOfFailedToRender.delete(messageId)
                            } else {
                                that.messageToBeRendered.push(messageId);
                                if (countOfFailed) {
                                    that.messageCountOfFailedToRender.set(messageId, countOfFailed + 1)
                                } else {
                                    that.messageCountOfFailedToRender.set(messageId, 1)
                                }
                            }
                        } else {
                            completeCount++
                            that.messageCountOfFailedToRender.delete(messageId)
                        }
                        Logger.debug(`ID ${messageId} 渲染${result ? '成功' : '失败'}，当前渲染进度 ${completeCount}/${totalCount}，该批次耗时 ${new Date().getTime() - start}ms`)
                    } else {
                        for (let i = count; i < messageToBeRenderedClone.length; i++) {
                            that.messageToBeRendered.push(messageToBeRenderedClone[i])
                        }
                        if (count > SystemConfig.TimeRender.BatchSize) {
                            Logger.debug(`本批次渲染数量超过 ${SystemConfig.TimeRender.BatchSize}，将继续下一批次渲染。`)
                            break;
                        }
                        if (new Date().getTime() - start > SystemConfig.TimeRender.BatchTimeout) {
                            Logger.debug(`本批次渲染超时，将继续下一批次渲染。`)
                            break;
                        }
                    }
                }
                const end = new Date().getTime();
                Logger.debug(`处理当前ID队列渲染 ${messageToBeRenderedClone} 耗时 ${end - start}ms`)
                setTimeout(processTimeRender, SystemConfig.TimeRender.Interval);
            }

            processTimeRender().then(r => Logger.debug('初始化渲染时间定时器完成'))
        }

        /**
         * 将时间渲染到目标位置，如果检测到目标位置已经存在时间元素则更新时间，否则创建时间元素并插入到目标位置。
         *
         * @param messageId     消息 ID
         * @returns {Promise}   返回是否渲染成功的 Promise 对象
         * @private
         */
        _renderTime(messageId) {
            return new Promise(resolve => {
                const messageElementBo = this.messageService.getMessageElement(messageId);
                const messageBo = this.messageService.getMessage(messageId);
                if (!messageElementBo || !messageBo) resolve(false)
                const timeElement = messageElementBo.rootEle.querySelector(`.${SystemConfig.TimeRender.TimeClassName}`);
                const element = this._createTimeElement(messageBo.timestamp);
                if (!timeElement) {
                    unsafeWindow.beforeCreateTimeTag(messageId, element.timeTagContainer)
                    switch (this.userConfig.timeRender.mode) {
                        case 'AfterRoleLeft':
                        case 'AfterRoleRight':
                        case 'BelowRole':
                            messageElementBo.roleEle.innerHTML += element.timeTagContainer
                            break;
                    }
                    unsafeWindow.afterCreateTimeTag(messageId, messageElementBo.rootEle.querySelector(`.${SystemConfig.TimeRender.TimeClassName}`))
                } else {
                    timeElement.innerHTML = element.timeTagFormated
                }
                resolve(true)
            })
        }

        /**
         * 创建时间元素，如果开启高级模式则使用用户自定义的时间格式，否则使用默认时间格式。
         *
         * @param timestamp 时间戳，浮点数或整数类型，单位毫秒，例如 1714398759.26881、1714398759
         * @returns {{timeTagFormated, timeTagContainer: string}} 返回格式化后的时间标签 和 包含时间标签的容器的 HTML 字符串
         * @private
         */
        _createTimeElement(timestamp) {
            let timeTagFormated = ''
            if (this.userConfig.timeRender.advanced.enable) {
                timeTagFormated = Utils.formatDateTimeByDate(new Date(timestamp), this.userConfig.timeRender.advanced.htmlTextContent)
            } else {
                timeTagFormated = Utils.formatDateTimeByDate(new Date(timestamp), this.userConfig.timeRender.format);
            }
            const timeTagContainer = `<span class="${SystemConfig.TimeRender.TimeClassName}">${timeTagFormated}</span>`;
            return {
                timeTagFormated, timeTagContainer,
            };
        }

        /**
         * 清除所有时间元素
         * @private
         */
        _cleanAllTimeElements() {
            const timeElements = document.body.querySelectorAll(`.${SystemConfig.TimeRender.TimeClassName}`);
            timeElements.forEach(ele => {
                ele.remove()
            })
        }

        /**
         * 重新渲染时间元素，强制拉取所有消息 ID 重新渲染
         */
        reRender() {
            this._setStyleAndJavaScript()
            this._cleanAllTimeElements()
            this.addMessageArrayToBeRendered(Array.from(this.messageService.messages.keys()))
        }
    }

    class ConfigPanelService extends Component {

        constructor() {
            super();
            this.userConfig = null
            this.styleService = null
            this.timeRendererService = null
            this.messageService = null
            this.javascriptService = null
            this.dependencies = [
                {field: 'userConfig', clazz: UserConfig},
                {field: 'styleService', clazz: StyleService},
                {field: 'timeRendererService', clazz: TimeRendererService},
                {field: 'messageService', clazz: MessageService},
                {field: 'javascriptService', clazz: JavaScriptService},
            ]
        }

        /**
         * 初始化配置面板，强调每个子初始化方法阻塞式的执行，即一个初始化方法执行完毕后再执行下一个初始化方法。
         * @returns {Promise<void>}
         */
        async init() {
            this.appID = SystemConfig.ConfigPanel.AppID
            this._initVariables()
            Logger.debug('开始初始化配置面板')
            await this._initStyle()
            Logger.debug('初始化样式完成')
            await this._initExternalResources()
            Logger.debug('初始化脚本完成')
            await this._initPanel()
            Logger.debug('初始化面板完成')
            this._initVue()
            Logger.debug('初始化Vue完成')
            this._initConfigPanelSizeAndPosition()
            this._initConfigPanelEventMonitor()
            Logger.debug('初始化配置面板事件监控完成')
            this._initMenuCommand()
            Logger.debug('初始化菜单命令完成')
        }

        /**
         * 初始化配置面板的 HTML 与 Vue 实例的配置属性。集中管理以便方便修改。
         * @private
         */
        _initVariables() {
            const that = this
            const TimeTagComponent = {
                props: ['html'],
                render() {
                    return Vue.h('div', {innerHTML: this.html});
                },
            }
            this.panelStyle = `
                    .v-binder-follower-container {
                        position: fixed;
                    }
                    
                    #CWD-Configuration-Panel {
                        position: absolute;
                        top: 50px;
                        left: 50px;
                        width: 250px;
                        background-color: #FFFFFF;
                        border: #D7D8D9 1px solid;
                        border-radius: 4px;
                        resize: horizontal;
                        min-width: 200px;
                        overflow: auto;
                        color: black;
                        opacity: 0.95;
                    }
            
                    #CWD-Configuration-Panel .status-bar {
                        cursor: move;
                        background-color: #f0f0f0;
                        border-radius: 4px 4px 0 0;
                        display: flex;
                    }
            
                    #CWD-Configuration-Panel .status-bar .title {
                        display: flex;
                        align-items: center;
                        justify-content: left;
                        padding-left: 10px;
                        user-select: none;
                        color: #777;
                        flex: 1;
                        font-weight: bold;
                    }
            
                    #CWD-Configuration-Panel .status-bar .close {
                        cursor: pointer;
                        padding: 10px;
                        transition: color 0.3s;
                    }
            
                    #CWD-Configuration-Panel .status-bar .close:hover {
                        color: #f00;
                    }
            
                    #CWD-Configuration-Panel .container {
                        padding: 20px;
                    }
                    
                    #CWD-Configuration-Panel .container .code-block {
                        padding: 10px;
                        border: 1px solid #d9d9d9;
                        border-radius: 4px;
                    }
                    
                    #CWD-Configuration-Panel .container .button-group {
                        display: flex;
                        justify-content: center;
                        gap: 10px;
                    }
                    
                    #CWD-Configuration-Panel .container .button-group > button {
                        width: 30%;
                    }`
            this.panelHTML = `
                <div id="${that.appID}" style="visibility: hidden">
                    <div class="status-bar">
                        <div class="title" id="${that.appID}-DraggableArea">{{title}}</div>
                        <n-button class="close" @click="onClose" text>
                            <n-icon size="20">
                                ${SystemConfig.ConfigPanel.Icon.Close}
                            </n-icon>
                        </n-button>
                    </div>
                    <n-scrollbar style="max-height: 80vh">
                        <div class="container">
                            <n-form :label-width="40" :model="configForm" label-placement="left">
                                <n-form-item v-show="!configForm.advanced.enable" label="模板" path="format">
                                    <n-select v-model:value="configForm.format"
                                              :disabled="configForm.advanced.enable" :render-label="renderLabel"
                                              :options="formatOptions" @update:value="onConfigUpdate"></n-select>
                                </n-form-item>
                                <n-form-item v-show="!configForm.advanced.enable" label="预览" path="format">
                                    <div v-html="reFormatTimeHTML(configForm.format)"></div>
                                </n-form-item>
                                <n-form-item v-show="!configForm.advanced.enable" label="代码" path="format">
                                    <n-config-provider :hljs="hljs">
                                        <div class="code-block">
                                            <n-scrollbar style="max-height: 4em">
                                                <n-code :code="configForm.format" language="html" word-wrap/>
                                            </n-scrollbar>
                                        </div>
                                    </n-config-provider>
                                </n-form-item>
                                <n-form-item label="位置" path="mode">
                                    <n-select v-model:value="configForm.mode" 
                                              :options="modeOptions" @update:value="onConfigUpdate"></n-select>
                                </n-form-item>
                                <n-form-item label="高级" path="advanced.enable">
                                    <n-switch v-model:value="configForm.advanced.enable" @update:value="onConfigUpdate" />
                                </n-form-item>
                                <div v-show="configForm.advanced.enable">
                                    <n-form-item label="HTML" path="advanced.htmlTextContent">
                                        <n-input type="textarea" placeholder="请输入 HTML 代码" :autosize="{ minRows: 1, maxRows: 5 }" 
                                                    @keydown.tab="insertTab" @update:value="onConfigUpdate"
                                                    v-model:value="configForm.advanced.htmlTextContent"/>
                                    </n-form-item>
                                    <n-form-item label="CSS" path="advanced.styleTextContent">
                                        <n-input type="textarea" placeholder="请输入 CSS 代码" :autosize="{ minRows: 1, maxRows: 5 }"
                                                    @keydown.tab="insertTab" @update:value="onConfigUpdate"
                                                    v-model:value="configForm.advanced.styleTextContent"/>
                                    </n-form-item>
                                    <n-form-item label="JS" path="advanced.scriptTextContent">
                                        <n-input type="textarea" placeholder="请输入 JavaScript 代码" :autosize="{ minRows: 1, maxRows: 5 }"
                                                    @keydown.tab="insertTab" @update:value="onConfigUpdate"
                                                    v-model:value="configForm.advanced.scriptTextContent"/>
                                    </n-form-item>
                                </div>
                            </n-form>
                            <div class="button-group">
                                <n-button @click="onReset" :disabled="!configDirty">重置</n-button>
                                <n-button @click="onApply">应用</n-button>
                                <n-button @click="onConfirm">保存</n-button>
                            </div>
                        </div>
                    </n-scrollbar>
                </div>`
            this.appConfig = {
                el: `#${that.appID}`,
                data() {
                    return {
                        hljs: hljs,
                        date: new Date(),
                        title: "ChatGPTWithDate",
                        formatOptions: SystemConfig.TimeRender.TimeTagTemplates.map(item => {
                            return {label: item, value: item}
                        }),
                        modeOptions: [
                            {label: '角色之后（靠左）', value: 'AfterRoleLeft'},
                            {label: '角色之后（居右）', value: 'AfterRoleRight'},
                            {label: '角色之下', value: 'BelowRole'},
                        ],
                        configForm: {
                            format: that.userConfig.timeRender.format,
                            mode: that.userConfig.timeRender.mode,
                            advanced: {
                                enable: that.userConfig.timeRender.advanced.enable,
                                htmlTextContent: that.userConfig.timeRender.advanced.htmlTextContent,
                                styleTextContent: that.userConfig.timeRender.advanced.styleTextContent,
                                scriptTextContent: that.userConfig.timeRender.advanced.scriptTextContent,
                            },
                        },
                        config: {
                            format: that.userConfig.timeRender.format,
                            mode: that.userConfig.timeRender.mode,
                            advanced: {
                                enable: that.userConfig.timeRender.advanced.enable,
                                htmlTextContent: that.userConfig.timeRender.advanced.htmlTextContent,
                                styleTextContent: that.userConfig.timeRender.advanced.styleTextContent,
                                scriptTextContent: that.userConfig.timeRender.advanced.scriptTextContent,
                            },
                        },
                        configDirty: false,
                        configPanel: {
                            display: true,
                        },
                    };
                },
                methods: {
                    onApply() {
                        this.config = JSON.parse(JSON.stringify(this.configForm));
                        that.updateConfig(this.config)
                        this.configDirty = false
                    },
                    onConfirm() {
                        this.onApply()
                        this.onClose()
                    },
                    onReset() {
                        this.configForm = JSON.parse(JSON.stringify(this.config));
                        this.configDirty = false
                    },
                    onClose() {
                        that.hide()
                    },
                    onConfigUpdate() {
                        this.configDirty = true
                    },
                    renderLabel(option) {
                        return Vue.h(TimeTagComponent, {
                            html: option.label,
                        })
                    },
                    reFormatTimeHTML(html) {
                        return Utils.formatDateTimeByDate(this.date, html)
                    },
                    insertTab(event) {
                        if (!event.shiftKey) {  // 确保不是 Shift + Tab 组合
                            event.preventDefault();  // 阻止 Tab 键的默认行为
                            // 尝试使用 execCommand 插入四个空格
                            if (document.queryCommandSupported('insertText')) {
                                document.execCommand('insertText', false, '    ');
                            } else { // 如果浏览器不支持 execCommand，回退到原始方法（不支持撤销）
                                const start = event.target.selectionStart;
                                const end = event.target.selectionEnd;
                                const value = event.target.value;
                                event.target.value = value.substring(0, start) + "    " + value.substring(end);
                                // 移动光标位置到插入的空格后
                                event.target.selectionStart = event.target.selectionEnd = start + 4;
                                // 触发 input 事件更新 v-model
                                this.$nextTick(() => {
                                    event.target.dispatchEvent(new Event('input'));
                                });
                            }
                        }
                    }
                },
                created() {
                    this.date = new Date()
                    this.formatOptions.forEach(item => {
                        item.label = this.reFormatTimeHTML(item.value)
                    })
                },
                mounted() {
                    this.timestampInterval = setInterval(() => {
                        this.date = new Date()
                        this.formatOptions.forEach(item => {
                            item.label = this.reFormatTimeHTML(item.value)
                        })
                    }, 50)
                },
                beforeUnmount() {
                    clearInterval(this.timestampInterval)
                },
            }
        }

        /**
         * 初始化样式。
         * 同时为了避免样式冲突，在 head 元素中加入一个 <meta name="naive-ui-style" /> 元素，
         * naive-ui 会把所有的样式刚好插入这个元素的前面。
         * 参考 https://www.naiveui.com/zh-CN/os-theme/docs/style-conflict
         *
         * @returns {Promise}
         * @private
         */
        _initStyle() {
            return new Promise(resolve => {
                const meta = document.createElement('meta');
                meta.name = 'naive-ui-style'
                document.head.appendChild(meta);
                this.styleService.updateStyle(SystemConfig.ConfigPanel.StyleKey, this.panelStyle)
                resolve()
            })
        }

        /**
         * 初始化 Vue 与 Naive UI 脚本。无法使用 <script src="https://xxx"> 的方式插入，因为 ChatGPT 有 CSP 限制。
         * 采用 GM_xmlhttpRequest 的方式获取 Vue 与 Naive UI 的脚本内容，然后插入 <script>脚本内容</script> 到页面中。
         *
         * @returns {Promise}
         * @private
         */
        _initExternalResources() {
            return new Promise(resolve => {
                let completeCount = 0;
                const resources = [
                    {type: 'js', url: 'https://unpkg.com/vue@3.4.26/dist/vue.global.js'},
                    {type: 'js', url: 'https://unpkg.com/naive-ui@2.38.1/dist/index.js'},
                    {type: 'css', url: 'https://unpkg.com/@highlightjs/cdn-assets@11.9.0/styles/default.min.css'},
                    {type: 'js', url: 'https://unpkg.com/@highlightjs/cdn-assets@11.9.0/highlight.min.js'},
                ]
                const addScript = (content) => {
                    let script = document.createElement('script');
                    script.textContent = content;
                    document.body.appendChild(script);
                    completeCount++;
                    if (completeCount === resources.length) {
                        resolve()
                    }
                }
                const addStyle = (content) => {
                    let style = document.createElement('style');
                    style.textContent = content;
                    document.head.appendChild(style);
                    completeCount++;
                    if (completeCount === resources.length) {
                        resolve()
                    }
                }
                resources.forEach(resource => {
                    GM_xmlhttpRequest({
                        method: "GET", url: resource.url, onload: function (response) {
                            if (resource.type === 'js') {
                                addScript(response.responseText);
                            } else if (resource.type === 'css') {
                                addStyle(response.responseText);
                            }
                        }
                    });
                })
                // 以下方法有 CSP 限制
                // const naiveScript = document.createElement('script');
                // naiveScript.setAttribute("type", "text/javascript");
                // naiveScript.text = "https://unpkg.com/naive-ui@2.38.1/dist/index.js";
                // document.documentElement.appendChild(naiveScript);
            })
        }

        /**
         * 初始化配置面板，插入配置面板的 HTML 到 body 中。
         *
         * @returns {Promise}
         * @private
         */
        _initPanel() {
            const that = this
            return new Promise(resolve => {
                const panelRoot = document.createElement('div');
                panelRoot.innerHTML = that.panelHTML;
                document.body.appendChild(panelRoot);
                resolve()
            })
        }

        /**
         * 初始化 Vue 实例，挂载到配置面板的 HTML 元素上。
         *
         * @private
         */
        _initVue() {
            const app = Vue.createApp(this.appConfig);
            app.use(naive)
            app.mount(`#${this.appID}`);
        }

        /**
         * 初始化配置面板大小与位置
         *
         * @private
         */
        _initConfigPanelSizeAndPosition() {
            const panel = document.getElementById(this.appID)

            // 获取存储的大小
            const size = GM_getValue(SystemConfig.GMStorageKey.ConfigPanel.Size, {})
            if (size && size.width && !isNaN(size.width)) {
                panel.style.width = size.width + 'px';
            }

            // 获取存储的位置
            const position = GM_getValue(SystemConfig.GMStorageKey.ConfigPanel.Position, {})
            if (position && position.left && position.top && !isNaN(position.left) && !isNaN(position.top)) {
                const {left, top} = position
                const {refineLeft, refineTop} = this.refinePosition(left, top, panel.offsetWidth, panel.offsetHeight)
                panel.style.left = refineLeft + 'px';
                panel.style.top = refineTop + 'px';
            }

            // 如果面板任何一边超出屏幕，则重置位置
            // const rect = panel.getBoundingClientRect()
            // const leftTop = {
            //     x: rect.left,
            //     y: rect.top
            // }
            // const rightBottom = {
            //     x: rect.left + rect.width,
            //     y: rect.top + rect.height
            // }
            // const screenWidth = window.innerWidth;
            // const screenHeight = window.innerHeight;
            // if (leftTop.x < 0 || leftTop.y < 0 || rightBottom.x > screenWidth || rightBottom.y > screenHeight) {
            //     panel.style.left = '50px';
            //     panel.style.top = '50px';
            // }

        }

        /**
         * 初始化配置面板事件监控，包括面板拖动、面板大小变化等事件。
         *
         * @private
         */
        _initConfigPanelEventMonitor() {
            const that = this
            const panel = document.getElementById(this.appID)
            const draggableArea = document.getElementById(`${this.appID}-DraggableArea`)

            // 监听面板宽度变化
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    if (entry.contentRect.width) {
                        GM_setValue(SystemConfig.GMStorageKey.ConfigPanel.Size, {
                            width: entry.contentRect.width,
                        })
                    }
                }
            });
            resizeObserver.observe(panel);

            // 监听面板位置
            draggableArea.addEventListener('mousedown', function (e) {
                const offsetX = e.clientX - draggableArea.getBoundingClientRect().left;
                const offsetY = e.clientY - draggableArea.getBoundingClientRect().top;

                function mouseMoveHandler(e) {
                    const left = e.clientX - offsetX;
                    const top = e.clientY - offsetY;
                    const {
                        refineLeft, refineTop
                    } = that.refinePosition(left, top, panel.offsetWidth, panel.offsetHeight);
                    panel.style.left = refineLeft + 'px';
                    panel.style.top = refineTop + 'px';
                    GM_setValue(SystemConfig.GMStorageKey.ConfigPanel.Position, {
                        left: refineLeft, top: refineTop,
                    })
                }

                document.addEventListener('mousemove', mouseMoveHandler);
                document.addEventListener('mouseup', function () {
                    document.removeEventListener('mousemove', mouseMoveHandler);
                });
            });
        }

        /**
         * 限制面板位置，使其任意一部分都不超出屏幕
         *
         * @param left      面板左上角 x 坐标
         * @param top       面板左上角 y 坐标
         * @param width     面板宽度
         * @param height    面板高度
         * @returns {{refineLeft: number, refineTop: number}}   返回修正后的坐标
         */
        refinePosition(left, top, width, height) {
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            return {
                refineLeft: Math.min(Math.max(0, left), screenWidth - width),
                refineTop: Math.min(Math.max(0, top), screenHeight - height),
            }
        }

        /**
         * 初始化菜单命令，用于在 Tampermonkey 的菜单中添加一个配置面板的命令。
         *
         * @private
         */
        _initMenuCommand() {
            let that = this
            GM_registerMenuCommand("配置面板", () => {
                that.show()
            })
        }

        /**
         * 显示配置面板
         */
        show() {
            document.getElementById(this.appID).style.visibility = 'visible';
        }

        /**
         * 隐藏配置面板
         */
        hide() {
            document.getElementById(this.appID).style.visibility = 'hidden';
        }

        /**
         * 更新配置，由 Vue 组件调用来更新配置并重新渲染时间
         * @param config
         */
        updateConfig(config) {
            this.userConfig.update({timeRender: config})
            this.timeRendererService.reRender()
        }
    }

    class Main {
        static ComponentsConfig = [
            UserConfig, StyleService, MessageService,
            MonitorService, TimeRendererService, ConfigPanelService,
            JavaScriptService,
        ]

        constructor() {
            for (let componentClazz of Main.ComponentsConfig) {
                const instance = new componentClazz();
                this[componentClazz.name] = instance
                ComponentLocator.register(componentClazz, instance)
            }
        }

        /**
         * 获取依赖关系图
         * @returns {[]} 依赖关系图，例如 [{node:'ComponentClass0', dependencies:['ComponentClass2', 'ComponentClass3']}, ...]
         * @private
         */
        _getDependencyGraph() {
            const dependencyGraph = []
            for (let componentClazz of Main.ComponentsConfig) {
                const dependencies = this[componentClazz.name].dependencies.map(dependency => dependency.clazz.name)
                dependencyGraph.push({node: componentClazz.name, dependencies})
            }
            return dependencyGraph
        }

        start() {
            const dependencyGraph = this._getDependencyGraph()
            const order = Utils.dependencyAnalysis(dependencyGraph)
            Logger.debug('初始化顺序：', order.join(' -> '))
            for (let componentName of order) {
                this[componentName].initDependencies()
            }
            for (let componentName of order) {
                this[componentName].init()
            }
        }
    }

    const main = new Main();
    main.start();

})();