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
    const searchTerms = imageElement.dataset.searchterms

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
   * Starts the image dialog
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

        // Litte helper to build vizOne search query.
        // If:
        //   1. Json object with defined keys is passed.
        //   2. Nothing is passed. 
        //
        // If it is needed to pass a self defined vizOne search query,
        // pass arguments as simple string not as object.
        //
        // Object:
        // ------------------------------------------------------------------------
        // KEY                  TYPE               SEARCH              QUERY JOINER
        // ------------------------------------------------------------------------
        // 'show'               (string)           is                  AND
        // 'language'           (string)           is                  AND
        // 'title'              (string)           contains AND / OR   AND
        // 'siteIdentity'       (string)           contains            OR
        // 'usagedate'          (string)           is                  AND
        // 'imagesize'          (object)           -                   AND
        // 'imagesize.width'    (integer|string)   is                  - 
        // 'imagesize.height'   (integer|string)   is                  -
        // ------------------------------------------------------------------------
        //
        // Usage:
        // {'show': 'abc', ...}
        //
        // @author Deutsche Welle <mps-gs@dw.com>
        // @since 1.17
        //
        const filterJoin = (string, seperator = ' ') => {
          let array = string.split(' ').filter(element => element)
          let out = []
          array.forEach(element => { out.push(`${element}`) })
          return out.join(seperator)
        }

        const isObject = (object) => { return object.constructor === ({}).constructor }
        
        if (isObject(terms) || terms === '') {
          let searchItems = []

          if (terms.hasOwnProperty('show')) {
            if (terms.show !== '') searchItems.push(['AND', `dw.show#dw.showKey:${terms.show}`])
          }

          if (terms.hasOwnProperty('language')) {
            if (terms.language !== '') searchItems.push(['AND', `dw.language:'${terms.language}`])
          }

          if (terms.hasOwnProperty('title')) {
            if (terms.title !== '') searchItems.push(['AND', `asset.title:${terms.title}`])
          } else {
            // Try to get asset 'title' from first input
            // Search passed title in 'asset.title' and 'dw.descriptionmanual'
            const input = document.querySelector(`[data-co="${fieldPath}"]`)?.querySelector('input[type="text"]')
            if (input && input.value !== '') {
              const title = input.value.trim()
              let titleItems = (title.includes(',')) ? title.split(',').filter(element => element) : [title]
              let subSearchTerms = []
              let searchQuery = []

              titleItems.forEach(item => {
                if (item.includes(' ')) {
                  searchQuery.push(`*${filterJoin(item)}*`)
                } else {
                  searchQuery.push(`*${item}*`)
                }    
              })
              // Join queries
              subSearchTerms.push(`asset.title:{${searchQuery.join(' OR ')}}`)
              subSearchTerms.push(`dw.descriptionmanual:{${searchQuery.join(' OR ')}}`)

              searchItems.push(['AND', `${subSearchTerms.join(' OR ')}`])
            }
          }  

          if (terms.hasOwnProperty('siteIdentity')) {
            if (terms.siteIdentity !== '') searchItems.push(['OR ', `asset.siteIdentity:${siteIdentity}`])
          } else {
            // Try to get asset 'siteIdentity' from second input
            const inputs = document.querySelector(`[data-co="${fieldPath}"]`)?.querySelectorAll('input[type="text"]')
            if (inputs && inputs.length === 2) {
              const siteIdentity = inputs[1].value.trim()
              if (siteIdentity !== '') {
                searchItems.push(['OR', `asset.siteIdentity:*${siteIdentity}*`])
              }    
            }    
          }

          if (terms.hasOwnProperty('usagedate')) {
            if (terms.usagedate !== '') searchItems.push(['AND', `dw.usagedate:${terms.usagedate}'`])
          } else {
            // Try to get asset date from datepicker
            const datepicker = document.querySelector(`[data-co="${fieldPath}"]`)?.querySelector('input[type="date"]')
            if (datepicker && datepicker.value !== '') searchItems.push(['AND', `dw.usagedate:${datepicker.value}`])
          }

          if (terms.hasOwnProperty('imagesize')) {
            let width = terms.imagesize?.width
            let height = terms.imagesize?.height
            if (width && height) searchItems.push(['AND', `dw.imagesize:${width}*${height}`])
          } else {
            // Try to get asset image size from hint
            const hint = document.querySelector(`[data-co="${fieldPath}"]`)?.querySelector('.dw-imgHint')
            if (hint) {
              let hintString = hint.innerHTML
              let numbers = hintString.match(/(-\d+|\d+)(,\d+)*(\.\d+)*/g)
              if (numbers && numbers.length === 2) {
                let [width, heigth] = numbers
                searchItems.push(['AND', `dw.imagesize:${width}*${heigth}`])
              }
            }
          }

          // Join search terms
          let searchItemsString = ''
          searchItems.forEach((singleSearchItem, index) => {
            // First search term needs no operator
            if (index === 0) singleSearchItem.shift()    
            searchItemsString += ` ${singleSearchItem.join(' ')}`
          })
          vizrt.payloadhosting.editField(fieldPath, { searchTerms: searchItemsString.trim() })

        } else {
          vizrt.payloadhosting.editField(fieldPath, { searchTerms: terms })
        }
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
    imageValue.src = (imageObject.url.indexOf('IMAGE*/') !== -1) ? '' : imageObject.url
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
