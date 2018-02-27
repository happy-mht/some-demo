function operateFormatter(value, row, index) {
	return [
	    '<input name="publishOper_'+index+'" class="radio_1" type="radio" id="unblocked_'+index+'" value="unblocked" checked><label for="unblocked_'+index+'"><strong class="unblocked"></strong>畅通</label>'+
		'<input name="publishOper_'+index+'" class="radio_1" type="radio" id="crowded_'+index+'" value="crowded"><label for="crowded_'+index+'"><strong class="crowded"></strong>拥挤</label>'+
		'<input name="publishOper_'+index+'" class="radio_1" type="radio" id="blocked_'+index+'" value="blocked"><label for="blocked_'+index+'"><strong class="blocked"></strong>堵塞</label>'+
		'<button id="btn_detail" type="button" class="RoleOfA btn btn-publish oper">发布</button>',
	].join('');
}

function operateFormatter2(value, row, index) {
	return [
	    '<input name="publishOpt_'+index+'" class="radio_1" type="radio" id="autoPublish_'+index+'" value="unblocked" checked><label for="autoPublish_'+index+'">自动发布</label>'+
		'<input name="publishOpt_'+index+'" class="radio_1" type="radio" id="manualPublish_'+index+'" value="crowded"><label for="manualPublish_'+index+'">手动发布</label>'+
		'<select class="publish-opt" id="publish_'+index+'"><option value="#32b16c" class="green"></option><option value="#f19149" class="orange"></option><option value="#e60012" class="red"></option></select>'+
		'<button id="btn_detail" type="button" class="RoleOfA btn btn-publish oper">发布</button>',
	].join('');
}
window.recordEvents2 = {
	'change .publish-opt': function(e, value, row, index) {
		var opt = this.value;
		this.style.background=opt;
	}
};

{
			field: 'typeDesc',
			title: '实时状态',
			formatter: operateFormatter2,
			events: recordEvents2,
			width: '400px'
		}, {
			field: 'publish',
			title: '发布操作',
			events: operateEvents,
			formatter: operateFormatter,
			width: '400px'
		}, 
    
    .btn-publish{
	width:4em;
	height:1.7em;
	margin-left:0.5em!important;
	background:#fff;
	border:1px solid #ccc;
	border-radius:5px!important;
	padding:1px 5px;
}
.unblocked{
	display:inline-block;
	width:2.5em;
	background:#32b16c;
	height:1em;
	margin:0 3px -3px;
}
.crowded{
	display:inline-block;
	width:2.5em;
	background:#f19149;
	height:1em;
	margin:0 3px -3px;
}
.red{
	background:#e60012;
	height:1em;
}
.green{
	background:#32b16c;
	height:1em;
}
.orange{
	background:#f19149;
	height:1em;
}
.blocked{
	display:inline-block;
	width:2.5em;
	background:#e60012;
	height:1em;
	margin:0 3px -3px;
}
.publish-opt{
	width:3em;
	height:1.5em;
	background:#32b16c;
	margin-left:3px;
	vertical-align:middle;
}
