/*
 * @author：wxf
 */
var $table = $('#table'),
	tempurl = '',
	postData = [],
	departmentData = [],
	roleData = [],
	statusData = [],
	userData = {};

const POST = '750', //用户岗位
	POST1 = '751', //岗位1
	ROLE = '800', //用户角色
	ADMIN = '801', //管理员
	DEPARTMENT = '300', //部门
	DEPARTMENT1 = '301', //部门1
	INCUMBENCY_STATUS = '200', //在职状态
	INCUMBENCY_ACTIVE = '201'; //在职

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

var userCookie = getCookieValue("user.cookie");
userCookie = unescape(userCookie.replace(/\"/g, ""));
var userArr = userCookie.split(",");
var userToken = userArr[2];

var baseurl = getCookieValue("baseserviceurl.cookie"),
	$table = $('#table');

tempurl = decodeURIComponent(baseurl);
//tempurl = "http://192.168.1.201:8180/itsmain/webapi";

//显示用户
function showUser(department, role, username) {

	//根据条件查询 http://192.168.1.224:8080/itsmain/weapi/query?department=xx&name=xx&role=xx 
	var url = '',
		unit = DEPARTMENT,
		userRole = ROLE;
	if(arguments.length == 1) {
		url = tempurl + "/user/" + department; //根据account查询某一个用户
	}
	if(!username) {
		if(department == unit && role == userRole) {
			url = tempurl + "/user/query";
		} else if(department == unit && role > userRole) {
			url = tempurl + "/user/query?role=" + role;
		} else if(department > unit && role == userRole) {
			url = tempurl + "/user/query?department=" + department;
		} else if(department > unit && role > userRole) {
			url = tempurl + "/user/query?department=" + department + "&role=" + role;
		}
	} else {
		if(department == unit && role == userRole) {
			url = tempurl + "/user/query?" + "name=" + encodeURIComponent(username);
		} else if(department == unit && role > userRole) {
			url = tempurl + "/user/query?role=" + role + "&name=" + encodeURIComponent(username);
		} else if(department > unit && role == userRole) {
			url = tempurl + "/user/query?department=" + department + "&name=" + encodeURIComponent(username);
		} else if(department > unit && role > userRole) {
			url = tempurl + "/user/query?department=" + department + "&role=" + role + "&name=" + encodeURIComponent(username);
		}

	}

	$.ajax({
		url: url,
		headers: { 'Authorization': userToken },
		type: 'GET',
		cache:false,
		dataType: 'json',
		success: function(data) {
			var visibleId = ['sex', 'age', 'departmentDesc', 'incumbencyStatusDesc', 'postDesc', 'roleDesc', 'userAccess', 'remark'],
				len = visibleId.length;

			if(data instanceof Array) {
				$table.bootstrapTable('refreshOptions', {
					data: data,
				});
			} else {
				var tr = $table.find("tbody tr.selected");
				var index = tr.data('index');
				for(var i = len - 1; i >= 0; i--) {
					if(data[visibleId[i]] == undefined) {
						data[visibleId[i]] = '';
					}
				}
				$table.bootstrapTable('updateRow', {
					index: index,
					row: data
				});
			}

		},
	});
}

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

function inputNum(_this) {
	_this.value = _this.value.replace(/[^0-9]/g, '');
}

/***********************表单验证策略对象*********************************************/
var strategies = {
	isNoEmpty: function(dom, value, errmsg) {
		if(value == '') {
			$(dom).addClass('alert-danger');
			$(dom).focus();
			return errmsg;
		} else {
			$(dom).removeClass('alert-danger');
		}
	},
	maxLength: function(dom, value, len, errmsg) {
		if(value.length > len) {
			$(dom).addClass('alert-danger');
			$(dom).focus();
			return errmsg;
		} else {
			$(dom).removeClass('alert-danger');
		}
	},

	isEqual: function(dom, value1, value2, errmsg) {
		if(value1 != value2) {
			$(dom).addClass('alert-danger');
			$(dom).focus();
			return errmsg;
		} else {
			$(dom).removeClass('alert-danger');
		}
	},

	isUniNum: function(dom, value, errmsg) {
		var isFound = '';
		$.ajax({
			type: "GET",
			cache:false,
			url: tempurl + "/user/find/" + value,
			headers: { 'Authorization': userToken },
			contentType: "application/json;charset=utf-8", //必须有
			dataType: "json", //表示返回值类型，不必须
			async: false, //这里必须设为同步请求，否则isFound赋值不成功
			success: function(data) {
				isFound = data['msg'];
			}
		});
		if(isFound == "FOUND") {
			$(dom).addClass('alert-danger');
			$(dom).focus();
			return errmsg;
		} else {
			$(dom).removeClass('alert-danger');
		}
	},
};

/***********************Validator类*********************************************/
var Validator = function() {
	this.cache = [];
}

Validator.prototype.add = function(dom, rules) {
	var self = this;
	for(var i = 0, rule; rule = rules[i++];) {
		(function(rule) {
			var strategyAry = rule.strategy.split(':');
			var errorMsg = rule.errorMsg;

			self.cache.push(function() {
				var strategy = strategyAry.shift();
				strategyAry.unshift(dom.value);
				strategyAry.unshift(dom);
				strategyAry.push(errorMsg);
				return strategies[strategy].apply(dom, strategyAry);
			});
		})(rule)
	}
};

Validator.prototype.start = function() {
	for(var i = 0, validatorFunc; validatorFunc = this.cache[i++];) {
		var errorMsg = validatorFunc();
		if(errorMsg) {
			return errorMsg;
		}
	}
};

function selectData() {

	$.ajax({
		url: tempurl + "/general/dictionary?types=" + INCUMBENCY_STATUS + "," + DEPARTMENT + "," + POST + "," + ROLE,
		headers: { 'Authorization': userToken },
		cache:false,
		type: "GET",
		dataType: "json",
		async: false,
		success: function(data) {
			var u = 0,
				x = 0,
				j = 0,
				z = 0;
			for(var i = 0, len = data.length; i < len; i++) {
				switch(data[i].type) {
					case INCUMBENCY_STATUS:
						statusData[u++] = { id: data[i].id, text: data[i].description };
						break;
					case DEPARTMENT:
						departmentData[z++] = { id: data[i].id, text: data[i].description };
						break;
					case POST:
						postData[j++] = { id: data[i].id, text: data[i].description };
						break;
					case ROLE:
						roleData[x++] = { id: data[i].id, text: data[i].description };
						break;
				}
			}
			initData();
		}
	});
}

function initData() {
	$(".post").select2({
		data: postData,
		minimumResultsForSearch: Infinity,
	});
	$(".department").select2({
		data: departmentData,
		minimumResultsForSearch: Infinity
	});
	$(".role").select2({
		data: roleData,
		minimumResultsForSearch: Infinity,
	});
	$(".incumbencyStatus").select2({
		data: statusData,
		minimumResultsForSearch: Infinity,
	});
	$(".sex").select2({
		minimumResultsForSearch: Infinity,
	});
	$('.nice-scroll').on("select2:open", function() {
		$(".select2-results__options").niceScroll({cursorborder:"0",cursorcolor:"RGB(136,218,22)",background:"rgb(207,212,218)",cursoropacitymin:1,
		    cursorborderradius: "10px",
	    }); 
	});
}

var oper = {
	add: function() {
		addModal.open();
	},
	del: function() {
		var accounts = $.map($table.bootstrapTable('getSelections'), function(row) {
			return row.account;
		});
		if(accounts.length === 0) {
			Alert('<div class="handle-tip"><img src="images/tip.png" alt="提示" />请选取您要删除的用户</div>');
		} else Confirm({
			msg: '<div class="handle-tip"><img src="images/tip.png" alt="提示" />确认要删除此(这些)用户吗?</div>',
			onOk: function() {
				accounts = accounts.join(',');
				var dataSend = JSON.stringify({
					"account": accounts
				});

				$.ajax({
					url: tempurl + "/user",
					headers: { 'Authorization': userToken },
					type: 'DELETE',
					cache:false,
					contentType: "application/json;charset=utf-8",
					dataType: "json",
					data: dataSend,
					success: function(result) {
						console.log(result);
						showUser(DEPARTMENT, ROLE);
					}
				});
			},
		});
	},
	edit: function() {
		var ids = $.map($table.bootstrapTable('getSelections'), function(row) {
			return row.account;
		});
		if(ids.length === 0) {
			Alert('<div class="handle-tip"><img src="images/tip.png" alt="提示" />请选取您要修改的用户！</div>');
		} else if(ids.length > 1) {
			Alert('<div class="handle-tip"><img src="images/warn.png" alt="提示" />注意一次只能编辑一个用户！请重新选择</div>');
		} else {
			editmodal.open();
			var row = $table.bootstrapTable('getSelections');
			userData = row[0];
			$("#name").val(userData.name);
			$("#account").val(userData.account);
			$("#sex").val(userData.sex);
			$("#incumbencyStatus").val(userData.incumbencyStatus).trigger("change");
			$("#post").val(userData.post).trigger("change");
			$("#role").val(userData.role).trigger("change");
			$("#department").val(userData.department).trigger("change");
			$("#age").val(userData.age);
			$("#remark").val(userData.remark);
		}
	},
	changePassword: function() {
		var account = $.map($table.bootstrapTable('getSelections'), function(row) {
				return row.account;
			}),
			len = account.length;
		if(len === 0) {
			Alert('<div class="handle-tip"><img src="images/tip.png" alt="提示" />请选取您要重置密码的用户！</div>');
		} else if(len > 1) {
			Alert('<div class="handle-tip"><img src="images/warn.png" alt="提示" />注意一次只能重置一个用户！请重新选择</div>');
		} else {
			passwordModal.open();
		}
	},
	selectall: function() {
		$table.bootstrapTable('checkAll');
		$('#table tbody tr').each(function() {
			$(this).addClass("selected");
		});
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
		var row = $.map($table.bootstrapTable('getData', { "useCurrentPage": true }), function(row) {
			return row;
		});
		$.each(row, function() {
			this[0] = !this[0];
		});
	},

}

//新建用户
var addModal = new Modal({
	title: '用户信息',
	content: $('#add_modal').html(),
	width: 604,
	onContentReady: function() {
		initData();
	},
	buttons: [{
		html: '<button type="button" class="btn btn-sm btn-ok">保存</button>',
		selector: '.btn-ok',
		callback: function() {
			var $form = this.$modal.find('form'),
				data = $form.serializeArray(), //form中的输入框须有name属性，否则取不到数据。
				postData = {},
				form = $form[0],
				$alert = $form.find(".alert"),
				$errorMsg = $alert.find('.error_msg'),
				$account = $(form.account),
				$password = $(form.password),
				$confPassword = $(form.confPassword),
				$age = $(form.age),
				$name = $(form.name);
			data.forEach(function(obj) {
				postData[obj.name] = obj.value;
			});

			/***********************表单验证调用代码*******************************************/
			var validataFunc = function() {
				var validator = new Validator();

				validator.add(form.account, [{
					strategy: 'isNoEmpty',
					errorMsg: '请输入用户名！'
				}, {
					strategy: 'isUniNum',
					errorMsg: '此账号已存在，请重新输入！'
				}]);
				validator.add(form.password, [{
					strategy: 'isNoEmpty',
					errorMsg: '请输入密码！'
				}]);
				validator.add(form.confPassword, [{
					strategy: 'isNoEmpty',
					errorMsg: '请再次输入密码！'
				}, {
					strategy: 'isEqual:' + form.password.value,
					errorMsg: '两次密码不一致，请重新输入！'
				}]);
				validator.add(form.name, [{
					strategy: 'isNoEmpty',
					errorMsg: '请输入姓名！'
				}]);
				if($age.val()) {
					validator.add(form.age, [{
						strategy: 'maxLength:3',
						errorMsg: '注意年龄在3位数内！'
					}]);
				}
				var errorMsg = validator.start();
				return errorMsg;
			}
			var errorMsg = validataFunc();
			if(errorMsg) {
				console.log(errorMsg);
				$alert.show();
				$errorMsg.html(errorMsg);
				return false;
			}
			/***********************表单验证结束*******************************************/

			postData.password = hex_md5(postData.password);
			postData.confPassword = hex_md5(postData.confPassword);
			_post();

			function _post() {
				var form = $form[0];
				form.reset();
				var dataSend = JSON.stringify(postData);
				console.log(dataSend);
				$.ajax({
					type: "POST",
					url: tempurl + "/user",
					headers: { 'Authorization': userToken },
					contentType: "application/json;charset=utf-8",
					dataType: "json",
					cache:false,
					data: dataSend,
					async: false,
					success: function(jsonResult) {
						console.log(jsonResult);
						$alert.hide();
						showUser(DEPARTMENT, ROLE);
						$form[0].reset();
						$form.find(".department").val(DEPARTMENT1).trigger("change");
						$form.find(".post").val(POST1).trigger("change");
						$form.find(".role").val(ADMIN).trigger("change");
						$form.find(".incumbencyStatus").val(INCUMBENCY_ACTIVE).trigger("change");
					},
					error: function(msg) {
						Alert('<div class="handle-tip"><img src="images/warn.png" alt="提示" />新建用户失败</div>')
					}
				});
			}
		}
	}, {
		html: '<button type="button" class="btn btn-sm  btn-cancel">取消</button>',
		selector: '.btn-cancel',
		callback: function() {
			var $form = this.$modal.find('form');
			$form[0].reset();
			$form.find(".alert").hide();
			$form.find('*').removeClass('alert-danger');
			$form.find(".department").val(DEPARTMENT1).trigger("change");
			$form.find(".post").val(POST1).trigger("change");
			$form.find(".role").val(ADMIN).trigger("change");
			$form.find(".incumbencyStatus").val(INCUMBENCY_ACTIVE).trigger("change");
		}
	}],
});

//修改用户
var editmodal = new Modal({
	title: '用户信息',
	content: $('#edit_modal').html(),
	width: 604,
	onContentReady: function() {
		initData();
	},
	buttons: [{
		html: '<button type="button" class="btn btn-sm btn-ok">保存</button>',
		selector: '.btn-ok',
		callback: function() {
			var $form = this.$modal.find('form'),
				data = $form.serializeArray(), //form中的输入框须有name属性，否则取不到数据。
				postData = {},
				form = $form[0],
				$alert = $form.find(".alert"),
				$errorMsg = $alert.find('.error_msg'),
				$age = $(form.age),
				$name = $(form.name),
				user = userData,
				isEdit = 0;
			data.forEach(function(obj) {
				if(user[obj.name] == undefined) {
					user[obj.name] = '';
				}
				if(obj.value != user[obj.name]) {
					console.log(obj.value);
					console.log(user[obj.name])
					isEdit = 1;
				}
				postData[obj.name] = obj.value;
			});
			if(!isEdit) {
				$alert.show();
				$errorMsg.text('您未修改该用户的任何信息！');
				return false;
			}

			/***********************表单验证调用代码*******************************************/
			var validataFunc = function() {
				var validator = new Validator();
				validator.add(form.name, [{
					strategy: 'isNoEmpty',
					errorMsg: '请输入姓名！'
				}]);
				if($age.val()) {
					validator.add(form.age, [{
						strategy: 'maxLength:3',
						errorMsg: '注意年龄在3位数内！'
					}]);
				}
				var errorMsg = validator.start();
				return errorMsg;
			}
			var errorMsg = validataFunc();
			if(errorMsg) {
				console.log(errorMsg);
				$alert.show();
				$errorMsg.text(errorMsg);
				return false;
			}
			/***********************表单验证结束*******************************************/
			_post();

			function _post() {
				var dataSend = JSON.stringify(postData);

				$.ajax({
					type: "PUT",
					url: tempurl + "/user",
					headers: { 'Authorization': userToken },
					contentType: "application/json;charset=utf-8",
					dataType: "json",
					data: dataSend,
					cache:false,
					success: function(jsonResult) {
						console.log(jsonResult);
						$alert.hide();
						showUser(postData['account']);
					}
				});
			}
		}
	}, {
		html: '<button type="button" class="btn btn-sm  btn-cancel">取消</button>',
		selector: '.btn-cancel',
		callback: function() {
			var $form = this.$modal.find('form');
			$form.find('*').removeClass('alert-danger');
			$form.find('.alert').hide();
		}
	}],
});

//重置密码
var passwordModal = new Modal({
	title: '重置密码',
	content: '<div class="handle-tip" style="margin:20px;"><img src="images/tip.png" alt="提示" />确认要重置此用户的密码吗？</div>',
	width: 440,
	buttons: [{
		html: '<button type="button" class="btn btn-sm btn-ok">确定</button>',
		selector: '.btn-ok',
		callback: function() {
			var account = $.map($table.bootstrapTable('getSelections'), function(row) {
				return row.account;
			});
			var password = hex_md5("123456");
			var dataSend = JSON.stringify({ "account": account[0], "password": password });
			$.ajax({
				type: "PUT",
				url: tempurl + "/user/reset_password",
				headers: { 'Authorization': userToken },
				contentType: "application/json;charset=utf-8",
				dataType: "json",
				cache:false,
				data: dataSend,
				success: function(jsonResult) {
					console.log(jsonResult);
					Alert('<div class="success-tip"><img src="images/tip.png" alt="提示" />重置密码成功</div>');
				},
				error: function() {
					Alert('<div class="handle-tip"><img src="images/warn.png" alt="提示" />重置密码失败</div>');
				}
			});
		}
	}, {
		html: '<button type="button" class="btn btn-sm btn-cancel">取消</button>',
		selector: '.btn-cancel',
		callback: function() {}
	}],
});

//用户详情
var detailmodal = new Modal({
	title: '用户信息记录',
	//content: $('#detail_modal').html(),
	content: '<table id="detailTable"></table>',
	marginTop: 100,
	maxWidth: 1820,
	width: document.body.clientWidth * 0.98,
	onContentReady: function() {
		dateForm();
		var $detailTable=this.$modal.find('#detailTable');
		this.$modal.find('.modal-body').niceScroll({cursorborder:"0",cursorcolor:"RGB(136,218,22)",background:"rgb(207,212,218)",cursoropacitymin:1});
		$detailTable.bootstrapTable({
			data: '',
			pagination: true,
			pageSize: 15,
			sortName: "lastUpdate",
			sortOrder: "desc",
			uniqueId: "account",
			height: 631,
			width: 1820,
			paginationHAlign: "left",
			undefinedText: '',
			formatNoMatches: function() {
				return "没有匹配的数据"
			},
			paginationPreText: "<<",
			paginationNextText: ">>",
			columns: [{
				title: '序号',
				formatter: function(value, row, index) {
					index = index + 1;
					return '<span>' + index + "</span>";
				},
				width:'100',
			}, {
				field: 'lastUpdate',
				title: '变更时间',
				sortable: true,
				formatter: function(value, row, index) {
					return /\d{4}-\d{1,2}-\d{1,2}/g.exec(value);
				},
				width:'120',
			}, {
				field: 'account',
				title: '账号',
				sortable: true,
			}, {
				field: 'name',
				title: '姓名',
				//sortable: true,
			}, {
				field: 'sex',
				title: '性别',
				sortable: true,
			}, {
				field: 'incumbencyStatusDesc',
				title: '状态',
				sortable: true,
			}, {
				field: 'departmentDesc',
				title: '部门',
				sortable: true,
			}, {
				field: 'postDesc',
				title: '岗位',
				//sortable: true,
			}, {
				field: 'roleDesc',
				title: '用户角色',
				//sortable: true,
			}, {
				field: 'userAccess',
				title: '用户权限',
			}, {
				field: 'remark',
				title: '备注信息',

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
		'<button id="btn_detail" type="button" class="RoleOfA btn-default bt-select oper">详情</button>',
	].join('');
}
window.operateEvents = {
	'click .RoleOfA': function(e, value, row, index) {
		var account = row.account;
		detailmodal.open();
		var $updateStart=$('#updateStart'),
			$updateEnd=$('#updateEnd'),
			date=new Date(),
		    year = date.getFullYear(),
		    month = date.getMonth() + 1,
		    day = date.getDate(),
		    endTime = year + '-' + month + '-' + day;
		    $updateEnd.val(endTime);
		    
		$.ajax({
			url: tempurl + "/user/record/" + account,
			headers: { 'Authorization': userToken },
			type: 'GET',
			cache:false,
			dataType: 'json',
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
		offsetWidth = $td[0].offsetWidth,
		scrollWidth = $td[0].scrollWidth;
	if(e.type == "mouseover") {
		if(offsetWidth >= scrollWidth) {
			return;
		}
		$td.attr("title", str);
	} else if(e.type == "mouseout") {
		$td.removeAttr("title");
	}
	e.stopImmediatePropagation();
});
$('#btn_delete').click(function() {
	oper.del();
});

$("#btn_add").click(function() {
	oper.add();
});

$("#btn_modify").click(function() {
	oper.edit();
});

$('#btn_password').click(function() {
	oper.changePassword();
});

$('#tool_department').on('change', function() {
	var department = this.value,
		role = $('#tool_role').val(),
		username = $('#tool_name').val();
	console.log("部门：" + department + ";角色：" + role + ";name: " + username);
	showUser(department, role, username);
});
$('#tool_name').on('input', function() {
	var username = this.value,
		role = $('#tool_role').val(),
		department = $('#tool_department').val();
	console.log("部门：" + department + ";角色：" + role + ";name: " + username);
	showUser(department, role, username);
});
$('#tool_role').on('change', function() {
	var role = this.value,
		department = $('#tool_department').val(),
		username = $('#tool_name').val();
	console.log("部门：" + department + ";角色：" + role + ";name: " + username);
	showUser(department, role, username);
});
$('#bt_selectall').click(function() {
	oper.selectall();
});

$('#bt_unselectall').click(function() {
	oper.inverse();
});

$(document).ready(function() {
	$("#userMgr").addClass('active');
	var user = $("#user").val();
	if(user == 'admin') {
		$("#btn_password").show();
	} else {
		$("#btn_password").hide();
	}
	$("html").niceScroll({cursorborder:"0",cursorcolor:"rgb(114,117,119)",background:"rgb(207,212,218)",cursoropacitymin:1}); 
	$table.bootstrapTable({
		data: '',
		cache: false,
		pagination: true,
		sortName: "lastUpdate",
		sortOrder: "desc",
		pageSize: 15,
		uniqueId: "account",
		paginationHAlign: "left",
		paginationPreText: "<<",
		paginationNextText: ">>",
		undefinedText: '',
		formatNoMatches: function() {
			return "没有匹配的数据"
		},
		columns: [{
			checkbox: true,
			width: '55px',
			title: '序号'
		}, {
			field: 'account',
			title: '账号', //即用户名
			sortable: true,
		}, {
			field: 'name',
			title: '姓名',
			//sortable: true,
		}, {
			field: 'sex',
			title: '性别',
			sortable: true,
		}, {
			field: 'age',
			title: '年龄',
			sortable: true,
		}, {
			field: 'incumbencyStatus',
			title: '状态',
			visible: false
		}, {
			field: 'incumbencyStatusDesc',
			title: '状态',
			sortable: true,
		}, {
			field: 'department',
			title: '部门',
			visible: false
		}, {
			field: 'departmentDesc',
			title: '部门',
			sortable: true,
		}, {
			field: 'post',
			title: '岗位',
			visible: false
		}, {
			field: 'postDesc',
			title: '岗位',
			//sortable: true,
		}, {
			field: 'role',
			title: '角色',
			visible: false
		}, {
			field: 'roleDesc',
			title: '角色',
			//sortable: true,
		}, {
			field: 'userAccess',
			title: '用户权限',
			width: '450'
		}, {
			field: 'userLevel',
			title: '用户级别',
			visible: false
		}, {
			field: 'userLevelDesc',
			title: '用户级别',
			visible: false
		}, {
			field: 'lastUpdate',
			title: '更新时间',
			sortable: true,
			width: '200'
		}, {
			field: 'remark',
			title: '备注',
			events: operateEvents,
			formatter: operateFormatter,
			width: '60px'
		}, ]
	});
	selectData();
	showUser(DEPARTMENT, ROLE);
});