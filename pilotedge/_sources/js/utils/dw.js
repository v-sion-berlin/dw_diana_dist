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
 * Defines a global variable window.datestamp that contains the actual
 * timestamp. This can be used during <code>[generating auto titles]{@link generateAutoTitle}</code>.
 * @returns {String} The datestamp.
 * @since 1.00
 * @global
 */
window.datestamp = () => {
  const today = new Date()
  const formatter = new Intl.NumberFormat('de-DE', { minimumIntegerDigits: 2 })
  return `${formatter.format(today.getMonth() + 1)}${formatter.format(today.getDate())}`
}

document.addEventListener('DOMContentLoaded', () => {
  initializeInputs()
  initializeDraggables()
  initializeDropdowns()
})
