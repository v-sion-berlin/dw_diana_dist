const checkWordLength = (textQuery, maxWordLength, warningTextQuery) => {
  /* checks, if input text is too long given a certain maxLength

  also activates or hides a warning (given a warningTextQuery for the related object) for too long input
  */

  console.log(document.querySelector(textQuery))
  const textObject = document.querySelector(textQuery)
  let string

  if (textObject.classList.contains('dw-textarea')) {
    string = textObject.value
  } else if (textObject.classList.contains('text')) {
    string = textObject.dataset.value
  }

  const warningTextObject = document.querySelector(warningTextQuery)

  let toolong = false
  console.log(string.split(' '))
  string.split(' ').forEach(element => {
    if (element.length > maxWordLength) {
      toolong = true
      textObject.classList.remove('dw-highlight-yellow')
      textObject.classList.add('dw-highlight-red')
      warningTextObject.classList.remove('hidden')
    }

    if (element.length > maxWordLength - 5 && element.length <= maxWordLength) {
      toolong = true
      warningTextObject.classList.add('hidden')
      textObject.classList.add('dw-highlight-yellow')
      textObject.classList.remove('dw-highlight-red')
    }
  })

  if (toolong === false) {
    textObject.classList.remove('dw-highlight-yellow')
    textObject.classList.remove('dw-highlight-red')
    warningTextObject.classList.add('hidden')
  }
}