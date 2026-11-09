---
layout: default
title: Kudo All Safari 版用户指南
lang: zh-CN
permalink: /help/safari/zh/
---

# Kudo All Safari 版：安装与首次使用

[English](https://kudoall.li2niu.com/help/safari/) · [功能与演示](https://kudoall.li2niu.com/safari/zh/)

Kudo All 可以为 Garmin Connect 或 Strava 动态中已加载、符合条件的活动批量点赞。Safari 版需要 **macOS 12 或更新版本的 Mac**，在 **Mac App Store 一次性购买，无订阅**，价格以你所在地区商店当前显示为准。本版本用于 Mac 上的 Safari，不适用于 iPhone 或 iPad。

## 1. 下载并打开 Mac 应用

1. 在 Mac 上打开 [Kudo All 官方 Mac App Store 页面](https://apps.apple.com/app/apple-store/id6458730808?pt=125713495&ct=kudo_safari_readme&mt=8)。
2. 核对商店价格，使用你的 Apple 账户购买并安装。
3. 安装完成后点商店中的“打开”，或从 **访达 → 应用程序**打开 **Garmin Connect Web Kudo All** 一次。这是包含 **Kudo All：佳明与 Strava 一键点赞**扩展的 Mac 应用。Mac 应用提供 Safari 启用引导，实际点赞在 Safari 网页中完成。

## 2. 在 Safari 中启用扩展

1. 打开 Safari，在 Mac 屏幕顶部菜单栏中选择 **Safari 浏览器 → 设置**；旧版系统中为 **Safari 浏览器 → 偏好设置**。
2. 打开 **扩展**，找到 **Kudo All：佳明与 Strava 一键点赞**，勾选左侧复选框。英文界面中名称为 **Kudo All: Strava & Garmin**；不同语言或旧版本的名称可能不同。如果 Safari 弹出确认提示，按提示启用。
3. 也可以从 Mac 应用点击“打开 Safari 设置”进入该页面，旧版 macOS 中按钮为“打开 Safari 偏好设置”。

<figure>
  <img src="https://kudoall.li2niu.com/assets/images/safari-guide/enable-extension.jpg" width="1672" height="1200" style="max-width:100%;height:auto;" loading="lazy" alt="实际 Safari 扩展设置，已选中并启用 Kudo All: Strava &amp; Garmin。">
  <figcaption>实际 Safari 设置 → 扩展界面。名称与布局会因语言和版本而不同。图中的无痕浏览权限为可选项，使用普通 Safari 窗口无需开启。</figcaption>
</figure>

Mac 应用中的“已启用”状态只检查扩展开关；还需要完成下一步的网站授权，并在网页中登录账号。Safari 的通用操作可参考 Apple 的[扩展使用说明](https://support.apple.com/zh-cn/102343)。

## 3. 允许访问你使用的网站

1. 先在 Safari 中打开你使用的 Garmin Connect 或 Strava 网站。
2. 回到 **Safari 浏览器 → 设置 → 扩展**，选中 Kudo All，点击 **编辑网站**或当前 Safari 版本显示的网站访问管理入口。
3. 将你使用的站点设为 **允许**。如果点击工具栏扩展图标后 Safari 询问网站权限，选择仅始终允许当前网站的选项；英文界面中的按钮为 **Always Allow on This Website**。其他网站可以保留为“询问”或“拒绝”，**无需授权全部网站**。

例如，Garmin 国际区使用 `connect.garmin.com`，中国区按实际账号使用 `connect.garmin.cn` 或 `connectus.garmin.cn`；Strava 使用 `www.strava.com`（如果地址栏实际显示 `strava.com`，则允许该站点）。同时使用两个平台时，分别授权。网站访问权限用于添加按钮并操作动态中的点赞控件。

## 4. 登录并打开动态页

在 Safari 中登录你已有的 Garmin 或 Strava 账号，然后打开对应动态页：

| 平台 | 动态页 |
| --- | --- |
| Garmin Connect 国际区 | [connect.garmin.com/app/newsfeed](https://connect.garmin.com/app/newsfeed) |
| Garmin Connect 中国区 | [connect.garmin.cn/app/newsfeed](https://connect.garmin.cn/app/newsfeed) |
| Garmin Connect 中国区 connectus | [connectus.garmin.cn/app/newsfeed](https://connectus.garmin.cn/app/newsfeed) |
| Strava | [www.strava.com/dashboard](https://www.strava.com/dashboard) |

Garmin 旧版的 `/modern/newsfeed` 路径也受支持。账号主页、单条活动详情页或登录页都不是动态页。

首次启用、更新扩展或修改网站权限后，**按 ⌘R 刷新动态页**，等待活动加载完成。

## 5. 点赞并检查结果

- **网页入口：** Garmin 中心形的“一键点赞”图标在右上角导航栏、上传活动按钮附近；Strava 中也位于右上角导航栏。常规导航不可用时会显示浮动按钮。
- **Safari 工具栏入口：** 点击 Kudo All 扩展图标，检查 **页面连接**是否为 **已连接（Connected）**。**可点赞动态（Available kudos）**表示已加载、符合条件且尚未点赞的活动数量，大于零时即可执行。面板还会显示 **正在运行**、**上次：页面已确认**和 **上次：未确认**。如果图标未显示，可通过 **显示 → 自定工具栏**添加。
- 如果面板显示“未连接”，点击 **重新连接（Reconnect）**，检查连接状态和数量是否恢复。重新连接会把扩展加载到当前支持的网页，**不会直接开始点赞**。
- 准备好后，点击页内“一键点赞”或面板中的 **点赞当前动态**。执行时保持动态页打开；可以关闭再重新打开面板查看进度。

**上次：页面已确认**表示观察到了活动点赞状态的变化，并且该状态在页面上保持稳定，不是独立的服务端回执。如果出现未确认的点赞，执行会停止并跳过剩余活动；检查页面和连接后再重试。刷新网页会清除上一个页面会话的执行结果。

每次点击只处理动态中 **已经加载、尚未点赞且符合条件的活动**，包括已加载但当前屏幕看不到的卡片，并跳过已经点赞的活动。向下滚动加载更多后，可再点击一次。插件不会自动滚动、加载全部历史，也不会在后台无限自动点赞。

## 常见问题

### 已安装应用，但网页没有按钮

先打开 Mac 应用一次，再检查 **Safari 浏览器 → 设置 → 扩展**中的开关，以及地址栏实际站点的网站访问权限。使用上表中的动态页，登录并刷新。如果工具栏面板显示未连接，点击“重新连接”。页内按钮不可用时，也可以从面板执行。

如果“扩展”列表里找不到 Kudo All，先确认 Mac App Store 已完成安装，打开安装的应用，再退出并重新打开 Safari。保留 Mac 应用安装，扩展才能继续使用。

### 面板提示需要打开支持的动态页

先切换到 Garmin 动态页或 Strava Dashboard 标签页，再打开面板。面板读取的是 Safari 当前活动标签页；单条活动详情页和其他网站不受支持。

### 可点赞数量为零，或者执行按钮不可点

确认已登录，且动态加载完成。当前已加载的活动可能都已点赞，或不符合点赞条件；向下滚动加载更多，再打开面板检查。执行中或页面未连接时，点赞按钮也会禁用。

### 重新连接失败，或者有未确认的点赞

检查该站点的网站权限、登录状态和网络连接，刷新动态页后再点“重新连接”。先阅读面板提示并查看活动的点赞图标，再决定是否重新执行。如果平台页面改版，可到 Mac App Store 检查应用更新。

### 一个 Safari 窗口可用，另一个不可用

如果使用 Safari 用户场景，请为当前用户场景启用扩展。如果 Safari 版本为无痕浏览提供了独立权限，可按需允许 Kudo All 在无痕浏览中运行，或使用普通窗口。具体设置见 Apple 的[用户场景与无痕浏览说明](https://support.apple.com/zh-cn/102343)。

## 关闭或卸载

暂时停用：进入 **Safari 浏览器 → 设置（或偏好设置）→ 扩展**，取消勾选 Kudo All。也可以只撤销某个网站的访问权限。刷新已打开的动态页，即可移除页内按钮。

卸载：在同一“扩展”设置页选中 Kudo All，点击 **卸载**，并按 Safari 提示移除包含该扩展的 Mac 应用。可参考 Apple 的[扩展卸载说明](https://support.apple.com/zh-cn/102343)。

[隐私协议](https://kudoall.li2niu.com/privacy-policy-zh.html) · [产品官网](https://kudoall.li2niu.com/safari/zh/)
