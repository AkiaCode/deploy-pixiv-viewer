import { encode } from "https://deno.land/std/encoding/base64.ts"

async function handleRequest(request) {
    const { pathname, origin, search } = new URL(request.url);

    if (pathname.startsWith("/view")) {
        const resp = await fetch(origin + "/req?picture=false")
        const { html } = await resp.json()

        const url = html.contents[Math.floor((Math.random() * Object.keys(html.contents).length) + 1)].url

        const picture = await fetch(origin + "/req?url=" + url + "&picture=true")
        const json = await picture.json()
        const uint8 = new Uint8Array(json.html).buffer
        ///new Deno.Buffer(uint8).bytes()


        return new Response(`<body><img src="data:image/jpeg;base64,${encode(uint8)}" width="auto" height="auto" style="display:block; margin: auto;" alt="" ></body>`,
            {
              status: 200,
              headers: {},
            },
          )
    }

    if (pathname.startsWith("/req")) {
        const searchParams = new URLSearchParams(search)
        let resp
        
        if (searchParams.get("picture") == "true") {
            const response = await fetch(searchParams.get("url"), {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
                  'Referer': 'https://www.pixiv.net',
                  'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
                },
              })

            const arrayBuffery = await (await response.blob()).arrayBuffer()
            resp = { code: Array.from(new Uint8Array(arrayBuffery)), ok: response.ok };
        } else {
            const response = await fetch("https://www.pixiv.net/ranking.php?mode=daily&content=illust&p=1&format=json", {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
                    'Referer': 'https://www.pixiv.net'
                },
            });
            resp = { code: await response.json(), ok: response.ok }
        }

        if (resp.ok) {
            return new Response(JSON.stringify({ html: resp.code, status: 200, headers: { "content-type": "charset=UTF-8" } }),
            {
                headers: {
                    "content-type": "charset=UTF-8",
                },
            })
        }

        return new Response(JSON.stringify({ html: JSON.stringify({ message: "couldn't process your request" }), status: 500, headers: { "content-type": "charset=UTF-8" }}),
        {
            headers: {
                "content-type": "charset=UTF-8",
            },
        })
    }

    //Body style="background-image: url(); background-repeat: no-repeat; background-position: center center; background-size: contain;"
    return new Response(
        `<body>
            <h1 style="text-align: center;">Random Pixiv Picture Viewer</h1>
                <p style="text-align: center;"><a href="/view">View</a> - Random Pixiv picture viewer </p>
                <p style="text-align: center;"><a href="/req">Request</a> - Pixiv picture API (private) </p>
                <p style="text-align: center;"><a href="https://github.com/akiacode/deploy-pixiv-view">Repository</a> - Random Pixiv picture viewer repository </p>
                <p style="text-align: center;"><a href="https://github.com/akiacode">Author</a> - AkiaCode (aka aki)</p>
        </body>`,
        {
          status: 200,
          headers: {
            "content-type": "charset=UTF-8",
          },
        },
      );
}

addEventListener("fetch", (event) => {
    event.respondWith(handleRequest(event.request))
});