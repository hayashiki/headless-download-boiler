import express from 'express'
import puppeteer from 'puppeteer';
import  path, { resolve } from 'path'
import fs from 'fs'

const __dirname =  path.dirname(new URL(import.meta.url).pathname)

export const app = express();
const targetURL = "https://hayashiki.github.io/dummy-static-site/"
let gcs;

// Expressをたちあげる、メイン処理となる
app.use(async (req, res) => {
    console.info("[main] version:" + process.env.npm_package_version)

    // 並行で処理すると負荷がかかりそうなので逐次処理している、特に早く終わる必要もないので
    const res1 = await getPDF()

    console.log(`[main] result:${res1}`)
    // const filename = new Date().toISOString() + ".pdf";

    const files = fs.readdirSync(resolve(__dirname,'.','downloads'))
    const pdfFiles = files.filter(f => f.includes('.pdf'))

    const results = [];
    pdfFiles.forEach(fileName => {
        const targetFullpath = resolve(__dirname,'.', 'downloads' + '/' + fileName)
        const suffix = new Date(Date.now()).toISOString().substr(0, 10)
        console.log(`[download] filename: ${fileName}_${suffix}`);
        // writeToGcs(targetFullpath, pdfBucket, `${prefix}_${fileName}`)
        // results.push(`${prefix}_${fileName}`);
    })
    console.log(`results: ${results}`)
    const strResult = results.join(',');

    if (res1) {
        // driveと同期するGo側の処理でSlack通知する
        // await sendSlack(`Succeeded ${strResult}`)
        console.log(`Succeeded ${strResult}`)
        res.status(200).send("OK");
    } else {
        // driveと同期するGo側の処理でSlack通知する
        // await sendSlack("Failed!!")
        console.log(`Failed ${strResult}`)
        res.status(500).send("NG");
    }
});

const server = app.listen(process.env.PORT || 8080, err => {
    if (err) return console.error(err);
    const port = server.address().port;
    console.info(`App listening on port ${port}`);
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
        // const filePath = '/tmp/amex_screenshot.png'
        // await page.screenshot({ path: filePath, fullPage: true });
        // await writeToGcs(filePath, pdfBucket, "amex_screenshot.png")
    } catch (e) {
        console.error(`[getPDF] err: ${e}`)
        result = false;
    }
    finally {
        await browser.close();
        return result
    }
}
