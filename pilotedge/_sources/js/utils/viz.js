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
