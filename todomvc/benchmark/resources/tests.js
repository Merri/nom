var numberOfItemsToAdd = (~~location.hash.slice(1)) || 250;
var Suites = [];

window.onhashchange = function() {
    location.reload();
}

Suites.push({
    name: 'NomJS + vanilla JS MVC',
    url: '../index.html',
    version: '0.0.13',
    prepare: function (runner, contentWindow, contentDocument) {
        return runner.waitForElement('.new-todo').then(function (element) {
            element.focus();
            return element;
        });
    },
    tests: [
        new BenchmarkTestStep('Adding' + numberOfItemsToAdd + 'Items', function (newTodo, contentWindow, contentDocument) {
            for (var i = 0; i < numberOfItemsToAdd; i++) {
                var inputEvent = document.createEvent('Event');
                inputEvent.initEvent('input', true, true);
                newTodo.value = 'Nom ----------- Something to do ' + i;
                newTodo.dispatchEvent(inputEvent);

                var keydownEvent = document.createEvent('Event');
                keydownEvent.initEvent('keypress', true, true);
                keydownEvent.keyCode = 13; // VK_ENTER
                newTodo.dispatchEvent(keydownEvent);
            }
        }),
        new BenchmarkTestStep('CompletingAllItems', function (newTodo, contentWindow, contentDocument) {
            var checkboxes = contentDocument.querySelectorAll('.toggle');
            for (var i = 0; i < checkboxes.length; i++)
                checkboxes[i].click();
        }),
        new BenchmarkTestStep('DeletingAllItems', function (newTodo, contentWindow, contentDocument) {
            var deleteButtons = contentDocument.querySelectorAll('.destroy');
            for (var i = deleteButtons.length - 1; i > -1; i--)
                deleteButtons[i].click();
        })
    ]
});

Suites.push({
    name: 'Mithril (older TodoMVC)',
    url: 'mithril/index.html',
    version: '0.2.0',
    prepare: function (runner, contentWindow, contentDocument) {
        return runner.waitForElement('#new-todo').then(function (element) {
            element.focus();
            return element;
        });
    },
    tests: [
        new BenchmarkTestStep('Adding' + numberOfItemsToAdd + 'Items', function (newTodo, contentWindow, contentDocument) {
            for (var i = 0; i < numberOfItemsToAdd; i++) {
                var inputEvent = document.createEvent('Event');
                inputEvent.initEvent('input', true, true);
                newTodo.value = 'Mithril ------- Something to do ' + i;
                newTodo.dispatchEvent(inputEvent);

                var keydownEvent = document.createEvent('Event');
                keydownEvent.initEvent('keypress', true, true);
                keydownEvent.keyCode = 13; // VK_ENTER
                newTodo.dispatchEvent(keydownEvent);
            }
        }),
        new BenchmarkTestStep('CompletingAllItems', function (newTodo, contentWindow, contentDocument) {
            var checkboxes = contentDocument.querySelectorAll('.toggle');
            for (var i = 0; i < checkboxes.length; i++)
                checkboxes[i].click();
        }),
        new BenchmarkTestStep('DeletingAllItems', function (newTodo, contentWindow, contentDocument) {
            var deleteButtons = contentDocument.querySelectorAll('.destroy');
            for (var i = deleteButtons.length - 1; i > -1; i--)
                deleteButtons[i].click();
        })
    ]
});

Suites.push({
    name: 'Mithril (TodoMVC 1.3)',
    url: 'mithril-new/index.html',
    version: '0.2.0',
    prepare: function (runner, contentWindow, contentDocument) {
        return runner.waitForElement('#new-todo').then(function (element) {
            element.focus();
            return element;
        });
    },
    tests: [
        new BenchmarkTestStep('Adding' + numberOfItemsToAdd + 'Items', function (newTodo, contentWindow, contentDocument) {
            for (var i = 0; i < numberOfItemsToAdd; i++) {
                var inputEvent = document.createEvent('Event');
                inputEvent.initEvent('input', true, true);
                newTodo.value = 'Mithril ------- Something to do ' + i;
                newTodo.dispatchEvent(inputEvent);

                var keydownEvent = document.createEvent('Event');
                keydownEvent.initEvent('keyup', true, true);
                keydownEvent.keyCode = 13; // VK_ENTER
                newTodo.dispatchEvent(keydownEvent);
            }
        }),
        new BenchmarkTestStep('CompletingAllItems', function (newTodo, contentWindow, contentDocument) {
            var checkboxes = contentDocument.querySelectorAll('.toggle');
            for (var i = 0; i < checkboxes.length; i++)
                checkboxes[i].click();
        }),
        new BenchmarkTestStep('DeletingAllItems', function (newTodo, contentWindow, contentDocument) {
            var deleteButtons = contentDocument.querySelectorAll('.destroy');
            for (var i = deleteButtons.length - 1; i > -1; i--)
                deleteButtons[i].click();
        })
    ]
});

Suites.push({
    name: 'React (client side JSX)',
    url: 'react/index.html',
    version: '0.13.3',
    prepare: function (runner, contentWindow, contentDocument) {
        return runner.waitForElement('#new-todo').then(function (element) {
            element.focus();
            return element;
        });
    },
    tests: [
        new BenchmarkTestStep('Adding' + numberOfItemsToAdd + 'Items', function (newTodo, contentWindow, contentDocument) {
            for (var i = 0; i < numberOfItemsToAdd; i++) {
                var inputEvent = document.createEvent('Event');
                inputEvent.initEvent('input', true, true);
                newTodo.value = 'React --------- Something to do ' + i;
                newTodo.dispatchEvent(inputEvent);

                var keydownEvent = document.createEvent('Event');
                keydownEvent.initEvent('keydown', true, true);
                keydownEvent.keyCode = 13; // VK_ENTER
                newTodo.dispatchEvent(keydownEvent);
            }
        }),
        new BenchmarkTestStep('CompletingAllItems', function (newTodo, contentWindow, contentDocument) {
            var checkboxes = contentDocument.querySelectorAll('.toggle');
            for (var i = 0; i < checkboxes.length; i++)
                checkboxes[i].click();
        }),
        new BenchmarkTestStep('DeletingAllItems', function (newTodo, contentWindow, contentDocument) {
            var deleteButtons = contentDocument.querySelectorAll('.destroy');
            for (var i = deleteButtons.length - 1; i > -1; i--)
                deleteButtons[i].click();
        })
    ]
});

shuffle(Suites)
