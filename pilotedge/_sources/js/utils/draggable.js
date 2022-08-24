/**
 * @file Provides drag and drop functions via the html 5 api.
 * Drag and drop doesn't change the dom structure. It just sets the co to the
 * correct value.
 * @author v-sion GmbH <contact@v-sion.de>
 * @version 1.00
 */

/* global vizrt */

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
  static initialize (element, id) {
    element.setAttribute("id", id);
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

      draggable.addEventListener('dragover', (e) => e.preventDefault())

      draggable.addEventListener('drop', (e) => {
        e.preventDefault()
        const oldIndex = Number(e.dataTransfer.getData('text'))
        const newIndex = index
        const draggables = draggable.closest('.dw-dnd__section').querySelectorAll('.dw-dnd')

        console.log('drop ', draggables)
        const factor = newIndex > oldIndex ? 1 : -1
        const condition = newIndex > oldIndex ? (i) => i < newIndex : (i) => i > newIndex

        for (let i = oldIndex; condition(i); i += factor) {
          const coElements = draggables[i].querySelectorAll('[data-co]')
          const coElementsNext = draggables[i + factor].querySelectorAll('[data-co]')

          for (let i = 0; i < coElements.length; i++) {
            if (
              vizrt && vizrt.payloadhosting &&
              vizrt.payloadhosting.isPayloadReady()
            ) {
              if (vizrt.payloadhosting.fieldExists(coElements[i].dataset.co)) {
                if (
                  vizrt.payloadhosting.getFieldMediaType(
                    coElements[i].dataset.co
                  ) === "application/atom+xml;type=entry;media=image"
                ) {
                  const current = vizrt.payloadhosting.getFieldXml(
                    coElements[i].dataset.co
                  );
                  const next = vizrt.payloadhosting.getFieldXml(
                    coElementsNext[i].dataset.co
                  );
                  vizrt.payloadhosting.setFieldXml(
                    coElements[i].dataset.co,
                    next
                  );
                  vizrt.payloadhosting.setFieldXml(
                    coElementsNext[i].dataset.co,
                    current
                  );
                } else {
                  const current = vizrt.payloadhosting.getFieldText(
                    coElements[i].dataset.co
                  );
                  const next = vizrt.payloadhosting.getFieldText(
                    coElementsNext[i].dataset.co
                  );
                  vizrt.payloadhosting.setFieldText(
                    coElements[i].dataset.co,
                    next
                  );
                  vizrt.payloadhosting.setFieldText(
                    coElementsNext[i].dataset.co,
                    current
                  );
                }
              }
            }
          }
        }
      })
    })
  }
}

export default Draggable
