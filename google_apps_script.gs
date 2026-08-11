/**
 * ==============================================================================
 * BIS CLUB WEBSITE — GOOGLE APPS SCRIPT BACKEND
 * ==============================================================================
 * 
 * Target Web App Endpoint:
 * https://script.google.com/macros/s/AKfycby6nMkLMFpzGvAcGUL7uh5d5x0AbmIGxzB2YUFxDXrSp22oKJl7YiHUl6SsfRQ5k3MX/exec
 * 
 * Column Headers (23 Columns):
 * 1. Timestamp | 2. Registration ID | 3. Event | 4. Registration Type | 5. Full Name |
 * 6. Roll Number | 7. Class / Section | 8. College | 9. Department | 10. Year |
 * 11. Phone | 12. Email | 13. Team Name | 14. Captain / Leader | 15. Member 2 |
 * 16. Member 3 | 17. Member 4 | 18. Member 5 | 19. Member 6 | 20. Poster Medium |
 * 21. Mimes Theme | 22. Science Model / Topic | 23. Consent
 * ==============================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (err) {
    return createJsonResponse({
      success: false,
      message: "Server busy, please try again."
    });
  }

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    initHeadersIfNeeded(sheet);

    var data = JSON.parse(e.postData.contents);
    
    // Generate ONE Registration ID for all selected events in this submission
    var regId = generateRegistrationId(sheet);
    var timestamp = new Date();
    var formattedTimestamp = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

    var fullName    = data.fullName || "";
    var rollNo      = data.rollNo || "";
    var cls         = data.class || "";
    var college     = data.college || "";
    var department  = data.department || "";
    var year        = data.year || "";
    var phone       = data.phone || "";
    var email       = data.email || "";
    var consent     = data.consent ? "Yes" : "No";

    var events = Array.isArray(data.events) ? data.events : [data.events];

    // Append ONE row per selected event with the SAME Registration ID
    for (var i = 0; i < events.length; i++) {
      var eventName = events[i];
      var regType = "Individual";
      var teamName = "";
      var captain = "";
      var members = [];
      var posterMedium = "";
      var mimeTheme = "";
      var sciTopic = "";

      if (eventName === "Poster Making") {
        regType = "Individual";
        posterMedium = data.posterMedium || "";
      } else if (eventName === "Debate") {
        regType = "Team";
        teamName = data.debateTeam || "";
        captain = data.debateCaptain || "";
        members = parseMembers(data.debateMembers);
      } else if (eventName === "Treasure Hunt") {
        regType = "Team";
        teamName = data.thTeam || "";
        captain = data.thCaptain || "";
        members = parseMembers(data.thMembers);
      } else if (eventName === "Rangoli") {
        regType = "Team";
        teamName = data.rangTeam || "";
        captain = fullName;
        members = parseMembers(data.rangMembers);
      } else if (eventName === "Mimes") {
        regType = "Team";
        teamName = data.mimeTeam || "";
        captain = fullName;
        mimeTheme = data.mimeTheme || "";
        members = parseMembers(data.mimeMembers);
      } else if (eventName === "Science via Standards") {
        regType = "Team";
        teamName = data.sciTeam || "";
        captain = fullName;
        sciTopic = data.sciTopic || "";
        members = parseMembers(data.sciMembers);
      } else if (eventName === "Quiz") {
        regType = "Individual";
      }

      var member2 = members[0] || "";
      var member3 = members[1] || "";
      var member4 = members[2] || "";
      var member5 = members[3] || "";
      var member6 = members[4] || "";

      sheet.appendRow([
        formattedTimestamp,
        regId,
        eventName,
        regType,
        fullName,
        rollNo,
        cls,
        college,
        department,
        year,
        phone,
        email,
        teamName,
        captain,
        member2,
        member3,
        member4,
        member5,
        member6,
        posterMedium,
        mimeTheme,
        sciTopic,
        consent
      ]);
    }

    return createJsonResponse({
      success: true,
      registrationId: regId,
      events: events
    });

  } catch (error) {
    return createJsonResponse({
      success: false,
      message: error.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return createJsonResponse({
    success: true,
    message: "BIS Club Apps Script Backend is online."
  });
}

function parseMembers(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return String(raw).split(',').map(function(m) { return m.trim(); }).filter(function(m) { return m.length > 0; });
}

function initHeadersIfNeeded(sheet) {
  if (sheet.getLastRow() === 0) {
    var headers = [
      "Timestamp",
      "Registration ID",
      "Event",
      "Registration Type",
      "Full Name",
      "Roll Number",
      "Class / Section",
      "College",
      "Department",
      "Year",
      "Phone",
      "Email",
      "Team Name",
      "Captain / Leader",
      "Member 2",
      "Member 3",
      "Member 4",
      "Member 5",
      "Member 6",
      "Poster Medium",
      "Mimes Theme",
      "Science Model / Topic",
      "Consent"
    ];
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#4C1D95");
    headerRange.setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
  }
}

function generateRegistrationId(sheet) {
  var prefix = "BIS2026-";
  var lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) {
    return prefix + "0001";
  }

  var idValues = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
  var maxNum = 0;

  for (var i = 0; i < idValues.length; i++) {
    var val = String(idValues[i][0]);
    if (val.indexOf(prefix) === 0) {
      var numStr = val.replace(prefix, "");
      var num = parseInt(numStr, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }

  var nextNum = maxNum + 1;
  var paddedNum = ("0000" + nextNum).slice(-4);
  return prefix + paddedNum;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
