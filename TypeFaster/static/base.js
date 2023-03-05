const darkModeCheckbox = document.querySelector('.dark-mode-checkbox')
const widthInputField = document.querySelector('.width-input')
const widthSaveBtn = document.querySelector('.width-save')
const showStatsBarCheckbox = document.querySelector('.show-stats-bar-checkbox')
const showErrorsCheckbox = document.querySelector('.show-errors-checkbox')
const options = JSON.parse(document.getElementById('options').textContent)

onInit()


function onInit() {
    darkModeCheckbox.checked = options['dark_mode']
    showErrorsCheckbox.checked = options['show_errors']
    showStatsBarCheckbox.checked = options['show_stats_bar']
    widthInputField.value = options['window_width']
    setColorThemeCheckbox(darkModeCheckbox.checked)
    setWidthToCssAndInputField(options['window_width'])
    setShowStatsBarCheckbox(showStatsBarCheckbox.checked)
    setErrorShowCheckbox(showErrorsCheckbox.checked)
    darkModeCheckbox.addEventListener('input', () => { setOptions() });
    widthInputField.addEventListener('keypress', (e) => { if (e.key === 'Enter') { setOptions() } } );
    widthSaveBtn.addEventListener('click', () => { setOptions() });
    showStatsBarCheckbox.addEventListener('input', () => { setOptions() });
    showErrorsCheckbox.addEventListener('input', () => { setOptions() });
}


function setOptions() {
    darkModeCheckbox.setAttribute('disabled', 'disabled')
    widthInputField.setAttribute('disabled', 'disabled')
    widthSaveBtn.setAttribute('disabled', 'disabled')
    showStatsBarCheckbox.setAttribute('disabled', 'disabled')
    showErrorsCheckbox.setAttribute('disabled', 'disabled')
    setColorThemeCheckbox(darkModeCheckbox.checked)
    setErrorShowCheckbox(showErrorsCheckbox.checked)
    setShowStatsBarCheckbox(showStatsBarCheckbox.checked)
    hideParentIfChildrenAreHidden()
    const widthParsedValue = parseInt(widthInputField.value)
    if (Number.isInteger(widthParsedValue) && widthParsedValue >= 800 && widthParsedValue <= 1800) {
        setWidthToCssAndInputField(widthParsedValue)
        fetch(`/api-set-options/`,
        {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'dark_mode': darkModeCheckbox.checked,
                'show_errors': showErrorsCheckbox.checked,
                'show_stats_bar': showStatsBarCheckbox.checked,
                'window_width': widthParsedValue
            })
        })
        .then(response => {
            if (response.status === 204) {
                darkModeCheckbox.removeAttribute('disabled')
                widthInputField.removeAttribute('disabled')
                widthSaveBtn.removeAttribute('disabled')
                showStatsBarCheckbox.removeAttribute('disabled')
                showErrorsCheckbox.removeAttribute('disabled')
            }
        })
    } else {
        darkModeCheckbox.removeAttribute('disabled')
        widthInputField.removeAttribute('disabled')
        widthSaveBtn.removeAttribute('disabled')
        showStatsBarCheckbox.removeAttribute('disabled')
        showErrorsCheckbox.removeAttribute('disabled')
    }
}


function setColorThemeCheckbox(darkMode) {
    const mainBody = document.querySelector('body')
    if (darkMode === true) {
        mainBody.classList.remove('light'); mainBody.classList.add('night')
    } else if (darkMode === false) {
        mainBody.classList.remove('night'); mainBody.classList.add('light')
    }
}


function setWidthToCssAndInputField(width) {
    const root = document.querySelector(':root');
    root.style.setProperty('--main-width', `${width}px`);
}


function setShowStatsBarCheckbox(showStatsDiv) {
    const statsDiv = document.querySelector('.announcements .stats')
    if (showStatsDiv === true && statsDiv) {
        statsDiv.style.display = 'block'
    } else if (showStatsDiv === false && statsDiv) {
        statsDiv.style.display = 'none'
    }
}


function setErrorShowCheckbox(showError) {
    const mainBody = document.querySelector('body')
    if (showError === true) {
        mainBody.classList.remove('not-show-errors'); mainBody.classList.add('show-errors')
    } else if (showError === false) {
        mainBody.classList.remove('show-errors'); mainBody.classList.add('not-show-errors')
    }
}


// КОСТЫЛИЩЕ но я хз как иначе =(
function hideParentIfChildrenAreHidden() {
    if (window.location.toString().includes("type")) {
        const parent = document.querySelector('.info-block')
        const children = document.querySelectorAll('.info-block > .announcements > div')
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
}

