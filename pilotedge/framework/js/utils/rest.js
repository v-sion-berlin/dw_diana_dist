/**
 * @file Provides functions and events to make rest api calls
 * @author v-sion GmbH <contact@v-sion.de>
 * @version 1.00
 */

/* global fetch */

console.debug('loading rest.js')

/**
* REST class
*
* Gives the abbility to create REST API calls.
* @hideconstructor
*/
class REST {
  static async request () {
    const response = await fetch('/pilotedge/index.php', { mode: 'cors' })
    const data = await response.json
    console.log(data)
    return data
  }
}

export default REST
