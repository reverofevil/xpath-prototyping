// ==UserScript==
// @name        xpath-prototyping
// @namespace   wtf-is-namespace
// @description HTML data mining
// @version     0.1
// @grant       none
// ==/UserScript==

var FIREBUG_MODE = true;

function createXPathFromElement(elm) {
	for (segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) {
		var name = elm.localName.toLowerCase();
		if (name == 'html') { segs.unshift(name); break; }
		var i;
		for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling)
			if (sib.localName == elm.localName)
				++i;
		if (FIREBUG_MODE) {
			if (i > 1)
				name += '[' + i + ']';
		} else {
			if (elm.hasAttribute('id') && elm.getAttribute('id') != "") {
				name += '[@id="' + elm.getAttribute('id') + '"]';
			} else {
				name += '[' + i + ']';
				if (elm.hasAttribute('class') && elm.getAttribute('class') != "")
					name += '[@class="' + elm.getAttribute('class') + '"]';
			}
		}
		segs.unshift(name);
	}
	return segs.length ? '/' + segs.join('/') : null;
}

function lookupElementByXPath(path) {
	var evaluator = new XPathEvaluator();
	var result = evaluator.evaluate(path, document.documentElement, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	return result.singleNodeValue;
}

function lookupElementsByXPath(x) {
	var result = document.evaluate(x, document.documentElement, null, 5, null);
	var res = [], next;
	while (next = result.iterateNext())
		res.push(next);
	return res;
}

var reverseStyle = [];
function unStyle() {
	for (var i = 0; i < reverseStyle.length; ++i)
		reverseStyle[i][0].style.cssText = reverseStyle[i][1];
}

function drawFromPath(path) {
	var list = lookupElementsByXPath(path);
	unStyle();
	for (var i = 0; i < list.length; ++i) {
		reverseStyle.push([list[i], list[i].style.cssText]);
		if (list[i].tagName.toLowerCase() == "img") {
			list[i].style.border = '3px solid yellow';
		} else {
			list[i].style.background = '#FFFFA0';
		}
	}
}

document.documentElement.addEventListener("click", function(event) {
	if (!event.altKey) return;
	if (event === undefined) event = window.event;
	var target = 'target' in event ? event.target : event.srcElement;
	var path = createXPathFromElement(target);
	document.getElementById("xpath").value = path;
	drawFromPath(path);
	return false;
});

var Base64 = {
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
		input = Base64._utf8_encode(input);
		while (i < input.length) {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
			output = output +
			Base64._keyStr.charAt(enc1) + Base64._keyStr.charAt(enc2) +
			Base64._keyStr.charAt(enc3) + Base64._keyStr.charAt(enc4);
		}
		return output;
	},

	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		while (i < input.length) {
			enc1 = Base64._keyStr.indexOf(input.charAt(i++));
			enc2 = Base64._keyStr.indexOf(input.charAt(i++));
			enc3 = Base64._keyStr.indexOf(input.charAt(i++));
			enc4 = Base64._keyStr.indexOf(input.charAt(i++));
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
			output = output + String.fromCharCode(chr1);
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
		}
		output = Base64._utf8_decode(output);
		return output;
	},

	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}
		return utftext;
	},

	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = 0, c1 = 0, c2 = 0;

		while ( i < utftext.length ) {

			c = utftext.charCodeAt(i);

			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c1 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c1 & 63));
				i += 2;
			}
			else {
				c1 = utftext.charCodeAt(i+1);
				c2 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c1 & 63) << 6) | (c2 & 63));
				i += 3;
			}

		}
		return string;
	}
}

