/* global CustomEvent, Event */

/**
 * @file This file is the start entry for framework functions and is
 * needed by all templates to work.
 * @author v-sion GmbH <contact@v-sion.de>
 * @version 1.12
 */

/**
 * To use cache control for stylesheets or scripts rename 'href' to 'data-href'
 * and 'src' to 'data-src' in the head section.
 * <code><link data-href="{name-of-resource-file}.css" rel="stylesheet"></code>
 * <code><script data-src="{name-of-resource-file}.js"></script></code>
 * @since 1.00
 */
const initializeResources = () => {
  const elements = document.querySelectorAll("link, script");

  for (const element of elements) {
    if (element.hasAttribute("data-href") || element.hasAttribute("data-src")) {
      const uriAttr = element.hasAttribute("data-href") ? "href" : "src";
      const uri = element.getAttribute(`data-${uriAttr}`);
      const attr = document.createAttribute(uriAttr);
      attr.value = `${uri}?t=${LAST_CHANGE}`;
      element.setAttributeNode(attr);
      element.removeAttribute("data-" + uriAttr);
    }
  }
};

/**
 * Loads the <code>[Input module]{@link Input}</code> if it is not loaded already.
 * @since 1.00
 */
const initializeInputs = async () => {
  const elements = document.querySelectorAll(
    'textarea, select, [type="number"], [type="date"], [type="text"], [type="range"]'
  );

  if (elements) {
    const module = await import("./input.js");
    const Input = module.default;

    for (const element of elements) {
      Input.initialize(element);
    }
  }
};

/**
 * Loads the <code>[Draggable module]{@link Draggable}</code> if it is not loaded already.
 * @since 1.00
 */
const initializeDraggables = async () => {
  const elements = document.querySelectorAll(".dw-dnd-wrapper");
  if (elements) {
    const module = await import("./draggable.js");
    const Draggable = module.default;

    for (const element of elements) {
      Draggable.initialize(element);
    }
  }
};

/**
 * Loads the <code>[Dropdown module]{@link Dropdown}</code> if it is not loaded already.
 * @since 1.00
 */
const initializeDropdowns = async () => {
  /* DEPRECATED: .dw-dropdown-native */
  const elements = document.querySelectorAll(
    ".dw-dropdown, .dw-dropdown-native"
  );
  if (elements) {
    const module = await import("./dropdown.js");
    const Dropdown = module.default;

    for (const element of elements) {
      Dropdown.initialize(element);
    }
  }
};

/**
 * Add timing section with offset and duration (mosart).
 * Loads the <code>[Timing module]{@link Timing}</code> if it is not loaded already.
 * @since 1.12
 */
const initializeSectionTiming = async () => {
  const element = document.querySelector(".dw-mosart-info");

  if (element) {
    const module = await import("./timing.js");
    const Timing = module.default;

    Timing.initialize(element);
  }
};

/**
 * Add contact section.
 * @since 1.12
 */
const initializeSectionContact = () => {
  const div = () => {
    return document.createElement("div");
  };

  //const divWrapper = document.body.appendChild(div())
  //divWrapper.classList.add('field-group')

  const divContact = div();
  divContact.classList.add("dw-footer");
  const spanContact = document.createElement("span");
  spanContact.innerHTML = "Contact: echtzeitgrafik@dw.com";
  divContact.append(spanContact);
  document.body.append(divContact);
};

/**
 * Defines a global variable window.datestamp that contains the actual
 * timestamp. This can be used during <code>[generating auto titles]{@link generateAutoTitle}</code>.
 * @returns {String} The datestamp.
 * @since 1.00
 * @global
 */
window.datestamp = () => {
  const today = new Date();
  const formatter = new Intl.NumberFormat("de-DE", { minimumIntegerDigits: 2 });
  return `${formatter.format(today.getMonth() + 1)}${formatter.format(
    today.getDate()
  )}`;
};

/**
 * Defines a global function that can handle ltr/rtl changes
 * @param {String} queryLanguageSelect querySelector for selecting the language selection control
 * @param {String} queryDirectionDiv querySelector for getting the div that handles the direction
 * @since 1.13
 * @global
 */
