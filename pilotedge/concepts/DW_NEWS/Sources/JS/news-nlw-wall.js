/* global structuredClone */
/* global nlw */
/* eslint-disable no-unused-vars */

const NLW_PROPERTIES = Object.freeze({
  STUDIO: 0
})

const initializeNLWData = (table) => {
  const NLW = nlw.data
  NLW.load(table)
  if (NLW.error) {
    console.log(NLW.error)
  }

  const nlwTable = NLW.worksheet().worksheets.worksheet1.table

  const setting = {}
  Object.values(nlwTable).forEach((column) => {
    setting[column[1]] = ''
  })

  const data = new Array(NLW.worksheet().worksheets.worksheet1.highestRow)
  for (let i = 0; i < data.length; i++) {
    data[i] = structuredClone(setting)
  }

  Object.values(nlwTable).forEach((column) => {
    const key = column[1]
    Object.values(column).forEach((cell, i) => {
      data[i][key] = cell
    })
  })
  return data
}

const NLW_DATA = initializeNLWData('news-wall.db')

const getDistinctSettingValues = (data, settingKey) => {
  const settingsProperties = data.map((element) => element[settingKey])
  if (settingsProperties[0] === settingKey) {
    settingsProperties.shift()
  }
  return [...new Set(settingsProperties)]
}

const getFilteredData = (data, query) => {
  return data.filter((setting) => {
    return Object.keys(query).every((key) => {
      const settingValue = setting[key]
      const queryValue = query[key]
      return typeof settingValue === 'string' ? settingValue.includes(queryValue) : settingValue === queryValue
    })
  })
}
