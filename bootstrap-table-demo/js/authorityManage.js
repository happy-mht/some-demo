/**
 * @author:wxf
 */
var $table = $('#table'),
	$btnEdit = $("#btn_edit");
var tempurl = '';

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
	$table = $('#table'),
	userCookie = getCookieValue("user.cookie");
userCookie = unescape(userCookie.replace(/\"/g, ""));
var userArr = userCookie.split(","),
	userToken = userArr[2];

tempurl = decodeURIComponent(baseurl); //"http://192.168.1.201:8180/itsmain/webapi";
function dateForm() {
	$('.form_date').datetimepicker({
		language: 'zh-CN',
		weekStart: 1,
		todayBtn: 1,
		autoclose: 1,
		todayHighlight: 1,
		startView: 2,
		minView: 2,
		forceParse: 0
	});
}

//显示用户
function showManager(role_id) {

	//http://192.168.1.224:8080/itsmain/webapi/user/access/query?role_id=801,802
	var url = '';
	if(role_id == undefined) {
		url = tempurl + "/user/access/query";
	} else {
		url = tempurl + "/user/access/query?role_id=" + role_id;
	}
	$.ajax({
		url: url,
		headers: { 'Authorization': userToken },
		type: 'GET',
		dataType: 'json',
		cache:false,
		success: function(data) {
			var i = 0;
			console.log(data);
			$table.bootstrapTable('refreshOptions', {
				data: data,
			});
		},
	});
}

//修改权限
var editmodal = new Modal({
	title: '角色权限',
	content: $('#authority_modal').html(),
	width: 554,
	onContentReady: function() {
		var authDic = [],
			cheBox = '';
		var check = this.$modal.find(".user_check");
		$.ajax({
			type: "get",
			headers: { 'Authorization': userToken },
			url: tempurl + "/general/dictionary?types=850",
			async: false,
			cache:false,
			success: function(data) {
				console.log(data);
				for(var i = 0, len = data.length; i < len; i++) {
					authDic[i] = { id: data[i].id, text: data[i].description }
					cheBox += '<input name="user_pri" type="checkbox" id="' + data[i].id + '" value="' + data[i].id + '"><label class="user_pri" for="' + data[i].id + '">' + data[i].description + '</label>';
				}
				check.append(cheBox);
			}
		});
	},
	buttons: [{
		html: '<button type="button" class="btn btn-sm btn-ok">保存</button>',
		selector: '.btn-ok',
		callback: function() {
			var data = $(":checkbox[name='user_pri']").serializeArray(),
				$alert = this.$modal.find('.alert'),
				$errMsg = $alert.find('.error_msg'),
				accessdata = [],
				row = $table.bootstrapTable('getSelections'),
				account = row[0].roleId;

			// {"account":"acc1","userAccess":"权限1,权限2"}
			data.forEach(function(obj) {
				accessdata.push(obj.value);
			});
			accessdata = accessdata.join(',')
			console.log(accessdata)
			if(accessdata.length == 0) {
				$alert.show();
				$errMsg.text('请至少勾选一个权限！');
				return false;
			} else {
				$alert.hide();
				_post();
			}

			function _post() {
				var dataSend = JSON.stringify({
					"role": account,
					"userAccess": accessdata
				});
				console.log(dataSend);
				$.ajax({
					type: "PUT",
					headers: { 'Authorization': userToken },
					url: tempurl + "/user/access",
					contentType: "application/json;charset=utf-8",
					dataType: "json",
					data: dataSend,
					cache:false,
					success: function(jsonResult) {
						console.log(jsonResult);
						showManager();
						$alert.hide();
						$btnEdit.prop("disabled", true);
					},
					error: function() { $alert.hide(); }
				});
			}
		}
	}, {
		html: '<button type="button" class="btn btn-sm  btn-cancel">取消</button>',
		selector: '.btn-cancel',
		callback: function() {
			this.$modal.find('.alert').hide();
		}
	}],
});

$btnEdit.click(function() {
	editmodal.open();
	var row = $.map($table.bootstrapTable('getSelections'), function(row) {
		return row;
	});
	$("#role").val(row[0].roleDesc)
	$("input[name='user_pri']").prop("checked", false);
	$.ajax({
		url: tempurl + "/user/access/query?role_id=" + row[0].roleId,
		type: 'GET',
		headers: { 'Authorization': userToken },
		dataType: 'json',
		async: false,
		cache:false,
		success: function(data) {
			if(data.length = 1) {
				var data = data[0],
					authdata = [];
				if(data.equipmentMgr == 1) {
					authdata.push(data.equipmentMgrId);
				}
				if(data.videoMgr == 1) {
					authdata.push(data.videoMgrId);
				}
				if(data.gis == 1) {
					authdata.push(data.gisId);
				}
				if(data.publishMgr == 1) {
					authdata.push(data.publishMgrId);
				}
				if(data.systemMgr == 1) {
					authdata.push(data.systemMgrId);
				}
				if(data.trafficStatus == 1) {
					authdata.push(data.trafficStatusId);
				}
				if(data.userMgr == 1) {
					authdata.push(data.userMgrId);
				}
			}
			$.each(authdata, function(i, item) {
				$("input[name='user_pri'][value=" + item + "]").prop("checked", true);
			});
		},
	});
});
$table.on('check.bs.table check-all.bs.table',
	function(row, $element, field) {
		var row = $.map($table.bootstrapTable('getSelections'), function(row) {
			return row;
		});
		len = row.length;
		if(len == 1) {
			$btnEdit.prop("disabled", false);
		} else {
			$btnEdit.prop("disabled", true);
		}
	});

$table.on('uncheck.bs.table uncheck-all.bs.table',
	function(row, $element, field) {
		var row = $.map($table.bootstrapTable('getSelections'), function(row) {
			return row;
		});
		len = row.length;
		if(len == 1) {
			$btnEdit.prop("disabled", false);
		} else {
			$btnEdit.prop("disabled", true);
		}
	});

$(document).ready(function() {
	$("#userMgr").addClass('active');
	var $table = $('#table');
	var data = showManager();
	$table.bootstrapTable({
		data: data,
		cache: false,
		pagination: true,
		sortable: true,
		sortOrder: "asc",
		pageSize: 15,
		uniqueId: "account",
		paginationHAlign: "left",
		paginationPreText: "<<",
		paginationNextText: ">>",
		undefinedText: '',
		singleSelect: true,
		formatNoMatches: function() {
			return "没有匹配的数据"
		},
		columns: [{
			checkbox: true,
			width: '65px',
			title: '序号'
		}, {
			field: 'roleDesc',
			title: '用户角色',
		}, {
			field: 'roleId',
			title: '用户角色ID',
			visible: false
		}, {
			field: 'gis',
			title: 'GIS地图',
			formatter: function(value, row, index) {
				if(value == '1') {
					return '<i class="fa fa-check" aria-hidden="true"></i>';
				}
				return '';
			},
		}, {
			field: 'gisId',
			title: 'GIS地图ID',
			visible: false
		}, {
			field: 'videoMgr',
			title: '视频管理',
			formatter: function(value, row, index) {
				if(value == '1') {
					return '<i class="fa fa-check" aria-hidden="true"></i>';
				}
				return '';
			},
		}, {
			field: 'videoMgrId',
			title: '视频管理ID',
			visible: false
		}, {
			field: 'publishMgr',
			title: '诱导发布',
			formatter: function(value, row, index) {
				if(value == '1') {
					return '<i class="fa fa-check" aria-hidden="true"></i>';
				}
				return '';
			},
		}, {
			field: 'publishMgrId',
			title: '诱导发布ID',
			visible: false
		}, {
			field: 'trafficStatus',
			title: '交通状态',
			formatter: function(value, row, index) {
				if(value == '1') {
					return '<i class="fa fa-check" aria-hidden="true"></i>';
				}
				return '';
			},
		}, {
			field: 'trafficStatusId',
			title: '交通状态ID',
			visible: false
		}, {
			field: 'equipmentMgr',
			title: '设施管理',
			formatter: function(value, row, index) {
				if(value == '1') {
					return '<i class="fa fa-check" aria-hidden="true"></i>';
				}
				return '';
			},
		}, {
			field: 'equipmentMgrId',
			title: '设施管理ID',
			visible: false
		}, {
			field: 'systemMgr',
			title: '系统运维',
			formatter: function(value, row, index) {
				if(value == '1') {
					return '<i class="fa fa-check" aria-hidden="true"></i>';
				}
				return '';
			},
		}, {
			field: 'systemMgrId',
			title: '系统运维ID',
			visible: false
		}, {
			field: 'userMgr',
			title: '用户管理',
			formatter: function(value, row, index) {
				if(value == '1') {
					return '<i class="fa fa-check" aria-hidden="true"></i>';
				}
				return '';
			},
		}, {
			field: 'userMgrId',
			title: '用户管理ID',
			visible: false
		}, ]
	});

});