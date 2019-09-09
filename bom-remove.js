(function () {
  var list = []
  function fetchRemoveData() {
    // 发送获取数据的请求
    list = [
      { part: 'part1', 'metering_type': 'metering_type1' },
      { part: 'part2', 'metering_type': 'metering_type2' },
      { part: 'part3', 'metering_type': 'metering_type3' },
    ]
    renderTbody(list);
  };

  // 渲染表单体
  function renderTbody(list){
    var strHtml = $.map(list, function (item) {
      return `<tr>
			<td>${item.part}</td>
			<td>${item.metering_type}</td>
		</tr>`
    }).join('');

    $('#size-remove-table-tbody').html(strHtml);
  };

  // 点击按钮打开弹框事件
  $('.bom-remove-btn').click(function () {
    // 获取数据
    fetchRemoveData();
    $('#sizeRemoveModal').modal('show');
  })

  // 点击确认删除按钮
  $('#submit-remove-table-btn').click(function () {
    // 发送删除请求

  })
})();