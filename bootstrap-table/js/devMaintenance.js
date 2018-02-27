/*
 * @author：wxf
 */
const WCDEV = '50',
	NCSS = '1',
	ROAD = '000', //道路
	SUPPLIER = '550', //供货商
	UNIT = '300', //部门
	DEVICE_STATUS = '100', //设备状态字典类型
	DEVICEFAULT_STATUS = '199', //故障设备状态字典类型
	MAINTAIN_METHOD = '450', //维修处理方法
	NORMAL = '101', //正常
	BROKEN = '102', //故障
	REPAIRING = '103', //维修中
	SCRAP = '104', //报废
	SCRAPING = '106', //报废中
	IDLE = '105', //闲置

	FAULT_REASON = '150', //故障原因
	FAULT_Desc = '700'; //故障现象

var tempurl = '',
	$table = $("#table"),
	showMaintainInfo = function() {},
	selectData = function() {},

	typeData = [],
	unitData = [],
	maintainStatus = [],
	handleMethod = [],
	deviceStatus = [],
	deviceFaultStatus=[],
	faultDesc = [],
	personData = [],
	faultReason = [];

function getCookieValue(name) {
	var strCookie = document.cookie,
		arrCookie = strCookie.split(";"),
		i;
	for(i = 0; i < arrCookie.length; i++) {
		var arr = arrCookie[i].split("=");
		if(arr[0].trim() == name) {
			return arr[1];
		}
	}
	return "";
}

var baseurl = getCookieValue("baseserviceurl.cookie"),
	$table = $('#table');
	
