/* global nlw */
/* eslint-disable no-unused-vars */

const NLW_PROPERTIES = Object.freeze({
  LANGUAGE: 0,
  FUNCTION_1: 1,
  FUNCTION_2: 2,
  FUNCTION_3: 3,
  FUNCTION_4: 4,
  FUNCTION_5: 5
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

const NLW_DATA = initializeNLWData('dwvg-inserts.db')
