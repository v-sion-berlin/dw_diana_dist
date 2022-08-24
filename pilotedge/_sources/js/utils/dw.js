/* global CustomEvent, Event */

/**
 * @file This file is the start entry for framework functions and is
 * needed by all templates to work.
 * @author v-sion GmbH <contact@v-sion.de>
 * @version 1.13
 */

/**
 * To use cache control for stylesheets or scripts rename 'href' to 'data-href'
 * and 'src' to 'data-src' in the head section.
 * <code><link data-href="{name-of-resource-file}.css" rel="stylesheet"></code>
 * <code><script data-src="{name-of-resource-file}.js"></script></code>
 * @since 1.00
 * @deprecated because no file is using this
 */
const initializeResources = () => {
  const elements = document.querySelectorAll('link, script')
  // There was no definition
  const LAST_CHANGE = undefined

  for (const element of elements) {
    if (element.hasAttribute('data-href') || element.hasAttribute('data-src')) {
      const uriAttr = element.hasAttribute('data-href') ? 'href' : 'src'
      const uri = element.getAttribute(`data-${uriAttr}`)
      const attr = document.createAttribute(uriAttr)
      attr.value = `${uri}?t=${LAST_CHANGE}`
      element.setAttributeNode(attr)
      element.removeAttribute('data-' + uriAttr)
    }
  }
}

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
  let count = 0;
  const elements = document.querySelectorAll('.dw-dnd-wrapper')
  if (elements) {
    const module = await import('./draggable.js')
    const Draggable = module.default

    for (const element of elements) {
      Draggable.initialize(element, "dwn-dnd-" + count++);
    }
  }
}

/**
 * Loads the <code>[Dropdown module]{@link Dropdown}</code> if it is not loaded already.
 * @since 1.00
 */
const initializeDropdowns = async () => {
  /* DEPRECATED: .dw-dropdown-native */
  const elements = document.querySelectorAll('.dw-dropdown, .dw-dropdown-native')
  if (elements) {
    const module = await import('./dropdown.js')
    const Dropdown = module.default

    for (const element of elements) {
      Dropdown.initialize(element)
    }
  }
}

/**
 * Add timing section with offset and duration (mosart).
 * Loads the <code>[Timing module]{@link Timing}</code> if it is not loaded already.
 * @since 1.12
 */
const initializeSectionTiming = async () => {
  const element = document.querySelector('.dw-mosart-info')

  if (element) {
    const module = await import('./timing.js')
    const Timing = module.default

    Timing.initialize(element)
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
  languageSelect.addEventListener('change', (e) => {
    const hasRtl = languageSelect.options[languageSelect.selectedIndex].hasAttribute('rtl')
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
  languageSelect.addEventListener('change', (e) => {
    const hasTranslation = languageSelect.options[languageSelect.selectedIndex].hasAttribute('translation')
    translationDiv.dataset.visible = hasTranslation
  })

  document.addEventListener('vizPayloadReady', () =>
    languageSelect.dispatchEvent(new Event('change'))
  )
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
  initializeResources()
  initializeInputs()
  initializeDraggables()
  initializeDropdowns()
  initializeSectionTiming()
})
