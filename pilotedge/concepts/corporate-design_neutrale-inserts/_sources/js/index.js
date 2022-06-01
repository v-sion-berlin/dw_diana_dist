/* global Event */
'use strict'

window.generateAutoTitle = () => {
  const title = document.title.replace('Corporate Design', 'CD').replace('Neutrale Inserts', 'NI')
  const languageSelector = document.querySelector('[data-co="3/Language"]')
  const language = languageSelector[languageSelector.selectedIndex].text
  if (title.includes('Fullscreen')) {
    return `${title.replace('-', language)}`
  }
  const logo = document.querySelector('[data-co="5/BrandingVariant"]:checked').value === '0' ? ' Logo' : ''
  const event = document.querySelector('[data-co="6/EventVariant"]:checked').value === '0' ? ' Event' : ''
  if (title.includes('Credits')) {
    return `${title.replace('-', language)}${logo}${event}`
  }
  const gfxVariant = document.querySelector('[data-co="4/GFXVariant"]:checked').nextElementSibling.textContent
  return `${title.replace('-', language)} ${gfxVariant}${logo}${event}`
}

const textFieldMapping = {
  1: { headlineRows: 1, headlineActive: true, sublineRows: 1, sublineActive: false },
  2: { headlineRows: 2, headlineActive: true, sublineRows: 1, sublineActive: false },
  3: { headlineRows: 1, headlineActive: true, sublineRows: 2, sublineActive: true },
  4: { headlineRows: 1, headlineActive: true, sublineRows: 1, sublineActive: true },
  6: { headlineRows: 1, headlineActive: true, sublineRows: 2, sublineActive: true },
  7: { headlineRows: 1, headlineActive: true, sublineRows: 1, sublineActive: false }
}

document.addEventListener('DOMContentLoaded', () => {
  const eventVariantRadios = document.querySelectorAll('[data-co="6/EventVariant"]')
  const eventVariant = document.querySelector('#EventVariant')
  eventVariantRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === '0') {
        eventVariant.classList.remove('hidden')
      } else {
        eventVariant.classList.add('hidden')
      }
    })
  })

  const gfxVariantRadios = document.querySelectorAll('[data-co="4/GFXVariant"]')
  const headlineElement = document.querySelector('#Headline')
  const sublineElement = document.querySelector('#Subline')
  gfxVariantRadios.forEach(radio => radio.addEventListener('change', (e) => {
    if (textFieldMapping[e.target.value].headlineActive) {
      headlineElement.classList.remove('hidden')
    } else {
      headlineElement.classList.add('hidden')
    }

    headlineElement.querySelector('textarea').dataset.maxRows = textFieldMapping[e.target.value].headlineRows
    if (textFieldMapping[e.target.value].sublineActive) {
      sublineElement.classList.remove('hidden')
    } else {
      sublineElement.classList.add('hidden')
    }
    sublineElement.querySelector('textarea').dataset.maxRows = textFieldMapping[e.target.value].sublineRows
  }))

  const languageSelection = document.querySelector('[data-co="3/Language"]')
  const directionDiv = document.querySelector('.dw-direction')
  languageSelection.addEventListener('change', (e) => {
    if (e.target.value === '1' || e.target.value === '3' || e.target.value === '7') {
      directionDiv.classList.add('dw-direction-rtl')
    } else {
      directionDiv.classList.remove('dw-direction-rtl')
    }
  })
})

document.addEventListener('vizPayloadReady', () => {
  const eventVariant = document.querySelector('[data-co="6/EventVariant"]:checked')
  if (eventVariant) {
    eventVariant.dispatchEvent(new Event('change'))
  }

  const gfxVariant = document.querySelector('[data-co="4/GFXVariant"]:checked')
  if (gfxVariant) {
    gfxVariant.dispatchEvent(new Event('change'))
  }

  const language = document.querySelector('[data-co="3/Language"]')
  if (language) {
    language.dispatchEvent(new Event('change'))
  }
})
