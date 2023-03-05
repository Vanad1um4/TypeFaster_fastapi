const cpmDiv = document.querySelector('div.cpm')
const wpmDiv = document.querySelector('div.wpm')
const accDiv = document.querySelector('div.acc')
const waitAnnouncement = document.querySelector('.halt')
const doneAnnouncement = document.querySelector('.done')
const optionsWidthInput = document.querySelector('.width-input')

const data = JSON.parse(document.getElementById('data').textContent)
// console.log(data)
let statsDB = {}
const [charCount, wordCount, charsPerWord, text_id, complete, nextTextId] = textConstruct(data)
// console.log(charCount, wordCount, charsPerWord, text_id, complete, nextTextId)
// const strokes = `'""«»’`
const strokes = `'‘’`;
const quotes = `"«»“”`;
const dashes = '-–'
const dots = '.…'
const spaces = ' \xa0'
let step = 0
let cpm, wpm, acc, currTime
let currErrors = 0
let timesMoreThanFiveSecs = 0
let timeExclude = 0
let timeoutID
let pauseStartTime = 0
// const charCount = tmpVar[0]
// const wordCount = tmpVar[1]

console.log(charCount, 'characters')
console.log(wordCount, 'words')
console.log(charsPerWord,'characters per word')

onInit()

function onInit() {
    hideParentIfChildrenAreHidden()
    document.addEventListener('keydown', function onPress(event) {
    // console.log(pauseStartTime, timeExclude)
        // event.preventDefault()
        const key = event.key
        // console.log(key)
        if ((key === ` ` || key === `'` || key === '`' || key === `/`) && optionsWidthInput !== document.activeElement) {
            event.preventDefault()
        }
        if ((key.toString().length === 1 || key === 'Enter') && step < charCount && optionsWidthInput !== document.activeElement) {
            clearTimeout(timeoutID)
            timeoutID = setTimeout(showWaitMessage, 5000)
            hideWaitMessage(step)
            keyPressedValidate(step, key)
            forwardProp(step)
            stats(step)
            step++
        } else if (key === 'Backspace' && step > 0 && optionsWidthInput !== document.activeElement) {
            hideWaitMessage(step)
            clearTimeout(timeoutID)
            timeoutID = setTimeout(showWaitMessage, 5000)
            backwardProp(step)
            step--
        }
        if (step === charCount) {
            clearTimeout(timeoutID)
            document.removeEventListener('keydown', onPress, false)
            sendStatsBack()
            console.log('done')
            console.log(statsDB)
        }
    });

    forwardProp(-1)
}


function keyPressedValidate(i, key) {
    statsDB['stats'][i]['time'] = Date.now()
    const syl = statsDB['stats'][i]['txt']
    // console.log(syl)
    let span = document.querySelector(`span[id="n${i.toString()}"]`)

    if ((key === syl) ||
        (strokes.includes(key) || key === '`') && (strokes.includes(syl) || syl === '`') ||
        (quotes.includes(key) && quotes.includes(syl)) ||
        (dashes.includes(key) && dashes.includes(syl)) ||
        (spaces.includes(key) && spaces.includes(syl)) ||
        (dots.includes(key) && dots.includes(syl)) ||
        (key ==='Enter' && syl === '⏎')) {
        if (span.classList.contains('wrong')) {
            span.classList.remove('wrong', 'current', 'neutral')
            span.classList.add('corrected')
        } else {
            span.classList.remove('current', 'neutral')
            span.classList.add('right');
        }
    } else {
        span.classList.remove('corrected', 'right', 'current', 'neutral')
        span.classList.add('wrong')
        statsDB['stats'][i]['error']++
        currErrors++
    }
}


function showWaitMessage() {
    waitAnnouncement.style.display = 'block'
    hideParentIfChildrenAreHidden()
    pauseStartTime = Date.now() - 5000
}
function hideWaitMessage(i) {
    waitAnnouncement.style.display = 'none'
    hideParentIfChildrenAreHidden()
}
function checkForPauseTime(i) {
}


