# Torrent downloader

https://github.com/user-attachments/assets/6686ed86-7b16-4626-83f6-818e9f2ed969

## Features

- Gets all manget links from opened `thepiratebay` tabs
- Converts all magnet links to torrent files via **aria2c**
- Has adblocker to avoid any annoyance.



### How to use

1. When you run `bun index.js` or `npm index.js` it will open puppeteer controlled browser, and [thepiratebay.org](https://thepiratebay.org) website in the new tab.
2. Then just search up whatever you want to, and open links by `middle click` on your mouse, to open it in the new tab.
3. After you have opened all of the links you want to download, just close the first tab of the browser aka the `about:blank` tab
4. After that, puppeteer will collect all of the magnet links from tabs you have opened
5. Nodejs will use aria2c to convert magnet links to torrent files 
6. Select all .torrent files, and open them



### Purpose 

It gives you somewhat easy way to open links on thepiratebay website, and then, when you have opened enough links, it will help you to get .torrent files for all of the links that you have opened. So you don't have to paste all the magnet links into the torrent client, which is annoying when you have a lot of links you want to download.

After that, you can open all the .torrent files with a single click, by just selecting them all, and pressing enter.



### Why I made this?

I wanted to download the whole season of "The Boys", but since the season just came out, no one has made a complete season torrent link yet, and copying multiple links into the torrent client is quite annoying, so I made this script.

