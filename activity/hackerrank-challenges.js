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

  await page.waitForSelector(".btn.btn-green.backbone.pull-right", {
	visible: true,
  });

  let createChallengeBtn = await page.$(".btn.btn-green.backbone.pull-right");

  let createChallengeLink = await page.evaluate(function (el) {
	// browser m chalega ye
	return el.getAttribute("href");
  }, createChallengeBtn);

  createChallengeLink = `https://www.hackerrank.com${createChallengeLink}`;
  // console.log(createChallengeLink);

  for (let i = 0; i < challenges.length; i++) {
    let newPage = await browser.newPage();
    await challengeAdd(newPage, challenges[i], createChallengeLink);
  }
})();

async function challengeAdd(newTab, challenge, createChallengeLink) {
  // {
  //     "Challenge Name": "Pep_Java_1GettingStarted_1IsPrime",
  //     "Description": "Question 1",
  //     "Problem Statement": "Take as input a number n. Determine whether it is prime or not. If it is prime, print 'Prime' otherwise print 'Not Prime.",
  //     "Input Format": "Integer",
  //     "Constraints": "n <= 10 ^ 9",
  //     "Output Format": "String",
  //     "Tags": "Basics",
  //     "Testcases": [
  //       {
  //         "Input": "7",
  //         "Output": "Prime"
  //       },
  //       {
  //         "Input": "9",
  //         "Output": "Not Prime"
  //       }
  //     ]
  //   }
  let challengeName = challenge["Challenge Name"];
  let description = challenge["Description"];
  let problemStatement = challenge["Problem Statement"];
  let inputFormat = challenge["Input Format"];
  let constrainsts = challenge["Constraints"];
  let outputFormat = challenge["Output Format"];
  let tags = challenge["Tags"];

  await newTab.goto(createChallengeLink);
  // await newTab.waitForTimeout(5000);
  // enter details of challenge in ui from challenge object
  await newTab.waitForSelector("#name", { visible: true });
  await newTab.type("#name", challengeName);
  await newTab.type("#preview", description);
  await newTab.waitForSelector(
	"#problem_statement-container .CodeMirror textarea",
	{ visible: true }
  );
  await newTab.type(
	"#problem_statement-container .CodeMirror textarea",
	problemStatement
  );
  await newTab.type(
	"#input_format-container .CodeMirror textarea",
	inputFormat
  );
  await newTab.type(
	"#constraints-container .CodeMirror textarea",
	constrainsts
  );
  await newTab.type(
	"#output_format-container .CodeMirror textarea",
	outputFormat
  );
  await newTab.type("#tags_tag", tags);
  await newTab.keyboard.press("Enter");
  await newTab.click(".save-challenge.btn.btn-green");
  await newTab.waitForTimeout(30000);
  await newTab.close();
}
