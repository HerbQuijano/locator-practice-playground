// practice.js
let currentChallenge;
let score = 0;

const challengeBank = {
  easy: [
    {
      text: "Find the element with class 'target-element'",
      hint: "Use a CSS selector like .target-element or //*[@class='target-element'] in XPath.",
      check: el => el.classList.contains("target-element") && el.getAttribute("data-challenge-id") === "target-element"
    },
    {
      text: "Find the button with text 'Click Me'",
      hint: "Use XPath like //button[normalize-space()='Click Me'] or CSS like button.",
      check: el => el.tagName === "BUTTON" && el.getAttribute("data-challenge-id") === "click-me-button"
    },
    {
      text: "Find the label with text 'Username'",
      hint: "Try //label[text()='Username']",
      check: el => el.tagName === "LABEL" && el.getAttribute("data-challenge-id") === "username-label"
    },
    {
      text: "Find a span containing the word 'span'",
      hint: "Try //span[contains(text(),'span')]",
      check: el => el.tagName === "SPAN" && el.getAttribute("data-challenge-id") === "helpful-span"
    },
    {
      text: "Find an input with placeholder 'Email'",
      hint: "Try //input[@placeholder='Email'] or input[placeholder='Email']",
      check: el => el.tagName === "INPUT" && el.getAttribute("data-challenge-id") === "email-input"
    },
    {
      text: "Find a link (anchor) with the text 'Click here'",
      hint: "Try //a[text()='Click here'] or CSS a:text('Click here') if supported",
      check: el => el.tagName === "A" && el.getAttribute("data-challenge-id") === "anchor-click"
    },
    {
      text: "Find a paragraph with the word 'Description'",
      hint: "Try //p[contains(text(),'Description')]",
      check: el => el.tagName === "P" && el.getAttribute("data-challenge-id") === "description-paragraph"
    },
    {
      text: "Find a div with data-test-id='login-box'",
      hint: "Try //*[@data-test-id='login-box'] or [data-test-id='login-box']",
      check: el => el.tagName === "DIV" && el.getAttribute("data-test-id") === "login-box"
    }
  ],
  medium: [
    {
      text: "Find the second button on the page",
      hint: "Use (//button)[2] in XPath",
      check: el => el.tagName === "BUTTON" && Array.from(document.querySelectorAll("button"))[1] === el
    },
    {
      text: "Find an element with class starting with 'btn-'",
      hint: "Try XPath //*[starts-with(@class, 'btn-')]",
      check: el => el.className.startsWith("btn-")
    },
    {
      text: "Find an element that contains the word 'Item'",
      hint: "Try //*[contains(text(),'Item')]",
      check: el => el.textContent.includes("Item")
    }
  ],
  hard: [
    {
      text: "Find the last <div> on the page",
      hint: "Try (//div)[last()]",
      check: el => el.tagName === "DIV" && el === Array.from(document.querySelectorAll("div")).pop()
    },
    {
      text: "Find a button inside a div with class 'wrapper'",
      hint: "Try //div[contains(@class,'wrapper')]//button",
      check: el => el.tagName === "BUTTON" && el.closest(".wrapper") !== null
    },
    {
      text: "Find an element that has both 'btn' and 'active' classes",
      hint: "Use CSS .btn.active or XPath //*[@class='btn active']",
      check: el => el.classList.contains("btn") && el.classList.contains("active")
    }
  ]
};

function normalizeText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

  function setChallenge(level) {
  const challenges = challengeBank[level] || challengeBank.easy;
  const rand = Math.floor(Math.random() * challenges.length);
  currentChallenge = challenges[rand];
  document.getElementById("challenge-text").textContent = currentChallenge.text;
}

function init() {
  const level = document.getElementById("difficulty").value;
  setChallenge(level);
  createRandomElements(level);
  document.getElementById("locator-input").value = "";
  document.getElementById("feedback").textContent = "";
  document.getElementById("hint-box").textContent = "";
}