var userCookie = getCookieValue("user.cookie");
userCookie = unescape(userCookie.replace(/\"/g, ""));
var userArr = userCookie.split(",");
var userToken = userArr[2];
tempurl = decodeURIComponent(baseurl);
//tempurl = "http://192.168.1.159:9080/itsmain/webapi";

function initData() {
	$('.faultDesc').editableSelect({ filter: false,effects: 'fade' });
	$('.faultDesc').editableSelect('clear');
	$(".typeItem").select2({
		data: typeData,
	});
	$(".unitItem").select2({
		data: unitData,
		minimumResultsForSearch: Infinity
	});
	$(".maintainStatus").select2({
		data: handleMethod,
		minimumResultsForSearch: Infinity,
	});
	$(".handleMethod").select2({
		data: handleMethod,
		minimumResultsForSearch: Infinity,
	});
	$(".deviceStatus").select2({
		data: deviceStatus,
		minimumResultsForSearch: Infinity,
	});
	$(".faultReason").select2({
		data: faultReason,
		minimumResultsForSearch: Infinity,
	});
	$('.faultLevel').select2({
		minimumResultsForSearch: Infinity,
	});

	for(var i = 0, len = faultDesc.length; i < len; i++) {
		$('.faultDesc').editableSelect('add', faultDesc[i]);
	}
	$('.maintainer').select2({
		data: personData,
	});
	$('.nice-scroll').on("select2:open", function() {
		$(".select2-results__options").niceScroll({cursorborder:"0",cursorcolor:"RGB(136,218,22)",background:"rgb(207,212,218)",cursoropacitymin:1}); 
	})
	$("textarea.nice-scroll").niceScroll({cursorborder:"0",cursorcolor:"RGB(136,218,22)",background:"rgb(207,212,218)",cursoropacitymin:1});
}

//设备处理模态框
var handlemodal = new Modal({
	title: '故障处理',
	content: $('#handle_modal_cont').html(),
	width: 440,
	onContentReady: function() {
		initData();
		dateForm();
	},
	buttons: [{
		html: '<button type="button" class="btn btn-sm btn-ok">保存</button>',
		selector: '.btn-ok',
		callback: function() {
			var $form = this.$modal.find('form'),
				data = $form.serializeArray(), //form中的输入框须有name属性，否则取不到数据。
				postData = {},
				$alert = $form.find(".alert"),
				$errorMsg = $alert.find('.error_msg'),
				$handleMethod = $form.find(".handleMethod");
			$maintainTime = $form.find("#maintainTime");
			data.forEach(function(obj) {
				postData[obj.name] = obj.value;
			});
			console.log(postData);
			if(postData) {
				if(postData.maintainTime == '') {
					$alert.show();
					$errorMsg.text('请输入维护时间');
					$maintainTime.addClass('alert-danger').focus();
					return false;
				} else {
					$alert.hide();
					$maintainTime.removeClass('alert-danger');
				}
				_post();
			}

			function _post() {
				var row = $.map($table.bootstrapTable('getSelections'), function(row) {
					return row;
				});
				row = row[0];
				console.log(row.id);
				var dataSend = JSON.stringify({
					"id": row.repairId,
					"deviceType": row.type,
					"deviceNumber": row.uniqueNum,
					"maintainUnit": postData.maintainUnit,
					"handleMethod": postData.handleMethod,
					"maintainer": postData.maintainer,
					"maintainerPhone": postData.maintainerPhone,
					"maintainTime": postData.maintainTime,
					"mark": postData.mark,
				});
				console.log(dataSend);
				$.ajax({
					type: "PUT",
					headers: {'Authorization':userToken},
					url: tempurl + "/device/handle",
					contentType: "application/json;charset=utf-8",
					dataType: "json",
					cache:false,
					data: dataSend,
					success: function(jsonResult) {
						console.log(jsonResult);
						$alert.hide();
						showMaintainInfo(row.uniqueNum);
						$handleMethod.val("451").trigger("change");
						$form.find(".unitItem").val("551").trigger("change");
						$form.find(".maintainer").val("user1").trigger("change");
						Alert('<div class="success-tip"><img src="images/tip.png" alt="提示" />设备维修处理信息上传成功。</div>');
					},
					error: function() {
						$form[0].reset();
						$alert.hide();
						Alert('<div class="handle-tip"><img src="images/warn.png" alt="提示" />设备处理信息上传失败！</div>');
						return false;
					}
				});
			}
		}
	}, {
		html: '<button type="button" class="btn btn-sm btn-cancel">取消</button>',
		selector: '.btn-cancel',
		callback: function() {
			$(".alert").hide();
			var $form = this.$modal.find('form');
			$form[0].reset();
			$form.find("#add_type").val("51").trigger("change");
			$form.find(".unitItem").val("551").trigger("change");
			$form.find(".maintainer").val("user1").trigger("change");
		}
	}]
});

//设备报修模态框
var repairmodal = new Modal({
	title: '故障报修',
	content: $('#repair_modal_cont').html(),
	width: 440,
	onContentReady: function() {
		initData();
		dateForm();
		var $form = this.$modal.find('form'),
			$faultDesc = $form.find('.faultDesc'),
			$faultDescLi = $form.find('.faultDesc+ul>li:first');
		$faultDesc.val($faultDescLi.text());
	},
	buttons: [{
		html: '<button type="button" class="btn btn-sm btn-ok">保存</button>',
		selector: '.btn-ok',
		callback: function() {
			var $form = this.$modal.find('form'),
				data = $form.serializeArray(),
				postData = {},
				$alert = $form.find(".alert"),
				$errorMsg = $alert.find('.error_msg'),
				$faultDesc = $form.find(".faultDesc");
				$happenTime=$form.find(".happenTime");
			data.forEach(function(obj) {
				postData[obj.name] = obj.value;
			});

			if(postData.faultDesc == '') {
				$alert.show();
				$errorMsg.text('请输入故障现象');
				$faultDesc.addClass('alert-danger').focus();
				return false;
			} else {
				$alert.hide();
				$faultDesc.removeClass('alert-danger');
			}
			if(postData.happenTime == '') {
				$alert.show();
				$errorMsg.text('请填写发生时间');
				$happenTime.addClass('alert-danger').focus();
				return false;
			} else {
				$alert.hide();
				$happenTime.removeClass('alert-danger');
			}
			_post();

			function _post() {
				//异步任务
				var row = $table.bootstrapTable('getSelections'),
					nums = [];
				if(row.length == 1) {
					row = row[0];
					var dataSend = JSON.stringify({
						"id": row.repairId,
						"deviceType": row.type,
						"deviceNumber": row.uniqueNum,
						"faultDesc": postData.faultDesc,
						"faultLevel": postData.faultLevel,
						"happenTime": postData.happenTime,
						"mark": postData.mark,
					});

					$.ajax({
						type: "POST",
						headers: {'Authorization':userToken},
						url: tempurl + "/device/report",
						contentType: "application/json;charset=utf-8",
						dataType: "json",
						cache:false,
						data: dataSend,
						success: function(jsonResult) {
							console.log(jsonResult);
							$alert.hide();
							$form[0].reset();
							Alert('<div class="success-tip"><img src="images/tip.png" alt="提示" />维修信息上报成功。</div>');
							showMaintainInfo(row.uniqueNum);
						},
						error: function() {
							$form[0].reset();
							$alert.hide();
							Alert('<div class="handle-tip"><img src="images/warn.png" alt="提示" />设备维修信息上报失败！</div>');
							return false;
						}
					});
				} else {

					var json = "[";
					for(var j = 0, len = row.length; j < len; j++) {
						nums.push(row[j].uniqueNum);
						json += '{\"id\":\"' + row[j].repairId + '\",\"deviceType\":\"' + row[j].type + '\",\"deviceNumber\":\"' + row[j].uniqueNum + '\",\"faultDesc\":\"' + postData.faultDesc +
							'\",\"faultLevel\":\"' + postData.faultLevel + '\",\"happenTime\":\"' + postData.happenTime + '\",\"mark\":\"' + postData.mark + '\"},';
					}
					nums = nums.join(',');
					json += "]";
					var lastIndex = json.lastIndexOf(',');
					json = json.substring(0, lastIndex) + ']';

					$.ajax({
						type: "POST",
						headers: {'Authorization':userToken},
						url: tempurl + "/device/report/batch",
						contentType: "application/json;charset=utf-8",
						dataType: "json",
						data: json,
						cache:false,
						success: function(jsonResult) {
							console.log(jsonResult);
							$alert.hide();
							Alert('<div class="success-tip"><img src="images/tip.png" alt="提示" />设施报修成功。</div>');
							showMaintainInfo(nums);
							$form[0].reset();
							$faultDesc.val("701").trigger("change");
						},
						error: function() {
							$form[0].reset();
							$alert.hide();
							Alert('<div class="handle-tip"><img src="images/warn.png" alt="提示" />报修失败！</div>');
							return false;
						}
					});
				}
			}
		}
	}, {
		html: '<button type="button" class="btn btn-sm btn-cancel">取消</button>',
		selector: '.btn-cancel',
		callback: function() {
			var $form = this.$modal.find('form');
				$form.find('*').removeClass('alert-danger');
			$form.find(".alert").hide();
			$form[0].reset();
			$faultDesc = $form.find('.faultDesc');
				$faultDescLi = $form.find('.faultDesc+ul>li:first');
			$faultDesc.val($faultDescLi.text());
		}
	}]
});

//维修审核模态框
var resultmodal = new Modal({
	title: '维修结果',
	content: $('#check_modal_cont').html(),
	width: 440,
	onContentReady: function() {
		initData();
		dateForm();
	},
	buttons: [{
		html: '<button type="button" class="btn btn-sm btn-ok">保存</button>',
		selector: '.btn-ok',
		callback: function() {
			var $form = this.$modal.find('form'),
				data = $form.serializeArray(),
				postData = {},
				$alert = $form.find(".alert"),
				$errorMsg = $alert.find('.error_msg'),
				$endTime = $form.find(".endTime");
			data.forEach(function(obj) {
				postData[obj.name] = obj.value;
			});
			console.log(postData);
			if(postData) {
				if(!postData.endTime) {
					$alert.show();
					$errorMsg.text('结束时间不能为空');
					$endTime.addClass('alert-danger').focus();
					return false;
				} else {
					$alert.hide();
					$endTime.removeClass('alert-danger');
				}
				_post();
			}

			function _post() {
				var row = $.map($table.bootstrapTable('getSelections'), function(row) {
					return row;
				});
				row = row[0];
				var dataSend = JSON.stringify({
					"id": row.repairId,
					"deviceType": row.type,
					"deviceNumber": row.uniqueNum,
					"maintainUnit": postData.maintainUnit,
					"maintainStatus": postData.maintainStatus,
					"faultReason": postData.faultReason,
					"endTime": postData.endTime,
					"score": postData.score,
					"mark": postData.mark,
				});
				console.log(dataSend);
				$.ajax({
					type: "PUT",
					headers: {'Authorization':userToken},
					url: tempurl + "/device/review_result",
					contentType: "application/json;charset=utf-8",
					dataType: "json",
					data: dataSend,
					cache:false,
					success: function(jsonResult) {
						console.log(jsonResult);
						$alert.hide();
						showMaintainInfo(row.uniqueNum);
						Alert('<div class="success-tip"><img src="images/tip.png" alt="提示" />维修结果审核成功。</div>');
						$form[0].reset();
						$form.find(".maintainStatus").val("451").trigger("change");
						$form.find(".unitItem").val("551").trigger("change");
						$form.find(".faultReason").val("151").trigger("change");
					},
					error: function() {
						$form[0].reset();
						$alert.hide();
						Alert('<div class="handle-tip"><img src="images/warn.png" alt="提示" />审核失败！</div>');
						return false;
					}
				});
			}
		}
	}, {
		html: '<button type="button" class="btn btn-sm btn-cancel">取消</button>',
		selector: '.btn-cancel',
		callback: function() {
			var $form = this.$modal.find('form');
			$form.find(".alert").hide();
			$form.find('*').removeClass('alert-danger');
			$form[0].reset();
			$form.find(".maintainStatus").val("451").trigger("change");
			$form.find(".unitItem").val("551").trigger("change");
			$form.find(".faultReason").val("151").trigger("change");
		}
	}]
});

//查看维修记录模态框
var detailmodal = new Modal({
	title: '维修记录',
	//content: $('#detail_modal').html(),
	content: '<table id="detailTable"></table>',
	marginTop: 50,
	width: document.body.clientWidth * 0.98,
	maxWidth: 1820,
	onContentReady: function() {
		dateForm();
		this.$modal.find('.modal-body').niceScroll({cursorborder:"0",cursorcolor:"RGB(136,218,22)",background:"rgb(207,212,218)",cursoropacitymin:1});
		$("#detailTable").bootstrapTable({
			data: '',
			pagination: true,
			pageSize: 15,
			strictSearch: true,
			uniqueId: "id",
			height: 631,
			paginationHAlign: "left",
			formatNoMatches: function() {
				return "没有匹配的数据"
			},
			sortName: "handleTime",
			sortOrder: "desc",
			paginationPreText: "<<",
			paginationNextText: ">>",
			columns: [{
				title: '序号',
				formatter: function(value, row, index) {
					index = index + 1;
					return '<span>' + index + "</span>";
				},
				sortable: true,
			}, {
				field: 'id',
				title: '记录编号',
				sortable: true,
			},{
				field: 'deviceNumber',
				title: '设备编号',	
			}, {
				field: 'faultDesc',
				title: '故障现象',
			}, {
				field: 'faultLevel',
				title: '故障级别',
				sortable: true,
			}, {
				field: 'faultReasonDesc',
				title: '故障原因',
			}, {
				field: 'maintainBehaviorDesc',
				title: '维护行为',
			}, {
				field: 'handleMethodDesc',
				title: '处理方法',
			}, {
				field: 'maintainStatusDesc',
				title: '维护状态',
			}, {
				field: 'statusDesc',
				title: '资产状态',
				visible: false
			}, {
				field: 'handleTime',
				title: '时间',
				sortable: true,
				formatter: function(value, row, index) {
					return /\d{4}-\d{1,2}-\d{1,2}/g.exec(value);
				},
				width:'120',
			}, {
				field: 'handler',
				title: '操作员',
			}, {
				field: 'maintainUnitDesc',
				title: '维护单位',
			}, {
				field: 'maintainerName',
				title: '维护人',
			}, {
				field: 'maintainerPhone',
				title: '维护人手机',
			}, {
				field: 'score',
				title: '评分',
				sortable: true,
			}, {
				field: 'mark',
				title: '备注信息',
				width: '244'
			}]
		});
		var body = this.$modal.find('.modal-body')[0], 
			modalWidth = document.body.clientWidth * 0.98;
		$(body).css('overflow-x', 'auto');
		
	},
	buttons: [{
		html: '<button type="button" class="btn btn-sm  btn-cancel">关闭</button>',
		selector: '.btn-cancel',
	}]
});

function operateFormatter(value, row, index) {
	return [
		'<button id="btn_detail" type="button" class="RoleOfA btn-default bt-select oper">查看</button>',
	].join('');
}
window.operateEvents = {
	'click .RoleOfA': function(e, value, row, index) {
		var resultNum = row.uniqueNum;
		detailmodal.open();
		var $updateStart=$('#updateStart'),
			$updateEnd=$('#updateEnd'),
			date=new Date(),
		    year = date.getFullYear(),
		    month = date.getMonth() + 1,
		    day = date.getDate(),
		    endTime = year + '-' + month + '-' + day;
		    $updateEnd.val(endTime);
		    
		//显示维护信息
		$.ajax({
			url: tempurl + "/device/repair/detail?number=" + resultNum,
			headers: {'Authorization':userToken},
			type: 'GET',
			dataType: 'json',
			cache:false,
			success: function(data) {
				$("#detailTable").bootstrapTable('refreshOptions', {
					data: data,
				});
			},
		});
		
		$("#detail_search").click(function() {
			var start=$updateStart.val(),
				end=$updateEnd.val();
				
		});
		//tooltip
		$("#detailTable").on('mouseover mouseout', function(e) {
			var flag = e.target.nodeName === "TD";
			if(!flag) {
				return;
			}
			var $td = $(e.target),
				str = $td.text();
			if(e.type == "mouseover") {	
				if($td[0].offsetWidth >= $td[0].scrollWidth) return;
				$td.attr("title", str);
			} else if(e.type == "mouseout") {
				$td.removeAttr("title");
			}
			e.stopImmediatePropagation();
		});
	}
};

//tooltip
$table.on('mouseover mouseout', function(e) {
	var flag = e.target.nodeName === "TD";
	if(!flag) {
		return;
	}
	var $td = $(e.target),
		str = $td.text(),
		offsetWidth=$td[0].offsetWidth,
		scrollWidth=$td[0].scrollWidth;
	if(e.type == "mouseover") {
		if(offsetWidth >=scrollWidth){
			return;
		}
		$td.attr("title", str);
	} else if(e.type == "mouseout") {
		$td.removeAttr("title");
	}
	e.stopImmediatePropagation();
});

function dateForm() {
	$('.form_date').datetimepicker({
		language: 'zh-CN',
		weekStart: 1,
		todayBtn: 1,
		autoclose: 1,
		todayHighlight: 1,
		startView: 2,
		minView: 2,
		forceParse: 0,
		format: 'yyyy-mm-dd'
	});
	//获取当前时间
	var date = new Date(),
		year = date.getFullYear(),
		month = date.getMonth() + 1,
		day = date.getDate(),
		endTime = year + '-' + month + '-' + day;
	if(month < 4) {
		happenMonth = month + 12 - 3;
		happenYear = year - 1;
	} else {
		happenMonth = month - 3;
		happenYear = year;
	}
	var happenTime = happenYear + '-' + happenMonth + '-' + day;
	//$("#happenTime").val(happenTime);
	$("#endTime").val(endTime);
}
dateForm();

//按钮操作
var btnOper = {
	repair: function() {
		var ids = $.map($table.bootstrapTable('getSelections'), function(row) {
			return row.uniqueNum;
		});
		console.log(ids);
		//报修模态框
		if(ids == "") {
			Alert('<div class="handle-tip"><span class="glyphicon glyphicon-exclamation-sign"></span>请选取你要报修的设施</div>');
		} else {
			repairmodal.open();
		}
		return this;
	},
	handle: function() {
		var ids = $table.bootstrapTable('getSelections'),
			len = ids.length;
		if(len == 0) {
			Alert('<div class="handle-tip"><img src="images/tip.png" alt="提示" />请选取你要处理的设施</div>');
		} else if(len > 1) {
			Alert('<div class="handle-tip"><img src="images/warn.png" alt="提示" />一次只能处理一个设施！请重新选择</div>');
		} else {
			handlemodal.open();
		}
		return this;
	},
	check: function() {
		var ids = $table.bootstrapTable('getSelections'),
			len = ids.length,
			row = ids[0];
		if(len == 0) {
			Alert('<div class="handle-tip"><img src="images/tip.png" alt="提示" />请选取你要记录维修结果的设施</div>');
		} else if(len > 1) {
			Alert('<div class="handle-tip"><img src="images/warn.png" alt="提示" />一次只能审核一个设施！请重新选择</div>');
		} else {
			resultmodal.open();
			$('#checkUnit').val(row.maintainUnit).trigger("change");
		}
		return this;
	},
	start: function() {
		var devs = $table.bootstrapTable('getSelections'),
			len = devs.length,
			nums = [];
		//报修模态框
		if(len == 0) {
			Alert('<div class="handle-tip"><span class="glyphicon glyphicon-exclamation-sign"></span>请选取你要启用的设施</div>');
		} else {
			for(var i = 0; i < len; i++) {
				nums[i] = devs[i].uniqueNum;
			}
			console.log(nums.join(','));
			nums = nums.join(',');
			var dataSend = JSON.stringify({
				"uniqueNum": nums,
			});
			$.ajax({
				url: tempurl + "/device/enable",
				headers: {'Authorization':userToken},
				type: 'PUT',
				dataType: 'json',
				cache:false,
				contentType: "application/json;charset=utf-8", //必须有
				data: dataSend,
				success: function(data) {
					showMaintainInfo(nums);
					Alert('<div class="success-tip"><img src="images/tip.png" alt="提示" />设施启用成功。</div>');
				},
				error: function(data) {
					Alert('<div class="handle-tip"><img src="images/warn.png" alt="提示" />启用失败</div>');
				}
			});
		}
	},
	selectall: function() {
		$('#table tbody td>input').each(function() {
			this.checked = true;
		});
		var row = $.map($table.bootstrapTable('getData', { "useCurrentPage": true }), function(row) {
				return row;
			}),
			len = row.length,
			i = 0,
			trs = $table.find("tbody tr");

		$.each(row, function() {
			this[0] = true;
		});

		$('#table tbody tr').each(function() {
			$(this).addClass("selected");
		});
		return this;
	},
	inverse: function() {
		$('#table tbody td>input').each(function() {
			this.checked = !this.checked;
			if(this.checked) {
				$(this).closest("tr").addClass('selected');
			} else {
				$(this).closest("tr").removeClass('selected');
			}

		});
		//获取当前页的数据
		var row = $.map($table.bootstrapTable('getData', { "useCurrentPage": true }), function(row) {
			return row;
		});
		$.each(row, function() {
			this[0] = !this[0];
		});
		return this;
	},
	search: function() {
		var devType = $('#typeSearch').val(),
			road = $('#roadSearch').val(),
			maintainUnit = $('#supplierSearch').val(),
			happenTime = $('#happenTime').val(),
			endTime = $('#endTime').val(),
			deviceStatus = $('#deviceStatus').val();
		console.log("设备类型：" + devType + ";维护单位：" + maintainUnit + ";道路: " + road);
		showMaintainInfo(devType, road, maintainUnit,deviceStatus, happenTime, endTime);
	},
	
	allSearch: function() {
		var devType = $('#typeSearch').val(),
			road = $('#roadSearch').val(),
			maintainUnit = $('#supplierSearch').val(),
			deviceStatus = $('#deviceStatus').val();
		console.log("设备类型：" + devType + ";维护单位：" + maintainUnit + ";道路: " + road);
		showMaintainInfo(devType, road, maintainUnit, deviceStatus);
	},

	//控制按钮的禁用的状态，启用和报修操作可以批量
	control: function($element) {
		var row = $table.bootstrapTable('getSelections'),
			len = row.length;
		if(len == 0) {
			operation(0); //禁用按钮状态,
		} else if(len == 1) {
			//operation($element.assetStatus);
			operation(row[0].assetStatus);
		} else if(len > 1) {
			for(var i = 0; i < len; i++) {
				if(row[i].assetStatus != IDLE && row[i].assetStatus != NORMAL || row[i].assetStatus != row[0].assetStatus) {
					operation(0); //禁用按钮状态,
					break;
				} else {
					operation(row[0].assetStatus);
				}
			}
		}
		return this;
	},
}

$("#all").click(function() {
	$('.dt-cls').css("visibility","hidden");
	$('#deviceStatus').find("option").remove();
	$("#deviceStatus").select2({
		data: deviceStatus,
		minimumResultsForSearch: Infinity,
	});
	btnOper.allSearch();
});

$("#fault").click(function() {
	$('.dt-cls').css("visibility","visible");
	$('#deviceStatus').find("option").remove();
	$("#deviceStatus").select2({
		data: deviceFaultStatus,
		minimumResultsForSearch: Infinity,
	});
	btnOper.search();
});
//报修操作
$("#btn_repair").click(function() {
	btnOper.repair();
});

//处理操作
$("#btn_handle").click(function() {
	btnOper.handle();
});

//审核操作
$('#btn_check').click(function() {
	btnOper.check();
});

//启用操作
$('#btn_start').click(function() {
	btnOper.start();
});

$('#bt_selectall').click(function() {
	btnOper.selectall().control();
});

$('#bt_unselectall').click(function() {
	btnOper.inverse().control();
});

//查询设备
$('#btn_search').click(function() {
	var op=$("input[name='sswh']:checked").val();
	if(op=='all'){
		btnOper.allSearch();
	}
	else{
		btnOper.search();
	}
	
});

$table.on('check.bs.table check-all.bs.table',
	function(row, $element, field) {
		btnOper.control($element);
	});

$table.on('uncheck.bs.table uncheck-all.bs.table',
	function(row, $element, field) {
		btnOper.control();
	});

function operation(status) {
	var $btnStart = $('#btn_start'),
		$btnHandle = $('#btn_handle'),
		$btnRepair = $('#btn_repair'),
		$btnCheck = $('#btn_check');

	$btnRepair.prop("disabled", true);
	$btnHandle.prop("disabled", true);
	$btnStart.prop("disabled", true);
	$btnCheck.prop("disabled", true);

	switch(status) {
		case IDLE:
			//闲置状态改为启用
			$btnStart.prop("disabled", false);
			break;
		case REPAIRING:
		case SCRAPING:
			//维修中和报废中状态可进行审核操作
			$btnCheck.prop("disabled", false);
			break;
		case BROKEN:
			//故障状态可进行处理操作
			$btnHandle.prop("disabled", false);
			break;
		case NORMAL:
			//正常状态可进行报修操作
			$btnRepair.prop("disabled", false);
			break;
	}
}

$(document).ready(function() {
	$("#equipmentMgr").addClass('active');
	var $table = $("#table");
	$("html").niceScroll({cursorborder:"0",cursorcolor:"rgb(114,117,119)",background:"rgb(207,212,218)",cursoropacitymin:1}); 
	showMaintainInfo = function(devType, road, maintainUnit,deviceStatus, happenTime, endTime) {

		//?device_type=xx&road=xx&maintain_unit=xx&begin_time=xx&end_time=xx&asset_status=xx
		var url = tempurl + "/device/maintain_info",
			argLen = arguments.length;
		if(argLen == 0) {
			url = url;
		} else if(argLen == 1) {
			url = url + "?number=" + devType;
		} else if(!happenTime){
			url = url + "?device_type=" + devType + "&maintain_unit=" + maintainUnit + "&road=" + road + "&asset_status=" + deviceStatus;
		} else if(!!happenTime){
			url = url + "?device_type=" + devType + "&maintain_unit=" + maintainUnit + "&road=" + road + "&asset_status=" + deviceStatus + "&beginTime=" + encodeURIComponent(happenTime) + "&endTime=" + encodeURIComponent(endTime);
		}
		console.log(url)
		$.ajax({
			url: url,
			headers: {'Authorization':userToken},
			type: 'GET',
			dataType: 'json',
			cache:false,
			success: function(data) {
				var i = 0,
					j = 0,
					len = data.length,
					visibleId = ['faultDesc', 'faultLevel', 'happenTime', 'warrantyPeriod', 'maintainTime', 'endTime', 'faultReasonDesc'],
					index2Num = {},
					indexArr = [];
				if(argLen == 1) {
					var tr = $table.find("tbody tr.selected"),
						trLen = tr.length; //thead中的tr元素也有selected样式，也会被选中。
					for(var i = 0; i < trLen; i++) {
						indexArr.push($(tr[i]).data('index'));
						index2Num[$(tr[i]).data('uniqueid')] = $(tr[i]).data('index');
					} // indexArr[j]与data[j]中的数据不一定对应。需要保存一个index与uniqueid的字典表

					for(j; j < len; j++) {

						//通过data[j].uniqueNum匹配index2Num中的uniqueNum键，返回index值
						var nowIndex = index2Num[data[j].uniqueNum];
						for(var z = visibleId.length - 1; z >= 0; z--) {
							if(data[j][visibleId[z]] == undefined) {
								data[j][visibleId[z]] = '';
							}
						}
						$table.bootstrapTable('updateRow', {
							index: nowIndex,
							row: data[j]
						});
					}
					operation(data[0].assetStatus);

				} else {
					$table.bootstrapTable('refreshOptions', {
						data: data,
					});
				}
			},
		});
	}

	var data = showMaintainInfo();

	$table.bootstrapTable({
		data: data,
		cache: false,
		pagination: true,
		sortName: "uniqueNum",
		sortOrder: "asc",
		pageSize: 15,
		uniqueId: "uniqueNum",
		paginationHAlign: "left",
		formatNoMatches: function() {
			return "没有匹配的数据"
		},
		paginationPreText: "<<",
		paginationNextText: ">>",
		undefinedText: '',
		columns: [{
			checkbox: true,
			width: '55px',
		}, {
			field: 'repairId',
			title: '维修编号',
			visible: false
		}, {
			field: 'deviceCode',
			title: '编号',
			sortable: true,
		}, {
			field: 'uniqueNum',
			title: '内部编号',
			visible: false
		}, {
			field: 'location',
			title: '位置',
		}, {
			field: 'type',
			title: '类型字段',
			visible: false
		}, {
			field: 'typeDesc',
			title: '类型',
			sortable: true,
		}, {
			field: 'assetStatus',
			title: '状态',
			visible: false
		}, {
			field: 'statusDesc',
			title: '状态',
		}, {
			field: 'faultDesc',
			title: '故障现象',
		}, {
			field: 'faultLevel',
			title: '故障级别',
		}, {
			field: 'happenTime',
			title: '发生日期',
			sortable: true,
			formatter: function(value, row, index) {
				return /\d{4}-\d{1,2}-\d{1,2}/g.exec(value);
			},
			sortable: true,
		}, {
			field: 'warrantyPeriod',
			title: '质保日期',
			formatter: function(value, row, index) {
				return /\d{4}-\d{1,2}-\d{1,2}/g.exec(value);
			},
			sortable: true,
		}, {
			field: 'maintainTime',
			title: '维护日期',
			formatter: function(value, row, index) {
				return /\d{4}-\d{1,2}-\d{1,2}/g.exec(value);
			},
			sortable: true,
		}, {
			field: 'endTime',
			title: '结束日期',
			formatter: function(value, row, index) {
				return /\d{4}-\d{1,2}-\d{1,2}/g.exec(value);
			},
			sortable: true,
		}, {
			field: 'faultReason',
			title: '故障原因',
			visible: false,
		}, {
			field: 'faultReasonDesc',
			title: '故障原因',
		},  {
			field: 'maintainUnit',
			title: '维护单位',
		}, {
			field: 'operate',
			title: '维修记录',
			events: operateEvents,
			formatter: operateFormatter,
			width: '100px'
		}]
	});

	selectData = function() {
		//获取维护人下拉框数据
		$.ajax({
			type: "get",
			headers: {'Authorization':userToken},
			url: tempurl + "/user/query",
			dataType: "json",
			cache:false,
			success: function(data) {
				var j = 0;
				for(var i = 0, len = data.length; i < len; i++) {
					personData[j++] = { id: data[i].account, text: data[i].name };
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				console.log("error");
			}
		});

		$.ajax({
			type: "get",
			headers: {'Authorization':userToken},
			url: tempurl + "/virtual_device/road",
			dataType: "json",
			async: true,
			cache:false,
			success: function(data) {
				var roadData = [],
					j = 0;
				for(var i = 0, len = data.length; i < len; i++) {
					roadData[j++] = { id: data[i].uniqueNum, text: data[i].name };
				}
				$('.location').select2({
					data: roadData,
					minimumResultsForSearch: Infinity,
				});
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				console.log("error");
			}
		});
		
		$.ajax({
			type: "get",
			headers: {'Authorization':userToken},
			url: tempurl + "/general/dictionary?types=" + DEVICEFAULT_STATUS,
			dataType: "json",
			async: true,
			cache:false,
			success: function(data) {
				var w = 1;
				deviceFaultStatus[0]= { id: '102,103,104,106', text: '所有' };
				for(var i = 0, len = data.length; i < len; i++) {
					deviceFaultStatus[w++]={ id: data[i].id, text: data[i].description };
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				console.log("error");
			}
		});
		$.ajax({
			url: tempurl + "/general/dictionary?types=" + WCDEV + "," + NCSS + "," + SUPPLIER + "," + DEVICE_STATUS + "," + MAINTAIN_METHOD + "," + FAULT_REASON + "," + FAULT_Desc+","+DEVICEFAULT_STATUS,
			type: "GET",
			headers: {'Authorization':userToken},
			dataType: "json",
			cache:false,
			success: function(data) {
				var j = 0,
					u = 0,				
					x = 1,
					y = 0,
					z = 0;
				deviceStatus[0]= { id: '100', text: '所有' };
				for(var i = 0, len = data.length; i < len; i++) {
					switch(data[i].type) {
						case WCDEV:
						case NCSS:
							typeData[j++] = { id: data[i].id, text: data[i].description };
							break;
						case DEVICE_STATUS:
							deviceStatus[x++] = { id: data[i].id, text: data[i].description };
							break;
						case MAINTAIN_METHOD:
							handleMethod[y++] = { id: data[i].id, text: data[i].description };
							break;
						case FAULT_REASON:
							faultReason[u++] = { id: data[i].id, text: data[i].description };
							break;
						case SUPPLIER:
							unitData[z++] = { id: data[i].id, text: data[i].description };
							break;
						case FAULT_Desc:
							faultDesc.push(data[i].description);
							break;	
					}
				}
				initData();
			}
		});
	}
	selectData();
})