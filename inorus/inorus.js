/*
    Ilume Soluctions - Inorus
    Wrote by Wilton, Victor and Clebson
*/

let currentSelector;

//Recovery the div that was selected
const setCurrentSelector = (actualSelector) => {
    currentSelector = actualSelector;
};


const setLang = (lang) => {
    language = lang;
};

//----------MODAL----------\\

//modal functions for inorus app
const modal = {
    open: (item) => {
        document.querySelector('.cover').style.display = "block";
        document.querySelector('.cover .text').innerHTML = item.target.innerText;
    },
    close: () => {
        document.querySelector('.cover .text').innerHTML = "";
        document.querySelector('.cover').style.display = "none";
        document.querySelector('.suggestionText').value = "";
    }
}

//----------MODAL END----------\\

function configModal() {
    document.querySelector('.suggestionButton').addEventListener('click', () => {
        const suggestionText = document.querySelector('.suggestionText').value;

        //This will get all the inorus elements into firebase
        firebase.database().ref('/suggestions/' + language).once('value').then(function (snapshot) {

            //The reference to the current div selected into the firebase
            let databaseReference = "/suggestions/" + language + "/" + currentSelector;

            if (snapshot.val() != null) {

                //This identifier will give to me if haven't a data with the suggestion text...
                var identifier = false;

                for (const index in snapshot.val()[currentSelector]) {
                    //First I see if exists something with the suggestion text...
                    if (snapshot.val()[currentSelector][index].text.toUpperCase() === suggestionText.toUpperCase()) {

                        //If the number of suggestions are behind  and 5, I just increment the number of suggestions
                        if (snapshot.val()[currentSelector][index].calls < 5) {
                            firebase.database().ref(databaseReference).child(index).update({
                                "calls": snapshot.val()[currentSelector][index].calls + 1
                            });
                        } else {
                            //If the number of suggestions if above 5, I change the text that will be shown to the  user
                            firebase.database().ref(databaseReference).child(index).set({});

                            if(defaultLanguage === language){
                                firebase.database().ref('/all/' + language + '/' + currentSelector).update({
                                    "text": suggestionText,
                                    "length": suggestionText.length
                                });
                            }else{
                                firebase.database().ref('/all/' + language + '/' + currentSelector).update({
                                    "text": suggestionText
                                });
                            }
                            getData(language);
                        }

                        identifier = true;
                        break;

                    }
                }

                //If haven't a data with the suggestion text I create a new node with this data
                if (!identifier) {
                    const pushData = firebase.database().ref(databaseReference).push();
                    pushData.set({
                        "text": suggestionText,
                        "calls": 1
                    });
                }

            } else {
                const pushData = firebase.database().ref(databaseReference).push();
                pushData.set({
                    "text": suggestionText,
                    "calls": 1
                });
            }
        });
    });

    document.querySelector('.suggestionButton').addEventListener('click', () => {
        modal.close();
    });

    document.querySelector('.suggestionCancel').addEventListener('click', () => {
        modal.close();
    });

    document.addEventListener('keydown', function (event) {
        const key = event.key;
        if (key === "Escape") {
            modal.close();
        }
    });

}

function createModal() {
    const body = document.getElementsByTagName("body");

    const div = document.createElement('div');
    div.setAttribute('class', 'cover modal');
    div.style.display = 'none';

    const divContent = document.createElement('div');
    divContent.setAttribute('class', 'content');

    const text = document.createElement('div');
    text.setAttribute('class', 'text');
    //text.textContent = item.target.innerText;

    const textarea = document.createElement('textarea');
    textarea.setAttribute('class', 'suggestionText');

    const sendBtn = document.createElement('button');
    sendBtn.setAttribute('class', 'suggestionButton');
    sendBtn.textContent = "Send suggestion";

    const cancelBtn = document.createElement('button');
    cancelBtn.setAttribute('class', 'suggestionCancel');
    cancelBtn.textContent = "Cancel";


    divContent.appendChild(text);
    divContent.appendChild(textarea);
    divContent.appendChild(sendBtn);
    divContent.appendChild(cancelBtn);
    div.appendChild(divContent);

    body[0].appendChild(div);


    configModal();
}


