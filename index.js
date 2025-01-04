// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
import puppeteer from "npm:puppeteer-extra";
import pLimit from "npm:p-limit";

// Add adblocker plugin, which will transparently block ads in all pages you
// create using puppeteer.
import { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } from "npm:puppeteer";
import AdblockerPlugin from "npm:puppeteer-extra-plugin-adblocker";
import { execCommand } from "./execCommand.js";

// at the end magnet link will get added
const aria2cCommand = "aria2c --bt-metadata-only=true --bt-save-metadata=true ";


(async () => {
    puppeteer.use(
        AdblockerPlugin({
            // Optionally enable Cooperative Mode for several request interceptors
            interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY,
            blockTrackers: true, // default: false
        })
    );

    const browser = await puppeteer.launch({
        headless: false,
        args: [
            `--window-size=1520,800`,
            "--no-sandbox",
            "--disable-setuid-sandbox",
        ],
        defaultViewport: {
            width: 1520,
            height: 800,
        },
    });

    let page = await browser.newPage();
    await page.goto("https://thepiratebay.org");

    while (true) {
        const pages = await browser.pages();

        let blankPage = false;

        for (page of pages) {
            if ((await page.url()) === "about:blank") {
                blankPage = true;
            }
        }

        // If blank page is closed, that means we can begin scrapping
        if (!blankPage) {
            executeDownloading(browser);
            break;
        }

        await sleep(2000);
    }

    
})();

async function executeDownloading(browser) {
    const pages = await browser.pages();

    // get magnet links with function
    const magnets = await getMagnetLinks(pages);

    // Download torrent files
    await downloadAll(magnets);

    // Download is complete, close browser
    await browser.close();
    Deno.exit();
}

function downloadAll(urls, concurrency = 2) {
    const limit = pLimit(concurrency);
    const promises = urls.map((url, _idx) =>
        limit(() => execCommand(aria2cCommand + `"${url}"`))
    );
    return Promise.all(promises);
}

async function getMagnetLinks(pages) {
    const magnets = [];

    for (const page of pages) {
        const url = await page.url();

        if (!url.includes("thepiratebay.org/description.php?id=")) {
            continue;
        }

        const magnet = await page.evaluate(() => {
            const links = document.querySelectorAll("#d>a");
            let link = "";

            for (x of links) {
                if (x.href.includes("magnet:")) {
                    link = x.href;
                }
            }

            return link;
        });

        magnets.push(magnet);
    }

    return magnets;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
