/**
 * @file Provides drag and drop functions via the html 5 api.
 * Drag and drop doesn't change the dom structure. It just sets the co to the
 * correct value.
 * @author v-sion GmbH <contact@v-sion.de>
 * @version 1.17
 */

/* global Event, vizrt */

console.debug('loading draggable.js')

/**
 * Draggable class
 *
 * Gives the abbility to create a draggable.
 * @hideconstructor
 */
class Draggable {
  /**
   * Initializes the drag and drop functionallity
   * @param {HTMLElement} element HTML element
   * @since 1.00
   * @instance
   */
  static initialize (element) {
    document.addEventListener('dragover', this.handleValidDropAreas)

    const draggables = element.querySelectorAll('.dw-dnd')
    draggables.forEach((draggable, index) => {
      draggable.setAttribute('draggable', true)
      draggable.addEventListener('mousedown', (e) => { draggable.target = e.target })

      const handle = draggable.querySelector('.dw-dnd__handle')
      draggable.addEventListener('dragstart', (e) => {
        if (handle.contains(draggable.target)) {
          e.dataTransfer.setData('text/plain', index)
        } else {
          e.preventDefault()
        }
      })

      draggable.addEventListener('dragover', (e) => {
        e.preventDefault()
      })

      draggable.addEventListener('drop', (e) => {
        e.preventDefault()
        const oldIndex = Number(e.dataTransfer.getData('text'))
        const newIndex = index
        const draggables = draggable.closest('.dw-dnd__section').querySelectorAll('.dw-dnd')

        const factor = newIndex > oldIndex ? 1 : -1
        const condition = newIndex > oldIndex ? (i) => i < newIndex : (i) => i > newIndex

        for (let i = oldIndex; condition(i); i += factor) {
          const coElements = draggables[i].querySelectorAll('[data-co]')
          const coElementsNext = draggables[i + factor].querySelectorAll('[data-co]')

          for (let j = 0; j < coElements.length; j++) {
            if (vizrt && vizrt.payloadhosting && vizrt.payloadhosting.isPayloadReady()) {
              if (vizrt.payloadhosting.fieldExists(coElements[j].dataset.co)) {
                if (vizrt.payloadhosting.getFieldMediaType(coElements[j].dataset.co) === 'application/atom+xml;type=entry;media=image') {
                  const current = vizrt.payloadhosting.getFieldXml(coElements[j].dataset.co)
                  const next = vizrt.payloadhosting.getFieldXml(coElementsNext[j].dataset.co)
                  vizrt.payloadhosting.setFieldXml(coElements[j].dataset.co, next)
                  vizrt.payloadhosting.setFieldXml(coElementsNext[j].dataset.co, current)
                } else {
                  const current = vizrt.payloadhosting.getFieldText(coElements[j].dataset.co)
                  const next = vizrt.payloadhosting.getFieldText(coElementsNext[j].dataset.co)
                  vizrt.payloadhosting.setFieldText(coElements[j].dataset.co, next)
                  vizrt.payloadhosting.setFieldText(coElementsNext[j].dataset.co, current)

                  if (coElements[j].classList.contains('dw-dropdown')) {
                    coElements[j].dispatchEvent(new Event('change'))
                    coElementsNext[j].dispatchEvent(new Event('change'))
                  }
                }
              }
            }
          }
        }
      })
    })
  }

  /**
   * Checks whether the dragged element is over a valid drop zone. Prevents for
   * dropping an element over an input field.
   * @param {Event} e The fired dragover event
   * @since 1.17
   */
  static handleValidDropAreas (e) {
    if (!e.target.closest('.dw-dnd__section')) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'none'
    } else {
      e.dataTransfer.dropEffect = 'move'
    }
  }
}

export default Draggable
