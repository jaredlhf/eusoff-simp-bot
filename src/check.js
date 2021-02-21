function check(userID) {
  var data = userInfo(userID);
  var credits = data.total_credits;
  var name = data.name;
  var room = data.room;
  var simp = data.simp_count;

  var rangeValues = requestRange();
  var strReqMade = "\n\nRequests Made: \n".bold();
  var strReqTaken = "\nRequests Taken: ".bold();
  var strFinal = '';

  for (i = 0; i < requestLastRow() - 1; i++) {
    var req = requestInfo(rangeValues[i][0])
    var user = userInfo(rangeValues[i][3]);

    if (req.userId == userID && req.status !== "Completed" && req.status !== "Cancelled") {
      strReqMade += '\n' + req.request + '\nCredit(s): ' + req.credits + '\nRef number: ' 
      + req.ref + '\nRemark: ' + req.remark + '\n';
    } else if (req.slaveId == userID && req.status == "Taken") {
      strReqTaken += '\n\n' + req.request + '\nCredit(s): ' + req.credits + '\nMade by: ' + user.name +
      '\nRef number: ' + req.ref + '\nRemark: ' + req.remark + '\n';
    }
  }

  if (credits === 0) {
    strFinal = "Hi " + name + "(" + room + ")! " + "You have 0 credits:( Do some good! \nSimp Count: " + simp;
  } else {
    strFinal = "Hi " + name + "(" + room + ")! " + "You have " + credits + " credits!\nSimp Count: " + simp;
  }
  return strFinal + strReqMade + strReqTaken;
}
