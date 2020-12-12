
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

        if (command === 'view') {
            sendText(idCallback, viewTime(data.split('-')[1]));
          } else if (command === 'category') {
            giveFavours(idCallback, data);
          } else if (command === 'favour') {
            makeRequest(idCallback, data, userExists(idCallback).room);
          } else if (command === 'delete') {
            sendText(idCallback, deleteRequest(data.split('-')[1], data.split('-')[2], userID));
          }
    } else if (contents.message) {
        var chatID = contents.message.chat.id;
        var text = contents.message.text;
        var userId = contents.message.from.id;

        if (text === '/view') {
            view(userId);
          } else if (text === '/register') {
            register(userId);
          } else if (text === '/sendHelp') {
            chooseCategory(userId);
          } else if (text === '/delete') {
            if (viewOwn(userId) === false) {
              sendText(chatID, 'You have no bookings to delete');
            } else {
              sendText(chatID, 'Which request do you want to delete?', viewOwn(userId));
            }
          } else if (text === '/start') {
            sendText(
              chatID,
              "Welcome to Eusoff's Favour Bot! \n To sign up /register \n" +
              "To view active requests /view \n To delete your current requests /delete\n To make request /sendHelp"
            );
          } else if (isRoomValid(contents)) {
            addUser(contents);
          } else {
            invalid(userId);
          }
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
        user.room
        '\n\n' +
        'Would you like to make a request? /sendHelp' +
        '\n' +
        'Would you like to delete your booking? /nvm' +
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
  
    sheet.appendRow([id, name, room]);
  
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
        'To make a request, use /sendHelp, view active requests use /view & to delete a booking /delete';
  
      sendText(id, text);
}
// ------------------------------------

// view (done)
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
    var active_request_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');
    var requestrange = active_request_sheet.getRange(1, 1, 93, 8);
    var requestdata = requestrange.getValues();
    var count = 0;
    var keyboard = [];
  
    for (i = 0; i < 8; i++) {
      for (j = 0; j < 77; j++) {
        if (requestdata[j][i] === room) {
          keyboard[count] = [
            {
              text: requestdata[0][i] + ' ' + requestdata[j][0],
              callback_data: 'delete-' + (i + 1) + '-' + (j + 1),
            },
          ];
          count++;
        }
      }
    }
  
    for (i = 0; i < 8; i++) {
      for (j = 77; j < 92; j++) {
        if (bookingdata[j][i] === room) {
          keyboard[count] = [
            {
              text: bookingdata[0][i + 1] + ' ' + bookingdata[j][0],
              callback_data: 'delete-' + (i + 1) + '-' + (j + 1),
            },
          ];
          count++;
        }
      }
    }
  
    var deleteKeyboard = {
      inline_keyboard: keyboard,
    };
    if (count === 0) {
      return false;
    } else {
      return deleteKeyboard;
    }
  }

function deleteRequest(col, row, userID) {
    var active_request_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');
    var curr_user = userExists(userID);
    var room = curr_user.room;
    if (room === active_request_sheet.getRange(row, col).getValue()) {
        active_request_sheet.getRange(row, col).clearContent();
        return 'Request deleted!';
    } else {
        return 'You have no active requests!';
    }
}
// ------------------------------------

// sendHelp (done)
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
              callback_data: 'category- Collect_Laundry',
            },
          ],
          [
            {
              text: 'Borrow Item',
              callback_data: 'category-Borrow_Item',
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

function makeRequest(userID, data, room) {
    sendText(userID, 'Almost There');
    var active_request_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');
    var rangeData = active_request_sheet.getDataRange();
    var lastRow = rangeData.getLastRow();

    var data_arr = data.split('-');
    var category_number = data_arr[1];
    var category = category_number.split(' ')[0];
    var number = category_number.split(' ')[1];

    var request = category;
    var favours = number;

    active_request_sheet.appendRow([lastRow, request, favours])

      sendText(userID, 'Request made: ' + request + ' \n' + favours + ' favour(s)' +'\nRef number: ' + lastRow);
}
// ------------------------------------

// checking validity of data to prevent bugs
// ------------------------------------
function invalid(id) {
    var text = 'Oops! Looks like you entered an incorrect command.';
    sendText(id, text);
}

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

function isRoomValid(data) {
    var raw_user_data = data.message.text;
    var user_data_arr = raw_user_data.split(" ");

    var room = user_data_arr[1];
    var id = data.message.chat.id;
    var user = userExists(id);
  
    if (Object.getOwnPropertyNames(user).length === 0) {
      var sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Users');
  
      var searchRange = sheet.getRange(93, 1, 497, 2);
      var rangeValues = searchRange.getValues();
  
      for (j = 0; j < 497; j++) {
        if (rangeValues[j][0] === room) {
          return true;
        }
      }
    }
    return false;
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





