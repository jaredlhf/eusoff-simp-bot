function view(userID) {
  var next = 1;
  var keyboard = [
          [
            {
              text: 'Next',
              callback_data: 'toggleView-' + next,
            },
          ],
  ]
  sendText(userID, getTestView(0), {inline_keyboard: keyboard});
}

function updateView(userID, data, message_id) {
  var data_arr = data.split('-');
  var index = data_arr[1];
  var previous = parseInt(index) - 1;
  var next = parseInt(index) + 1;
  var keyboard = [
          [
            {
              text: 'Previous',
              callback_data: 'toggleView-' + previous,
            },
            {
              text: 'Next',
              callback_data: 'toggleView-' + next,
            },
          ],
        ]
  var finalkeyboard = [
          [
            {
              text: 'Previous',
              callback_data: 'toggleView-' + previous,
            },
          ]
  ]
  var firstkeyboard = [
          [
            {
              text: 'Next',
              callback_data: 'toggleView-' + next,
            },
          ],
  ]
  var str = getTestView(index);
  if (str === 'Showing Active Requests\n\n') {
    updateText(userID, message_id, "There are no active requests to take up!", { inline_keyboard: finalkeyboard });
  } else if (index === "0") {
    updateText(userID, message_id, getTestView(index), {inline_keyboard: firstkeyboard});
  } else {    
    updateText(userID, message_id, getTestView(index), {inline_keyboard: keyboard});
  }
}

function getTestView(index) {
    var rangeValues = requestRange();
    var str = 'Showing Active Requests\n\n'.bold();
    var count = 0;
    var max = 3;

    for (i = 0; i < requestLastRow() - 1; i++) {
      var req = requestInfo(rangeValues[i][0]);
      var user = userInfo(req.userId);

      if (req.status === "Available") {
        if (count >= index*max && count < (index*max + max)) { 
          str += req.ref + ". " + req.request + " - " + req.credits + " credit(s)\nmade by " + 
          user.name + " at " + req.time.slice(0, -2) + ", " + req.date.slice(0, -2) + "\nRemark: " + 
          req.remark + "\n" + "Take Request: /take_" + req.ref + "\nSimp: /simp_" + req.ref + "\n\n";
        }
        count++;
      }
    }
    return str;
}
