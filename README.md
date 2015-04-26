# NomJS

1. Nom creates DOM elements.
2. Nom helps you keep your data synchronized with DOM elements.
3. Nom makes it easy to create DOM trees.

Nom (or nom.js or NomJS) is a new DOM library. It has been inspired by both ([React](http://facebook.github.io/react/) and [Riot 2](https://muut.com/riotjs/)), but instead going the framework route Nom only does DOM, and does it only in browser. Nom gives you no help to making isomorphic sites. Nom isn't trendy.

## Nom is...

1. Close to the standards: Nom only outputs DOM nodes.
2. Minimal like Riot, but with even smaller focus.
3. Performant. Nom's source prefers inline pattern repetition over helper functions.
4. Compatible. You can use other tools to screw the DOM and Nom will adapt.
5. Absolutely brilliant. Your mileage may vary depending on your current mood.

## Documentation

Nom comes with three methods: `el`, `els` and `mount`.

1. `el` returns a single DOM element.
2. `els` returns a document fragment possibly containing multiple DOM elements.
3. `mount` returns a document fragment which has been assigned to automatic updates.

### Creating an element

```js
var div = nom.el('div');
// = <div></div>
```

Boring!

```js
var awesome = nom.el('div.awesome');
// = <div class="awesome"></div>
```

Awesome!

### Creating elements with content

`el`'s second parameter is intended for properties. However you can also give it strings (to generate text nodes) and arrays (containing stuff to generate as nodes). You're not creating complex stuff all the time anyway, sometimes you just want simple elements.

```js
var div = nom.el('div', 'Text');
// = <div>Text</div>
```

```js
var div = nom.el('div', [
    nom.el('p', 'Text')
]);
// = <div><p>Text</p></div>
```

### Manipulating properties

At other times you need things to be a little more complex. Besides having child elements you want to have some properties set.

```js
var div = nom.el('div', {
    className: 'awesome',
    children: 'Text',
    style: {
        backgroundColor: 'black',
        color: 'white'
    }
});
// = <div class="awesome" style="background-color: black; color: white;">Text</div>
```

### Adding elements to document

Simply use the regular methods you should already be familiar with: `appendChild`, `insertBefore`, `replaceChild`.

```js
document.body.appendChild(
    nom.el('div', 'I have been added to the DOM.')
);
//  <!doctype>
//  <html>
//      <head>...</head>
//      <body><div>I have been added to the DOM.</div></body>
//  </html>
```

### Changing properties

Elements created with Nom must be passed via `mount` before the magic happens. Each element can have it's own small routine for updates.

```js
var counter = 0;

document.body.appendChild(nom.mount(
    nom.el('div', function() {
        return {
            children: 'Render has been called ' + (++counter) + ' times and that is as many times I have been updated.'
        }
    })
));
```

Remember that in real life code you should never mutate your data like the example above does with the `counter` variable. The code in these property changing functions should only reflect changes in data to the properties. Not create those changes.

Nom differs to React here, because React does everything it can to avoid a render call (and thus `setState` requirement for changing data). Nom will call each property function on every render and check if a property has changed. This means Nom code will only force state of a few selected properties of your choice, not take over the entire DOM like React does.

### Object notation

Now we can introduce `els`. It can eat elements created by `el`, and it can take arrays of them, and it can take HTML strings. But most importantly `els` can accept objects with a very compact syntax and create element trees.

```js
var tree = nom.els({
    'div.tree': [
        '<h1>Can use HTML here to create a header</h1>',
        {p: 'Or you can create a paragraph in a much more efficient way!'}
    ]
})
// no need to mount: we have nothing that would re-render itself anyway
document.body.appendChild(tree);

//= <div class="tree">
//      <h1>Can use HTML here to create a header</h1>
//      <p>Or you can create a paragraph in a much more efficient way!</p>
//  </div>
```

### A more complete example

Nom is still quite fresh and evolving so writing a comprehensive documentation isn't a high priority just yet. So here is a more complete example of a login form and one example how to structure code.

```js
function callIfFn(fn) {
    if (Object.prototype.toString.call(fn) === '[object Function]')
        return fn.apply(this, Array.prototype.slice.call(arguments, 1))
}

function selectionToProps(el, props) {
    if ('selectionStart' in el) {
        props.selectionStart = ~~el.selectionStart
        props.selectionEnd = ~~el.selectionEnd
        props.selectionDirection = el.selectionDirection
    }
    return props
}

function loginForm(props) {
    this.uid = (~~this.uid) + 1

    var PASSWORD_LENGTH = 48,
        USERNAME_LENGTH = 48;
    
    var id = 'login-' + this.uid,
        passwordId = 'login-password-' + this.uid
    
    var state = {
        username: '',
        usernameSelection: [],
        password: '',
        showPassword: false
    }
    
    function handleFormSubmit(event) {
        event.preventDefault()
        if (state.username.length === 0) return;
        callIfFn(props.submitCallback, {
            username: state.username,
            password: state.password
        })
    }
    
    function setPassword(event) {
        state.password = passwordField.value
    }
    
    function setShowPassword(event) {
        state.showPassword = showPasswordCheckbox.checked
    }
    
    function setUsername(event) {
        state.username = usernameField.value.replace(/ /g, '_')
    }
    
    var passwordField = nom.el('input.form__text form__text--password', function() {
        return {
            id: passwordId,
            type: state.showPassword ? 'text' : 'password',
            maxLength: PASSWORD_LENGTH,
            value: state.password,
            oninput: setPassword
        }
    })
    
    var showPasswordCheckbox = nom.el('input.form__checkbox form__checkbox--show-username', function() {
        return {
            type: 'checkbox',
            checked: state.showPassword,
            onclick: setShowPassword
        }
    })
    
    var usernameField = nom.el('input.form__text form__text--username', function() {
        var newProps = { value: state.username }
        
        // optimize by setting these only once
        if (!this.id) {
            newProps.id = id
            newProps.type = 'text'
            newProps.maxLength = USERNAME_LENGTH
            newProps.placeholder = 'Spaces not allowed'
            newProps.oninput = setUsername
        }
        
        // remember caret position/selection (if supported by browser)
        if (this.value !== state.username)
            newProps = selectionToProps(this, newProps)
        
        return newProps
    })
    
    var form = nom.els({
        'form.form': {
            onsubmit: handleFormSubmit,
            children: [
                {'fieldset.form__fields': [
                    {'legend.form__fields-title': 'Login'},
                    {'p.form__field form__field--username': [
                        {'label.form__field-label': { htmlFor: id, children: 'Username:' }},
                        usernameField,
                        {small: function() {
                            return {
                                children: (USERNAME_LENGTH - state.username.length) + ' characters remain',
                                className: 'length length--' + state.username.length
                            }
                        }}
                    ]},
                    {'p.form__field form__field--password': [
                        {label: { htmlFor: passwordId, children: 'Password:' }},
                        passwordField,
                        {small: function() {
                            return {
                                children: (PASSWORD_LENGTH - state.password.length) + ' characters remain',
                                className: 'length length--' + state.password.length
                            }
                        }}
                    ]},
                    {'p.form__field form__field--show-password': [
                        {label: [showPasswordCheckbox, ' Show password?']}
                    ]}
                ]},
                {'footer.form__footer': [
                    {'input.form__button': { type: 'submit', value: 'Submit' }}
                ]}
            ]
        }
    })

    return form
}

document.body.appendChild(nom.mount(
    loginForm({
        submitCallback: function(data) {
            alert('Hello ' + data.username + '!')
        }
    })
))
```

# Requirements

These are more like recommendations than hard requirements. You'll simply get broader browser support. With no help Nom is IE10+ and Android 4.4+.

1. es5shim
2. requestAnimationFrame polyfill

[Can I Use... requestAnimationFrame](http://caniuse.com/#search=requestanimationframe) shows quite a good approximation of the minimum browser support without any aid.