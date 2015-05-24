var ctrl = {}

ctrl.bind = function(fn, arg) {return fn.bind(this, arg)}

ctrl.main = function() {
	vm.filter = m.route.param('filter') || '';
}