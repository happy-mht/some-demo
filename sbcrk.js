var ncssdata = [{
	"seq_no": "FWQ_001",
	"configuration": "常规",
	"type": "服务器",
	"brand": "",
	"supplier": "XX",
	"purchase_time": "04/01/2015",
	"storage_time": "03/31/2019",
	"maintain_unit": "A单位",
	"inputer": "张三"
}];
var wcssdata = [{
	"id": 1,
	"seq_no": "XHJ_001",
	"position": "永盛路/沪宜公路",
	"type": "诱导板",
	"status": "异常",
	"fault": "无",
	"fault_cause": "无",
	"purchase_time": "04/01/2015",
	"quality_time": "03/31/2019",
	"maintain_time": "03/01/2017",
	"maintain_score": "4",
	"maintain_unit": "A单位",
	"inputer": "张三"
}, {
	"id": 2,
	"seq_no": "XHJ_001",
	"position": "永盛路/沪宜公路",
	"type": "信号机",
	"status": "异常",
	"fault": "无",
	"fault_cause": "无",
	"purchase_time": "04/01/2015",
	"quality_time": "03/31/2019",
	"maintain_time": "03/01/2017",
	"maintain_score": "4",
	"maintain_unit": "B单位",
	"inputer": "张三"
}, {
	"id": 3,
	"seq_no": "XHJ_001",
	"position": "永盛路/沪宜公路",
	"type": "信号机",
	"status": "正常",
	"fault": "无",
	"fault_cause": "无",
	"purchase_time": "04/01/2015",
	"quality_time": "03/31/2019",
	"maintain_time": "03/01/2017",
	"maintain_score": "4",
	"maintain_unit": "A单位",
	"inputer": "张三"
}, {
	"id": 4,
	"seq_no": "XHJ_001",
	"position": "永盛路/沪宜公路",
	"type": "诱导板",
	"status": "正常",
	"fault": "无",
	"fault_cause": "无",
	"purchase_time": "04/01/2015",
	"quality_time": "03/31/2019",
	"maintain_time": "03/01/2017",
	"maintain_score": "4",
	"maintain_unit": "A单位",
	"inputer": "张三"
}, {
	"id": 5,
	"seq_no": "XHJ_001",
	"position": "永盛路/沪宜公路",
	"type": "诱导板",
	"status": "异常",
	"fault": "无",
	"fault_cause": "无",
	"purchase_time": "04/01/2015",
	"quality_time": "03/31/2019",
	"maintain_time": "03/01/2017",
	"maintain_score": "4",
	"maintain_unit": "A单位",
	"inputer": "张三"
}, ];
var ywssdata = [{
	"id": 1,
	"seq_no": "XHJ_001",
	"type": "道路",
	"name": "道路1",
	"roadnum1": "X01",
	"roadnum2": "X01",
	"inputer": "李四"
}, {
	"id": 2,
	"seq_no": "XHJ_001",
	"type": "道路",
	"name": "道路2",
	"roadnum1": "X01",
	"roadnum2": "X01",
	"inputer": "李四"
}, {
	"id": 3,
	"seq_no": "XHJ_001",
	"type": "道路",
	"name": "道路3",
	"roadnum1": "X01",
	"roadnum2": "X01",
	"inputer": "李四"
}, {
	"id": 4,
	"seq_no": "XHJ_001",
	"type": "道路",
	"name": "道路4",
	"roadnum1": "X01",
	"roadnum2": "X01",
	"inputer": "李四"
}, {
	"id": 5,
	"seq_no": "XHJ_001",
	"type": "道路",
	"name": "道路5",
	"roadnum1": "X01",
	"roadnum2": "X01",
	"inputer": "李四"
}, ];

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
var $table = $("#table");
var addModal = new Modal({ //录入外场设施，默认录入诱导板
	title: '设施信息',
	content: $('#add_modal_ductor').html(),
	onContentReady: function() {
		dateForm();
		$("select").select2();
	},
	onContentChange: function() {
		console.log('change');
		dateForm();
		$("select").select2();
	},
	width: 700,
	buttons: [{
		html: '<button type="button" class="btn btn-sm btn-default btn-ok">保存</button>',
		selector: '.btn-ok',
		callback: function() {
			var $form = this.$modal.find('form');
			var data = $form.serializeArray(); //form中的输入框须有name属性，否则取不到数据。
			var postData = {};
			data.forEach(function(obj) {
				postData[obj.name] = obj.value;
			});
			console.log(postData);
			if(postData) {
				if(postData['dev_num'] == undefined || postData['dev_num'] == '') {
					$(".alert").show();
					$('.alert .error_msg').text('设备编号不能为空');
					return false;
				} else {
					$(".alert").hide();
				}
				if(postData.hasOwnProperty('dev_pos')) {
					if(postData['dev_pos'] == undefined || postData['dev_pos'] == '') {
						$(".alert").show();
						$('.alert .error_msg').text('设备位置不能为空');
						return false;
					} else {
						$(".alert2").hide();
					}
				}
				if(postData.hasOwnProperty('GIS')) {
					if(postData['GIS'] == undefined || postData['GIS'] == '') {
						$(".alert").show();
						$('.alert .error_msg').text('GIS坐标不能为空');
						return false;
					} else {
						$(".alert").hide();
					}
				}
				_post();
			}

			function _post() {
				//异步任务
				$('.model_row .row input').val('');
				var addType = postData['dev_type'];
				console.log(addType);
				var ids = $table.bootstrapTable('getOptions').totalRows;
				ids += 1;
				if(addType == "监控摄像机") {
					console.log("添加监控摄像机")
					var dataSend = JSON.stringify({
						"brand": postData['brand'] || 'xx',
						"feature": postData['function'],
						"ip": postData['ip'],
						"name": postData['name'],
						"uniqueNum": postData['dev_num'],
						"communicationState": postData['commu_state'],
						"location": postData['dev_pos'],
						"preset": postData['presetBit'],
						"state": postData['oper_mode'],
						"inspectionPlanNumber": postData['inspectPlan_num'],
						"segmentNumber": postData['road_num'],
						"messageSignNumber": postData['ductor_num'],
						"direction": postData['direction'] || 'south',
						"supplier": postData['supplier'] || 'zhangsan',
						"purchaseTime": postData['buy_time'] || '01/22/2017',
						"storageTime": postData['entry_time'] || '01/22/2017',
						"warrantyPeriod": postData['warranty_period'],
						"maintainanceRecord": postData['maintainanceRecord'] || 'none'
					});
					var dataSend3 = JSON.stringify({
						"uniqueNum": postData['dev_num'],
						"name": postData['name'],
						"brand": postData['brand'] || 'xx',
						"purchaseTime": postData['buy_time'] || '01/22/2017'
					});
					console.log(dataSend);
					$.ajax({
						type: "POST",
						url: "http://192.168.1.224:8080/itsmain/webapi/camera",
						contentType: "application/json;charset=utf-8", //必须有
						dataType: "json", //表示返回值类型，不必须
						data: dataSend,
						success: function(jsonResult) {
							//获取数据ok
							console.log(jsonResult);
							showCamera();
						}
					});
				} else if(addType == "信号机") {
					console.log("添加信号机");
					var dataAllSend = JSON.stringify({
						"uniqueNum": postData['dev_num'],
						"location": postData['dev_pos'],
						"coord": postData['GIS'],
						"videoDetectorNumber": postData['videoDetector_num'],
						"brand": postData['brand'],
						"model": postData['model'],
						"communicationState": postData['commu_state'],
						"assetState": postData['asset_state'],
						"department": postData['dev_unit'],
						"supplier": postData['supplier'] || 'zhangsan',
						"purchaseTime": postData['buy_time'] || '01/22/2017',
						"storageTime": postData['entry_time'] || '01/22/2017',
						"warrantyPeriod": postData['warranty_period'],
						"installationUnit": postData['install_unit'],
						"maintainanceUnit": postData['maintain_unit1'] || 'A',
						"managerContact": postData['contact'] || '1234567890',
						"faultCount": postData['faultCount'] || '0',
						"maintainanceRecord": postData['maintainanceRecord'] || 'none'
					});
					var dataSend = JSON.stringify({
						"uniqueNum": postData['dev_num'],
						"brand": postData['brand'] || 'xx',
						"purchaseTime": postData['buy_time'] || '01/22/2017'
					});
					console.log(dataSend);
					$.ajax({
						type: "POST",
						url: "http://192.168.1.224:8080/itsmain/webapi/signal_controller",
						contentType: "application/json", //必须有
						dataType: "json", //表示返回值类型，不必须
						data: dataSend,
						success: function(jsonResult) {
							console.log(jsonResult);
							showSingalMachine();
						}
					});
				} else if(addType == "信号灯") {
					console.log("添加信号灯");
					var dataAllSend = JSON.stringify({
						"uniqueNum": postData['dev_num'],
						"location": postData['dev_pos'],
						"coord": postData['GIS'],
						"type": "signal" || postData['dev_type'],
						"brand": postData['brand'],
						"model": postData['model'],
						"direction": postData['model'],
						"communicationState": postData['commu_state'],
						"signalControllerNumber": postData['commu_state'],
						"assetState": postData['asset_state'],
						"department": postData['dev_unit'],
						"supplier": postData['supplier'] || 'zhangsan',
						"purchaseTime": postData['buy_time'] || '01/22/2017',
						"storageTime": postData['entry_time'] || '01/22/2017',
						"warrantyPeriod": postData['warranty_period'],
						"installationUnit": postData['install_unit'],
						"maintainanceUnit": postData['maintain_unit1'] || 'A00',
						"managerContact": postData['contact'] || '1234567890',
						"faultCount": postData['faultCount'] || '0',
						"maintainanctRecord": postData['maintainanceRecord'] || 'none'
					});
					var dataSend = JSON.stringify({
						"uniqueNum": postData['dev_num'],
						"brand": postData['brand'] || 'xx',
						"purchaseTime": postData['buy_time'] || '01/22/2017'
					});
					console.log(dataAllSend);
					$.ajax({
						type: "POST",
						url: "http://192.168.1.224:8080/itsmain/webapi/lamp_group",
						contentType: "application/json;charset=utf-8",
						dataType: "json",
						data: dataAllSend,
						success: function(jsonResult) {
							//获取数据ok
							console.log(jsonResult);
							showSignalLampMap()
						}
					});
				} else if(addType == "灯杆") {
					console.log("添加灯杆");
					var dataAllSend = JSON.stringify({
						"uniqueNum": postData['dev_num'],
						"location": postData['dev_pos'],
						"coord": postData['GIS'],
						"type": postData['dev_type'],
						"brand": postData['brand'],
						"model": postData['model'],
						"direction": postData['model'],
						"communicationState": postData['commu_state'],
						"signalControllerNumber": postData['commu_state'],
						"assetState": postData['asset_state'],
						"department": postData['dev_unit'],
						"supplier": postData['supplier'] || 'zhangsan',
						"purchaseTime": postData['buy_time'] || '01/22/2017',
						"storageTime": postData['entry_time'] || '01/22/2017',
						"warrantyPeriod": postData['warranty_period'],
						"installationUnit": postData['install_unit'],
						"maintainanceUnit": postData['maintain_unit1'] || 'A00',
						"managerContact": postData['contact'] || '1234567890',
						"faultCount": postData['faultCount'] || '0',
						"maintainanctRecord": postData['maintainanceRecord'] || 'none'
					});
					var dataSend = JSON.stringify({
						"number": postData['dev_num'],
						"brand": postData['brand'] || 'xx',
						"purchaseTime": postData['buy_time'] || '01/22/2017'
					});
					console.log(dataAllSend);
					$.ajax({
						type: "POST",
						url: "http://192.168.1.224:8080/itsmain/webapi/lamp_pole",
						contentType: "application/json;charset=utf-8",
						dataType: "json",
						data: dataAllSend,
						success: function(jsonResult) {
							//获取数据ok
							console.log(jsonResult);
							showLampPole();
						}
					});
				} else if(addType == "视频检测器") {
					console.log("添加视频检测器");
					var dataAllSend = JSON.stringify({
						"uniqueNum": postData['dev_num'],
						"location": postData['dev_pos'],
						"coord": postData['GIS'],
						"signalControllerNumber": postData['videoDetector_num'],
						"brand": postData['brand'],
						"model": postData['model'],
						"communicationState": postData['commu_state'],
						"direction": postData['direction'] || 'south',
						"assetState": postData['asset_state'],
						"department": postData['dev_unit'],
						"supplier": postData['supplier'] || 'zhangsan',
						"purchaseTime": postData['buy_time'] || '01/22/2017',
						"storageTime": postData['entry_time'] || '01/22/2017',
						"warrantyPeriod": postData['warranty_period'],
						"installationUnit": postData['install_unit'],
						"maintainanceUnit": postData['maintain_unit1'] || 'A00',
						"managerContact": postData['contact'] || '1234567890',
						"faultCount": postData['faultCount'] || '0',
						"maintainanctRecord": postData['maintainanceRecord'] || 'none'
					});
					console.log(dataAllSend);
					$.ajax({
						type: "POST",
						url: "http://192.168.1.224:8080/itsmain/webapi/video_detector",
						contentType: "application/json;charset=utf-8",
						dataType: "json",
						data: dataAllSend,
						success: function(jsonResult) {
							//获取数据ok
							console.log(jsonResult);
							showVideoDetector();
						}
					});
				} else if(addType == "线缆") {
					console.log("添加线缆");
					var dataAllSend = JSON.stringify({
						"uniqueNum": postData['dev_num'],
						"location": postData['dev_pos'],
						"coord": postData['GIS'],
						"type": postData['dev_type'],
						"brand": postData['brand'],
						"model": postData['model'],
						"assetState": postData['asset_state'],
						"department": postData['dev_unit'],
						"supplier": postData['supplier'] || 'zhangsan',
						"purchaseTime": postData['buy_time'] || '01/22/2017',
						"storageTime": postData['entry_time'] || '01/22/2017',
						"warrantyPeriod": postData['warranty_period'],
						"installationUnit": postData['install_unit'],
						"maintainanceUnit": postData['maintain_unit1'] || 'A00',
						"managerContact": postData['contact'] || '1234567890',
						"faultCount": postData['faultCount'] || '0',
						"maintainanctRecord": postData['maintainanceRecord'] || 'none'
					});
					console.log(dataAllSend);
					$.ajax({
						type: "POST",
						url: "http://192.168.1.224:8080/itsmain/webapi/fiber_optic_cable",
						contentType: "application/json;charset=utf-8", //必须有
						dataType: "json", //表示返回值类型，不必须
						data: dataAllSend,
						success: function(jsonResult) {
							//获取数据ok
							console.log(jsonResult);
							showCable();
						}
					});
				} else if(addType == "诱导板") {
					console.log("添加诱导板");
					var dataAllSend = JSON.stringify({
						"uniqueNum": postData['dev_num'],
						"location": postData['dev_pos'],
						"coord": postData['GIS'],
						"type": postData['dev_type'],
						"brand": postData['brand'],
						"model": postData['model'],
						"spec": postData['specification'], //规格
						"communicationState": postData['commu_state'],
						"operatingMode": postData['work_mode'],
						"assetState": postData['asset_state'],
						"textTemplateNumber": postData['textTemplateNumber'],
						"textPlanNumber": postData['textPlanNumber'],
						"publishSectionNumber": postData['publishSectionNumber'],
						"department": postData['dev_unit'],
						"supplier": postData['supplier'] || 'zhangsan',
						"purchaseTime": postData['buy_time'] || '01/22/2017',
						"storageTime": postData['entry_time'] || '01/22/2017',
						"installationUnit": postData['install_unit'],
						"maintainanceUnit": postData['maintain_unit1'] || 'A00',
						"managerContact": postData['contact'] || '1234567890',
						"faultCount": postData['faultCount'] || '0',
						"maintainanceRecrod": postData['maintainanceRecord'] || 'none',
						"textPublishRecord": postData['textPublishRecord'] || 'none',
						"publishSegmentGroup": postData['publishSegmentGroup'] || 'none',
						"publishSegmentRecord": postData['publishSegmentRecord'] || 'none',
					});
					console.log(dataAllSend);
					$.ajax({
						type: "POST",
						url: "http://192.168.1.224:8080/itsmain/webapi/message_sign",
						contentType: "application/json;charset=utf-8",
						dataType: "json",
						data: dataAllSend,
						success: function(jsonResult) {
							//获取数据ok
							console.log(jsonResult);
							showMessageSign();
						}
					});
				}
			}
		}
	}, {
		html: '<button type="button" class="btn btn-sm btn-default btn-cancel">取消</button>',
		selector: '.btn-cancel',
		callback: function() {
			//点击取消按钮的回调
		}
	}],
});
var addModal2 = new Modal({ //录入业务设施，默认录入道路
	title: '设施信息',
	content: $('#add_modal_road').html(),
	onContentReady: function() {
		$("select").select2();
		dateForm();
	},
	onContentChange: function() {
		console.log('change');
		dateForm();
		$("select").select2();
	},
	width: 700,
	buttons: [{
		html: '<button type="button" class="btn btn-sm btn-default btn-ok">保存</button>',
		selector: '.btn-ok',
		callback: function() {
			var $form = this.$modal.find('form');
			var data = $form.serializeArray(); //form中的输入框须有name属性，否则取不到数据。
			var postData = {};
			data.forEach(function(obj) {
				postData[obj.name] = obj.value;
			});
			console.log(postData);
			if(postData) {
				_post();
			}

			function _post() {
				//异步任务	
				var ids = $table.bootstrapTable('getOptions').totalRows;
				ids += 1;
				var addType = postData['dev_type'];
				console.log(addType);
				if(addType == "道路") {
					console.log("添加道路")
					var dataSend = JSON.stringify({
						"uniqueNum": postData['dev_id'],
						"type": postData['dev_type'] || '道路',
						"managementUnit": postData['respon_depart'] || 'xx',
						"maintainanceUnit": postData['maintainUnit_num'] || 'ABB'
					});
					console.log(dataSend);
					$.ajax({
						type: "POST",
						url: "http://192.168.1.224:8080/itsmain/webapi/road",
						contentType: "application/json;charset=utf-8", //必须有
						dataType: "json", //表示返回值类型，不必须
						data: dataSend,
						success: function(jsonResult) {
							//获取数据ok
							console.log(jsonResult);
							showRoad();
						}
					});
				} else if(addType == "路口") {
					console.log("添加路口")
					var dataSend = JSON.stringify({
						"uniqueNum": postData['dev_id'],
						"type": postData['dev_type'],
						"managementUnit": postData['respon_depart'] || 'xx',
						"maintainanceUnit": postData['maintainUnit_num'] || 'ABB'
					});
					console.log(dataSend);
					$.ajax({
						type: "POST",
						url: "http://192.168.1.224:8080/itsmain/webapi/cross",
						contentType: "application/json;charset=utf-8", //必须有
						dataType: "json", //表示返回值类型，不必须
						data: dataSend,
						success: function(jsonResult) {
							//获取数据ok
							console.log(jsonResult);
							showCross();
						}
					});
				}
			}
		}
	}, {
		html: '<button type="button" class="btn btn-sm btn-default btn-cancel">取消</button>',
		selector: '.btn-cancel',
		callback: function() {
			//点击取消按钮的回调
		}
	}],
});

