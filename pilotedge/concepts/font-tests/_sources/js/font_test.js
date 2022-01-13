/**
 * @name font_test.js
 * @file Functions for the font test template.
 * @author v-sion GmbH <contact@v-sion.de>
 */

/* global vizrt */
/* global nlw */

console.debug('loading font_test.js')

let languageDirection = 0
const languages = {}

// Receive the data about languages and available fonts from the nlw module
// and save it to our global language constant
const NLW = nlw.data
NLW.load('languages.db')
if (NLW.error) {
  console.log(NLW.error)
}
let nlwData = NLW.worksheet().worksheets.worksheet1.table
Object.entries(nlwData).forEach(([i, row]) => {
  Object.entries(row).forEach(([j, cell]) => {
    if (j > 1) {
      const key = nlwData.A[j]
      if (!languages[key]) {
        languages[key] = {}
      }
      languages[key][nlwData[i]['1']] = cell
    }
  })
})

NLW.load('fonts.db')
if (NLW.error) {
  console.log(NLW.error)
}
nlwData = NLW.worksheet().worksheets.worksheet1.table
Object.entries(nlwData).forEach(([i, row]) => {
  if (i !== 'A') {
    const usedFonts = Object.values(row).reduce((acc, el, i) => (el === 'X' ? [...acc, nlwData.A[i + 1]] : acc), [])
    languages[row[1]].Fonts = usedFonts
  }
})

document.addEventListener('DOMContentLoaded', function () {
  const dropdownLanguage = document.querySelector('#dropdown--select-language')
  const dropdownFont = document.querySelector('#dropdown--select-font')
  const fontOption = dropdownFont.querySelector('.dw-dropdown__item').cloneNode(true)
  const fontOptions = dropdownFont.querySelector('.dw-dropdown__content')
  const directionSwitch = document.querySelector('#direction-switch')

  dropdownLanguage.addEventListener('input', (e) => {
    const selectedLanguage = e.target.dataset.selected
    if (languages[selectedLanguage].Direction === 'left-to-right') {
      directionSwitch.classList.remove('dw-direction-rtl')
    } else {
      directionSwitch.classList.add('dw-direction-rtl')
    }
    const coFont = vizrt.payloadhosting.getFieldText('-concept-variant-choice/variant')
    dropdownFont.dataset.selected = coFont
    fontOptions.innerHTML = ''
    const fonts = languages[selectedLanguage].Fonts
    if (fonts) {
      fonts.forEach((font) => {
        const newFontOption = fontOption.cloneNode(true)
        newFontOption.innerHTML = font
        newFontOption.dataset.value = font
        fontOptions.appendChild(newFontOption)
      })
    }
  })
})

document.addEventListener('vizPayloadReady', function () {
  const dropdownLanguage = document.querySelector('#dropdown--select-language')
  const languageOption = dropdownLanguage.querySelector('.dw-dropdown__item').cloneNode(true)
  const languageOptions = dropdownLanguage.querySelector('.dw-dropdown__content')
  languageOptions.innerHTML = ''

  const coLanguage = vizrt.payloadhosting.getFieldText('language')
  dropdownLanguage.dataset.selected = coLanguage
  languageDirection = vizrt.payloadhosting.getFieldText('language-direction')
  Object.entries(languages).forEach(([key, language]) => {
    if ((language.Direction === 'left-to-right' && languageDirection === '0') || (language.Direction === 'right-to-left' && languageDirection === '1')) {
      const newSelectOption = languageOption.cloneNode(true)
      newSelectOption.innerHTML = `${language.English} / ${language.Native}`
      newSelectOption.dataset.value = key
      languageOptions.appendChild(newSelectOption)
    }
  })
})
