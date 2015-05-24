!function(){'use strict'
    var app = window.app = window.app || {}

    function ArrayStorage(key, delayWhenBusy) {
        var dataToStore,
            timeout

        delayWhenBusy = Math.max(~~delayWhenBusy, 0)

        function store() {
            try {
                localStorage[key] = JSON.stringify(dataToStore)
                dataToStore = undefined
            } catch(e) {}
            timeout = undefined
        }

        this.getArray = function() {
            var data

            if (dataToStore)
                return dataToStore.slice(0)

            try {
                data = JSON.parse(localStorage[key] || '[]')
            } catch(e) {}

            return Array.isArray(data) ? data : []
        }

        this.setArray = function(data) {
            if (!Array.isArray(data)) return
            dataToStore = data
            clearTimeout(timeout)
            timeout = setTimeout(store, timeout == null ? 0 : delayWhenBusy)
        }
    }

    app.storage = new ArrayStorage('nom+mvc-todos', 100)
}()
