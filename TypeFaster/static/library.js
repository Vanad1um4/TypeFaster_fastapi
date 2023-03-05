const divBookList = document.querySelector('.book-list')
const newBookDiv = document.querySelector('.new-book')
const newBookInput = document.querySelector('.new-book-input')
const newBookBtnAdd = document.querySelector('.new-book-btn-add')
const newBookBtnCancel = document.querySelector('.new-book-btn-cancel')

const bookDiv = document.querySelector('.book')
const bookNameHeader = document.querySelector('.book-name')
const bookRenameInput = document.querySelector('.book-rename-input')
const bookRenameBtn = document.querySelector('.book-btn-rename')
const bookDelBtn = document.querySelector('.book-btn-delete')
const bookYesDelBtn = document.querySelector('.book-btn-yes-delete')
let currentBookId = 0

const loadingGif = document.querySelector('.loading')
const textsMainCont = document.querySelector('.texts-cont')

const addTextMainDiv = document.querySelector('.add-text-main-cont')
const addTextPlusDiv = document.querySelector('.add-text-plus')
const addTextInputCont = document.querySelector('.add-text-input-cont')
const addChapterInput = document.querySelector('.add-chapter-input')
const addTextInput = document.querySelector('.add-text-input')

const books_data = JSON.parse(document.getElementById('books').textContent)
let books_obj = {}
// console.log(books_data)
const wain1sec = 1000
const wait3sec = 3000

onInit()

function onInit() {
    booksSectionConstruct()
    newBookBtnAdd.addEventListener("click", () => { addNewBookBtnClicked() })
    newBookBtnCancel.addEventListener("click", () => { newBookDiv.classList.toggle('hidden') })

    bookRenameBtn.addEventListener("click", () => {
        bookRenameInput.classList.toggle('hidden')
        bookNameHeader.classList.toggle('hidden')
    })
    bookRenameInput.addEventListener("input", () => { saveBookNewName() });
    bookDelBtn.addEventListener("click", () => { bookYesDelBtn.classList.remove('hidden') })
    bookYesDelBtn.addEventListener("click", () => { yesDeleteBookClicked() })

    addTextPlusDiv.addEventListener("click", () => {
        addTextPlusDiv.classList.add('hidden')
        addTextInputCont.classList.remove('hidden')
    })
    addTextInput.addEventListener("input", () => { saveNewText() });
}

async function saveNewText() {
    const lastValue = addTextInput.value
    await sleep(wait3sec)
    const newValue = addTextInput.value
    if (lastValue === newValue) {
        if (lastValue.length > 0) {
            const chapter = addChapterInput.value
            fetch(`/api-texts/add/`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({'book_id': currentBookId, 'chapter': chapter, 'text': lastValue})
            })
            .then(response => {
                if (response.status === 204) {
                    console.log('Texts added successfully')
                } else {
                    console.log('Something went horribly wrong...')
                }
            })
            .then(await sleep(wain1sec))
            .then(() => { window.location.reload() })
        } else {
            console.log('nope')
        }
    }
}


async function saveBookNewName() {
    const lastValue = bookRenameInput.value
    await sleep(wait3sec)
    const newValue = bookRenameInput.value
    if (lastValue === newValue) {
        if (newValue.length > 0 && newValue.length < 256) {
            fetch(`/api-books/rename/${currentBookId}`,
            {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({'name': newValue})
            })
            .then(response => {
                if (response.status === 204) {
                    console.log('Book renamed successfully')
                } else {
                    console.log('Something went horribly wrong...')
                }
            })
            .then(await sleep(wain1sec))
            .then(() => { window.location.reload() })
        } else {
            console.log('Something wrong with the new name...')
        }
    }
}



function booksSectionConstruct() {
    for (let i=0; i<books_data.length; i++) {
        addBookToList(books_data[i][0], books_data[i][1])
        books_obj[books_data[i][0]] = books_data[i][1]
    }
    addNewBookBtn()
}

function addBookToList(id, name) {
    const divBookCont = document.createElement('DIV')
    const divBook = document.createElement('DIV')
    divBookCont.classList.add('book-cont')
    divBookCont.classList.add('hoverable')
    divBookCont.setAttribute('id', 'book' + id)
    divBook.classList.add('book-name')
    divBook.textContent = `${name}`
    divBookCont.appendChild(divBook)
    divBookList.appendChild(divBookCont)

    divBookCont.addEventListener("click", (event) => { bookClicked(event.target) })
}


