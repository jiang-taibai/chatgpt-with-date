# <div>ChatGPT with Date</div>

<div>
  <img src="https://img.shields.io/badge/Build-passing-%2396C40F" alt="Build-passing"/>
  <img src="https://img.shields.io/badge/Version-2.0.2-%231081C1" alt="Version-2.0.2"/>
  <img src="https://img.shields.io/badge/License-MIT-%2396C40F" alt="License-MIT"/>
  <img src="https://img.shields.io/badge/CopyRight-Jiang_Liu-%2396C40F" alt="CopyRight-Jiang_Liu"/>
</div>

## 1. Introduction

Sometimes we want to see the timestamp of messages from ChatGPT, but ChatGPT does not have the feature to display
message timestamps.
This project is developed using Tampermonkey and can be used on browsers that support the Tampermonkey plugin, such as
Edge, Chrome, Firefox, Safari, and Opera, to enable the display of timestamps for each message from ChatGPT.

This plugin can not only retrieve **historical message timestamps** but also obtain the time of new messages in
real-time.

![Adding timestamp labels during interaction](res/img/在交互时添加时间标签.gif)

Accessing the [Configuration Interface](https://jiang-taibai.github.io/chatgpt-with-date-config-page/) provides a
variety of configuration options.

![Basic usage of the configuration panel](res/img/配置面板-基本使用.gif)

If you are familiar with the web trifecta (HTML, CSS, JavaScript), you can highly customize the time style.

![Advanced usage of the configuration panel](https://cdn.coderjiang.com/project/chatgpt-with-date/configuration-panel-advanced.gif)

We will introduce the configurations as shown above and more rules in section three.

## 2. How to Use

### 2.1 Install Tampermonkey

Visit the [Tampermonkey homepage](https://www.tampermonkey.net/index.php?browser=chrome&locale=zh) to see detailed
instructions.

### 2.2 Install the Script

Go to: [Greasy Fork - ChatGPT with Date](https://greasyfork.org/en/scripts/493949-chatgpt-with-date)
and click on `Install this script` to install the script.

### 2.3 Usage

For the first use, please allow Cross-Origin Resource Sharing (CORS) requests. This project will request resources from
Vue.js and NaiveUI to generate the configuration panel.

![Allowing CORS requests](https://cdn.coderjiang.com/project/chatgpt-with-date/cross-domain-resource-request.jpg)

Open the ChatGPT page, and you will see the message timestamps. You can open the configuration panel here.

![Guide to opening the configuration panel](https://cdn.coderjiang.com/project/chatgpt-with-date/how-to-open-the-configuration-panel.png)

## 3. Detailed Documentation

Please visit the [ChatGPT with Date Documentation](https://jiang-taibai.github.io/chatgpt-with-date/) for detailed
configuration instructions and developer documentation.

## 4. Feedback

If you have any questions or suggestions, feel free to raise them
on [GitHub Issues](https://github.com/jiang-taibai/chatgpt-with-date/issues)
or the [Script Feedback Section](https://greasyfork.org/en/scripts/493949-chatgpt-with-date/feedback).

## 5. Future Plans

- [x] Internationalization: The script supports multiple languages (logs, prompts, etc.).
- [x] Time Formatting Granular Configuration Panel: Optimizing time format customization features, instead of
  hard-to-maintain HTML string representations.
- [x] Time Formatting Elements: Support for more time formatting elements, such as weekdays, months (in English), etc.
- [x] Time Formatting Rules: Support for more time formatting rules, such as 12-hour and 24-hour formats.
- [x] Support for Shared Interface: Support for displaying time on the interface of `https://chatgpt.com/share/uuid` (
  i.e., the shared chat interface).
- [ ] Theme Website: Provide a theme website to showcase user-shared time label themes.
- [x] Reset Script: Due to crashes caused by applying user input locally, a reset script functionality is provided.
- [x] Provide More Lifecycle Hooks and Custom Functions: For example, how time elements can be customized for parsing.

## 6. Open Source License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

CopyRight © 2024~Present [Jiang Liu](https://coderjiang.com)

## X. Changelog

- v2.0.2 - Unpublished
    - Optimization: Unified access to resources deployed on GitHub
    - New Feature: Support for displaying timestamps on shared interfaces
- v2.0.1 - 2024-06-15 16:33:35
    - Fix: Resolved the issue where switching between messages would force the timestamp to update to the current time
- v2.0.0 - 2024-06-13 16:58:05
    - Fix: Adapted to the new ChatGPT conversational UI
    - New Feature: Provided a brand-new configuration page (actually because ChatGPT no longer supports unsafe-eval)
    - Function Adjustment: To adapt to the new UI, the "time badge insertion position" is no longer supported
- v1.3.0 - 2024-05-06 19:48:01
    - New Feature: i18n internationalization support
    - New Feature: Provided functionality to reset scripts
    - New Feature: Provided tips adapted to this plugin to generate HTML, CSS, JavaScript code
    - New Feature: Provided tutorial entry
    - New Feature: Ability to collapse and expand the configuration panel
    - Optimization: Custom height support for the code input box
- v1.2.3 - 2024-05-04 20:04:51
    - Fix: Fixed the issue where custom user code could not run properly
    - Optimization: Optimized so that errors in user-customized code do not affect the entire script's operation
    - Optimization: Adjusted the rendering order to prioritize the most recent messages
- v1.2.2 - 2024-05-04 15:24:44
    - Fix: Fixed the issue of not finding the target message DOM node after message ID attribute changes
- v1.2.1 - 2024-05-04 14:33:12
    - Fix: Updated domain name for ChatGPT
- v1.2.0 - 2024-05-03 21:26:43
    - Optimization: Limited the number of times and the total duration of timestamp labeling to prevent page lag
    - Optimization: Set the timestamp labeling function to run asynchronously to avoid blocking page rendering
    - Optimization: Modified Fetch hijacking URL match rules to be more precise and to not interfere with other
      requests, performing specific hijacking actions only when the URL matches successfully
    - Optimization: Directly displayed the time format example when selecting a template, instead of cold template HTML
      strings
    - New Feature: Added more time format elements, such as weekdays, months (in English), etc.
    - New Feature: Added more time formatting rules, such as 12-hour and 24-hour formats
    - New Feature: Provided a code editor and injection system for custom HTML, CSS, JavaScript styles
    - New Feature: Provided lifecycle hook functions for creating time
      tags `window.beforeCreateTimeTag(messageId, timeTagHTML)` and `window.afterCreateTimeTag(messageId, timeTagNode)`
- v1.1.0 - 2024-05-02 17:50:04
    - Added more time format templates

