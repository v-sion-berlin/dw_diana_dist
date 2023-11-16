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
  #credentials = null
  #SEARCH_PROVIDER_URL = 'https://diana.dwelle.de/pds/vcp/searchproviders?verify=false'
  #VIZONE_URL = 'https://vizone-diana.dwelle.de/thirdparty/asset/item'
  #START = 1
  #NUM = 10
  #MEDIA = 'image'

  constructor () {
    if (VizOne.#instance) {
      return VizOne.#instance
    }
    this.#fetchCredentials()
    VizOne.#instance = this
  }

  test = () => {
    console.log('Ein Test!')
  }

  #fetchXML = async (url, credentials) => {
    const auth = { Authorization: `Basic ${credentials || ''}` }
    const response = await fetch(url, { headers: auth })
    const responseString = await response.text()
    return new window.DOMParser().parseFromString(responseString, 'text/xml')
  }

  #fetchCredentials = async () => {
    const xml = await this.#fetchXML(this.#SEARCH_PROVIDER_URL)
    const providers = xml?.querySelectorAll('field[name="providers"] payload')
    const authenticatedHosts = xml?.querySelectorAll('field[name="authenticated-hosts"] payload')
    const hosts = {}
    authenticatedHosts.forEach((host) => {
      hosts[host.querySelector('field[name="id"] value').innerHTML] = {
        uri: host.querySelector('field[name="uri"] value').innerHTML,
        username: host.querySelector('field[name="username"] value').innerHTML,
        password: host.querySelector('field[name="password"] value').innerHTML
      }
    })
    let host
    providers.forEach((provider) => {
      if (provider.querySelector('field[name="name"] value').innerHTML === 'Vizone') {
        const providerId = provider.querySelector('field[name="id"] value').innerHTML
        host = hosts[providerId]
      }
    })

    if (host) {
      this.#credentials = btoa(`${host.username}:${host.password}`)
    }
  }

  fetchImageByContainerId = async (containerId) => {
    const xml = await this.#fetchXML(`${this.#VIZONE_URL}?start=${this.#START}&num=${this.#NUM}&q=dw.sendungUUID%3A${containerId}&media=${this.#MEDIA}`, this.#credentials)
    // const xml = await this.#fetchXML(`https://vizone-diana.dwelle.de/thirdparty/asset/item?start=1&num=50&q=dw.sendungUUID%3A${containerId}&media=image`, this.#credentials)

    const entries = xml.querySelectorAll('entry')
    const imageElements = []
    for (const entry of entries) {
      const newXml = document.implementation.createDocument('http://www.w3.org/2005/Atom', '')
      const newElement = newXml.createElementNS('http://www.w3.org/2005/Atom', 'entry')

      const newContent = newXml.createElementNS('http://www.w3.org/2005/Atom', 'content')
      newContent.setAttribute('type', 'application/vnd.vizrt.viz.image')
      newContent.innerHTML = entry.querySelector('content').getAttribute('src')
      newElement.append(newContent)

      const newThumbnail = newXml.createElementNS('http://search.yahoo.com/mrss/', 'thumbnail')
      newThumbnail.setAttribute('url', entry.querySelector('thumbnail').getAttribute('url'))
      newElement.append(newThumbnail)

      const newTitle = newXml.createElementNS('http://www.w3.org/2005/Atom', 'title')
      newTitle.innerHTML = entry.querySelector('title').innerHTML
      newElement.append(newTitle)

      const newDescribedBy = newXml.createElementNS('http://www.w3.org/2005/Atom', 'link')
      newDescribedBy.setAttribute('rel', entry.querySelector('link[rel="describedby"]').getAttribute('rel'))
      newDescribedBy.setAttribute('type', entry.querySelector('link[rel="describedby"]').getAttribute('type'))
      newDescribedBy.setAttribute('href', entry.querySelector('link[rel="describedby"]').getAttribute('href'))
      newElement.append(newDescribedBy)

      const newUpdated = newXml.createElementNS('http://www.w3.org/2005/Atom', 'updated')
      newUpdated.innerHTML = entry.querySelector('updated').innerHTML
      newElement.append(newUpdated)

      const newMediaContent = newXml.createElementNS('http://search.yahoo.com/mrss/', 'media:content')
      newMediaContent.setAttribute('xmlns:acl', 'http://www.vizrt.com/2012/acl')
      newMediaContent.setAttribute('xmlns:app', 'http://www.w3.org/2007/app')
      newMediaContent.setAttribute('xmlns:atom', 'http://www.w3.org/2005/Atom')
      newMediaContent.setAttribute('xmlns:core', 'http://ns.vizrt.com/ardome/core')
      newMediaContent.setAttribute('xmlns:dcterms', 'http://purl.org/dc/terms/')
      newMediaContent.setAttribute('xmlns:mam', 'http://www.vizrt.com/2010/mam')
      newMediaContent.setAttribute('xmlns:thr', 'http://purl.org/syndication/thread/1.0')
      newMediaContent.setAttribute('xmlns:vizmedia', 'http://www.vizrt.com/opensearch/mediatype')
      const mediaContent = entry.querySelector('group content')
      newMediaContent.setAttribute('type', mediaContent.getAttribute('type'))
      newMediaContent.setAttribute('url', mediaContent.getAttribute('url'))
      newMediaContent.setAttribute('fileSize', mediaContent.getAttribute('fileSize'))
      newMediaContent.setAttribute('width', mediaContent.getAttribute('width'))
      newMediaContent.setAttribute('height', mediaContent.getAttribute('height'))
      newMediaContent.setAttribute('isDefault', mediaContent.getAttribute('isDefault'))
      newMediaContent.setAttribute('original', mediaContent.getAttribute('original'))

      const mediaStatusLink = newXml.createElementNS('http://www.w3.org/2005/Atom', 'link')
      mediaStatusLink.setAttribute('rel', mediaContent.querySelector('link').getAttribute('rel'))
      mediaStatusLink.setAttribute('type', mediaContent.querySelector('link').getAttribute('type'))
      mediaStatusLink.setAttribute('href', mediaContent.querySelector('link').getAttribute('href'))
      newMediaContent.append(mediaStatusLink)

      newMediaContent.append(entry.querySelector('group content ebuCoreMain'))
      newElement.append(newMediaContent)
      newXml.append(newElement)
      imageElements.push(newXml.querySelector('entry'))
    }

    // Sort
    return imageElements.sort((a, b) => {
      const titleA = a.querySelector('title').innerHTML
      const titleB = b.querySelector('title').innerHTML
      return titleA < titleB ? -1 : titleA === titleB ? 0 : 1
    })
  }
}

const vizone = new VizOne()
