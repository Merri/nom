/* Nom version 0.0.6, @license MIT, (c) 2015 Vesa Piittinen */
;(function(isBrowser, hasNode, hasRAF) {
    function returnNull() { return null; }
    var nom = { el: returnNull, mount: returnNull, supported: isBrowser && hasRAF, version: '0.0.6' };
    if (!isBrowser || !hasRAF) return nom;

    var htmlToDOM = document.createElement('div');

    function render(obj, props, staticProps) {
        var item, originalProps = props, prop, value,
            existingNode, node, nodeIndex, nodes, nodesToRemove = [];

        if (obj == null) return obj;

        if ((hasNode ? obj instanceof Node : obj.nodeType > 0) && !obj.render)
            obj.render = function() {
                var node = obj.firstChild;

                if (!staticProps) render(obj, originalProps);

                while (node) {
                    if (Object.prototype.toString.call(node.render) === '[object Function]')
                        node.render();

                    node = node.nextSibling;
                }
            };

        if (Object.prototype.toString.call(props) === '[object Function]')
            props = props.bind(obj)();
        else if (typeof props === 'string' && props.charCodeAt(0) === 0x7B) // = '{'
            props = JSON.parse(props);

        if (typeof props !== 'object')
            return obj;

        for (prop in props) {
            if (!props.hasOwnProperty(prop)) continue;

            value = props[prop];

            if (prop === 'children' && obj.childNodes) {
                node = true;
                nodeIndex = 0;
                nodes = Array.isArray(value) ? Array.prototype.concat.apply([], value) : [value];

                existingNode = obj.firstChild;

                while (existingNode) {
                    if (node === true)
                        while(
                            (node = nodes[nodeIndex++]) &&
                            !(typeof node === 'string' || (hasNode ? node instanceof Node : node.nodeType > 0))
                        );

                    if (typeof node === 'string') {
                        if (existingNode.nodeType === 3) {
                            if (existingNode.nodeValue !== node) existingNode.nodeValue = node;
                            existingNode = existingNode.nextSibling;
                        } else {
                            obj.insertBefore(document.createTextNode(node), existingNode);
                        }

                        node = true;
                    } else if (Object.prototype.toString.call(existingNode.render) === '[object Function]') {
                        if (!node) {
                            nodesToRemove.push(existingNode);
                            existingNode = existingNode.nextSibling;
                        } else {
                            if (existingNode !== node)
                                obj.insertBefore(node, existingNode);
                            else
                                existingNode = existingNode.nextSibling;

                            node = true;
                        }
                    } else
                        existingNode = existingNode.nextSibling;
                }

                while (nodesToRemove.length)
                    obj.removeChild(nodesToRemove.pop());

                while (nodes.length >= nodeIndex) {
                    if (typeof node === 'string') obj.appendChild(document.createTextNode(node));
                    else if (hasNode ? node instanceof Node : node.nodeType > 0) obj.appendChild(node);
                    node = nodes[nodeIndex++];
                }

            } else if (Object.prototype.toString.call(obj[prop]) === '[object Function]');
            else if (typeof value === 'object') {
                for (item in value)
                    if (value.hasOwnProperty(item) && obj[prop][item] !== value[item])
                        obj[prop][item] = value[item];
            }
            else if (obj[prop] !== value)
                obj[prop] = value;
        }

        return obj;
    }

    nom.el = function nomElement(element, props, staticProps) {
        return render(typeof element !== 'string' ? element : document.createElement(element), props, staticProps);
    };

    nom.mount = function nomMount(nodes) {
        var fragment = document.createDocumentFragment(), mounts = [], node, nodeIndex = 0;

        fragment.unmount = function() {
            while (mounts.length)
                fragment.appendChild(mounts.shift());

            delete fragment;
            return nodes;
        }

        nodes = Array.prototype.concat.apply([], arguments);

        while (nodes.length > nodeIndex) {
            node = nodes[nodeIndex++];

            if (hasNode ? node instanceof Node : node.nodeType > 0) {
                mounts.push(node);
                fragment.appendChild(node);
            } else if (typeof node === 'string') {
                htmlToDOM.innerHTML = node;

                while (htmlToDOM.firstChild)
                    fragment.appendChild(htmlToDOM.firstChild);
            }
        }

        function render() {
            var index = mounts.length, mount;

            while (index) {
                mount = mounts[--index];
                if (!mount.parentElement)
                    mounts.splice(index, 1);
                else mount.render();
            }

            if (mounts.length) requestAnimationFrame(render);
        }
        requestAnimationFrame(render);

        return fragment;
    };

    // support CommonJS
    if (typeof exports === 'object')
        module.exports = nom;
    // support AMD
    else if (typeof define === 'function' && define.amd)
        define(function() { return nom; });
    // support browser
    else
        this.nom = nom;

})('document' in this, 'Node' in this, 'requestAnimationFrame' in this);