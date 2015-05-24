view.selectedIf = function(filter, value) {
	return {config: m.route, class: filter == value ? 'selected' : ''}
}

view.footer = function() {
	var completed = vm.countCompletedTodos()
	var remaining = model.todos.length - completed
	return m('footer#footer', [
		m('span#todo-count', [
			m('strong', remaining), ' item' + (remaining > 1 ? 's' : '') + ' left'
		]),
		m('ul#filters', [
			m('li', m('a[href=/]', view.selectedIf(vm.filter, ''), 'All')),
			m('li', m('a[href=/active]', view.selectedIf(vm.filter, 'active'), 'Active')),
			m('li', m('a[href=/completed]', view.selectedIf(vm.filter, 'completed'), 'Completed'))
		]),
		completed == 0 ? '' : m('button#clear-completed', {
			onclick: vm.clearCompletedTodos
		}, 'Clear completed (' + completed + ')')
	]);
}
