/**
 * @file Provides functions and events to control the communication with
 * the payloadhosting.js. Provides functions to generate an auto title that
 * works reliable. Add event "vizPayloadReady" to enable other js script to
 * wait for loading viz.
 * @author v-sion GmbH <contact@v-sion.de>
 * @version 1.00
 */

/* global Event */
/* global vizrt */

console.debug('loading viz.js')

/**
 * Generates the auto title if a script has defined this function with name
 * window.generateAutoTitle().
 * @since 1.00
 * @instance
 */
const generateAutoTitle = () => {
  // It cause problems, if both functions are used
  if (window.generateAutoTitles) return

  if (typeof window.generateAutoTitle !== 'undefined') {
    setTimeout(() => {
      vizrt.payloadhosting.setFieldText('-auto-generated-title', window.generateAutoTitle())
    }, 100)
  }
}

// We want to create a new auto title every time the payload changes. The
// callback given by viz doesn't fire on every change, so we need a second
// one that is injected by us into the payloadhosting.js.
window.addEventListener('payloadChanged', generateAutoTitle)
vizrt.payloadhosting.addEventListener('payloadchange', generateAutoTitle)

/**
 * Generates the auto titles if a script has defined this function with name
 * window.generateAutoTitles().
 *
 * Fields / keys:
 * - '-auto-generated-title'      (string|array)
 * - 'ram-title'                  (string|array)
 * - 'ram-continue-points'        (string|integer)
 *
 * Possible values:
 * - 'FS Sports Rankings'         = Plain text
 * - '3'                          = String number
 * -  2                           = Integer
 * - '{GraphicType}'              = Control object field
 * - '{GLobals/GraphicType}'      = Stagged control object field
 * - '[data-co="Headline"]'       = Query selector
 * - 'input[data-co="Headline"]'  = Query selector
 * - '||'                         = Seperator one (template title)
 * - '|'                          = Seperator two (significant template content)
 *
 * Usage:
 * template title || significant template content | significant template content...
 *
 * @author Deutsche Welle <mps-gs@dw.com>
 * @since 1.17
 * @instance
 */
