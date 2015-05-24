var todomvc = {controller: ctrl.main, view: view.main}

m.route.mode = "hash"
m.route(document.getElementById('todoapp'), '/', {
	'/': todomvc,
	'/:filter': todomvc
});
