import puppeteer from "puppeteer";
const defaultTimeout = 600000; // 10 min
const protocolTimeout = 1200000; // 20 min

export const get_pdf = async (pdf_page) => {
  try {
    const browser = await puppeteer.launch({
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
      protocolTimeout,
    });
    const page = await browser.newPage();

    await page.goto(pdf_page, { timeout: defaultTimeout });

    await page.waitForSelector("#download-button", { timeout: defaultTimeout });

    const downloadLink = await page.$("#download-button-link");

    await Promise.all([
      downloadLink.click(),
      page.waitForNavigation({
        waitUntil: "networkidle0",
        timeout: defaultTimeout,
      }), // Wait for navigation to complete
    ]);

    const documentUrl = await page.$eval(
      '.btn-group a[href*="ext=pdf"]',
      (el) => el.href
    );

    await browser.close();
    return documentUrl;
  } catch (error) {
    console.error("Error getting download link get_pdf_err", error.message);
    return null; // Ensure to return a value even in case of an error
  }
};

export const search_pdf = async (query) => {
  try {
    const browser = await puppeteer.launch({
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
      protocolTimeout,
    });
    const page = await browser.newPage();

    await page.goto(`${process.env.QUERY_URL}${query}`, {
      timeout: defaultTimeout,
    });
    
    // Additional logging to understand where it might be failing
    console.log("Navigated to search page, waiting for selector .files-new ul");

    await page.waitForSelector(".files-new ul", { timeout: defaultTimeout });
    
    console.log("Selector .files-new ul found, extracting links");
    
    const links = await page.$$eval(".file-right a[href*='.html']", (elems) =>
      elems.slice(0, 10).map((el) => el.href)
    );

    const titles = links.map((link) => {
      const lastPart = link.substring(
        link.lastIndexOf("/") + 1,
        link.lastIndexOf("-")
      );
      const titleWithSpaces = lastPart.replace(/-/g, " ");
      const title = titleWithSpaces.replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
      return title;
    });

    const array = buildArray(titles, links);
    await browser.close();
    return array;
  } catch (error) {
    console.error("Error searching pdf search_pdf_err", error.message);
    return []; // Ensure to return a value even in case of an error
  }
};

const buildArray = (titles, links) => {
  let arr = [];
  for (let i in links) {
    arr.push({ title: titles[i], link: links[i] });
  }
  return arr;
};
