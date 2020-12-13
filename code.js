
var TOKEN = "1326277324:AAGIGMpXIega-CnhljzToqZAZ-cV4RGPkmQ";
var sheet_id = "1MiPByQzVG-Zwe0vDSYjFSU-gfTt5uwH8JKQY61tk9JQ";
var telegramUrl = "https://api.telegram.org/bot" + TOKEN;
var webAppUrl = "https://script.google.com/macros/s/AKfycbyP7yjkj0kTjpODuAlFUQvZFVxjxziJO-8qOmwByAmjBGL5EHA/exec";

// main function to deal with users
function doPost(e) {
    var contents = JSON.parse(e.postData.contents);
  
    if (contents.callback_query) {
      var idCallback = contents.callback_query.message.chat.id;
      var name = contents.callback_query.from.first_name;
      var userID = contents.callback_query.from.id;
      var data = contents.callback_query.data;
      var command = data.split('-')[0];
      
      if (command === 'category') {
        giveFavours(idCallback, data);
      } else if (command === 'favour') {
        makeRequest(idCallback, data, userExists(idCallback).room);
      } else if (command === 'cancel') {
            sendText(idCallback, cancelRequest(data.split('-')[1], userID));
      }
    } else if (contents.message) {
      var chatID = contents.message.chat.id;
      var text = contents.message.text;
      var userId = contents.message.from.id;
      
      if (text === '/register') {
        register(userId);
      } else if (text === '/send_help'){
        chooseCategory(userId);
      } else if (text === '/start') {
        sendText(
          chatID,
          "Welcome to Eusoff's Favour Bot! \nTo sign up /register \n" +
          "To view active requests /view \nTo delete your current requests /cancel\nTo make request /send_help"
        );
      } else if (text === '/view') {
        view(userId);
      } else if (text === '/cancel') {
        if (viewOwn(userId) === false) {
            sendText(chatID, 'You have no bookings to cancel');
        } else {
            sendText(chatID, 'Which request do you want to cancel?', viewOwn(userId));
        }
      }
      
      addUser(contents);
    }
}

// webhook
// ------------------------------------
function setWebhook() {
    var url = telegramUrl + "/setWebhook?url=" + webAppUrl;
    var response = UrlFetchApp.fetch(url);
}

function deleteWebhook() {
    var url = telegramUrl + "/deleteWebhook";
    var response = UrlFetchApp.fetch(url);
}
// ------------------------------------

// register (done)
// ------------------------------------
function register(id) {
    var user = userExists(id);
    var text = 'failed';
  
    if (Object.getOwnPropertyNames(user).length === 0) {
      text =
        "Welcome to Eusoff Favour Bot. You do not exist in our system yet. Let's change that." +
        '\n\n' +
        '<b> What is your name and room number? </b>';
      sendText(id, text);
      text =
        'Please input in the format: <b> Name A101 </b>, for example: John A101';
    } else {
      text =
        'Welcome back ' +
        user.name +
        '!!' +
        '\n\n' +
        'Your room number is ' +
        user.room +
        '\n\n' +
        'Would you like to make a request? /send_help' +
        '\n' +
        'Would you like to cancel your booking? /cancel' +
        '\n' +
        'Would you like to check the active requests? /view';
    }
    sendText(id, text);
}

function addUser(data) {
    var sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Users');
  
    var raw_user_data = data.message.text;
    var user_data_arr = raw_user_data.split(" ");

    var name = user_data_arr[0];
    var room = user_data_arr[1];
    var id = data.message.chat.id;
    var init_favours = 5;
    var init_simp_count = 0;
  
    sheet.appendRow([id, name, room, init_favours, init_simp_count]);
  
    var text =
        'Hello ' +
        name +
        '! You are successfully added to FavourBot.' +
        '\n\n' +
        'Please check your details.' +
        '\n' +
        'Name: ' +
        name +
        '\n' +
        'Room: ' +
        room +
        '\n' +
        'To make a request, use /makeRequest, view active requests use /viewActiveRequest & to delete a booking /delete';
  
      sendText(id, text);
}
// ------------------------------------

// view
function view(userID) {
    var sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');
    var rangeData = sheet.getDataRange();
    var lastRow = rangeData.getLastRow();
    var lastColumn = rangeData.getLastColumn();

    var searchRange = sheet.getRange(2, 1, lastRow - 1, lastColumn);
    var rangeValues = searchRange.getValues();

    var active_requests = '';
    
    for (i = 0; i < lastRow - 1; i++) {
        var ref = rangeValues[i][0]
        var request = rangeValues[i][1];
        var favour = rangeValues[i][2];
        active_requests = active_requests + ref + '. ' + request + "    " + favour + " favour(s)\n";
    }
    sendText(userID, active_requests);
}