function bookClicked(target) {
    let bookId = parseInt(target.getAttribute('id').replace('book', ''))
    currentBookId = bookId
    loadingGif.classList.remove('hidden')
    addTextMainDiv.classList.remove('hidden')
    addTextPlusDiv.classList.remove('hidden')
    addTextInputCont.classList.add('hidden')
    bookYesDelBtn.classList.add('hidden')
    newBookDiv.classList.add('hidden')
    bookDiv.classList.remove('hidden')
    bookRenameInput.classList.add('hidden')
    bookNameHeader.classList.remove('hidden')
    bookNameHeader.textContent = books_obj[bookId]

    while (textsMainCont.firstChild) { textsMainCont.firstChild.remove() }

    fetch(`/api-texts/get-texts-by-book-id/${currentBookId}`,
    {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (response.status === 200) {
            console.log('Books recieved successfully')
            return response.json()
            .then(result => {
                console.log(result['texts'])
                textsAndChaptersConstruct(result['texts'])
                loadingGif.classList.add('hidden')
            })
        } else {
            console.log('Something went horribly wrong...')
        }
    })
}

function textsAndChaptersConstruct(texts) {
    let keepOneMoreOpen = 0
    for (let chapt of texts) {
        const chapterMainCont = document.createElement('DIV')
        chapterMainCont.classList.add('chapter-cont')

        const chapterHeadCont = document.createElement('DIV')
        chapterHeadCont.classList.add('chapter-head-cont')

        const chapterName = document.createElement('DIV')
        const chapterDone = document.createElement('DIV')
        const chapterCPM = document.createElement('DIV')
        const chapterWPM = document.createElement('DIV')
        const chapterACC = document.createElement('DIV')
        const chapterDelBtn = document.createElement('BUTTON')
        const chapterYesDelBtn = document.createElement('BUTTON')

        chapterName.classList.add('chapter-name')
        chapterDone.classList.add('chapter-done')
        chapterCPM.classList.add('chapter-cpm')
        chapterWPM.classList.add('chapter-wpm')
        chapterACC.classList.add('chapter-acc')
        chapterDelBtn.classList.add('chapter-del')
        chapterYesDelBtn.classList.add('chapter-yes-del', 'hidden')

        chapterName.textContent = Object.keys(chapt)[0]
        chapterDelBtn.textContent = 'Del'
        chapterYesDelBtn.textContent = 'YES, DELETE!'

        chapterHeadCont.appendChild(chapterDone)
        chapterHeadCont.appendChild(chapterName)
        chapterHeadCont.appendChild(chapterCPM)
        chapterHeadCont.appendChild(chapterWPM)
        chapterHeadCont.appendChild(chapterACC)
        chapterHeadCont.appendChild(chapterDelBtn)
        chapterHeadCont.appendChild(chapterYesDelBtn)

        chapterDelBtn.addEventListener("click", (event) => {
            chapterYesDelBtn.classList.remove('hidden')
            event.stopPropagation()
        })

        chapterYesDelBtn.addEventListener("click", (event) => {
            const chapterName = event.target.parentElement.childNodes[1].textContent
            event.stopPropagation()
            if (chapterName.length > 0) {
                deleteTextsByChapter(chapterName)
            }
        })

        chapterHeadCont.addEventListener("click", (event) => {
            for (let i=1; i<event.target.parentElement.childNodes.length; i++) {
                event.target.parentElement.childNodes[i].classList.toggle('hidden')
            }
        })

        chapterMainCont.appendChild(chapterHeadCont)

        let textSum = 0
        let doneSum = 0

        let charsSum = 0
        let wordsSum = 0
        let timeSum = 0
        let errorsSum = 0

        for (let text of chapt[Object.keys(chapt)[0]]) {
            textSum++
            const chapterTextContHide = document.createElement('DIV')
            chapterTextContHide.classList.add('chapter-text-cont-hide')

            const chapterTextCont = document.createElement('DIV')
            chapterTextCont.classList.add('chapter-text-cont')
            chapterTextCont.setAttribute('id', 'text'+text['text_id']);

            const chapterTextText = document.createElement('DIV')
            const chapterTextDone = document.createElement('DIV')
            const chapterTextCPM = document.createElement('DIV')
            const chapterTextWPM = document.createElement('DIV')
            const chapterTextACC = document.createElement('DIV')
            const chapterTextDelBtn = document.createElement('BUTTON')
            const chapterTextYesDelBtn = document.createElement('BUTTON')

            chapterTextText.classList.add('chapter-text-text')
            chapterTextDone.classList.add('chapter-text-done')
            chapterTextYesDelBtn.classList.add('hidden')

            if (text['done'] == true) {
                doneSum++
                chapterTextDone.textContent = '✅'
            } else {
                chapterTextDone.textContent = '❌'
            }

            chapterTextText.textContent = text['text_preview']

            if (text['chars'] > 0) {
                const chars = text['chars']
                const words = text['words']
                const time = text['time']
                const errors = text['errors']
                charsSum += chars
                wordsSum += words
                timeSum += time
                errorsSum += errors
                const cpm = Math.round(chars / time * 60 * 1000)
                const wpm = Math.round(words / time * 60 * 1000)
                const acc = Math.round((1.0 - (errorsSum / charsSum)) * 100)
                chapterTextCPM.textContent = `${cpm} CPM`
                chapterTextWPM.textContent = `${wpm} WPM`
                chapterTextACC.textContent = `${acc}% acc`
            }
            chapterTextDelBtn.textContent = 'Del'
            chapterTextYesDelBtn.textContent = 'YES, DELETE!'

            chapterTextCont.appendChild(chapterTextDone)
            chapterTextCont.appendChild(chapterTextText)
            chapterTextCont.appendChild(chapterTextCPM)
            chapterTextCont.appendChild(chapterTextWPM)
            chapterTextCont.appendChild(chapterTextACC)
            chapterTextCont.appendChild(chapterTextDelBtn)
            chapterTextCont.appendChild(chapterTextYesDelBtn)

            chapterTextContHide.appendChild(chapterTextCont)
            chapterMainCont.appendChild(chapterTextContHide)

            chapterTextDelBtn.addEventListener("click", (event) => {
                chapterTextYesDelBtn.classList.toggle('hidden')
                event.stopPropagation()
            })

            chapterTextYesDelBtn.addEventListener("click", (event) => {
                try {
                    const id = event.target.parentElement.id.replace('text', '')
                    deleteTextsById(id)
                } catch (err) { console.error(err) }
                event.stopPropagation()
            })

            chapterTextCont.addEventListener("click", (event) => {
                const id = event.target.id.replace('text', '')
                window.location.href = '/type/' + id
            })
        }
        if (charsSum > 0) {
            const cpm = Math.round(charsSum / timeSum * 60 * 1000)
            const wpm = Math.round(wordsSum / timeSum * 60 * 1000)
            const acc = Math.round((1.0 - (errorsSum / charsSum)) * 100)
            chapterCPM.textContent = `${cpm} CPM`
            chapterWPM.textContent = `${wpm} WPM`
            chapterACC.textContent = `${acc}% acc`
        }
        if (textSum === doneSum) {
            chapterDone.textContent = `✅`
            for (let i=1; i<chapterMainCont.childNodes.length; i++) {
                chapterMainCont.childNodes[i].classList.toggle('hidden')
            }
        } else if (doneSum > 0) {
            chapterDone.textContent = `🟡`
            keepOneMoreOpen++
        } else if (keepOneMoreOpen === 0) {
            chapterDone.textContent = `❌`
            keepOneMoreOpen++
        } else {
            chapterDone.textContent = `❌`
            for (let i=1; i<chapterMainCont.childNodes.length; i++) {
                chapterMainCont.childNodes[i].classList.toggle('hidden')
            }
        }
        textsMainCont.appendChild(chapterMainCont)
    }
}


