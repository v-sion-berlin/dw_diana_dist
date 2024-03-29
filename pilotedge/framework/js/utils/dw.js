/* global CustomEvent */

/**
 * @file This file is the start entry for framework functions and is
 * needed by all templates to work.
 * @author v-sion GmbH <contact@v-sion.de>
 * @version 1.00
 */

/**
 * Loads the <code>[Input module]{@link Input}</code> if it is not loaded already.
 * @since 1.00
 */
const initializeInputs = async () => {
  const elements = document.querySelectorAll(
    'textarea, select, [type="number"], [type="date"], [type="text"], [type="range"]'
  )

  if (elements) {
    const module = await import('./input.js')
    const Input = module.default

    for (const element of elements) {
      Input.initialize(element)
    }
  }
}

/**
 * Loads the <code>[Draggable module]{@link Draggable}</code> if it is not loaded already.
 * @since 1.00
 */
const initializeDraggables = async () => {
  const elements = document.querySelectorAll('.dw-dnd-wrapper')
  if (elements) {
    const module = await import('./draggable.js')
    const Draggable = module.default

    for (const element of elements) {
      Draggable.initialize(element)
    }
  }
}

/**
 * Loads the <code>[Dropdown module]{@link Dropdown}</code> if it is not loaded already.
 * @since 1.00
 */
const initializeDropdowns = async () => {
  const elements = document.querySelectorAll('.dw-dropdown')
  if (elements) {
    const module = await import('./dropdown.js')
    const Dropdown = module.default

    for (const element of elements) {
      Dropdown.initialize(element)
    }
  }
}

/**
 * Add Change Listener to Image Gallery tools
 * @since 1.00
 */
const initializeImageGallery = async () => {
  // initialize gallery
  const elements = document.querySelectorAll('.dw-imgZoom')
  for (const element of elements) {
    const chips = element.querySelector('.form-input-chips')
    const zoomWrap = element.querySelector('.dw-zoom-wrap')
    const zoomDropdown = element.querySelector('.dw-dropdown-zoom')
    const zoomImage = element.querySelector('.dw-zoomImage')
    const zoomImageFocus = element.querySelector('.dw-zoomImageFocus')

    chips.addEventListener('change', (event) => {
      const zoomType = event.target.value || event.target.querySelector(':checked').value
      if (zoomType === 'zoom-off' && !zoomWrap?.classList.contains('hidden')) {
        zoomWrap?.classList.add('hidden')
        zoomImageFocus?.classList.add('hidden')
      } else {
        zoomWrap?.classList.remove('hidden')
        zoomImageFocus?.classList.remove('hidden')
      }
    })

    zoomDropdown.addEventListener('change', (event) => {
      // We will set zoomImageFocus only when we're changing the dropdown manually
      if (event.detail !== 'dw.js') {
        const zoomFactor = (1 + event.target.value / 100)
        const width = Math.round(zoomImage.offsetWidth / zoomFactor)
        const height = Math.round(zoomImage.offsetHeight / zoomFactor)

        const x = (zoomImage.offsetWidth - width) / 2
        const y = (zoomImage.offsetHeight - height) / 2

        setZoom(zoomImageFocus, zoomImage, { width, height, x, y })

        zoomImage.dataset.posX = getTransformedValue(x, zoomImageFocus.dataset.maxLeft)
        zoomImage.dataset.posY = getTransformedValue(y, zoomImageFocus.dataset.maxTop)
        zoomImageFocus.dispatchEvent(new CustomEvent('focusChanged'))
      }
    })

    zoomImageFocus.addEventListener('updateZoom', (event) => {
      const zoomFactor = (1 + zoomImage.dataset.zoom / 100)
      const width = Math.round(zoomImage.offsetWidth / zoomFactor)
      const height = Math.round(zoomImage.offsetHeight / zoomFactor)

      const x = getTransformedValueBack(zoomImage.dataset.posX, zoomImage.offsetWidth - width)
      const y = getTransformedValueBack(-zoomImage.dataset.posY, zoomImage.offsetHeight - height)

      setZoom(zoomImageFocus, zoomImage, { width, height, x, y })
    })

    let isDragging = false
    const offset = { x: 0, y: 0 }

    zoomImageFocus.addEventListener('mousedown', function (event) {
      isDragging = true
      offset.x = event.clientX - zoomImageFocus.offsetLeft
      offset.y = event.clientY - zoomImageFocus.offsetTop
    })

    document.addEventListener('mouseup', function () {
      isDragging = false
      zoomImageFocus.dispatchEvent(new CustomEvent('focusChanged'))
    })

    document.addEventListener('mousemove', function (event) {
      if (isDragging) {
        const x = Math.max(0, Math.min(zoomImageFocus.dataset.maxLeft, event.clientX - offset.x))
        zoomImageFocus.style.left = x + 'px'
        zoomImage.dataset.posX = getTransformedValue(x, zoomImageFocus.dataset.maxLeft)

        const y = Math.max(0, Math.min(zoomImageFocus.dataset.maxTop, event.clientY - offset.y))
        zoomImageFocus.style.top = y + 'px'
        zoomImage.dataset.posY = -getTransformedValue(y, zoomImageFocus.dataset.maxTop)
      }
    })
  }
}