// delete
// ------------------------------------
function viewOwn(userID) {
    var curr_user = userExists(userID);
    var room = curr_user.room;
    
    var sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');
    var rangeData = sheet.getDataRange();
    var lastRow = rangeData.getLastRow();
    var lastColumn = rangeData.getLastColumn();

    var searchRange = sheet.getRange(2, 1, lastRow - 1, lastColumn);
    var rangeValues = searchRange.getValues();

    var count = 0;
    var keyboard = [];
  
    for (i = 0; i < lastRow - 1; i++) {
        if (rangeValues[i][3] === userID && rangeValues[i][4] === "Available") {
            keyboard[count] = [
                {
                  text: rangeValues[i][1] + "    " + rangeValues[i][2] + " favour(s)\n",
                  callback_data: 'cancel-' + i,
                },
            ];
            count++;
        }
    }
  
    var cancelKeyboard = {
      inline_keyboard: keyboard,
    };
    if (count === 0) {
      return false;
    } else {
      return cancelKeyboard;
    }
}

function cancelRequest(row_data, userID) {
    var active_request_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');
    var curr_user = userExists(userID);
    // some gross programming here
    var row = parseInt(row_data) + 2; // add 2 to offset the array index start and the column headings
    var requestID = active_request_sheet.getRange(row, 4).getValue();
    var status = active_request_sheet.getRange(row, 5).getValue();
    
    if (requestID === userID && status === 'Available') {
        active_request_sheet.getRange(row, 5).setValue('Cancelled');
        return 'Request cancelled!';
    } else {
        return 'You have no active requests!';
    }
}
// ------------------------------------

// sendHelp
// ------------------------------------
function chooseCategory(userID) {
    var category_keyboard = {
        inline_keyboard: [
          [
            {
              text: 'Dabao',
              callback_data: 'category-Dabao',
            },
          ],
          [
            {
              text: 'Collect Laundry',
              callback_data: 'category-Collect_Laundry',
            },
          ],
          [
            {
              text: 'Borrow Item',
              callback_data: 'category-Borrow_Item',
            },
          ],
          [
            {
              text: 'Open Gate',
              callback_data: 'category-Open_Gate',
            },
          ],
        ],
    };

    sendText(userID, 'What Category?', category_keyboard);
}

function giveFavours(userID, data) {
    // split things like 'category-Collect Laundry' -> ['category', 'Collect Laundry']
    var data_arr = data.split("-");
    var category = data_arr[1];
    var favours = {
        inline_keyboard: [
            [
            {
                text: '1',
                callback_data: 'favour-' + category + ' 1',
            },
            ],
            [
            {
                text: '2',
                callback_data: 'favour-' + category + ' 2',
            },
            ],
            [
            {
                text: '3',
                callback_data: 'favour-' + category + ' 3',
            },
            ],
        ],
    };

    sendText(userID, 'How many favours?', favours);
}

function addRemark(id) {
    var text = 'Add your remark on your request, for example: Deck Chicken Rice no chicken'
    sendText(id, text);
}

function makeRequest(userID, data, room) {
    var active_request_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');
    var rangeData = active_request_sheet.getDataRange();
    var lastRow = rangeData.getLastRow();

    var data_arr = data.split('-');
    var category_number = data_arr[1];
    var category = category_number.split(' ')[0];
    var number = category_number.split(' ')[1];

    var request = category;
    var favours = number;
    var status = 'Available'    
    var now = currentDateTime();

    active_request_sheet.appendRow([lastRow, request, favours, userID, status, now[0], now[1]]);

      sendText(userID, 'Request made: ' + request + ' \n' + favours + ' favour(s)' +'\nRef number: ' + lastRow);
}
// ------------------------------------

// return the curretn date and time
function currentDateTime() {
    var dateObj = new Date();
    var month = dateObj.getMonth() + 1;
    var day = String(dateObj.getDate()).padStart(2, '0');
    var year = dateObj.getFullYear();
    var date = day + '/' + month  + '/'+ year;  
    var hour = dateObj.getHours();
    var min  = dateObj.getMinutes();
    var time = hour + ':' + (min < 10 ? "0" + min : min);
    return [date, time];
}
//
// checking validity of data to prevent bugs
// ------------------------------------
function userExists(id) {
    var sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Users');
    var rangeData = sheet.getDataRange();
    var lastColumn = rangeData.getLastColumn();
    var lastRow = rangeData.getLastRow();
  
    if (lastRow === 0) {
      return {};
    }
  
    var searchRange = sheet.getRange(2, 1, lastRow - 1, lastColumn);
    var rangeValues = searchRange.getValues();
  
    var person = {};
  
    for (j = 0; j < lastRow - 1; j++) {
      if (rangeValues[j][0] === id) {
        person.chatID = rangeValues[j][0];
        person.name = rangeValues[j][1];
        person.room = rangeValues[j][2];
        break;
      }
    }
    return person;
}
// ------------------------------------

// send text function
function sendText(chatId, text, keyBoard) {
    var data = {
      method: 'post',
      payload: {
        method: 'sendMessage',
        chat_id: String(chatId),
        text: text,
        parse_mode: 'HTML',
        reply_markup: JSON.stringify(keyBoard),
      },
    };
    return UrlFetchApp.fetch(telegramUrl + '/', data);
}





