let p = require("puppeteer");
let challenges = require("./challenges");

let id = "bajarag434";
let pw = "8)9R%m8.rQwq&CZ";

(async function () {
  let browser = await p.launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized"],
  });

  let pages = await browser.pages();
  let page = pages[0];

  await page.goto("https://www.hackerrank.com/auth/login");

  await page.type("#input-1", id);
  await page.type("#input-2", pw);

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2" }),
    page.click(".ui-btn.ui-btn-large.ui-btn-primary.auth-button.ui-btn-styled"),
  ]);

  await page.click('div[data-analytics="NavBarProfileDropDown"]');

  await page.waitForSelector(
    'a[data-analytics="NavBarProfileDropDownAdministration"]',
    { visible: true }
  );

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2" }),
    page.click('a[data-analytics="NavBarProfileDropDownAdministration"]'),
  ]);

  // reached admin page

  await page.waitForSelector(".nav-tabs.nav.admin-tabbed-nav", {
    visible: true,
  });

  let liElements = await page.$$(".nav-tabs.nav.admin-tabbed-nav li"); // query selector all

  let manageChallengeLi = liElements[1];

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2" }),
    manageChallengeLi.click(), // direct method click (but applied on element)
  ]);

  //   console.log("Reached challenge page!");

  await addModerators(page, browser);
})();

async function addModerators(page, browser) {
  await page.waitForSelector(".backbone.block-center", {
    visible: true,
  });

  let allQuesATags = await page.$$(".backbone.block-center");

  let allQuesLinks = [];
  for (let i = 0; i < allQuesATags.length; i++) {
    let quesLink = await page.evaluate(function (el) {
      return el.getAttribute("href");
    }, allQuesATags[i]);

    allQuesLinks.push("https://hackerrank.com" + quesLink);
  }

  //   console.log(allQuesALinks);

  let allQuesModAddPromise = [];
  for (let i = 0; i < allQuesLinks.length; i++) {
    let newTab = await browser.newPage();
    let oneQuesModAddPromise = addModeratorToASingleQues(
      newTab,
      allQuesLinks[i]
    );
    allQuesModAddPromise.push(oneQuesModAddPromise);
  }

  await Promise.all(allQuesModAddPromise);

  let allLis = await page.$$(".pagination li");
  let nextBtn = allLis[allLis.length - 2];

  let isDisabled = await page.evaluate(function (elem) {
    return elem.classList.contains("disabled");
  }, nextBtn);

  if (isDisabled) {
    // if next btn is disabled !!!
    return;
  }
  // when next btn was not disabled !!!
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2" }),
    nextBtn.click(),
  ]);

  await addModerators(page, browser);
}

async function addModeratorToASingleQues(newTab, quesLink) {
  await newTab.goto(quesLink);
  await newTab.waitForTimeout(5000);
  await newTab.waitForSelector('li[data-tab="moderators"]', { visible: true });
  await Promise.all([
    newTab.waitForNavigation({ waitUntil: "networkidle2" }),
    newTab.click('li[data-tab="moderators"]'),
  ]);
  await newTab.waitForSelector("#moderator", { visible: true });
  await newTab.type("#moderator", "rajma_chawal");
  await newTab.waitForTimeout(100);
  await newTab.keyboard.press("Enter");
  await newTab.click(".save-challenge.btn.btn-green");
  await newTab.waitForTimeout(2000);
  await newTab.close();
}
