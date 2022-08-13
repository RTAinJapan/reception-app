/**
 *  WebアプリケーションとしてGET要求されたのやつ
 */
function doGet(e) {
  //  var url = e.parameter.url;

  // 指定されたURLからGET
  const payload = JSON.stringify(getList());

  // callbackの有無でJSONPとして返すかJSONとして返すか変える
  if (e.parameter.callback) {
    //callbackはクライアントアプリケーションから指定されるcallback関数名
    return ContentService.createTextOutput(e.parameter.callback + '(' + payload + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService.createTextOutput(payload).setMimeType(ContentService.MimeType.JSON);
  }
}

const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

/** 各シートから情報を取得する */
function getList() {
  try {
    const responseSheet = spreadsheet.getSheetByName('入場記録');
    const numRows = responseSheet.getLastRow() - 1;
    const numColumns = responseSheet.getLastColumn();
    const dataList = responseSheet.getRange(2, 1, numRows, numColumns).getValues();

    const list = [];
    for (let i = 0; i < dataList.length; i++) {
      // タイムスタンプ	name	date	code
      if (!dataList[i][0]) continue;

      const item = {
        timestamp: dataList[i][0],
        name: dataList[i][1].toString(),
        date: dataList[i][2].toString(),
        code: dataList[i][3].toString(),
      };
      list.push(item);
    }

    // console.log(JSON.stringify(list, null, '  '));
    return {
      status: 'ok',
      data: list,
    };
  } catch (e) {
    console.log(e);

    return {
      status: 'error',
      message: e,
      data: [],
    };
  }
}

// function __test_get() {
//   console.log(JSON.stringify(getList(), null, '  '));
// }
