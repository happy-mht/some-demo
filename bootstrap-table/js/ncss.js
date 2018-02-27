/*
 * @author：wxf
 */
var tempurl = '',
	$table = $("#table"),
	personData = [],
	roadData = [],
	typeData = [],
	unitData = [],
	laneData = [],
	supplierData = [],
	laneNumber = [],
	Subtype = [],
	assetStatus = [];

const NCSS = '1',
	SERVER = '2', //服务器
	SCREEN = '3', //大屏
	SWITCH_BOARD = '4', //交换机
	GATEKEEPER = '5', //网闸
	WORK_STATION = '6', //工作站
	SUPPLIER = '550', //供货商
	SUPPLIER1 = '551', //供货商1
	UNIT = '300', //部门
	UNIT1 = '301', //部门1
	DIRECTION = '350', //方向
	ASSETSTATUS = '100', //资产状态
	STATUS_IDLE = '105', //闲置
	SUB_TYPE = '10000', //子类型
	BRAND = '10050', //品牌
	MODEL = '10100', //型号
	SPECIFICATION = '10150', //规格
	CHARGPERSON1 = 'admin', //负责人
	undefinedText = '';

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

//显示查询内场设施的结果
function showNcss(opt, supplier, oper) {
	var url = tempurl + "/device/inside_device",
		ncss = NCSS,
		sup = SUPPLIER;
	if(oper == 'add' || oper == 'edit') {
		url = tempurl + "/device/" + opt;
	} else if(opt == ncss && supplier == sup) {
		url = url;
	} else if(opt == ncss && supplier > sup) {
		url = url + "/query?supplier=" + supplier;
	} else if(opt > ncss && supplier == sup) {
		url = url + "/query?type=" + opt;
	} else if(opt > ncss && supplier > sup) {
		url = url + "/query?type=" + opt + "&supplier=" + supplier;
	}
	$.ajax({
		url: url,
		headers: { 'Authorization': userToken },
		type: 'GET',
		cache:false,
		dataType: 'json',
		success: function(data) {
			var index,
				visibleId = ['brand', 'subTypeDesc', 'model', 'specification', 'locationDesc', 'directionDesc', 'laneNumber', 'departmentDesc', 'supplierDesc', 'chargePersonName'],
				len = visibleId.length;

			if(oper == 'edit') {
				var tr = $table.find("tbody tr.selected");
				for(var i = len - 1; i >= 0; i--) {
					if(data[visibleId[i]] == undefined) {
						data[visibleId[i]] = '';
					}
				}
				index = tr.data('index');
				$table.bootstrapTable('updateRow', {
					index: index,
					row: data
				});
			} else if(oper == 'add') {
				$table.bootstrapTable('insertRow', {
					index: 0,
					row: data
				});
			} else {
				$table.bootstrapTable('refreshOptions', {
					data: data,
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

//加载下拉框函数
var dropList = {

	//初始化共享数据
	initData: function() {
		$(".typeItem").select2({
			data: typeData,
		});
		$(".unitItem").select2({
			data: unitData,
			minimumResultsForSearch: Infinity
		});

		$('.supplier').select2({
			data: supplierData,
		});
		$('.chargePerson').select2({
			data: personData,
		});
		$('.location').select2({
			data: roadData,
		});
		$('.nice-scroll').on("select2:open", function() {
			$(".select2-results__options").niceScroll({cursorborder:"0",cursorcolor:"RGB(136,218,22)",background:"rgb(207,212,218)",cursoropacitymin:1,
		    	cursorborderradius: "10px",
		    }); 
		});
		return this;
	},

	//保存共享数据
	shareData: function() {

		//获取负责人
		$.ajax({
			type: "get",
			headers: { 'Authorization': userToken },
			url: tempurl + "/user/query",
			dataType: "json",
			cache:false,
			//async: false, //这里必须设为同步请求，否则首次编辑时下拉框赋值不成功
			success: function(data) {
				var j = 0;
				for(var i = 0, len = data.length; i < len; i++) {
					personData[j] = { id: data[i].account, text: data[i].name };
					j++;
				}
				$('.chargePerson').select2({
					data: personData,
				});
			}
		});

		//获取道路
		$.ajax({
			type: "get",
			headers: { 'Authorization': userToken },
			url: tempurl + "/virtual_device/road",
			dataType: "json",
			cache:false,
			headers: { 'Authorization': userToken },
			success: function(data) {
				var j = 0;
				for(var i = 0, len = data.length; i < len; i++) {
					roadData[j] = { id: data[i].uniqueNum, text: data[i].name };
					j++;
				}
				$('.location').select2({
					data: roadData,
				});
			}
		});

		$.ajax({
			url: tempurl + "/general/dictionary?types=" + NCSS + "," + SUPPLIER + "," + UNIT + "," + ASSETSTATUS,
			type: "GET",
			headers: { 'Authorization': userToken },
			dataType: "json",
			async: false,
			cache:false,
			success: function(data) {
				var i = 0,
					len = data.length,
					j = 0,
					v = 0,
					z = 0,
					y = 0;
				for(i; i < len; i++) {
					switch(data[i].type) {
						case NCSS:
							typeData[j++] = { id: data[i].id, text: data[i].description };
							break;
						case UNIT:
							unitData[z++] = { id: data[i].id, text: data[i].description };
							break;
						case SUPPLIER:
							supplierData[v++] = { id: data[i].id, text: data[i].description };
							break;
						case ASSETSTATUS:
							assetStatus[y++] = { id: data[i].id, text: data[i].description };
							break;
					}
				}
			}
		});
		return this;
	},

	//不共享数据（品牌、子类型、型号、规格）
	selfData: function(opt) {

		//先清空select下的选项，再加值
		$('.brand').editableSelect({ filter: false ,effects: 'fade'});
		$('.model').editableSelect({ filter: false ,effects: 'fade'});
		$('.specification').editableSelect({ filter: false ,effects: 'fade' });
		$('.specification').editableSelect('clear');
		$('.brand').editableSelect('clear');
		$('.model').editableSelect('clear');
		$('.subType').find("option").remove();
		$('.location').find("option").remove();

		//根据不同设备类型获得不同的字典信息
		$.ajax({
			url: tempurl + "/general/device_dictionary?device_types=" + opt,
			type: "GET",
			headers: { 'Authorization': userToken },
			dataType: "json",
			async: false,
			cache:false,
			success: function(data) {
				var brandData = [],
					specData = [],
					modelData = [],
					i = 0,
					len = data.length,
					j = 0;
				for(i; i < len; i++) {
					if(data[i].type == SUB_TYPE) {
						Subtype[j] = { id: data[i].id, text: data[i].description };
						j++;
					} else if(data[i].type == BRAND) {
						$('.brand').editableSelect('add', data[i].description);

					} else if(data[i].type == MODEL) {
						$('.model').editableSelect('add', data[i].description);

					} else if(data[i].type == SPECIFICATION) {
						$('.specification').editableSelect('add', data[i].description);
					}
				}
				$('.subType').select2({
					data: Subtype,
					minimumResultsForSearch: Infinity,
				});
			}
		});
		$('.nice-scroll').on("select2:open", function() {
			$(".select2-results__options").niceScroll({cursorborder:"0",cursorcolor:"RGB(136,218,22)",background:"rgb(207,212,218)",cursoropacitymin:1,
		    	cursorborderradius: "10px",
		    }); 
		});
		
		$("ul.es-list").niceScroll({cursorborder:"0",cursorcolor:"RGB(136,218,22)",background:"rgb(207,212,218)",cursoropacitymin:1,
	    	cursorborderradius: "10px",zindex:100000
	    }); 
		return this;
	},

	//需要单独有个保存子类型的函数，供批量导入时使用
	subTypeLoad: function(opt) {
		$.ajax({
			url: tempurl + "/general/device_dictionary?device_types=" + opt,
			type: "GET",
			headers: { 'Authorization': userToken },
			dataType: "json",
			async: false,
			cache:false,
			success: function(data) {
				var j = 0;
				for(var i = 0, len = data.length; i < len; i++) {
					if(data[i].type == SUB_TYPE) {
						Subtype[j] = { id: data[i].id, text: data[i].description };
						j++;
					}
				}
			}
		});
		return this;
	}
}

//按钮操作函数
var oper = {
	add: function() {
		addModal.open();
		return this;
	},
	edit: function() {
		var row = $table.bootstrapTable('getSelections'),
			len = row.length;
		if(len == 0) {
			Alert('<div class="handle-tip"><img src="images/tip.png" alt="提示" />请选取您要编辑的数据！</div>');
		} else if(len > 1) {
			Alert('<div class="handle-tip"><img src="images/tip.png" alt="提示" />一次只能编辑一次数据！</div>');
		} else {
			editWcssModal.open();
			row = row[0];
			var opt = row.type;
			dropList.initData().selfData(opt);			
		
			$("#deviceCode").val(row.deviceCode);
			$("#uniqueNum").val(row.uniqueNum);
			$("#type").val(row.type);
			$("#typeDesc").val(row.typeDesc);
			$("#purposeDesc").val(row.purposeDesc).trigger("change");
			$("#ip").val(row.ip);
			$("#port").val(row.port);
			$("#brand").val(row.brand);
			$("#subType").val(row.subType).trigger("change");
			$("#model").val(row.model);
			$("#specification").val(row.specification);
			$("#assetStatus").val(row.assetStatusDesc);
			$("#communicationState").val(row.communicationState).trigger("change");
			$("#department").val(row.department).trigger("change");
			$("#chargePerson").val(row.chargePerson).trigger("change");
			$("#inputer").val(row.inputer).trigger("change");
			$("#purchaseTime").val(/\d{4}-\d{1,2}-\d{1,2}/g.exec(row.purchaseTime));
			$("#warrantyPeriod").val(/\d{4}-\d{1,2}-\d{1,2}/g.exec(row.warrantyPeriod));
			$("#installTime").val(/\d{4}-\d{1,2}-\d{1,2}/g.exec(row.installTime));
			$("#supplier").val(row.supplier).trigger("change");
			$("#supplierContact").val(row.supplierContact);
			$("#supplierContactInfo").val(row.supplierContactInfo);
			$("#inputTime").val(row.inputTime);
		}
		return this;
	},
	del: function() {
		var nums = $.map($table.bootstrapTable('getSelections'), function(row) {
				return row.uniqueNum;
			}),
			len = nums.length;
		if(len == 0) {
			Alert('<div class="handle-tip"><img src="images/warn.png" alt="警告" />请选取您要删除的数据！</div>');
		} else Confirm({
			msg: '<div class="handle-tip"><img src="images/tip.png" alt="提示" />确认删除数据？</div>',
			onOk: function() {
				var num = nums.join(',');
				var dataSend = JSON.stringify({
					"uniqueNum": num
				});
				//console.log(dataSend); //{"uniqueNum":"number1,number2"}
				$.ajax({
					url: tempurl + "/device",
					type: 'DELETE',
					headers: { 'Authorization': userToken },
					contentType: "application/json;charset=utf-8",
					dataType: "json",
					data: dataSend,
					cache:false,
					success: function(result) {
						console.log(result);
						$table.bootstrapTable('remove', {
							field: 'uniqueNum',
							values: nums
						});
					}
				});
			}
		});
		return this;
	},
	batchadd: function() {
		importModel.open();
		return this;
	},
	selectall: function() {
		$table.bootstrapTable('checkAll');
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
		var row = $.map($table.bootstrapTable('getData', { "useCurrentPage": true }), function(row) {
			return row;
		});
		$.each(row, function() {
			this[0] = !this[0];
		});
		return this;
	}
}

//表单验证函数
var valid = {

	checkTime: function(purchaseTime, installTime, warrantyPeriod, $purchaseTime, $installTime, $warrantyPeriod) {
		var now = Date.parse(new Date()),
			purchaseTime = (purchaseTime == '') ? 0 : Date.parse(purchaseTime),
			installTime = (installTime == '') ? 0 : Date.parse(installTime),
			warrantyPeriod = (warrantyPeriod == '') ? 0 : Date.parse(warrantyPeriod),
			flag = '';
		if(purchaseTime > now) {
			flag = '采购时间应早于当前时间';
			$purchaseTime.addClass('alert-danger').focus();
			$warrantyPeriod.removeClass('alert-danger');
			$installTime.removeClass('alert-danger');
			return flag;
		}
		if(installTime != 0 && (purchaseTime >= installTime)) {
			flag = '安装时间应晚于采购时间';
			$purchaseTime.removeClass('alert-danger');
			$warrantyPeriod.removeClass('alert-danger');
			$installTime.addClass('alert-danger').focus();
			return flag;
		}
		if(installTime != 0 && warrantyPeriod != 0 && (warrantyPeriod <= installTime)) {
			flag = '安装时间应早于质保时间';
			$purchaseTime.removeClass('alert-danger');
			$warrantyPeriod.removeClass('alert-danger');
			$installTime.addClass('alert-danger').focus();
			return flag;
		}
		if(warrantyPeriod != 0 && warrantyPeriod <= now) {
			flag = '质保时间应晚于当前时间';
			$purchaseTime.removeClass('alert-danger');
			$installTime.removeClass('alert-danger');
			$warrantyPeriod.addClass('alert-danger').focus();
			return flag;
		}
		$purchaseTime.removeClass('alert-danger');
		$installTime.removeClass('alert-danger');
		$warrantyPeriod.removeClass('alert-danger');
		return flag;
	},

	inputNum: function(_this) {
		_this.value = _this.value.replace(/[^0-9]/g, '');
	},
}

/***********************表单验证策略对象*********************************************/
var strategies = {
	isNoEmpty: function(dom, value, errmsg) {
		if(value == '') {
			$(dom).addClass('alert-danger').focus();
			return errmsg;
		} else {
			$(dom).removeClass('alert-danger');
		}
	},
	maxLength: function(dom, value, len, errmsg) {
		if(value.length > len) {
			$(dom).addClass('alert-danger').focus();
			return errmsg;
		} else {
			$(dom).removeClass('alert-danger');
		}
	},
	isIp: function(dom, value, errmsg) {
		var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
		if(!reg.test(value)) {
			$(dom).addClass('alert-danger').focus();
			return errmsg;
		} else {
			$(dom).removeClass('alert-danger');
		}
	},
	inputNum: function(_this) {
		_this.value = _this.value.replace(/[^0-9]/g, '');
	},
	isUniIp: function(dom, value, type, errmsg, allIp) {
		var hasIP = null;
		if(!allIp) {
			var dev = {
					"type": type,
					"ip": value
				},
				devArr = [],
				devStr = "";
			devArr.push(dev);
			devStr = JSON.stringify(devArr);
		} else {
			devStr = allIp;
		}
		$.ajax({
			type: "PUT",
			headers: { 'Authorization': userToken },
			url: tempurl + "/device/find_ip/",
			contentType: "application/json;charset=utf-8", //必须有
			dataType: "json", //表示返回值类型，不必须
			data: devStr,
			cache:false,
			async: false, //这里必须设为同步请求，否则isFound赋值不成功
			success: function(data) {
				hasIP = data;
			}
		});
		var len = hasIP.length;
		if(len == 0 && !allIp) {
			$(dom).removeClass('alert-danger');
		} else if(len == 1) {
			$(dom).addClass('alert-danger').focus();
			return errmsg;
		} else {
			return {
				hasIP: hasIP
			};
		}
	},
	isUniNum: function(dom, value, errmsg) {
		var isFound = '';
		$.ajax({
			type: "GET",
			headers: { 'Authorization': userToken },
			url: tempurl + "/device/find/" + value,
			contentType: "application/json;charset=utf-8", //必须有
			dataType: "json", //表示返回值类型，不必须
			async: false, //这里必须设为同步请求，否则isFound赋值不成功
			cache:false,
			success: function(data) {
				isFound = data['msg'];
			},
		});
		if(isFound == "FOUND") {
			$(dom).addClass('alert-danger').focus();
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

//录入设备模态框
var addModal = new Modal({
	title: '设施信息',
	content: $('#ncss_modal').html(),
	width: 604,
	onContentReady: function() {
		dateForm();
		var $form = this.$modal.find('form'),
			$port = $form.find('.port');
		$type = $form.find("select.typeItem");
		dropList.initData().selfData(SERVER);

		//给下拉框赋初始值
		var $brandLi = $form.find('.brand+ul>li:first'),
			$modalLi = $form.find('.model+ul>li:first'),
			$specificationLi = $form.find('.specification+ul>li:first'),
			$specification = $form.find('.specification'),
			$brand = $form.find('.brand'),
			$modal = $form.find('.model');
		$specification.val($specificationLi.text());
		$modal.val($modalLi.text());
		$brand.val($brandLi.text());

		$type.on('change', function() {
			var opt = this.value;
			dropList.selfData(opt);

			//给下拉框赋初始值
			var $brandLi = $form.find('.brand+ul>li:first'),
				$modalLi = $form.find('.model+ul>li:first'),
				$specificationLi = $form.find('.specification+ul>li:first'),
				$specification = $form.find('.specification'),
				$brand = $form.find('.brand'),
				$modal = $form.find('.model');
			$form.find('input[disabled!=disabled]').val('');
			$modal.val($modalLi.text());
			$specification.val($specificationLi.text());
			$brand.val($brandLi.text());
		});
	},
	buttons: [{
		html: '<button type="button" class="btn btn-sm  btn-ok">保存</button>',
		selector: '.btn-ok',
		callback: function() {
			var $form = this.$modal.find('form'),
				form = $form[0],
				data = $form.serializeArray(),
				$alert = $form.find(".alert"),
				$errorMsg = $alert.find('.error_msg'),
				$purposeDesc = $(form.purposeDesc),
				$purchaseTime = $(form.purchaseTime),
				$installTime = $(form.installTime),
				$warrantyPeriod = $(form.warrantyPeriod),
				postData = {};
			data.forEach(function(obj) {
				postData[obj.name] = obj.value;
			});
			flag = valid.checkTime(postData.purchaseTime, postData.installTime, postData.warrantyPeriod, $purchaseTime, $installTime, $warrantyPeriod);
			if(flag != '') {
				$alert.show();
				$errorMsg.text(flag);
				return false;
			} else {
				$alert.hide();
			}
			/***********************客户端调用代码*******************************************/
			var validataFunc = function() {
				var validator = new Validator();

				validator.add(form.deviceCode, [{
					strategy: 'isNoEmpty',
					errorMsg: '编号不能为空！'
				}, {
					strategy: 'isUniNum',
					errorMsg: '此编号已经存在，请修改！'
				}]);
				validator.add(form.purposeDesc, [{
					strategy: 'isNoEmpty',
					errorMsg: '描述名不能为空！'
				}]);
				validator.add(form.ip, [{
					strategy: 'isNoEmpty',
					errorMsg: 'IP不能为空！'
				}, {
					strategy: 'isIp',
					errorMsg: 'ip地址格式错误，请重新输入！'
				}, {
					strategy: 'isUniIp:' + form.type.value,
					errorMsg: '此ip地址该类型中已存在，请重新输入！'
				}]);
				validator.add(form.port, [{
					strategy: 'isNoEmpty',
					errorMsg: '端口号不能为空！'
				}, {
					strategy: 'maxLength:8',
					errorMsg: '端口号不能超过8位！'
				}]);

				var errorMsg = validator.start();
				return errorMsg;
			}
			var errorMsg = validataFunc();
			if(errorMsg) {
				$alert.show();
				$errorMsg.html(errorMsg);
				return false;
			}
			_post();

			function _post() {
				var dataSend = JSON.stringify(postData);
				var opt = postData.deviceCode;
				console.log(postData);
				$.ajax({
					type: "POST",
					headers: { 'Authorization': userToken },
					url: tempurl + "/device",
					cache:false,
					contentType: "application/json;charset=utf-8", //必须有
					dataType: "json", //表示返回值类型，不必须
					data: dataSend,
					success: function(jsonResult) {
						console.log(jsonResult);
						$alert.hide();
						showNcss(opt, SUPPLIER, 'add');
						$form[0].reset();
						$form.find("#add_type").val(SERVER).trigger("change");
						$form.find(".unitItem").val(UNIT1).trigger("change");
						$form.find(".chargePerson").val(CHARGPERSON1).trigger("change");
						$form.find(".supplier").val(SUPPLIER1).trigger("change");
					},
					error: function(msg) {
						Alert('<div class="handle-tip"><img src="images/warn.png" alt="提示" />录入失败，请重试！</div>');
					}
				});
			}
		}
	}, {
		html: '<button type="button" class="btn btn-sm  btn-cancel">取消</button>',
		selector: '.btn-cancel',
		callback: function() {
			//点击取消按钮的回调
			var $form = this.$modal.find('form');
			$form[0].reset();
			$form.find(".alert").hide();
			$form.find('*').removeClass('alert-danger');
			$form.find("#add_type").val(SERVER).trigger("change");
			$form.find(".unitItem").val(UNIT1).trigger("change");
			$form.find(".chargePerson").val(CHARGPERSON1).trigger("change");
			$form.find(".supplier").val(SUPPLIER1).trigger("change");
		}
	}],
});

//导入设备模态框
var importModel = new Modal({
	title: '导入数据',
	content: $('#import_modal').html(),
	width: 600,
	onContentReady: function() {
		$(".file-error-message").hide();
		$("#input-24").fileinput({
			language: 'zh',
			showUpload: true,
			overwriteInitial: true,
			removeClass: "btn btn-danger",
			allowedFileExtensions: ["csv"],
			browseClass: "btn btn-primary",
			allowedPreviewTypes: null,
			showPreview: false,
			showUpload: false,
			elErrorContainer: "#errorBlock"
		});
	},
	buttons: [{
		html: '<button type="button" class="btn btn-sm btn-ok">导入</button>',
		selector: '.btn-ok',
		callback: function() {
			var $form = this.$modal.find("form"),
				uploadfile = $form.find("#input-24")[0],
				$alert = $form.find(".alert"),
				$errorMsg = $alert.find('.error_msg'),
				isfound = 0;

			function foundnums(dataSend) {
				//检测编号是否已经存在，若存在提示用户
				var hasNum = [],
					numlen = 0,
					tip = '';
				$.ajax({
					type: "PUT",
					headers: { 'Authorization': userToken },
					url: tempurl + "/device/find/batch",
					contentType: "application/json;charset=utf-8", //必须有
					dataType: "json", //表示返回值类型，不必须
					async: false, //这里必须设为同步请求，否则isFound赋值不成功
					data: dataSend,
					cache:false,
					success: function(data) {
						numlen = data.length;
						if(numlen > 0) {
							for(var i = 0; i < numlen; i++) {
								hasNum.push(data[i].deviceCode)
							}
							tip = hasNum.join(',');
						}
					},
					error: function() {}
				});
				if(numlen > 0) {
					isfound = 1;
					$alert.show();
					$errorMsg.text('录入失败，其中设备编号' + tip + '已经存在！请修改后再导入。');
				}
			}

			//映射字典字段
			function findKey(key, arr) {
				for(var i = arr.length - 1; i >= 0; --i) {
					if(key == arr[i].text) {
						return arr[i].id;
					}
				}
			}

			if(uploadfile.files.length == 1) {
				var f = uploadfile.files[0];
				$(".file-error-message").hide();
				$alert.hide();
				var reader = new FileReader();
				reader.readAsText(f, 'gb2312');
				reader.onload = function() {
					var text = reader.result,
						arr = text.split('\n'),
						jsonObj = [],
						jsonobjLen = 0,
						strJson = '',
						len = 0,
						nums = [],
						errType = [],
						errTypeDesc = [],
						errIp = [],
						errPort = [],
						errPurpose = [],
						errNum = [],
						errText = '',
						reg = /^\d{1,8}$/,
						j = 0,
						devType = typeData,
						devSupplier = supplierData,
						devPerson = personData,
						devArr = [],
						ipArr = [],
						devStr = "",
						arr_temp_id = arr.slice(1, 2);

					//获取当前时间
					var date = new Date(),
						year = date.getFullYear(),
						month = date.getMonth() + 1,
						day = date.getDate(),
						hour = date.getHours(),
						minute = date.getMinutes(),
						second = date.getSeconds(),
						nowtime = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;

					arr_temp_id = arr_temp_id[0].replace(/[\r\n]$/, '').split(',');
					//console.log(arr_temp_id)
					arr = arr.slice(2);
					len = arr.length;
					if(arr[len - 1] == '') {
						len = len - 1;
					}
					for(var i = 0; i < len; i++) {
						if(arr[i] != '') { //去掉空行
							arr_temp = arr[i].replace(/[\r\n]$/, '').split(',');
						}
						var p = {};

						for(var u = 0, len1 = arr_temp_id.length; u < len1; u++) {
							p[arr_temp_id[u]] = arr_temp[u];
						}

						//验证字段
						if(!p.deviceCode) {
							errNum.push(i + 3);
							continue;
						}
						if(!p.purposeDesc) {
							errPurpose.push(p.deviceCode);
							continue;
						}
						if(!p.typeDesc) {
							errTypeDesc.push(p.deviceCode);
							continue;
						}
						if(!nums.indexOf(p.deviceCode)) {
							$alert.show();
							$errorMsg.html('<span>导入的数据中存在重复编号，请修改后重试！</span>');
							return false;
						} else {
							$alert.hide();
						}
						nums.push(p.deviceCode);

						p.type = findKey(p.typeDesc, devType);
						//验证type字段成功映射
						if(!p.type) {
							errType.push(p.deviceCode);
							continue;
						}

						//验证ip和port格式
						if(strategies.isIp(null, p.ip, 'ip格式错误')) {
							errIp.push(p.deviceCode);
							continue;
						}

						//保存所有的IP信息
						var dev = {
							"type": p.type,
							"ip": p.ip
						};
						devArr.push(dev);

						if(!reg.test(p.port)) {
							errPort.push(p.deviceCode);
							continue;
						}

						p.department = findKey(p.departmentDesc, unitData);
						p.departmentDesc = (p.department) ? p.departmentDesc : undefinedText;

						p.supplier = findKey(p.supplierDesc, devSupplier);
						p.supplierDesc = (p.supplier) ? p.supplierDesc : undefinedText;

						p.chargePerson = findKey(p.chargePersonName, devPerson);
						p.chargePersonName = (p.chargePerson) ? p.chargePersonName : undefinedText;

						dropList.subTypeLoad(p.type);
						p.subType = findKey(p.subTypeDesc, Subtype);
						p.subTypeDesc = (p.subType) ? p.subTypeDesc : undefinedText;

						p.assetStatus = STATUS_IDLE;
						p.assetStatusDesc = '闲置';
						p.inputTime = nowtime;
						jsonObj[j] = p;
						p = null;
						j++;
					}

					if(errNum.length) {
						errText += '<li>第' + errNum.join(', ') + '行数据缺少设备编号；</li>';
					}
					if(errPurpose.length) {
						errText += '<li>编号为' + errPurpose.join(', ') + '数据缺少设备描述名；</li>';
					}
					if(errTypeDesc.length) {
						errText += '<li>编号为' + errTypeDesc.join(', ') + '数据缺少设备类型；</li>';
					}
					if(errType.length) {
						errText += '<li>编号为' + errType.join(', ') + '数据不存在此设备类型，请确认；</li>';
					}
					if(errIp.length) {
						errText += '<li>编号为' + errIp.join(', ') + '数据IP格式错误；</li>';
					}
					if(errPort.length) {
						errText += '<li>编号为' + errPort.join(', ') + '数据端口号不是8位以内的正数；</li>';
					}

					jsonobjLen = jsonObj.length;
					if(!jsonobjLen) {
						$alert.show();
						var txt = '<span><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>数据导入失败，请修改数据后重试！</span><ol class="error-tip">' + errText + '</ol>';
						$form.find('.file-error').html(txt);
						return false;
					}

					//检测编号是否重复
					var numStr = nums.join(',');
					var dataSend = JSON.stringify({
						"deviceCode": numStr,
					});
					foundnums(dataSend);
					if(isfound) {
						return false;
					}

					//检测IP是否重复
					devStr = JSON.stringify(devArr);
					ipArr = strategies.isUniIp(null, null, null, null, devStr);
					var ipLen = ipArr.length;
					console.log(JSON.stringify(ipArr));
					if(ipLen > 0) {
						for(var x = ipLen - 1; x >= 0; x--) {
							errText += '<li>' + ipArr[x].typeDesc + '类型的IP “' + ipArr[x].ip + '” 在数据库中已存在；</li>';
						}
						$alert.show();
						var txt = '<span><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>数据导入失败，请修改数据后重试！</span><ol>' + errText + '</ol>';
						$form.find('.file-error').html(txt);

						return false;
					}

					//当编号和IP无误时提交请求
					strJson = JSON.stringify(jsonObj);
					$.ajax({
						type: "POST",
						headers: { 'Authorization': userToken },
						url: tempurl + "/device/batch",
						contentType: "application/json;charset=utf-8",
						dataType: "json",
						data: strJson,
						cache:false,
						success: function(jsonResult) {
							//showNcss(NCSS, SUPPLIER);
							$table.bootstrapTable('refreshOptions', {
								data: jsonObj,
							});
							$alert.hide();
							$form[0].reset();
							$('#close_btn').click();
							if(errText != '') {
								Alert({
									"width": "600px",
									"msg": '<div class="error-tip"><h5><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>' +
										jsonobjLen + '条数据导入成功，导入失败数据提示：</h5><ul>' + errText + '</ul></div>'
								});
							} else {
								Alert({ "width": "440px", "msg": '<div class="success-tip"><img src="images/tip.png" alt="提示" />数据已成功导入!' });
							}
						},
						error: function(msg) {
							var err = msg.responseJSON;
							for(var x = err.length - 1; x >= 0; x--) {
								errText += '<li>' + err[x].typeDesc + '类型的IP “' + err[x].ip + '” 在导入数据中有重复；</li>';
							}
							$alert.show();
							var txt = '<span><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>数据导入失败，请修改数据后重试！</span><ol>' + errText + '</ol>';
							$form.find('.file-error').html(txt);
						}
					});

				};
				reader.onerror = function(e) {
					console.log("error", e);
				}
				return false;
			} else {
				$alert.show();
				$errorMsg.text("您未选择任何文件！");
				return false;
			}
		}
	}, {
		html: '<button type="button" id="close_btn" class="btn btn-sm  btn-cancel">取消</button>',
		selector: '.btn-cancel',
		callback: function() {
			this.$modal.find(".file-error-message").hide();
			this.$modal.find(".alert").hide();
			this.$modal.find("form")[0].reset();
		}
	}],
});

//编辑设备模态框
var editWcssModal = new Modal({ //编辑内场设施
	title: '设施信息',
	content: $('#editncss_modal').html(),
	width: 604,
	marginTop: 250,
	onContentReady: function() {
		dateForm();
	},
	buttons: [{
		html: '<button type="button" class="btn btn-sm btn-ok">保存</button>',
		selector: '.btn-ok',
		callback: function() {
			var $form = this.$modal.find('form'),
				form = $form[0],
				data = $form.serializeArray(),
				$alert = $form.find(".alert"),
				$errorMsg = $alert.find('.error_msg'),
				$purposeDesc = $(form.purposeDesc),
				$purchaseTime = $(form.purchaseTime),
				$installTime = $(form.installTime),
				$warrantyPeriod = $(form.warrantyPeriod),
				postData = {};
			var originIP = $.map($table.bootstrapTable('getSelections'), function(row) {
				return row.ip;
			});
			data.forEach(function(obj) {
				postData[obj.name] = obj.value;
			});
			flag = valid.checkTime(postData.purchaseTime, postData.installTime, postData.warrantyPeriod, $purchaseTime, $installTime, $warrantyPeriod);
			if(flag != '') {
				$alert.show();
				$errorMsg.text(flag);
				return false;
			} else {
				$alert.hide();
				$purposeDesc.removeClass('alert-danger');
			}
			var validataFunc = function() {
				var validator = new Validator();

				validator.add(form.purposeDesc, [{
					strategy: 'isNoEmpty',
					errorMsg: '描述名不能为空！'
				}]);
				if(!$(form.ip).prop("disabled")) {
					validator.add(form.ip, [{
						strategy: 'isNoEmpty',
						errorMsg: 'IP不能为空！'
					}, {
						strategy: 'isIp',
						errorMsg: 'ip地址格式错误，请重新输入！'
					}, ]);
					if(originIP[0] != postData.ip) {
						validator.add(form.ip, [{
							strategy: 'isUniIp:' + form.type.value,
							errorMsg: '此ip地址该类型中已存在，请重新输入！'
						}]);
					}
				}
				if(!$(form.port).prop("disabled")) {
					validator.add(form.port, [{
						strategy: 'isNoEmpty',
						errorMsg: '端口号不能为空！'
					}, {
						strategy: 'maxLength:8',
						errorMsg: '端口号不能超过8位！'
					}]);
				}

				var errorMsg = validator.start();
				return errorMsg;
			}
			var errorMsg = validataFunc();
			if(errorMsg) {
				$alert.show();
				$errorMsg.html(errorMsg);
				return false;
			}

			_post();

			function _post() {
				var dataSend = JSON.stringify(postData),
					opt = postData.uniqueNum;
				$.ajax({
					type: "PUT",
					headers: { 'Authorization': userToken },
					url: tempurl + "/device",
					headers: { 'Authorization': userToken },
					contentType: "application/json;charset=utf-8",
					dataType: "json",
					data: dataSend,
					cache:false,
					success: function(jsonResult) {
						console.log(jsonResult);
						showNcss(opt, SUPPLIER, 'edit');
						$form[0].reset();
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
		}
	}],
});

//查询设备
$('#typeSearch').on('change', function() {
	var devType = this.value;
	var supplier = $('#supplierSearch').val();
	showNcss(devType, supplier);
});
$('#supplierSearch').on('change', function() {
	var supplier = this.value;
	var devType = $('#typeSearch').val();
	showNcss(devType, supplier);
});

//录入设备
$("#btn_add").click(function() {
	oper.add();
});

//编辑设备
$("#btn_edit").click(function() {
	oper.edit();
});

//导入设备
$('#btn_import').click(function() {
	oper.batchadd();
});

$('#bt_selectall').click(function() {
	oper.selectall();
});

$('#bt_unselectall').click(function() {
	oper.inverse();
});

//删除设备
$('#btn_delete').click(function() {
	oper.del();
});

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
$(document).ready(function() {
	var $table = $("#table");
	$("html").niceScroll({cursorborder:"0",cursorcolor:"rgb(114,117,119)",background:"rgb(207,212,218)",cursoropacitymin:1}); 
	$("#equipmentMgr").addClass('active');
	dropList.shareData().initData();
	//初始化表格
	$table.bootstrapTable({
		data: '',
		cache: false,
		pagination: true,
		sortName: "inputTime",
		sortOrder: "desc",
		pageSize: 15,
		strictSearch: true,
		uniqueId: "deviceCode",
		paginationHAlign: "left",
		paginationPreText: "<<",
		paginationNextText: ">>",
		undefinedText: undefinedText,
		formatNoMatches: function() {
			return "没有匹配的数据"
		},
		columns: [{
			checkbox: true,
			width: '55px',
			title: '序号'
		}, {
			field: 'deviceCode',
			title: '编号',
			sortable: true,
		}, {
			field: 'uniqueNum',
			title: '内部编号',
			visible: false
		}, {
			field: 'type',
			title: '类型字段',
			visible: false
		}, {
			field: 'purposeDesc',
			title: '描述名',
			//sortable: true,
			width: '100',
		}, {
			field: 'typeDesc',
			title: '设备类型',
			sortable: true,
		}, {
			field: 'ip',
			title: 'IP',
			sortable: true,
			width: '120',
		}, {
			field: 'port',
			title: '端口号',
			//sortable: true,
		}, {
			field: 'brand',
			title: '品牌',
			//sortable: true,
		}, {
			field: 'subType',
			title: '子类型',
			visible: false
		}, {
			field: 'subTypeDesc',
			title: '子类型',
			//sortable: true,
		}, {
			field: 'model',
			title: '型号',
			sortable: true,
		}, {
			field: 'specification',
			title: '规格',
			sortable: true,
		}, {
			field: 'assetStatus',
			title: '资产状态',
			visible: false
		}, {
			field: 'assetStatusDesc',
			title: '资产状态',
			sortable: true,
		}, {
			field: 'communicationState',
			title: '通信状态',
			sortable: true,
		}, {
			field: 'department',
			title: '所属部门',
			visible: false
		}, {
			field: 'departmentDesc',
			title: '所属部门',
			sortable: true,
		}, {
			field: 'supplier',
			title: '供货商',
			visible: false
		}, {
			field: 'supplierDesc',
			title: '供货商',
			sortable: true,
		}, {
			field: 'chargePerson',
			title: '负责人账号',
			visible: false
		}, {
			field: 'chargePersonName',
			title: '负责人',
			//sortable: true,
		}, {
			field: 'inputerName',
			title: '录入人',
			sortable: true,
			//visible: false
		}, {
			field: 'inputTime',
			title: '入库时间',
			sortable: true,
			width: '200'
		}, {
			field: 'purchaseTime',
			title: '采购时间',
			formatter: function(value, row, index) {
				return /\d{4}-\d{1,2}-\d{1,2}/g.exec(value);
			},
			visible: false
		}, {
			field: 'warrantyPeriod',
			title: '质保时间',
			formatter: function(value, row, index) {
				return /\d{4}-\d{1,2}-\d{1,2}/g.exec(value);
			},
			visible: false
		}, {
			field: 'installTime',
			title: '安装时间',
			formatter: function(value, row, index) {
				return /\d{4}-\d{1,2}-\d{1,2}/g.exec(value);
			},
			visible: false
		}, {
			field: 'specification',
			title: '规格',
			visible: false
		}, {
			field: 'supplierContact',
			title: '供货商联系人',
			visible: false
		}, {
			field: 'supplierContactInfo',
			title: '供货商联系电话',
			visible: false
		}, ]
	});
	showNcss(NCSS, SUPPLIER);
});