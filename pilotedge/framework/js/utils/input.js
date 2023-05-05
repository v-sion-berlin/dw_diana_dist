/**
 * @file This file contains all functions needed to enhance input html
 * controls, like text inputs, number inputs, date inputs, textareas...
 * @author v-sion GmbH <contact@v-sion.de>
 * @version 1.00
 */

/**
 * @typedef {Object} BindingResult
 * @property {Object} newFieldCallback callback to receive data if the controlobject changed
 * @property {Object} newEventCallback callback to update the control object if the html changed
 * @since 1.00
 * @memberof Input
 */

/* global Event */
/* global MutationObserver */
/* global vizrt */

console.debug('loading input.js')

const INPUT_EVENT = new Event('input')
const CHANGE_EVENT = new Event('change')

/**
 * Input class
 *
 * Gives the abbility to create the viz binding and to use extra functions on
 * inputs.
 * @hideconstructor
 */
class Input {
  /**
   * Creates the value binding between html control and viz
   * @param {HTMLElement} element HTML element
   * @returns {BindingResult} Callbacks to communicate with viz
   * @since 1.00
   * @instance
   */
  static createBinding (element) {
    const fieldPath = element.dataset.co

    const newFieldCallback = (value) => {
      if (typeof value === 'object') {
        value = value?.innerHTML
      }
      element.value = value || ''
    }
    const newEventCallback = (e) => {
      vizrt.payloadhosting.setFieldText(fieldPath, element.value === '' ? null : element.value)
    }

    return { newFieldCallback, newEventCallback }
  }

  /**
   * Initializes the given html element and adds extra functionalities
   * @param {HTMLElement} element HTML element
   * @since 1.00
   * @instance
   */
  static initialize (element) {
    if (element.tagName.toLowerCase() === 'textarea' && element.hasAttribute('data-max-rows')) {
      setTextareaMaxRows(element)
    }

    if (element.tagName.toLowerCase() === 'select') {
      initializeSelect(element)
    }

    if (element.hasAttribute('data-scrubber')) {
      createScrubber(element)
    }

    if (element.value && !element.parentNode.classList.contains('dw-quantity') && !element.tagName.toLowerCase() === 'textarea') {
      setDefaultOnDoubleClick(element)
    }

    if (element.getAttribute('type') === 'text' && element.hasAttribute('maxlength')) {
      setTextMaxLength(element)
    }

    if ((element.getAttribute('type') === 'text' || element.tagName.toLowerCase() === 'textarea') && (element.dataset.wordLengthWarning || element.dataset.wordLengthError)) {
      setTextMaxWordLength(element)
    }

    if (element.parentNode.classList.contains('dw-quantity')) {
      initializeQuantityField(element.parentNode)
    }

    if (element.classList.contains('dw-inputRange')) {
      initializeRangeSlider(element)
    }
  }
}

export default Input

/*****************************************************************************/
/* TEXTAREA
/*****************************************************************************/

/**
 * Allow to set a max number of rows for a textarea
 * @param {HTMLElement} element textarea that will get limited number of rows
 * @since 1.00
 * @memberof Input
 */
const setTextareaMaxRows = (element) => {
  element.addEventListener('input', (e) => {
    e.target.value = limitText(e.target.value, e.target.dataset.maxRows)
  })

  element.addEventListener('keydown', (e) => {
    const maxRows = e.target.dataset.maxRows
    const value = e.target.value

    if (e.keyCode === 13 && value.split('\n').length >= maxRows) {
      e.preventDefault()
    }
  })

  observer.observe(element, {
    attributes: true,
    attributeOldValue: true
  })
}
/**
 * The MutationObserver observes the textarea for changes and calls <code>{@link Input.limitText}</code> if necessary.
 * @since 1.00
 * @memberof Input
 */
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes') {
      const textarea = mutation.target
      const oldValue = Number(mutation.oldValue)
      const newValue = Number(textarea.dataset.maxRows)

      if (newValue < oldValue) {
        textarea.value = limitText(textarea.value, newValue)
        textarea.dispatchEvent(INPUT_EVENT)
      }
    }
  })
})

