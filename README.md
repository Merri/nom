# Nom

Nom (or nom.js or NomJS) is a new DOM library. Unlike the inspiration ([React](http://facebook.github.io/react/) and [Riot 2](https://muut.com/riotjs/)) it only focuses to the DOM. Nom makes no effort to support neat HTML-like input. This means that you can just go ahead and include Nom into a page and start doing things with it since there are no precompile requirements. You can do this with React too, but with React you get so much more than you probably need for a smaller project.

Riot 2 in the other hand provides you a lot of stuff in compact code. Things like tag files (= mixed HTML and JS), server side rendering, routes, observables and so on. Riot gives a great simplified point of view to doing UI programming. It is faster to pick up than React, but unlike React it explicitly forces you to the precompile world.

## Nom is...
1. Close to the standards: it spits out DOM element nodes and you directly modify DOM elements.
2. Minimal in it's approach: at the moment of writing Nom provides only two methods (`nom.el()` and `nom.mount()`).
3. Performant. Riot focuses to compact code, Nom is compact too, but with more focus to performance.
4. Compatible. You can use other tools to screw the DOM and Nom will adapt.
5. Unfinished: there are still many experiments and figuring outs to do.

## `nom.el()`

When you want rainbows `nom.el()` poops out a new DOM element.

```js
var mainHeader = nom.el('h1', { textContent: 'I am a header' });

// outputting the following component will generate a constantly updating element
var counter = 0,
    counterDisplay = nom.el('p', function() {
        return { textContent: "I've been rendered " + (++counter) + " times" };
    });
```

The first argument is a string telling which DOM element you want. Simple enough.

The second argument is more interesting: it can be an object or a function that returns an object. The object contains **DOM element properties**. So things like `className`, `style`, `textContent`, `innerHTML`, `onclick` etc. can be used. Any property that works with a DOM node is usable. There is also a special case of `children` which allows you to pass child elements. Note that using `textContent` and `innerHTML` will override all contents, so you shouldn't mix use of `children` with those properties as that won't work.

Passing an object is more performant to use, but it also means you have to create a reference of that object into a variable to be able to modify it.

Function allows for a bit more compact code as you don't need to create a variable to be able to change properties or child elements of an element.

`children` allows a single element or an array of elements. Elements don't need to be created using Nom.

## `nom.mount()`

You can pass a single element, many elements as arguments, an array of elements or even multiple arrays. Elements don't need to be created using Nom. A string is understood as HTML and will result in non-Nom DOM nodes (I like reading that!).

Internally Nom uses requestAnimationFrame to repaint the DOM. However this feature is only enabled if element is passed to DOM via `nom.mount()`. An unmounted Nom element in DOM tree can be manually refreshed by calling `.render()` on it.

`nom.mount()` returns a DocumentFragment that can be easily inserted to a page by using native DOM methods like `document.body.appendChild()`.

You can call `.unmount()` to remove elements from DOM and restore them as children of the DocumentFragment.

In short Nom doesn't force it's way: if you want to manually control refresh of elements with some convenience provided by Nom, you can do that. But if you want total override by constant refresh then Nom can give that too. Also, Nom doesn't care about elements it hasn't created so you can freely mix them where ever you want without fear of Nom breaking your stuff.

## Creating components

You can use Nom's features whichever way you see fit, but here is one way that is very similar to how Riot does things.

```js
// NOTE: this may be outdated as things are still finding their way
// this is a redesign of [Riot todo example](http://muut.github.io/riotjs/demo/)
function todo(state) {
    var formSubmitButton, formSubmitText, formTodoInput;
    
    // create a new object and sanitize input to avoid corrupting external object (mutability can be evil)
    state = {
        items: (state.items || []).map(function(item) {
            return { title: item.title || '', done: !!item.done }
        }),
        text: state.text || '',
        title: state.title
    };

    function add(event) {
        event.preventDefault();
        if (!state.text) return;
        state.items.push({ title: state.text });
        state.text = this.todoInput.value = '';
        this.todoInput.focus();
    }
    
    function edit(event) {
        state.text = event.target.value;
    }
    
    function toggle(event) {
        this.done = event.target.checked;
    }
    
    function nomListItem(item) {
        var itemCheckbox, itemContainer, itemTitle;
        // currently the best way to keep account of array items is to cache Nom elements to the array items
        if (item.nom) return item.nom;
        
        itemCheckbox = nom.el('input', function() {
            return {
                type: 'checkbox',
                checked: item.done,
                onclick: toggle.bind(item)
            }
        });
        
        // nom.text is to be deprecated
        itemTitle = nom.text(function() { return ' ' + item.title });
        
        itemContainer = nom.el('label', function() {
            return {
                className: item.done ? 'completed' : '',
                children: [ itemCheckbox, itemTitle ]
            }
        });
        
        return item.nom = nom.el('li', { children: itemContainer })
    }
    
    formTodoInput = nom.el('input', {
        name: 'todoInput',
        onchange: edit,
        oninput: edit,
        onkeyup: edit,
        onpaste: edit
    });
    
    // nom.text is to be deprecated
    formSubmitText = nom.text(function() {
        return 'Add #' + state.items.length;
    });
    
    formSubmitButton = nom.el('button', function() {
        return { disabled: !state.text, children: formSubmitText }
    });
    
    return nom.mount(
        nom.el('h3', { textContent: state.title }),
        nom.el('ul', function() {
            return { children: state.items.map(nomListItem) }
        }),
        nom.el('form', { onsubmit: add, children: [ formTodoInput, formSubmitButton ] })
    );
}

document.body.appendChild(nom.mount(
    todo({
        title: 'I want to behave!',
        items: [
            { title: 'Avoid excessive caffeine', done: true },
            { title: 'Be less provocative' },
            { title: 'Be nice to people' }
        ]
    })
));
```

[Working sample at CodePen](http://codepen.io/Merri/full/YPbwBB/).

Length of this example can be greatly reduced by using ES2015 as it allows lambda syntax for functions. Of course that means you need to use a preprocessor as browser support for the new EcmaScript standard isn't complete yet. In future the length will go down a bit as `nom.text` hasn't been removed as it's replacement solution isn't written just yet.