const getTransformedValue = (value, maxValue) => {
  const valueRelative = value / maxValue * 100
  return (valueRelative - 50) * 2
}

const getTransformedValueBack = (value, maxValue) => {
  const valueRelative = (value / 2 + 50)
  return valueRelative * maxValue / 100
}

const setZoom = (zoomImageFocus, zoomImage, data) => {
  zoomImageFocus.style.width = data.width + 'px'
  zoomImageFocus.style.height = data.height + 'px'
  zoomImageFocus.style.left = `${data.x}px`
  zoomImageFocus.style.top = `${data.y}px`
  zoomImageFocus.dataset.maxLeft = zoomImage.offsetWidth - data.width
  zoomImageFocus.dataset.maxTop = zoomImage.offsetHeight - data.height
}

/**
 * Add Change Listener to site/zoomImage Id fields to disable other image search fields on entry
 * Adds a larger image version to the Image Select Thumbnail and shows it on hover
 * @since 1.00
 */
const initializeImageSearch = async () => {
  // initialize search
  const elements = document.querySelectorAll('.imgSearchId')
  for (const element of elements) {
    element.addEventListener('keyup', (event) => {
      const imgSearch = element.closest('.dw-imgSearch')
      const fields = imgSearch.querySelectorAll('.imgSearchField')
      for (const field of fields) {
        field.disabled = event.target.value.length > 0
      }
    })
  }

  // initialize thumbs
  const isOverImgLarges = []
  const isOverImgThumbs = []

  const showHideImgLarge = (imgLarge) => {
    setTimeout(() => {
      const parent = imgLarge.closest('.dw-imgSearch')
      const id = parent.getAttribute('id')
      const imgThumb = imgLarge.parentElement.querySelector('.dw-imgThumb')
      if (!isOverImgLarges[id] && !isOverImgThumbs[id]) {
        imgLarge.classList.add('hidden')
        imgLarge.removeEventListener('mouseover', onMouseOverImgLarge)
        imgLarge.removeEventListener('mouseout', onMouseOutImgLarge)
        imgThumb.removeEventListener('mouseout', onMouseOutImgThumb)
      } else {
        const src = imgThumb.querySelector('img').getAttribute('src')
        if (src) {
          imgLarge.classList.remove('hidden')
          imgLarge
            .querySelector('img')
            .setAttribute(
              'src',
              imgThumb.querySelector('img').getAttribute('src')
            )
        }
      }
    }, 10)
  }

  const onMouseOverImgLarge = (event) => {
    const parent = event.target.closest('.dw-imgSearch')
    const id = parent.getAttribute('id')
    isOverImgLarges[id] = true
    showHideImgLarge(event.target.parentElement)
  }

  const onMouseOutImgLarge = (event) => {
    const parent = event.target.closest('.dw-imgSearch')
    const id = parent.getAttribute('id')
    isOverImgLarges[id] = false
    showHideImgLarge(event.target.parentElement)
  }

  const onMouseOutImgThumb = (event) => {
    const parent = event.target.closest('.dw-imgSearch')
    const id = parent.getAttribute('id')
    isOverImgThumbs[id] = false
    const imgLarge =
      event.target.parentElement.parentElement.querySelector('.dw-imgLarge')
    showHideImgLarge(imgLarge)
  }

  const showLargeImage = (event) => {
    const parent = event.target.closest('.dw-imgSearch')
    const id = parent.getAttribute('id')
    const imgLarge =
      event.target.parentElement.parentElement.querySelector('.dw-imgLarge')
    isOverImgThumbs[id] = true
    showHideImgLarge(imgLarge)

    imgLarge.addEventListener('mouseover', onMouseOverImgLarge)
    imgLarge.addEventListener('mouseout', onMouseOutImgLarge)
    event.target.addEventListener('mouseout', onMouseOutImgThumb)
  }

  const wrappers = document.querySelectorAll('.dw-imgSearch')
  let count = 0
  for (const element of wrappers) {
    element.setAttribute('id', 'imgSearch-' + count++)
    const imgThumb = element.querySelector('.dw-imgThumb')
    if (!imgThumb) return
    const imgLarge = document.createElement('div')
    const img = document.createElement('img')
    imgLarge.classList.add('dw-imgLarge')
    imgLarge.classList.add('hidden')
    imgLarge.appendChild(img)
    imgThumb?.parentElement?.append(imgLarge)

    imgThumb?.addEventListener('mouseover', showLargeImage)
  }
}

