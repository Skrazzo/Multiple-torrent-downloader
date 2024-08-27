// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra");
// const pLimit = require("p-limit");
import pLimit from "p-limit";

// Add adblocker plugin, which will transparently block ads in all pages you
// create using puppeteer.
const { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } = require("puppeteer");
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
const { execCommand } = require("./execCommand");

// at the end magnet link will get added
const aria2cCommand = "aria2c --bt-metadata-only=true --bt-save-metadata=true ";

process.on("SIGINT", function () {
    console.log("Interrupt signal");
    process.exit();
});

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
        args: [`--window-size=1520,800`],
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
    let magnets = await getMagnetLinks(pages);

    // Download torrent files
    await downloadAll(magnets);
    process.exit();
}

async function downloadAll(urls, concurrency = 2) {
    const limit = pLimit(concurrency);
    const promises = urls.map((url, _idx) =>
        limit(() => execCommand(aria2cCommand + `"${url}"`))
    );
    return Promise.all(promises);
}

async function getMagnetLinks(pages) {
    let magnets = [];

    for (let page of pages) {
        let url = await page.url();

        if (!url.includes("thepiratebay.org/description.php?id=")) {
            continue;
        }

        let magnet = await page.evaluate(() => {
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
