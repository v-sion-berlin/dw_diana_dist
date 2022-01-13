/* global Event */
'use strict'

window.generateAutoTitle = () => {
  return ''
}

document.addEventListener('DOMContentLoaded', () => {
  const creditsVariantRadios = document.querySelectorAll('[data-co="07/CreditsVariant"]')
  creditsVariantRadios.forEach(radio => radio.addEventListener('change', (e) => {
    document.querySelector('#Sponsor').dataset.visible = e.target.value === '0'
    document.querySelector('#Text').dataset.visible = e.target.value === '1' || e.target.value === '3'
    document.querySelector('#Copyright').dataset.visible = e.target.value === '2'
  }))

  const languageSelect = document.querySelector('[data-co="02/Language"]')
  languageSelect.addEventListener('input', (e) => {
    document.querySelector('#ArabicWebText').dataset.visible = languageSelect.dataset.selected === '4'
    if (languageSelect.dataset.selected !== '4' && document.querySelector('[data-co="07/CreditsVariant"]:checked').value === '3') {
      document.querySelector('[data-co="07/CreditsVariant"][value="1"]').checked = true
      document.querySelector('[data-co="07/CreditsVariant"][value="1"]').dispatchEvent(new Event('change'))
    }
  })
})

document.addEventListener('vizPayloadReady', () => {
  document.querySelector('[data-co="07/CreditsVariant"]:checked').dispatchEvent(new Event('change'))
})
