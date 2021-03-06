let newLanguagueProps = {};

let result;

function getData() {
    fetch('https://inorus-840b6.firebaseio.com/all.json', {
        method: 'get'
    }).then(function(b) {
        return b.json()
    }).then(function(b) {
        result = b;
        loadTextFrom();
    }).catch(function(b) {
        console.log(b);
    })
}

const select = document.getElementById("language");

function loadTextFrom(){
    var keys = Object.keys(result);
    for (var i = 0; i < keys.length; i++) {
        var option = document.createElement("option");
        option.value = keys[i];
        option.text = keys[i];
        select.appendChild(option);
    }

    activeTexts(select);
    loadData(select.options[select.selectedIndex].value)
}

function activeTexts(selectList){
    selectList.addEventListener('change', function (ev) {
        loadData(ev.target.value);
    });
}

// contagem de passos
let step = 0;

const textConfig = document.getElementById("textConfig");
const textToTranslate = document.getElementById("textToTranslate");
const textTranslated = document.getElementById("textTranslated");

// globais (original é apenas pro click do botao ter acesso ao dado original do loadData
let currentLanguage;
let original;

function loadData(value){
    currentLanguage = value;
    var configs = Object.keys(result[value]);
    original = configs;

    //mostra a propriedade ex inorus-hello
    textConfig.innerText = configs[step];
    // mostra o texto do inorus-hello
    textToTranslate.innerText = result[value][configs[step]].text;
}

const buttonTranslate = document.getElementById("buttonTranslate");

//END OF ALL MY LIFE
document.getElementById('finish').addEventListener('click', () => {
    let languageName = document.getElementById('languageName');

    if(languageName.value == ''){
        alert('Digite um nome para a sua lingua');
    }else{
        firebase.database().ref('/all/'+languageName.value).set(newLanguagueProps);
    }
});

buttonTranslate.addEventListener('click', function(event) {
        if(step < original.length){
            if(textTranslated.value == ''){
                alert("Preencha o campo com uma tradução");
            }else{
                let newText = {
                    "text": textTranslated.value
                };

                newLanguagueProps[textConfig.innerText] = newText;

                // textTranslated.value = '';

                if(step === 0){
                    select.setAttribute('disabled','disabled');
                    step++;
                }else if(step >= original.length-1){
                    document.querySelector('.firstStep').style.display = "none";
                    document.querySelector('.otherSteps').style.display = "none";
                    document.querySelector('.lastStep').style.display = "block";
                }else{
                    step++;
                }
            }
            loadData(currentLanguage);
        }
    });

getData();