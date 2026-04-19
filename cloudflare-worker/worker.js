export default {
  async fetch(request) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    };

    if (request.method === "OPTIONS") {
      return new Response("", { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/health")) {
      return new Response(JSON.stringify({ ok: true, service: "vidu-proxy", now: new Date().toISOString() }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
      });
    }

    if (request.method !== "POST" || url.pathname !== "/proxy/vidu") {
      return new Response(JSON.stringify({ ok: false, error: "Not Found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
      });
    }

    let input;
    try {
      input = await request.json();
    } catch (error) {
      return new Response(JSON.stringify({ ok: false, error: "Body 必须是 JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
      });
    }

    const method = String(input?.method || "POST").toUpperCase();
    const path = String(input?.path || "");
    const apiKey = String(input?.apiKey || "").trim();
    const body = input?.body ?? null;

    if (!path.startsWith("/")) {
      return new Response(JSON.stringify({ ok: false, error: "path 必须以 / 开头" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
      });
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ ok: false, error: "缺少 apiKey" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
      });
    }

    const upstream = `https://api.vidu.cn/ent/v2${path}`;
    const keyMasked = apiKey.length > 12 ? `${apiKey.slice(0, 6)}***${apiKey.slice(-4)}` : `${apiKey.slice(0, 2)}***`;

    console.log("Proxy request", {
      method,
      upstream,
      auth: `Token ${keyMasked}`,
      has_body: body !== null
    });

    try {
      const upstreamResp = await fetch(upstream, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${apiKey}`
        },
        body: method === "GET" ? undefined : JSON.stringify(body)
      });

      const text = await upstreamResp.text();
      console.log("Proxy response", {
        method,
        upstream,
        status: upstreamResp.status,
        ok: upstreamResp.ok
      });

      return new Response(text, {
        status: upstreamResp.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json; charset=utf-8"
        }
      });
    } catch (error) {
      console.error("Proxy error", {
        method,
        upstream,
        message: error?.message || String(error)
      });

      return new Response(JSON.stringify({ ok: false, error: error?.message || "proxy upstream error" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
      });
    }
  }
};
