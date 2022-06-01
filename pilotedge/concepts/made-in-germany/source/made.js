'use strict'

const NLW_PROPERTIES = Object.freeze({
  LANGUAGE: 0,
  ONLINE: 1,
  PRODUCERS: 3,
  DIRECTOR: 4,
  EXECUTIVE_PRODUCERS: 5,
  EMAIL: 7,
  FACEBOOK: 8,
  TWITTER: 9,
  STYLIST: 11,
  WARDROBE: 12,
  REPORT: 14,
  CAMERA: 15,
  EDITOR: 16
})

const initializeNLWData = () => {
  const data = {}
  const NLW = nlw.data
  NLW.load('made-inserts.db')
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
