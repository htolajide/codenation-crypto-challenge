'use strict';
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const sha1 = require('sha1');

const place = 9;
const alphabet = 'abcdefghijklmnopqrstuvwxyz';
const filePath = path.join(__dirname, 'answer.json');
const dataUrl = 'https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=719602b2201854d79db973cb9a58e279fdc2834e';
const submitUrl = 'https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=719602b2201854d79db973cb9a58e279fdc2834e';

const getCryptLetter = (letter) => {
    const shiftPosition = alphabet.indexOf(letter) - place;
    if (shiftPosition >= 0) return alphabet.charAt(shiftPosition);
    return alphabet.slice(shiftPosition, shiftPosition+1);
};

const decipherString = (string) => string.toLowerCase().split('').map( letter => alphabet.split('')
    .includes(letter)? getCryptLetter(letter) : letter).join('');

const addDecifrado = () => {
    let answerData = JSON.parse(fs.readFileSync( filePath));
    // console.log(answerData)
    const decifrado = decipherString(answerData.cifrado);
    answerData.decifrado = decifrado;
    createNewFileSync(filePath, JSON.stringify(answerData));
};

const addResumo = () => {
   let answerData = JSON.parse(fs.readFileSync(filePath));
    // console.log(answerData)
    const resumo_criptografico = sha1(answerData.decifrado);
    answerData.resumo_criptografico = resumo_criptografico;
    createNewFileSync(filePath, JSON.stringify(answerData));
};
const submitAnswer = () => {
    const formData = new FormData();
    formData.append('answer', fs.createReadStream('./answer.json'))
    
    axios.post(submitUrl, formData, {headers: formData.getHeaders()})
    .then( response => {
        console.log(response.data)
    })
    .catch(error => console.log(error.message))
}

const createNewFileSync = (file, data) => {
    fs.writeFileSync(file, data, err => {
        if(err) throw err
    })
}

const createAndSubmitAnswerFile = () => {
    console.log('Processing your request...')
    axios.get(dataUrl)
    .then( result => {
        // if asnwer file already exists delete it and recreate file incase of update
        // else create a new file.
        fs.exists(filePath, (response) => { 
            if (response === true) {
                fs.unlinkSync(filePath);
                createNewFileSync(filePath, JSON.stringify(result.data)); 
            }else{
                createNewFileSync(filePath, JSON.stringify(result.data));
            }
            addDecifrado();
            addResumo();
            console.log(JSON.parse(fs.readFileSync(filePath)));
            submitAnswer();
            console.log('Done');
        });
    })
    .catch(error => console.log(error.message));
};

createAndSubmitAnswerFile();
    