function checkLocator() {
  const input = document.getElementById("locator-input").value.trim();
  const learningMode = document.getElementById("learning-mode").checked;
  let selectedElement = null;
  try {
    if (input.startsWith("/") || input.startsWith("(")) {
      const result = document.evaluate(input, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      selectedElement = result.singleNodeValue;
    } else {
      selectedElement = document.querySelector(input);
    }
  } catch (e) {
    document.getElementById("feedback").textContent = "Invalid locator.";
    return;
  }

  if (selectedElement && currentChallenge.check(selectedElement)) {
    score++;
    document.getElementById("feedback").textContent = "✅ Correct!";
  } else {
    document.getElementById("feedback").innerHTML = "❌ Incorrect.";
    if (learningMode) showLearningHint();
  }
  document.getElementById("score").textContent = score;
}

function resetScore() {
  score = 0;
  document.getElementById("score").textContent = score;
  document.getElementById("feedback").textContent = "";
}

function showHint() {
  const hintBox = document.getElementById("hint-box");
  if (currentChallenge?.hint) {
    hintBox.innerHTML = `💡 <strong>Hint:</strong> ${currentChallenge.hint}`;
  } else {
    hintBox.textContent = "No hint available for this challenge.";
  }
}

function showLearningHint() {
  const allElements = document.querySelectorAll("*");
  let matchingElement = null;
  for (const el of allElements) {
    if (currentChallenge.check(el)) {
      matchingElement = el;
      break;
    }
  }
  if (matchingElement) {
    matchingElement.style.outline = "3px dashed orange";
    matchingElement.scrollIntoView({ behavior: "smooth", block: "center" });
    const tag = matchingElement.tagName.toLowerCase();
    const id = matchingElement.id;
    const className = matchingElement.classList[0];
    let cssSelector;
    if (id) {
      cssSelector = `#${id}`;
    } else if (className) {
      cssSelector = `.${Array.from(matchingElement.classList).join('.')}`;
    } else {
      cssSelector = matchingElement.tagName.toLowerCase();
    }
    const xpath = generateSimpleXPath(matchingElement);

    const hintHTML = document.createElement("div");
    hintHTML.className = "hint";
    hintHTML.innerHTML = `
      🧠 <strong>Learning Mode:</strong><br/>
      ✔️ Correct element found: <code>&lt;${tag}&gt;</code><br/>
      🔍 Example CSS: <code>${cssSelector}</code><br/>
      🔍 Absolute XPath: <code>${xpath}</code><br/>
      🔍 Relative XPath: <code>${generateRelativeXPath(matchingElement)}</code>
    `;
    document.getElementById("feedback").appendChild(hintHTML);
  }
}

function generateSimpleXPath(el) {
  if (el.id) return `//*[@id="${el.id}"]`;
  const parts = [];
  while (el && el.nodeType === Node.ELEMENT_NODE) {
    let index = 1;
    let sibling = el.previousElementSibling;
    while (sibling) {
      if (sibling.tagName === el.tagName) index++;
      sibling = sibling.previousElementSibling;
    }
    const tag = el.tagName.toLowerCase();
    parts.unshift(`${tag}[${index}]`);
    el = el.parentElement;
  }
  return "/" + parts.join("/");
}

function generateRelativeXPath(el) {
  const tag = el.tagName.toLowerCase();
  const text = normalizeText(el.textContent);

  if (el.id) return `//*[@id='${el.id}']`;
  if (el.hasAttribute("data-challenge-id")) return `//*[@data-challenge-id='${el.getAttribute("data-challenge-id")}']`;
  if (text && text.length < 50) return `//${tag}[normalize-space(text())='${text}']`;
  if (el.classList.length > 0) return `//${tag}[contains(@class, '${Array.from(el.classList).join(" ")}')]`;
  if (el.name) return `//${tag}[@name='${el.name}']`;

  const all = Array.from(document.getElementsByTagName(tag));
  const index = all.indexOf(el) + 1;
  return `//${tag}[${index}]`;
}


function toggleTheme() {
  document.body.classList.toggle("dark");
}

function createRandomElements(level) {
  const container = document.getElementById("random-elements");
  container.innerHTML = "";

  const elements = [];

  // Always add 2-3 non-challenge random elements
  const distractorConfigs = [
    { tag: "div", text: "Box One" },
    { tag: "span", text: "Unrelated info" },
    { tag: "label", text: "Other label" },
    { tag: "input", placeholder: "Not email" },
    { tag: "button", text: "Press me" },
    { tag: "a", text: "Visit here" },
    { tag: "p", text: "Paragraph about nothing" }
  ];

  for (let i = 0; i < 5; i++) {
    const rand = distractorConfigs[Math.floor(Math.random() * distractorConfigs.length)];
    const el = document.createElement(rand.tag);
    el.className = "box";
    if (rand.text) el.textContent = rand.text;
    if (rand.placeholder) {
      el.placeholder = rand.placeholder;
      el.type = "text";
    }
    elements.push(el);
  }

  let targetElement;
  const text = currentChallenge.text;

  if (text.includes("class 'target-element'")) {
    targetElement = document.createElement("div");
    targetElement.className = "target-element box challenge-target";
    targetElement.setAttribute("data-challenge-id", "target-element");
  }

  if (text.includes("button with text 'Click Me'")) {
    targetElement = document.createElement("button");
    targetElement.textContent = "Click Me";
    targetElement.setAttribute("data-challenge-id", "click-me-button");
    targetElement.className = "box challenge-target";
  }

  if (text.includes("label with text 'Username'")) {
    targetElement = document.createElement("label");
    targetElement.textContent = "Username";
    targetElement.setAttribute("data-challenge-id", "username-label");
    targetElement.className = "box challenge-target";
  }

  if (text.includes("span containing the word 'span'")) {
    targetElement = document.createElement("span");
    targetElement.textContent = "a helpful span of text";
    targetElement.className = "box challenge-target";
    targetElement.setAttribute("data-challenge-id", "helpful-span");
  }

  if (text.includes("data-test-id='login-box'")) {
    targetElement = document.createElement("div");
    targetElement.setAttribute("data-test-id", "login-box");
    targetElement.className = "box challenge-target";
  }

  if (text.includes("an input with placeholder 'Email'")) {
    targetElement = document.createElement("input");
    targetElement.setAttribute("data-challenge-id", "email-input");
    targetElement.placeholder = "Email";
    targetElement.type = "text";
    targetElement.className = "box challenge-target";
  }

  if (text.includes("paragraph with the word 'Description'")) {
    targetElement = document.createElement("p");
    targetElement.setAttribute("data-challenge-id", "description-paragraph");
    targetElement.textContent = "This is a Description paragraph.";
    targetElement.className = "box challenge-target";
  }

  if (text.includes("link (anchor) with the text 'Click here'")) {
    targetElement = document.createElement("a");
    targetElement.setAttribute("data-challenge-id", "anchor-click");
    targetElement.textContent = "Click here";
    targetElement.href = "#";
    targetElement.className = "box challenge-target";
  }

 if (text.includes("second button on the page")) {
    const btn1 = document.createElement("button");
    btn1.textContent = "First button";
    btn1.className = "box";
    elements.push(btn1);

    const btn2 = document.createElement("button");
    btn2.textContent = "Second button";
    btn2.className = "box challenge-target";
    elements.push(btn2);
  } else if (text.includes("class starting with 'btn-'")) {
    const btnStyled = document.createElement("div");
    btnStyled.className = "btn-primary box challenge-target";
    elements.push(btnStyled);
  } else if (targetElement) {
    const insertIndex = Math.floor(Math.random() * (elements.length + 1));
    elements.splice(insertIndex, 0, targetElement);
  }

  elements.forEach(el => container.appendChild(el));
}

window.onload = () => {
  init();
};