window.addEventListener("load", function () {
	body = document.getElementsByTagName("body")[0];
	var space = document.createElement('div');
	space.style.height = "34px";
	space.style.clear = "both";
	body.appendChild(space);
	div = document.createElement("div");
	div.innerHTML = "\
	<div id=\"xpather\" style=\"position: fixed; left: 0px; top: 100%; margin-top: -34px; width: 100%; height: 34px; background: white; z-index: 32768;\">\
		<table style=\"border: 0px; padding: 0px; border-collapse:collapse; width: 100%; height: 34px; background-repeat: repeat-x;background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAiCAIAAAARTyRGAAAABGdBTUEAALGPC/xhBQAAAINJREFUGFcFwdkSgQAAQNH7A5492k1qKqV90aIINZliGMswvPsFv+4cOt0B9++P/Pgha9+kzYvk8CSuH0TVjbC8Euwv+NszXnHCXbc4eYO1OmCmNUZcsYhKtOWOeVCg+hsUN0d2MiQ7RTQTZkaEoIdMtYCJ6jFWXEayzVCy6IsGPUH/A1YQGPVUbzmcAAAAAElFTkSuQmCC)\">\
			<tr>\
				<td style=\"vertical-align: middle; padding:0px; width: 21px; background-repeat: no-repeat; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAiCAIAAAA/CgXUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAbNJREFUSEul1LtOwlAcx/HjAzgJGoOIchMvUEBuhSLQUigUyq0ICFjFaNSor2Cc3XV2d3fXWWfdfRB/BgYCDPSUfJaT/L9tOW3OwuLKJjHy693dG0FE9cwIkm0MjCB8/WRIaAyKR1dK/0bRbudHMlUN+Nqp3Lly7IXNa/alVdv8SLrSB6l1gXh53bXmZKxu//xIqtwFuXNpttitbsbmCepCkqUjKHYu8cy6yuEw4eQ2FNoXlH2i0AKpdU7Zx6Um5A/PKHs214CcOqDsY2IdxMYpZR8RqiDUtOn++eV1/I1MLEf7H+YrIFSPp/vP79+39y9Z1YajE8tRH0qXgVd6M++PBh4enzCN+48vR/1+qgQZpTvz/ze16/fPH2Svbx8IJpb/30/goAipcoey93MSHMhtyudnEnlIFluU++djReCkJuX788aykMirlN/PbpSHeK5O2e+EM8CKNcp+O5SCWLZK2XuCSYjyCmXvDnAQSpdMls31Lb/eI4y4mDgw8ZzV5cX5q/cSxOljwe3nAlwBlzBZNuY//DFJHN7okMvH+mJCMCnpQuy7ESPIxk7ICKJ3wyfm/wD+N9ogH8OeTAAAAABJRU5ErkJggg==);\"></td>\
				<td style=\"padding:0px; padding-left:3px; vertical-align: middle; background-repeat: repeat-x; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAiCAIAAAARTyRGAAAABGdBTUEAALGPC/xhBQAAADlJREFUGFdj4BVXZIjJq2dwDUlmcAlOYvCLz2UQlpRnkFUzYJDXMKIJBplvZOvBoKRtxqCgZQKyAwBCnRI+IrS80gAAAABJRU5ErkJggg==);\" >\
					<div style=\"display: inline-block; width: 100%;\">\
						<input id=\"xpath\" type=\"text\" style=\"margin: 0px !important; padding: 0px !important; padding-top: 1px; border: none; width: 100% !important; height: 20px !important; background: #272727 !important; color: white !important; font-family: \'Lucida Console\', Verdana, Tahoma, monospace !important;\" />\
					</div>\
				</td>\
				<td style=\"padding:0px; width: 6px; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAiCAIAAAACmGSyAAAABGdBTUEAALGPC/xhBQAAAUhJREFUOE910mtPgmAUwPGnD9Cr1NYU75hpAhpeEBBFQARFVMx7pq6mW+sr9NXD1XbO3Dj7vftvZzvbubm9T5Gg2Xz/BCG6dwxCtOkhCHG2X9bqrHl7dfJ+hYRj6cxz1V6e1fG+4+4wQmWZCJX1c3/x2R5tMZLIV2I0G46m7dVJGa6xS/PdPSSs5UkerDBo/k7JXmDQzPmH2J9j0Hqvx6Y5w6AZ3kEwphg0fbpv6BMMWne8q3VdDDX3raqOMGiqs+HbQwxax1m/KAMMmjJcllsWBq1lLzjJxKDJ1pwVexg0yZwxgo5BE3teqaFh0JrGpFhXMWiCPi5UOxi0huY+8QoGra46+YqMXRqV40LRFN8e5MoSRuKPXCROU3SJbRo028RIKJr0Q1nq5zgxywgYqcgm0+jSrJAp1a+QdLEWhCQLfJD/G/4++Mov51bLSPWQBGkAAAAASUVORK5CYII=);\"></td>\
				<td style=\"padding-left: 10px; padding-right: 10px; width: 37px; vertical-align: middle;\">\
					<a id=\"getjson\" href=\"#\" style=\"font-size: 10pt; text-decoration: none; color: #D0D0D0;\" onmouseout=\"this.style.cssText='font-size: 10pt; text-decoration: none; color: #D0D0D0;';\" onmouseover=\"this.style.cssText='font-size: 10pt; text-decoration: none; color: #5080FF; text-shadow: 0 0 3px #5080FF;';\">JSON</a>\
				</td>\
			</tr>\
		</table>\
	</div>";
	body.appendChild(div);
	document.getElementById("xpath").addEventListener("keyup", function (event) {
		var xpath = document.getElementById("xpath").value;
		if (xpath == "") {
			unStyle();
		} else {
			drawFromPath(xpath);
		}
	});
	document.getElementById("getjson").addEventListener("click", function (event) {
		var xpath = document.getElementById("xpath").value;
		if (xpath == "") return false;
		var list = lookupElementsByXPath(xpath);
		var ret = [];
		for (var i = 0; i < list.length; ++i)
			ret.push(list[i].innerHTML);
		var json = JSON.stringify(ret, null, 2);
		//var b64 = "data:application/json," + Base64.encode(json); 
		//window.open(b64, "_blank");
		prompt("Result", json);
		return false;
	});
});