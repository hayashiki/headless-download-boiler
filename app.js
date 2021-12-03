import express from 'express'
import puppeteer from 'puppeteer';
import  path, { resolve } from 'path'
import fs from 'fs'

const __dirname =  path.dirname(new URL(import.meta.url).pathname)
export const app = express();
const targetURL = "https://hayashiki.github.io/dummy-static-site/"

// Expressをたちあげる、メイン処理となる
app.use(async (req, res) => {
    console.info("[main] version:" + process.env.npm_package_version)

    const result = await getPDF()
    console.info(`[main] result:${result}`)
    const files = fs.readdirSync(resolve(__dirname,'.','downloads'))
    const pdfFiles = files.filter(f => f.includes('.pdf'))

    pdfFiles.forEach(fileName => {
        const targetPath = resolve(__dirname,'.', 'downloads' + '/' + fileName)
        const prefix = new Date(Date.now()).toISOString().substr(0, 10)
        // ファイル名を変更して各種ストレージサービスにアップロードするならこのあたりで処理する
        console.info(`[main] filename: ${prefix}_${fileName}, path: ${targetPath}`);
    })
    if (result) {
        console.info(`[main] Succeeded`)
        res.status(200).send("OK");
    } else {
        console.info(`[main] Failed`)
        res.status(500).send("NG");
    }
});

// Download PDF
async function getPDF() {
    let result = false;
    const browser = await puppeteer.launch({ args: ['--no-sandbox']});
    try {
        const page = await browser.newPage();
        await page._client.send('Page.setDownloadBehavior', {
            behavior : 'allow',
            downloadPath: resolve(__dirname,'.','downloads')
        });
        console.info("[getPDF] download path", resolve(__dirname,'.','downloads'))
        // ダウンロードページへ遷移
        await page.goto(targetURL)
        console.info("[getPDF] goto targetURL")
        await page.waitForSelector('#pdf1')
        console.info("[getPDF] finished download page")
        await page.click('#pdf1');
        console.info("[getPDF] download click")
        // 念の為3秒待つ
        await page.waitForTimeout(3000)
        console.info("[getPDF] download finished")
        result = true;

        // For debug
        // const html = await page.content();
        // console.log(html);

        // For debug
        // const filePath = '/tmp/screenshot.png'
        // await page.screenshot({ path: filePath, fullPage: true });
    } catch (e) {
        console.error(`[getPDF] err: ${e}`)
        result = false;
    }
    finally {
        console.log(`[getPDF] close`)
        await browser.close();
        return result
    }
}
