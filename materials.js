// 物料弹窗的js
(function () {
  var materialsData = [];

  var initTbody = `<tr class='material-tr'>
        <td>
          <select class='type-select'>
            <option value="">请选择物料分类*</option>
            <option value="0">面料</option>
            <option value="1">里料</option>
            <option value="2">辅料</option>
          </select>
          <select class='mark-select'>
            <option value="">请选择标识</option>
            <option value="0">A</option>
            <option value="1">B</option>
            <option value="2">C</option>
          </select>
        </td>
        <td>
          <input type="text" class='displayName-input'>
          <select class='part-select'>
            <option value="">请选择使用部位</option>
            <option value="0">大身主布</option>
            <option value="1">门襟</option>
          </select>
        </td>
        <td>
          <input type="text" class='supplier-input'>
        </td>
        <td> - </td>
        <td> - </td>
        <td>
          <input type="text" class='dosage-input'>
        </td>
        <td>
          <input type="text" class='attritionRate-input'>
        </td>
        <td>
          <button type="button" class="btn btn-danger delete-materials-item">删除</button>
        </td>
      </tr>`

  var removeDataList = []

  // 点击编辑物料按钮弹窗事件
  $('.materials-update-btn').click(function () {
    fetchMaterialsData();
    $('#materialsModal').modal('show');
  });

  // 点击添加物料按钮弹窗事件
  $('.materials-add-btn').click(function () {
    $('#materials-tbody').html(initTbody);
    $('#materialsModalLabel').html('添加物料');
    $('#materialsModal').modal('show');
  });

  // 点击提交事件
  $('.materials-submit').click(function () {
    console.log(formatSubmitData(), 'formatSubmitData');
    // 发送数据请求
  })

  // 点击添加一列事件
  $('.materials-add-tr').click(function () {
    $('#materials-tbody').append(initTbody);
  })

  // 点击删除一行事件
  $("#materialsModal").on("click", ".delete-materials-item", function (e) {
    var target = $(e.currentTarget);
    target.parents('tr.material-tr').remove();
  })

  // 点击删除按钮打开弹框事件
  $('.materials-remove-btn').click(function () {
    // 获取数据
    fetchRemoveData();
    $('#materialsRemoveModal').modal('show');
  })

  // 点击确认删除按钮
  $('.material-remove-table-btn').click(function () {
    // 发送删除请求
    console.log('submit-remove-table-btn');
  })

  // 序列化获取表格数据
  function formatSubmitData() {
    var trs = $('.material-tr');
    return $.map(trs, function (tr) {
      var $tr = $(tr);
      return {
        type: $tr.find('.type-select').val(),
        mark: $tr.find('.mark-select').val(),
        displayName: $tr.find('.mark-select').val(),
        part: $tr.find('.part-select').val(),
        supplier: $tr.find('.supplier-input').val(),
        dosage: $tr.find('.dosage-input').val(),
        attritionRate: $tr.find('.attritionRate-input').val()
      };
    })
  }

  // 获取页面初始数据
  function fetchMaterialsData() {
    // 发送请求
    materialsData = [
      {
        type: 0,
        mark: 0,
        displayName: 'displayName',
        part: 0,
        supplier: 'supplier',
        attributes: [ { '材质': '洗水棉' }, { '毛幅宽': '145.00cm' } ],
        purchasePrice: '9.90/米',
        dosage: 10,
        attritionRate: 0.01
      },
      {
        type: 1,
        mark: 1,
        displayName: 'displayName-1',
        part: 1,
        supplier: 'supplier',
        attributes: [ { '材质': '-' }, { '规格': 'HM3*3' } ],
        purchasePrice: '9.90/个',
        dosage: 11,
        attritionRate: 0.02
      }
    ]
    // 渲染表单体
    renderTbody();
  }

  // 渲染表单体
  function renderTbody() {
    var tbodyHtml = $.map(materialsData, function (material) {
      return `<tr class='material-tr'>
        <td>
          <select class='type-select'>
            <option value="">请选择物料分类*</option>
            <option value="0" ${ material.type == 0 ? 'selected' : '' }>面料</option>
            <option value="1" ${ material.type == 1 ? 'selected' : '' }>里料</option>
            <option value="2" ${ material.type == 2 ? 'selected' : '' }>辅料</option>
          </select>
          <select class='mark-select'>
            <option selected="" value="">请选择标识</option>
            <option value="0" ${ material.mark == 0 ? 'selected' : '' }>A</option>
            <option value="1" ${ material.mark == 1 ? 'selected' : '' }>B</option>
            <option value="2" ${ material.mark == 2 ? 'selected' : '' }>C</option>
          </select>
        </td>
        <td>
          <input type="text" value="${ material.displayName }" class='displayName-input'>
          <select class='part-select'>
            <option value="">请选择使用部位</option>
            <option value="0" ${ material.part == 0 ? 'selected' : '' }>大身主布</option>
            <option value="1" ${ material.part == 1 ? 'selected' : '' }>门襟</option>
          </select>
        </td>
        <td>
          <input type="text" value="${ material.supplier }" class='supplier-input'>
        </td>
        <td>
          ${ material.attributes.map(function (attribute) {
        return `<p>${ Object.keys(attribute)[ 0 ] }: ${ Object.values(attribute)[ 0 ] }</p> `
      }).join('') }
        </td>
        <td>
          ${ material.purchasePrice }
        </td>
        <td>
          <input type="text" value="${ material.dosage }" class='dosage-input'>
        </td>
        <td>
          <input type="text" value="${ material.attritionRate }" class='attritionRate-input'>
        </td>
        <td>
          <button type="button" class="btn btn-danger delete-materials-item">删除</button>
        </td>
      </tr>`
    })
    $('#materials-tbody').html(tbodyHtml);
  }

  // 获取删除表单数据
  function fetchRemoveData() {
    // 发送获取数据的请求
    removeDataList = [
      { 'num': 'part1', 'name': 'metering_type1' },
    ]
    renderRemoveTbody(removeDataList);
  };

  // 渲染删除表单体
  function renderRemoveTbody(list){
    var strHtml = $.map(list, function (item) {
      return `<tr>
			<td>${item.num}</td>
			<td>${item.name}</td>
		</tr>`
    }).join('');

    $('#material-remove-table-tbody').html(strHtml);
  };
})()