var addModal3 = new Modal({ //录入内场设施
	title: '设施信息',
	content: $('#add_modal_ncss').html(),
	width: 700,
	onContentReady: function() {
		$("select").select2();
		dateForm();
	},
	onContentChange: function() {
		console.log('change');
		dateForm();
		$("select").select2();
	},
	buttons: [{
		html: '<button type="button" class="btn btn-sm btn-default btn-ok">保存</button>',
		selector: '.btn-ok',
		callback: function() {
			var $form = this.$modal.find('form');
			var data = $form.serializeArray(); //form中的输入框须有name属性，否则取不到数据。
			var postData = {};
			data.forEach(function(obj) {
				postData[obj.name] = obj.value;
			});
			console.log(postData);
			if(postData) {
				_post();
			}

			function _post() {
				//异步任务	
				var ids = $table.bootstrapTable('getOptions').totalRows;
				ids += 1;
				var dataSend = JSON.stringify({
					"uniqueNum": postData['dev_num'],
					"ip": postData['ip'],
					"type": postData['dev_type'],
					"configuration": postData['configuration'],
					"brand": postData['brand'],
					"supplier": postData['supplier'] || 'xx',
					"communication_state": postData['commu_state'] || 'xx',
					"asset_state": postData['asset_state'] || 'xx',
					"department": postData['department'] || 'xx',
					"purchaseTime": postData['buy_time'] || '02/23/2017',
					"storageTime": postData['entry_time'] || '02/23/2017',
					"warrantyPeriod": postData['quality_time'] || '02/23/2017',
					"communication_state": postData['respon_depart'] || 'xx',
					"supplierNumber": postData['asset_state'] || 'xx',
					"maintainanceUnit": postData['maintain_unit1'] || 'xx',
					"managerContact": postData['contact'] || 'xx',
					"maintainanceRecord": postData['maintainanceRecord'] || 'ABB'
				});
				console.log(dataSend);
				var addType = postData['dev_type'];
				console.log(addType);
				if(addType == "服务器") {
					console.log("添加服务器")
					$.ajax({
						type: "POST",
						url: "http://192.168.1.224:8080/itsmain/webapi/server",
						contentType: "application/json;charset=utf-8", //必须有
						dataType: "json", //表示返回值类型，不必须
						data: dataSend,
						success: function(jsonResult) {
							//获取数据ok
							console.log(jsonResult);
							showServer();
						}
					});
				} else if(addType == "工作站") {
					console.log("添加工作站")
					$.ajax({
						type: "POST",
						url: "http://192.168.1.224:8080/itsmain/webapi/work_station",
						contentType: "application/json;charset=utf-8", //必须有
						dataType: "json", //表示返回值类型，不必须
						data: dataSend,
						success: function(jsonResult) {
							//获取数据ok
							console.log(jsonResult);
							showWorkStation();
						}
					});
				} else if(addType == "大屏") {
					console.log("添加大屏")
					$.ajax({
						type: "POST",
						url: "http://192.168.1.224:8080/itsmain/webapi/screen",
						contentType: "application/json;charset=utf-8", //必须有
						dataType: "json", //表示返回值类型，不必须
						data: dataSend,
						success: function(jsonResult) {
							//获取数据ok
							console.log(jsonResult);
							showScreen();
						}
					});
				} else if(addType == "交换机") {
					console.log("添加交换机")
					$.ajax({
						type: "POST",
						url: "http://192.168.1.224:8080/itsmain/webapi/switch_board",
						contentType: "application/json;charset=utf-8", //必须有
						dataType: "json", //表示返回值类型，不必须
						data: dataSend,
						success: function(jsonResult) {
							//获取数据ok
							console.log(jsonResult);
							showSwitchBoard();
						}
					});
				} else if(addType == "网闸") {
					console.log("添加网闸")
					$.ajax({
						type: "POST",
						url: "http://192.168.1.224:8080/itsmain/webapi/gatekeeper",
						contentType: "application/json;charset=utf-8", //必须有
						dataType: "json", //表示返回值类型，不必须
						data: dataSend,
						success: function(jsonResult) {
							//获取数据ok
							console.log(jsonResult);
							showGatekeeper();
						}
					});
				}
			}
		}
	}, {
		html: '<button type="button" class="btn btn-sm btn-default btn-cancel">取消</button>',
		selector: '.btn-cancel',
		callback: function() {
			//点击取消按钮的回调
		}
	}],
});

