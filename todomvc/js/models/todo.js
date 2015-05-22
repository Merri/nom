!function(){'use strict'
    var app = window.app = window.app || {}

    app.Todo = function(data) {
        this.completed = !!data.completed
        this.title = '' + data.title
    }
}()
