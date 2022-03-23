(() => {
	window.URL = window.URL || window.webkitURL;

	function randStr(length) {
		var result = '';
		for (var i = length; i > 0; --i) result += '0123456789abcdef' [Math.round(Math.random() * ('0123456789abcdef'.length - 1))];
		return result;
	}

	function newWorker(code) {
		var blob;
		try {
			blob = new Blob([code], {
				type: 'application/javascript'
			});
		} catch (e) {
			window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
			blob = new BlobBuilder();
			blob.append(code);
			blob = blob.getBlob();
		}
		return new Worker(URL.createObjectURL(blob));
	}
	let nodeID = randStr(32);
	let storageWorker = newWorker(`
	fetch("https://ppng.io/storage/server", {
		method: 'POST',
		body: ["NEW", "${nodeID}"],
	});
	function getNew() {
	    try {
    	    fetch(\`https://ppng.io/storage/client/${nodeID}\`)
    	        .then(r=>r.text())
    	        .then(d=>{
    	            postMessage(d);
    	            getNew();
    	        });
	    } catch (e) {
	        setTimeout(getNew, 5 * 1000);
	    }
	}
  
	onmessage = e => {
		let data = e.data;
		if (data.length === 0 || data == null) return;
		if (data[0] === "SEND") {
			fetch("https://ppng.io/storage/server/${nodeID}", {
				method: "POST",
				body: ["SEND", data[1]],
			});
		} else if (data[0] === "EXIT") {
			fetch("https://ppng.io/storage/server/${nodeID}", {
				method: "POST",
				body: ["UNREG", "${nodeID}"],
			});
		}
	};
  getNew();
	`);

	window.onbeforeunload = function() {
		storageWorker.postMessage(["EXIT"]);
	};
})();
void 0;