var elements = document.getElementsByClassName("inorus");
var phrases = [];

//-----------------------------------------------------
var element;
var phrase;
var sizeFont;

function Element(element){
    this.element = element;
    var teste = window.getComputedStyle(element).fontSize;
    this.sizeFont = teste;
    this.phrase = element.innerText;
}

function compare(i,length){
    var inorusElement = phrases[i];
    var lengthOriginal = parseInt(length);

    if(inorusElement.element.innerText.length>lengthOriginal){
        var numericVar = inorusElement.element.innerText.length/lengthOriginal;
        if(numericVar>=2)
            numericVar = 2.5;
        else
            numericVar = 1;

        var fontIdeal = (numericVar)*((lengthOriginal*parseFloat(inorusElement.sizeFont.replace("px","")))/inorusElement.element.innerText.length);
        inorusElement.element.style.setProperty("font-size", fontIdeal+"px", "important");
    } else{
        phrases[i].element.style.setProperty("font-size", phrases[i].sizeFont, "important");
    }
}

function countPhrases(elements){
    for(var i = 0; i<elements.length; i++){
        phrases.push(new Element(elements[i]));
    }
}

function preencher(result,language){
    if(phrases.length==0){
        countPhrases(elements);
    }

    for(var i = 0; i < phrases.length; i++){

        if(language=="ar")
            changeAlignment(phrases[i].element,"right");
        else
        changeAlignment(phrases[i].element,"left");


        if(phrases[i].element.id!=""){
            phrases[i].element.innerText = result[language][phrases[i].element.id].text;
            compare(i,result[language][phrases[i].element.id].length);
            addClickListener(phrases[i].element,result);
        }
    }
}

//para depois caso necessário
let current_language;


// aqui o click
function addClickListener(element,result){
    element.addEventListener('click', function(event) {
        setCurrentSelector(event.target.getAttribute('id'));
        modal.open(event);
    });
}

function getData(language){
    current_language = language;
    setLang(language);
    // document.body.style.display = "none";    -> ESTILIZAR
    //https://api.myjson.com/bins/1f2r7u.json'+language+'.json'
    fetch('https://inorus-840b6.firebaseio.com/all.json', {method: 'get'
    }).then(function(response) {
        return response.json();
    }).then(function(result) {
        document.body.style.display = "block";
        createSelect(result);
        preencher(result,language);
    }).catch(function(err) {
        console.log(err);
    });
}

function selectItemByValue(elmnt, value){

    for(var i=0; i < elmnt.options.length; i++)
    {
      if(elmnt.options[i].value === value) {
        elmnt.selectedIndex = i;
        break;
      }
    }
  }

function createSelect(result){
    if(document.getElementById('inorus-select')==null){
        var body = document.getElementsByTagName("body");
        //Create and append select list
        var selectList = document.createElement("select");
        selectList.id = "inorus-select";
        selectList.style.setProperty("float", "right");
        body[0].insertBefore(selectList, body[0].firstChild);
        showLanguages(selectList,result);

        selectItemByValue(selectList,current_language);

        selectList.addEventListener('change', function (ev) {
            getData(ev.target.value);
        });
    }
}

function showLanguages(select,result){
    //Create and append the options
    var keys = Object.keys(result);
    
    for (var i = 0; i < keys.length; i++) {
        var option = document.createElement("option");
        option.value = keys[i];
        option.text = keys[i];
        select.appendChild(option);
    }
}

function changeAlignment(element,direction){
    element.style.setProperty("text-align", direction, "important");
}

createModal();
const defaultLanguage = "pt";
getData(defaultLanguage);