async function deleteTextsByChapter(chapter_str) {
    fetch(`/api-texts/delete-by-chapter-str/`,
    {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({'chapter': chapter_str})
    })
    .then(response => {
        if (response.status === 204) {
            console.log('Texts deleted successfully')
        } else {
            console.log('Something went horribly wrong...')
        }
    })
    .then(await sleep(wain1sec))
    .then(() => { window.location.reload() })
}


async function deleteTextsById(text_id) {
    fetch(`/api-texts/delete-by-text-id/${text_id}`,
    {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (response.status === 204) {
            console.log('Texts deleted successfully')
        } else {
            console.log('Something went horribly wrong...')
        }
    })
    .then(await sleep(wain1sec))
    .then(() => { window.location.reload() })
}


function addNewBookBtn() {
    const divAddBookCont = document.createElement('DIV')
    const divBook = document.createElement('DIV')
    divAddBookCont.classList.add('book-cont')
    divAddBookCont.classList.add('book-cont-add')
    divAddBookCont.classList.add('hoverable')
    divAddBookCont.setAttribute('id', 'new')
    divBook.classList.add('book-plus')
    divBook.textContent = '+ add book...'
    divAddBookCont.appendChild(divBook)
    divBookList.appendChild(divAddBookCont)

    divAddBookCont.addEventListener("click", () => {
        newBookDiv.classList.toggle('hidden')
        bookDiv.classList.add('hidden')
        while (textsMainCont.firstChild) { textsMainCont.firstChild.remove() }
        addTextMainDiv.classList.add('hidden')
    });
}


async function addNewBookBtnClicked() {
    const bookName = newBookInput.value
    // console.log(bookName.length)
    if (bookName.length > 0 && bookName.length < 256) {
        fetch(`/api-books/add/`,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({'name': bookName})
        })
        .then(response => {
            if (response.status === 204) {
                console.log('Book added successfully')
            } else {
                console.log('Something went horribly wrong...')
            }
        })
        .then(await sleep(wain1sec))
        .then(() => { window.location.reload() })
    } else {
        console.log('Invalid name')
    }
}

async function yesDeleteBookClicked() {
    if (currentBookId) {
        fetch(`/api-books/delete/${currentBookId}`,
        {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        })
        .then(response => {
            if (response.status === 204) {
                console.log('Book deleted successfully')
            } else {
                console.log('Something went horribly wrong...')
            }
        })
        .then(await sleep(wain1sec))
        .then(() => { window.location.reload() })
    } else {
        console.log('no book id')
    }
}

function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms));}