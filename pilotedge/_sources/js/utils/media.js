/**
 * @file Provides functions and events to control control objects for
 * images and clips. The <code>{@link Image.createBinding}</code> function adds the events
 * for the html controls and provides the binding to viz.
 * @author v-sion GmbH <contact@v-sion.de>
 * @version 1.00
 */

/**
 * @typedef {Object} ImageCOResult
 * @property {String} url VizOne uri to the image
 * @property {String} title Title information about the image
 * @since 1.00
 * @memberof Media
 */

/* global vizrt */

console.debug('loading media.js')

/**
 * Media class
 *
 * Gives the abbility to create the viz binding and to use extra functions on
 * for images.
 * @hideconstructor
 */
class Media {
  /**
   * Creates the value binding between html control and viz
   * @param {HTMLElement} element HTML element
   * @returns {Object} newFieldCallback callback to receive data if the controlobject changed
   * @since 1.00
   * @instance
   */
  static createBinding (imageElement) {
    const fieldPath = imageElement.dataset.co
    imageElement.querySelector('.select')?.addEventListener('click', this.showImageDialog.bind(this, fieldPath))
    imageElement.querySelector('.remove')?.addEventListener('click', this.removeImage.bind(this, fieldPath))

    return (value) => {
      const imageObject = this.getImageCO(fieldPath)

      if (!this.validImageFile(imageObject.title)) {
        this.removeImage(fieldPath)
      } else {
        this.setImage(imageElement, imageObject)
      }
    }
  }

  /**
   * Starts the image dialog
   * @param {String} fieldPath The fieldpath of the control object
   * @param {String} editRequestParameters Parameters for preselecting settings of the dialog.
   * @see [editField]{@link vizrt.PayloadHosting#editField}
   * @since 1.00
   * @instance
   */
  static showImageDialog (fieldPath, editRequestParameters) {
    if (vizrt.payloadhosting.isPayloadReady()) {
      if (vizrt.payloadhosting.fieldExists(fieldPath)) {
        vizrt.payloadhosting.editField(fieldPath, editRequestParameters)
      }
    }
  }

  /**
   * Removes a selected image
   * @param {String} fieldPath The fieldpath of the control object
   * @since 1.00
   * @instance
   */
  static removeImage (fieldPath) {
    if (vizrt.payloadhosting.isPayloadReady()) {
      if (vizrt.payloadhosting.fieldExists(fieldPath)) {
        vizrt.payloadhosting.setFieldXml(fieldPath, null)
      }
    }
  }

  /**
   * Extracts the url and title from the returned xml.
   * @param {String} fieldPath The fieldpath of the control object
   * @returns {ImageCOResult} Title and url
   * @since 1.00
   * @instance
   */
  static getImageCO (fieldPath) {
    let url = ''
    let title = ''
    if (vizrt.payloadhosting.fieldExists(fieldPath)) {
      const imageEntry = vizrt.payloadhosting.getFieldXml(fieldPath)
      if (imageEntry) {
        url = imageEntry.querySelector('thumbnail')?.getAttribute('url')
        if (!url) {
          url = imageEntry.querySelector('content')?.innerHTML
        }

        title = imageEntry.querySelector('title')?.innerHTML
      }
    }
    return { url, title }
  }

  /**
   * Sets the image src of the html control to the given image object
   * @param {HTMLElement} imageElement The html control that shows the image
   * @param {Object} imageObject The image object that contains title and url
   * @since 1.00
   * @instance
   */
  static setImage (imageElement, imageObject) {
    const imageValue = imageElement.querySelector('.dw-imgThumb img')
    imageValue.src = imageObject.url
    imageValue.dataset.title = imageObject.title

    if (imageObject.url) {
      imageElement.classList.add('image--state-loaded')
      imageElement.classList.remove('image--state-empty')
    } else {
      imageElement.classList.remove('image--state-loaded')
      imageElement.classList.add('image--state-empty')
    }
  }

  /**
   * Checks whether is image file is valid
   * @param {String} fileName The filename
   * @param {Boolean} imageIsValid true if the image is valid otherwise false
   * @since 1.00
   * @instance
   */
  static validImageFile (fileName) {
    return !/(.psd|.psd)$/.test(fileName)
  }
}

export default Media
