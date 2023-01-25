/* global CustomEvent */

/**
 * @file This file is the start entry for framework functions and is
 * needed by all templates to work.
 * @author v-sion GmbH <contact@v-sion.de>
 * @version 1.00
 */

/**
 * Loads the <code>[Input module]{@link Input}</code> if it is not loaded already.
 * @since 1.00
 */
const initializeInputs = async () => {
  const elements = document.querySelectorAll('textarea, select, [type="number"], [type="date"], [type="text"], [type="range"]')

  if (elements) {
    const module = await import('./input.js')
    const Input = module.default

    for (const element of elements) {
      Input.initialize(element)
    }
  }
}

/**
 * Loads the <code>[Draggable module]{@link Draggable}</code> if it is not loaded already.
 * @since 1.00
 */
const initializeDraggables = async () => {
  const elements = document.querySelectorAll('.dw-dnd-wrapper')
  if (elements) {
    const module = await import('./draggable.js')
    const Draggable = module.default

    for (const element of elements) {
      Draggable.initialize(element)
    }
  }
}

/**
 * Loads the <code>[Dropdown module]{@link Dropdown}</code> if it is not loaded already.
 * @since 1.00
 */
const initializeDropdowns = async () => {
  const elements = document.querySelectorAll('.dw-dropdown')
  if (elements) {
    const module = await import('./dropdown.js')
    const Dropdown = module.default

    for (const element of elements) {
      Dropdown.initialize(element)
    }
  }
}

/**
 * Adds a larger image version to the Image Select Thumbnail and shows it on hover
 * @since 1.00
 */
const initializeImageThumbs = async () => {
  const elements = document.querySelectorAll(".dw-imgSelect");
  if (elements) {

    for (const element of elements) {
      // create hover image
      const src = element.querySelector(".dw-imgThumb img").getAttribute("src");
      if (src) {
        const imgLarge = document.createElement("div");
        const img = document.createElement("img");
        imgLarge.classList.add("dw-imgLarge");
        imgLarge.classList.add("hidden");
        img.setAttribute('src', src);
        imgLarge.appendChild(img);
        element.append(imgLarge);
      }

      element
        .querySelector(".dw-imgThumb")
        .addEventListener("mouseover", (event) => {
          const imgLarge =
            event.target.parentElement.parentElement.querySelector(
              ".dw-imgLarge"
            );
          imgLarge.classList.remove("hidden");

          element.addEventListener("mouseout", (event) => {
            if (!imgLarge.classList.contains("hidden")) {
              imgLarge.classList.add("hidden");
              event.target.parentElement.parentElement.parentElement
                .querySelector(".dw-imgSelect")
                .removeEventListener("mousemove", event);
            }
          });
        });
    }
  }
}

/**
 * Defines a global variable window.datestamp that contains the actual
 * timestamp. This can be used during <code>[generating auto titles]{@link generateAutoTitle}</code>.
 * @returns {String} The datestamp.
 * @since 1.00
 * @global
 */
window.datestamp = () => {
  const today = new Date()
  const formatter = new Intl.NumberFormat('de-DE', { minimumIntegerDigits: 2 })
  return `${formatter.format(today.getMonth() + 1)}${formatter.format(
    today.getDate()
  )}`
}

/**
 * Defines a global function that can handle ltr/rtl changes
 * @param {String} queryLanguageSelect querySelector for selecting the language selection control
 * @param {String} queryDirectionDiv querySelector for getting the div that handles the direction
 * @since 1.13
 * @global
 */
window.initializeDirectionSwitch = (queryLanguageSelect, queryDirectionDiv) => {
  const languageSelect = document.querySelector(queryLanguageSelect)
  const directionDiv = document.querySelector(queryDirectionDiv)
  if (!languageSelect) {
    console.error(`window.initializeDirectionSwitch(queryLanguageSelect, queryDirectionDiv): parameter queryLanguageSelect (${queryLanguageSelect}) doesn't give valid node.`)
    return
  }

  if (!directionDiv) {
    console.error(`window.initializeDirectionSwitch(queryLanguageSelect, queryDirectionDiv): parameter directionDiv (${directionDiv}) doesn't give valid node.`)
    return
  }
  languageSelect.addEventListener('change', (e) => {
    const selectedOption = languageSelect.options[languageSelect.selectedIndex]
    const hasRtl = selectedOption.hasAttribute('rtl') || selectedOption.hasAttribute('data-rtl')
    if (hasRtl) {
      directionDiv.classList.add('dw-direction-rtl')
    } else {
      directionDiv.classList.remove('dw-direction-rtl')
    }
  })

  document.addEventListener('vizPayloadReady', () => {
    // WE're using a custom event here to pass additional data. That way we can
    // distinguish between initial change call and change events that are fired
    // by the user.
    languageSelect.dispatchEvent(new CustomEvent('change', { detail: 'dw.js' }))
  })
}

/**
 * Defines a global function that shows a div if the attribute translation is present in the language selection
 * @param {String} queryLanguageSelect querySelector for selecting the language selection control
 * @param {String} queryTranslationDiv querySelector for getting the div that contains the translation controls
 * @since 1.13
 * @global
 */
window.initializeTranslationPanel = (queryLanguageSelect, queryTranslationDiv) => {
  const languageSelect = document.querySelector(queryLanguageSelect)
  const translationDiv = document.querySelector(queryTranslationDiv)
  if (!languageSelect) {
    console.error(`window.initializeTranslationPanel(queryLanguageSelect, queryTranslationDiv): parameter queryLanguageSelect (${queryLanguageSelect}) doesn't give valid node.`)
    return
  }

  if (!translationDiv) {
    console.error(`window.initializeTranslationPanel(queryLanguageSelect, queryTranslationDiv): parameter queryTranslationDiv (${queryTranslationDiv}) doesn't give valid node.`)
    return
  }
  languageSelect.addEventListener('change', (e) => {
    const selectedOption = languageSelect.options[languageSelect.selectedIndex]
    const hasTranslation = selectedOption.hasAttribute('translation') || selectedOption.hasAttribute('data-translation')
    translationDiv.dataset.visible = hasTranslation
  })

  document.addEventListener('vizPayloadReady', () => {
    languageSelect.dispatchEvent(new CustomEvent('change', { detail: 'dw.js' }))
  })
}

/**
 * Function for capitalizing strings
 * @param {String} text the text that shall be capitalized
 * @returns {String} capitalized text
 * @since 1.13
 * @global
 */
window.capitalize = (text) => {
  return text.replace(/^\w/, (c) => c.toUpperCase())
}

document.addEventListener('DOMContentLoaded', () => {
  initializeInputs()
  initializeDraggables()
  initializeDropdowns()
  initializeImageThumbs();
})