const generateAutoTitles = () => {
  if (typeof window.generateAutoTitles !== 'undefined') {
    setTimeout(() => {
      // Needed to change the seperators for all
      // title fields if necessary
      const SEPERATOR_ONE_MATCH = '||'
      const SEPERATOR_ONE = '||'
      const SEPERATOR_TWO_MATCH = '|'
      const SEPERATOR_TWO = '|'
      // Not allowed character in passed object array values will removed
      const REMOVE_CHARACTER = /\|/g
      // Date now
      const DATE_NOW = new Date()

      const titleObject = window.generateAutoTitles()
      if (!titleObject || typeof titleObject != 'object') return

      const getTitle = (strArray) => {
        let out = []

        const arrayRemoveSeperatorNotNeeded = (strArray, seperator) => {
          let nextItemIsSeperator = false
          let out = []
          let i = 0

          strArray.forEach(item => {
            if (item === seperator && !nextItemIsSeperator) {
              out.push(item)
              if (i < strArray.length && strArray[i+1] === seperator) nextItemIsSeperator = true
            } else if (item === seperator && nextItemIsSeperator) {
              if (i < strArray.length && strArray[i+1] !== seperator) nextItemIsSeperator = false
            } else if (item !== seperator) {
              out.push(item)
            }
            i++
          })
          if (out[out.length-1] === seperator) out.pop()
          return out
        }

        const isCoObject = (str) => {
          let pattern = /^\{(.+)\}$/
          return pattern.test(str)
        }

        const isSelector = (str) => {
          let pattern = /\[(.+)\]$/
          // Looks like selector, double check
          if (pattern.test(str)) {
            let pattern = /\[([^)]+)\]/
            let matches = pattern.exec(str)
            // Check for special character between brackets
            if (matches.length > 0) {
              let pattern = /[`^*$=\-'"]/
              let subStringBetweenBrackets = matches[1]
              return pattern.test(subStringBetweenBrackets)
            }
          }
          return false
        }

        const isSeperator = (str, seperator) => {
          return (typeof str === 'string' && str === seperator) ? true : false
        }

        const stringRemoveNotAllowedChr = (str, pattern = REMOVE_CHARACTER) => {
          return str.replace(pattern, '').trim()
        }

        const stringToArray = (array) => {
          return (Array.isArray(array)) ? array : [array]
        }

        // If string is passed, convert to array
        strArray = stringToArray(strArray)
        strArray.forEach(item => {
          // Co objects
          if (isCoObject(item)) {
            item = item.replace(/\{/g, '').replace(/\}/g, '')
            if (vizrt.payloadhosting.fieldExists(item)) {
              let coValue = vizrt.payloadhosting.getFieldText(item)
              // Image?
              if (!coValue || vizrt.payloadhosting.getFieldMediaType(item) === 'application/atom+xml;type=entry;media=video') {
                let xml = vizrt.payloadhosting.getFieldXml(item)
                if (xml) {
                  //console.log(xml)
                  let title = xml.querySelector('title')?.innerHTML
                  coValue = (title && title.trim() !== '') ? (title.substring(0, title.lastIndexOf('.')) || title) : ''
                }
              }
              if (coValue !== null && coValue.trim() !== '') out.push(stringRemoveNotAllowedChr(coValue))
            }
          // Selector
          } else if (isSelector(item)) {
            var element = document.querySelector(item)
            if (element !== null) {
              let elementType = element?.getAttribute('type')
              if (!elementType) {
                elementType = element.tagName.toLowerCase()
              }
              // Checkbox
              if (elementType === 'checkbox') {
                let label = element.parentElement?.querySelector('label')?.innerHTML
                let state = element.checked ? 'selected' : 'unselected'
                out.push((label && label.trim() !== '') ? stringRemoveNotAllowedChr(label + ' : ' + state) : state)
              // Radiobutton
              } else if (elementType === 'radio') {
                let elements = document.querySelectorAll(item)
                elements.forEach(radiobutton => {
                  if (radiobutton.checked) {
                    let text = radiobutton.parentElement?.querySelector('span')?.innerHTML
                    out.push((text && text.trim() !== '') ? stringRemoveNotAllowedChr(text) : radiobutton.value)
                  }
                })
              // Select
              } else if (elementType === 'select') {
                let text = element.options[element.selectedIndex].text
                out.push(stringRemoveNotAllowedChr(text))
              // Image
              } else if (elementType === 'image') {
                console.log('generateAutoTitles() ::', 'Error: Query selector "' + item + '" not supported. Use co object instead.')
              // other
              } else {
                if (element.value.trim() !== '') out.push(stringRemoveNotAllowedChr(element.value))
              }
            }
          // Seperator one
          } else if (isSeperator(item, SEPERATOR_ONE_MATCH)) {
            out.push(SEPERATOR_ONE)
          // Seperator two
          } else if (isSeperator(item, SEPERATOR_TWO_MATCH)) {
            out.push(SEPERATOR_TWO)
          // Plain text
          } else {
            if (String(item).trim() !== '') out.push(stringRemoveNotAllowedChr(String(item)))
          }
        })
        // Timestamp
        //out.push(SEPERATOR_TWO)
        //out.push(DATE_NOW.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' }))
        //out.push(SEPERATOR_TWO)
        //out.push(DATE_NOW.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))

        out = arrayRemoveSeperatorNotNeeded(out, SEPERATOR_ONE)
        out = arrayRemoveSeperatorNotNeeded(out, SEPERATOR_TWO)
        return out.join(' ')
      }

      const setFieldText = (titleObject, fieldName, acceptedTitle = 'text', defaultTitle = '') => {
        if (titleObject.hasOwnProperty(fieldName)) {
          if (vizrt.payloadhosting.fieldExists(fieldName)) {
            let title = getTitle(titleObject[fieldName])
            if (acceptedTitle === 'text') {
              vizrt.payloadhosting.setFieldText(fieldName, title === '' ? null : title)
            } else if (acceptedTitle === 'number') {
              vizrt.payloadhosting.setFieldText(fieldName, (!isNaN(parseInt(title))) ? parseInt(title) : defaultTitle)
            }
          }
        }
      }

      setFieldText(titleObject, '-auto-generated-title')
      setFieldText(titleObject, 'ram-title')
      setFieldText(titleObject, 'ram-continue-points', 'number', '0')
    }, 100)
  }
}

// We want to create new auto titles every time the payload changes. The
// callback given by viz doesn't fire on every change, so we need a second
// one that is injected by us into the payloadhosting.js.
window.addEventListener('payloadChanged', generateAutoTitles)
vizrt.payloadhosting.addEventListener('payloadchange', generateAutoTitles)

/**
 * Wrapper for html controls that are binded to viz via data-co attribut.
 * @param {String} fieldId The field id
 * @returns {Object} Additional functions to use with the given html control
 */
window.COElement = (fieldId) => {
  const element = document.querySelector(`[data-co="${fieldId}"]`)

  if (element) {
    return {
      get value () {
        return element.value
      },
      set value (value) {
        element.value = value
        element.dispatchEvent(new Event('input'))
      },
      getFieldText: () => {
        return vizrt.payloadhosting.getFieldText(fieldId)
      }
    }
  }
}

/**
 * Initializes viz. Uses all defined fieldValueCallbacks and injects a little
 * helper to react on payload changes, used for gnerateAutoTitle.
 * @since 1.00
 * @instance
 */
const initializeViz = () => {
  if (typeof vizrt === 'undefined') {
    return
  }

  vizrt.payloadhosting.initialize(async () => {
    const fieldCallbacks = await databinding()
    if (fieldCallbacks) {
      vizrt.payloadhosting.setFieldValueCallbacks(fieldCallbacks)
    }

    // inject own code in postMessage function for dispatching our own event
    const oldPostMessage = vizrt.payloadhosting._host.postMessage
    vizrt.payloadhosting._host.postMessage = function (data, hostOrigin) {
      oldPostMessage.apply(this, arguments)
      const messageType = data.type
      if (messageType) {
        if (messageType === 'payload_changed') {
          window.dispatchEvent(new Event('payloadChanged'))
        }
      }
    }

    console.debug('vizPayloadReady')
    document.dispatchEvent(new Event('vizPayloadReady'))
  })
}

/**
 * Connects the html control with the control objects defined by the scene.
 * Changes working bidirectional.
 * @since 1.00
 * @instance
 */
const databinding = async () => {
  const boundElements = document.querySelectorAll('[data-co]')
  const fieldCallbacks = {}

  for (const element of boundElements) {
    const fieldPath = element.dataset.co
    let elementType = element.getAttribute('type')
    if (!elementType) {
      elementType = element.dataset.type
    }
    // Some elements, like textarea has no type attribute so we're using the
    // tag name here to define our elementType.
    if (!elementType) {
      elementType = element.tagName.toLowerCase()
    }

    if (vizrt.payloadhosting.fieldExists(fieldPath)) {
      // this callback is called when the control objects is changing
      let newFieldCallback
      // this callback is called when the value of the html control changes
      let newEventCallback

      if (elementType === 'textarea' || elementType === 'number' || elementType === 'range' || elementType === 'date' || elementType === 'select' || elementType === 'text') {
        const module = await import('./input.js')
        const Input = module.default
        const callbacks = Input.createBinding(element)
        newFieldCallback = callbacks.newFieldCallback
        newEventCallback = callbacks.newEventCallback
      } else if (elementType === 'label') {
        newFieldCallback = (value) => { element.value = value }
        newEventCallback = (e) => { vizrt.payloadhosting.setFieldText(fieldPath, element.value) }
      } else if (elementType === 'checkbox') {
        newFieldCallback = (value) => { element.checked = value === 'true' }
        newEventCallback = (e) => { vizrt.payloadhosting.setFieldText(fieldPath, element.checked ? 'true' : 'false') }
      } else if (elementType === 'radio') {
        newFieldCallback = (value) => { document.querySelector(`[data-co="${fieldPath}"][value="${value}"]`).checked = true }
        newEventCallback = (e) => { vizrt.payloadhosting.setFieldText(fieldPath, document.querySelector(`[data-co="${fieldPath}"]:checked`).value) }
      } else if (elementType === 'datetime-local') {
        newFieldCallback = (value) => {
          const dateElements = value.split(':')
          element.value = `${dateElements[0]}:${dateElements[1]}`
        }
        newEventCallback = (e) => { vizrt.payloadhosting.setFieldText(fieldPath, `${element.value}:00Z`) }
      } else if (elementType === 'image') {
        const module = await import('./media.js')
        const Media = module.default
        newFieldCallback = Media.createBinding(element)
      }

      if (newFieldCallback) {
        let initValue = vizrt.payloadhosting.getFieldText(fieldPath)
        if (!initValue) {
          initValue = vizrt.payloadhosting.getFieldXml(fieldPath)
        }
        initValue = initValue || ''

        newFieldCallback(initValue)
        fieldCallbacks[fieldPath] = newFieldCallback
      }

      if (newEventCallback) {
        element.addEventListener('input', newEventCallback)
      }
    }
  }

  return fieldCallbacks
}

initializeViz()