window.initializeDirectionSwitch = (queryLanguageSelect, queryDirectionDiv) => {
  const languageSelect = document.querySelector(queryLanguageSelect);
  const directionDiv = document.querySelector(queryDirectionDiv);
  languageSelect.addEventListener("change", (e) => {
    const footer = document.querySelector(".dw-footer");
    const hasRtl =
      languageSelect.options[languageSelect.selectedIndex].hasAttribute("rtl");
    if (hasRtl) {
      if (footer) {
        footer.classList.add("dw-direction-rtl");
        // footer.classList.remove("dw-direction-ltr");
      }
      directionDiv.classList.add("dw-direction-rtl");
      // directionDiv.classList.remove("dw-direction-ltr");
    } else {
      if (footer) {
        footer.classList.remove("dw-direction-rtl");
        // footer.classList.add("dw-direction-ltr");
      }
      directionDiv.classList.remove("dw-direction-rtl");
      // directionDiv.classList.add("dw-direction-ltr");
    }
  });

  document.addEventListener("vizPayloadReady", () => {
    // WE're using a custom event here to pass additional data. That way we can
    // distinguish between initial change call and change events that are fired
    // by the user.
    languageSelect.dispatchEvent(
      new CustomEvent("change", { detail: "dw.js" })
    );
  });
};

/**
 * Defines a global function that shows a div if the attribute translation is present in the language selection
 * @param {String} queryLanguageSelect querySelector for selecting the language selection control
 * @param {String} queryTranslationDiv querySelector for getting the div that contains the translation controls
 * @since 1.13
 * @global
 */
window.initializeTranslationPanel = (
  queryLanguageSelect,
  queryTranslationDiv
) => {
  const languageSelect = document.querySelector(queryLanguageSelect);
  const translationDiv = document.querySelector(queryTranslationDiv);
  languageSelect.addEventListener("change", (e) => {
    const hasTranslation =
      languageSelect.options[languageSelect.selectedIndex].hasAttribute(
        "translation"
      );
    translationDiv.dataset.visible = hasTranslation;
  });

  document.addEventListener("vizPayloadReady", () =>
    languageSelect.dispatchEvent(new Event("change"))
  );
};

/**
 * Function for capitalizing strings
 * @param {String} text the text that shall be capitalized
 * @returns {String} capitalized text
 * @since 1.13
 * @global
 */
window.capitalize = (text) => {
  return text.replace(/^\w/, (c) => c.toUpperCase());
};

window.checkWordLength = (textQuery, maxWordLength, warningTextQuery) => {
  /* checks, if input text is too long given a certain maxLength

  also activates or hides a warning (given a warningTextQuery for the related object) for too long input
  */

  console.log(document.querySelector(textQuery))
  const textObject = document.querySelector(textQuery)
  let string

  if (textObject.classList.contains('dw-textarea')) {
    string = textObject.value
  } else if (textObject.classList.contains('text')) {
    string = textObject.dataset.value
  }

  const warningTextObject = document.querySelector(warningTextQuery)

  let toolong = false
  console.log(string.split(' '))
  string.split(' ').forEach(element => {
    if (element.length > maxWordLength) {
      toolong = true
      textObject.classList.remove('dw-highlight-yellow')
      textObject.classList.add('dw-highlight-red')
      warningTextObject.classList.remove('hidden')
    }

    if (element.length > maxWordLength - 5 && element.length <= maxWordLength) {
      toolong = true
      warningTextObject.classList.add('hidden')
      textObject.classList.add('dw-highlight-yellow')
      textObject.classList.remove('dw-highlight-red')
    }
  });

  if (toolong === false) {
    textObject.classList.remove('dw-highlight-yellow')
    textObject.classList.remove('dw-highlight-red')
    warningTextObject.classList.add('hidden')
  }
};

window.replaceUmlauts = (string) => {
  string = string.replace(/ä/g, 'ae')
  string = string.replace(/ö/g, 'oe')
  string = string.replace(/ü/g, 'ue')
  string = string.replace(/ß/g, 'ss')
  string = string.replace(/Ä/g, 'Ae')
  string = string.replace(/Ö/g, 'Oe')
  string = string.replace(/Ü/g, 'Ue')
  return string
};

function entitiesHtml(string) {
  return String(string)
    .replace(/&/g, "&amp;")
    .replace(/>/g, "&gt;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

document.addEventListener("DOMContentLoaded", () => {
  initializeResources();
  initializeInputs();
  initializeDraggables();
  initializeDropdowns();
  initializeSectionTiming();
  initializeSectionContact();
});
