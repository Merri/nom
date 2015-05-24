var view = {}
view.ENTER_KEY = 13;
view.ESC_KEY = 27;

view.watchInput = function(onenter, onescape) {
	return function(e) {
		if (e.keyCode == view.ENTER_KEY && onenter) onenter()
		if (e.keyCode == view.ESC_KEY && onescape) onescape()
	}
};
view.focus = function(element, init) {
	if (!init) element.focus()
};

view.main = function() {
	var checkedAll = vm.countCompletedTodos() == model.todos.length
	return [
		m('header#header', [
			m('h1', 'todos'),
			m('input#new-todo[placeholder="What needs to be done?"]', {
				oninput: m.withAttr('value', vm.title),
				onkeypress: view.watchInput(vm.addTodo),
				value: vm.title()
			})
		]),
		m('section#main', [
			model.todos.length > 0 ? m('input#toggle-all[type=checkbox]', {onclick: ctrl.bind(vm.setTodosStatus, !checkedAll), checked: checkedAll}) : "",
			m('ul#todo-list', [
				model.todos.filter(vm.isVisible).map(function(todo) {
					return m('li', {class: (todo.completed() ? 'completed' : '') + " " + (vm.edit.todo() == todo ? 'editing' : '')}, [
						vm.edit.todo() != todo ? 
						m('.view', {}, [
							m('input.toggle[type=checkbox]', {
								onclick: m.withAttr('checked', ctrl.bind(vm.setTodoStatus, todo)),
								checked: todo.completed()
							}),
							m('label', {ondblclick: ctrl.bind(vm.edit.attach, todo)}, todo.title()),
							m('button.destroy', { onclick: ctrl.bind(vm.removeTodo, todo)})
						]) :
						m('input.edit', {
							oninput: m.withAttr("value", vm.edit.title),
							onkeypress: view.watchInput(vm.edit.save, vm.edit.cancel),
							onblur: vm.edit.save,
							value: vm.edit.title(),
							config: view.focus
						})
					])
				 })
			])
		]),
		model.todos.length == 0 ? '' : view.footer()
	];
};
