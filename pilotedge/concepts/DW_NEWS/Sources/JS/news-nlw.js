/* global nlw */

const NLW_PROPERTIES = Object.freeze({
  LANGUAGE: 0,
  SHOWS: 1,
  FLAGS: 2,
  BREAKING_NEWS: 4,
  REPORT: 5,
  COMING_UP: 6,
  ONLINE: 8,
  CREDITS_HELP: 10,
  CREDITS_EXECUTIVE_PRODUCER_NAME: 11,
  CREDITS_EXECUTIVE_PRODUCER_FUNCTION_1: 12,
  CREDITS_EXECUTIVE_PRODUCER_FUNCTION_2: 13,
  CREDITS_PRODUCER_NAME: 14,
  CREDITS_PRODUCER_FUNCTION_1: 15,
  CREDITS_PRODUCER_FUNCTION_2: 16,
  CREDITS_DIRECTOR_NAME: 17,
  CREDITS_DIRECTOR_FUNCTION_1: 18,
  CREDITS_DIRECTOR_FUNCTION_2: 19,
  CREDITS_PRESENTER_NAME: 20,
  CREDITS_PRESENTER_FUNCTION_1: 21,
  CREDITS_PRESENTER_FUNCTION_2: 22,
  CREDITS_ONLINE: 23,
  SOURCE: 25
})

const initializeNLWData = () => {
  const data = {}
  const NLW = nlw.data
  NLW.load('news-lowerthirds.db')
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
