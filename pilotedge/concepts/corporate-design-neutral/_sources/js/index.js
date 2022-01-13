/* global Event */
'use strict'

window.generateAutoTitle = () => {
  return ''
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
  eventVariantRadios.forEach(radio => radio.addEventListener('change', (e) => { eventVariant.dataset.active = e.target.value === '0' }))

  const gfxVariantRadios = document.querySelectorAll('[data-co="4/GFXVariant"]')
  const headlineElement = document.querySelector('#Headline')
  const sublineElement = document.querySelector('#Subline')
  gfxVariantRadios.forEach(radio => radio.addEventListener('change', (e) => {
    headlineElement.dataset.active = textFieldMapping[e.target.value].headlineActive
    headlineElement.querySelector('textarea').dataset.maxRows = textFieldMapping[e.target.value].headlineRows
    sublineElement.dataset.active = textFieldMapping[e.target.value].sublineActive
    sublineElement.querySelector('textarea').dataset.maxRows = textFieldMapping[e.target.value].sublineRows
  }))
})

document.addEventListener('vizPayloadReady', () => {
  document.querySelector('[data-co="6/EventVariant"]:checked').dispatchEvent(new Event('change'))
  document.querySelector('[data-co="4/GFXVariant"]:checked').dispatchEvent(new Event('change'))
})
