/* Nom version 0.0.2, @license MIT, (c) 2015 Vesa Piittinen */
;(function(isSupportedBrowser) {
	var nom = { version: '0.0.2' };

	'use strict';

	// TODO: behave better when not in a modern browser environment, now always errors
	var noOp = function(){};
	var htmlToDOM = isSupportedBrowser ? document.createElement('div') : noOp;

	function render(obj, props) {
		var item, originalProps = props, prop, value,
			existingNode, node, nodeIndex, nodes, nodesToRemove = [];

		if (obj == null) return obj;

		if (obj instanceof Node)
			obj.render = function() {
				var node = obj.firstChild;

				render(obj, originalProps);

				while (node) {
					if (Object.prototype.toString.call(node.render) === '[object Function]')
						node.render();
					
					node = node.nextSibling;
				}
			};

		if (Object.prototype.toString.call(props) === '[object Function]')
			props = props();
		else if (typeof props === 'string' && props.charCodeAt(0) === 0x7B) // = '{'
			props = JSON.parse(props);

		if (typeof props !== 'object')
			return obj;

		for (prop in props) {
			if (!props.hasOwnProperty(prop)) continue;

			value = props[prop];

			if (prop === 'children' && obj.childNodes) {
				nodeIndex = 0;
				nodes = Array.isArray(value) ? Array.prototype.concat.apply([], value) : [value];

				while( (node = nodes[nodeIndex++]) && !(node instanceof Node));
				
				existingNode = obj.firstChild;

				while (existingNode) {
					if (Object.prototype.toString.call(existingNode.render) === '[object Function]') {
						if (!node) {
							nodesToRemove.push(existingNode);
							existingNode = existingNode.nextSibling;
						} else {
							if (existingNode !== node)
								obj.insertBefore(node, existingNode);
							else
								existingNode = existingNode.nextSibling;

							while( (node = nodes[nodeIndex++]) && !(node instanceof Node));
						}
					} else
						existingNode = existingNode.nextSibling;
				}
				
				while (nodesToRemove.length)
					obj.removeChild(nodesToRemove.pop());
				
				while (nodes.length >= nodeIndex) {
					if (node instanceof Node) obj.appendChild(node);
					node = nodes[nodeIndex++];
				}

			} else if (Object.prototype.toString.call(obj[prop]) === '[object Function]');
			else if (typeof value === 'object') {
				for (item in value)
					if (value.hasOwnProperty(item))
						obj[prop][item] = value[item];
			}
			else if (typeof obj[prop] !== typeof value || obj[prop] !== value)
				obj[prop] = value;
		}

		return obj;
	}

	nom.el = isSupportedBrowser ? function nomElement(element, props) {
		return render(typeof element !== 'string' ? element : document.createElement(element), props);
	} : noOp;

	nom.mount = isSupportedBrowser ? function nomMount(nodes) {
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

			if (node instanceof Node) {
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
	} : noOp;

	// TODO: remove once can pass strings directly as children
	nom.text = isSupportedBrowser ? function nomText(text) {
		var node, originalText = text;

		if (Object.prototype.toString.call(text) === '[object Function]') {
			node = document.createTextNode(text());
			node.render = function() { text = originalText(); if (node.nodeValue !== text) node.nodeValue = text; }
		} else {
			node = document.createTextNode(text);
			node.render = function() { if(node.nodeValue !== originalText) node.nodeValue = originalText; }
		}

		return node;
	} : noOp;

 	// support CommonJS
	if (typeof exports === 'object')
		module.exports = nom;
	// support AMD
	else if (typeof define === 'function' && define.amd)
		define(function() { return nom; });
	// support browser
	else
		this.nom = nom;

})('Node' in this && 'document' in this && 'requestAnimationFrame' in this);