/**
 * Limits a text with linebreaks to a given number of rows.
 * @param {String} text Input text
 * @param {Number} maxRows Allowed number of linebreaks
 * @returns {String} limited text
 * @since 1.00
 * @memberof Input
 */
const limitText = (text, maxRows) => {
  const lines = text.split('\n')
  const adjustedValue = lines.slice(0, maxRows)
  return adjustedValue.join('\n')
}

/*****************************************************************************/
/* TEXT LENGTH
/*****************************************************************************/

/**
 * Allow to toggle the class 'hidden' dependent on the allowed maxlength of the
 * given element and the text length of the elements value. The class will be
 * toggled in the span which has to be the next sibling.
 * @param {HTMLElement} element input that contains the maxlength
 * @since 1.00
 * @memberof Input
 */
const setTextMaxLength = (element) => {
  const warningSpan = element.nextElementSibling
  element.addEventListener('input', (e) => {
    if (element.value.length < Number(element.getAttribute('maxlength'))) {
      warningSpan.classList.add('hidden')
    } else {
      warningSpan.classList.remove('hidden')
    }
  })
}

/*****************************************************************************/
/* WORD LENGTH
/*****************************************************************************/

/**
 * Allow to toggle the class 'hidden' dependent on the allowed max word length
 * of the given element and the word lengths of the elements value. The class
 * will be toggled in the span which has to be the next sibling.
 * @param {HTMLElement} element input that contains the maxlength
 * @since 1.00
 * @memberof Input
 */
const setTextMaxWordLength = (element) => {
  const warningSpan = element.nextElementSibling
  const wordLengthWarning = element.dataset.wordLengthWarning
  const wordLengthError = element.dataset.wordLengthError

  element.addEventListener('input', (event) => {
    const words = element.value.split(/\s/)

    warningSpan.dataset.visible = words.some((word) => word.length > wordLengthWarning)
    element.classList.remove('dw-highlight-yellow', 'dw-highlight-red')

    if (words.some((word) => word.length > wordLengthError)) {
      element.classList.add('dw-highlight-red')
    } else if (words.some((word) => word.length > wordLengthWarning)) {
      element.classList.add('dw-highlight-yellow')
    }
  })

  document.addEventListener('vizPayloadReady', () => element.dispatchEvent(INPUT_EVENT), { once: true })
}

/*****************************************************************************/
/* NUMBER SCRUBBING
/*****************************************************************************/

/**
 * Provides support for scrubbing numbers
 * @param {HTMLElement} element Number input
 * @since 1.00
 * @memberof Input
 */
const createScrubber = (element) => {
  element.addEventListener('mousedown', (e) => {
    const element = e.target
    const startValue = parseFloat(element.value || 0)
    const startCoordinate = e.clientX
    const maxValue = element.max || Number.MAX_SAFE_INTEGER
    const minValue = element.min || Number.MIN_SAFE_INTEGER
    const direction = 1
    const step = element.step || 1

    const globalMouseUpListener = (e) => {
      window.removeEventListener('mousemove', globalMouseMoveListener)
      if (e.clientX !== startCoordinate) {
        element.dispatchEvent(INPUT_EVENT)
        element.dispatchEvent(CHANGE_EVENT)
      }
    }

    const globalMouseMoveListener = (e) => {
      if (e.which === 1) {
        const delta =
          direction * step * Math.floor(e.clientX - startCoordinate)
        const value = Math.min(
          Math.max(startValue + delta, minValue),
          maxValue
        )
        const valueString = value.toFixed(Math.log10(1 / step))

        element.value = valueString
        element.setAttribute('value', valueString)
      } else {
        globalMouseUpListener()
      }
    }

    window.addEventListener('mousemove', globalMouseMoveListener)
    window.addEventListener('mouseup', globalMouseUpListener, { once: true })
  })
}

