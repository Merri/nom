!function(){'use strict'
    var app = window.app = window.app || {}

    function TodoController() {
        var controller = this

        // private methods
        function updateStore() {
            app.storage.setArray(controller.list)
        }

        // state
        controller.list = app.storage.getArray().map(function(item) {
            return new app.Todo(item)
        })
        controller.currentEdit = {
            item: null,
            title: ''
        }
        controller.previousTitle = ''
        controller.title = ''

        // methods
        controller.addItem = function() {
            var title = controller.title.trim()
            if (title) {
                controller.previousTitle = title
                controller.list.push(new app.Todo({title: title}))
                updateStore()
            }
            controller.title = ''
        }

        controller.cancelEditingItem = function(item) {
            controller.currentEdit.item = null
        }

        controller.clearCompletedItems = function() {
            controller.list = controller.list.filter(function(item) {
                return !item.completed
            })
            updateStore()
        }

        controller.completedItemsCount = function() {
            return controller.list.reduce(function(count, item) {
                return count + item.completed
            }, 0)
        }

        controller.completeEditingItem = function() {
            if (controller.currentEdit.item == null) return
            controller.currentEdit.title = controller.currentEdit.title.trim()
            if (!controller.currentEdit.title)
                controller.removeItem(controller.currentEdit.item)
            else
                controller.currentEdit.item.title = controller.currentEdit.title
            controller.currentEdit.item = null
            controller.currentEdit.title = ''
            updateStore()
        }

        controller.completeEveryItem = function() {
            var newCompleteState = !controller.isEveryItemCompleted()
            controller.list.forEach(function(item) {
                item.completed = newCompleteState
            })
            updateStore()
        }

        controller.completeItem = function(item) {
            item.completed = !item.completed
            updateStore()
        }

        controller.editItem = function(item) {
            controller.currentEdit.item = item
            controller.currentEdit.title = item.title
        }

        controller.filter = function() {
            return location.hash.split('/')[1] || ''
        }

        controller.removeItem = function(item) {
            controller.list.splice(controller.list.indexOf(item), 1)
            updateStore()
        }

        controller.visibleItems = function() {
            switch (controller.filter()) {
            case 'active':
                return controller.list.filter(function(item) {
                    return !item.completed
                })
            case 'completed':
                return controller.list.filter(function(item) {
                    return item.completed
                })
            }
            return controller.list
        }

        controller.isEditingItem = function(item) {
            return controller.currentEdit.item === item
        }

        controller.isEveryItemCompleted = function() {
            return controller.list.every(function(item) {
                return item.completed
            })
        }
    }

    app.controller = new TodoController()
}()
