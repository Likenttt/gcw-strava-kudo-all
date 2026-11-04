# EGO 调试与发布检查

本次测试版本为 **1.5**。先完成本地测试，再发布 GitHub release 和提交商店更新。

## 加载测试版

1. 在 EGO 地址栏打开 `chrome://extensions/`。
2. 关闭商店安装的 **GCW and Strava Kudo All 1.4**，其 ID 为 `folhiecfhnmdniibjjcfogpdoafdamoc`。保留安装，只关闭开关，避免同时运行两个版本。
3. 开启“开发者模式”，点击“加载已解压的扩展程序”。选择本项目的 **`src` 文件夹**，其中应直接包含 `manifest.json`：

   ```text
   /Users/kent/WebstormProjects/kudoall-browser-extension/src
   ```

4. 确认新加载的扩展显示 **1.5**，并处于启用状态。本地测试版的 ID 通常与商店版不同。
5. 打开并刷新 `https://www.strava.com/dashboard`。可将本地测试版扩展固定到浏览器工具栏，方便使用备用入口。

每次修改源码后，在扩展管理页点击测试版的“重新加载 / Reload”，然后刷新 Strava 网页。只刷新网页不会重新加载扩展的后台代码。

## 少量手工验证

先检查入口和状态，再选择确实想点赞的活动执行一次。**Strava 点赞无法撤销**；“点赞当前动态”可能处理当前已加载的多条活动，并非只处理屏幕内的一条。

| 检查 | 预期结果 |
| --- | --- |
| 刷新 dashboard | 右上角出现“一键点赞”，且只有一个入口 |
| 打开浏览器扩展图标 | 面板显示脚本连接状态和可用未点赞数量 |
| 点击“重新连接” | 恢复连接，不重复生成入口或启动点赞 |
| 点击点赞后关闭、再打开面板 | 任务继续；面板能显示当前状态和上次结果 |
| 再次执行 | 跳过已点赞活动，不重复点赞 |
| 打开其他网站 | 面板提示需要打开 Strava dashboard，不在无关页面执行 |

可选：验证浮动备用入口。在 dashboard 按 `⌘⌥J` 打开 DevTools Console，确认上下文为 `top`，执行一次：

```js
document.querySelector('#global-header')?.remove()
```

这只会临时移除当前页面的导航。应出现浮动“一键点赞”按钮，工具栏面板仍可使用；刷新页面即可恢复原导航。测试入口是否出现即可，无需为此额外点赞。

## 查看错误

- **网页和内容脚本：** 在 dashboard 打开 DevTools。DOM 查询可在 Console 的 `top` 上下文执行；调试扩展 API 或内容脚本变量时，在上下文下拉框选择本地测试扩展。也可在 Sources → Content scripts 中找到扩展的 `kudoall.js` 设置断点。内容脚本与网页的 JavaScript 上下文隔离，不能仅凭 `top` 中看不到脚本变量判断它未加载。
- **后台：** 在 `chrome://extensions/` 点击本地测试版的 `service worker` 链接，检查 Console。后台显示 `Inactive` 本身不代表故障。
- **工具栏面板：** 打开面板，右键其中内容，选择“检查 / Inspect”，查看面板自己的 Console。
- **扩展加载错误：** 在扩展管理页查看测试版是否出现“错误 / Errors”；尤其留意 manifest、权限和脚本加载失败。

结果里的“页面已确认”表示观察到了页面点赞状态，不等同于独立验证服务端已持久保存。未确认时先检查页面和网络结果，避免连续重复点击。

## 测完后发布

测试完成后，记录版本、入口、浮动备用、工具栏与点赞结果；若失败，附具体报错或未符合预期的步骤。确认测试通过后再生成并发布新 release。

GitHub release 与浏览器商店更新是两个步骤：发布 release 不会自动更新 Chrome、Edge、Firefox 或 Safari 的商店安装版。Chrome/Edge 使用 Chrome ZIP 包提交，Firefox 使用对应的 Firefox 包；各商店仍需单独提交并等待其发布流程。

测试结束可关闭本地测试版，重新启用商店版；商店新版发布后，再确认安装版本已经更新。
