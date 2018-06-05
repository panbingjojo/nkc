$('input[name="selectOperation"]').iCheck({
	checkboxClass: 'icheckbox_minimal-red',
});

function saveGradePermission(id) {
	var arr = $('input[name="selectOperation"]');
	var operationsId = [];
	for(var i = 0 ; i < arr.length; i++) {
		var e = arr.eq(i);
		var operationId = e.attr('data-operation');
		if(e.prop('checked') && operationsId.indexOf(operationId) === -1) {
			operationsId.push(operationId);
		}
	}
	var obj = {
		operation: 'saveGradePermissions',
		operationsId: operationsId
	};
	nkcAPI('/e/settings/grade/'+id, 'PATCH', obj)
		.then(function() {
			screenTopAlert('保存成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}

function saveGrade(id) {
	var obj = {
		color: $('#color').val(),
		displayName: $('#displayName').val(),
		description: $('#description').val(),
		score: $('#score').val(),
		operation: 'saveGrade'
	};
	nkcAPI('/e/settings/grade/' + id, 'PATCH', obj)
		.then(function() {
			screenTopAlert('保存成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}

function addGrade() {
	var displayName = prompt('请输入代号：', '');
	if(displayName === null) {

	} else if(displayName === '') {
		return screenTopWarning('代号不能为空');
	} else {
		var score = prompt('请输入积分分界点：', '');
		if(score === null) {

		} else if (score === '') {
			return screenTopWarning('积分分界点不能为空');
		} else {
			nkcAPI('/e/settings/grade', 'POST', {displayName: displayName, score: score})
				.then(function(data) {
					var gradeId = data.grade._id;
					window.location.href = '/e/settings/grade/'+gradeId;
				})
				.catch(function(data) {
					screenTopWarning(data.error || data);
				})
		}
	}
}

function deleteGrade(id) {
	if(confirm('确认要删除该等级？') === false) return;
	nkcAPI('/e/settings/grade/'+ id, 'DELETE', {})
		.then(function() {
			window.location.href = '/e/settings/grade';
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}