'use strict';

$('#default-button').click(() => {
  if (window.confirm('デフォルト値に戻しますか？')) {  
    $('#change-time-form [name=workTime]').val(25);
    $('#change-time-form [name=breakTime]').val(5);  
    $('#change-time-form [name=loop]').val(4);  
    $('#change-time-form [name=lastBreakTime]').val(15);  
  }
});