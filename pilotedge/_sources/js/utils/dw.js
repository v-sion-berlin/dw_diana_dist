/**
 * @file This file is the start entry for framework functions and is
 * needed by all templates to work.
 * @author v-sion GmbH <contact@v-sion.de>
 * @version 1.00
 */

/**
 * If CSS or JavaScript has changed, change the timestamp to force the browser
 * to reload the resource files located in the head section.
 *
 * Added 2021-12-06 <mps-berlin@dw.com>
 *
 * @since 1.00
 */
const LAST_CHANGE = Date.parse('2022-01-24 14:48:00')

/**
 * To use cache control for stylesheets or scripts rename 'href' to 'data-href'
 * and 'src' to 'data-src' in the head section.
 * <code><link data-href="{name-of-resource-file}.css" rel="stylesheet"></code>
 * <code><script data-src="{name-of-resource-file}.js"></script></code>
 *
 * Added 2021-12-06 <mps-berlin@dw.com>
 *
 * @since 1.00
 */
const initializeResources = () => {
  const elements = document.querySelectorAll('link, script')

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
    const module = await import(`./input.js?t=${LAST_CHANGE}`)
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
    const module = await import(`./draggable.js?t=${LAST_CHANGE}`)
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
  /* DEPRECATED: .dw-dropdown-native */
  const elements = document.querySelectorAll('.dw-dropdown, .dw-dropdown-native')
  if (elements) {
    const module = await import(`./dropdown.js?t=${LAST_CHANGE}`)
    const Dropdown = module.default

    for (const element of elements) {
      Dropdown.initialize(element)
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

document.addEventListener('DOMContentLoaded', () => {
  initializeResources()
  initializeInputs()
  initializeDraggables()
  initializeDropdowns()
})