function change(op) {
	console.log(op);
	if(op == "道路") {
		addModal2.setContent($("#add_modal_road").html());
	} else if(op == "信号机") {
		addModal.setContent($("#add_modal_signal_machine").html());
	} else if(op == "信号灯") {
		addModal.setContent($("#add_modal_signal_lamp").html());
	} else if(op == "诱导板") {
		addModal.setContent($("#add_modal_ductor").html());
	} else if(op == "路口") {
		addModal2.setContent($("#add_modal_cross").html());
	} else if(op == "灯杆") {
		addModal.setContent($("#add_modal_lamp_post").html());
	} else if(op == "视频检测器") {
		addModal.setContent($("#add_modal_video_detector").html());
	} else if(op == "监控摄像机") {
		addModal.setContent($("#add_modal_cdd_camera").html());
	} else if(op == "线缆") {
		addModal.setContent($("#add_modal_cable").html());
	}
}

function RoadMap(uniqueNum, type, managementUnit, maintainanceUnit) {
	//映射道路字段
	this.id = 1;
	this.seq_no = uniqueNum;
	this.type = type || "道路";
	this.name = "新道路X";
	this.roadnum1 = "X01";
	this.roadnum2 = "Y01";
	this.inputer = "李四";
}

function CrossMap(uniqueNum, type, roads) {
	this.id = 1;
	this.seq_no = uniqueNum;
	this.type = type || 路口;
	this.name = "新路口X";
	this.roadnum1 = "X01";
	this.roadnum2 = "Y01";
	this.inputer = "李四";
}

function CameraMap(uniqueNum, name, purchaseTime, ip, brand, communicationState, feature, location, preset, state, inspectionPlanNumber,
	segmentNumber, messageSignNumber, direction, supplier, storageTime, warrantyPeriod, maintainanceRecord) {
	//映射监控摄像机的字段
	this.id = 1;
	this.seq_no = uniqueNum;
	this.position = location;
	this.type = "监控摄像机";
	this.status = "正常";
	this.fault = "无";
	this.purchase_time = purchaseTime;
	this.quality_time = warrantyPeriod;
	this.maintain_unit = "A单位";
	this.inputer = "李四";
}

function SignalMachineMap(uniqueNum, location, coord, videoDetectorNumber, brand, model, communicationState, assetState, department,
	supplier, purchaseTime, storageTime, warrantyPeriod, installationUnit, maintainanceUnit, managerContact, faultCount,
	maintainanctRecord) {
	//映射信号机的字段
	this.id = 1;
	this.seq_no = uniqueNum;
	this.position = location;
	this.type = "信号机";
	this.status = "正常";
	this.fault = "无";
	this.purchase_time = purchaseTime;
	this.quality_time = warrantyPeriod;
	this.maintain_unit = maintainanceUnit;
	this.inputer = "李XX";
}

function VideoDetectorMap(uniqueNum, location, coord, signalControllerNumber, brand, model, communicationState, direction,
	assetState, department, supplier, purchaseTime, storageTime, warrantyPeriod, installationUnit, maintainanceUnit, managerContact,
	faultCount, maintainanctRecord) {
	//映射视频检测器的字段
	this.id = 1;
	this.seq_no = uniqueNum;
	this.position = location;
	this.type = "视频检测器";
	this.status = "正常";
	this.fault = "无";
	this.purchase_time = purchaseTime;
	this.quality_time = warrantyPeriod;
	this.maintain_unit = maintainanceUnit;
	this.inputer = "李四";
}

