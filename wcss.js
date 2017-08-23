/*
 * @author：wxf
 */
var $table = $("#table"),
	personData = [],
	roadData = [],
	crossData = [],
	typeData = [],
	unitData = [],
	directionData = [],
	laneData = [],
	supplierData = [],
	Subtype = [],
	laneNumber = [],
	assetStatus = [],
	camerData = [],
	instance = null;
const WCDEV = '50',
	CAMERA = '51', //相机
	VIDEO_DETECTOR = '52', //视频检测器
	SIGNAL_CONTROLLER = '53', //信号控制器
	LAMP_GROUP = '54', //信号灯
	LAMP_POLE = '55', //灯杆
	OPTIC_CABLE = '56', //光缆
	MESSAGE_SIGN = '57', //诱导板
	ROAD = '000', //道路
	ROAD1 = '001', //道路1
	SUPPLIER = '550', //供货商
	SUPPLIER1 = '551', //供货商1
	UNIT = '300', //部门
	UNIT1 = '301', //部门1
	DIRECTION = '350', //方向
	DIRECTION1 = '351', //方向1
	ASSETSTATUS = '100', //资产状态
	STATUS_IDLE = '105', //闲置
	LANE = '500', //车道
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

//查询外场设施
function showWcss(opt, supplier, road, oper) {
	//显示外场设施
	var url = tempurl + "/device/outside_device",
		wcdev = WCDEV,
		sup = SUPPLIER;
	if(oper == 'add' || oper == 'edit') {
		url = tempurl + "/device/" + opt;
	} else if(road == ROAD || road == undefined) {
		if(opt == wcdev && supplier == sup) {
			url = url;
		} else if(opt == wcdev && supplier > sup) {
			url = url + "/query?supplier=" + supplier;
		} else if(opt > wcdev && supplier == sup) {
			url = url + "/query?type=" + opt;
		} else if(opt > wcdev && supplier > sup) {
			url = url + "/query?type=" + opt + "&supplier=" + supplier;
		}
	} else {
		if(opt == wcdev && supplier == sup) {
			url = url + "/query?road=" + road;
		} else if(opt == wcdev && supplier > sup) {
			url = url + "/query?supplier=" + supplier + "&road=" + road;
		} else if(opt > wcdev && supplier == sup) {
			url = url + "/query?type=" + opt + "&road=" + road;
		} else if(opt > wcdev && supplier > sup) {
			url = url + "/query?type=" + opt + "&supplier=" + supplier + "&road=" + road;
		}
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
					//console.log('字段：' + visibleId[i] + ';' + data[visibleId[i]]);
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

//按钮操作函数
var oper = {
	control: function() {
		var row = $.map($table.bootstrapTable('getSelections'), function(row) {
			return row;
		});
		len = row.length;
		if(len == 1) {
			if(row[0].type == VIDEO_DETECTOR || row[0].type == MESSAGE_SIGN) {
				$('#btn_relevance').prop("disabled", false);
			}
		} else {
			$('#btn_relevance').prop("disabled", true);
		}
	},
	add: function() {
		addModal.open();
	},
	edit: function() {
		var num = $.map($table.bootstrapTable('getSelections'), function(row) {
			return row.deviceCode;
		});
		if(num == "") {
			Alert('<div class="handle-tip"><img src="images/tip.png" alt="提示" />请选取您要编辑的设施</div>');
		} else if(num.length > 1) {
			Alert('<div class="handle-tip"><img src="images/warn.png" alt="提示" />注意一次只能编辑一个设施！请重新选择</div>');
		} else {
			editWcssModal.open();
			var row = $.map($table.bootstrapTable('getSelections'), function(row) {
				return row;
			});
			row = row[0];
			var opt = row.type;
			if(opt == LAMP_GROUP || opt == LAMP_POLE || opt == OPTIC_CABLE) {
				$('.ip').attr("disabled", "disabled");
				$('.port').attr("disabled", "disabled");
				$('.longitude').attr("disabled", "disabled");
				$('.latitude').attr("disabled", "disabled");
			} else {
				$('.ip').removeAttr("disabled");
				$('.port').removeAttr("disabled");
				$('.longitude').removeAttr("disabled");
				$('.latitude').removeAttr("disabled");
			}
			dropList.initData().selfData(opt);
			var selectlane = [];
			if(row.laneNumber) {
				selectlane = row.laneNumber.split(',');
			}
			$("#deviceCode").val(row.deviceCode);
			$("#uniqueNum").val(row.uniqueNum);
			$("#type").val(row.type);
			$("#purposeDesc").val(row.purposeDesc);
			$("#typeDesc").val(row.typeDesc);
			$("#ip").val(row.ip);
			$("#port").val(row.port);
			$("#brand").val(row.brand);
			$("#subType").val(row.subType).trigger("change");
			$("#model").val(row.model);
			$("#specification").val(row.specification);
			$("#assetStatus").val(row.assetStatusDesc);
			$("#department").val(row.department).trigger("change");
			$("#chargePerson").val(row.chargePerson).trigger("change");
			$("#purchaseTime").val(/\d{4}-\d{1,2}-\d{1,2}/g.exec(row.purchaseTime));
			$("#warrantyPeriod").val(/\d{4}-\d{1,2}-\d{1,2}/g.exec(row.warrantyPeriod));
			$("#installTime").val(/\d{4}-\d{1,2}-\d{1,2}/g.exec(row.installTime));
			$("#supplier").val(row.supplier).trigger("change");
			$("#supplierContact").val(row.supplierContact);
			$("#supplierContactInfo").val(row.supplierContactInfo);
			$("#latitude").val(row.latitude);
			$("#longitude").val(row.longitude);
			$("#direction").val(row.direction).trigger("change");
			$("#road").val(row.roadNumber).trigger("change");
			$("#cross").val(row.crossNumber).trigger("change");
			$("#laneNumber").selectpicker('val', selectlane);
			$("#inputTime").val(row.inputTime);
			if(row.ptzControl == 1) {
				$('#yes').prop("checked", true);
			} else if(row.ptzControl == 0) {
				$('#no').prop("checked", true);
			}
		}
	},
	del: function() {
		var row = $table.bootstrapTable('getSelections'),
			nums = $.map($table.bootstrapTable('getSelections'), function(row) {
				return row.deviceCode;
			}),
			len = row.length;
		if(!len) {
			Alert('<div class="handle-tip"><img src="images/warn.png" alt="提示" />请选取您要删除的数据！</div>');
		} else Confirm({
			msg: '<div class="handle-tip"><img src="images/tip.png" alt="提示" />确认删除此数据？</div>',
			onOk: function() {
				var num = nums.join(',');
				var dataSend = JSON.stringify({
					"uniqueNum": num
				});
				$.ajax({
					url: tempurl + "/device",
					headers: { 'Authorization': userToken },
					type: 'DELETE',
					cache:false,
					contentType: "application/json;charset=utf-8",
					dataType: "json",
					data: dataSend,
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
	},
	batchadd: function() {
		importModel.open();
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
		row = $.map($table.bootstrapTable('getSelections'), function(row) {
			return row;
		});
		len = row.length;
		if(len == 1) {
			if(row[0].type == VIDEO_DETECTOR || row[0].type == VIDEO_DETECTOR) {
				$('#btn_relevance').prop("disabled", false);
			}
		} else {
			$('#btn_relevance').prop("disabled", true);
		}
	},
	relevance: function() {
		var row = $table.bootstrapTable('getSelections'),
			len = row.length;
		if(len == 0) {
			Alert('<div class="handle-tip"><img src="images/tip.png" alt="提示" />请选取您要关联的设施！</div>');
		} else {
			relevanceModal.open();
			$("#camerContainer").niceScroll({cursorborder:"0",cursorcolor:"RGB(136,218,22)",background:"rgb(207,212,218)",cursoropacitymin:1,
				cursorborderradius: "10px",zindex:100000
			}); 
			$('#relevance .nicescroll-rails-vr').css('top','351px!important');
			$('#relevance .nicescroll-rails-hr').css('top','584px!important');
			var $selectall = $("#selectall"),
				$unselectall = $selectall.next();
			$('#relevDev').text(row[0].typeDesc + "(编号: " + row[0].deviceCode + ")");
			//获取所有的的相机列表
			dropList.loadcamer();
			$.jstree.destroy("#camerContainer");
			if(row[0].type == MESSAGE_SIGN) {
				$selectall.hide().next().hide();
				$('#camerContainer').jstree({
					'core': {
						'data': camerData,
						'multiple': false,
						'themes': {
							'dots': false,
							'icons': true,
						},
					},
					'search': { 'show_only_matches': true },
					'plugins': ['wholerow', 'search', 'checkbox']
				});
				var instance = $('#camerContainer').jstree(true);
			} else {
				$selectall.show().next().show();
				$('#camerContainer').jstree({
					'core': {
						'data': camerData,
						'multiple': true,
						'themes': {
							'dots': false,
							'icons': true,
						},
					},
					'search': { 'show_only_matches': true },
					'plugins': ['wholerow', 'search', 'checkbox']
				});
				var instance = $('#camerContainer').jstree(true);
				//若不先解绑click事件，会出现按钮无效bug,
				$selectall.unbind('click').click(function() {
					instance.select_all();
				});

				$unselectall.unbind('click').click(function() {
					for(var i = 0, len = camerData.length; i < len; i++) {
						if(instance.is_selected(camerData[i])) {
							instance.deselect_node(camerData[i]);
						} else {
							instance.select_node(camerData[i]);
						}
					}
				});
			}
			$(".alert").hide();
			$('#camerContainer').bind("ready.jstree", function(obj, e) {
				instance.deselect_all();
				dropList.dorelate(row[0].uniqueNum);
			});	
					
		}
	}
}

//加载数据函数
var dropList = {

	//初始化共享数据
	initData: function() {
		$('.laneNumber').find("option").remove();
		$(".typeItem").select2({
			data: typeData,
		});
		$(".unitItem").select2({
			data: unitData,
			minimumResultsForSearch: Infinity
		});
		$('.direction').select2({
			data: directionData,
			minimumResultsForSearch: Infinity,
		});

		for(var i = 0, len = laneNumber.length; i < len; i++) {
			$('.laneNumber').append(" <option value=\"" + laneNumber[i] + "\">" + laneNumber[i] + "</option>");
		}
		$('.laneNumber').selectpicker('refresh');

		$('.supplier').select2({
			data: supplierData,
			minimumResultsForSearch: Infinity,
		});
		$('.chargePerson').select2({
			placeholder: "请输入",
			data: personData,
		});
		$('.road').select2({
			data: roadData,
			minimumResultsForSearch: Infinity,
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
		//获取负责人下拉框数据
		$.ajax({
			type: "get",
			headers: { 'Authorization': userToken },
			url: tempurl + "/user/query",
			dataType: "json",
			cache:false,
			success: function(data) {
				var j = 0;
				for(var i = 0, len = data.length; i < len; i++) {
					personData[j] = { id: data[i].account, text: data[i].name };
					j++;
				}
				$('.chargePerson').select2({
					placeholder: "请输入",
					data: personData,
				});
			}
		});

		//获取道路下拉框数据
		$.ajax({
			type: "get",
			headers: { 'Authorization': userToken },
			url: tempurl + "/virtual_device/road",
			dataType: "json",
			cache:false,
			success: function(data) {
				var j = 0;
				for(var i = 0, len = data.length; i < len; i++) {
					roadData[j++] = { id: data[i].uniqueNum, text: data[i].name };
				}
				$('.road').select2({
					data: roadData,
					minimumResultsForSearch: Infinity,
				});
			}
		});
		$.ajax({
			url: tempurl + "/general/dictionary?types=" + WCDEV + "," + UNIT + "," + DIRECTION + "," + LANE + "," + SUPPLIER + "," + UNIT + "," + ASSETSTATUS,
			type: "GET",
			headers: { 'Authorization': userToken },
			dataType: "json",
			async: false,
			cache:false,
			success: function(data) {
				var j = 0,
					v = 0,
					x = 0,
					z = 0,
					y = 0;
				for(var i = 0, len = data.length; i < len; i++) {
					switch(data[i].type) {
						case WCDEV:
							typeData[j++] = { id: data[i].id, text: data[i].description };
							break;
						case UNIT:
							unitData[z++] = { id: data[i].id, text: data[i].description };
							break;
						case DIRECTION:
							directionData[y++] = { id: data[i].id, text: data[i].description };
							break;
						case LANE:
							laneNumber.push(data[i].description);
							break;
						case SUPPLIER:
							supplierData[v++] = { id: data[i].id, text: data[i].description };
							break;
						case ASSETSTATUS:
							assetStatus[x++] = { id: data[i].id, text: data[i].description };
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
		Subtype = [];
		$('.brand').editableSelect({ filter: false ,effects: 'fade'});
		$('.model').editableSelect({ filter: false ,effects: 'fade'});
		$('.specification').editableSelect({ filter: false ,effects: 'fade' });
		if(opt == CAMERA) {
			$('.ptzControl').prop("disabled", false);
		} else {
			$('.ptzControl').prop("disabled", true);
		}
		if(opt == CAMERA || opt == VIDEO_DETECTOR || opt == SIGNAL_CONTROLLER || opt == MESSAGE_SIGN) {
			$('.ip').prop("disabled", false);
			$('.port').prop("disabled", false);
			$('.longitude').prop("disabled", false);
			$('.latitude').prop("disabled", false);
			$('.dynamic').show();
		} else {
			$('.ip').prop("disabled", true);
			$('.port').prop("disabled", true);
			$('.longitude').prop("disabled", true);
			$('.latitude').prop("disabled", true);
			$('.dynamic').hide();
		}
		//先清空select下的选项，再动态加值
		$('.specification').editableSelect('clear');
		$('.brand').editableSelect('clear');
		$('.model').editableSelect('clear');
		$('.subType').find("option").remove();
		$('.cross').find("option").remove();
		$('.cross').select2({
			minimumResultsForSearch: Infinity,
		});
		if(opt == VIDEO_DETECTOR || opt == SIGNAL_CONTROLLER || opt == LAMP_GROUP) {

			//信号机、信号灯、视频检测器显示路口信息,路口信息需要在选择道路的基础上加载对应的路口
			$('.cross').prop("disabled", false);
			var $road = $("#add_road"),
				roadNum = $("#add_road").val() || $("#road").val();
			dropList.crossLoad(roadNum);

			$road.on('change', function() {
				roadNum = this.value;
				$('.cross').find("option").remove();
				dropList.crossLoad(roadNum);
			});

		}
		if(opt == CAMERA || opt == LAMP_POLE || opt == OPTIC_CABLE || opt == MESSAGE_SIGN) {
			$('.cross').prop("disabled", true);
		}
		//根据不同设备类型获得不同的字典信息
		$.ajax({
			url: tempurl + "/general/device_dictionary?device_types=" + opt,
			type: "GET",
			dataType: "json",
			headers: { 'Authorization': userToken },
			async: false,
			cache:false,
			success: function(data) {
				var brandData = [],
					specData = [],
					modelData = [],
					j = 0;
				for(var i = 0, len = data.length; i < len; i++) {
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
		$("ul.dropdown-menu.inner").niceScroll({cursorborder:"0",cursorcolor:"RGB(136,218,22)",background:"rgb(207,212,218)",cursoropacitymin:1,
	    	cursorborderradius: "10px",
	    }); 
		$("ul.es-list").niceScroll({cursorborder:"0",cursorcolor:"RGB(136,218,22)",background:"rgb(207,212,218)",cursoropacitymin:1,
	    	cursorborderradius: "10px",zIndex:100000
	    }); 
		return this;
	},

	//加载不同道路的路口
	crossLoad: function(roadNum) {
		crossData = [];
		$.ajax({
			type: "GET",
			url: tempurl + "/virtual_device/cross?roadNumber=" + roadNum,
			headers: { 'Authorization': userToken },
			dataType: "json",
			async: false,
			cache:false,
			success: function(data) {
				var j = 0;
				for(var i = 0, len = data.length; i < len; i++) {
					crossData[j] = { id: data[i].uniqueNum, text: data[i].name };
					j++;
				}
				$('.cross').select2({
					data: crossData,
					minimumResultsForSearch: Infinity,
				});
			}
		});
		return this;
	},

	//需要单独有个保存子类型的函数，供批量导入时使用
	subTypeLoad: function(opt) {
		Subtype = [];
		$.ajax({
			url: tempurl + "/general/device_dictionary?device_types=" + opt,
			type: "GET",
			headers: { 'Authorization': userToken },
			dataType: "json",
			async: false,
			cache:false,
			success: function(data) {
				//console.log(data);
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
	},

	//加载相机函数
	loadcamer: function() {
		$.ajax({
			type: "GET",
			headers: { 'Authorization': userToken },
			url: tempurl + "/device/inside_device/query?type=" + CAMERA,
			contentType: "application/json;charset=utf-8", //必须有
			dataType: "json", //表示返回值类型，不必须
			async: false,
			cache:false,
			success: function(data) {
				$(".alert").hide();
				camerData = []; //赋值前先清空。
				for(var i = 0, len = data.length; i < len; i++) {
					if(data[i].ptzControl == "1") {
						camerData[i] = { "id": data[i].deviceCode, "text": data[i].purposeDesc + " (" + data[i].ip + "：" + data[i].port + ")", "icon": "images/video/ptzcamera_green.png" };
					} else {
						camerData[i] = { "id": data[i].deviceCode, "text": data[i].purposeDesc + " (" + data[i].ip + "：" + data[i].port + ")", "icon": "images/video/camera_green.png" };
					}
				}
			}
		});
		return this;
	},

	//根据设备编号查找已关联的相机信息
	dorelate: function(num) {
		$.ajax({
			type: "GET",
			headers: { 'Authorization': userToken },
			url: tempurl + "/device/camera_relation/" + num,
			contentType: "application/json;charset=utf-8",
			dataType: "json",
			async: false,
			success: function(data) {
				$(".alert").hide();
				var relatcamer = [];
				for(var i = 0, len = data.length; i < len; i++) {
					relatcamer.push(data[i].uniqueNum)
				}
				//先根据已经关联的相机初始化选中节点
				$('#camerContainer').jstree('select_node', relatcamer);
			}
		});
		return this;
	}
}

//表单验证函数
var valid = {

	//验证是否合法的IP
	isValidIP: function(ip) {
		var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
		return reg.test(ip);
	},

	checkTime: function(purchaseTime, installTime, warrantyPeriod, $purchaseTime, $installTime, $warrantyPeriod) {
		var now = Date.parse(new Date()),
			purchaseTime = (purchaseTime == '') ? 0 : Date.parse(purchaseTime),
			installTime = (installTime == '') ? 0 : Date.parse(installTime),
			warrantyPeriod = (warrantyPeriod == '') ? 0 : Date.parse(warrantyPeriod),
			flag = '';
		if(purchaseTime > now) {
			flag = '采购时间应早于当前时间';
			$purchaseTime.addClass('alert-danger').focus();;
			$warrantyPeriod.removeClass('alert-danger');
			$installTime.removeClass('alert-danger');
			return flag;
		}
		if(installTime != 0 && (purchaseTime >= installTime)) {
			flag = '安装时间应晚于采购时间';
			$purchaseTime.removeClass('alert-danger');
			$warrantyPeriod.removeClass('alert-danger');
			$installTime.addClass('alert-danger').focus();;
			return flag;
		}
		if(installTime != 0 && warrantyPeriod != 0 && (warrantyPeriod <= installTime)) {
			flag = '安装时间应早于质保时间';
			$purchaseTime.removeClass('alert-danger');
			$warrantyPeriod.removeClass('alert-danger');
			$installTime.addClass('alert-danger').focus();;
			return flag;
		}
		if(warrantyPeriod != 0 && warrantyPeriod <= now) {
			flag = '质保时间应晚于当前时间';
			$purchaseTime.removeClass('alert-danger');
			$installTime.removeClass('alert-danger');
			$warrantyPeriod.addClass('alert-danger').focus();;
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

	//检测IP是否已经存在
	foundIP: function(devStr) {
		var hasIP = null;
		$.ajax({
			type: "PUT",
			headers: { 'Authorization': userToken },
			url: tempurl + "/device/find_ip/",
			contentType: "application/json;charset=utf-8",
			dataType: "json",
			async: false,
			cache:false,
			data: devStr,
			success: function(data) {
				hasIP = data;
			},
		});
		return hasIP;
	},

	//检测编号是否已经存在
	foundNum: function(num) {
		var isFound = '';
		$.ajax({
			type: "GET",
			headers: { 'Authorization': userToken },
			url: tempurl + "/device/find/" + num,
			contentType: "application/json;charset=utf-8",
			dataType: "json",
			async: false,
			cache:false,
			success: function(data) {
				isFound = data['msg'];
			}
		});
		return isFound;
	}

}

//录入设备
var addModal = new Modal({
	title: '设施信息',
	content: $('#wcssAdd_modal').html(),
	width: 604,
	marginTop:200,
	onContentReady: function() {
		dateForm();

		var $type = this.$modal.find('form').find("select.typeItem"),
			$form = this.$modal.find('form');
		dropList.initData().selfData(CAMERA);

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
				data = $form.serializeArray(),
				postData = {},
				$alert = $form.find(".alert"),
				$errorMsg = $form.find('.alert .error_msg'),
				$deviceCode = $form.find('.deviceCode'),
				$purposeDesc = $form.find('.purposeDesc'),
				$purchaseTime = $form.find('.purchaseTime'),
				$installTime = $form.find('.installTime'),
				$warrantyPeriod = $form.find('.warrantyPeriod'),
				flag = '',
				$ip = $form.find('.ip'),
				$port = $form.find('.port'),
				lane;
			data.forEach(function(obj) {
				postData[obj.name] = obj.value;
			});
			if(postData.laneNumber) {
				lane = $("#sel").val().join(',');
			}
			postData.laneNumber = lane;

			flag = valid.checkTime(postData.purchaseTime, postData.installTime, postData.warrantyPeriod, $purchaseTime, $installTime, $warrantyPeriod);
			if(flag != '') {
				$alert.show();
				$errorMsg.text(flag);
				return false;
			} else {
				$alert.hide();
				$purposeDesc.removeClass('alert-danger');
			}
			if(postData.deviceCode == '') {
				$alert.show();
				$errorMsg.text('设备编号不能为空');
				$deviceCode.addClass('alert-danger').focus();;
				return false;
			} else {

				//检测编号是否已经存在，若存在提示用户
				var isFound = valid.foundNum(postData.deviceCode);
				if(isFound == "FOUND") {
					$alert.show();
					$errorMsg.text('设备编号已存在，请重新输入！');
					return false;
				} else {
					$alert.hide();
					$deviceCode.removeClass('alert-danger');
				}
			}

			if(postData.purposeDesc == '') {
				$alert.show();
				$errorMsg.text('描述名不能为空');
				$purposeDesc.addClass('alert-danger').focus();;
				return false;
			} else {
				$alert.hide();
				$purposeDesc.removeClass('alert-danger');
			}
			if(!$ip.prop("disabled")) {
				if(postData.ip == '') {
					$alert.show();
					$errorMsg.text('ip不能为空');
					$ip.addClass('alert-danger').focus();;
					return false;
				} else if(!valid.isValidIP(postData.ip)) {
					$alert.show();
					$errorMsg.text('ip地址格式错误，请重新输入！');
					$ip.addClass('alert-danger').focus();;
					return false;
				} else {
					var dev = {
							"type": postData.type,
							"ip": postData.ip
						},
						devArr = [],
						devStr = "",
						ipArr = [];
					devArr.push(dev);
					devStr = JSON.stringify(devArr);
					ipArr = valid.foundIP(devStr);
					if(ipArr.length > 0) {
						$alert.show();
						$errorMsg.text('此ip地址在该类型中已存在，请重新输入！');
						$ip.addClass('alert-danger').focus();;
						return false;
					} else {
						$alert.hide();
						$ip.removeClass('alert-danger');
					}
				}
			}

			if(!$port.prop("disabled")) {
				if(postData.port == '') {
					$alert.show();
					$errorMsg.text('端口号不能为空');
					$port.addClass('alert-danger').focus();;
					return false;
				} else if(postData.port.length > 8) {
					$alert.show();
					$errorMsg.text('端口号不能超过8位');
					$port.addClass('alert-danger').focus();;
					return false;
				} else {
					$alert.hide();
					$port.removeClass('alert-danger');
				}
			}
			_post();

			function _post() {
				var dataSend = JSON.stringify(postData);
				var opt = postData.deviceCode;
				$.ajax({
					type: "POST",
					headers: { 'Authorization': userToken },
					url: tempurl + "/device",
					contentType: "application/json;charset=utf-8", //必须有
					dataType: "json", //表示返回值类型，不必须
					data: dataSend,
					cache:false,
					success: function(jsonResult) {
						console.log(jsonResult);
						$alert.hide();
						showWcss(opt, 0, 0, 'add');
						oper.control();
						$form[0].reset();
						$form.find("#add_type").val(CAMERA).trigger("change");
						$form.find(".unitItem").val(UNIT1).trigger("change");
						$form.find(".chargePerson").val(CHARGPERSON1).trigger("change");
						$form.find(".supplier").val(SUPPLIER1).trigger("change");
						$form.find(".direction").val(DIRECTION1).trigger("change");
						$form.find(".road").val(ROAD1).trigger("change");
					},
					error: function() {
						Alert('<div class="handle-tip"><img src="images/warn.png" alt="警告" />录入失败，请重试！</div>');
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
			$form.find('*').removeClass('alert-danger');
			$form.find(".alert").hide();
			$form.find("#add_type").val(CAMERA).trigger("change");
			$form.find(".unitItem").val(UNIT1).trigger("change");
			$form.find(".chargePerson").val(CHARGPERSON1).trigger("change");
			$form.find(".supplier").val(SUPPLIER1).trigger("change");
			$form.find(".direction").val(DIRECTION1).trigger("change");
			$form.find(".road").val(ROAD1).trigger("change");
		}
	}],
});

//编辑设备
var editWcssModal = new Modal({
	title: '设施信息',
	content: $('#wcssEdit_modal').html(),
	width: 604,
	marginTop:200,
	onContentReady: function() {
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
				$errorMsg = $form.find('.alert .error_msg'),
				$deviceCode = $form.find('.deviceCode'),
				$purposeDesc = $form.find('.purposeDesc'),
				$ip = $form.find('.ip'),
				$port = $form.find('.port'),
				$purchaseTime = $form.find('#purchaseTime'),
				$installTime = $form.find('#installTime'),
				$warrantyPeriod = $form.find('#warrantyPeriod'),
				flag = '',
				lane = "";
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
			if(postData.laneNumber) {
				lane = $("#laneNumber").val().join(',');
			}
			postData.laneNumber = lane;
			if(postData.purposeDesc == '') {
				$alert.show();
				$errorMsg.text('描述名不能为空');
				$purposeDesc.addClass('alert-danger').focus();;
				return false;
			} else {
				$alert.hide();
				$purposeDesc.removeClass('alert-danger');
			}
			if(!$ip.prop("disabled")) {
				if(postData.ip == '') {
					$alert.show();
					$errorMsg.text('ip不能为空');
					$ip.addClass('alert-danger').focus();;
					return false;
				} else if(!valid.isValidIP(postData.ip)) {
					$alert.show();
					$errorMsg.text('ip地址格式错误，请重新输入！');
					$ip.addClass('alert-danger').focus();;
					return false;
				} else if(originIP[0] != postData.ip) {
					var dev = {
							"type": postData.type,
							"ip": postData.ip
						},
						devArr = [],
						devStr = "",
						ipArr = [];
					devArr.push(dev);
					devStr = JSON.stringify(devArr);
					ipArr = valid.foundIP(devStr);
					if(ipArr.length > 0) {
						$alert.show();
						$errorMsg.text('此ip地址在该类型中已存在，请重新输入！');
						$ip.addClass('alert-danger').focus();;
						return false;
					} else {
						$alert.hide();
						$ip.removeClass('alert-danger');
					}
				} else {
					$alert.hide();
					$ip.removeClass('alert-danger');
				}
			}
			if(!$port.prop("disabled")) {
				if(postData.port == '') {
					$alert.show();
					$errorMsg.text('端口号不能为空');
					$port.addClass('alert-danger').focus();;
					return false;
				} else if(postData.port.length > 8) {
					$alert.show();
					$errorMsg.text('端口号不能超过8位');
					$port.addClass('alert-danger').focus();;
					return false;
				} else {
					$alert.hide();
					$port.removeClass('alert-danger');
				}
			}
			_post();

			function _post() {
				var dataSend = JSON.stringify(postData),
					opt = postData.uniqueNum;
				$.ajax({
					type: "PUT",
					headers: { 'Authorization': userToken },
					url: tempurl + "/device",
					contentType: "application/json;charset=utf-8",
					dataType: "json",
					data: dataSend,
					cache:false,
					success: function(jsonResult) {
						console.log(jsonResult);
						showWcss(opt, 0, 0, 'edit');
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
			$form.find('*').removeClass('alert-danger');
			$form.find(".alert").hide();
		}
	}],
});

//导入设备
var importModel = new Modal({
	title: '导入数据',
	content: $('#import_modal').html(),
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
					contentType: "application/json;charset=utf-8",
					dataType: "json",
					async: false,
					cache:false,
					data: dataSend,
					success: function(data) {
						console.log(data);
						numlen = data.length;
						if(numlen > 0) {
							for(var i = 0; i < numlen; i++) {
								hasNum.push(data[i].deviceCode)
							}
							tip = hasNum.join(',');
						}
					}
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
						errIpForm = [],
						errIpHas = [],
						errPortForm = [],
						errPortHas = [],
						errPurpose = [],
						errNum = [],
						errptzForm = [],
						errptzHas = [],
						errLatLong = [],
						errCross = [],
						errCrossHas = [],
						errText = '',
						reg = /^\d{1,8}$/,
						regPtz = /^[0,1]{1}$/,
						j = 0,
						road = roadData,
						devDirection = directionData,
						devType = typeData,
						devPerson = personData,
						nowType = '',
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
					arr = arr.slice(2);
					len = arr.length;
					if(arr[len - 1] == '') {
						len = len - 1;
					}
					for(var i = 0; i < len; ++i) {
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
						nowType = p.type;
						//有些设备不需要ip、port和经纬度
						if(nowType == CAMERA || nowType == VIDEO_DETECTOR || nowType == SIGNAL_CONTROLLER || nowType == MESSAGE_SIGN) {
							if(!valid.isValidIP(p.ip)) {
								errIpForm.push(p.deviceCode);
								continue;
							}
							//保存所有的IP信息
							var dev = {
								"type": p.type,
								"ip": p.ip
							};
							devArr.push(dev);

							if(!reg.test(p.port)) {
								errPortForm.push(p.deviceCode);
								continue;
							}
						} else {
							if(p.ip != '') {
								errIpHas.push(p.deviceCode);
								continue;
							}
							if(p.port != '') {
								errPortHas.push(p.deviceCode);
								continue;
							}
							if(p.latitude != '' || p.longitude != '') {
								errLatLong.push(p.deviceCode);
								continue;
							}
						}

						//验证相机云台字段
						if(nowType == CAMERA) {
							if(regPtz.test(p.ptzControl == '')) {
								errptzForm.push(p.deviceCode);
								continue;
							}
						} else {
							if(p.ptzControl != '') {
								errptzHas.push(p.deviceCode);
								continue;
							}
						}

						p.department = findKey(p.departmentDesc, unitData);
						p.departmentDesc = (p.department) ? p.departmentDesc : undefinedText;

						p.supplier = findKey(p.supplierDesc, supplierData);
						p.supplierDesc = (p.supplier) ? p.supplierDesc : undefinedText;

						p.direction = findKey(p.directionDesc, devDirection);
						p.directionDesc = (p.direction) ? p.directionDesc : undefinedText;

						p.chargePerson = findKey(p.chargePersonName, devPerson);
						p.chargePersonName = (p.chargePerson) ? p.chargePersonName : undefinedText;

						p.roadNumber = findKey(p.locationDesc, road);
						p.locationDesc = (p.roadNumber) ? p.locationDesc : undefinedText;

						dropList.crossLoad(p.roadNumber).subTypeLoad(nowType);

						p.crossNumber = findKey(p.crossNumberDesc, crossData);
						p.crossNumberDesc = (p.crossNumber) ? p.crossNumberDesc : undefinedText;

						//设备显示道路和路口验证，路口需要和道路对应
						if(nowType == VIDEO_DETECTOR || nowType == SIGNAL_CONTROLLER || nowType == LAMP_GROUP) {
							if(!p.crossNumber && p.roadNumber) {
								errCross.push(p.deviceCode);
								continue;
							}
						} else {
							if(p.crossNumber) {
								errCrossHas.push(p.deviceCode);
								continue;
							}
						}

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
						errText += '<li>第 ' + errNum.join(', ') + ' 行数据缺少设备编号；</br>';
					}
					if(errPurpose.length) {
						errText += '<li>编号为' + errPurpose.join(', ') + '数据缺少设备描述名；</br>';
					}
					if(errTypeDesc.length) {
						errText += '<li>编号为' + errTypeDesc.join(', ') + '数据缺少设备类型；</br>';
					}
					if(errType.length) {
						errText += '<li>编号为' + errType.join(', ') + '数据不存在此设备类型，请确认；</br>';
					}
					if(errIpForm.length) {
						errText += '<li>编号为' + errIpForm.join(', ') + '数据IP格式错误；</li>';
					}
					if(errIpHas.length) {
						errText += '<li>编号为' + errIpHas.join(', ') + '的设备类型IP应该为空；</li>';
					}
					if(errPortForm.length) {
						errText += '<li>编号为' + errPortForm.join(', ') + '数据IP格式错误；</li>';
					}
					if(errPortHas.length) {
						errText += '<li>编号为' + errPortHas.join(', ') + '的设备类型端口号应该为空；</li>';
					}
					if(errptzForm.length) {
						errText += '<li>编号为' + errptzForm.join(', ') + '数据云台字段需要填0或1；</li>';
					}
					if(errptzHas.length) {
						errText += '<li>编号为' + errptzHas.join(', ') + '的设备类型云台字段应该为空；</li>';
					}
					if(errLatLong.length) {
						errText += '<li>编号为' + errLatLong.join(', ') + '的设备类型经度或纬度字段应该为空；</li>';
					}
					if(errCross.length) {
						errText += '<li>编号为' + errCross.join(', ') + '的设备有路口信息时必须要填写道路信息；</li>';
					}
					if(errCrossHas.length) {
						errText += '<li>编号为' + errCrossHas.join(', ') + '的设备类型路口字段应该为空；</li>';
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
					ipArr = valid.foundIP(devStr);
					var ipLen = ipArr.length;
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
							console.log(jsonResult);
							//showWcss(WCDEV, SUPPLIER);
							$table.bootstrapTable('refreshOptions', {
								data: jsonObj,
							});
							$alert.hide();
							$form[0].reset();
							$('#close_btn').click();
							if(errText != '') {
								Alert({
									"width": "600px",
									"msg": '<div class="error-tip"><h4><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>' +
										jsonobjLen + '条数据导入成功，导入失败数据提示：</h4><ul>' + errText + '</ul></div>'
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

				}
				reader.onerror = function(e) {
					console.log("error", e);
				}
				return false; //阻止模态框关闭
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

//关联设备
var relevanceModal = new Modal({
	title: "设备关联",
	content: $('#relevance_modal').html(),
	width: 500,
	onContentReady: function() {
		var relevance=this.$modal.find('.modal-dialog');
		relevance.attr('id','relevance');
	},
	onModalDrag:function(){$("#camerContainer").getNiceScroll().resize();},
	onModalDragStop:function(){$("#camerContainer").getNiceScroll().resize();},
	//onModalShown:function(){
			//var scroll_vr=this.$modal.find('.nicescroll-rails-vr');
			//var scroll_hr=this.$modal.find('.nicescroll-rails-hr');
			//scroll_vr.css('top','351px!important');
			//scroll_hr.css('top','584px!important');
	//		},
	buttons: [{
		html: '<button type="button" class="btn btn-sm btn-ok">保存</button>',
		selector: '.btn-ok',
		callback: function() {
			
			var nodes = $('#camerContainer').jstree("get_selected"),
				num = $.map($table.bootstrapTable('getSelections'), function(row) {
					return row;
				}),
				deviceNum = num[0].deviceCode,
				cameraNumbers = nodes.join(','),
				dataSend = JSON.stringify({
					"deviceNumber": deviceNum,
					"cameraNumbers": cameraNumbers
				});
			// {"deviceNumber":"001","cameraNumbers":"number1,number2"}
			$.ajax({
				type: "PUT",
				headers: { 'Authorization': userToken },
				url: tempurl + "/device/camera_relation",
				contentType: "application/json;charset=utf-8", //必须有
				dataType: "json", //表示返回值类型，不必须
				async: false,
				cache:false,
				data: dataSend,
				success: function(data) {
					$(".alert").hide();
					Alert('<div class="handle-tip"><img src="images/tip.png" alt="提示" />关联成功！</div>');
				},
				error: function() {
					Alert('<div class="handle-tip"><img src="images/warn.png" alt="提示" />关联失败！</div>');
				}
			});
		}
	}, {
		html: '<button type="button" class="btn btn-sm  btn-cancel">取消</button>',
		selector: '.btn-cancel',
		callback: function() {
			$(".alert").hide();
		}
	}],
});

$table.on('check.bs.table check-all.bs.table',
	function() {
		oper.control();
	});

$table.on('uncheck.bs.table uncheck-all.bs.table',
	function() {
		oper.control();
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
//关联设备
$('#btn_relevance').click(function() {
	oper.relevance();
});

$('#typeSearch').on('change', function() {
	var devType = this.value,
		supplier = $('#supplierSearch').val(),
		road = $('#roadSearch').val();
	console.log("设备类型：" + devType + ";供货商：" + supplier + ";道路：" + road);
	showWcss(devType, supplier, road);
});
$('#supplierSearch').on('change', function() {
	var supplier = this.value,
		devType = $('#typeSearch').val(),
		road = $('#roadSearch').val();
	console.log("设备类型：" + devType + ";供货商：" + supplier + ";道路：" + road);
	showWcss(devType, supplier, road);
});
$('#roadSearch').on('change', function() {
	var road = this.value,
		supplier = $('#supplierSearch').val(),
		devType = $('#typeSearch').val();
	console.log("设备类型：" + devType + ";供货商：" + supplier + ";道路：" + road);
	showWcss(devType, supplier, road);
});
$('#btn_delete').click(function() {
	oper.del();
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

$(document).ready(function() {
	$("#equipmentMgr").addClass('active');
	$("html").niceScroll({cursorborder:"0",cursorcolor:"rgb(114,117,119)",background:"rgb(207,212,218)",cursoropacitymin:1}); 
	$table.bootstrapTable({
		data: '',
		cache: false,
		pagination: true,
		sortName: "inputTime",
		sortOrder: "desc",
		pageSize: 16,
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
			width: '65px',
			title: '序号'
		}, {
			field: 'deviceCode',
			title: '编号',
			sortable: true,
		}, {
			field: 'uniqueNum',
			title: '内部编号',
			visible: false
		},{
			field: 'type',
			title: '类型字段',
			visible: false
		}, {
			field: 'purposeDesc',
			title: '描述名',
			sortable: true,
		}, {
			field: 'typeDesc',
			title: '设备类型',
			sortable: true,
		}, {
			field: 'ip',
			title: 'IP',
			width: '120',
			sortable: true,
		}, {
			field: 'port',
			title: '端口号',
			sortable: true,
		}, {
			field: 'brand',
			title: '品牌',
			sortable: true,
		}, {
			field: 'subType',
			title: '子类型',
			visible: false
		}, {
			field: 'subTypeDesc',
			title: '子类型',
			sortable: true,
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
			visible: false
		}, {
			field: 'longitude',
			title: '经度',
			visible: false
		}, {
			field: 'latitude',
			title: '纬度',
			visible: false
		}, {
			field: 'locationDesc',
			title: '位置',
			sortable: true,
		}, {
			field: 'roadNumber',
			title: '道路位置编号',
			visible: false
		}, {
			field: 'crossNumber',
			title: '路口位置编号',
			visible: false
		}, {
			field: 'direction',
			title: '方向',
			visible: false
		}, {
			field: 'directionDesc',
			title: '方向',
			sortable: true,
		}, {
			field: 'laneNumber',
			title: '车道',
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
			sortable: true,
		}, {
			field: 'inputerName',
			title: '录入人',
			visible: false
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
		}, {
			field: 'ptzControl',
			title: '云台',
			visible: false
		}, ]
	});
	showWcss(WCDEV, SUPPLIER, ROAD);
	dropList.shareData().initData();
});