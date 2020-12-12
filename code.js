
var TOKEN = "1326277324:AAGIGMpXIega-CnhljzToqZAZ-cV4RGPkmQ";
var sheet_id = "1MiPByQzVG-Zwe0vDSYjFSU-gfTt5uwH8JKQY61tk9JQ";
var telegramUrl = "https://api.telegram.org/bot" + TOKEN;
var webAppUrl = "https://script.google.com/macros/s/AKfycbyP7yjkj0kTjpODuAlFUQvZFVxjxziJO-8qOmwByAmjBGL5EHA/exec";

function doPost(e) {
    var contents = JSON.parse(e.postData.contents);
    var chatID = contents.message.chat.id;
    var excel_sheet =SpreadsheetApp.openById(sheet_id).getSheetByName("Account");
    var test_text = "hi"
    sendText(chatID, "Hold up, you said '" + contents.message.text + "?' What is going on ???");
    excel_sheet.appendRow([contents.message.chat.first_name, contents.message.text]);
}

function sendText(chatId, text) {
    var url = telegramUrl + "/sendMessage?chat_id=" + chatId + "&text=" + text;
    var response = UrlFetchApp.fetch(url);
}

function addUser() {
  
}
  



function setWebhook() {
    var url = telegramUrl + "/setWebhook?url=" + webAppUrl;
    var response = UrlFetchApp.fetch(url);
}


function deleteWebhook() {
    var url = telegramUrl + "/deleteWebhook";
    var response = UrlFetchApp.fetch(url);
}