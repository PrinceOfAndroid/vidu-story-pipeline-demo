# Vidu Story Pipeline Demo (GitHub Pages + Cloudflare Worker)

## 1) 前端（GitHub Pages）
- 页面文件：`index.html`
- 打开后填写：`API Key`、`代理地址`
- 请求方式默认：`代理服务`

## 2) 代理（Cloudflare Worker）
目录：`cloudflare-worker/`

```bash
cd cloudflare-worker
npx wrangler login
npx wrangler deploy
```

部署完成后会拿到类似：
`https://vidu-story-proxy.<subdomain>.workers.dev`

把该地址填入页面「代理地址」。

当前已部署示例：
`https://vidu-story-proxy.vidustorydemo.workers.dev`

## 3) 本地预览
```bash
python3 -m http.server 8080
# 打开 http://127.0.0.1:8080
```
