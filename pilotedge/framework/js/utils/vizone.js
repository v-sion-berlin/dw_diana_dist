/**
 * @file Provides functions to make vizone api calls
 * @author v-sion GmbH <contact@v-sion.de>
 * @version 1.00
 */

/* global fetch */

console.debug('loading vizone.js')
/**
* VizOne class
*
* Gives the abbility to create vizone API calls.
* @hideconstructor
*/
class VizOne {
  static #instance = null
  static #SEARCH_PROVIDER_URL = 'https://diana.dwelle.de/pds/vcp/searchproviders?verify=false'

  constructor () {
    if (VizOne.#instance) {
      return VizOne.#instance
    }
    VizOne.#instance = this
  }

  test = () => {
    console.log('Ein Test!')
  }

  static #fetchXML = async (url, credentials) => {
    const auth = { Authorization: `Basic ${credentials || ''}` }
    const response = await fetch(url, { headers: auth })
    const responseString = await response.text()
    return new window.DOMParser().parseFromString(responseString, 'text/xml')
  }
}

const vizone = new VizOne()
