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
   * Initializes the dropdown functionallity
   * @param {HTMLElement} element HTML element
   * @since 1.00
   * @deprecated Will be removed when there is no custom dropdown left
   * @instance
   */
  static initialize (element) {
    // If data-nlw-table und data-nlw-keys is defined we can dynamically fill the dropdown
    if (element.dataset.nlwTable && element.dataset.nlwKeys) {
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

        const startIndex = element.dataset.nlwStartIndex || 0
        const dropdownItem = element.querySelector('.dw-dropdown__item').cloneNode(true)
        const dropdownContent = element.querySelector('.dw-dropdown__content')
        dropdownContent.innerHTML = ''
        for (let i = startIndex; i < data.keys.length; i++) {
          const newItem = dropdownItem.cloneNode(true)
          newItem.innerHTML = data.keys[i]
          newItem.dataset.value = data.values[i]
          dropdownContent.appendChild(newItem)
          addDropdownItem(newItem)
        }
      }
    }

    const button = element.querySelector('.dw-dropdown__button')
    const items = element.querySelectorAll('.dw-dropdown__item')

    if (button) {
      button.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopImmediatePropagation()
        toggleDropdownDisplay(e.target.closest('.dw-dropdown'))
      })
    }

    items.forEach((item) => {
      item.addEventListener('click', handleDropdownSelection)
      item.addEventListener('setActive', handleDropdownSelection)
    })

    if (element.dataset.defaultSelection === 'false' && element.dataset.selected !== '') {
      const selectItem = element.querySelector([".dw-dropdown__item[data-value='" + element.dataset.selected + "']"])
      button.querySelector('.dw-dropdown__button__copy').innerHTML = selectItem.innerHTML
      element.dataset.selected = selectItem.dataset.value
      const currentlySelectedItem = element.querySelector('.dw-dropdown--selected')
      if (currentlySelectedItem) {
        currentlySelectedItem.classList.remove('dw-dropdown--selected')
      }
      selectItem.classList.add('dw-dropdown--selected')
    }

    document.body.addEventListener('click', (e) => {
      if (openDropdowns.length > 0) {
        for (const dropdown of openDropdowns) {
          if (dropdown.dataset.active === 'true') {
            toggleDropdownDisplay(dropdown)
          }
        }
      }
    })

    observer.observe(element.querySelector('.dw-dropdown__content'), {
      childList: true
    })
  }

  /**
   * Initializes the native dropdown - adds automatically options if the needed data-attributes are present
   * @param {HTMLElement} element HTML element
   * @since 1.00
   * @instance
   */
  static initializeNative (element) {
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
}

const openDropdowns = []
/**
 * Adds the needed event listener to the drop down element
 * @param {HTMLElement} element
 * @since 1.00
 * @deprecated Will be removed when there is no custom dropdown left
 * @memberof Dropdown
 */
function addDropdownItem (element) {
  element.addEventListener('click', handleDropdownSelection)
  element.addEventListener('setActive', handleDropdownSelection)
}

/**
 * Toggles the visibility of the drop down list
 * @param {HTMLElement} dropdown The dropdown menu
 * @since 1.00
 * @deprecated Will be removed when there is no custom dropdown left
 * @memberof Dropdown
 */
function toggleDropdownDisplay (dropdown) {
  if (dropdown) {
    dropdown.dataset.active = dropdown.dataset.active === 'true' ? 'false' : 'true'

    if (dropdown.dataset.active) {
      openDropdowns.push(dropdown)
    } else {
      openDropdowns.splice(openDropdowns.indexOf(dropdown), 1)
    }
  }
}

/**
 * Handles the dropdown selection
 * @param {Event} event that was fired
 * @since 1.00
 * @deprecated Will be removed when there is no custom dropdown left
 * @memberof Dropdown
 */
function handleDropdownSelection (event) {
  event.preventDefault()
  let selectItem = event.target
  if (selectItem.tagName.toLowerCase() !== 'a') {
    selectItem = selectItem.closest('a')
  }
  const dropdown = selectItem.closest('.dw-dropdown')
  const button = dropdown.querySelector('.dw-dropdown__button')

  dropdown.dataset.defaultSelection = 'false'
  button.querySelector('.dw-dropdown__button__copy').innerHTML = selectItem.innerHTML
  dropdown.dataset.selected = selectItem.dataset.value
  dropdown.dispatchEvent(new Event('input'))
  const currentlySelectedItem = dropdown.querySelector('.dw-dropdown--selected')
  if (currentlySelectedItem) {
    currentlySelectedItem.classList.remove('dw-dropdown--selected')
  }
  selectItem.classList.add('dw-dropdown--selected')

  if (event.type === 'click') {
    toggleDropdownDisplay(dropdown)
  }
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      const dropdown = mutation.target.closest('.dw-dropdown')
      mutation.addedNodes.forEach((addedNode) => {
        addDropdownItem(addedNode)
        if (dropdown.dataset.selected === addedNode.dataset.value) {
          addedNode.dispatchEvent(new Event('setActive'))
        }
      })
    }
  })
})
