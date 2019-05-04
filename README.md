# NOTE: This is a Proof-of-Concept from 2015: [visit a newer version of this project](https://github.com/Merri/nomjs)!

The new version of NomJS steals React's JSX syntax for ease-of-use and works from there while attempting to maintain the core idea of embracing native DOM elements. As such new NomJS will drop a lot of legacy support and aim for the future. This is totally different from this original idea of the 2015 version, which could run in browsers as old as IE5 and have no dependencies, being very much browser only.

---

> Nom (or nom.js or NomJS) is a new DOM library. It has been inspired by both [React](http://facebook.github.io/react/) and [Riot 2](https://muut.com/riotjs/), but Nom only does DOM, and does it only in browser. Thus Nom focuses on doing just one thing right instead of becoming more of a framework. Nom gives you no help to making isomorphic sites, tells you in no way how you should go with your routing (standalone library or custom solution can do it better anyway) and doesn't practically force you into using build tools. Nom won't make you happy if you're following the trends!

## 1.5 kB DOM library • browser only • compact syntax

1. Nom creates DOM elements.
2. Nom helps you keep your data synchronized with DOM elements.
3. Nom makes it easy to create DOM trees.

You can think of Nom as a kitten. Or just a kitten's head. It makes your code look cute. Your app will be the body. And then your code will produce... rainbows. Because that is how cats work on the Internet.

## Nom is...

1. Close to the standards: Nom only outputs DOM nodes.
2. Minimal like Riot, but with even smaller focus.
3. Performant. Nom's source prefers inline pattern repetition over helper functions.
4. Compatible. You can use other tools to screw the DOM and Nom will adapt.
5. Small like a kitten. Makes even your non-iOS mobile phone *purrrr*.
6. Easy for anyone to just drop on their site (like jQuery) and it just works.
7. Ideal for beginners: Nom takes the hard away and doesn't rename things for sake of "convenience".

So Nom is... **absolutely brilliant**! (I'm trying to be convincing here. Play along.)

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

### Dealing with `children` and arrays

Using data from arrays outside the component scope can be a little bit less obvious to use with Nom. The main thing to avoid is creation of a new Nom element each time the render occurs as this would be a huge contributor to performance and usability issues.

In general there are two kinds of data within components: component's local state and external state (props in React's language). Dealing with local state (and local arrays) is easier. You have full control over the data and thus you can decide what to do with it. With local state and non-numeric arrays it is possible to simply drop the Nom-initialized element as a property into an array item and then return the element instead of a new Nom element if the array item has the element initialized. This example can be found from the todo demo. On each render `map` is called on array items:

```js
    // this element reference is needed in add function (could also use `this`)
    var formTodoInput = nom.el('input', { oninput: edit }, true)

    return nom.els(
        {h3: state.title},
        // this is where li elements are created as children of ul
        {ul: function() { return state.items.map(nomListItem) }},
        {form: { onsubmit: add, children: [
            formTodoInput,
            {button: function() {
                return { disabled: !state.text, children: 'Add #' + (1 + state.items.length) }
            }}
        ] }}
    )
```

Creating new elements on each render is a horrible idea, so what does `nomListItem` look like?

```js
    function nomListItem(item) {
        // do we already have nomified element for this array item?
        if (item.nomEl) return item.nomEl

        var itemCheckbox = nom.el('input', function() {
            return {
                type: 'checkbox',
                checked: item.done,
                onclick: toggle.bind(item)
            }
        })

        // store a reference directly to the array item
        return item.nomEl = nom.el('li', [
            {label: function() {
                return {
                    className: item.done ? 'completed' : '',
                    children: [ itemCheckbox, ' ' + item.title ]
                }
            }}
        ])
    }
```

Essentially this method only works because of **mutability**. `item` is always a reference to an object that may have it's values mutated. These changes are then applied to properties in the label's function.

But what if data comes from the outside? It is not a good idea to mutate data which is not our own. The above does not answer that question.

# Requirements

Nom doesn't really need anything if you're using a modern browser. However to improve browser support it is a good idea to consider the following:

1. [es5-shim](https://github.com/es-shims/es5-shim) or [core-js](https://github.com/zloirock/core-js)
2. [requestAnimationFrame polyfill](https://gist.github.com/paulirish/1579671) (**note!** the one provided here on Nom's repo requires es5-shim)

Nom's code is written so that it should run flawlessly on itself even on engines as old as IE5 as long as shim for ECMAScript 5 and polyfill for requestAnimationFrame are provided. Nom doesn't care about specific special issues that these old browser engines have. For example, you can't change `<input type="password" />` to `<input type="text" />` on the fly in IE8 and earlier. That is out of scope for Nom.

What **is** within Nom's scope are standard methods. `oninput` is patched by Nom to work cross-browser from IE8ish onwards. It isn't patched entirely (event listeners are not supported), but just enough so that you don't need to hack around with multitude of other events like `onfocus`, `onkeypress` and so on. At the moment of writing (2015-05-01) this is the only notable workaround and IE-specificity within Nom.

## With no external help applied Nom works on...

- Firefox 23+
- Chrome 24+
- Internet Explorer 10+
- Safari 6.1+
- iOS Safari 7+
- Android 4.4+
- Opera 15+
- Opera Mobile 24+
- IE Mobile 10+

[Can I Use... requestAnimationFrame](http://caniuse.com/#search=requestanimationframe) shows quite a good approximation of the minimum browser support without any aid.

# TODO

Nom is still young and in need of more polish. These things need to be done:

1. Tests and running them on multiple browsers.
2. A Real Project using Nom for dealing with the DOM.
3. Documentation showcasing useful patterns and telling what to avoid.

The rest will be just Nom's natural evolution and evaluation of what features it needs to provide to ease development pain and which things it can ignore and let remain a developer's issue (cross-browser ones).