/*****************************************************************************/
/* DOUBLE CLICK RESET
/*****************************************************************************/

/**
 * Provides support for resetting value to default by double click
 * @param {HTMLElement} element Input
 * @since 1.00
 * @memberof Input
 */
const setDefaultOnDoubleClick = (element) => {
  element.dataset.initValue = element.value
  element.addEventListener('dblclick', (e) => {
    element.value = element.dataset.initValue
    element.dispatchEvent(INPUT_EVENT)
  })
}

/*****************************************************************************/
/* QUANTITY FIELDS
/*****************************************************************************/

/**
 * Provides support for quantity field design
 * @param {HTMLElement} element Input
 * @since 1.00
 * @memberof Input
 */
const initializeQuantityField = (element) => {
  const navigationButtons = document.createElement('div')
  navigationButtons.className = 'dw-quantity-nav'
  const buttonUp = document.createElement('div')
  buttonUp.classList.add('dw-quantity-button')
  buttonUp.classList.add('dw-quantity-up')
  const buttonDown = document.createElement('div')
  buttonDown.classList.add('dw-quantity-button')
  buttonDown.classList.add('dw-quantity-down')
  navigationButtons.appendChild(buttonUp)
  navigationButtons.appendChild(buttonDown)

  element.appendChild(navigationButtons)

  const input = element.querySelector('input[type="number"]')
  const min = input.getAttribute('min')
  const max = input.getAttribute('max')

  input.addEventListener('change', (e) => {
    input.value = Math.min(Math.max(input.value, min), max)
    input.dispatchEvent(INPUT_EVENT)
  })

  buttonUp.addEventListener('click', (e) => {
    const oldValue = parseFloat(input.value)
    let newVal
    oldValue >= max ? (newVal = oldValue) : (newVal = oldValue + 1)
    input.value = newVal
    input.dispatchEvent(INPUT_EVENT)
  })

  buttonDown.addEventListener('click', (e) => {
    const oldValue = parseFloat(input.value)
    let newVal
    oldValue <= min ? (newVal = oldValue) : (newVal = oldValue - 1)
    input.value = newVal
    input.dispatchEvent(INPUT_EVENT)
  })
}

/*****************************************************************************/
/* RANGE SLIDER
/*****************************************************************************/

/**
 * Provides support for range slider design
 * @param {HTMLElement} element Input
 * @since 1.00
 * @memberof Input
 */
function initializeRangeSlider (element) {
  const isRTL = element.closest('.dw-direction-rtl')

  element.style.setProperty('--value', isRTL ? 100 - element.value : element.value)
  element.style.setProperty('--min', element.min === '' ? '0' : element.min)
  element.style.setProperty('--max', element.max === '' ? '100' : element.max)

  const rangeValue = element.parentNode.querySelector('.rangeValue')
  if (rangeValue) {
    rangeValue.value = isRTL ? 100 - element.value : element.value
    rangeValue.addEventListener('change', (event) => {
      element.value = isRTL ? rangeValue.value : 100 - rangeValue
      element.dispatchEvent(INPUT_EVENT)
    })
  }

  // There are two elements that are connected: the slider and the rangeValue.
  // We need this to set the range value after the value of the slider was
  // set progammatically. Only called once.
  document.addEventListener('vizPayloadReady', () => element.dispatchEvent(INPUT_EVENT), { once: true })

  element.addEventListener('input', () => {
    element.style.setProperty('--value', element.value)
    if (rangeValue) {
      rangeValue.value = element.value
    }
  })
}

/*****************************************************************************/
/* SELECT
/*****************************************************************************/
/**
 * Provides special functions for select
 * @param {HTMLElement} element Input
 * @since 1.00
 * @memberof Input
 */
function initializeSelect (element) {
  if (element.options[0].disabled && element.options[0].selected) {
    element.classList.add('italic')
    element.addEventListener('change', () => {
      element.classList.remove('italic')
    }, { once: true })
  }
}
