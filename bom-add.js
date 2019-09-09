(function () {
  // 假设基码
  var basicSizeCode = '';
  var sizeArr = [ 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', '6XL', '7XL', '8XL', '9XL' ]
  var initTr = '';

// 设置表头 && 根据头部生成一个空行以便添加
  function renderThead(data) {
    initTr = ''
    var itemFir = data[ 0 ];
    basicSizeCode = itemFir.size_base;
    var theadStart = `<tr><th>尺码部位</th>
                  <th>测量方法</th>
                  <th >基码（${ itemFir.size_base }）</th>
                  `
    var theadEnd = `<th>误差 <input type="checkbox" class="sync-mistake">同步</th>
              <th>操作</th></tr>`
    // 空行
    initTr += `<tr class='size-item'>
              <td>
                <input type="text" value="" name="" class='w80 part'>
              </td>
              <td>
                <input type="text" value="" name="" class='w80 metering-type'>
              </td>
              <td>
                <input type="number" step="0.01" data-size-base=${ itemFir.size_base } value="0" name="" class='w60 basic-code'>
              </td>`
    var theadMiddle = ''
    var jumpArr = itemFir.cList
    for (var i = 0; i < jumpArr.length; i++) {
      var jumpItem = jumpArr[ i ]
      // 最后一个不需要跳码列
      if (i === jumpArr.length - 1) {
        theadMiddle += `<th>${ jumpItem.cm }</th>`
        initTr += ` <td class="${ jumpItem.cm === basicSizeCode ? 'basic-size-td' : '' }" data-last-cm=${ jumpItem.cm }"></td>`
      } else {
        theadMiddle += `<th class=${ jumpItem.cm }>${ jumpItem.cm }</th>
              <th>跳码 <input type="checkbox" class="sync-code sync-jump-code-${ jumpItem.cm }" data-size="${ jumpItem.cm }">同步</th>`
        initTr += ` <td class="${ jumpItem.cm === basicSizeCode ? 'basic-size-td' : '' }"></td>
              <td>
                <input type="number" step="0.01" value="" name="" class='w60 jump-code' data-size="${ jumpItem.cm }">
              </td>`
      }
    }
    initTr += `<td>
                ±<input type="number"  step="0.01" value="" name="" class='w60 mistake-code'>
              </td>
              <td>
                <button type="button" class="btn btn-danger delete-size-item">删除</button>
              </td>
          </tr>`
    $('#size-add-table-thead').html(theadStart + theadMiddle + theadEnd)
  }

  // 初始生成一个空行
  function renderEmptyTr() {
    $('#size-add-table-tbody').html(initTr)
  }

// 设置表单体
  function renderTbody(data) {
    var trArr = data;
    var tbodyHtml = '';
    for (var i = 0; i < trArr.length; i++) {
      var trItem = trArr[ i ];
      var trItemCList = trItem.cList;
      tbodyHtml += `<tr class='size-item'>
              <td>
                <input type="text" value="${ trItem.part }" name="" class='w80 part'>
              </td>
              <td>
                <input type="text" value="${ trItem.metering_type }" name="" class='w80 metering-type'>
              </td>
              <td>
                <input type="number" step="0.01" data-size-base="${ trItem.size_base }" value="${ trItem.size_base_value }" name="" class='w60 basic-code'>
              </td>`
      // 循环跳码模块
      for (var j = 0; j < trItemCList.length; j++) {
        var cListItem = trItemCList[ j ];
        // 最后一个不需要跳码列
        if (j === trItemCList.length - 1) {
          tbodyHtml += ` <td class="${ cListItem.cm === basicSizeCode ? 'basic-size-td' : '' }" data-last-cm="${ cListItem.cm }">${ cListItem.value || '' }</td>`
        } else {
          tbodyHtml += ` <td class="${ cListItem.cm === basicSizeCode ? 'basic-size-td' : '' }">${ cListItem.value || '' }</td>
              <td>
                <input type="number" step="0.01" value="${ cListItem.tm }" name="" class='w60 jump-code' data-index="${ i }" data-size="${ cListItem.cm }">
              </td>`
        }
      }
      tbodyHtml += `<td>
                ±<input type="number" step="0.01"value="${ trItem.error }" name="" class='w60 mistake-code'>
              </td>
              <td>
                <button type="button" class="btn btn-danger delete-size-item">删除</button>
              </td>`
    }
    $('#size-add-table-tbody').html(tbodyHtml)
  };

// 渲染勾选框
  function renderSizecheckboxs(data) {
    var cListFir = data.item[ 0 ];
    var basicSize = cListFir.size_base;

    // 筛出包含的尺码
    var cmList = $.map(cListFir.cList, (item) => item.cm);
    var strHtml = $.map(sizeArr, function (item) {
      var checked = cmList.includes(item) ? 'checked' : '';
      var disabled = item === basicSize ? 'disabled' : '';
      return `<label>
              <input type="checkbox" data-cm="${ item }" class='size-checkbox' ${ checked } ${ disabled }>${ item }
            </label>`;
    }).join('');

    $('#sizeAddModal .size-checkboxs').html(strHtml);
  }

// 根据跳码计算尺码
  function computeSize($target) {
    var currentSize = $($target).attr('data-size');
    if (compareElement({ basicSize: basicSizeCode, currentSize: currentSize })) {
      // 获取父节点的上一个兄弟节点
      var targetParent = $target.parent('td').next('td');
      var standard = $target.parent('td').prev('td');
      targetParent.html((parseFloat(standard.html() || 0) + parseFloat($target.val() || 0)).toFixed(2))
    } else {
      // 获取父节点的上一个兄弟节点
      var targetParent = $target.parent('td').prev('td');
      var standard = $target.parent('td').next('td');
      targetParent.html((parseFloat(standard.html() || 0) - parseFloat($target.val() || 0)).toFixed(2))
    }
  }

// 获取保持数据
  function formatSubmitData() {
    // 获取每一行
    var $trs = $('#sizeAddModal .size-item');
    var submitData = [];
    // 循环列
    for (var i = 0; i < $trs.length; i++) {
      var trItemData = {}
      var $tr = $($trs[ i ])
      var cListData = []
      var $cList = $tr.find('.jump-code')
      // 获取最后一个尺码列
      var lastTr = $tr.find('td[data-last-cm]')
      // 循环跳码块
      for (var j = 0; j < $cList.length; j++) {
        var cListItemData = {}
        var $cListItem = $($cList[ j ]);
        cListItemData = {
          'px': j,
          'tm': $cListItem.val(),
          'cm': $cListItem.attr('data-size'),
          'value': $cListItem.parents('td').prev('td').html() || 0 // 尺码计算值
        }
        cListData.push(cListItemData)
        // 拼上最后一项
        if (j === $cList.length - 1) {
          var cListItemData = {}
          cListItemData = {
            'px': j + 1,
            'tm': 0,
            'cm': $(lastTr).attr('data-last-cm'),
            'value': $(lastTr).html() // 尺码计算值
          }
          cListData.push(cListItemData)
        }
      }
      trItemData = {
        'metering_type': $tr.find('.metering-type').val() || '',
        'part': $tr.find('.part').val() || '',
        'size_base': $tr.find('.basic-code').attr('data-size-base'),
        'size_base_value': $tr.find('.basic-code').val() || '',
        'error': $tr.find('.mistake-code').val() || '',
        'cList': cListData,
        'id': $('#pattern-id').attr('data-id'),
        'mId': $('#mb-select').val()
      }
      submitData.push(trItemData)
    }
    return submitData;
  }

// 渲染表格
  function renderTable(data) {
    renderThead(data);
    // renderTbody(data);
    renderEmptyTr()
  }

// 勾选同步框
  $("#size-add-table").on("change", ".sync-code", function (e) {
    var target = $(e.currentTarget)
    // 是否同步
    var isSync = target.is(':checked');
    // 找到类别
    var sizeType = target.attr('data-size')
    if (isSync) {
      // 获取当前列的跳码框
      var columnJumpCodes = $('#sizeAddModal .jump-code[data-size=' + sizeType + ']')
      columnJumpCodes.val($(columnJumpCodes[ 0 ]).val())
      // 改变所有的码
      // 获取所有的跳码框并设置尺码
      var $JumpCode = $('#size-add-table .jump-code');
      for (var i = 0; i < $JumpCode.length; i++) {
        // 获取父节点的上一个兄弟节点
        var $jumpCode = $($JumpCode[ i ]);
        computeSize($jumpCode)
      }
    }
  })

// 第一行改变单列跳码的事件
  $("#size-add-table").on("change", ".size-item:first .jump-code", function (e) {
    var target = $(e.currentTarget)
    // *********根据是否同步跳码设置同列尺码*********
    // 找到类别
    var sizeType = target.attr('data-size')
    // 是否同步
    var isSync = $('#sizeAddModal .sync-jump-code-' + sizeType).is(':checked');
    if (isSync) {
      // 获取当前列的跳码框
      var columnJumpCodes = $('#sizeAddModal .jump-code[data-size=' + sizeType + ']')
      columnJumpCodes.val(target.val())
      // 改变所有的码
      // 获取所有的跳码框并设置尺码
      var $JumpCode = $('#size-add-table .jump-code');
      for (var i = 0; i < $JumpCode.length; i++) {
        // 获取父节点的上一个兄弟节点
        var $jumpCode = $($JumpCode[ i ]);
        computeSize($jumpCode)
      }
    } else {
      // 改变这一行的码
      // 获取这行所有的跳码框并设置尺码
      var $JumpCode = target.parents('tr.size-item').find('.jump-code');
      for (var i = 0; i < $JumpCode.length; i++) {
        // 获取父节点的上一个兄弟节点
        var $jumpCode = $($JumpCode[ i ]);
        computeSize($jumpCode)
      }
    }
  })

// 非第一行改变单列跳码的事件
  $("#size-add-table").on("change", ".size-item:not(:first) .jump-code", function (e) {
    var target = $(e.currentTarget)
    // 改变这一行的码
    // 获取这行所有的跳码框并设置尺码
    var $JumpCode = target.parents('tr.size-item').find('.jump-code');
    for (var i = 0; i < $JumpCode.length; i++) {
      // 获取父节点的上一个兄弟节点
      var $jumpCode = $($JumpCode[ i ]);
      computeSize($jumpCode)
    }
  })


// 改变基码的事件
  $("#size-add-table").on("change", ".basic-code", function (e) {
    var target = $(e.currentTarget)
    // 获取本行tr
    var $parents = target.parents('tr.size-item');

    // 获取这行的跳码框
    var jumpCodes = $parents.find('.jump-code');

    // 改变这行的基码列
    $parents.find('.basic-size-td').html(target.val())

    for (var i = 0; i < jumpCodes.length; i++) {
      // 获取父节点的上一个兄弟节点
      var $jumpCode = $(jumpCodes[ i ]);
      computeSize($jumpCode)
    }

    setTimeout(() => {
      for (var i = 0; i < jumpCodes.length; i++) {
        // 获取父节点的上一个兄弟节点
        var $jumpCode = $(jumpCodes[ i ]);
        computeSize($jumpCode)
      }
    }, 0)
  });

// 添加一行
  $('#size-add-add-tr').click(function () {
    $('#size-add-table-tbody').append(initTr)
  })

// 删除
  $("#size-add-table").on("click", ".delete-size-item", function (e) {
    var target = $(e.currentTarget);
    target.parents('tr.size-item').remove();
  })

// 同步勾选框误差
  $("#size-add-table").on("change", ".sync-mistake", function (e) {
    var target = $(e.currentTarget);
    // 是否同步
    var isSync = $('#sizeAddModal .sync-mistake').is(':checked');
    if (isSync) {
      $('#sizeAddModal .mistake-code').val($($('#sizeAddModal .mistake-code')[ 0 ]).val());
    }
  })

// 同步误差
  $("#size-add-table").on("change", ".mistake-code:first", function (e) {
    var target = $(e.currentTarget);
    // 是否同步
    var isSync = $('#sizeAddModal .sync-mistake').is(':checked');
    if (isSync) {
      $('#sizeAddModal .mistake-code').val(target.val());
    }
  })

// 提交事件
  $("#submit-add-table-btn").click(function (e) {
    $.ajax({
      type: "POST",
      url: '/api/platemakingSizePart/addPlatemakingSizePart',
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(formatSubmitData()),
      success: function (data) {
        if (data.success == true) {

        } else {

        }
      },
      error: function (jqXHR) {
        console.log(jqXHR.status);
      }
    });

  });

// 勾选尺码复选框事件
  $('#sizeAddModal .size-checkboxs').on("change", ".size-checkbox", function (e) {

    var formatSubmitList = formatSubmitData();
    // 获取勾选的尺码
    var checkSizeDom = $('#sizeAddModal .size-checkboxs input:checked');
    var checkSizeList = $.map(checkSizeDom, item => $(item).attr('data-cm'));
    $.map(formatSubmitList, item => {
      var cList = item.cList;
      item.cList = $.map(checkSizeList, (cItem, index) => {
        return { px: index, tm: '', cm: cItem, value: 0 }
      })
    })

    renderTable(formatSubmitList);
  });

// 点击按钮打开弹框事件
  $('.bom-add-btn').click(function () {
    fetchTableData();
    $('#sizeAddModal').modal('show')
  });

// 点击按钮关闭弹框事件
  $('.size-add-modal-close').click(function () {
    $('#sizeAddModal').modal('hide')
  });

// 获取表格数据
  function fetchTableData(id) {
    $.ajax({
      type: "GET",
      url: '/api/templateMaterial//getId/' + id,
      dataType: "json",
      success: function (data) {
        renderTable(data);
        // renderSizecheckboxs(data);
      },
      error: function (jqXHR) {
        var data = {
          "code": "OK",
          "desc": "OK",
          "item": [ {
            "metering_type": "吃2",
            "cList": [ {
              "px": 0,
              "tm": 2,
              "cm": "XS"
            }, {
              "px": 1,
              "tm": 2,
              "cm": "S"
            }, {
              "px": 2,
              "tm": 2,
              "cm": "M"
            }, {
              "px": 3,
              "tm": 2,
              "cm": "L"
            }, {
              "px": 4,
              "tm": 2,
              "cm": "XL"
            }, {
              "px": 5,
              "tm": 0,
              "cm": "XXL"
            } ],
            "part": "吃2",
            "size_base": "M",
            "error": 3,
            "size_base_value": null
          }, {
            "metering_type": "吃2",
            "cList": [ {
              "px": 0,
              "tm": 2,
              "cm": "XS"
            }, {
              "px": 1,
              "tm": 2,
              "cm": "S"
            }, {
              "px": 2,
              "tm": 2,
              "cm": "M"
            }, {
              "px": 3,
              "tm": 2,
              "cm": "L"
            }, {
              "px": 4,
              "tm": 2,
              "cm": "XL"
            }, {
              "px": 5,
              "tm": 0,
              "cm": "XXL"
            } ],
            "part": "吃2",
            "size_base": "M",
            "error": 3,
            "size_base_value": null
          }, {
            "metering_type": "吃2",
            "cList": [ {
              "px": 0,
              "tm": 2,
              "cm": "XS"
            }, {
              "px": 1,
              "tm": 2,
              "cm": "S"
            }, {
              "px": 2,
              "tm": 2,
              "cm": "M"
            }, {
              "px": 3,
              "tm": 2,
              "cm": "L"
            }, {
              "px": 4,
              "tm": 2,
              "cm": "XL"
            }, {
              "px": 5,
              "tm": 0,
              "cm": "XXL"
            } ],
            "part": "吃2",
            "size_base": "M",
            "error": 3,
            "size_base_value": null
          } ],
          "errParam": null,
          "failed": false,
          "success": true
        }
        renderTable(data.item);
        // renderSizecheckboxs(data);
      }
    });
  }

// 比较两个元素的位置
  function compareElement(obj) {
    var basicSize = obj.basicSize;
    var currentSize = obj.currentSize;
    var basicIndex = sizeArr.indexOf(basicSize.toUpperCase())
    var currentIndex = sizeArr.indexOf(currentSize.toUpperCase())
    var sort = currentIndex - basicIndex;
    return sort >= 0
  }
})();