/**
 * Defines a global variable window.datestamp that contains the actual
 * timestamp. This can be used during <code>[generating auto titles]{@link generateAutoTitle}</code>.
 * @returns {String} The datestamp.
 * @since 1.00
 * @global
 */
window.datestamp = () => {
  const today = new Date()
  const formatter = new Intl.NumberFormat('de-DE', { minimumIntegerDigits: 2 })
  return `${formatter.format(today.getMonth() + 1)}${formatter.format(
    today.getDate()
  )}`
}

/**
 * Defines a global function that can handle ltr/rtl changes
 * @param {String} queryLanguageSelect querySelector for selecting the language selection control
 * @param {String} queryDirectionDiv querySelector for getting the div that handles the direction
 * @since 1.13
 * @global
 */
window.initializeDirectionSwitch = (queryLanguageSelect, queryDirectionDiv) => {
  const languageSelect = document.querySelector(queryLanguageSelect)
  const directionDiv = document.querySelector(queryDirectionDiv)
  if (!languageSelect) {
    console.error(
      `window.initializeDirectionSwitch(queryLanguageSelect, queryDirectionDiv): parameter queryLanguageSelect (${queryLanguageSelect}) doesn't give valid node.`
    )
    return
  }

  if (!directionDiv) {
    console.error(
      `window.initializeDirectionSwitch(queryLanguageSelect, queryDirectionDiv): parameter directionDiv (${directionDiv}) doesn't give valid node.`
    )
    return
  }
  languageSelect.addEventListener('change', (e) => {
    const selectedOption = languageSelect.options[languageSelect.selectedIndex]
    const hasRtl =
      selectedOption.hasAttribute('rtl') ||
      selectedOption.hasAttribute('data-rtl')
    if (hasRtl) {
      directionDiv.classList.add('dw-direction-rtl')
    } else {
      directionDiv.classList.remove('dw-direction-rtl')
    }
  })

  document.addEventListener('vizPayloadReady', () => {
    // WE're using a custom event here to pass additional data. That way we can
    // distinguish between initial change call and change events that are fired
    // by the user.
    languageSelect.dispatchEvent(
      new CustomEvent('change', { detail: 'dw.js' })
    )
  })
}

/**
 * Defines a global function that shows a div if the attribute translation is present in the language selection
 * @param {String} queryLanguageSelect querySelector for selecting the language selection control
 * @param {String} queryTranslationDiv querySelector for getting the div that contains the translation controls
 * @since 1.13
 * @global
 */
window.initializeTranslationPanel = (
  queryLanguageSelect,
  queryTranslationDiv
) => {
  const languageSelect = document.querySelector(queryLanguageSelect)
  const translationDiv = document.querySelector(queryTranslationDiv)
  if (!languageSelect) {
    console.error(
      `window.initializeTranslationPanel(queryLanguageSelect, queryTranslationDiv): parameter queryLanguageSelect (${queryLanguageSelect}) doesn't give valid node.`
    )
    return
  }

  if (!translationDiv) {
    console.error(
      `window.initializeTranslationPanel(queryLanguageSelect, queryTranslationDiv): parameter queryTranslationDiv (${queryTranslationDiv}) doesn't give valid node.`
    )
    return
  }
  languageSelect.addEventListener('change', (e) => {
    const selectedOption = languageSelect.options[languageSelect.selectedIndex]
    const hasTranslation =
      selectedOption.hasAttribute('translation') ||
      selectedOption.hasAttribute('data-translation')
    translationDiv.dataset.visible = hasTranslation
  })

  document.addEventListener('vizPayloadReady', () => {
    languageSelect.dispatchEvent(
      new CustomEvent('change', { detail: 'dw.js' })
    )
  })
}

/**
 * Function for capitalizing strings
 * @param {String} text the text that shall be capitalized
 * @returns {String} capitalized text
 * @since 1.13
 * @global
 */
window.capitalize = (text) => {
  return text.replace(/^\w/, (c) => c.toUpperCase())
}

document.addEventListener('DOMContentLoaded', () => {
  initializeInputs()
  initializeDraggables()
  initializeDropdowns()
  initializeImageSearch()
  initializeImageGallery()
})
