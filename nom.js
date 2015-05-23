/* Nom version 0.0.13, @license MIT, (c) 2015 Vesa Piittinen */
;(function(window, isBrowser, hasNode, hasRAF) {
    'use strict';

    // give at least something when outside browser environment or if no requestAnimationFrame available...
    function returnNull() { return null; }

    var nom = {
        el: returnNull,
        els: returnNull,
        mount: returnNull,
        supported: isBrowser && hasRAF,
        version: '0.0.13'
    };

    // var declares the variables to our scope even if isBrowser === false (but these variables will be undefined)
    if (isBrowser)
        // optimize minified JS size
        var Array = window.Array,
            document = window.document,
            flatten = Array.prototype.concat,
            Node = window.Node,
            // Object.prototype.toString.call() is the most compatible way to see if something is a function
            objFn = '[object Function]',
            objToStr = Object.prototype.toString,
            // typeof is fastest way to check if a function but older IEs don't support it for that and Chrome had a bug
            fn = 'function',
            canTypeOfFn = typeof returnNull === fn && typeof /./ !== fn,
            // htmlToDOM is HTML generator helper element
            htmlToDOM = document.createElement('div'),
            // helpers for IE
            ieActive = {},
            ltIE10 = 'all' in document && !window.atob;

    // patch IE9 oninput event bug (does not trigger if deleting value) and use the same code to add IE8- support
    function ieoninput(node) {
        // check that all conditions are met, escape as quickly as possible because this may be called often
        if (!node || !node.render || !('value' in node) || !('oninput' in node)) return;
        // are we tracking the right element?
        if (ieActive.node !== node) {
            ieActive.node = node;
            ieActive.value = node.value;
        // has the value changed?
        } else if(ieActive.value !== node.value) {
            ieActive.value = node.value;
            node.oninput();
        }
    }

    // apply the value deletion patch for IE9 and below
    if (isBrowser && 'attachEvent' in document && ltIE10)
        document.attachEvent('onselectionchange', function() { ieoninput(document.activeElement); });

    // applies properties to object or DOM node, adds render method to elements and returns the object
    function render(obj, props, staticProps) {
        var item, originalProps = props, prop, value,
            existingNode, node, nodeIndex, nodes, nodesToRemove = [];
        // we need to have an object of some sort
        if (obj == null) return obj;
        // see if it is a DOM element without a render method
        if ((hasNode ? obj instanceof Node : obj.nodeType > 0) && !obj.render)
            obj.render = function() {
                var node = obj.firstChild;
                // see if we need to render self
                if (!staticProps) render(obj, originalProps);
                // call render of all the children
                while (node) {
                    if (canTypeOfFn ? typeof node.render === fn : objToStr.call(node.render) === objFn)
                        node.render();

                    node = node.nextSibling;
                }
            };
        // if it is a function then assume it returns properties
        if (canTypeOfFn ? typeof props === fn : objToStr.call(props) === objFn)
            props = props.bind(obj)();
        // if it is a string then assume it is JSON
        else if (typeof props === 'string' && props.charCodeAt(0) === 0x7B) // = '{'
            props = JSON.parse(props);
        // should be an object now
        if (typeof props !== 'object')
            return obj;
        // array is expected to contain child nodes
        if (Array.isArray(props))
            props = {children: props};
        // apply each property
        for (prop in props) {
            if (!props.hasOwnProperty(prop)) continue;
            value = props[prop];
            // oninput DOM Level 1 event support for IE8 and below in few lines of code
            if (ltIE10 && prop === 'oninput' && !('oninput' in obj)) {
                obj.onpropertychange = function() {
                    if (window.event.propertyName === 'value') ieoninput(obj);
                }
            // special case for dealing with children
            } else if (prop === 'children' && obj.childNodes) {
                node = true;
                nodeIndex = 0;
                // shallow flatten to a one dimensional array, eg. [[a], [b, [c]]] -> [a, b, [c]]
                nodes = Array.isArray(value) ? flatten.apply([], value) : [value];
                // the following will reorganize nodes and update text nodes in order
                existingNode = obj.firstChild;
                while (existingNode) {
                    // do we need to figure out a new node or string to work with?
                    if (node === true)
                        while(
                            (node = nodes[nodeIndex++]) &&
                            !(typeof node === 'string' || (hasNode ? node instanceof Node : node.nodeType > 0))
                        );
                    // see if a string needs to be updated or added
                    if (typeof node === 'string') {
                        // text nodes are simply replaced with new content
                        if (existingNode.nodeType === 3) {
                            if (existingNode.nodeValue !== node) existingNode.nodeValue = node;
                            existingNode = existingNode.nextSibling;
                        // add a text node here as that is the best assumption we can make
                        } else
                            obj.insertBefore(document.createTextNode(node), existingNode);
                        // request next node/string
                        node = true;
                    // see if this is a Nom extended node
                    } else if (
                        canTypeOfFn
                        ? typeof existingNode.render === fn
                        : objToStr.call(existingNode.render) === objFn
                    ) {
                        // have we ran out of nodes?
                        if (!node) {
                            // abandon ship!
                            nodesToRemove.push(existingNode);
                            existingNode = existingNode.nextSibling;
                        } else {
                            // order has changed so move another node here
                            if (existingNode !== node)
                                obj.insertBefore(node, existingNode);
                            // in any other case we can just go ahead and compare the next node
                            else
                                existingNode = existingNode.nextSibling;
                            // request next node/string
                            node = true;
                        }
                    // ignore this element, it does not interest us
                    } else
                        existingNode = existingNode.nextSibling;
                }
                // remove the nodes that are no longer with us
                while (nodesToRemove.length)
                    obj.removeChild(nodesToRemove.pop());
                // create a fragment to host multiple nodes, otherwise use the parent node
                var fra = (nodes.length - nodeIndex > 0) ? document.createDocumentFragment() : obj;
                // add nodes that are missing
                while (nodes.length >= nodeIndex) {
                    // add text node
                    if (typeof node === 'string') fra.appendChild(document.createTextNode(node));
                    // add DOM element
                    else if (hasNode ? node instanceof Node : node.nodeType > 0) fra.appendChild(node);
                    // add anything else even if supporting this may be a bit dangerous
                    else fra.appendChild(nom.els(node));

                    node = nodes[nodeIndex++];
                }
                // see if there is a fragment to be added to the main node object
                if (fra !== obj && fra.childNodes.length)
                    obj.appendChild(fra);
            // skip functions
            } else if (canTypeOfFn ? typeof obj[prop] === fn : objToStr.call(obj[prop]) === objFn);
            // apply subproperties like style if value is an object
            else if (typeof value === 'object') {
                if (obj[prop] != null)
                    for (item in value)
                        if (value.hasOwnProperty(item) && obj[prop][item] !== value[item])
                            obj[prop][item] = value[item];
            }
            // simply set the property
            else if (obj[prop] !== value)
                obj[prop] = value;
        }
        // and we're done
        return obj;
    }

    if (isBrowser) {
        // takes element or creates an element, applies properties to the element and returns the element
        nom.el = function(element, props, staticProps) {
            var cssishParts, index = 0;
            // functions need no processing here
            if (canTypeOfFn ? typeof props !== fn : objToStr.call(props) !== objFn) {
                // sanitate against no props
                if (props == null)
                    props = {};
                // default to single assignment of properties
                if (staticProps == null)
                    staticProps = true;
                // see if props are really props, make them children if not so
                switch (typeof props) {
                    case 'object':
                        // do nothing more if it isn't an array
                        if (Array.isArray(props))
                            props = { children: props };
                        break;
                    case 'boolean':
                    case 'number':
                        props = props.toString();
                    // intentional to omit break here
                    default:
                        props = { children: props };
                }
            }
            // see if we need to build an element
            if (typeof element === 'string') {
                cssishParts = element.match(/([#.]?[^#.]+)/g);
                element = document.createElement(cssishParts[0])
                while (++index < cssishParts.length) {
                    switch(cssishParts[index].charCodeAt(0)) {
                        case 0x23: // #
                            element.id = cssishParts[index].slice(1);
                            break;
                        case 0x2E: // .
                            element.className = cssishParts[index].slice(1);
                            break;
                    }
                }
            }
            // assign new properties and add Nom's rendering capabilities to the element
            return render(element, props, !!staticProps);
        };

        // takes nodes, HTML strings, object notation elements or arrays of the aforementioned, returns a fragment
        nom.els = function(nodes) {
            var fragment = document.createDocumentFragment(), node, nodeIndex = 0, nodeTag;
            // create a real array out of everything given
            nodes = flatten.apply([], arguments);
            // nodes isn't really containing nodes yet, but we make them be ones
            while (nodes.length > nodeIndex) {
                node = nodes[nodeIndex++];
                // nodes are easy to add in right away
                if (hasNode ? node instanceof Node : node.nodeType > 0) {
                    fragment.appendChild(node);
                // HTML strings
                } else if (typeof node === 'string') {
                    // let a div to the hard work
                    htmlToDOM.innerHTML = node;
                    // capture the children to our fragment
                    while (htmlToDOM.firstChild)
                        fragment.appendChild(htmlToDOM.firstChild);
                // recursive call for arrays
                } else if (Array.isArray(node)) {
                    fragment.appendChild(nomElements.apply(this, node));
                // object notation elements
                } else if (typeof node === 'object') {
                    for (nodeTag in node) {
                        if (node.hasOwnProperty(nodeTag))
                            fragment.appendChild(nom.el(nodeTag, node[nodeTag]));
                    }
                }
            }
            // rainbows!
            return fragment;
        };

        // takes a fragment or same stuff as els, mounts them for automatic render, returns a fragment
        nom.mount = function(fragment) {
            var mounts = [], node, nodes = [], nodeIndex = 0;
            // make sure we work with a fragment; support skipping a call to els
            if (hasNode ? !(fragment instanceof Node && fragment.nodeType === 11) : fragment.nodeType !== 11)
                fragment = nom.els.apply(this, arguments);
            // get to know our original children
            while (fragment.childNodes.length > nodeIndex) {
                // remember all original childNodes of the fragment so we can restore them to fragment on unmount
                nodes.push(node = fragment.childNodes[nodeIndex++]);
                // gather additional reference of Nom rendered element
                if (canTypeOfFn ? typeof node.render === fn : objToStr.call(node.render) === objFn)
                    mounts.push(node);
            }
            // ends rendering and removes all original children from the document and returns the fragment
            fragment.unmount = function() {
                // stop render execution by clearing all active mounts
                mounts.length = 0;
                // restore all nodes back to the original fragment
                while (nodes.length)
                    fragment.appendChild(nodes.shift());
                // return the fragment
                return fragment;
            }
            // takes care of keeping the nodes up-to-date
            function render() {
                var index = mounts.length, mount;

                while (index) {
                    mount = mounts[--index];
                    // has the node been removed?
                    if (!mount.parentElement)
                        mounts.splice(index, 1);
                    // are we responsible for the render?
                    else if (
                        canTypeOfFn
                        ? typeof mount.parentElement.render !== fn
                        : objToStr.call(mount.parentElement.render) !== objFn
                    )
                        mount.render();
                }
                // keep rendering as long as there is something we can be responsible of
                if (mounts.length && hasRAF) requestAnimationFrame(render);
            }
            // initial render call
            if (hasRAF) requestAnimationFrame(render);
            // magitec!
            return fragment;
        };
    }

    // support CommonJS
    if (typeof exports === 'object')
        module.exports = nom;
    // support AMD
    else if (typeof define === fn && define.amd)
        define(function() { return nom; });
    // support browser
    else
        window.nom = nom;

})(this, 'document' in this, 'Node' in this, 'requestAnimationFrame' in this);