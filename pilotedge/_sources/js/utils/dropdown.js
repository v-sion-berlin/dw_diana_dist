/**
 * @file Provides functions for the styled drop downs.
 * @author v-sion GmbH <contact@v-sion.de>
 * @version 1.00
 */

/* global Event */
/* global MutationObserver */
/* global Option */
/* global nlw */

console.debug('loading dropdown.js')

/**
 * Dropdown class
 *
 * Gives the abbility to create custom style dropdown.
 * @hideconstructor
 */
class Dropdown {
  /**
   * Initializes the native dropdown - adds automatically options if the needed data-attributes are present
   * @param {HTMLElement} element HTML element
   * @since 1.00
   * @instance
   */
  static initialize (element) {
    // If data-nlw-table und data-nlw-keys is defined we can dynamically fill the dropdown
    if (element.dataset.nlwTable && element.dataset.nlwKeys) {
      createNLWOptions(element)
    }

    if (element.parentNode.classList.contains('dw-colorDropdown')) {
      initializeColorDropdown(element)
    }
  }
}

export default Dropdown

const createNLWOptions = (element) => {
  const table = element.dataset.nlwTable

  const NLW = nlw.data
  NLW.load(table)
  if (NLW.error) {
    console.log(NLW.error)
  } else {
    const data = {}
    let [keyType, keyIndex] = element.dataset.nlwKeys.split(':')

    if (!isNaN(keyIndex)) {
      keyIndex = Number(keyIndex)
    }

    if (keyType === 'column') {
      data.keys = NLW.column(keyIndex)
    } else if (keyType === 'row') {
      data.keys = NLW.row(keyIndex)
    }

    // If the data-nlw-values is defined we use this data to set the values of the dropdown options
    let [valueType, valueIndex] = element.dataset.nlwValues?.split(':') || [undefined, undefined]

    // If valueIndex is a Number, than parse to Number
    if (!isNaN(valueIndex)) {
      valueIndex = Number(valueIndex)
    }

    if (valueType === 'column') {
      data.values = NLW.column(valueIndex)
    } else if (valueType === 'row') {
      data.values = NLW.row(valueIndex)
    } else {
      data.values = Array.from({ length: data.keys.length }, (x, i) => i + 0)
    }

    // If the data-nlw-prefix is defined we use this preifx to add it before every value
    [valueType, valueIndex] = element.dataset.nlwPrefix?.split(':') || [undefined, undefined]
    if (valueType === 'column') {
      data.prefixes = NLW.column(valueIndex)
    } else if (valueType === 'row') {
      data.prefixes = NLW.row(valueIndex)
    } else if (valueType === 'cell') {
      const prefix = NLW.cell(valueIndex.substring(0, 1), valueIndex.substring(1))
      data.prefixes = Array(data.values.length).fill(prefix)
    } else {
      data.prefixes = Array(data.values.length).fill(element.dataset.nlwPrefix)
    }

    const startIndex = element.dataset.nlwStartIndex || 0
    for (let i = startIndex; i < data.keys.length; i++) {
      const newOption = new Option(data.keys[i], data.prefixes[i] ? data.prefixes[i] + data.values[i] : data.values[i])
      element.add(newOption, undefined)
    }
  }
}

/**
 * Handles Value change of native dropdown in case of color indicator present
 * @since 1.00
 */
const initializeColorDropdown = (element) => {
  element.addEventListener('change', (event) => {
    const colorIndicator = element.parentNode.querySelector('.dw-colorIndicator')
    const colorValue = element.options[element.selectedIndex].dataset.color
    colorIndicator.style.backgroundColor = colorValue || '#fff'
  })
  element.dispatchEvent(new Event('change'))
}
