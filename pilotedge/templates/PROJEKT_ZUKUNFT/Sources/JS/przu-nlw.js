/* global nlw */
/* eslint-disable no-unused-vars */

const NLW_PROPERTIES = Object.freeze({
  CREDITS_POSITION_1: 1,
  CREDITS_POSITION_2: 2,
  CREDITS_POSITION_3: 3,
  CREDITS_WARDROBE: 4,
  CREDITS_ONLINE: 5,
  REPORT: 7,
  CAMERA: 8,
  EDITOR: 9,
  VJ_REPORT: 10,
  HELPER_NAMES: 12,
  ONLINE: 14
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

const NLW_DATA = initializeNLWData('przu-inserts.db')
