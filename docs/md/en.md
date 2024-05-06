# <div align="center">ChatGPT 消息时间</div>

<div align="center">
  <img src="https://img.shields.io/badge/Build-passing-%2396C40F" alt="Build-passing"/>
  <img src="https://img.shields.io/badge/Version-1.2.0-%231081C1" alt="Version-1.2.0"/>
  <img src="https://img.shields.io/badge/License-MIT-%2396C40F" alt="License-MIT"/>
  <img src="https://img.shields.io/badge/CopyRight-Jiang_Liu-%2396C40F" alt="CopyRight-Jiang_Liu"/>
</div>

## 1. 介绍

有时我们希望看到 ChatGPT 的消息时间，但 ChatGPT 并没有显示消息时间的功能。
本项目通过 Tampermonkey 开发，可以在 Chrome 和 Firefox 等支持 Tampermonkey 插件的浏览器上使用，实现显示 ChatGPT
每一条消息时间的功能。

该插件不但可以获取**以往的消息时间**，还可以实时获取新消息的时间。

![在交互时添加时间标签](https://cdn.coderjiang.com/project/chatgpt-with-date/add-time-tag-during-interaction.gif)

提供多种配置选项，例如时间显示格式、时间显示位置等。

![配置面板高级使用](https://cdn.coderjiang.com/project/chatgpt-with-date/configuration-panel-basic.gif)

如果你了解网页三剑客（HTML、CSS、JavaScript），你完全可以高度自定义时间样式。

![配置面板高级使用](https://cdn.coderjiang.com/project/chatgpt-with-date/configuration-panel-advanced.gif)

我们将在第三节介绍如上图所示的配置以及更多的规则。

## 2. 使用方法

### 2.1 安装 Tampermonkey

可查看 [Tampermonkey 首页](https://www.tampermonkey.net/index.php?browser=chrome&locale=zh) 查看详细的使用方法。

### 2.2 安装脚本

访问链接: [Greasy Fork - ChatGPT with Date](https://greasyfork.org/en/scripts/493949-chatgpt-with-date)
，点击 `安装此脚本` 安装脚本。

### 2.3 使用

首次使用请允许跨源资源共享（CORS）请求，本项目将请求 Vue.js 和 NaiveUI 的资源，以便生成配置面板。

![允许跨源资源共享请求](https://cdn.coderjiang.com/project/chatgpt-with-date/cross-domain-resource-request.jpg)

打开 ChatGPT 页面，即可看到消息时间。你可以在此处打开配置面板。

![配置面板打开引导](https://cdn.coderjiang.com/project/chatgpt-with-date/how-to-open-the-configuration-panel.png)

## 3. 配置

### 3.1 时间格式

支持的时间元素有（以 2024年4月3日18点9分1秒999毫秒周五 为例）

| 元素                                         | 介绍      | 示例     |
|--------------------------------------------|---------|--------|
| `{yyyy}`                                   | 四位的年份   | 2024   |
| `{yy}`                                     | 两位的年份   | 24     |
| `{MM}`, `{MM:02}`                          | 至少两位的月份 | 04     |
| `{MM:01}`                                  | 至少一位的月份 | 4      |
| `{MM#name@zh}`                             | 中文月份    | 四      |
| `{MM#name@en}`, `{MM#fullname@en}`         | 英文月份    | April  |
| `{MM#shortname@en}`                        | 英文缩写月份  | Apr    |
| `{dd}`, `{dd:02}`                          | 当前月已过天数 | 03     |
| `{dd:01}`                                  | 当前月已过天数 | 3      |
| `{HH}`, `{HH:02}`, `{HH#24}`, `{HH#24:02}` | 小数      | 18     |
| `{HH:01}`, `{HH#24:01}`                    | 小时      | 18     |
| `{HH#12}`, `{HH#12:02}`                    | 12小时制小时 | 06     |
| `{HH#12:01}`                               | 12小时制小时 | 6      |
| `{HH#tag}`, `{HH#tag@en}`                  | 上下午     | PM     |
| `{HH#tag@zh}`                              | 上下午     | 下午     |
| `{mm}`, `{mm:02}`                          | 分钟      | 09     |
| `{mm:01}`                                  | 分钟      | 9      |
| `{ss}`, `{ss:02}`                          | 秒数      | 01     |
| `{ss:01}`                                  | 秒数      | 1      |
| `{ms}`                                     | 毫秒      | 999    |
| `{week}`, `{week:02}`                      | 星期      | 05     |
| `{week:01}`                                | 星期      | 5      |
| `{week#name@zh}`                           | 中文星期    | 五      |
| `{week#name@en}`, `{week#fullname@en}`     | 英文星期    | Friday |
| `{week#shortname@en}`                      | 英文缩写星期  | Fri    |

### 3.2 时间位置

时间位置有三种选择：

- `角色之后（靠左）`: 时间显示在角色名字的后面，并靠左显示。
- `角色之后（靠右）`: 时间显示在角色名字的后面，并靠右显示。
- `角色之下`: 时间显示在角色名字下方。

### 3.3 高级配置

高级配置提供了更多的自定义选项，你可以自定义时间标签的 HTML、CSS、JavaScript 代码。

#### (1) 生命周期钩子函数

本项目提供了两个生命周期钩子函数，分别是 `window.beforeCreateTimeTag(messageId, timeTagHTML)`
和 `window.afterCreateTimeTag(messageId, timeTagNode)`。

- `window.beforeCreateTimeTag(messageId, timeTagHTML)`: 在创建时间标签之前调用，你可以在这里修改时间标签的 HTML 内容。
    - `messageId`: 消息的 ID。
    - `timeTagHTML`: 时间标签的 HTML 内容。
- `window.afterCreateTimeTag(messageId, timeTagNode)`: 在创建时间标签之后调用，你可以在这里修改时间标签的 DOM 节点。
    - `messageId`: 消息的 ID。
    - `timeTagNode`: 时间标签的 DOM 节点。

#### (2) 示例

在介绍章节中，我们展示了如何使用高级配置功能来显示一个可以将日期显示为几天前的时间标签，下面是具体的代码：

```html

<div class="text-tag-box">
    <span class="date">{yyyy}-{MM}-{dd}</span>
    <span class="time">{HH}:{mm}:{ss}</span>
</div>
```

```css
.text-tag-box {
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
}
```

```javascript
// 建议将以下代码放在一个 IIFE 中，以避免全局变量污染
(() => {
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
        dateNode.style.width = `${originalWidth + paddingWidth}px`;

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
                text = `${days}天前`;
            else if (days < 30)
                text = `${Math.floor(days / 7)}周前`;
            else if (days < 365)
                text = `${Math.floor(days / 30)}个月前`;
            else
                text = `${Math.floor(days / 365)}年前`;
            dateNode.innerText = text;
            dateNode.style.width = `${getNewWidth(dateNode, text) + paddingWidth}px`
        });

        // 鼠标移出 timeTagNode 时恢复 dateNode 的内容为原来的日期
        timeTagNode.addEventListener('mouseout', () => {
            dateNode.innerText = date;
            dateNode.style.width = `${originalWidth + paddingWidth}px`
        });
    }
})()
```

### 3.4 提示词

既然是用在 ChatGPT 上的，那么我们可以利用 ChatGPT 根据提示词来生成你想要的效果对应的 HTML、CSS、JavaScript 代码。

#### (1) 提示词

````markdown
# 1. 背景

由于某网站的消息没有显示时间信息，某插件可以通过多种方式获取消息时间，并渲染成时间标签。

# 2. 术语表

- 时间元素：日期的组成部分，例如年月日时分秒。但不只是数字，比如PM代表下午，May代表5月等。
- 占位符：占位符会被替换成相对应的时间元素。

# 3. 插件应用新配置的工作流

(1) 删除之前插入的 CSS、JS（如果有）
(2) 插入新的 CSS、JS
(3) 清空所有时间标签
(4) 将所有需要渲染消息添加到队列
(5) 取出一个消息，获取时间信息
(6) 执行钩子函数 formatDateTimeByDate
(7) 执行钩子函数 beforeCreateTimeTag
(8) 创建 DOM 节点，并插入到网页中
(9) 执行钩子函数 afterCreateTimeTag
(10) 如果队列非空，回到第 5 步，否则等待一段时间重新开始新一轮渲染队列中待渲染的消息

# 4. 钩子函数说明

钩子函数定义在 window 上，如有必要你需要在 JS 脚本内重写函数。

- window.ChatGPTWithDate.hooks.formatDateTimeByDate(date, template): 根据 Date 对象将模板 HTML 字符串中的占位符替换为时间元素
    - 默认实现：将占位符替换为时间元素
    - date: 日期 Date 对象
    - template: 时间格式字符串模板
    - 返回值: 格式化后的时间字符串
- window.ChatGPTWithDate.hooks.beforeCreateTimeTag(messageId, timeTagHTML): 将 template 插入到页面之前调用
    - 默认实现：空函数
    - messageId: 消息的 ID
    - timeTagHTML: 时间标签的 HTML 内容
    - 返回值: 无
- window.ChatGPTWithDate.hooks.afterCreateTimeTag(messageId, timeTagNode): 将 template 插入到页面之后调用
    - 默认实现：空函数
    - messageId: 消息的 ID
    - timeTagNode: 时间标签的 DOM 节点，template 所对应的 DOM 节点
    - 返回值: 无

# 4.1 formatDateTimeByDate 默认实现

如果你想实现更加复杂的时间格式化，你可以重写 formatDateTimeByDate 函数。

- 基础占位符
    - {yyyy}: 四位年份，例如2024。
    - {yy}: 两位年份，例如24。
    - {MM}: 两位月份，若月份为单数则前面补零，例如05。
    - {dd}: 两位日期，若日期为单数则前面补零，例如09。
    - {HH}: 两位小时（24小时制），若小时为单数则前面补零，例如08。
    - {mm}: 两位分钟，若分钟为单数则前面补零，例如07。
    - {ss}: 两位秒数，若秒数为单数则前面补零，例如06。
- 高级格式化选项
    - {MM:01}: 月份显示为一位或两位，不补零，例如5。
    - {HH#12}: 12小时制的小时数，如果是上午12点，则显示为12，下午3点显示为03。
    - {HH#tag@en}: 显示AM或PM来表示上午或下午。
    - {HH#tag@zh}: 显示上午或下午。
- 显示星期和月份的名称
    - {week#name@zh}: 显示中文的星期名称，如一至日。
    - {week#fullname@en}: 显示英文的完整星期名称，如Monday至Sunday。
    - {MM#name@zh}: 显示中文月份名称，如一月至十二月。
    - {MM#fullname@en}: 显示英文的完整月份名称，如January至December。
- 特殊格式
    - {ms}: 三位毫秒数，若毫秒数为单数则前面补零，例如005。
    - {week:02}: 两位星期数（星期日开始为0），若星期数为单数则前面补零，例如03表示星期三。

# 5. 案例

HTML 代码：

```html
<div class="text-tag-box">
    <span class="date">{yyyy}-{MM}-{dd}</span>
    <span class="time">{HH}:{mm}:{ss}</span>
</div>
```

CSS 代码：

```css
.text-tag-box {
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
}
```

```javascript
// 建议将以下代码放在一个 IIFE 中，以避免全局变量污染
(() => {
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
        dateNode.style.width = `${originalWidth + paddingWidth}px`;

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
                text = `${days}天前`;
            else if (days < 30)
                text = `${Math.floor(days / 7)}周前`;
            else if (days < 365)
                text = `${Math.floor(days / 30)}个月前`;
            else
                text = `${Math.floor(days / 365)}年前`;
            dateNode.innerText = text;
            dateNode.style.width = `${getNewWidth(dateNode, text) + paddingWidth}px`
        });

        // 鼠标移出 timeTagNode 时恢复 dateNode 的内容为原来的日期
        timeTagNode.addEventListener('mouseout', () => {
            dateNode.innerText = date;
            dateNode.style.width = `${originalWidth + paddingWidth}px`
        });
    }
})()
```

# 5. 你的任务

现在你需要写三段代码，分别为HTML、CSS、JavaScript，要求如下：

- HTML：你只需要写时间标签的 HTML
- JavaScript：请在 IIFE 中编写代码，你可以使用上面讲到的三个钩子函数。
- 不要说废话，直接上代码，分为三个代码块给我，在每个代码块之前写上“这是HTML代码”、“这是CSS代码”、“这是JS代码”。
- 接下来的对话我不会重复以上的内容，你需要记住这些内容。
- 我每次会告诉你我需要怎么改进你的代码，你需要根据我的要求修改代码。

# 6. 我的需求

当鼠标移动到时间标签上时，时间标签抖动一下。
````

## 4. 反馈

如果你有任何问题或建议，欢迎在 [GitHub Issues](https://github.com/jiang-taibai/chatgpt-with-date/issues)
或 [脚本反馈区](https://greasyfork.org/en/scripts/493949-chatgpt-with-date/feedback) 中提出。

## 5. 未来计划

- [ ] 国际化：脚本支持多种语言（日志、提示等）。
- [x] 时间格式化细粒度配置面板：优化时间格式自定义功能，而不是难以维护的 HTML字符串 表示。
- [x] 时间格式化元素：支持更多的时间格式化元素，例如星期、月份（英文）等。
- [x] 时间格式化规则：支持更多的时间格式化规则，例如 12 小时制、24 小时制等。
- [ ] 支持分享的界面：支持显示 `https://chat.openai.com/share/uuid` 的界面（即分享的聊天界面）的时间。
- [ ] 主题网站：提供一个主题网站，展示用户分享的时间标签主题。
- [ ] 重置脚本：由于会将用户输入的内容应用到本地导致奔溃，提供重置脚本的功能。
- [ ] 提供更多的生命周期钩子函数和自定义函数：例如可以自定义时间元素如何解析。

## 6. 开源协议

本项目遵循 [MIT](https://opensource.org/licenses/MIT) 开源协议。

CopyRight © 2024~Present [Jiang Liu](https://coderjiang.com)

## 7. 供给开发者自定义修改脚本的文档

### 7.1 项目组织架构

![源代码总览](https://cdn.coderjiang.com/project/chatgpt-with-date/source-code-overview.png)

本项目采用依赖注入（DI）的方式组织各个 Component，主要包括以下几个部分：

- `UserConfig`: 用户配置信息，包括时间格式、时间位置等。
- `StyleService`: 样式服务，负责跟踪管理一些可变化的样式。
- `MessageService`: 消息服务，负责管理和存储消息信息。
- `MonitorService`: 监控服务，负责劫持 Fetch 请求和实时监听页面新消息的添加。
- `TimeRendererService`: 时间渲染服务，负责渲染时间。
- `ConfigPanelService`: 配置面板服务，负责生成基于 Vue+NaiveUI 的配置面板。

上述服务之间的依赖关系如下：

```mermaid
graph TD
    UserConfig[UserConfig]
    StyleService[StyleService]
    MessageService[MessageService]
    MonitorService[MonitorService]
    TimeRendererService[TimeRendererService]
    ConfigPanelService[ConfigPanelService]
    MonitorService --> MessageService
    MonitorService --> TimeRendererService
    TimeRendererService --> MessageService
    TimeRendererService --> UserConfig
    TimeRendererService --> StyleService
    ConfigPanelService --> UserConfig
    ConfigPanelService --> TimeRendererService
    ConfigPanelService --> MessageService
```

<!-- ![原始的依赖关系图](https://cdn.coderjiang.com/project/chatgpt-with-date/original-dependency-graph.svg) -->

本项目采用的依赖注入方式限制了循环依赖的发生，依赖注入的设计架构允许组件保持独立于其依赖项的具体实现。这种技术可以使代码更容易理解、维护和测试。
之所以要避免循环依赖，因为循环依赖违反了单一职责原则、依赖倒置原则。

### 7.2 定义新的 Component

如果你想自定义一个新的 Component，你需要：

#### (1) 定义一个新的 Component 类

- 继承：该类必须继承自 `Component` 类
- 构造函数：在构造函数中定义 `dependencies` 属性，该属性是一个数组，数组中的每个元素是一个对象，对象包含两个属性：`field`
  和 `clazz`，分别表示依赖的字段名和依赖的类。
- 依赖注入：不应该在构造函数中进行除了定义依赖关系之外的其他操作，因为依赖关系的注入是在 `Component::initDependencies`
  方法中进行的。在该方法执行之前，依赖关系是无法使用的。
- 初始化函数：在 `init` 方法中进行正式的初始化操作，在该方法中可以使用依赖注入的属性。
- 依赖关系：应当避免循环依赖，否则会导致初始化失败。

```javascript
class NewComponent extends Component {
    constructor() {
        super();
        this.userConfig = null
        this.timeRendererService = null
        this.messageService = null
        this.dependencies = [
            {field: 'userConfig', clazz: UserConfig},
            {field: 'timeRendererService', clazz: TimeRendererService},
            {field: 'messageService', clazz: MessageService},
        ]
    }

    init() {
        // 正式初始化
    }
}
```

在迫不得已无法避免循环依赖的情况下，可以通过以下方式解决：

```javascript
class NewComponent extends Component {
    constructor() {
        super();
    }

    init() {
        this.cycleDependentComponent = ComponentLocator.get(CycleDependentComponent)
    }
}
```

#### (2) 注册该 Component

将你的 Component 注册到 `Main.ComponentsConfig` 中，不必担心注册的顺序，因为 Main 类会自动按照依赖关系的顺序进行初始化。

```javascript
class Main {
    static ComponentsConfig = [
        UserConfig, StyleService, MessageService,
        MonitorService, TimeRendererService, ConfigPanelService,
        NewComponent,
    ]
}
```

于是新的依赖关系图如下所示：

```mermaid
graph TD
    UserConfig[UserConfig]
    StyleService[StyleService]
    MessageService[MessageService]
    MonitorService[MonitorService]
    TimeRendererService[TimeRendererService]
    ConfigPanelService[ConfigPanelService]
    NewComponent[NewComponent]
    MonitorService -.-> MessageService
    MonitorService -.-> TimeRendererService
    TimeRendererService -.-> MessageService
    TimeRendererService -.-> UserConfig
    TimeRendererService -.-> StyleService
    ConfigPanelService -.-> UserConfig
    ConfigPanelService -.-> TimeRendererService
    ConfigPanelService -.-> MessageService
    NewComponent --> UserConfig
    NewComponent --> TimeRendererService
    NewComponent --> MessageService
```

<!-- ![添加NewComponent后的依赖关系图](https://cdn.coderjiang.com/project/chatgpt-with-date/afther-add-new-component.svg) -->

### 7.3 一些建议

#### (1) 注入外部 JavaScript 库

请使用 GM_xmlhttpRequest 来获取外部 JavaScript 库的内容，再以字符串的形式注入到页面中。
如果你直接在页面中引入外部 JavaScript 库，可能有CSP限制。
下面是在项目中注入 Vue.js 和 NaiveUI 的示例：

```javascript
function loadScript() {
    return new Promise(resolve => {
        let completeCount = 0;
        const resources = [
            {type: 'js', url: 'https://unpkg.com/vue@3.4.26/dist/vue.global.js'},
            {type: 'js', url: 'https://unpkg.com/naive-ui@2.38.1/dist/index.js'},
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
        resources.forEach(resource => {
            GM_xmlhttpRequest({
                method: "GET", url: resource.url, onload: function (response) {
                    addScript(response.responseText);
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
```

## X. Changelog

- v1.3.0 - 2024-05-05 14:51:47
    - 新功能：i18n 国际化支持
- v1.2.3 - 2024-05-04 20:04:51
    - 修复：修复无法正常运行用户自定义代码的问题
    - 优化：优化即使用户自定义代码出错也不会影响整个脚本的运行
    - 优化：将渲染顺序调整为最近的消息优先渲染
- v1.2.2 - 2024-05-04 15:24:44
    - 修复：修复消息 ID 属性变化后找不到目标消息 DOM 节点的问题
- v1.2.1 - 2024-05-04 14:33:12
    - 修复：ChatGPT 更新域名
- v1.2.0 - 2024-05-03 21:26:43
    - 优化：限制每次渲染时间标签的次数以及总时长，避免页面卡顿
    - 优化：设置时间标签渲染函数异步执行，避免阻塞页面渲染
    - 优化：修改 Fetch 劫持 URL 匹配规则，更加精确以免干扰其他请求。并在 URL 匹配成功时才进行具体的劫持操作
    - 优化：选择模板时直接显示时间格式的示例，而不是冰冷的模板HTML字符串
    - 新功能：添加更多时间格式的元素，例如星期、月份（英文）等
    - 新功能：添加更多时间格式化规则，例如 12 小时制、24 小时制等
    - 新功能：提供自定义样式的 HTML、CSS、JavaScript 的代码编辑器与注入系统
    - 新功能：提供创建时间标签的生命周期钩子函数 `window.beforeCreateTimeTag(messageId, timeTagHTML)`
      和 `window.afterCreateTimeTag(messageId, timeTagNode)`
- v1.1.0 - 2024-05-02 17:50:04
    - 添加更多时间格式的模板

