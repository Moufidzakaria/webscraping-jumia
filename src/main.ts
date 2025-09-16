import { PlaywrightCrawler } from 'crawlee';
import fs from 'fs';

async function start() {
    let allProducts: { title: string; price: string }[] = [];

    const crawler = new PlaywrightCrawler({
        headless: true,

        async requestHandler({ page, request }) {
            console.log(`Crawling URL: ${request.url}`);

            // Aller sur Jumia
            await page.goto(request.url);

            // Rechercher "iPhone 13"
            await page.waitForSelector('#fi-q');
            await page.fill('#fi-q', 'iPhone 13');
            await page.click('xpath=//*[@id="search"]/button');

            // Fonction pour scraper une page de produits
            async function scrapeProducts() {
                await page.waitForSelector('xpath=//*[@id="jm"]/main/div[2]/div[3]/section/div[2]');
                const products = await page.$$('xpath=//*[@id="jm"]/main/div[2]/div[3]/section/div[2]//article');
                console.log(`Nombre de produits trouvés: ${products.length}`);

                for (const product of products) {
                    // Récupération sécurisée du titre
                    const title = await product.$eval('h3', el => el.textContent?.trim() ?? 'Titre manquant');
                    const price = await product.$eval('.prc', el => el.textContent?.trim() ?? 'Prix manquant');

                    const item = { title, price };
                    allProducts.push(item);
                    console.log(item);
                }
            }

            // Scraper toutes les pages
            let hasNextPage = true;
            while (hasNextPage) {
                await scrapeProducts();

                const nextPageButton = await page.$('a.pg[aria-label="Page suivante"]');
                if (nextPageButton) {
                    console.log('➡️ Aller à la page suivante...');
                    await nextPageButton.click();
                    await page.waitForTimeout(3000);
                } else {
                    console.log('🚫 Pas de page suivante.');
                    hasNextPage = false;
                }
            }
        },
    });

    await crawler.run(['https://www.jumia.ma/']);

    // Sauvegarde des résultats
    fs.writeFileSync('products.json', JSON.stringify(allProducts, null, 2), 'utf-8');
    console.log('✅ Les produits ont été sauvegardés dans products.json');
}

start();
