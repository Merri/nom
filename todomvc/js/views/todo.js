!function(){'use strict'
    var app = window.app = window.app || {}

    var viewHelper = {
        add: function(event) {
            if ((event || window.event).keyCode === 13)
                app.controller.addItem()
        },
        restorePrevious: function(event) {
            if ((event || window.event).keyCode === 27)
                app.controller.title = app.controller.previousTitle
        },
        update: function() {
            app.controller.title = viewComponent.newTodo.value
        },
        completeEdit: function(event) {
            switch ((event || window.event).keyCode) {
            case 13:
                app.controller.completeEditingItem()
                break;
            case 27:
                app.controller.cancelEditingItem()
                break;
            }
        },
        updateEdit: function() {
            app.controller.currentEdit.title = viewComponent.editTodo.value
        }
    }

    var viewRenderer = {
        filterLink: function(text, filterName) {
            filterName = filterName || ''

            var href = '#/' + filterName

            return nom.el('a', function() {
                return {
                    className: app.controller.filter() === filterName ? 'selected' : '',
                    href: href,
                    children: text
                }
            })
        },
        toListItem: function(item, index) {
            var listItem = viewComponent.listItems[index]

            if (!listItem) {
                listItem = viewComponent.listItems[index] = { data: item }
                listItem.view = nom.el('div.view', [
                    nom.el('input.toggle', function() {
                        return {
                            type: 'checkbox',
                            checked: listItem.data.completed,
                            onchange: app.controller.completeItem.bind(null, listItem.data)
                        }
                    }),
                    nom.el('label', function() {
                        return {
                            ondblclick: app.controller.editItem.bind(null, listItem.data),
                            children: listItem.data.title
                        }
                    }),
                    nom.el('button.destroy', function() {
                        return {
                            onclick: app.controller.removeItem.bind(null, listItem.data)
                        }
                    })
                ])
                listItem.element = nom.el('li', function() {
                    var children = [listItem.view],
                        className = ' '

                    if (listItem.data.completed)
                        className += 'completed '

                    if (app.controller.isEditingItem(listItem.data)) {
                        className += 'editing '
                        children.push(viewComponent.editTodo)
                        // edit element should always have focus when it is visible
                        if (document.activeElement !== viewComponent.editTodo && viewComponent.editTodo.parentElement === listItem.element) {
                            viewComponent.editTodo.value = ''
                            viewComponent.editTodo.focus()
                        }
                    }

                    return { className: className.trim(), children: children }
                })
            } else if (listItem.data !== item) {
                listItem.data = item
            }

            return listItem.element
        }
    }

    var viewComponent = {
        listItems: [],
        newTodo: nom.el('input.new-todo', function() {
            return {
                placeholder: 'What needs to be done?',
                autofocus: true,
                onkeydown: viewHelper.restorePrevious,
                onkeypress: viewHelper.add,
                oninput: viewHelper.update,
                value: app.controller.title
            }
        }),
        editTodo: nom.el('input.edit', function() {
            return {
                onblur: app.controller.completeEditingItem,
                onkeypress: viewHelper.completeEdit,
                oninput: viewHelper.updateEdit,
                value: app.controller.currentEdit.title
            }
        }),
        main: [
            nom.el('input.toggle-all', function() {
                return {
                    type: 'checkbox',
                    checked: app.controller.isEveryItemCompleted(),
                    onclick: app.controller.completeEveryItem
                }
            }),
            nom.el('label', {
                htmlFor: 'toggle-all',
                children: 'Mark all as complete'
            }),
            nom.el('ul.todo-list', function() {
                return app.controller.visibleItems().map(viewRenderer.toListItem)
            })
        ],
        footer: [
            nom.el('span.todo-count', function() {
                var remaining = app.controller.list.length - app.controller.completedItemsCount()

                return {children: remaining + (remaining === 1 ? ' item left' : ' items left')}
            }),
            nom.el('ul.filters', [
                {li: [viewRenderer.filterLink('All')]},
                {li: [viewRenderer.filterLink('Active', 'active')]},
                {li: [viewRenderer.filterLink('Completed', 'completed')]}
            ]),
            nom.el('button.clear-completed', function() {
                return {
                    onclick: app.controller.clearCompletedItems,
                    children: 'Clear completed',
                    style: { display: app.controller.completedItemsCount() > 0 ? '' : 'none' }
                }
            })
        ]
    }

    app.view = nom.els(
        {'section.todoapp': [
            {'header.header': [
                {h1: 'todos'},
                viewComponent.newTodo
            ]},
            {'section.main': function() {
                return {
                    style: { display: app.controller.list.length ? '' : 'none' },
                    children: viewComponent.main
                }
            }},
            {'footer.footer': function() {
                return {
                    style: { display: app.controller.list.length ? '' : 'none' },
                    children: viewComponent.footer
                }
            }}
        ]}
    )
}()
