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
   * Creates the value binding between html control and viz.
   * @param {HTMLElement} element HTML element
   * @returns {Object} newFieldCallback callback to receive data if the controlobject changed
   * @since 1.00
   * @instance
   */
  static createBinding (imageElement) {
    const fieldPath = imageElement.dataset.co
    const searchTerms = imageElement.dataset.searchterms

    // Click events
    imageElement.querySelector('.select')?.addEventListener('click', this.showImageDialog.bind(this, fieldPath, searchTerms))
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
   * Starts the image dialog.
   * @param {String} fieldPath The fieldpath of the control object
   * @param {String} editRequestParameters Parameters for preselecting settings of the dialog.
   * @see [editField]{@link vizrt.PayloadHosting#editField}
   * @since 1.00
   * @instance
   */
  static showImageDialog (fieldPath, searchTerms) {
    if (vizrt.payloadhosting.isPayloadReady()) {
      if (vizrt.payloadhosting.fieldExists(fieldPath)) {
        const terms = searchTerms ? window[searchTerms]() : ''

        // Little helper to build vizOne search query.
        // Options:
        //   1. Pass self defined search query string.
        //   2. Pass json object with defined keys.
        //      Like {'show': 'abc', 'title': 'xyz'}
        //   3. Pass Nothing.
        //
        // Passed object parameter are joined like this (=> option 2. and 3.):
        // ------------------------------------------------------------------------
        // KEY                  TYPE               SEARCH              QUERY JOINER
        // ------------------------------------------------------------------------
        // 'show'               (string)           is                  AND
        // 'language'           (string)           is                  AND
        // 'studio'             (string)           is                  AND
        // 'title'              (string)           contains            AND
        // 'siteIdentity'       (string)           is                  OR
        // 'creationDate'       (string)           is                  AND
        // 'usageDate'          (string)           is                  AND
        // 'imageSize'          (object)           -                   AND
        // 'imageSize.width'    (integer|string)   is                  - 
        // 'imageSize.height'   (integer|string)   is                  -
        // ------------------------------------------------------------------------
        //
        // @author Deutsche Welle <mps-gs@dw.com>
        // @since 1.17
        //
        const isObject = (object) => { return object.constructor === ({}).constructor }
        const imageElement = document.querySelector(`[data-co="${fieldPath}"]`)
        const imageInputs = this.getImageElements(imageElement)
        
        if (isObject(terms) || terms === '') {
          let imageSearchQuery = []
          let imageSearchSettings = {}
          // Image size
          if (terms.hasOwnProperty('imageSize')) {
            let width = terms.imageSize?.width
            let height = terms.imageSize?.height
            if (width && height) imageSearchQuery.push(['AND', `dw.imagesize:${width}*${height}`])
          } else {
            // Try to get asset image size from hint
            if (imageInputs.imageSize) {
              let hintString = imageInputs.imageSize.innerHTML
              let numbers = hintString.match(/(-\d+|\d+)(,\d+)*(\.\d+)*/g)
              if (numbers && numbers.length === 2) {
                let [width, heigth] = numbers
                imageSearchQuery.push(['AND', `dw.imagesize:${width}*${heigth}`])
              }
            }
          }
          // Show
          if (terms.hasOwnProperty('show')) {
            if (terms.show !== '') imageSearchQuery.push(['AND', `dw.show#dw.showKey:${terms.show}`])
          } else {
            // Try to get 'show' from image element attribute
            let dwShow = imageElement.dataset.searchshow
            if (dwShow != null && dwShow != undefined) {
              imageSearchQuery.push(['AND', `dw.show#dw.showKey:${dwShow}`])
            }
          }
          // Language
          if (terms.hasOwnProperty('language')) {
            if (terms.language !== '') imageSearchQuery.push(['AND', `dw.language:${terms.language}`])
          } else {
            // Try to get 'language' from image dropdown
            if (imageInputs.language) {
              let languageSelected = imageInputs.language.value
              if (languageSelected) {
                imageSearchQuery.push(['AND', `dw.language:${languageSelected}`])
                imageSearchSettings['language'] = languageSelected
              }
            }
          }
          // Studio
          if (terms.hasOwnProperty('studio')) {
            if (terms.studio !== '') imageSearchQuery.push(['AND', `dw.studios/dw.studio:${terms.studio}`])
          } else {
            // Try to get 'studio' from image dropdown
            if (imageInputs.studio) {
              let studioSelected = imageInputs.studio.value
              if (studioSelected) {
                imageSearchQuery.push(['AND', `dw.studios/dw.studio:${studioSelected}`])
                imageSearchSettings['studio'] = studioSelected
              }
            }
          }
          // Creation date
          if (terms.hasOwnProperty('creationDate')) {
            if (terms.creationDate !== '') imageSearchQuery.push(['AND', `search.creationDate:${terms.creationDate}'`])
          } else {
            // Try to get creation date from datepicker
            if (imageInputs.creationDate && imageInputs.creationDate.value !== '') {
              let ingestDate = `[${imageInputs.creationDate.value}T00:00:00Z TO ${imageInputs.creationDate.value}T23:59:59Z]`
              imageSearchQuery.push(['AND', `search.creationDate:${ingestDate}`])
              imageSearchSettings['creationDate'] = imageInputs.creationDate.value
            }
          }
          // Usage date
          if (terms.hasOwnProperty('usageDate')) {
            if (terms.usagedate !== '') imageSearchQuery.push(['AND', `dw.usagedate:${terms.usagedate}'`])
          } else {
            // Try to get usage date from datepicker
            if (imageInputs.usageDate && imageInputs.usageDate.value !== '') {
              imageSearchQuery.push(['AND', `dw.usagedate:${imageInputs.usageDate.value}`])
              imageSearchSettings['usageDate'] = imageInputs.usageDate.value
            }
          }
          // Title
          if (terms.hasOwnProperty('title')) {
            if (terms.title !== '') imageSearchQuery.push(['AND', `asset.title:${terms.title}`])
          } else {
            // Try to get asset 'title' fom input
            if (imageInputs.title && imageInputs.title.value !== '') {
              let title = imageInputs.title.value.trim()
              imageSearchQuery.push(['AND', `asset.title:*${title}*`])
              imageSearchSettings['title'] = title
            }
          }
          // Site ID
          // Special case: remove all search terms. 'AND' / 'OR' is not recognized
          if (terms.hasOwnProperty('siteIdentity')) {
            if (terms.siteIdentity !== '') imageSearchQuery.push(['OR ', `asset.siteIdentity:${siteIdentity}`])
          } else {
            // Try to get 'siteIdentity' from input
            if (imageInputs.siteIdentity && imageInputs.siteIdentity.value !== '') {
              imageSearchQuery = []
              imageSearchQuery.push(['OR', `asset.siteIdentity:${imageInputs.siteIdentity.value}`])
              imageSearchSettings['siteIdentity'] = imageInputs.siteIdentity.value
            }
          }
          // Save search parameter
          let pseudofieldPath = imageElement.dataset.searchco
          if (vizrt.payloadhosting.isPayloadReady()) {
            if (vizrt.payloadhosting.fieldExists(pseudofieldPath)) {
              let objectString = btoa(JSON.stringify(imageSearchSettings))
              vizrt.payloadhosting.setFieldText(pseudofieldPath, objectString)
            }
          }
          // Join search terms
          let imageSearchString = ''
          imageSearchQuery.forEach((singleSearchItem, index) => {
            // First search term needs no operator
            if (index === 0) singleSearchItem.shift()
            imageSearchString += ` ${singleSearchItem.join(' ')}`
          })
          vizrt.payloadhosting.editField(fieldPath, { searchTerms: imageSearchString.trim() })
        } else {
          vizrt.payloadhosting.editField(fieldPath, { searchTerms: terms })
        }
      }
    }
  }

  /**
   * Removes a selected image.
   * @param {String} fieldPath The fieldpath of the control object
   * @since 1.00
   * @instance
   */
  static removeImage (fieldPath) {
    if (vizrt.payloadhosting.isPayloadReady()) {
      if (vizrt.payloadhosting.fieldExists(fieldPath)) {
        // Null or empty is not working correctly, set viz db empty image instead
        // vizrt.payloadhosting.setFieldXml(fieldPath, null)
        // vizrt.payloadhosting.setFieldXml(fieldPath, '')
        vizrt.payloadhosting.setFieldXml(fieldPath, 'IMAGE*/noname')
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
   * Get image elements (inputs, date, drobdown).
   * @param {HTMLElement} imageElement The html control that shows the image
   * @returns {ImageInputs} Image, title, language...
   * @since 1.18
   * @instance
   */
  static getImageElements (imageElement) {
    return {
      // Label
      'imageSize': imageElement?.querySelector('div[data-search="imageSize"]'),
      // Inputs
      'title': imageElement?.querySelector('input[data-search="title"]'),
      'language': imageElement?.querySelector('select[data-search="language"]'),
      'studio': imageElement?.querySelector('select[data-search="studio"]'),
      'creationDate' : imageElement?.querySelector('input[data-search="creationDate"]'),
      'usageDate' : imageElement?.querySelector('input[data-search="usageDate"]'), 
      'siteIdentity': imageElement?.querySelector('input[data-search="siteIdentity"]')
    }
  }

  /**
   * Sets the image src of the html control to the given image object.
   * @param {HTMLElement} imageElement The html control that shows the image
   * @param {Object} imageObject The image object that contains title and url
   * @since 1.00
   * @instance
   */
  static setImage (imageElement, imageObject) {
    const imageValue = imageElement.querySelector('.dw-imgThumb img')
    imageValue.src = imageObject.url
    imageValue.dataset.title = imageObject.title

    // Set search parameter, if pseudo field was defined
    let pseudofieldPath = imageElement.dataset.searchco
    if (vizrt.payloadhosting.isPayloadReady()) {
      if (vizrt.payloadhosting.fieldExists(pseudofieldPath)) {
        let imageSettingsString = vizrt.payloadhosting.getFieldText(pseudofieldPath)
        if (imageSettingsString) {
          // Try to read search parameter
          let imageSearchSettings = {}
          try {
            imageSearchSettings = JSON.parse(atob(imageSettingsString))
          } catch(e) {}
          const imageInputs = this.getImageElements(imageElement)
          // Set inputs
          for (const [name, element] of Object.entries(imageInputs)) {
            if (imageSearchSettings.hasOwnProperty(name)) {
              if (element && (element.tagName === 'SELECT' || element.tagName === 'INPUT')) {
                element.value = imageSearchSettings[name]
              }
            }
          } 
          // Disable inputs (optional)
          if (imageSearchSettings.hasOwnProperty('siteIdentity')) {
            for (const [name, element] of Object.entries(imageInputs)) {
              if (element && (element.tagName === 'SELECT' || element.tagName === 'INPUT')) {
                if (name !== 'siteIdentity') element.setAttribute('disabled', '')
              }
            }
          }
        }
      }
    }
    // CSS
    if (imageObject.url) {
      imageElement.classList.add('image--state-loaded')
      imageElement.classList.remove('image--state-empty')
      imageElement.querySelector('.remove').removeAttribute('disabled')
    } else {
      // Set default image if possible
      if (imageValue?.dataset.placeholder !== null) imageValue.src = imageValue.dataset.placeholder 
      imageElement.classList.remove('image--state-loaded')
      imageElement.classList.add('image--state-empty')
      imageElement.querySelector('.remove').setAttribute('disabled', '')
    }
  }

  /**
   * Checks whether is image file is valid.
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
