(function () {
  // 假设基码
  var basicSizeCode = '';
  var basicSizeIndex = 0;
  var sizeArr = [ 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', '6XL', '7XL', '8XL', '9XL' ]
  var initTr = '';

  // 渲染表格
  function renderTable(data) {
    renderThead(data);
    // renderTbody(data);
    renderEmptyTr()
  }

  // 渲染表头 && 根据头部生成一个空行以便添加
  function renderThead(data) {
    initTr = ''
    var itemFir = data[ 0 ];
    basicSizeCode = itemFir.size_base;
    var theadStart = `<tr><th>尺码部位</th>
                  <th>测量方法</th>
                  <th >基码（${ itemFir.size_base }）</th>
                  `
    var theadEnd = `<th>误差 
                      <label>
                        <input type="checkbox" class="sync-mistake">同步
                      </label></th>
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
      if (jumpItem.cm === basicSizeCode) {
        basicSizeIndex = i;
      }
      // 最后一个不需要跳码列
      if (i === jumpArr.length - 1) {
        theadMiddle += `<th>${ jumpItem.cm }</th>`
        initTr += ` <td class="${ jumpItem.cm === basicSizeCode ? 'basic-size-td' : '' }" data-last-cm=${ jumpItem.cm }"></td>`
      } else {
        theadMiddle += `<th class=${ jumpItem.cm }>${ jumpItem.cm }</th>
              <th>跳码 <label><input type="checkbox" class="sync-code sync-jump-code-${ jumpItem.cm }" data-size="${ jumpItem.cm }">同步</label></th>`
        initTr += ` <td class="${ jumpItem.cm === basicSizeCode ? 'basic-size-td' : '' }"></td>
              <td>
                <input type="number" step="0.01" value="" name="" class='w60 jump-code' data-size="${ jumpItem.cm }">
              </td>`
      }
    }
    initTr += `<td>  
                 <p style='width: 70px;'>
                  ±<input type="number"  step="0.01" value="" name="" class='w60 mistake-code'>
                 </p>
              </td>
              <td>
                <button type="button" class="btn btn-danger delete-size-item">删除</button>
              </td>
          </tr>`
    $('#size-add-table-thead').html(theadStart + theadMiddle + theadEnd)
  }

  // 初始生成一个空行到表单体
  function renderEmptyTr() {
    $('#size-add-table-tbody').html(initTr)
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

  // 获取保存数据
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

  // 比较两个尺码位置的先后顺序
  function compareElement(obj) {
    var basicSize = obj.basicSize;
    var currentSize = obj.currentSize;
    var basicIndex = sizeArr.indexOf(basicSize.toUpperCase())
    var currentIndex = sizeArr.indexOf(currentSize.toUpperCase())
    var sort = currentIndex - basicIndex;
    return sort >= 0
  }

  // 设置对应的尺码
  // $JumpCode - 跳码节点
  function setItemSize($JumpCode) {
    // 情况一: 尺码在基码右边
    for (var i = basicSizeIndex; i < $JumpCode.length; i++) {
      var $jumpCode = $($JumpCode[ i ]);
      computeSize($jumpCode)
    }

    // 情况二: 尺码在基码左边
    for (var i = basicSizeIndex - 1; i >= 0; i--) {
      var $jumpCode = $($JumpCode[ i ]);
      computeSize($jumpCode)
    }
  }

  // 勾选同步框事件
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

      // 改变所有的尺码
      // 按每行的维度获取所有的跳码框并设置尺码
      var $sizeItems = $('#size-update-table .size-item');
      for (var i = 0; i < $sizeItems.length; i++) {
        var $JumpCode = $($sizeItems[i]).find('.jump-code');
        setItemSize($JumpCode);
      }
    }
  })

  // 第一行改变单列跳码的事件(当勾选了同步会更新当列的所有跳码)
  $("#size-add-table").on("change", ".size-item:first .jump-code", function (e) {
    var $JumpCode = [];
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

      // 改变所有的尺码
      // 获取所有的跳码框并设置尺码
      var $sizeItems = $('#size-update-table .size-item');
      for (var i = 0; i < $sizeItems.length; i++) {
        var $JumpCode = $($sizeItems[i]).find('.jump-code');
        setItemSize($JumpCode);
      }

    } else {
      // 改变这一行的码
      // 获取这行所有的跳码框并设置尺码
      $JumpCode = target.parents('tr.size-item').find('.jump-code');
      setItemSize($JumpCode)
    }
  })

  // 非第一行改变单列跳码的事件
  $("#size-add-table").on("change", ".size-item:not(:first) .jump-code", function (e) {
    var target = $(e.currentTarget)
    // 改变这一行的码
    // 获取这行所有的跳码框并设置尺码
    var $JumpCode = target.parents('tr.size-item').find('.jump-code');
    setItemSize($JumpCode)
  })


  // 改变基码的事件
  $("#size-add-table").on("change", ".basic-code", function (e) {
    var target = $(e.currentTarget)
    // 获取本行tr
    var $parents = target.parents('tr.size-item');

    // 获取这行的跳码框
    var $JumpCode = $parents.find('.jump-code');

    // 改变这行的基码列
    $parents.find('.basic-size-td').html(target.val())

    setItemSize($JumpCode)
  });

  // 点击添加一行事件
  $('#size-add-add-tr').click(function () {
    $('#size-add-table-tbody').append(initTr)
  })

  // 点击删除一行事件
  $("#size-add-table").on("click", ".delete-size-item", function (e) {
    var target = $(e.currentTarget);
    target.parents('tr.size-item').remove();
  })

  // 同步勾选框误差事件
  $("#size-add-table").on("change", ".sync-mistake", function (e) {
    var target = $(e.currentTarget);
    // 是否同步
    var isSync = $('#sizeAddModal .sync-mistake').is(':checked');
    if (isSync) {
      $('#sizeAddModal .mistake-code').val($($('#sizeAddModal .mistake-code')[ 0 ]).val());
    }
  })

  // 同步误差事件
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

})();