function SignalLampMap(uniqueNum, location, coord, type, brand, model, direction, communicationState, signalControllerNumber,
	assetState, department, supplier, purchaseTime, storageTime, warrantyPeriod, installationUnit, maintainanceUnit,
	managerContact, faultCount, maintainanctRecord) {
	//映射信号灯的字段
	this.id = 1;
	this.seq_no = uniqueNum;
	this.position = location;
	this.type = "信号灯";
	this.status = "正常";
	this.fault = "无";
	this.purchase_time = purchaseTime;
	this.quality_time = warrantyPeriod;
	this.maintain_unit = maintainanceUnit;
	this.inputer = "李四";
}

function LampPoleMap(uniqueNum, location, coord, type, brand, model, direction, lampGroupNumber, assetState, department, supplier,
	purchaseTime, storageTime, warrantyPeriod, installationUnit, maintainanceUnit, managerContact, faultCount, maintainanctRecord) {
	//映射灯杆的字段
	console.log(maintainanceUnit);
	this.id = 1;
	this.seq_no = uniqueNum;
	this.position = location;
	this.type = type || "灯杆";
	this.status = "正常";
	this.fault = "无";
	this.purchase_time = purchaseTime;
	this.quality_time = warrantyPeriod;
	this.maintain_unit = maintainanceUnit;
	this.inputer = "李四";
}

function OpticCableMap(uniqueNum, location, coord, type, brand, model, assetState, department, supplier, purchaseTime, storageTime,
	warrantyPeriod, installationUnit, maintainanceUnit, managerContact, faultCount, maintainanctRecord) {
	//映射光缆的字段，这里先映射为线缆
	this.id = 1;
	this.seq_no = uniqueNum;
	this.position = location;
	this.type = type || "线缆";
	this.status = "正常";
	this.fault = "无";
	this.purchase_time = purchaseTime;
	this.quality_time = warrantyPeriod;
	this.maintain_unit = maintainanceUnit;
	this.inputer = "李四";
}

function MessageSignMap(uniqueNum, location, coord, type, brand, model, spec, communicationState, operatingMode, assetState, textTemplateNumber,
	textPlanNumber, publishSectionNumber, department, supplier, purchaseTime, storageTime, installationUnit, maintainanceUnit, managerContact,
	faultCount, maintainanceRecrod, textPublishRecord, publishSegmentGroup, publishSegmentRecord) {
	//映射发布版字段
	this.id = 1;
	this.seq_no = uniqueNum;
	this.position = location;
	this.type = type || "诱导板";
	this.status = "正常";
	this.fault = "无";
	this.purchase_time = purchaseTime;
	this.quality_time = "";
	this.maintain_unit = maintainanceUnit;
	this.inputer = "李四";
}

function NcssMap(uniqueNum, ip, type, configuration, brand, supplier, communication_state, asset_state, department, purchaseTime,
	storageTime, warrantyPeriod, supplierNumber, maintainanceUnit, managerContact, maintainanceRecord) {
	//映射内场设施字段
	this.id = 1;
	this.seq_no = uniqueNum;
	this.type = type;
	this.configuration = configuration;
	this.brand = brand;
	this.supplier = supplier;
	this.purchase_time = purchaseTime;
	this.quality_time = warrantyPeriod;
	this.maintain_unit = maintainanceUnit;
	this.inputer = "李四";
}

