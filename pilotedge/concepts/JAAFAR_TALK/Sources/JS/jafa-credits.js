/* global nlw */
/* eslint-disable no-unused-vars */

const NLW_PROPERTIES = Object.freeze({
  EDITORS: 1,
  EDITORS_NAME_1: 2,
  EDITORS_NAME_2: 3,
  EDITORS_NAME_3: 4,
  PRODUCERS: 5,
  PRODUCERS_NAME_1: 6,
  PRODUCERS_NAME_2: 7,
  SHOW_MANAGEMENT: 8,
  SHOW_MANAGEMENT_NAME: 9,
  MANAGEMENT: 10,
  MANAGEMENT_NAMES: 11,
  FACEBOOK: 14,
  YOUTUBE: 16,
  INSTAGRAM: 20,
  MAIL: 22,
  WEB: 24,
  WHATSAPP: 26,
  TWITTER: 28
})

const initializeNLWData = (table) => {
  const data = {}
  const NLW = nlw.data
  NLW.load(table)
  if (NLW.error) {
    console.log(NLW.error)
  }
  const nlwTable = NLW.worksheet().worksheets.worksheet1.table
  Object.entries(nlwTable).forEach(([i, column]) => {
    const key = column[1]
    if (!data[key]) {
      data[key] = []
    }
    Object.entries(column).forEach(([j, cell]) => {
      data[key].push(cell)
    })
  })
  return data
}

const NLW_DATA = initializeNLWData('jafa-inserts.db')
