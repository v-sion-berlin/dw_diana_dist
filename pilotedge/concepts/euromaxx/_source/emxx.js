'use strict'

const NLW_PROPERTIES = Object.freeze({
  LANGUAGE: 0,
  PRODUCERS: 1,
  DIRECTOR: 2,
  EXECUTIVE_PRODUCERS: 3,
  WARDROBE: 4,
  THANKS: 5,
  SOCIAL_MEDIA: 6,
  SOURCE: 8,
  REPORT: 10,
  CAMERA: 11,
  EDITOR: 12,
  URL: 14
})

const initializeNLWData = () => {
  const data = {}
  const NLW = nlw.data
  NLW.load('emxx-inserts.db')
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