$(document).ready(function() {
	var $table = $("#table");

	function showServer() {
		//显示服务器
		$.ajax({
			url: "http://192.168.1.224:8080/itsmain/webapi/server",
			type: 'GET',
			//async: true,
			//cache: false,
			dataType: 'json',
			success: function(data) {
				var i = 0;
				console.log(data);
				var obServer = [];
				for(var o in data) {
					obServer[i] = new NcssMap(data[o].uniqueNum, data[o].ip, data[o].type, data[o].configuration, data[o].brand, data[o].supplier, data[o].communication_state,
						data[o].asset_state, data[o].department, data[o].purchaseTime, data[o].storageTime, data[o].warrantyPeriod, data[o].supplierNumber, data[o].maintainanceUnit,
						data[o].managerContact, data[o].maintainanceRecord);
					i++;
				}
				console.log(obServer)
				$table.bootstrapTable('refreshOptions', {
					url: '',
					data: obServer,
				});
			},
		});
	}

	function showWorkStation() {
		//显示工作站
		$.ajax({
			url: "http://192.168.1.224:8080/itsmain/webapi/work_station",
			type: 'GET',
			//async: true,
			//cache: false,
			dataType: 'json',
			success: function(data) {
				var i = 0;
				console.log(data);
				var obWorkStation = [];
				for(var o in data) {
					obWorkStation[i] = new NcssMap(data[o].uniqueNum, data[o].ip, data[o].type, data[o].configuration, data[o].brand, data[o].supplier, data[o].communication_state,
						data[o].asset_state, data[o].department, data[o].purchaseTime, data[o].storageTime, data[o].warrantyPeriod, data[o].supplierNumber, data[o].maintainanceUnit,
						data[o].managerContact, data[o].maintainanceRecord);
					i++;
				}
				console.log(obWorkStation)
				$table.bootstrapTable('refreshOptions', {
					url: '',
					data: obWorkStation,
				});
			},
		});
	}

	function showScreen() {
		//显示大屏
		$.ajax({
			url: "http://192.168.1.224:8080/itsmain/webapi/screen",
			type: 'GET',
			//async: true,
			//cache: false,
			dataType: 'json',
			success: function(data) {
				var i = 0;
				console.log(data);
				var obScreen = [];
				for(var o in data) {
					obScreen[i] = new NcssMap(data[o].uniqueNum, data[o].ip, data[o].type, data[o].configuration, data[o].brand, data[o].supplier, data[o].communication_state,
						data[o].asset_state, data[o].department, data[o].purchaseTime, data[o].storageTime, data[o].warrantyPeriod, data[o].supplierNumber, data[o].maintainanceUnit,
						data[o].managerContact, data[o].maintainanceRecord);
					i++;
				}
				console.log(obScreen)
				$table.bootstrapTable('refreshOptions', {
					url: '',
					data: obScreen,
				});
			},
		});
	}

	function showSwitchBoard() {
		//显示交换机
		$.ajax({
			url: "http://192.168.1.224:8080/itsmain/webapi/switch_board",
			type: 'GET',
			//async: true,
			//cache: false,
			dataType: 'json',
			success: function(data) {
				var i = 0;
				console.log(data);
				var obSwitchBoard = [];
				for(var o in data) {
					obSwitchBoard[i] = new NcssMap(data[o].uniqueNum, data[o].ip, data[o].type, data[o].configuration, data[o].brand, data[o].supplier, data[o].communication_state,
						data[o].asset_state, data[o].department, data[o].purchaseTime, data[o].storageTime, data[o].warrantyPeriod, data[o].supplierNumber, data[o].maintainanceUnit,
						data[o].managerContact, data[o].maintainanceRecord);
					i++;
				}
				console.log(obSwitchBoard)
				$table.bootstrapTable('refreshOptions', {
					url: '',
					data: obSwitchBoard,
				});
			},
		});
	}

	function showGatekeeper() {
		//显示网闸
		$.ajax({
			url: "http://192.168.1.224:8080/itsmain/webapi/gatekeeper",
			type: 'GET',
			//async: true,
			//cache: false,
			dataType: 'json',
			success: function(data) {
				var i = 0;
				console.log(data);
				var obGatekeeper = [];
				for(var o in data) {
					obGatekeeper[i] = new NcssMap(data[o].uniqueNum, data[o].ip, data[o].type, data[o].configuration, data[o].brand, data[o].supplier, data[o].communication_state,
						data[o].asset_state, data[o].department, data[o].purchaseTime, data[o].storageTime, data[o].warrantyPeriod, data[o].supplierNumber, data[o].maintainanceUnit,
						data[o].managerContact, data[o].maintainanceRecord);
					i++;
				}
				console.log(obGatekeeper)
				$table.bootstrapTable('refreshOptions', {
					url: '',
					data: obGatekeeper,
				});
			},
		});
	}

	function showRoad() {
		//显示道路
		$.ajax({
			url: "http://192.168.1.224:8080/itsmain/webapi/road",
			type: 'GET',
			//async: true,
			//cache: false,
			dataType: 'json',
			success: function(data) {
				var i = 0;
				console.log(data);
				var obRoad = [];
				for(var o in data) {
					obRoad[i] = new RoadMap(data[o].uniqueNum, data[o].type, data[o].managementUnit, data[o].maintainanceUnit);
					i++;
				}
				console.log(obRoad)
				$table.bootstrapTable('refreshOptions', {
					url: '',
					data: obRoad,
				});
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {}
		});
	}

	function showCross() {
		//显示路口
		$.ajax({
			url: "http://192.168.1.224:8080/itsmain/webapi/cross",
			type: 'GET',
			//async: true,
			//cache: false,
			dataType: 'json',
			success: function(data) {
				var i = 0;
				console.log(data);
				var obCross = [];
				for(var o in data) {
					obCross[i] = new CrossMap(data[o].uniqueNum, data[o].type, data[o].roads);
					i++;
				}
				console.log(obCross)
				$table.bootstrapTable('refreshOptions', {
					url: '',
					data: obCross,
				});
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {}
		});
	}

	function showCamera() {
		//显示监控摄像机
		$.ajax({
			url: "http://192.168.1.224:8080/itsmain/webapi/camera",
			type: 'GET',
			//async: true,
			//cache: false,
			dataType: 'json',
			success: function(data) {
				var i = 0;
				console.log(data);
				var obCamer = [];
				for(var o in data) {
					obCamer[i] = new CameraMap(data[o].uniqueNum, data[o].name, data[o].purchaseTime, data[o].ip, data[o].brand, data[o].communicationState, data[o].feature,
						data[o].location, data[o].preset, data[o].state, data[o].inspectionPlanNumber, data[o].segmentNumber, data[o].messageSignNumber, data[o].direction,
						data[o].supplier, data[o].storageTime, data[o].warrantyPeriod, data[o].maintainanceRecord);
					i++;
				}
				console.log(obCamer)
				$table.bootstrapTable('refreshOptions', {
					url: '',
					data: obCamer,
				});
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {}
		});
	}

	function showSingalMachine() {
		//显示信号机
		$.ajax({
			url: "http://192.168.1.224:8080/itsmain/webapi/signal_controller",
			type: 'GET',
			//async: true,
			//cache: false,
			dataType: 'json',
			success: function(data) {
				var i = 0;
				console.log(data);
				var obSingalMachine = [];
				for(var o in data) {
					obSingalMachine[i] = new SignalMachineMap(data[o].uniqueNum, data[o].location, data[o].coord, data[o].videoDetectorNumber, data[o].brand, data[o].model,
						data[o].communicationState, data[o].assetState, data[o].department, data[o].supplier, data[o].purchaseTime, data[o].storageTime,
						data[o].warrantyPeriod, data[o].installationUnit, data[o].maintainanceUnit, data[o].faultCount, data[o].maintainanctRecord);
					i++;
				}
				console.log(obSingalMachine)
				$table.bootstrapTable('refreshOptions', {
					url: '',
					data: obSingalMachine,
				});
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {}
		});
	}

	function showVideoDetector() {
		//显示视频检测器
		$.ajax({
			url: "http://192.168.1.224:8080/itsmain/webapi/video_detector",
			type: 'GET',
			//async: true,
			//cache: false,
			dataType: 'json',
			success: function(data) {
				var i = 0;
				console.log(data);
				var obVideoDetector = [];
				for(var o in data) {
					obVideoDetector[i] = new VideoDetectorMap(data[o].uniqueNum, data[o].location, data[o].coord, data[o].signalControllerNumber, data[o].brand, data[o].model,
						data[o].communicationState, data[o].direction, data[o].assetState, data[o].department, data[o].supplier, data[o].purchaseTime, data[o].storageTime,
						data[o].warrantyPeriod, data[o].installationUnit, data[o].maintainanceUnit, data[o].managerContact, data[o].faultCount, data[o].maintainanctRecord);
					i++;
				}
				console.log(obVideoDetector)
				$table.bootstrapTable('refreshOptions', {
					url: '',
					data: obVideoDetector,
				});
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {}
		});
	}

	function showSignalLampMap() {
		//显示信号灯
		$.ajax({
			url: "http://192.168.1.224:8080/itsmain/webapi/lamp_group",
			type: 'GET',
			//async: true,
			//cache: false,
			dataType: 'json',
			success: function(data) {
				var i = 0;
				console.log(data);
				var obSignalLamp = [];
				for(var o in data) {
					obSignalLamp[i] = new SignalLampMap(data[o].uniqueNum, data[o].location, data[o].coord, data[o].type, data[o].brand, data[o].model, data[o].direction, data[o].communicationState, data[0].signalControllerNumber,
						data[o].assetState, data[o].department, data[o].supplier, data[o].purchaseTime, data[o].storageTime, data[o].warrantyPeriod, data[o].installationUnit, data[o].maintainanceUnit);
					i++;
				}
				console.log(obSignalLamp)
				$table.bootstrapTable('refreshOptions', {
					url: '',
					data: obSignalLamp,
				});
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {}
		});
	}

	function showLampPole() {
		//显示灯杆	
		$.ajax({
			url: "http://192.168.1.224:8080/itsmain/webapi/lamp_pole",
			type: 'GET',
			//async: true,
			//cache: false,
			dataType: 'json',
			success: function(data) {
				var i = 0;
				console.log(data);
				var obLampPole = [];
				for(var o in data) {
					obLampPole[i] = new LampPoleMap(data[o].uniqueNum, data[o].location, data[o].coord, data[o].type, data[o].brand, data[o].model, data[o].direction, data[o].lampGroupNumber,
						data[o].assetState, data[o].department, data[o].supplier, data[o].purchaseTime, data[o].storageTime, data[o].warrantyPeriod,
						data[o].installationUnit, data[o].maintainanceUnit, data[o].managerContact, data[o].faultCount, data[o].maintainanctRecord);
					i++;
				}
				console.log(obLampPole)
				$table.bootstrapTable('refreshOptions', {
					url: '',
					data: obLampPole,
				});
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {}
		});
	}

	function showCable() {
		//显示线缆	
		$.ajax({
			url: "http://192.168.1.224:8080/itsmain/webapi/fiber_optic_cable",
			type: 'GET',
			//async: true,
			//cache: false,
			dataType: 'json',
			success: function(data) {
				var i = 0;
				console.log(data);
				var obCable = [];
				for(var o in data) {
					obCable[i] = new OpticCableMap(data[o].uniqueNum, data[o].location, data[o].coord, data[o].type, data[o].brand, data[o].model, data[o].assetState,
						data[o].department, data[o].supplier, data[o].purchaseTime, data[o].storageTime, data[o].warrantyPeriod, data[o].installationUnit,
						data[o].maintainanceUnit, data[o].managerContact, data[o].faultCount, data[o].maintainanctRecord);
					i++;
				}
				console.log(obCable)
				$table.bootstrapTable('refreshOptions', {
					url: '',
					data: obCable,
				});
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {}
		});
	}

	function showMessageSign() {
		//显示诱导板
		$.ajax({
			url: "http://192.168.1.224:8080/itsmain/webapi/message_sign",
			type: 'GET',
			//async: true,
			//cache: false,
			dataType: 'json',
			success: function(data) {
				var i = 0;
				console.log(data);
				var obMessageSign = [];
				for(var o in data) {
					obMessageSign[i] = new MessageSignMap(data[o].uniqueNum, data[o].location, data[o].coord, data[o].type, data[o].brand, data[o].model,
						data[o].spec, data[o].communicationState, data[o].operatingMode, data[o].assetState, data[o].textTemplateNumber, data[o].textPlanNumber,
						data[o].publishSectionNumber, data[o].department, data[o].supplier, data[o].purchaseTime, data[o].storageTime, data[o].installationUnit,
						data[o].maintainanceUnit, data[o].managerContact, data[o].faultCount, data[o].maintainanceRecrod, data[o].textPublishRecord,
						data[o].publishSegmentGroup, data[o].publishSegmentRecord);
					i++;
				}
				console.log(obMessageSign)
				$table.bootstrapTable('refreshOptions', {
					url: '',
					data: obMessageSign,
				});
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {}
		});
	}

	var detailmodal = new Modal({ //显示外场设施的详情
		title: '设施信息',
		content: $('#detail_wcss_modal').html(),
		width: 700,
		buttons: [{
			html: '<button type="button" class="btn btn-sm btn-ok">确定</button>',
			selector: '.btn-ok',
			callback: function() {
				//点击确定按钮的回调
			}
		}]
	});
	var detailmodal2 = new Modal({ //显示业务设施的详情
		title: '设施信息',
		content: $('#detail_ywss_modal').html(),
		width: 700,
		buttons: [{
			html: '<button type="button" class="btn btn-sm btn-ok">确定</button>',
			selector: '.btn-ok',
			callback: function() {
				//点击确定按钮的回调
			}
		}]
	});
	var detailmodal3 = new Modal({ //显示内场设施的详情
		title: '设施信息',
		content: $('#detail_ncss_modal').html(),
		width: 700,
		buttons: [{
			html: '<button type="button" class="btn btn-sm btn-ok">确定</button>',
			selector: '.btn-ok',
			callback: function() {
				//点击确定按钮的回调
			}
		}]
	});
	window.operateEvents3 = { //业务设施表格操作事件
		'click .RoleOfA': function(e, value, row, index) {
			detailmodal3.open();
			$("#dev_id").val(row.id);
			$("#seq_no").val(row.seq_no);
			$("#configuration").val(row.configuration);
			$("#dev_type1").val(row.type);
			$("#brand").val(row.brand);
			$("#buy_time").val(row.purchase_time);
			$("#quality_time").val(row.quality_time);
			$("#inputer").val(row.inputer);
			$("#maintain_unit").val(row.maintain_unit);
			//for (var i in row ) console.log(i);
		}
	};
	window.operateEvents2 = { //业务设施表格操作事件
		'click .RoleOfA': function(e, value, row, index) {
			detailmodal2.open();
			$("#dev_id22").val(row.id);
			$("#seq_no22").val(row.seq_no);
			$("#dev_type22").val(row.type);
			$("#dev_name22").val(row.name);
			$("#roadnum1").val(row.roadnum1);
			$("#roadnum2").val(row.roadnum2);
			$("#inputer22").val(row.inputer);
			//for (var i in row ) console.log(i);
		}
	};
	window.operateEvents1 = { //外场设施表格操作事件
		'click .RoleOfA': function(e, value, row, index) {
			detailmodal.open();
			$("#dev_id").val(row.id);
			$("#seq_no").val(row.seq_no);
			$("#dev_pos").val(row.position);
			$("#dev_type1").val(row.type);
			$("#dev_status").val(row.status);
			$("#fault").val(row.fault);
			$("#buy_time").val(row.purchase_time);
			$("#quality_time").val(row.quality_time);
			$("#inputer").val(row.inputer);
			$("#maintain_unit").val(row.maintain_unit);
		}
	};

	function operateFormatter(value, row, index) {
		return [
			'<button id="btn_detail" type="button" class="RoleOfA btn-default bt-select">详情</button>',
		].join('');
	}
	var importModel = new Modal({
		title: '导入数据',
		content: '<input type="file"/>',
		width: 400,
		onOk: function() {
			/*通过后台解析文件数据为json格式*/
		}
	});

	var editWcssModal = new Modal({ //编辑外场设施
		title: '设施信息',
		content: $('#edit_wcss_modal').html(),
		width: 700,
		onContentReady: function() {
			console.log('change');
			dateForm();
			$("select").select2();
		},
		onOk: function() {
			var $form = this.$modal.find('form');
			var data = $form.serializeArray(); //form中的输入框须有name属性，否则取不到数据。
			var postData = {};
			data.forEach(function(obj) {
				postData[obj.name] = obj.value;
			});
			console.log(postData);
			if(postData) {
				_post();
			}

			function _post() {
				//异步任务
				var num = $.map($table.bootstrapTable('getSelections'), function(row) {
					return row.seq_no;
				});
				var editType = $('#wcssDev_type').val();
				console.log(editType);
				if(editType == "监控摄像机") {
					var dataSend = JSON.stringify({
						"uniqueNum": num,
						"name": postData['wcss_name'] || 'camer01',
						"brand": postData['wcss_brand'] || 'xx',
						"purchaseTime": postData['wcss_buyTime'] || '01/27/2017',
					});
					$.ajax({
						type: "PUT",
						url: "http://192.168.1.224:8080/itsmain/webapi/camera",
						contentType: "application/json;charset=utf-8",
						dataType: "json",
						data: dataSend,
						success: function(jsonResult) {
							console.log(jsonResult);
							showCamera();
						}
					});
				} else if(editType == "信号机") {
					var datasend = JSON.stringify({
						"brand": postData['wcss_brand'] || "xsx",
						"name": postData['wcss_name'] || "signalMachine00",
						"uniqueNum": num,
						"purchaseTime": postData['wcss_buyTime'] || "01/24/2011"
					});
					$.ajax({
						type: "PUT",
						url: "http://192.168.1.224:8080/itsmain/webapi/signal_controller",
						contentType: "application/json;charset=utf-8",
						dataType: "json",
						data: datasend,
						success: function(jsonResult) {
							console.log(jsonResult);
							showSingalMachine();
						}
					});
				} else if(editType == "信号灯") {
					var datasend = JSON.stringify({
						"brand": "xsx",
						"name": "signalLamp00",
						"uniqueNum": num,
						"purchaseTime": postData['wcss_buyTime'] || "01/24/2011"
					});
					$.ajax({
						type: "PUT",
						url: "http://192.168.1.224:8080/itsmain/webapi/lamp_group",
						contentType: "application/json;charset=utf-8",
						dataType: "json",
						data: datasend,
						success: function(jsonResult) {
							console.log(jsonResult);
							showSignalLampMap();
						}
					});
				} else if(editType == "灯杆") {
					var datasend = JSON.stringify({
						"brand": "xsx",
						"name": "lampPole00",
						"uniqueNum": num,
						"purchaseTime": postData['wcss_buyTime'] || "01/24/2011"
					});
					$.ajax({
						type: "PUT",
						url: "http://192.168.1.224:8080/itsmain/webapi/lamp_pole",
						contentType: "application/json;charset=utf-8",
						dataType: "json",
						data: datasend,
						success: function(jsonResult) {
							console.log(jsonResult);
							showLampPole();
						}
					});
				} else if(editType == "视频检测器") {
					var datasend = JSON.stringify({
						"brand": "xsx",
						"name": "videoDetector00",
						"uniqueNum": num,
						"purchaseTime": postData['wcss_buyTime'] || "01/24/2011"
					});
					$.ajax({
						type: "PUT",
						url: "http://192.168.1.224:8080/itsmain/webapi/video_detector",
						contentType: "application/json;charset=utf-8",
						dataType: "json",
						data: datasend,
						success: function(jsonResult) {
							console.log(jsonResult);
							showVideoDetector();
						}
					});
				} else if(editType == "线缆") {
					var datasend = JSON.stringify({
						"brand": "xsx",
						"name": "cable00",
						"uniqueNum": num,
						"purchaseTime": postData['wcss_buyTime'] || "01/24/2011"
					});
					$.ajax({
						type: "PUT",
						url: "http://192.168.1.224:8080/itsmain/webapi/fiber_optic_cable",
						contentType: "application/json;charset=utf-8",
						dataType: "json",
						data: datasend,
						success: function(jsonResult) {
							console.log(jsonResult);
							showCable();
						}
					});
				} else if(editType == "诱导板") {
					var datasend = JSON.stringify({
						"brand": postData['brand'] || "ac",
						"name": "诱导板00",
						"uniqueNum": num,
						"purchaseTime": postData['wcss_buyTime'] || "01/24/2011"
					});
					$.ajax({
						type: "PUT",
						url: "http://192.168.1.224:8080/itsmain/webapi/message_sign",
						contentType: "application/json;charset=utf-8",
						dataType: "json",
						data: datasend,
						success: function(jsonResult) {
							console.log(jsonResult);
							showMessageSign();
						}
					});
				}

			}
		},
	});
	var editNcssModal = new Modal({ //编辑内场设施
		title: '设施信息',
		content: $('#edit_ncss_modal').html(),
		width: 700,
		onContentReady: function() {
			console.log('change');
			dateForm();
			$("select").select2();
		},
		onOk: function() {
			var $form = this.$modal.find('form');
			var data = $form.serializeArray(); //form中的输入框须有name属性，否则取不到数据。
			var postData = {};
			data.forEach(function(obj) {
				postData[obj.name] = obj.value;
			});
			console.log(postData);
			if(postData) {
				_post();
			}

			function _post() {
				//异步任务
				var num = $.map($table.bootstrapTable('getSelections'), function(row) {
					return row.seq_no;
				});
				var editType = $('#ncssDev_type').val();
				console.log(editType);
				if(editType == "大屏") {
					var datasend = JSON.stringify({
						"uniqueNum": num,
						"type": "大屏",
						"configuration": postData['ncss_configuration'] || 'screen01',
						"brand": postData['ncss_brand'] || 'xx',
						"purchaseTime": postData['ncss_buyTime'] || '01/27/2017'
					});
					$.ajax({
						type: "PUT",
						url: "http://192.168.1.224:8080/itsmain/webapi/screen",
						contentType: "application/json;charset=utf-8",
						dataType: "json",
						data: datasend,
						success: function(jsonResult) {
							console.log(jsonResult);
							showScreen();
						}
					});
				} else if(editType == "服务器") {
					var datasend = JSON.stringify({
						"brand": postData['ncss_brand'] || "xsx",
						"configuration": postData['ncss_configuration'] || 'serverss',
						"uniqueNum": num,
						"type": "服务器",
						"purchaseTime": postData['ncss_buyTime'] || "01/24/2011"
					});
					$.ajax({
						type: "PUT",
						url: "http://192.168.1.224:8080/itsmain/webapi/server",
						contentType: "application/json;charset=utf-8",
						dataType: "json",
						data: datasend,
						success: function(jsonResult) {
							console.log(jsonResult);
							showServer();
						}
					});
				} else if(editType == "工作站") {
					var datasend = JSON.stringify({
						"brand": postData['ncss_brand'] || "xsx",
						"name": "workstation00",
						"type": "工作站",
						"uniqueNum": num,
						"purchaseTime": postData['ncss_buyTime'] || "01/24/2011"
					});
					$.ajax({
						type: "PUT",
						url: "http://192.168.1.224:8080/itsmain/webapi/work_station",
						contentType: "application/json;charset=utf-8",
						dataType: "json",
						data: datasend,
						success: function(jsonResult) {
							console.log(jsonResult);
							showWorkStation();
						}
					});
				} else if(editType == "交换机") {
					var datasend = JSON.stringify({
						"brand": postData['ncss_brand'] || "xsx",
						"configuration": postData['ncss_configuration'],
						"uniqueNum": num,
						"type": "交换机",
						"purchaseTime": postData['ncss_buyTime'] || "01/24/2011"
					});
					$.ajax({
						type: "PUT",
						url: "http://192.168.1.224:8080/itsmain/webapi/switch_board",
						contentType: "application/json;charset=utf-8",
						dataType: "json",
						data: datasend,
						success: function(jsonResult) {
							console.log(jsonResult);
							showSwitchBoard();
						}
					});
				} else if(editType == "网闸") {
					var datasend = JSON.stringify({
						"brand": postData['ncss_brand'] || "xsx",
						"configuration": postData['ncss_configuration'],
						"uniqueNum": num,
						"type": "网闸",
						"purchaseTime": postData['ncss_buyTime'] || "01/24/2011"
					});
					$.ajax({
						type: "PUT",
						url: "http://192.168.1.224:8080/itsmain/webapi/gatekeeper",
						contentType: "application/json;charset=utf-8",
						dataType: "json",
						data: datasend,
						success: function(jsonResult) {
							console.log(jsonResult);
							showGatekeeper();
						}
					});
				}
			}
		},
	});
	var editYwssModal = new Modal({ //编辑业务设施
		title: '设施信息',
		content: $('#edit_ywss_modal').html(),
		width: 700,
		onContentReady: function() {
			console.log('change');
			dateForm();
			$("select").select2();
		},
		onOk: function() {
			var $form = this.$modal.find('form');
			var data = $form.serializeArray(); //form中的输入框须有name属性，否则取不到数据。
			console.log($form);
			var postData = {};
			data.forEach(function(obj) {
				postData[obj.name] = obj.value;
			});
			if(postData) {
				_post();
			}

			function _post() {
				//异步任务
				var num = $.map($table.bootstrapTable('getSelections'), function(row) {
					console.log(row)
					return row.seq_no;
				});
				console.log(num);
				var editType = $('#ywssDev_type').val();
				console.log(editType);
				if(editType == "道路") {
					var dataSend = JSON.stringify({
						"uniqueNum": postData['ywss_num'],
						"type": postData['ywssDev_type'] || '道路',
						"managementUnit": postData['managementUnit'] || 'xx',
						"maintainanceUnit": postData['maintainanceUnit'] || '01/27/2017'
					});
					$.ajax({
						type: "PUT",
						url: "http://192.168.1.224:8080/itsmain/webapi/road",
						contentType: "application/json;charset=utf-8",
						dataType: "json",
						data: dataSend,
						success: function(jsonResult) {
							console.log(jsonResult);
							showRoad();
						}
					});
				}
				if(editType == "路口") {
					var datasend = JSON.stringify({
						"uniqueNum": postData['ywss_num'],
						"type": postData['ywssDev_type'] || '路口',
						"managementUnit": postData['managementUnit'] || 'xx',
						"maintainanceUnit": postData['maintainanceUnit'] || '01/27/2017'
					});
					$.ajax({
						type: "PUT",
						url: "http://192.168.1.224:8080/itsmain/webapi/cross",
						contentType: "application/json;charset=utf-8",
						dataType: "json",
						data: datasend,
						success: function(jsonResult) {
							console.log(jsonResult);
							showCross();
						}
					});
				}
			}
		},
	});
	$('#toolbar').html($('#wcss_toolbar').html());
	$("select").select2();
	$table.bootstrapTable({
		//url: 'json/dev.json',
		data: wcssdata,
		toolbar: '#toolbar', //工具按钮用哪个容器
		cache: false, //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		pagination: true, //是否显示分页
		sortable: true, //是否启用排序
		sortOrder: "asc", //排序方式
		//queryParams: postQueryParams,//传递参数（*）
		//sidePagination: "server",      //分页方式：client客户端分页，server服务端分页（*）
		pageSize: 20, //每页的记录行数（*）
		pageList: [10, 25, 50, 100], //可供选择的每页的行数（*）
		strictSearch: true,
		uniqueId: "seq_no", //每一行的唯一标识，一般为主键列
		paginationHAlign: "left",
		singleSelect: true,
		//search:true,               //是否显示表格搜索，此搜索是客户端搜索，不会进服务端
		//strictSearch: true,
		//showColumns: true, //是否显示所有的列
		//showRefresh: true, //是否显示刷新按钮
		clickToSelect: true, //是否启用点击选中行
		paginationPreText: "<<",
		paginationNextText: ">>",
		columns: [{
			checkbox: true,
		}, {
			field: 'id',
			title: '序号',
		}, {
			field: 'seq_no',
			title: '编号',
		}, {
			field: 'type',
			title: '类型',
		}, {
			field: 'position',
			title: '位置',
		}, {
			field: 'status',
			title: '设备状态',
		}, {
			field: 'fault',
			title: '故障现象',
		}, {
			field: 'purchase_time',
			title: '采购时间',
		}, {
			field: 'quality_time',
			title: '质保时间',
		}, {
			field: 'maintain_unit',
			title: '维护单位',
		}, {
			field: 'inputer',
			title: '录入者',
		}, {
			field: 'operate',
			title: '操作',
			width: '80px',
			events: operateEvents1,
			formatter: operateFormatter
		}, ],
	});
	$(".radio_1").change(function() {
		var devop = $("#dev_container input[name='devoption']:checked").val();
		console.log(devop);
		if(devop == "业务设施") {
			$('#toolbar').html($('#ywss_toolbar').html());
			$("select").select2();
			$('#btn_search2').click(function() {
				search2();
			});
			$("#btn_add2").click(function() {
				addModal2.open();
			});
			$('#btn_delete2').click(function() {
				del();
			});
			$("#btn_edit2").click(function() {
				edit2();
			});
			$('#btn_import2').click(function() {
				importModel.open();
			});
			$("#table").bootstrapTable('refreshOptions', {
				data: ywssdata,
				columns: [{
					checkbox: true,
				}, {
					field: 'id',
					title: '序号',
					width: "75px",
				}, {
					field: 'seq_no',
					title: '编号',
				}, {
					field: 'type',
					title: '类型',
				}, {
					field: 'name',
					title: '名称',
				}, {
					field: 'roadnum1',
					title: '所属道路编号',
				}, {
					field: 'roadnum2',
					title: '关联道路编号',
				}, {
					field: 'inputer',
					title: '录入者',
				}, {
					field: 'operate',
					title: '操作',
					width: '80px',
					events: operateEvents2,
					formatter: operateFormatter
				}, ]
			});
		} else if(devop == "外场设施") {
			$('#toolbar').html($('#wcss_toolbar').html());
			$("select").select2();
			$('#btn_search1').click(function() {
				search1();
			});
			$("#btn_add1").click(function() {
				addModal.open();
				//addModal.setContent('ddd');
			});
			$('#btn_delete1').click(function() {
				del();
			});
			$("#btn_edit1").click(function() {
				edit1();
			});
			$('#btn_import1').click(function() {
				importModel.open();
			});
			$("#table").bootstrapTable('refreshOptions', {
				data: wcssdata,
				columns: [{
					checkbox: true,
				}, {
					field: 'id',
					title: '序号',
				}, {
					field: 'seq_no',
					title: '编号',
				}, {
					field: 'type',
					title: '类型',
				}, {
					field: 'position',
					title: '位置',
				}, {
					field: 'status',
					title: '设备状态',
				}, {
					field: 'fault',
					title: '故障现象',
				}, {
					field: 'purchase_time',
					title: '采购时间',
				}, {
					field: 'quality_time',
					title: '质保时间',
				}, {
					field: 'maintain_unit',
					title: '维护单位',
				}, {
					field: 'inputer',
					title: '录入者',
				}, {
					field: 'operate',
					title: '操作',
					width: '80px',
					events: operateEvents1,
					formatter: operateFormatter
				}]
			});
		} else if(devop == "内场设施") {
			$('#toolbar').html($('#ncss_toolbar').html());
			$("select").select2();
			$('#btn_search3').click(function() {
				search3();
			});
			$("#btn_add3").click(function() {
				addModal3.open();
			});
			$('#btn_delete3').click(function() {
				del();
			});
			$("#btn_edit3").click(function() {
				edit3();
			});
			$('#btn_import3').click(function() {
				//importMode3.open();
			});
			$("#table").bootstrapTable('refreshOptions', {
				data: ncssdata,
				columns: [{
					checkbox: true,
				}, {
					field: 'seq_no',
					title: '编号',
				}, {
					field: 'type',
					title: '类型',
				}, {
					field: 'configuration',
					title: '配置描述',
				}, {
					field: 'brand',
					title: '品牌',
				}, {
					field: 'supplier',
					title: '供货商',
				}, {
					field: 'purchase_time',
					title: '采购时间',
				}, {
					field: 'quality_time',
					title: '质保时间',
				}, {
					field: 'maintain_unit',
					title: '维护单位',
				}, {
					field: 'inputer',
					title: '录入者',
				}, {
					field: 'operate',
					title: '操作',
					width: '80px',
					events: operateEvents3,
					formatter: operateFormatter
				}, ]
			});
		}
	});

	$('#btn_search1').click(function() {
		search1();
	});

	function search1() {
		var devType = $('#dev_type_tool1').val();
		var unit = $('#unit_tool1').val();
		console.log(devType);
		if(devType == "监控摄像机") {
			showCamera();
		} else if(devType == "信号机") {
			showSingalMachine();
		} else if(devType == "视频检测器") {
			showVideoDetector();
		} else if(devType == "信号灯") {
			showSignalLampMap();
		} else if(devType == "灯杆") {
			showLampPole();
		} else if(devType == "线缆") {
			showCable();
		} else if(devType == "诱导板") {
			showMessageSign();
		}
	}

	function search2() {
		var devType = $('#dev_type_tool2').val();
		var unit = $('#unit_tool2').val();
		console.log(devType);
		if(devType == "道路") {
			showRoad();
		} else if(devType == "路口") {
			showCross();
		}
	}

	function search3() {
		var devType = $('#dev_type_tool3').val();
		var unit = $('#unit_tool3').val();
		console.log(devType);
		if(devType == "服务器") {
			showServer();
		} else if(devType == "工作站") {
			showWorkStation();
		} else if(devType == "大屏") {
			showScreen();
		} else if(devType == "交换机") {
			showSwitchBoard();
		} else if(devType == "网闸") {
			showGatekeeper();
		}
	}

	function del() {
		var ids = $.map($table.bootstrapTable('getSelections'), function(row) {
			return row.id;
		});
		if(ids == "") Alert('<h4 style="color:red;text-align:center;">请选取您要删除的数据！</h4>');
		else Confirm({
			msg: '<h4 style="color:red;text-align:center;">您确认要删除此条数据！</h4>',
			onOk: function() {

				var selectRow = $table.bootstrapTable('getSelections');
				var num = selectRow[0].seq_no;
				var delType = selectRow[0].type;
				console.log(num);
				console.log(delType);
				if(delType == "监控摄像机") {
					console.log("删除监控摄像机");
					$.ajax({
						url: 'http://192.168.1.224:8080/itsmain/webapi/camera/' + num,
						type: 'DELETE',
						success: function(result) {
							console.log(result);
							showCamera();
						},
						error: function(e) {
							console.log("删除失败");
						}
					});
				} else if(delType == "信号机") {
					$.ajax({
						url: 'http://192.168.1.224:8080/itsmain/webapi/signal_controller/' + num,
						type: 'DELETE',
						success: function(result) {
							console.log(result);
							showSingalMachine();
						},
						error: function(e) {
							console.log("删除失败");
						}
					});
				} else if(delType == "视频检测器") {
					$.ajax({
						url: 'http://192.168.1.224:8080/itsmain/webapi/video_detector/' + num,
						type: 'DELETE',
						success: function(result) {
							console.log(result);
							showVideoDetector();
						},
						error: function(e) {
							console.log("删除失败");
						}
					});
				} else if(delType == "信号灯") {
					$.ajax({
						url: 'http://192.168.1.224:8080/itsmain/webapi/lamp_group/' + num,
						type: 'DELETE',
						success: function(result) {
							console.log(result);
							showSignalLampMap();
						},
						error: function(e) {
							console.log("删除失败");
						}
					});
				} else if(delType == "灯杆") {
					$.ajax({
						url: 'http://192.168.1.224:8080/itsmain/webapi/lamp_pole/' + num,
						type: 'DELETE',
						success: function(result) {
							console.log(result);
							showLampPole();
						},
						error: function(e) {
							console.log("删除失败");
						}
					});
				} else if(delType == "线缆") {
					$.ajax({
						url: 'http://192.168.1.224:8080/itsmain/webapi/fiber_optic_cable/' + num,
						type: 'DELETE',
						success: function(result) {
							console.log(result);
							showCable();
						},
						error: function(e) {
							console.log("删除失败");
						}
					});
				} else if(delType == "诱导板") {
					$.ajax({
						url: 'http://192.168.1.224:8080/itsmain/webapi/message_sign/' + num,
						type: 'DELETE',
						success: function(result) {
							console.log(result);
							showMessageSign();
						},
						error: function(e) {
							console.log("删除失败");
						}
					});
				} else if(delType == "道路") {
					console.log("删除道路")
					$.ajax({
						url: 'http://192.168.1.224:8080/itsmain/webapi/road/' + num,
						type: 'DELETE',
						success: function(result) {
							console.log(result);
							showRoad();
						},
						error: function(e) {
							console.log("删除失败");
						}
					});
				} else if(delType == "路口") {
					$.ajax({
						url: 'http://192.168.1.224:8080/itsmain/webapi/cross/' + num,
						type: 'DELETE',
						success: function(result) {
							console.log(result);
							showCross();
						},
						error: function(e) {
							console.log("删除失败");
						}
					});
				} else if(delType == "大屏") {
					$.ajax({
						url: 'http://192.168.1.224:8080/itsmain/webapi/screen/' + num,
						type: 'DELETE',
						success: function(result) {
							console.log(result);
							showScreen();
						},
						error: function(e) {
							console.log("删除失败");
						}
					});
				} else if(delType == "服务器") {
					$.ajax({
						url: 'http://192.168.1.224:8080/itsmain/webapi/server/' + num,
						type: 'DELETE',
						success: function(result) {
							console.log(result);
							showServer();
						},
						error: function(e) {
							console.log("删除失败");
						}
					});
				} else if(delType == "工作站") {
					$.ajax({
						url: 'http://192.168.1.224:8080/itsmain/webapi/work_station/' + num,
						type: 'DELETE',
						success: function(result) {
							console.log(result);
							showWorkStation();
						},
						error: function(e) {
							console.log("删除失败");
						}
					});
				} else if(delType == "交换机") {
					$.ajax({
						url: 'http://192.168.1.224:8080/itsmain/webapi/switch_board/' + num,
						type: 'DELETE',
						success: function(result) {
							console.log(result);
							showSwitchBoard();
						},
						error: function(e) {
							console.log("删除失败");
						}
					});
				} else if(delType == "网闸") {
					$.ajax({
						url: 'http://192.168.1.224:8080/itsmain/webapi/gatekeeper/' + num,
						type: 'DELETE',
						success: function(result) {
							console.log(result);
							showGatekeeper();
						},
						error: function(e) {
							console.log("删除失败");
						}
					});
				}
			},
			onCancel: function() {

			}
		});
	}

	function edit1() { //编辑外场设施
		var ids = $.map($table.bootstrapTable('getSelections'), function(row) {
			return row.id;
		});
		if(ids == "") Alert('<h4 style="color:red;text-align:center;">请选取您要编辑的数据！</h4>');
		else {
			$.map($table.bootstrapTable('getSelections'), function(row) {
				//for(var i in row) console.log(i)
				editWcssModal.open();
				$("#wcss_num").val(row.seq_no);
				$("#wcssDev_pos").val(row.position);
				$("#wcssDev_type").val(row.type);
				$("#wcssDev_status").val(row.status);
				$("#wcss_fault").val(row.fault);
				$("#wcss_buyTime").val(row.purchase_time);
				$("#wcss_qualityTime").val(row.quality_time);
				$("#wcss_maintainTime").val(row.maintain_time);
				$("#wcss_inputer").val(row.inputer);
				$("#wcss_maintainUnit").val(row.maintain_unit);
			});
		}
	}

	function edit2() { //编辑业务设施
		var ids = $.map($table.bootstrapTable('getSelections'), function(row) {
			return row.id;
		});
		if(ids == "") Alert('<h4 style="color:red;text-align:center;">请选取您要编辑的数据！</h4>');
		else {
			$.map($table.bootstrapTable('getSelections'), function(row) {
				//for(var i in row) console.log(i)
				console.log(addModal2.$modal);
				editYwssModal.open();
				$("#ywss_num").val(row.seq_no);
				$("#ywssDev_type").val(row.type);
				$("#ywss_name").val(row.name);
				$("#roadnum1").val(row.roadnum1); //所属道路编号
				$("#roadnum2").val(row.roadnum2); //关联道路编号
				$("#ywss_inputer").val(row.inputer);
			});
		}
	}

	function edit3() { //编辑内场设施
		var seq_no = $.map($table.bootstrapTable('getSelections'), function(row) {
			return row.seq_no;
		});
		if(seq_no == "") Alert('<h4 style="color:red;text-align:center;">请选取您要编辑的数据！</h4>');
		else {
			$.map($table.bootstrapTable('getSelections'), function(row) {
				//for(var i in row) console.log(i)
				editNcssModal.open();
				$("#ncss_num").val(row.seq_no);
				$("#ncssDev_pos").val(row.position);
				$("#ncssDev_type").val(row.type);
				$("#ncssDev_status").val(row.status);
				$("#ncss_fault").val(row.fault);
				$("#ncss_buyTime").val(row.purchase_time);
				$("#ncss_qualityTime").val(row.quality_time);
				$("#ncss_maintainTime").val(row.maintain_time);
				$("#ncss_inputer").val(row.inputer);
				$("#ncss_maintainUnit").val(row.maintain_unit);
			});
		}
	}
	$('#btn_delete1').click(function() {
		del();
	});
	$("#btn_add1").click(function() {
		addModal.open();
	});

	$("#btn_edit1").click(function() {
		edit1();
	});
	$('#btn_import1').click(function() {
		importModel.open();
	});
	$('#bt_selectall').click(function() {
		$table.bootstrapTable('checkAll');
	});
	$('#bt_unselectall').click(function() {
		$table.bootstrapTable('uncheckAll');
	});
});