function sendStatsBack() {
    cpm = Math.round(charCount / currTime * 60 * 1000)
    wpm = Math.round(wordCount / currTime * 60 * 1000)
    acc = Math.round((1.0 - (currErrors / charCount)) * 10000) / 100

    cpmDiv.innerText = cpm + ' cpm'
    wpmDiv.innerText = wpm + ' wpm'
    accDiv.innerText = acc + '% accuracy'

    // statsDB['complete'] = true
    statsDB['args'] = {}
    statsDB['args']['cpm'] = cpm
    statsDB['args']['wpm'] = wpm
    statsDB['args']['acc'] = acc
    statsDB['args']['chars'] = charCount
    statsDB['args']['words'] = wordCount
    statsDB['args']['errors'] = currErrors
    statsDB['args']['time'] = currTime
    // console.log(statsDB)

    fetch(`/api-stats/return-stats/${text_id}/`,
    {
        method: 'POST',
        // credentials: 'same-origin',
        headers: {
            // 'X-Requested-With': 'XMLHttpRequest',  // Necessary to work with request.is_ajax()
            // 'X-CSRFToken': csrftoken,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(statsDB)
    })
    .then(() => {
        showCompleteDialogue()
    })
}


function showCompleteDialogue() {
    doneAnnouncement.style.display = 'block'
    hideParentIfChildrenAreHidden()
    document.addEventListener('keydown', function onPress(event) {
        if (event.key === 'Enter') {
            document.removeEventListener('keydown', onPress, false)
            if (nextTextId === null) {
                window.location.href = '/library/'
            } else {
                window.location.href = '/type/' + nextTextId
            }
        }
        if (event.key === 'Backspace') {
            document.removeEventListener('keydown', onPress, false)
            window.location.href = '/library/'
        }
    })
}


function forwardProp(i) {
    if (i < charCount-1) {
        let nextSpan = document.querySelector(`span[id="n${i+1}"]`)
        // nextSpan.classList.remove('right', 'wrong', 'current', 'neutral')
        nextSpan.classList.remove('neutral')
        nextSpan.classList.add('current')

        let screenY = window.innerHeight
        let spanY = nextSpan.offsetTop - window.scrollY

        let spanYPercent = Math.floor((spanY / screenY) * 100)

        // console.log(spanYPercent)

        if (spanYPercent > 75) {
            window.scrollBy({top: Math.floor(screenY/2), left: 0, behavior: 'smooth'});

        }
        if (spanYPercent < 25) {
            window.scrollBy({top: -Math.floor(screenY/2), left: 0, behavior: 'smooth'});

        }
    }
}


function backwardProp(i) {
    let nextSpan = document.querySelector(`span[id="n${i}"]`)
    // console.log(nextSpan)
    // nextSpan.classList.remove('right', 'wrong', 'current', 'neutral')
    nextSpan.classList.remove('current')
    nextSpan.classList.add('neutral')
    let currSpan = document.querySelector(`span[id="n${i-1}"]`)
    // console.log(nextSpan)
    // currSpan.classList.remove('right', 'wrong', 'current', 'neutral')
    currSpan.classList.add('current')
}


function stats(i) {
    if (pauseStartTime > 0) {
        timeExclude += Date.now() - pauseStartTime
        pauseStartTime = 0
    }
    if (statsDB['stats'][i]['txt'] === ' ' || i === charCount-1) {
        let startTime = statsDB['stats'][0]['time']
        let endTime = statsDB['stats'][i]['time']
        currTime = endTime + 1 - startTime - timeExclude
        cpm = Math.round(i/currTime*60*1000)
        cpmDiv.innerText = cpm + ' cpm'

        wpm = Math.round(cpm / charsPerWord)
        wpmDiv.innerText = wpm + ' wpm'

        let mistakeCount = 0
        for (let j=0; j<i; j++) {
            mistakeCount += statsDB['stats'][j]['error']
        }

        acc = Math.round((1.0 - (mistakeCount / i)) * 10000) / 100
        accDiv.innerText = acc + '% accuracy'
    }
}


function textConstruct(data) {
    cpmDiv.innerText = data['cpm'] + ' cpm'
    wpmDiv.innerText = data['wpm'] + ' wpm'
    accDiv.innerText = data['acc'] + '% accuracy'
    const text = data['text']
    // console.log(text)
    const wordCount = text.split(' ').length;
    const charsPerWord = Math.round((text.length / wordCount) * 100) / 100
    const mainTextDiv = document.querySelector('div.main-text')
    statsDB['stats'] = {}
    let newParagraph = document.createElement('DIV')
    newParagraph.classList.add('paragraph')
    for (let i = 0; i < text.length; i++) {
        statsDB['stats'][i] = {}
        statsDB['stats'][i]['time'] = 0
        statsDB['stats'][i]['error'] = 0
        if (text[i] === '\n') {
            statsDB['stats'][i]['txt'] = '⏎'
            const span = document.createElement('SPAN')
            span.setAttribute('id', 'n'+i.toString())
            span.classList.add('neutral')
            span.textContent = '⏎'
            newParagraph.appendChild(span)
            mainTextDiv.appendChild(newParagraph)
            newParagraph = document.createElement('DIV')
            newParagraph.classList.add('paragraph')
        } else {
            statsDB['stats'][i]['txt'] = text[i]
            const span = document.createElement('SPAN')
            span.setAttribute('id', 'n'+i.toString())
            span.classList.add('neutral')
            span.textContent = text[i]
            newParagraph.appendChild(span)
        }
    }
    mainTextDiv.appendChild(newParagraph)
    // console.log(statsDB)
    return [text.length, wordCount, charsPerWord, data['text_id'], data['complete'], data['next']]
}


function hideParentIfChildrenAreHidden() {
    const parent = document.querySelector('.info-block')
    const children = document.querySelectorAll('.info-block > .announcements > div')
    // console.log(parent)
    // console.log(children)
    let hideParent = true;
    for(let i = 0; i < children.length; i++){
        if(children[i].style.display != "none"){
            hideParent = false;
            break;
        }
    }
    if(hideParent){
        parent.style.display = "none";
    } else {
        parent.style.display = "block";
    }
}
