$(document).ready(function() {
	$("select").select2();
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
	var detailmodal = new Modal({
		title: '设施信息',
		content: $('#detail_modal_cont').html(),
		width: 700,
		buttons: [{
			html: '<button type="button" class="btn btn-sm btn-primary btn-ok">确定</button>',
			selector: '.btn-ok',
			callback: function() {
				//点击确定按钮的回调
			}
		}]

	});
	var passmodal=new Modal({
		title: '通过信息',
		content: $('#pass_modal_cont').html(),
		width: 400,
		buttons: [{
			html: '<button type="button" class="btn btn-sm btn-primary btn-ok">保存</button>',
			selector: '.btn-ok',
			callback: function() {
				//点击确定按钮的回调
			}
		},{
			html: '<button type="button" class="btn btn-sm btn-primary btn-cancel">取消</button>',
			selector: '.btn-cancel',
			callback: function() {
				//点击确定按钮的回调
			}
		}]
	});
	var rejectmodal=new Modal({
		title: '驳回信息',
		content:'<form class="reject-form"><div class="form-inline"><span>驳回理由</span>'+
				'<textarea name="reject" style="vertical-align: middle;" rows="10" cols="35"></textarea>'+
				'</div></form>' ,
		width: 400,
		buttons: [{
			html: '<button type="button" class="btn btn-sm btn-primary btn-ok">保存</button>',
			selector: '.btn-ok',
			callback: function() {
				//点击确定按钮的回调
			}
		},{
			html: '<button type="button" class="btn btn-sm btn-primary btn-cancel">取消</button>',
			selector: '.btn-cancel',
			callback: function() {
				//点击确定按钮的回调
			}
		}]
	});
	window.operateEvents = {
		'click .RoleOfA': function(e, value, row, index) {
			detailmodal.open();
			$("#dev_id").val(row.id);
			$("#seq_no").val(row.seq_no);
			$("#dev_pos").val(row.position);
			$("#dev_type1").val(row.type);
			$("#dev_status").val(row.status);
			$("#fault").val(row.fault);
			$("#fault_cause").val(row.fault_cause);
			$("#occur_time").val(row.occur_time);
			$("#quality_time").val(row.quality_time);
			$("#maintain_time").val(row.maintain_time);
			$("#maintain_reason").val(row.maintain_reason);
			$("#maintain_unit").val(row.maintain_unit);
			//for (var i in row ) console.log(i);
		},
		'click .RoleOfB': function(e, value, row, index) {
			passmodal.open();
		},
		'click .RoleOfC': function(e, value, row, index) {
			rejectmodal.open();
		}
	};

	function operateFormatter(value, row, index) {
		return [
			'<button id="btn_detail" type="button" class="RoleOfA btn-default bt-select">详情</button>',
			'<button type="button" class="RoleOfB btn-default bt-select">通过</button>',
			'<button type="button" class="RoleOfC btn-default bt-select">驳回</button>'
		].join('');
	}

	var $table = $('#table');
	var h = $(window).height();
	table_h = h - $("#menu").height();
	//console.log($(window).height());
	$table.bootstrapTable({
		url: './json/dev_edit.json',
		//data: data,
		toolbar: '#toolbar', //工具按钮用哪个容器
		//striped: true, //是否显示行间隔色
		cache: false, //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		pagination: true, //是否显示分页（*）
		sortable: true, //是否启用排序
		sortOrder: "asc", //排序方式
		//queryParams: postQueryParams,//传递参数（*）
		//sidePagination: "server",      //分页方式：client客户端分页，server服务端分页（*）
		pageSize: 7, //每页的记录行数（*）
		pageList: [10, 25, 50, 100], //可供选择的每页的行数（*）
		strictSearch: true,
		uniqueId: "id", //每一行的唯一标识，一般为主键列
		cardView: false, //是否显示详细视图
		detailView: false, //是否显示父子表
		paginationHAlign: "left",
		//search:true,               //是否显示表格搜索，此搜索是客户端搜索，不会进服务端
		//strictSearch: true,
		//showColumns: true, //是否显示所有的列
		//showRefresh: true, //是否显示刷新按钮
		minimumCountColumns: 2, //最少允许的列数
		//clickToSelect: true, //是否启用点击选中行
		//clickEdit: true,
		paginationPreText: "<<",
		paginationNextText: ">>",
		columns: [{
			checkbox: true,
		}, {
			field: 'seq_no',
			title: '编号',
		}, {
			field: 'position',
			title: '位置',
		}, {
			field: 'type',
			title: '类型',
		}, {
			field: 'status',
			title: '状态',
		}, {
			field: 'fault',
			title: '故障现象',
		}, {
			field: 'fault_cause',
			title: '故障原因',
		}, {
			field: 'occur_time',
			title: '发生时间',
		}, {
			field: 'quality_time',
			title: '质保时间',
		}, {
			field: 'maintain_time',
			title: '维护时间',
		},{
			field: 'maintain_reason',
			title: '维护原因',
		},{
			field: 'maintain_unit',
			title: '维护单位',
		}, {
			field: 'operate',
			title: '操作',
			events: operateEvents,
			formatter: operateFormatter
		}, ]	
	});

	$('#bt_selectall').click(function() {
		$table.bootstrapTable('checkAll');
	});
	$('#bt_unselectall').click(function() {
		$table.bootstrapTable('uncheckAll');
	});
	$('#btn_detail').click(function() {
		detailmodal.open();
	});
	$('#btn_search').click(function() {
		var devType = $('#dev_type').val();
		var unit = $('#unit').val();
		var newData = [];

		function jsonpCallback(data) //回调函数
		{
			alert(data.message); //
		}
		$.ajax({
			url: "./json/dev_edit.json",
			async: true,
			cache: false,
			dataType: 'json', //跨域时使用jsonp
			//jsonpCallback: "jsonpCallback",
			//jsonp: "callback",//传递给请求处理程序或页面的，用以获得jsonp回调函数名的参数名(默认为:callback)
			//如果这里自定了jsonp的回调函数，则success函数则不起作用;否则success将起作用
			success: function(json) {
				var data = json.rows;
				var type = $('#dev_type').val();
				var unit = $('#unit').val();
				var dtStart = $('#dt_start').val();
				var dtEnd = $('#dt_end').val();
				dtStart = Date.parse(dtStart);
				dtEnd = Date.parse(dtEnd);
				console.log(dtStart);
				console.log(dtEnd);
				for(var p in data) {
					if(data[p].type == type && data[p].maintain_unit == unit && Date.parse(data[p].occur_time) <= dtEnd && Date.parse(data[p].occur_time) >= dtStart) {
						newData.push(data[p]);
					}
				}
				console.log(newData)

				$table.bootstrapTable('refreshOptions', {
					url: '',
					data: newData,
				});
			},
			error: function(e) {
				console.log(e)
			}
		});
	});
})