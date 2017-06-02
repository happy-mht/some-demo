$(document).ready(function() {
	var $table = $('#table');
	var h = $(window).height();
	table_h = h - $("#menu").height();
	//console.log($(window).height());
	var importModel = new Modal({
		title: '导入数据',
		content: '<input type="file"/>',
		width: 400,
		onOk: function() {
			/*通过后台解析文件数据为json格式*/
		}
	});
	var addModal = new Modal({
		title: '用户信息',
		content: $('#add_modal_cont').html(),
		width: 500,
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
				var ids = $table.bootstrapTable('getOptions').totalRows + 1;
				$table.bootstrapTable('insertRow', {
					index: $table.bootstrapTable('getOptions').totalRows,
					row: {
						id: ids,
						acc_num: '',
						name: postData['user_name'],
						sex: '',
						status: '',
						unit: postData['user_unit'],
						job: '',
						role: postData['user_role'],
						user_pri: '',
						update_time: '',
						comment: '',
					}
				});
			}
		},
	});
	var editmodal = new Modal({
		title: '用户信息',
		content: $('#edit_modal_cont').html(),
		width: 600,
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
				var ids = $.map($table.bootstrapTable('getSelections'), function(row) {
					return row.id;
				});
				$table.bootstrapTable('updateByUniqueId', {
					id: ids,
					row: {
						id: ids,
						acc_num: postData['user_acc'],
						name: postData['user_name'],
						sex: postData['user_sex'],
						status: postData['user_status'],
						unit: postData['user_unit'],
						job: postData['user_job'],
						role: postData['user_role1'],
						user_pri: postData['user_pri'],
						user_admin: postData['user_admin'],
						update_time: postData['user_comm'],
						comment: postData['user_comm'],
					}
				});
			}
		},
	});

	$table.bootstrapTable({
		url: './json/user.json',
		//data: data,
		toolbar: '#toolbar', //工具按钮用哪个容器
		//striped: true, //是否显示行间隔色
		cache: false, //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		pagination: true, //是否显示分页
		sortable: true, //是否启用排序
		sortOrder: "asc", //排序方式
		//queryParams: postQueryParams,//传递参数（*）
		//sidePagination: "server",      //分页方式：client客户端分页，server服务端分页（*）
		pageSize: 15, //每页的记录行数（*）
		pageList: [10, 25, 50, 100], //可供选择的每页的行数（*）
		strictSearch: true,
		//height: table_h, //行高，如果没有设置height属性，表格自动根据记录条数觉得表格高度,设置了行高后编辑时标头宽度不会随着下面的行改变，且颜色也不会改变？？？？
		uniqueId: "id", //每一行的唯一标识，一般为主键列
		cardView: false, //是否显示详细视图
		detailView: false, //是否显示父子表
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
			width: "75px",
		}, {
			field: 'acc_num',
			title: '账号',
		}, {
			field: 'name',
			title: '姓名',
		}, {
			field: 'sex',
			title: '性别',
		}, {
			field: 'status',
			title: '状态',
		}, {
			field: 'unit',
			title: '部门',
		}, {
			field: 'job',
			title: '岗位',
		}, {
			field: 'role',
			title: '角色',
		}, {
			field: 'user_pri',
			title: '用户权限',
		}, {
			field: 'user_admin',
			title: '用户级别',
		}, {
			field: 'update_time',
			title: '更新时间',
		}, {
			field: 'comment',
			title: '备注',
		}, ]
	});
	$('#btn_delete').click(function() {
		var ids = $.map($table.bootstrapTable('getSelections'), function(row) {
			return row.id;
		});
		if(ids == "") Alert('<h4 style="color:red;text-align:center;">请选取您要删除的数据！</h4>');
		else Confirm({
			msg: '<h4 style="color:red;text-align:center;">您确认要删除此条数据！</h4>',
			onOk: function() {
				$table.bootstrapTable('remove', {
					field: 'id',
					values: ids
				});

			},
			onCancel: function() {

			}
		});
	});
	$("#btn_add").click(function() {
		addModal.open();
	});

	$("#btn_edit").click(function() {
		var ids = $.map($table.bootstrapTable('getSelections'), function(row) {
			return row.id;
		});
		if(ids == "") Alert('<h4 style="color:red;text-align:center;">请选取您要编辑的数据！</h4>');
		//alert('请选取要删除的数据！');
		//else confirm("确定要删除此数据？");
		else {
			$.map($table.bootstrapTable('getSelections'), function(row) {
				//for(var i in row) console.log(i)
				editmodal.open();
				$("#user_acc").val(row.acc_num);
				$("#user_name").val(row.name);
				$("#user_sex").val(row.sex);
				$("#user_status").val(row.status);
				$("#user_unit").val(row.unit);
				$("#user_job").val(row.job);
				$("#user_role1").val(row.role);
				$("#user_pri").val(row.user_pri);
				$("#user_admin").val(row.user_admin);
				$("#update_time").val(row.update_time);
				$("#user_comm").val(row.comment);
			});
		}
	});
	$('#btn_import').click(function() {
		importModel.open();
	});
	$('#bt_selectall').click(function() {
		$table.bootstrapTable('checkAll');
	});
	$('#bt_unselectall').click(function() {
		$table.bootstrapTable('uncheckAll');
	});
});