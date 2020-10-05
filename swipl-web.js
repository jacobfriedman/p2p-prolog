var SWIPL = (function() {
    var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
    if (typeof __filename !== 'undefined') _scriptDir = _scriptDir || __filename;
    return (
        function(SWIPL) {
            SWIPL = SWIPL || {};

            var Module = typeof SWIPL !== "undefined" ? SWIPL : {};
            var readyPromiseResolve, readyPromiseReject;
            Module["ready"] = new Promise(function(resolve, reject) {
                readyPromiseResolve = resolve;
                readyPromiseReject = reject
            });
            if (!Module.expectedDataFileDownloads) {
                Module.expectedDataFileDownloads = 0
            }
            Module.expectedDataFileDownloads++;
            (function() {
                var loadPackage = function(metadata) {
                    var PACKAGE_PATH;
                    if (typeof window === "object") {
                        PACKAGE_PATH = window["encodeURIComponent"](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf("/")) + "/")
                    } else if (typeof location !== "undefined") {
                        PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf("/")) + "/")
                    } else {
                        throw "using preloaded data can only be done on a web page or in a web worker"
                    }
                    var PACKAGE_NAME = "swipl-web.data";
                    var REMOTE_PACKAGE_BASE = "swipl-web.data";
                    if (typeof Module["locateFilePackage"] === "function" && !Module["locateFile"]) {
                        Module["locateFile"] = Module["locateFilePackage"];
                        err("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)")
                    }
                    var REMOTE_PACKAGE_NAME = Module["locateFile"] ? Module["locateFile"](REMOTE_PACKAGE_BASE, "") : REMOTE_PACKAGE_BASE;
                    var REMOTE_PACKAGE_SIZE = metadata["remote_package_size"];
                    var PACKAGE_UUID = metadata["package_uuid"];

                    function fetchRemotePackage(packageName, packageSize, callback, errback) {
                        var xhr = new XMLHttpRequest;
                        xhr.open("GET", packageName, true);
                        xhr.responseType = "arraybuffer";
                        xhr.onprogress = function(event) {
                            var url = packageName;
                            var size = packageSize;
                            if (event.total) size = event.total;
                            if (event.loaded) {
                                if (!xhr.addedTotal) {
                                    xhr.addedTotal = true;
                                    if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
                                    Module.dataFileDownloads[url] = {
                                        loaded: event.loaded,
                                        total: size
                                    }
                                } else {
                                    Module.dataFileDownloads[url].loaded = event.loaded
                                }
                                var total = 0;
                                var loaded = 0;
                                var num = 0;
                                for (var download in Module.dataFileDownloads) {
                                    var data = Module.dataFileDownloads[download];
                                    total += data.total;
                                    loaded += data.loaded;
                                    num++
                                }
                                total = Math.ceil(total * Module.expectedDataFileDownloads / num);
                                if (Module["setStatus"]) Module["setStatus"]("Downloading data... (" + loaded + "/" + total + ")")
                            } else if (!Module.dataFileDownloads) {
                                if (Module["setStatus"]) Module["setStatus"]("Downloading data...")
                            }
                        };
                        xhr.onerror = function(event) {
                            throw new Error("NetworkError for: " + packageName)
                        };
                        xhr.onload = function(event) {
                            if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || xhr.status == 0 && xhr.response) {
                                var packageData = xhr.response;
                                callback(packageData)
                            } else {
                                throw new Error(xhr.statusText + " : " + xhr.responseURL)
                            }
                        };
                        xhr.send(null)
                    }

                    function handleError(error) {
                        console.error("package error:", error)
                    }
                    var fetchedCallback = null;
                    var fetched = Module["getPreloadedPackage"] ? Module["getPreloadedPackage"](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE) : null;
                    if (!fetched) fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
                        if (fetchedCallback) {
                            fetchedCallback(data);
                            fetchedCallback = null
                        } else {
                            fetched = data
                        }
                    }, handleError);

                    function runWithFS() {
                        function assert(check, msg) {
                            if (!check) throw msg + (new Error).stack
                        }
                        Module["FS_createPath"]("/", "wasm-preload", true, true);
                        Module["FS_createPath"]("/wasm-preload", "library", true, true);
                        Module["FS_createPath"]("/wasm-preload/library", "iri_scheme", true, true);
                        Module["FS_createPath"]("/wasm-preload/library", "theme", true, true);
                        Module["FS_createPath"]("/wasm-preload/library", "lynx", true, true);
                        Module["FS_createPath"]("/wasm-preload/library", "dcg", true, true);
                        Module["FS_createPath"]("/wasm-preload/library", "clp", true, true);
                        Module["FS_createPath"]("/wasm-preload/library", "unicode", true, true);
                        Module["FS_createPath"]("/wasm-preload/library", "dialect", true, true);
                        Module["FS_createPath"]("/wasm-preload/library/dialect", "hprolog", true, true);
                        Module["FS_createPath"]("/wasm-preload/library/dialect", "swi", true, true);
                        Module["FS_createPath"]("/wasm-preload/library/dialect", "xsb", true, true);
                        Module["FS_createPath"]("/wasm-preload/library/dialect", "sicstus", true, true);
                        Module["FS_createPath"]("/wasm-preload/library/dialect", "eclipse", true, true);
                        Module["FS_createPath"]("/wasm-preload/library/dialect", "yap", true, true);
                        Module["FS_createPath"]("/wasm-preload/library/dialect", "iso", true, true);

                        function DataRequest(start, end, audio) {
                            this.start = start;
                            this.end = end;
                            this.audio = audio
                        }
                        DataRequest.prototype = {
                            requests: {},
                            open: function(mode, name) {
                                this.name = name;
                                this.requests[name] = this;
                                Module["addRunDependency"]("fp " + this.name)
                            },
                            send: function() {},
                            onload: function() {
                                var byteArray = this.byteArray.subarray(this.start, this.end);
                                this.finish(byteArray)
                            },
                            finish: function(byteArray) {
                                var that = this;
                                Module["FS_createDataFile"](this.name, null, byteArray, true, true, true);
                                Module["removeRunDependency"]("fp " + that.name);
                                this.requests[this.name] = null
                            }
                        };
                        var files = metadata["files"];
                        for (var i = 0; i < files.length; ++i) {
                            new DataRequest(files[i]["start"], files[i]["end"], files[i]["audio"]).open("GET", files[i]["filename"])
                        }

                        function processPackageData(arrayBuffer) {
                            assert(arrayBuffer, "Loading data file failed.");
                            assert(arrayBuffer instanceof ArrayBuffer, "bad input to processPackageData");
                            var byteArray = new Uint8Array(arrayBuffer);
                            DataRequest.prototype.byteArray = byteArray;
                            var files = metadata["files"];
                            for (var i = 0; i < files.length; ++i) {
                                DataRequest.prototype.requests[files[i].filename].onload()
                            }
                            Module["removeRunDependency"]("datafile_swipl-web.data")
                        }
                        Module["addRunDependency"]("datafile_swipl-web.data");
                        if (!Module.preloadResults) Module.preloadResults = {};
                        Module.preloadResults[PACKAGE_NAME] = {
                            fromCache: false
                        };
                        if (fetched) {
                            processPackageData(fetched);
                            fetched = null
                        } else {
                            fetchedCallback = processPackageData
                        }
                    }
                    if (Module["calledRun"]) {
                        runWithFS()
                    } else {
                        if (!Module["preRun"]) Module["preRun"] = [];
                        Module["preRun"].push(runWithFS)
                    }
                };
                loadPackage({
                    "files": [{
                        "filename": "/wasm-preload/boot.prc",
                        "start": 0,
                        "end": 100400,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/base64.pl",
                        "start": 100400,
                        "end": 112853,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/prolog_deps.pl",
                        "start": 112853,
                        "end": 129784,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/explain.pl",
                        "start": 129784,
                        "end": 141979,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/apply.pl",
                        "start": 141979,
                        "end": 154053,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/oset.pl",
                        "start": 154053,
                        "end": 159800,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/pio.pl",
                        "start": 159800,
                        "end": 161727,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/readutil.pl",
                        "start": 161727,
                        "end": 172816,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/pure_input.pl",
                        "start": 172816,
                        "end": 182688,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/rbtrees.pl",
                        "start": 182688,
                        "end": 215002,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/main.pl",
                        "start": 215002,
                        "end": 219744,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/vm.pl",
                        "start": 219744,
                        "end": 226939,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/ordsets.pl",
                        "start": 226939,
                        "end": 241478,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/persistency.pl",
                        "start": 241478,
                        "end": 263397,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/checkselect.pl",
                        "start": 263397,
                        "end": 266592,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/nb_set.pl",
                        "start": 266592,
                        "end": 272258,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/prolog_xref.pl",
                        "start": 272258,
                        "end": 363195,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/writef.pl",
                        "start": 363195,
                        "end": 373116,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/assoc.pl",
                        "start": 373116,
                        "end": 390437,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/occurs.pl",
                        "start": 390437,
                        "end": 394785,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/prolog_history.pl",
                        "start": 394785,
                        "end": 400650,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/prolog_install.pl",
                        "start": 400650,
                        "end": 406415,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/backcomp.pl",
                        "start": 406415,
                        "end": 426030,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/prolog_code.pl",
                        "start": 426030,
                        "end": 435254,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/ugraphs.pl",
                        "start": 435254,
                        "end": 455051,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/prolog_xref.qlf",
                        "start": 455051,
                        "end": 490538,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/tables.pl",
                        "start": 490538,
                        "end": 503150,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/atom.pl",
                        "start": 503150,
                        "end": 508572,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/date.pl",
                        "start": 508572,
                        "end": 518024,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/prolog_codewalk.pl",
                        "start": 518024,
                        "end": 557351,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/varnumbers.pl",
                        "start": 557351,
                        "end": 564492,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/INDEX.pl",
                        "start": 564492,
                        "end": 606326,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/apply_macros.pl",
                        "start": 606326,
                        "end": 618550,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/sort.pl",
                        "start": 618550,
                        "end": 622370,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/fastrw.pl",
                        "start": 622370,
                        "end": 626556,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/checklast.pl",
                        "start": 626556,
                        "end": 629812,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/codesio.pl",
                        "start": 629812,
                        "end": 636261,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/ansi_term.pl",
                        "start": 636261,
                        "end": 651691,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/zip.pl",
                        "start": 651691,
                        "end": 659332,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/iostream.pl",
                        "start": 659332,
                        "end": 668084,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/tabling.pl",
                        "start": 668084,
                        "end": 669884,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/lists.pl",
                        "start": 669884,
                        "end": 691571,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/lazy_lists.pl",
                        "start": 691571,
                        "end": 707579,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/yall.pl",
                        "start": 707579,
                        "end": 727089,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/error.pl",
                        "start": 727089,
                        "end": 742945,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/nb_rbtrees.pl",
                        "start": 742945,
                        "end": 750883,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/tty.pl",
                        "start": 750883,
                        "end": 760158,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/thread_pool.pl",
                        "start": 760158,
                        "end": 777039,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/edinburgh.pl",
                        "start": 777039,
                        "end": 781536,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/git.pl",
                        "start": 781536,
                        "end": 809272,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/readln.pl",
                        "start": 809272,
                        "end": 818199,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/modules.pl",
                        "start": 818199,
                        "end": 822671,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/obfuscate.pl",
                        "start": 822671,
                        "end": 826793,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/when.pl",
                        "start": 826793,
                        "end": 834459,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/url.pl",
                        "start": 834459,
                        "end": 862612,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/prolog_source.pl",
                        "start": 862612,
                        "end": 892913,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/sandbox.pl",
                        "start": 892913,
                        "end": 934602,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/base32.pl",
                        "start": 934602,
                        "end": 942895,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/aggregate.pl",
                        "start": 942895,
                        "end": 966829,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/predicate_options.pl",
                        "start": 966829,
                        "end": 997879,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/arithmetic.pl",
                        "start": 997879,
                        "end": 1006965,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/record.pl",
                        "start": 1006965,
                        "end": 1023573,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/broadcast.pl",
                        "start": 1023573,
                        "end": 1028928,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/pairs.pl",
                        "start": 1028928,
                        "end": 1034792,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/coinduction.pl",
                        "start": 1034792,
                        "end": 1040852,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/prolog_autoload.pl",
                        "start": 1040852,
                        "end": 1049401,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/prolog_wrap.pl",
                        "start": 1049401,
                        "end": 1054805,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/thread.pl",
                        "start": 1054805,
                        "end": 1082331,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/heaps.pl",
                        "start": 1082331,
                        "end": 1090608,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/files.pl",
                        "start": 1090608,
                        "end": 1093365,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/wfs.pl",
                        "start": 1093365,
                        "end": 1100286,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/check.pl",
                        "start": 1100286,
                        "end": 1133281,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/portray_text.pl",
                        "start": 1133281,
                        "end": 1139228,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/operators.pl",
                        "start": 1139228,
                        "end": 1144472,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/prolog_config.pl",
                        "start": 1144472,
                        "end": 1149280,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/prolog_pack.pl",
                        "start": 1149280,
                        "end": 1234634,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/threadutil.pl",
                        "start": 1234634,
                        "end": 1249777,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/console_input.pl",
                        "start": 1249777,
                        "end": 1253464,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/prolog_metainference.pl",
                        "start": 1253464,
                        "end": 1263278,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/terms.pl",
                        "start": 1263278,
                        "end": 1272157,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/.created",
                        "start": 1272157,
                        "end": 1272157,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/option.pl",
                        "start": 1272157,
                        "end": 1284434,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/utf8.pl",
                        "start": 1284434,
                        "end": 1289039,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dif.pl",
                        "start": 1289039,
                        "end": 1297232,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/qsave.pl",
                        "start": 1297232,
                        "end": 1338393,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/edit.pl",
                        "start": 1338393,
                        "end": 1357477,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/hashtable.pl",
                        "start": 1357477,
                        "end": 1367801,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect.pl",
                        "start": 1367801,
                        "end": 1371895,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/gensym.pl",
                        "start": 1371895,
                        "end": 1375357,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/settings.pl",
                        "start": 1375357,
                        "end": 1399321,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/make.pl",
                        "start": 1399321,
                        "end": 1405644,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/intercept.pl",
                        "start": 1405644,
                        "end": 1414266,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/debug.pl",
                        "start": 1414266,
                        "end": 1427670,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/prolog_format.pl",
                        "start": 1427670,
                        "end": 1434533,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/pprint.pl",
                        "start": 1434533,
                        "end": 1457893,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/system.pl",
                        "start": 1457893,
                        "end": 1461201,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/ctypes.pl",
                        "start": 1461201,
                        "end": 1466223,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/shell.pl",
                        "start": 1466223,
                        "end": 1476928,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/www_browser.pl",
                        "start": 1476928,
                        "end": 1485228,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/prolog_jiti.pl",
                        "start": 1485228,
                        "end": 1490413,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/prolog_clause.pl",
                        "start": 1490413,
                        "end": 1520259,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/listing.pl",
                        "start": 1520259,
                        "end": 1557457,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/quasi_quotations.pl",
                        "start": 1557457,
                        "end": 1568843,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/csv.pl",
                        "start": 1568843,
                        "end": 1587937,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/charsio.pl",
                        "start": 1587937,
                        "end": 1594573,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/statistics.pl",
                        "start": 1594573,
                        "end": 1617538,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/random.pl",
                        "start": 1617538,
                        "end": 1629220,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/prolog_trace.pl",
                        "start": 1629220,
                        "end": 1636289,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/prolog_colour.qlf",
                        "start": 1636289,
                        "end": 1680132,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/strings.pl",
                        "start": 1680132,
                        "end": 1695680,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/prolog_stack.pl",
                        "start": 1695680,
                        "end": 1718237,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/prolog_breakpoints.pl",
                        "start": 1718237,
                        "end": 1729067,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dicts.pl",
                        "start": 1729067,
                        "end": 1739444,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/prolog_colour.pl",
                        "start": 1739444,
                        "end": 1839879,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/check_installation.pl",
                        "start": 1839879,
                        "end": 1864978,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/shlib.pl",
                        "start": 1864978,
                        "end": 1884840,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/solution_sequences.pl",
                        "start": 1884840,
                        "end": 1897092,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/qpforeign.pl",
                        "start": 1897092,
                        "end": 1919397,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/quintus.pl",
                        "start": 1919397,
                        "end": 1932490,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/optparse.pl",
                        "start": 1932490,
                        "end": 1970764,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/hotfix.pl",
                        "start": 1970764,
                        "end": 1978646,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/iri_scheme/.created",
                        "start": 1978646,
                        "end": 1978646,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/iri_scheme/file.pl",
                        "start": 1978646,
                        "end": 1981471,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/theme/auto.pl",
                        "start": 1981471,
                        "end": 1983696,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/theme/dark.pl",
                        "start": 1983696,
                        "end": 1995600,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/theme/.created",
                        "start": 1995600,
                        "end": 1995600,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/lynx/INDEX.pl",
                        "start": 1995600,
                        "end": 1996124,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/lynx/pldoc_style.pl",
                        "start": 1996124,
                        "end": 1999369,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/lynx/html_text.pl",
                        "start": 1999369,
                        "end": 2024107,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/lynx/html_style.pl",
                        "start": 2024107,
                        "end": 2028588,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/lynx/.created",
                        "start": 2028588,
                        "end": 2028588,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/lynx/format.pl",
                        "start": 2028588,
                        "end": 2039379,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dcg/basics.pl",
                        "start": 2039379,
                        "end": 2050067,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dcg/INDEX.pl",
                        "start": 2050067,
                        "end": 2051344,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dcg/high_order.pl",
                        "start": 2051344,
                        "end": 2058800,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dcg/.created",
                        "start": 2058800,
                        "end": 2058800,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/clp/clpfd.pl",
                        "start": 2058800,
                        "end": 2318833,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/clp/clpb.pl",
                        "start": 2318833,
                        "end": 2384885,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/clp/.created",
                        "start": 2384885,
                        "end": 2384885,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/clp/bounds.pl",
                        "start": 2384885,
                        "end": 2424194,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/clp/clp_distinct.pl",
                        "start": 2424194,
                        "end": 2430791,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/clp/clp_events.pl",
                        "start": 2430791,
                        "end": 2433503,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/unicode/unicode_data.pl",
                        "start": 2433503,
                        "end": 2438952,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/unicode/INDEX.pl",
                        "start": 2438952,
                        "end": 2439126,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/unicode/blocks.pl",
                        "start": 2439126,
                        "end": 2449367,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/unicode/.created",
                        "start": 2449367,
                        "end": 2449367,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/xsb.pl",
                        "start": 2449367,
                        "end": 2470603,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/sicstus.pl",
                        "start": 2470603,
                        "end": 2483560,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/hprolog.pl",
                        "start": 2483560,
                        "end": 2491952,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/commons.pl",
                        "start": 2491952,
                        "end": 2494512,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/.created",
                        "start": 2494512,
                        "end": 2494512,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/ifprolog.pl",
                        "start": 2494512,
                        "end": 2530969,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/bim.pl",
                        "start": 2530969,
                        "end": 2535250,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/yap.pl",
                        "start": 2535250,
                        "end": 2542384,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/hprolog/.created",
                        "start": 2542384,
                        "end": 2542384,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/hprolog/format.pl",
                        "start": 2542384,
                        "end": 2544221,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/swi/.created",
                        "start": 2544221,
                        "end": 2544221,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/swi/syspred_options.pl",
                        "start": 2544221,
                        "end": 2551663,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/xsb/timed_call.pl",
                        "start": 2551663,
                        "end": 2557402,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/xsb/basics.pl",
                        "start": 2557402,
                        "end": 2564769,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/xsb/increval.pl",
                        "start": 2564769,
                        "end": 2571387,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/xsb/ordsets.pl",
                        "start": 2571387,
                        "end": 2573609,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/xsb/error_handler.pl",
                        "start": 2573609,
                        "end": 2577806,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/xsb/lists.pl",
                        "start": 2577806,
                        "end": 2579704,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/xsb/curr_sym.pl",
                        "start": 2579704,
                        "end": 2581967,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/xsb/standard.pl",
                        "start": 2581967,
                        "end": 2586772,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/xsb/source.pl",
                        "start": 2586772,
                        "end": 2596568,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/xsb/consult.pl",
                        "start": 2596568,
                        "end": 2598410,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/xsb/thread.pl",
                        "start": 2598410,
                        "end": 2600595,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/xsb/README.md",
                        "start": 2600595,
                        "end": 2601246,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/xsb/gpp.pl",
                        "start": 2601246,
                        "end": 2606310,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/xsb/.created",
                        "start": 2606310,
                        "end": 2606310,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/xsb/machine.pl",
                        "start": 2606310,
                        "end": 2613352,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/xsb/gensym.pl",
                        "start": 2613352,
                        "end": 2615394,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/xsb/storage.pl",
                        "start": 2615394,
                        "end": 2617964,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/xsb/string.pl",
                        "start": 2617964,
                        "end": 2620518,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/xsb/intern.pl",
                        "start": 2620518,
                        "end": 2622440,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/xsb/setof.pl",
                        "start": 2622440,
                        "end": 2624979,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/sicstus/timeout.pl",
                        "start": 2624979,
                        "end": 2628651,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/sicstus/lists.pl",
                        "start": 2628651,
                        "end": 2631599,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/sicstus/swipl-lfr.pl",
                        "start": 2631599,
                        "end": 2635599,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/sicstus/terms.pl",
                        "start": 2635599,
                        "end": 2637697,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/sicstus/.created",
                        "start": 2637697,
                        "end": 2637697,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/sicstus/arrays.pl",
                        "start": 2637697,
                        "end": 2641312,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/sicstus/system.pl",
                        "start": 2641312,
                        "end": 2647202,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/sicstus/README.TXT",
                        "start": 2647202,
                        "end": 2647233,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/sicstus/sockets.pl",
                        "start": 2647233,
                        "end": 2653435,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/sicstus/block.pl",
                        "start": 2653435,
                        "end": 2660523,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/eclipse/test_util_iso.pl",
                        "start": 2660523,
                        "end": 2670375,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/eclipse/.created",
                        "start": 2670375,
                        "end": 2670375,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/yap/.created",
                        "start": 2670375,
                        "end": 2670375,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/yap/README.TXT",
                        "start": 2670375,
                        "end": 2670726,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/iso/iso_predicates.pl",
                        "start": 2670726,
                        "end": 2680416,
                        "audio": 0
                    }, {
                        "filename": "/wasm-preload/library/dialect/iso/.created",
                        "start": 2680416,
                        "end": 2680416,
                        "audio": 0
                    }],
                    "remote_package_size": 2680416,
                    "package_uuid": "43b64698-c59f-48dd-942c-bf797be06cbe"
                })
            })();
            var moduleOverrides = {};
            var key;
            for (key in Module) {
                if (Module.hasOwnProperty(key)) {
                    moduleOverrides[key] = Module[key]
                }
            }
            var arguments_ = [];
            var thisProgram = "./this.program";
            var quit_ = function(status, toThrow) {
                throw toThrow
            };
            var ENVIRONMENT_IS_WEB = false;
            var ENVIRONMENT_IS_WORKER = false;
            var ENVIRONMENT_IS_NODE = false;
            var ENVIRONMENT_IS_SHELL = false;
            ENVIRONMENT_IS_WEB = typeof window === "object";
            ENVIRONMENT_IS_WORKER = typeof importScripts === "function";
            ENVIRONMENT_IS_NODE = typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node === "string";
            ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
            var scriptDirectory = "";

            function locateFile(path) {
                if (Module["locateFile"]) {
                    return Module["locateFile"](path, scriptDirectory)
                }
                return scriptDirectory + path
            }
            var read_, readAsync, readBinary, setWindowTitle;
            var nodeFS;
            var nodePath;
            if (ENVIRONMENT_IS_NODE) {
                if (ENVIRONMENT_IS_WORKER) {
                    scriptDirectory = require("path").dirname(scriptDirectory) + "/"
                } else {
                    scriptDirectory = __dirname + "/"
                }
                read_ = function shell_read(filename, binary) {
                    if (!nodeFS) nodeFS = require("fs");
                    if (!nodePath) nodePath = require("path");
                    filename = nodePath["normalize"](filename);
                    return nodeFS["readFileSync"](filename, binary ? null : "utf8")
                };
                readBinary = function readBinary(filename) {
                    var ret = read_(filename, true);
                    if (!ret.buffer) {
                        ret = new Uint8Array(ret)
                    }
                    assert(ret.buffer);
                    return ret
                };
                if (process["argv"].length > 1) {
                    thisProgram = process["argv"][1].replace(/\\/g, "/")
                }
                arguments_ = process["argv"].slice(2);
                process["on"]("uncaughtException", function(ex) {
                    if (!(ex instanceof ExitStatus)) {
                        throw ex
                    }
                });
                process["on"]("unhandledRejection", abort);
                quit_ = function(status) {
                    process["exit"](status)
                };
                Module["inspect"] = function() {
                    return "[Emscripten Module object]"
                }
            } else if (ENVIRONMENT_IS_SHELL) {
                if (typeof read != "undefined") {
                    read_ = function shell_read(f) {
                        return read(f)
                    }
                }
                readBinary = function readBinary(f) {
                    var data;
                    if (typeof readbuffer === "function") {
                        return new Uint8Array(readbuffer(f))
                    }
                    data = read(f, "binary");
                    assert(typeof data === "object");
                    return data
                };
                if (typeof scriptArgs != "undefined") {
                    arguments_ = scriptArgs
                } else if (typeof arguments != "undefined") {
                    arguments_ = arguments
                }
                if (typeof quit === "function") {
                    quit_ = function(status) {
                        quit(status)
                    }
                }
                if (typeof print !== "undefined") {
                    if (typeof console === "undefined") console = {};
                    console.log = print;
                    console.warn = console.error = typeof printErr !== "undefined" ? printErr : print
                }
            } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
                if (ENVIRONMENT_IS_WORKER) {
                    scriptDirectory = self.location.href
                } else if (document.currentScript) {
                    scriptDirectory = document.currentScript.src
                }
                if (_scriptDir) {
                    scriptDirectory = _scriptDir
                }
                if (scriptDirectory.indexOf("blob:") !== 0) {
                    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf("/") + 1)
                } else {
                    scriptDirectory = ""
                } {
                    read_ = function shell_read(url) {
                        var xhr = new XMLHttpRequest;
                        xhr.open("GET", url, false);
                        xhr.send(null);
                        return xhr.responseText
                    };
                    if (ENVIRONMENT_IS_WORKER) {
                        readBinary = function readBinary(url) {
                            var xhr = new XMLHttpRequest;
                            xhr.open("GET", url, false);
                            xhr.responseType = "arraybuffer";
                            xhr.send(null);
                            return new Uint8Array(xhr.response)
                        }
                    }
                    readAsync = function readAsync(url, onload, onerror) {
                        var xhr = new XMLHttpRequest;
                        xhr.open("GET", url, true);
                        xhr.responseType = "arraybuffer";
                        xhr.onload = function xhr_onload() {
                            if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                                onload(xhr.response);
                                return
                            }
                            onerror()
                        };
                        xhr.onerror = onerror;
                        xhr.send(null)
                    }
                }
                setWindowTitle = function(title) {
                    document.title = title
                }
            } else {}
            var out = Module["print"] || console.log.bind(console);
            var err = Module["printErr"] || console.warn.bind(console);
            for (key in moduleOverrides) {
                if (moduleOverrides.hasOwnProperty(key)) {
                    Module[key] = moduleOverrides[key]
                }
            }
            moduleOverrides = null;
            if (Module["arguments"]) arguments_ = Module["arguments"];
            if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
            if (Module["quit"]) quit_ = Module["quit"];
            var STACK_ALIGN = 16;

            function alignMemory(size, factor) {
                if (!factor) factor = STACK_ALIGN;
                return Math.ceil(size / factor) * factor
            }

            function warnOnce(text) {
                if (!warnOnce.shown) warnOnce.shown = {};
                if (!warnOnce.shown[text]) {
                    warnOnce.shown[text] = 1;
                    err(text)
                }
            }

            function convertJsFunctionToWasm(func, sig) {
                if (typeof WebAssembly.Function === "function") {
                    var typeNames = {
                        "i": "i32",
                        "j": "i64",
                        "f": "f32",
                        "d": "f64"
                    };
                    var type = {
                        parameters: [],
                        results: sig[0] == "v" ? [] : [typeNames[sig[0]]]
                    };
                    for (var i = 1; i < sig.length; ++i) {
                        type.parameters.push(typeNames[sig[i]])
                    }
                    return new WebAssembly.Function(type, func)
                }
                var typeSection = [1, 0, 1, 96];
                var sigRet = sig.slice(0, 1);
                var sigParam = sig.slice(1);
                var typeCodes = {
                    "i": 127,
                    "j": 126,
                    "f": 125,
                    "d": 124
                };
                typeSection.push(sigParam.length);
                for (var i = 0; i < sigParam.length; ++i) {
                    typeSection.push(typeCodes[sigParam[i]])
                }
                if (sigRet == "v") {
                    typeSection.push(0)
                } else {
                    typeSection = typeSection.concat([1, typeCodes[sigRet]])
                }
                typeSection[1] = typeSection.length - 2;
                var bytes = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0].concat(typeSection, [2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0]));
                var module = new WebAssembly.Module(bytes);
                var instance = new WebAssembly.Instance(module, {
                    "e": {
                        "f": func
                    }
                });
                var wrappedFunc = instance.exports["f"];
                return wrappedFunc
            }
            var freeTableIndexes = [];
            var functionsInTableMap;

            function addFunctionWasm(func, sig) {
                var table = wasmTable;
                if (!functionsInTableMap) {
                    functionsInTableMap = new WeakMap;
                    for (var i = 0; i < table.length; i++) {
                        var item = table.get(i);
                        if (item) {
                            functionsInTableMap.set(item, i)
                        }
                    }
                }
                if (functionsInTableMap.has(func)) {
                    return functionsInTableMap.get(func)
                }
                var ret;
                if (freeTableIndexes.length) {
                    ret = freeTableIndexes.pop()
                } else {
                    ret = table.length;
                    try {
                        table.grow(1)
                    } catch (err) {
                        if (!(err instanceof RangeError)) {
                            throw err
                        }
                        throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH."
                    }
                }
                try {
                    table.set(ret, func)
                } catch (err) {
                    if (!(err instanceof TypeError)) {
                        throw err
                    }
                    var wrapped = convertJsFunctionToWasm(func, sig);
                    table.set(ret, wrapped)
                }
                functionsInTableMap.set(func, ret);
                return ret
            }

            function removeFunctionWasm(index) {
                functionsInTableMap.delete(wasmTable.get(index));
                freeTableIndexes.push(index)
            }
            var tempRet0 = 0;
            var setTempRet0 = function(value) {
                tempRet0 = value
            };
            var getTempRet0 = function() {
                return tempRet0
            };
            var wasmBinary;
            if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
            var noExitRuntime;
            if (Module["noExitRuntime"]) noExitRuntime = Module["noExitRuntime"];
            if (typeof WebAssembly !== "object") {
                abort("no native wasm support detected")
            }

            function setValue(ptr, value, type, noSafe) {
                type = type || "i8";
                if (type.charAt(type.length - 1) === "*") type = "i32";
                switch (type) {
                    case "i1":
                        HEAP8[ptr >> 0] = value;
                        break;
                    case "i8":
                        HEAP8[ptr >> 0] = value;
                        break;
                    case "i16":
                        HEAP16[ptr >> 1] = value;
                        break;
                    case "i32":
                        HEAP32[ptr >> 2] = value;
                        break;
                    case "i64":
                        tempI64 = [value >>> 0, (tempDouble = value, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[ptr >> 2] = tempI64[0], HEAP32[ptr + 4 >> 2] = tempI64[1];
                        break;
                    case "float":
                        HEAPF32[ptr >> 2] = value;
                        break;
                    case "double":
                        HEAPF64[ptr >> 3] = value;
                        break;
                    default:
                        abort("invalid type for setValue: " + type)
                }
            }

            function getValue(ptr, type, noSafe) {
                type = type || "i8";
                if (type.charAt(type.length - 1) === "*") type = "i32";
                switch (type) {
                    case "i1":
                        return HEAP8[ptr >> 0];
                    case "i8":
                        return HEAP8[ptr >> 0];
                    case "i16":
                        return HEAP16[ptr >> 1];
                    case "i32":
                        return HEAP32[ptr >> 2];
                    case "i64":
                        return HEAP32[ptr >> 2];
                    case "float":
                        return HEAPF32[ptr >> 2];
                    case "double":
                        return HEAPF64[ptr >> 3];
                    default:
                        abort("invalid type for getValue: " + type)
                }
                return null
            }
            var wasmMemory;
            var wasmTable;
            var ABORT = false;
            var EXITSTATUS = 0;

            function assert(condition, text) {
                if (!condition) {
                    abort("Assertion failed: " + text)
                }
            }

            function getCFunc(ident) {
                var func = Module["_" + ident];
                assert(func, "Cannot call unknown function " + ident + ", make sure it is exported");
                return func
            }

            function ccall(ident, returnType, argTypes, args, opts) {
                var toC = {
                    "string": function(str) {
                        var ret = 0;
                        if (str !== null && str !== undefined && str !== 0) {
                            var len = (str.length << 2) + 1;
                            ret = stackAlloc(len);
                            stringToUTF8(str, ret, len)
                        }
                        return ret
                    },
                    "array": function(arr) {
                        var ret = stackAlloc(arr.length);
                        writeArrayToMemory(arr, ret);
                        return ret
                    }
                };

                function convertReturnValue(ret) {
                    if (returnType === "string") return UTF8ToString(ret);
                    if (returnType === "boolean") return Boolean(ret);
                    return ret
                }
                var func = getCFunc(ident);
                var cArgs = [];
                var stack = 0;
                if (args) {
                    for (var i = 0; i < args.length; i++) {
                        var converter = toC[argTypes[i]];
                        if (converter) {
                            if (stack === 0) stack = stackSave();
                            cArgs[i] = converter(args[i])
                        } else {
                            cArgs[i] = args[i]
                        }
                    }
                }
                var ret = func.apply(null, cArgs);
                ret = convertReturnValue(ret);
                if (stack !== 0) stackRestore(stack);
                return ret
            }

            function cwrap(ident, returnType, argTypes, opts) {
                argTypes = argTypes || [];
                var numericArgs = argTypes.every(function(type) {
                    return type === "number"
                });
                var numericRet = returnType !== "string";
                if (numericRet && numericArgs && !opts) {
                    return getCFunc(ident)
                }
                return function() {
                    return ccall(ident, returnType, argTypes, arguments, opts)
                }
            }
            var ALLOC_NORMAL = 0;
            var ALLOC_STACK = 1;

            function allocate(slab, allocator) {
                var ret;
                if (allocator == ALLOC_STACK) {
                    ret = stackAlloc(slab.length)
                } else {
                    ret = _malloc(slab.length)
                }
                if (slab.subarray || slab.slice) {
                    HEAPU8.set(slab, ret)
                } else {
                    HEAPU8.set(new Uint8Array(slab), ret)
                }
                return ret
            }
            var UTF8Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined;

            function UTF8ArrayToString(heap, idx, maxBytesToRead) {
                var endIdx = idx + maxBytesToRead;
                var endPtr = idx;
                while (heap[endPtr] && !(endPtr >= endIdx)) ++endPtr;
                if (endPtr - idx > 16 && heap.subarray && UTF8Decoder) {
                    return UTF8Decoder.decode(heap.subarray(idx, endPtr))
                } else {
                    var str = "";
                    while (idx < endPtr) {
                        var u0 = heap[idx++];
                        if (!(u0 & 128)) {
                            str += String.fromCharCode(u0);
                            continue
                        }
                        var u1 = heap[idx++] & 63;
                        if ((u0 & 224) == 192) {
                            str += String.fromCharCode((u0 & 31) << 6 | u1);
                            continue
                        }
                        var u2 = heap[idx++] & 63;
                        if ((u0 & 240) == 224) {
                            u0 = (u0 & 15) << 12 | u1 << 6 | u2
                        } else {
                            u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heap[idx++] & 63
                        }
                        if (u0 < 65536) {
                            str += String.fromCharCode(u0)
                        } else {
                            var ch = u0 - 65536;
                            str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
                        }
                    }
                }
                return str
            }

            function UTF8ToString(ptr, maxBytesToRead) {
                return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : ""
            }

            function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
                if (!(maxBytesToWrite > 0)) return 0;
                var startIdx = outIdx;
                var endIdx = outIdx + maxBytesToWrite - 1;
                for (var i = 0; i < str.length; ++i) {
                    var u = str.charCodeAt(i);
                    if (u >= 55296 && u <= 57343) {
                        var u1 = str.charCodeAt(++i);
                        u = 65536 + ((u & 1023) << 10) | u1 & 1023
                    }
                    if (u <= 127) {
                        if (outIdx >= endIdx) break;
                        heap[outIdx++] = u
                    } else if (u <= 2047) {
                        if (outIdx + 1 >= endIdx) break;
                        heap[outIdx++] = 192 | u >> 6;
                        heap[outIdx++] = 128 | u & 63
                    } else if (u <= 65535) {
                        if (outIdx + 2 >= endIdx) break;
                        heap[outIdx++] = 224 | u >> 12;
                        heap[outIdx++] = 128 | u >> 6 & 63;
                        heap[outIdx++] = 128 | u & 63
                    } else {
                        if (outIdx + 3 >= endIdx) break;
                        heap[outIdx++] = 240 | u >> 18;
                        heap[outIdx++] = 128 | u >> 12 & 63;
                        heap[outIdx++] = 128 | u >> 6 & 63;
                        heap[outIdx++] = 128 | u & 63
                    }
                }
                heap[outIdx] = 0;
                return outIdx - startIdx
            }

            function stringToUTF8(str, outPtr, maxBytesToWrite) {
                return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite)
            }

            function lengthBytesUTF8(str) {
                var len = 0;
                for (var i = 0; i < str.length; ++i) {
                    var u = str.charCodeAt(i);
                    if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
                    if (u <= 127) ++len;
                    else if (u <= 2047) len += 2;
                    else if (u <= 65535) len += 3;
                    else len += 4
                }
                return len
            }
            var UTF16Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : undefined;

            function allocateUTF8(str) {
                var size = lengthBytesUTF8(str) + 1;
                var ret = _malloc(size);
                if (ret) stringToUTF8Array(str, HEAP8, ret, size);
                return ret
            }

            function writeArrayToMemory(array, buffer) {
                HEAP8.set(array, buffer)
            }

            function writeAsciiToMemory(str, buffer, dontAddNull) {
                for (var i = 0; i < str.length; ++i) {
                    HEAP8[buffer++ >> 0] = str.charCodeAt(i)
                }
                if (!dontAddNull) HEAP8[buffer >> 0] = 0
            }
            var WASM_PAGE_SIZE = 65536;
            var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

            function updateGlobalBufferAndViews(buf) {
                buffer = buf;
                Module["HEAP8"] = HEAP8 = new Int8Array(buf);
                Module["HEAP16"] = HEAP16 = new Int16Array(buf);
                Module["HEAP32"] = HEAP32 = new Int32Array(buf);
                Module["HEAPU8"] = HEAPU8 = new Uint8Array(buf);
                Module["HEAPU16"] = HEAPU16 = new Uint16Array(buf);
                Module["HEAPU32"] = HEAPU32 = new Uint32Array(buf);
                Module["HEAPF32"] = HEAPF32 = new Float32Array(buf);
                Module["HEAPF64"] = HEAPF64 = new Float64Array(buf)
            }
            var STACK_BASE = 5406848;
            var INITIAL_INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 16777216;
            if (Module["wasmMemory"]) {
                wasmMemory = Module["wasmMemory"]
            } else {
                wasmMemory = new WebAssembly.Memory({
                    "initial": INITIAL_INITIAL_MEMORY / WASM_PAGE_SIZE,
                    "maximum": INITIAL_INITIAL_MEMORY / WASM_PAGE_SIZE
                })
            }
            if (wasmMemory) {
                buffer = wasmMemory.buffer
            }
            INITIAL_INITIAL_MEMORY = buffer.byteLength;
            updateGlobalBufferAndViews(buffer);
            var __ATPRERUN__ = [];
            var __ATINIT__ = [];
            var __ATMAIN__ = [];
            var __ATEXIT__ = [];
            var __ATPOSTRUN__ = [];
            var runtimeInitialized = false;
            var runtimeExited = false;

            function preRun() {
                if (Module["preRun"]) {
                    if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
                    while (Module["preRun"].length) {
                        addOnPreRun(Module["preRun"].shift())
                    }
                }
                callRuntimeCallbacks(__ATPRERUN__)
            }

            function initRuntime() {
                runtimeInitialized = true;
                if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
                TTY.init();
                callRuntimeCallbacks(__ATINIT__)
            }

            function preMain() {
                FS.ignorePermissions = false;
                callRuntimeCallbacks(__ATMAIN__)
            }

            function exitRuntime() {
                callRuntimeCallbacks(__ATEXIT__);
                FS.quit();
                TTY.shutdown();
                runtimeExited = true
            }

            function postRun() {
                if (Module["postRun"]) {
                    if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
                    while (Module["postRun"].length) {
                        addOnPostRun(Module["postRun"].shift())
                    }
                }
                callRuntimeCallbacks(__ATPOSTRUN__)
            }

            function addOnPreRun(cb) {
                __ATPRERUN__.unshift(cb)
            }

            function addOnPostRun(cb) {
                __ATPOSTRUN__.unshift(cb)
            }
            var Math_abs = Math.abs;
            var Math_ceil = Math.ceil;
            var Math_floor = Math.floor;
            var Math_min = Math.min;
            var runDependencies = 0;
            var runDependencyWatcher = null;
            var dependenciesFulfilled = null;

            function getUniqueRunDependency(id) {
                return id
            }

            function addRunDependency(id) {
                runDependencies++;
                if (Module["monitorRunDependencies"]) {
                    Module["monitorRunDependencies"](runDependencies)
                }
            }

            function removeRunDependency(id) {
                runDependencies--;
                if (Module["monitorRunDependencies"]) {
                    Module["monitorRunDependencies"](runDependencies)
                }
                if (runDependencies == 0) {
                    if (runDependencyWatcher !== null) {
                        clearInterval(runDependencyWatcher);
                        runDependencyWatcher = null
                    }
                    if (dependenciesFulfilled) {
                        var callback = dependenciesFulfilled;
                        dependenciesFulfilled = null;
                        callback()
                    }
                }
            }
            Module["preloadedImages"] = {};
            Module["preloadedAudios"] = {};

            function abort(what) {
                if (Module["onAbort"]) {
                    Module["onAbort"](what)
                }
                what += "";
                err(what);
                ABORT = true;
                EXITSTATUS = 1;
                what = "abort(" + what + "). Build with -s ASSERTIONS=1 for more info.";
                var e = new WebAssembly.RuntimeError(what);
                readyPromiseReject(e);
                throw e
            }

            function hasPrefix(str, prefix) {
                return String.prototype.startsWith ? str.startsWith(prefix) : str.indexOf(prefix) === 0
            }
            var dataURIPrefix = "data:application/octet-stream;base64,";

            function isDataURI(filename) {
                return hasPrefix(filename, dataURIPrefix)
            }
            var fileURIPrefix = "file://";

            function isFileURI(filename) {
                return hasPrefix(filename, fileURIPrefix)
            }
            var wasmBinaryFile = "swipl-web.wasm";
            if (!isDataURI(wasmBinaryFile)) {
                wasmBinaryFile = locateFile(wasmBinaryFile)
            }

            function getBinary() {
                try {
                    if (wasmBinary) {
                        return new Uint8Array(wasmBinary)
                    }
                    if (readBinary) {
                        return readBinary(wasmBinaryFile)
                    } else {
                        throw "both async and sync fetching of the wasm failed"
                    }
                } catch (err) {
                    abort(err)
                }
            }

            function getBinaryPromise() {
                if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && typeof fetch === "function" && !isFileURI(wasmBinaryFile)) {
                    return fetch(wasmBinaryFile, {
                        credentials: "same-origin"
                    }).then(function(response) {
                        if (!response["ok"]) {
                            throw "failed to load wasm binary file at '" + wasmBinaryFile + "'"
                        }
                        return response["arrayBuffer"]()
                    }).catch(function() {
                        return getBinary()
                    })
                }
                return Promise.resolve().then(getBinary)
            }

            function createWasm() {
                var info = {
                    "env": asmLibraryArg,
                    "wasi_snapshot_preview1": asmLibraryArg
                };

                function receiveInstance(instance, module) {
                    var exports = instance.exports;
                    Module["asm"] = exports;
                    wasmTable = Module["asm"]["__indirect_function_table"];
                    removeRunDependency("wasm-instantiate")
                }
                addRunDependency("wasm-instantiate");

                function receiveInstantiatedSource(output) {
                    receiveInstance(output["instance"])
                }

                function instantiateArrayBuffer(receiver) {
                    return getBinaryPromise().then(function(binary) {
                        return WebAssembly.instantiate(binary, info)
                    }).then(receiver, function(reason) {
                        err("failed to asynchronously prepare wasm: " + reason);
                        abort(reason)
                    })
                }

                function instantiateAsync() {
                    if (!wasmBinary && typeof WebAssembly.instantiateStreaming === "function" && !isDataURI(wasmBinaryFile) && !isFileURI(wasmBinaryFile) && typeof fetch === "function") {
                        fetch(wasmBinaryFile, {
                            credentials: "same-origin"
                        }).then(function(response) {
                            var result = WebAssembly.instantiateStreaming(response, info);
                            return result.then(receiveInstantiatedSource, function(reason) {
                                err("wasm streaming compile failed: " + reason);
                                err("falling back to ArrayBuffer instantiation");
                                return instantiateArrayBuffer(receiveInstantiatedSource)
                            })
                        })
                    } else {
                        return instantiateArrayBuffer(receiveInstantiatedSource)
                    }
                }
                if (Module["instantiateWasm"]) {
                    try {
                        var exports = Module["instantiateWasm"](info, receiveInstance);
                        return exports
                    } catch (e) {
                        err("Module.instantiateWasm callback failed with error: " + e);
                        return false
                    }
                }
                instantiateAsync();
                return {}
            }
            var tempDouble;
            var tempI64;

            function callRuntimeCallbacks(callbacks) {
                while (callbacks.length > 0) {
                    var callback = callbacks.shift();
                    if (typeof callback == "function") {
                        callback(Module);
                        continue
                    }
                    var func = callback.func;
                    if (typeof func === "number") {
                        if (callback.arg === undefined) {
                            wasmTable.get(func)()
                        } else {
                            wasmTable.get(func)(callback.arg)
                        }
                    } else {
                        func(callback.arg === undefined ? null : callback.arg)
                    }
                }
            }

            function demangle(func) {
                return func
            }

            function demangleAll(text) {
                var regex = /\b_Z[\w\d_]+/g;
                return text.replace(regex, function(x) {
                    var y = demangle(x);
                    return x === y ? x : y + " [" + x + "]"
                })
            }

            function dynCallLegacy(sig, ptr, args) {
                if (args && args.length) {
                    return Module["dynCall_" + sig].apply(null, [ptr].concat(args))
                }
                return Module["dynCall_" + sig].call(null, ptr)
            }

            function jsStackTrace() {
                var error = new Error;
                if (!error.stack) {
                    try {
                        throw new Error
                    } catch (e) {
                        error = e
                    }
                    if (!error.stack) {
                        return "(no stack trace available)"
                    }
                }
                return error.stack.toString()
            }

            function stackTrace() {
                var js = jsStackTrace();
                if (Module["extraStackTrace"]) js += "\n" + Module["extraStackTrace"]();
                return demangleAll(js)
            }
            var PATH = {
                splitPath: function(filename) {
                    var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
                    return splitPathRe.exec(filename).slice(1)
                },
                normalizeArray: function(parts, allowAboveRoot) {
                    var up = 0;
                    for (var i = parts.length - 1; i >= 0; i--) {
                        var last = parts[i];
                        if (last === ".") {
                            parts.splice(i, 1)
                        } else if (last === "..") {
                            parts.splice(i, 1);
                            up++
                        } else if (up) {
                            parts.splice(i, 1);
                            up--
                        }
                    }
                    if (allowAboveRoot) {
                        for (; up; up--) {
                            parts.unshift("..")
                        }
                    }
                    return parts
                },
                normalize: function(path) {
                    var isAbsolute = path.charAt(0) === "/",
                        trailingSlash = path.substr(-1) === "/";
                    path = PATH.normalizeArray(path.split("/").filter(function(p) {
                        return !!p
                    }), !isAbsolute).join("/");
                    if (!path && !isAbsolute) {
                        path = "."
                    }
                    if (path && trailingSlash) {
                        path += "/"
                    }
                    return (isAbsolute ? "/" : "") + path
                },
                dirname: function(path) {
                    var result = PATH.splitPath(path),
                        root = result[0],
                        dir = result[1];
                    if (!root && !dir) {
                        return "."
                    }
                    if (dir) {
                        dir = dir.substr(0, dir.length - 1)
                    }
                    return root + dir
                },
                basename: function(path) {
                    if (path === "/") return "/";
                    path = PATH.normalize(path);
                    path = path.replace(/\/$/, "");
                    var lastSlash = path.lastIndexOf("/");
                    if (lastSlash === -1) return path;
                    return path.substr(lastSlash + 1)
                },
                extname: function(path) {
                    return PATH.splitPath(path)[3]
                },
                join: function() {
                    var paths = Array.prototype.slice.call(arguments, 0);
                    return PATH.normalize(paths.join("/"))
                },
                join2: function(l, r) {
                    return PATH.normalize(l + "/" + r)
                }
            };

            function setErrNo(value) {
                HEAP32[___errno_location() >> 2] = value;
                return value
            }

            function getRandomDevice() {
                if (typeof crypto === "object" && typeof crypto["getRandomValues"] === "function") {
                    var randomBuffer = new Uint8Array(1);
                    return function() {
                        crypto.getRandomValues(randomBuffer);
                        return randomBuffer[0]
                    }
                } else if (ENVIRONMENT_IS_NODE) {
                    try {
                        var crypto_module = require("crypto");
                        return function() {
                            return crypto_module["randomBytes"](1)[0]
                        }
                    } catch (e) {}
                }
                return function() {
                    abort("randomDevice")
                }
            }
            var PATH_FS = {
                resolve: function() {
                    var resolvedPath = "",
                        resolvedAbsolute = false;
                    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
                        var path = i >= 0 ? arguments[i] : FS.cwd();
                        if (typeof path !== "string") {
                            throw new TypeError("Arguments to path.resolve must be strings")
                        } else if (!path) {
                            return ""
                        }
                        resolvedPath = path + "/" + resolvedPath;
                        resolvedAbsolute = path.charAt(0) === "/"
                    }
                    resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(function(p) {
                        return !!p
                    }), !resolvedAbsolute).join("/");
                    return (resolvedAbsolute ? "/" : "") + resolvedPath || "."
                },
                relative: function(from, to) {
                    from = PATH_FS.resolve(from).substr(1);
                    to = PATH_FS.resolve(to).substr(1);

                    function trim(arr) {
                        var start = 0;
                        for (; start < arr.length; start++) {
                            if (arr[start] !== "") break
                        }
                        var end = arr.length - 1;
                        for (; end >= 0; end--) {
                            if (arr[end] !== "") break
                        }
                        if (start > end) return [];
                        return arr.slice(start, end - start + 1)
                    }
                    var fromParts = trim(from.split("/"));
                    var toParts = trim(to.split("/"));
                    var length = Math.min(fromParts.length, toParts.length);
                    var samePartsLength = length;
                    for (var i = 0; i < length; i++) {
                        if (fromParts[i] !== toParts[i]) {
                            samePartsLength = i;
                            break
                        }
                    }
                    var outputParts = [];
                    for (var i = samePartsLength; i < fromParts.length; i++) {
                        outputParts.push("..")
                    }
                    outputParts = outputParts.concat(toParts.slice(samePartsLength));
                    return outputParts.join("/")
                }
            };
            var TTY = {
                ttys: [],
                init: function() {},
                shutdown: function() {},
                register: function(dev, ops) {
                    TTY.ttys[dev] = {
                        input: [],
                        output: [],
                        ops: ops
                    };
                    FS.registerDevice(dev, TTY.stream_ops)
                },
                stream_ops: {
                    open: function(stream) {
                        var tty = TTY.ttys[stream.node.rdev];
                        if (!tty) {
                            throw new FS.ErrnoError(43)
                        }
                        stream.tty = tty;
                        stream.seekable = false
                    },
                    close: function(stream) {
                        stream.tty.ops.flush(stream.tty)
                    },
                    flush: function(stream) {
                        stream.tty.ops.flush(stream.tty)
                    },
                    read: function(stream, buffer, offset, length, pos) {
                        if (!stream.tty || !stream.tty.ops.get_char) {
                            throw new FS.ErrnoError(60)
                        }
                        var bytesRead = 0;
                        for (var i = 0; i < length; i++) {
                            var result;
                            try {
                                result = stream.tty.ops.get_char(stream.tty)
                            } catch (e) {
                                throw new FS.ErrnoError(29)
                            }
                            if (result === undefined && bytesRead === 0) {
                                throw new FS.ErrnoError(6)
                            }
                            if (result === null || result === undefined) break;
                            bytesRead++;
                            buffer[offset + i] = result
                        }
                        if (bytesRead) {
                            stream.node.timestamp = Date.now()
                        }
                        return bytesRead
                    },
                    write: function(stream, buffer, offset, length, pos) {
                        if (!stream.tty || !stream.tty.ops.put_char) {
                            throw new FS.ErrnoError(60)
                        }
                        try {
                            for (var i = 0; i < length; i++) {
                                stream.tty.ops.put_char(stream.tty, buffer[offset + i])
                            }
                        } catch (e) {
                            throw new FS.ErrnoError(29)
                        }
                        if (length) {
                            stream.node.timestamp = Date.now()
                        }
                        return i
                    }
                },
                default_tty_ops: {
                    get_char: function(tty) {
                        if (!tty.input.length) {
                            var result = null;
                            if (ENVIRONMENT_IS_NODE) {
                                var BUFSIZE = 256;
                                var buf = Buffer.alloc ? Buffer.alloc(BUFSIZE) : new Buffer(BUFSIZE);
                                var bytesRead = 0;
                                try {
                                    bytesRead = nodeFS.readSync(process.stdin.fd, buf, 0, BUFSIZE, null)
                                } catch (e) {
                                    if (e.toString().indexOf("EOF") != -1) bytesRead = 0;
                                    else throw e
                                }
                                if (bytesRead > 0) {
                                    result = buf.slice(0, bytesRead).toString("utf-8")
                                } else {
                                    result = null
                                }
                            } else if (typeof window != "undefined" && typeof window.prompt == "function") {
                                result = window.prompt("Input: ");
                                if (result !== null) {
                                    result += "\n"
                                }
                            } else if (typeof readline == "function") {
                                result = readline();
                                if (result !== null) {
                                    result += "\n"
                                }
                            }
                            if (!result) {
                                return null
                            }
                            tty.input = intArrayFromString(result, true)
                        }
                        return tty.input.shift()
                    },
                    put_char: function(tty, val) {
                        if (val === null || val === 10) {
                            out(UTF8ArrayToString(tty.output, 0));
                            tty.output = []
                        } else {
                            if (val != 0) tty.output.push(val)
                        }
                    },
                    flush: function(tty) {
                        if (tty.output && tty.output.length > 0) {
                            out(UTF8ArrayToString(tty.output, 0));
                            tty.output = []
                        }
                    }
                },
                default_tty1_ops: {
                    put_char: function(tty, val) {
                        if (val === null || val === 10) {
                            err(UTF8ArrayToString(tty.output, 0));
                            tty.output = []
                        } else {
                            if (val != 0) tty.output.push(val)
                        }
                    },
                    flush: function(tty) {
                        if (tty.output && tty.output.length > 0) {
                            err(UTF8ArrayToString(tty.output, 0));
                            tty.output = []
                        }
                    }
                }
            };

            function mmapAlloc(size) {
                var alignedSize = alignMemory(size, 16384);
                var ptr = _malloc(alignedSize);
                while (size < alignedSize) HEAP8[ptr + size++] = 0;
                return ptr
            }
            var MEMFS = {
                ops_table: null,
                mount: function(mount) {
                    return MEMFS.createNode(null, "/", 16384 | 511, 0)
                },
                createNode: function(parent, name, mode, dev) {
                    if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
                        throw new FS.ErrnoError(63)
                    }
                    if (!MEMFS.ops_table) {
                        MEMFS.ops_table = {
                            dir: {
                                node: {
                                    getattr: MEMFS.node_ops.getattr,
                                    setattr: MEMFS.node_ops.setattr,
                                    lookup: MEMFS.node_ops.lookup,
                                    mknod: MEMFS.node_ops.mknod,
                                    rename: MEMFS.node_ops.rename,
                                    unlink: MEMFS.node_ops.unlink,
                                    rmdir: MEMFS.node_ops.rmdir,
                                    readdir: MEMFS.node_ops.readdir,
                                    symlink: MEMFS.node_ops.symlink
                                },
                                stream: {
                                    llseek: MEMFS.stream_ops.llseek
                                }
                            },
                            file: {
                                node: {
                                    getattr: MEMFS.node_ops.getattr,
                                    setattr: MEMFS.node_ops.setattr
                                },
                                stream: {
                                    llseek: MEMFS.stream_ops.llseek,
                                    read: MEMFS.stream_ops.read,
                                    write: MEMFS.stream_ops.write,
                                    allocate: MEMFS.stream_ops.allocate,
                                    mmap: MEMFS.stream_ops.mmap,
                                    msync: MEMFS.stream_ops.msync
                                }
                            },
                            link: {
                                node: {
                                    getattr: MEMFS.node_ops.getattr,
                                    setattr: MEMFS.node_ops.setattr,
                                    readlink: MEMFS.node_ops.readlink
                                },
                                stream: {}
                            },
                            chrdev: {
                                node: {
                                    getattr: MEMFS.node_ops.getattr,
                                    setattr: MEMFS.node_ops.setattr
                                },
                                stream: FS.chrdev_stream_ops
                            }
                        }
                    }
                    var node = FS.createNode(parent, name, mode, dev);
                    if (FS.isDir(node.mode)) {
                        node.node_ops = MEMFS.ops_table.dir.node;
                        node.stream_ops = MEMFS.ops_table.dir.stream;
                        node.contents = {}
                    } else if (FS.isFile(node.mode)) {
                        node.node_ops = MEMFS.ops_table.file.node;
                        node.stream_ops = MEMFS.ops_table.file.stream;
                        node.usedBytes = 0;
                        node.contents = null
                    } else if (FS.isLink(node.mode)) {
                        node.node_ops = MEMFS.ops_table.link.node;
                        node.stream_ops = MEMFS.ops_table.link.stream
                    } else if (FS.isChrdev(node.mode)) {
                        node.node_ops = MEMFS.ops_table.chrdev.node;
                        node.stream_ops = MEMFS.ops_table.chrdev.stream
                    }
                    node.timestamp = Date.now();
                    if (parent) {
                        parent.contents[name] = node
                    }
                    return node
                },
                getFileDataAsRegularArray: function(node) {
                    if (node.contents && node.contents.subarray) {
                        var arr = [];
                        for (var i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i]);
                        return arr
                    }
                    return node.contents
                },
                getFileDataAsTypedArray: function(node) {
                    if (!node.contents) return new Uint8Array(0);
                    if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
                    return new Uint8Array(node.contents)
                },
                expandFileStorage: function(node, newCapacity) {
                    var prevCapacity = node.contents ? node.contents.length : 0;
                    if (prevCapacity >= newCapacity) return;
                    var CAPACITY_DOUBLING_MAX = 1024 * 1024;
                    newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) >>> 0);
                    if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
                    var oldContents = node.contents;
                    node.contents = new Uint8Array(newCapacity);
                    if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
                    return
                },
                resizeFileStorage: function(node, newSize) {
                    if (node.usedBytes == newSize) return;
                    if (newSize == 0) {
                        node.contents = null;
                        node.usedBytes = 0;
                        return
                    }
                    if (!node.contents || node.contents.subarray) {
                        var oldContents = node.contents;
                        node.contents = new Uint8Array(newSize);
                        if (oldContents) {
                            node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)))
                        }
                        node.usedBytes = newSize;
                        return
                    }
                    if (!node.contents) node.contents = [];
                    if (node.contents.length > newSize) node.contents.length = newSize;
                    else
                        while (node.contents.length < newSize) node.contents.push(0);
                    node.usedBytes = newSize
                },
                node_ops: {
                    getattr: function(node) {
                        var attr = {};
                        attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
                        attr.ino = node.id;
                        attr.mode = node.mode;
                        attr.nlink = 1;
                        attr.uid = 0;
                        attr.gid = 0;
                        attr.rdev = node.rdev;
                        if (FS.isDir(node.mode)) {
                            attr.size = 4096
                        } else if (FS.isFile(node.mode)) {
                            attr.size = node.usedBytes
                        } else if (FS.isLink(node.mode)) {
                            attr.size = node.link.length
                        } else {
                            attr.size = 0
                        }
                        attr.atime = new Date(node.timestamp);
                        attr.mtime = new Date(node.timestamp);
                        attr.ctime = new Date(node.timestamp);
                        attr.blksize = 4096;
                        attr.blocks = Math.ceil(attr.size / attr.blksize);
                        return attr
                    },
                    setattr: function(node, attr) {
                        if (attr.mode !== undefined) {
                            node.mode = attr.mode
                        }
                        if (attr.timestamp !== undefined) {
                            node.timestamp = attr.timestamp
                        }
                        if (attr.size !== undefined) {
                            MEMFS.resizeFileStorage(node, attr.size)
                        }
                    },
                    lookup: function(parent, name) {
                        throw FS.genericErrors[44]
                    },
                    mknod: function(parent, name, mode, dev) {
                        return MEMFS.createNode(parent, name, mode, dev)
                    },
                    rename: function(old_node, new_dir, new_name) {
                        if (FS.isDir(old_node.mode)) {
                            var new_node;
                            try {
                                new_node = FS.lookupNode(new_dir, new_name)
                            } catch (e) {}
                            if (new_node) {
                                for (var i in new_node.contents) {
                                    throw new FS.ErrnoError(55)
                                }
                            }
                        }
                        delete old_node.parent.contents[old_node.name];
                        old_node.name = new_name;
                        new_dir.contents[new_name] = old_node;
                        old_node.parent = new_dir
                    },
                    unlink: function(parent, name) {
                        delete parent.contents[name]
                    },
                    rmdir: function(parent, name) {
                        var node = FS.lookupNode(parent, name);
                        for (var i in node.contents) {
                            throw new FS.ErrnoError(55)
                        }
                        delete parent.contents[name]
                    },
                    readdir: function(node) {
                        var entries = [".", ".."];
                        for (var key in node.contents) {
                            if (!node.contents.hasOwnProperty(key)) {
                                continue
                            }
                            entries.push(key)
                        }
                        return entries
                    },
                    symlink: function(parent, newname, oldpath) {
                        var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
                        node.link = oldpath;
                        return node
                    },
                    readlink: function(node) {
                        if (!FS.isLink(node.mode)) {
                            throw new FS.ErrnoError(28)
                        }
                        return node.link
                    }
                },
                stream_ops: {
                    read: function(stream, buffer, offset, length, position) {
                        var contents = stream.node.contents;
                        if (position >= stream.node.usedBytes) return 0;
                        var size = Math.min(stream.node.usedBytes - position, length);
                        if (size > 8 && contents.subarray) {
                            buffer.set(contents.subarray(position, position + size), offset)
                        } else {
                            for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i]
                        }
                        return size
                    },
                    write: function(stream, buffer, offset, length, position, canOwn) {
                        if (!length) return 0;
                        var node = stream.node;
                        node.timestamp = Date.now();
                        if (buffer.subarray && (!node.contents || node.contents.subarray)) {
                            if (canOwn) {
                                node.contents = buffer.subarray(offset, offset + length);
                                node.usedBytes = length;
                                return length
                            } else if (node.usedBytes === 0 && position === 0) {
                                node.contents = buffer.slice(offset, offset + length);
                                node.usedBytes = length;
                                return length
                            } else if (position + length <= node.usedBytes) {
                                node.contents.set(buffer.subarray(offset, offset + length), position);
                                return length
                            }
                        }
                        MEMFS.expandFileStorage(node, position + length);
                        if (node.contents.subarray && buffer.subarray) {
                            node.contents.set(buffer.subarray(offset, offset + length), position)
                        } else {
                            for (var i = 0; i < length; i++) {
                                node.contents[position + i] = buffer[offset + i]
                            }
                        }
                        node.usedBytes = Math.max(node.usedBytes, position + length);
                        return length
                    },
                    llseek: function(stream, offset, whence) {
                        var position = offset;
                        if (whence === 1) {
                            position += stream.position
                        } else if (whence === 2) {
                            if (FS.isFile(stream.node.mode)) {
                                position += stream.node.usedBytes
                            }
                        }
                        if (position < 0) {
                            throw new FS.ErrnoError(28)
                        }
                        return position
                    },
                    allocate: function(stream, offset, length) {
                        MEMFS.expandFileStorage(stream.node, offset + length);
                        stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length)
                    },
                    mmap: function(stream, address, length, position, prot, flags) {
                        assert(address === 0);
                        if (!FS.isFile(stream.node.mode)) {
                            throw new FS.ErrnoError(43)
                        }
                        var ptr;
                        var allocated;
                        var contents = stream.node.contents;
                        if (!(flags & 2) && contents.buffer === buffer) {
                            allocated = false;
                            ptr = contents.byteOffset
                        } else {
                            if (position > 0 || position + length < contents.length) {
                                if (contents.subarray) {
                                    contents = contents.subarray(position, position + length)
                                } else {
                                    contents = Array.prototype.slice.call(contents, position, position + length)
                                }
                            }
                            allocated = true;
                            ptr = mmapAlloc(length);
                            if (!ptr) {
                                throw new FS.ErrnoError(48)
                            }
                            HEAP8.set(contents, ptr)
                        }
                        return {
                            ptr: ptr,
                            allocated: allocated
                        }
                    },
                    msync: function(stream, buffer, offset, length, mmapFlags) {
                        if (!FS.isFile(stream.node.mode)) {
                            throw new FS.ErrnoError(43)
                        }
                        if (mmapFlags & 2) {
                            return 0
                        }
                        var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
                        return 0
                    }
                }
            };
            var FS = {
                root: null,
                mounts: [],
                devices: {},
                streams: [],
                nextInode: 1,
                nameTable: null,
                currentPath: "/",
                initialized: false,
                ignorePermissions: true,
                trackingDelegate: {},
                tracking: {
                    openFlags: {
                        READ: 1,
                        WRITE: 2
                    }
                },
                ErrnoError: null,
                genericErrors: {},
                filesystems: null,
                syncFSRequests: 0,
                handleFSError: function(e) {
                    if (!(e instanceof FS.ErrnoError)) throw e + " : " + stackTrace();
                    return setErrNo(e.errno)
                },
                lookupPath: function(path, opts) {
                    path = PATH_FS.resolve(FS.cwd(), path);
                    opts = opts || {};
                    if (!path) return {
                        path: "",
                        node: null
                    };
                    var defaults = {
                        follow_mount: true,
                        recurse_count: 0
                    };
                    for (var key in defaults) {
                        if (opts[key] === undefined) {
                            opts[key] = defaults[key]
                        }
                    }
                    if (opts.recurse_count > 8) {
                        throw new FS.ErrnoError(32)
                    }
                    var parts = PATH.normalizeArray(path.split("/").filter(function(p) {
                        return !!p
                    }), false);
                    var current = FS.root;
                    var current_path = "/";
                    for (var i = 0; i < parts.length; i++) {
                        var islast = i === parts.length - 1;
                        if (islast && opts.parent) {
                            break
                        }
                        current = FS.lookupNode(current, parts[i]);
                        current_path = PATH.join2(current_path, parts[i]);
                        if (FS.isMountpoint(current)) {
                            if (!islast || islast && opts.follow_mount) {
                                current = current.mounted.root
                            }
                        }
                        if (!islast || opts.follow) {
                            var count = 0;
                            while (FS.isLink(current.mode)) {
                                var link = FS.readlink(current_path);
                                current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
                                var lookup = FS.lookupPath(current_path, {
                                    recurse_count: opts.recurse_count
                                });
                                current = lookup.node;
                                if (count++ > 40) {
                                    throw new FS.ErrnoError(32)
                                }
                            }
                        }
                    }
                    return {
                        path: current_path,
                        node: current
                    }
                },
                getPath: function(node) {
                    var path;
                    while (true) {
                        if (FS.isRoot(node)) {
                            var mount = node.mount.mountpoint;
                            if (!path) return mount;
                            return mount[mount.length - 1] !== "/" ? mount + "/" + path : mount + path
                        }
                        path = path ? node.name + "/" + path : node.name;
                        node = node.parent
                    }
                },
                hashName: function(parentid, name) {
                    var hash = 0;
                    for (var i = 0; i < name.length; i++) {
                        hash = (hash << 5) - hash + name.charCodeAt(i) | 0
                    }
                    return (parentid + hash >>> 0) % FS.nameTable.length
                },
                hashAddNode: function(node) {
                    var hash = FS.hashName(node.parent.id, node.name);
                    node.name_next = FS.nameTable[hash];
                    FS.nameTable[hash] = node
                },
                hashRemoveNode: function(node) {
                    var hash = FS.hashName(node.parent.id, node.name);
                    if (FS.nameTable[hash] === node) {
                        FS.nameTable[hash] = node.name_next
                    } else {
                        var current = FS.nameTable[hash];
                        while (current) {
                            if (current.name_next === node) {
                                current.name_next = node.name_next;
                                break
                            }
                            current = current.name_next
                        }
                    }
                },
                lookupNode: function(parent, name) {
                    var errCode = FS.mayLookup(parent);
                    if (errCode) {
                        throw new FS.ErrnoError(errCode, parent)
                    }
                    var hash = FS.hashName(parent.id, name);
                    for (var node = FS.nameTable[hash]; node; node = node.name_next) {
                        var nodeName = node.name;
                        if (node.parent.id === parent.id && nodeName === name) {
                            return node
                        }
                    }
                    return FS.lookup(parent, name)
                },
                createNode: function(parent, name, mode, rdev) {
                    var node = new FS.FSNode(parent, name, mode, rdev);
                    FS.hashAddNode(node);
                    return node
                },
                destroyNode: function(node) {
                    FS.hashRemoveNode(node)
                },
                isRoot: function(node) {
                    return node === node.parent
                },
                isMountpoint: function(node) {
                    return !!node.mounted
                },
                isFile: function(mode) {
                    return (mode & 61440) === 32768
                },
                isDir: function(mode) {
                    return (mode & 61440) === 16384
                },
                isLink: function(mode) {
                    return (mode & 61440) === 40960
                },
                isChrdev: function(mode) {
                    return (mode & 61440) === 8192
                },
                isBlkdev: function(mode) {
                    return (mode & 61440) === 24576
                },
                isFIFO: function(mode) {
                    return (mode & 61440) === 4096
                },
                isSocket: function(mode) {
                    return (mode & 49152) === 49152
                },
                flagModes: {
                    "r": 0,
                    "rs": 1052672,
                    "r+": 2,
                    "w": 577,
                    "wx": 705,
                    "xw": 705,
                    "w+": 578,
                    "wx+": 706,
                    "xw+": 706,
                    "a": 1089,
                    "ax": 1217,
                    "xa": 1217,
                    "a+": 1090,
                    "ax+": 1218,
                    "xa+": 1218
                },
                modeStringToFlags: function(str) {
                    var flags = FS.flagModes[str];
                    if (typeof flags === "undefined") {
                        throw new Error("Unknown file open mode: " + str)
                    }
                    return flags
                },
                flagsToPermissionString: function(flag) {
                    var perms = ["r", "w", "rw"][flag & 3];
                    if (flag & 512) {
                        perms += "w"
                    }
                    return perms
                },
                nodePermissions: function(node, perms) {
                    if (FS.ignorePermissions) {
                        return 0
                    }
                    if (perms.indexOf("r") !== -1 && !(node.mode & 292)) {
                        return 2
                    } else if (perms.indexOf("w") !== -1 && !(node.mode & 146)) {
                        return 2
                    } else if (perms.indexOf("x") !== -1 && !(node.mode & 73)) {
                        return 2
                    }
                    return 0
                },
                mayLookup: function(dir) {
                    var errCode = FS.nodePermissions(dir, "x");
                    if (errCode) return errCode;
                    if (!dir.node_ops.lookup) return 2;
                    return 0
                },
                mayCreate: function(dir, name) {
                    try {
                        var node = FS.lookupNode(dir, name);
                        return 20
                    } catch (e) {}
                    return FS.nodePermissions(dir, "wx")
                },
                mayDelete: function(dir, name, isdir) {
                    var node;
                    try {
                        node = FS.lookupNode(dir, name)
                    } catch (e) {
                        return e.errno
                    }
                    var errCode = FS.nodePermissions(dir, "wx");
                    if (errCode) {
                        return errCode
                    }
                    if (isdir) {
                        if (!FS.isDir(node.mode)) {
                            return 54
                        }
                        if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
                            return 10
                        }
                    } else {
                        if (FS.isDir(node.mode)) {
                            return 31
                        }
                    }
                    return 0
                },
                mayOpen: function(node, flags) {
                    if (!node) {
                        return 44
                    }
                    if (FS.isLink(node.mode)) {
                        return 32
                    } else if (FS.isDir(node.mode)) {
                        if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
                            return 31
                        }
                    }
                    return FS.nodePermissions(node, FS.flagsToPermissionString(flags))
                },
                MAX_OPEN_FDS: 4096,
                nextfd: function(fd_start, fd_end) {
                    fd_start = fd_start || 0;
                    fd_end = fd_end || FS.MAX_OPEN_FDS;
                    for (var fd = fd_start; fd <= fd_end; fd++) {
                        if (!FS.streams[fd]) {
                            return fd
                        }
                    }
                    throw new FS.ErrnoError(33)
                },
                getStream: function(fd) {
                    return FS.streams[fd]
                },
                createStream: function(stream, fd_start, fd_end) {
                    if (!FS.FSStream) {
                        FS.FSStream = function() {};
                        FS.FSStream.prototype = {
                            object: {
                                get: function() {
                                    return this.node
                                },
                                set: function(val) {
                                    this.node = val
                                }
                            },
                            isRead: {
                                get: function() {
                                    return (this.flags & 2097155) !== 1
                                }
                            },
                            isWrite: {
                                get: function() {
                                    return (this.flags & 2097155) !== 0
                                }
                            },
                            isAppend: {
                                get: function() {
                                    return this.flags & 1024
                                }
                            }
                        }
                    }
                    var newStream = new FS.FSStream;
                    for (var p in stream) {
                        newStream[p] = stream[p]
                    }
                    stream = newStream;
                    var fd = FS.nextfd(fd_start, fd_end);
                    stream.fd = fd;
                    FS.streams[fd] = stream;
                    return stream
                },
                closeStream: function(fd) {
                    FS.streams[fd] = null
                },
                chrdev_stream_ops: {
                    open: function(stream) {
                        var device = FS.getDevice(stream.node.rdev);
                        stream.stream_ops = device.stream_ops;
                        if (stream.stream_ops.open) {
                            stream.stream_ops.open(stream)
                        }
                    },
                    llseek: function() {
                        throw new FS.ErrnoError(70)
                    }
                },
                major: function(dev) {
                    return dev >> 8
                },
                minor: function(dev) {
                    return dev & 255
                },
                makedev: function(ma, mi) {
                    return ma << 8 | mi
                },
                registerDevice: function(dev, ops) {
                    FS.devices[dev] = {
                        stream_ops: ops
                    }
                },
                getDevice: function(dev) {
                    return FS.devices[dev]
                },
                getMounts: function(mount) {
                    var mounts = [];
                    var check = [mount];
                    while (check.length) {
                        var m = check.pop();
                        mounts.push(m);
                        check.push.apply(check, m.mounts)
                    }
                    return mounts
                },
                syncfs: function(populate, callback) {
                    if (typeof populate === "function") {
                        callback = populate;
                        populate = false
                    }
                    FS.syncFSRequests++;
                    if (FS.syncFSRequests > 1) {
                        err("warning: " + FS.syncFSRequests + " FS.syncfs operations in flight at once, probably just doing extra work")
                    }
                    var mounts = FS.getMounts(FS.root.mount);
                    var completed = 0;

                    function doCallback(errCode) {
                        FS.syncFSRequests--;
                        return callback(errCode)
                    }

                    function done(errCode) {
                        if (errCode) {
                            if (!done.errored) {
                                done.errored = true;
                                return doCallback(errCode)
                            }
                            return
                        }
                        if (++completed >= mounts.length) {
                            doCallback(null)
                        }
                    }
                    mounts.forEach(function(mount) {
                        if (!mount.type.syncfs) {
                            return done(null)
                        }
                        mount.type.syncfs(mount, populate, done)
                    })
                },
                mount: function(type, opts, mountpoint) {
                    var root = mountpoint === "/";
                    var pseudo = !mountpoint;
                    var node;
                    if (root && FS.root) {
                        throw new FS.ErrnoError(10)
                    } else if (!root && !pseudo) {
                        var lookup = FS.lookupPath(mountpoint, {
                            follow_mount: false
                        });
                        mountpoint = lookup.path;
                        node = lookup.node;
                        if (FS.isMountpoint(node)) {
                            throw new FS.ErrnoError(10)
                        }
                        if (!FS.isDir(node.mode)) {
                            throw new FS.ErrnoError(54)
                        }
                    }
                    var mount = {
                        type: type,
                        opts: opts,
                        mountpoint: mountpoint,
                        mounts: []
                    };
                    var mountRoot = type.mount(mount);
                    mountRoot.mount = mount;
                    mount.root = mountRoot;
                    if (root) {
                        FS.root = mountRoot
                    } else if (node) {
                        node.mounted = mount;
                        if (node.mount) {
                            node.mount.mounts.push(mount)
                        }
                    }
                    return mountRoot
                },
                unmount: function(mountpoint) {
                    var lookup = FS.lookupPath(mountpoint, {
                        follow_mount: false
                    });
                    if (!FS.isMountpoint(lookup.node)) {
                        throw new FS.ErrnoError(28)
                    }
                    var node = lookup.node;
                    var mount = node.mounted;
                    var mounts = FS.getMounts(mount);
                    Object.keys(FS.nameTable).forEach(function(hash) {
                        var current = FS.nameTable[hash];
                        while (current) {
                            var next = current.name_next;
                            if (mounts.indexOf(current.mount) !== -1) {
                                FS.destroyNode(current)
                            }
                            current = next
                        }
                    });
                    node.mounted = null;
                    var idx = node.mount.mounts.indexOf(mount);
                    node.mount.mounts.splice(idx, 1)
                },
                lookup: function(parent, name) {
                    return parent.node_ops.lookup(parent, name)
                },
                mknod: function(path, mode, dev) {
                    var lookup = FS.lookupPath(path, {
                        parent: true
                    });
                    var parent = lookup.node;
                    var name = PATH.basename(path);
                    if (!name || name === "." || name === "..") {
                        throw new FS.ErrnoError(28)
                    }
                    var errCode = FS.mayCreate(parent, name);
                    if (errCode) {
                        throw new FS.ErrnoError(errCode)
                    }
                    if (!parent.node_ops.mknod) {
                        throw new FS.ErrnoError(63)
                    }
                    return parent.node_ops.mknod(parent, name, mode, dev)
                },
                create: function(path, mode) {
                    mode = mode !== undefined ? mode : 438;
                    mode &= 4095;
                    mode |= 32768;
                    return FS.mknod(path, mode, 0)
                },
                mkdir: function(path, mode) {
                    mode = mode !== undefined ? mode : 511;
                    mode &= 511 | 512;
                    mode |= 16384;
                    return FS.mknod(path, mode, 0)
                },
                mkdirTree: function(path, mode) {
                    var dirs = path.split("/");
                    var d = "";
                    for (var i = 0; i < dirs.length; ++i) {
                        if (!dirs[i]) continue;
                        d += "/" + dirs[i];
                        try {
                            FS.mkdir(d, mode)
                        } catch (e) {
                            if (e.errno != 20) throw e
                        }
                    }
                },
                mkdev: function(path, mode, dev) {
                    if (typeof dev === "undefined") {
                        dev = mode;
                        mode = 438
                    }
                    mode |= 8192;
                    return FS.mknod(path, mode, dev)
                },
                symlink: function(oldpath, newpath) {
                    if (!PATH_FS.resolve(oldpath)) {
                        throw new FS.ErrnoError(44)
                    }
                    var lookup = FS.lookupPath(newpath, {
                        parent: true
                    });
                    var parent = lookup.node;
                    if (!parent) {
                        throw new FS.ErrnoError(44)
                    }
                    var newname = PATH.basename(newpath);
                    var errCode = FS.mayCreate(parent, newname);
                    if (errCode) {
                        throw new FS.ErrnoError(errCode)
                    }
                    if (!parent.node_ops.symlink) {
                        throw new FS.ErrnoError(63)
                    }
                    return parent.node_ops.symlink(parent, newname, oldpath)
                },
                rename: function(old_path, new_path) {
                    var old_dirname = PATH.dirname(old_path);
                    var new_dirname = PATH.dirname(new_path);
                    var old_name = PATH.basename(old_path);
                    var new_name = PATH.basename(new_path);
                    var lookup, old_dir, new_dir;
                    lookup = FS.lookupPath(old_path, {
                        parent: true
                    });
                    old_dir = lookup.node;
                    lookup = FS.lookupPath(new_path, {
                        parent: true
                    });
                    new_dir = lookup.node;
                    if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
                    if (old_dir.mount !== new_dir.mount) {
                        throw new FS.ErrnoError(75)
                    }
                    var old_node = FS.lookupNode(old_dir, old_name);
                    var relative = PATH_FS.relative(old_path, new_dirname);
                    if (relative.charAt(0) !== ".") {
                        throw new FS.ErrnoError(28)
                    }
                    relative = PATH_FS.relative(new_path, old_dirname);
                    if (relative.charAt(0) !== ".") {
                        throw new FS.ErrnoError(55)
                    }
                    var new_node;
                    try {
                        new_node = FS.lookupNode(new_dir, new_name)
                    } catch (e) {}
                    if (old_node === new_node) {
                        return
                    }
                    var isdir = FS.isDir(old_node.mode);
                    var errCode = FS.mayDelete(old_dir, old_name, isdir);
                    if (errCode) {
                        throw new FS.ErrnoError(errCode)
                    }
                    errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
                    if (errCode) {
                        throw new FS.ErrnoError(errCode)
                    }
                    if (!old_dir.node_ops.rename) {
                        throw new FS.ErrnoError(63)
                    }
                    if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
                        throw new FS.ErrnoError(10)
                    }
                    if (new_dir !== old_dir) {
                        errCode = FS.nodePermissions(old_dir, "w");
                        if (errCode) {
                            throw new FS.ErrnoError(errCode)
                        }
                    }
                    try {
                        if (FS.trackingDelegate["willMovePath"]) {
                            FS.trackingDelegate["willMovePath"](old_path, new_path)
                        }
                    } catch (e) {
                        err("FS.trackingDelegate['willMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message)
                    }
                    FS.hashRemoveNode(old_node);
                    try {
                        old_dir.node_ops.rename(old_node, new_dir, new_name)
                    } catch (e) {
                        throw e
                    } finally {
                        FS.hashAddNode(old_node)
                    }
                    try {
                        if (FS.trackingDelegate["onMovePath"]) FS.trackingDelegate["onMovePath"](old_path, new_path)
                    } catch (e) {
                        err("FS.trackingDelegate['onMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message)
                    }
                },
                rmdir: function(path) {
                    var lookup = FS.lookupPath(path, {
                        parent: true
                    });
                    var parent = lookup.node;
                    var name = PATH.basename(path);
                    var node = FS.lookupNode(parent, name);
                    var errCode = FS.mayDelete(parent, name, true);
                    if (errCode) {
                        throw new FS.ErrnoError(errCode)
                    }
                    if (!parent.node_ops.rmdir) {
                        throw new FS.ErrnoError(63)
                    }
                    if (FS.isMountpoint(node)) {
                        throw new FS.ErrnoError(10)
                    }
                    try {
                        if (FS.trackingDelegate["willDeletePath"]) {
                            FS.trackingDelegate["willDeletePath"](path)
                        }
                    } catch (e) {
                        err("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message)
                    }
                    parent.node_ops.rmdir(parent, name);
                    FS.destroyNode(node);
                    try {
                        if (FS.trackingDelegate["onDeletePath"]) FS.trackingDelegate["onDeletePath"](path)
                    } catch (e) {
                        err("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message)
                    }
                },
                readdir: function(path) {
                    var lookup = FS.lookupPath(path, {
                        follow: true
                    });
                    var node = lookup.node;
                    if (!node.node_ops.readdir) {
                        throw new FS.ErrnoError(54)
                    }
                    return node.node_ops.readdir(node)
                },
                unlink: function(path) {
                    var lookup = FS.lookupPath(path, {
                        parent: true
                    });
                    var parent = lookup.node;
                    var name = PATH.basename(path);
                    var node = FS.lookupNode(parent, name);
                    var errCode = FS.mayDelete(parent, name, false);
                    if (errCode) {
                        throw new FS.ErrnoError(errCode)
                    }
                    if (!parent.node_ops.unlink) {
                        throw new FS.ErrnoError(63)
                    }
                    if (FS.isMountpoint(node)) {
                        throw new FS.ErrnoError(10)
                    }
                    try {
                        if (FS.trackingDelegate["willDeletePath"]) {
                            FS.trackingDelegate["willDeletePath"](path)
                        }
                    } catch (e) {
                        err("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message)
                    }
                    parent.node_ops.unlink(parent, name);
                    FS.destroyNode(node);
                    try {
                        if (FS.trackingDelegate["onDeletePath"]) FS.trackingDelegate["onDeletePath"](path)
                    } catch (e) {
                        err("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message)
                    }
                },
                readlink: function(path) {
                    var lookup = FS.lookupPath(path);
                    var link = lookup.node;
                    if (!link) {
                        throw new FS.ErrnoError(44)
                    }
                    if (!link.node_ops.readlink) {
                        throw new FS.ErrnoError(28)
                    }
                    return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link))
                },
                stat: function(path, dontFollow) {
                    var lookup = FS.lookupPath(path, {
                        follow: !dontFollow
                    });
                    var node = lookup.node;
                    if (!node) {
                        throw new FS.ErrnoError(44)
                    }
                    if (!node.node_ops.getattr) {
                        throw new FS.ErrnoError(63)
                    }
                    return node.node_ops.getattr(node)
                },
                lstat: function(path) {
                    return FS.stat(path, true)
                },
                chmod: function(path, mode, dontFollow) {
                    var node;
                    if (typeof path === "string") {
                        var lookup = FS.lookupPath(path, {
                            follow: !dontFollow
                        });
                        node = lookup.node
                    } else {
                        node = path
                    }
                    if (!node.node_ops.setattr) {
                        throw new FS.ErrnoError(63)
                    }
                    node.node_ops.setattr(node, {
                        mode: mode & 4095 | node.mode & ~4095,
                        timestamp: Date.now()
                    })
                },
                lchmod: function(path, mode) {
                    FS.chmod(path, mode, true)
                },
                fchmod: function(fd, mode) {
                    var stream = FS.getStream(fd);
                    if (!stream) {
                        throw new FS.ErrnoError(8)
                    }
                    FS.chmod(stream.node, mode)
                },
                chown: function(path, uid, gid, dontFollow) {
                    var node;
                    if (typeof path === "string") {
                        var lookup = FS.lookupPath(path, {
                            follow: !dontFollow
                        });
                        node = lookup.node
                    } else {
                        node = path
                    }
                    if (!node.node_ops.setattr) {
                        throw new FS.ErrnoError(63)
                    }
                    node.node_ops.setattr(node, {
                        timestamp: Date.now()
                    })
                },
                lchown: function(path, uid, gid) {
                    FS.chown(path, uid, gid, true)
                },
                fchown: function(fd, uid, gid) {
                    var stream = FS.getStream(fd);
                    if (!stream) {
                        throw new FS.ErrnoError(8)
                    }
                    FS.chown(stream.node, uid, gid)
                },
                truncate: function(path, len) {
                    if (len < 0) {
                        throw new FS.ErrnoError(28)
                    }
                    var node;
                    if (typeof path === "string") {
                        var lookup = FS.lookupPath(path, {
                            follow: true
                        });
                        node = lookup.node
                    } else {
                        node = path
                    }
                    if (!node.node_ops.setattr) {
                        throw new FS.ErrnoError(63)
                    }
                    if (FS.isDir(node.mode)) {
                        throw new FS.ErrnoError(31)
                    }
                    if (!FS.isFile(node.mode)) {
                        throw new FS.ErrnoError(28)
                    }
                    var errCode = FS.nodePermissions(node, "w");
                    if (errCode) {
                        throw new FS.ErrnoError(errCode)
                    }
                    node.node_ops.setattr(node, {
                        size: len,
                        timestamp: Date.now()
                    })
                },
                ftruncate: function(fd, len) {
                    var stream = FS.getStream(fd);
                    if (!stream) {
                        throw new FS.ErrnoError(8)
                    }
                    if ((stream.flags & 2097155) === 0) {
                        throw new FS.ErrnoError(28)
                    }
                    FS.truncate(stream.node, len)
                },
                utime: function(path, atime, mtime) {
                    var lookup = FS.lookupPath(path, {
                        follow: true
                    });
                    var node = lookup.node;
                    node.node_ops.setattr(node, {
                        timestamp: Math.max(atime, mtime)
                    })
                },
                open: function(path, flags, mode, fd_start, fd_end) {
                    if (path === "") {
                        throw new FS.ErrnoError(44)
                    }
                    flags = typeof flags === "string" ? FS.modeStringToFlags(flags) : flags;
                    mode = typeof mode === "undefined" ? 438 : mode;
                    if (flags & 64) {
                        mode = mode & 4095 | 32768
                    } else {
                        mode = 0
                    }
                    var node;
                    if (typeof path === "object") {
                        node = path
                    } else {
                        path = PATH.normalize(path);
                        try {
                            var lookup = FS.lookupPath(path, {
                                follow: !(flags & 131072)
                            });
                            node = lookup.node
                        } catch (e) {}
                    }
                    var created = false;
                    if (flags & 64) {
                        if (node) {
                            if (flags & 128) {
                                throw new FS.ErrnoError(20)
                            }
                        } else {
                            node = FS.mknod(path, mode, 0);
                            created = true
                        }
                    }
                    if (!node) {
                        throw new FS.ErrnoError(44)
                    }
                    if (FS.isChrdev(node.mode)) {
                        flags &= ~512
                    }
                    if (flags & 65536 && !FS.isDir(node.mode)) {
                        throw new FS.ErrnoError(54)
                    }
                    if (!created) {
                        var errCode = FS.mayOpen(node, flags);
                        if (errCode) {
                            throw new FS.ErrnoError(errCode)
                        }
                    }
                    if (flags & 512) {
                        FS.truncate(node, 0)
                    }
                    flags &= ~(128 | 512 | 131072);
                    var stream = FS.createStream({
                        node: node,
                        path: FS.getPath(node),
                        flags: flags,
                        seekable: true,
                        position: 0,
                        stream_ops: node.stream_ops,
                        ungotten: [],
                        error: false
                    }, fd_start, fd_end);
                    if (stream.stream_ops.open) {
                        stream.stream_ops.open(stream)
                    }
                    if (Module["logReadFiles"] && !(flags & 1)) {
                        if (!FS.readFiles) FS.readFiles = {};
                        if (!(path in FS.readFiles)) {
                            FS.readFiles[path] = 1;
                            err("FS.trackingDelegate error on read file: " + path)
                        }
                    }
                    try {
                        if (FS.trackingDelegate["onOpenFile"]) {
                            var trackingFlags = 0;
                            if ((flags & 2097155) !== 1) {
                                trackingFlags |= FS.tracking.openFlags.READ
                            }
                            if ((flags & 2097155) !== 0) {
                                trackingFlags |= FS.tracking.openFlags.WRITE
                            }
                            FS.trackingDelegate["onOpenFile"](path, trackingFlags)
                        }
                    } catch (e) {
                        err("FS.trackingDelegate['onOpenFile']('" + path + "', flags) threw an exception: " + e.message)
                    }
                    return stream
                },
                close: function(stream) {
                    if (FS.isClosed(stream)) {
                        throw new FS.ErrnoError(8)
                    }
                    if (stream.getdents) stream.getdents = null;
                    try {
                        if (stream.stream_ops.close) {
                            stream.stream_ops.close(stream)
                        }
                    } catch (e) {
                        throw e
                    } finally {
                        FS.closeStream(stream.fd)
                    }
                    stream.fd = null
                },
                isClosed: function(stream) {
                    return stream.fd === null
                },
                llseek: function(stream, offset, whence) {
                    if (FS.isClosed(stream)) {
                        throw new FS.ErrnoError(8)
                    }
                    if (!stream.seekable || !stream.stream_ops.llseek) {
                        throw new FS.ErrnoError(70)
                    }
                    if (whence != 0 && whence != 1 && whence != 2) {
                        throw new FS.ErrnoError(28)
                    }
                    stream.position = stream.stream_ops.llseek(stream, offset, whence);
                    stream.ungotten = [];
                    return stream.position
                },
                read: function(stream, buffer, offset, length, position) {
                    if (length < 0 || position < 0) {
                        throw new FS.ErrnoError(28)
                    }
                    if (FS.isClosed(stream)) {
                        throw new FS.ErrnoError(8)
                    }
                    if ((stream.flags & 2097155) === 1) {
                        throw new FS.ErrnoError(8)
                    }
                    if (FS.isDir(stream.node.mode)) {
                        throw new FS.ErrnoError(31)
                    }
                    if (!stream.stream_ops.read) {
                        throw new FS.ErrnoError(28)
                    }
                    var seeking = typeof position !== "undefined";
                    if (!seeking) {
                        position = stream.position
                    } else if (!stream.seekable) {
                        throw new FS.ErrnoError(70)
                    }
                    var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
                    if (!seeking) stream.position += bytesRead;
                    return bytesRead
                },
                write: function(stream, buffer, offset, length, position, canOwn) {
                    if (length < 0 || position < 0) {
                        throw new FS.ErrnoError(28)
                    }
                    if (FS.isClosed(stream)) {
                        throw new FS.ErrnoError(8)
                    }
                    if ((stream.flags & 2097155) === 0) {
                        throw new FS.ErrnoError(8)
                    }
                    if (FS.isDir(stream.node.mode)) {
                        throw new FS.ErrnoError(31)
                    }
                    if (!stream.stream_ops.write) {
                        throw new FS.ErrnoError(28)
                    }
                    if (stream.seekable && stream.flags & 1024) {
                        FS.llseek(stream, 0, 2)
                    }
                    var seeking = typeof position !== "undefined";
                    if (!seeking) {
                        position = stream.position
                    } else if (!stream.seekable) {
                        throw new FS.ErrnoError(70)
                    }
                    var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
                    if (!seeking) stream.position += bytesWritten;
                    try {
                        if (stream.path && FS.trackingDelegate["onWriteToFile"]) FS.trackingDelegate["onWriteToFile"](stream.path)
                    } catch (e) {
                        err("FS.trackingDelegate['onWriteToFile']('" + stream.path + "') threw an exception: " + e.message)
                    }
                    return bytesWritten
                },
                allocate: function(stream, offset, length) {
                    if (FS.isClosed(stream)) {
                        throw new FS.ErrnoError(8)
                    }
                    if (offset < 0 || length <= 0) {
                        throw new FS.ErrnoError(28)
                    }
                    if ((stream.flags & 2097155) === 0) {
                        throw new FS.ErrnoError(8)
                    }
                    if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
                        throw new FS.ErrnoError(43)
                    }
                    if (!stream.stream_ops.allocate) {
                        throw new FS.ErrnoError(138)
                    }
                    stream.stream_ops.allocate(stream, offset, length)
                },
                mmap: function(stream, address, length, position, prot, flags) {
                    if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
                        throw new FS.ErrnoError(2)
                    }
                    if ((stream.flags & 2097155) === 1) {
                        throw new FS.ErrnoError(2)
                    }
                    if (!stream.stream_ops.mmap) {
                        throw new FS.ErrnoError(43)
                    }
                    return stream.stream_ops.mmap(stream, address, length, position, prot, flags)
                },
                msync: function(stream, buffer, offset, length, mmapFlags) {
                    if (!stream || !stream.stream_ops.msync) {
                        return 0
                    }
                    return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags)
                },
                munmap: function(stream) {
                    return 0
                },
                ioctl: function(stream, cmd, arg) {
                    if (!stream.stream_ops.ioctl) {
                        throw new FS.ErrnoError(59)
                    }
                    return stream.stream_ops.ioctl(stream, cmd, arg)
                },
                readFile: function(path, opts) {
                    opts = opts || {};
                    opts.flags = opts.flags || "r";
                    opts.encoding = opts.encoding || "binary";
                    if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
                        throw new Error('Invalid encoding type "' + opts.encoding + '"')
                    }
                    var ret;
                    var stream = FS.open(path, opts.flags);
                    var stat = FS.stat(path);
                    var length = stat.size;
                    var buf = new Uint8Array(length);
                    FS.read(stream, buf, 0, length, 0);
                    if (opts.encoding === "utf8") {
                        ret = UTF8ArrayToString(buf, 0)
                    } else if (opts.encoding === "binary") {
                        ret = buf
                    }
                    FS.close(stream);
                    return ret
                },
                writeFile: function(path, data, opts) {
                    opts = opts || {};
                    opts.flags = opts.flags || "w";
                    var stream = FS.open(path, opts.flags, opts.mode);
                    if (typeof data === "string") {
                        var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
                        var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
                        FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn)
                    } else if (ArrayBuffer.isView(data)) {
                        FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn)
                    } else {
                        throw new Error("Unsupported data type")
                    }
                    FS.close(stream)
                },
                cwd: function() {
                    return FS.currentPath
                },
                chdir: function(path) {
                    var lookup = FS.lookupPath(path, {
                        follow: true
                    });
                    if (lookup.node === null) {
                        throw new FS.ErrnoError(44)
                    }
                    if (!FS.isDir(lookup.node.mode)) {
                        throw new FS.ErrnoError(54)
                    }
                    var errCode = FS.nodePermissions(lookup.node, "x");
                    if (errCode) {
                        throw new FS.ErrnoError(errCode)
                    }
                    FS.currentPath = lookup.path
                },
                createDefaultDirectories: function() {
                    FS.mkdir("/tmp");
                    FS.mkdir("/home");
                    FS.mkdir("/home/web_user")
                },
                createDefaultDevices: function() {
                    FS.mkdir("/dev");
                    FS.registerDevice(FS.makedev(1, 3), {
                        read: function() {
                            return 0
                        },
                        write: function(stream, buffer, offset, length, pos) {
                            return length
                        }
                    });
                    FS.mkdev("/dev/null", FS.makedev(1, 3));
                    TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
                    TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
                    FS.mkdev("/dev/tty", FS.makedev(5, 0));
                    FS.mkdev("/dev/tty1", FS.makedev(6, 0));
                    var random_device = getRandomDevice();
                    FS.createDevice("/dev", "random", random_device);
                    FS.createDevice("/dev", "urandom", random_device);
                    FS.mkdir("/dev/shm");
                    FS.mkdir("/dev/shm/tmp")
                },
                createSpecialDirectories: function() {
                    FS.mkdir("/proc");
                    FS.mkdir("/proc/self");
                    FS.mkdir("/proc/self/fd");
                    FS.mount({
                        mount: function() {
                            var node = FS.createNode("/proc/self", "fd", 16384 | 511, 73);
                            node.node_ops = {
                                lookup: function(parent, name) {
                                    var fd = +name;
                                    var stream = FS.getStream(fd);
                                    if (!stream) throw new FS.ErrnoError(8);
                                    var ret = {
                                        parent: null,
                                        mount: {
                                            mountpoint: "fake"
                                        },
                                        node_ops: {
                                            readlink: function() {
                                                return stream.path
                                            }
                                        }
                                    };
                                    ret.parent = ret;
                                    return ret
                                }
                            };
                            return node
                        }
                    }, {}, "/proc/self/fd")
                },
                createStandardStreams: function() {
                    if (Module["stdin"]) {
                        FS.createDevice("/dev", "stdin", Module["stdin"])
                    } else {
                        FS.symlink("/dev/tty", "/dev/stdin")
                    }
                    if (Module["stdout"]) {
                        FS.createDevice("/dev", "stdout", null, Module["stdout"])
                    } else {
                        FS.symlink("/dev/tty", "/dev/stdout")
                    }
                    if (Module["stderr"]) {
                        FS.createDevice("/dev", "stderr", null, Module["stderr"])
                    } else {
                        FS.symlink("/dev/tty1", "/dev/stderr")
                    }
                    var stdin = FS.open("/dev/stdin", "r");
                    var stdout = FS.open("/dev/stdout", "w");
                    var stderr = FS.open("/dev/stderr", "w")
                },
                ensureErrnoError: function() {
                    if (FS.ErrnoError) return;
                    FS.ErrnoError = function ErrnoError(errno, node) {
                        this.node = node;
                        this.setErrno = function(errno) {
                            this.errno = errno
                        };
                        this.setErrno(errno);
                        this.message = "FS error"
                    };
                    FS.ErrnoError.prototype = new Error;
                    FS.ErrnoError.prototype.constructor = FS.ErrnoError;
                    [44].forEach(function(code) {
                        FS.genericErrors[code] = new FS.ErrnoError(code);
                        FS.genericErrors[code].stack = "<generic error, no stack>"
                    })
                },
                staticInit: function() {
                    FS.ensureErrnoError();
                    FS.nameTable = new Array(4096);
                    FS.mount(MEMFS, {}, "/");
                    FS.createDefaultDirectories();
                    FS.createDefaultDevices();
                    FS.createSpecialDirectories();
                    FS.filesystems = {
                        "MEMFS": MEMFS
                    }
                },
                init: function(input, output, error) {
                    FS.init.initialized = true;
                    FS.ensureErrnoError();
                    Module["stdin"] = input || Module["stdin"];
                    Module["stdout"] = output || Module["stdout"];
                    Module["stderr"] = error || Module["stderr"];
                    FS.createStandardStreams()
                },
                quit: function() {
                    FS.init.initialized = false;
                    var fflush = Module["_fflush"];
                    if (fflush) fflush(0);
                    for (var i = 0; i < FS.streams.length; i++) {
                        var stream = FS.streams[i];
                        if (!stream) {
                            continue
                        }
                        FS.close(stream)
                    }
                },
                getMode: function(canRead, canWrite) {
                    var mode = 0;
                    if (canRead) mode |= 292 | 73;
                    if (canWrite) mode |= 146;
                    return mode
                },
                findObject: function(path, dontResolveLastLink) {
                    var ret = FS.analyzePath(path, dontResolveLastLink);
                    if (ret.exists) {
                        return ret.object
                    } else {
                        setErrNo(ret.error);
                        return null
                    }
                },
                analyzePath: function(path, dontResolveLastLink) {
                    try {
                        var lookup = FS.lookupPath(path, {
                            follow: !dontResolveLastLink
                        });
                        path = lookup.path
                    } catch (e) {}
                    var ret = {
                        isRoot: false,
                        exists: false,
                        error: 0,
                        name: null,
                        path: null,
                        object: null,
                        parentExists: false,
                        parentPath: null,
                        parentObject: null
                    };
                    try {
                        var lookup = FS.lookupPath(path, {
                            parent: true
                        });
                        ret.parentExists = true;
                        ret.parentPath = lookup.path;
                        ret.parentObject = lookup.node;
                        ret.name = PATH.basename(path);
                        lookup = FS.lookupPath(path, {
                            follow: !dontResolveLastLink
                        });
                        ret.exists = true;
                        ret.path = lookup.path;
                        ret.object = lookup.node;
                        ret.name = lookup.node.name;
                        ret.isRoot = lookup.path === "/"
                    } catch (e) {
                        ret.error = e.errno
                    }
                    return ret
                },
                createPath: function(parent, path, canRead, canWrite) {
                    parent = typeof parent === "string" ? parent : FS.getPath(parent);
                    var parts = path.split("/").reverse();
                    while (parts.length) {
                        var part = parts.pop();
                        if (!part) continue;
                        var current = PATH.join2(parent, part);
                        try {
                            FS.mkdir(current)
                        } catch (e) {}
                        parent = current
                    }
                    return current
                },
                createFile: function(parent, name, properties, canRead, canWrite) {
                    var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
                    var mode = FS.getMode(canRead, canWrite);
                    return FS.create(path, mode)
                },
                createDataFile: function(parent, name, data, canRead, canWrite, canOwn) {
                    var path = name ? PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name) : parent;
                    var mode = FS.getMode(canRead, canWrite);
                    var node = FS.create(path, mode);
                    if (data) {
                        if (typeof data === "string") {
                            var arr = new Array(data.length);
                            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
                            data = arr
                        }
                        FS.chmod(node, mode | 146);
                        var stream = FS.open(node, "w");
                        FS.write(stream, data, 0, data.length, 0, canOwn);
                        FS.close(stream);
                        FS.chmod(node, mode)
                    }
                    return node
                },
                createDevice: function(parent, name, input, output) {
                    var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
                    var mode = FS.getMode(!!input, !!output);
                    if (!FS.createDevice.major) FS.createDevice.major = 64;
                    var dev = FS.makedev(FS.createDevice.major++, 0);
                    FS.registerDevice(dev, {
                        open: function(stream) {
                            stream.seekable = false
                        },
                        close: function(stream) {
                            if (output && output.buffer && output.buffer.length) {
                                output(10)
                            }
                        },
                        read: function(stream, buffer, offset, length, pos) {
                            var bytesRead = 0;
                            for (var i = 0; i < length; i++) {
                                var result;
                                try {
                                    result = input()
                                } catch (e) {
                                    throw new FS.ErrnoError(29)
                                }
                                if (result === undefined && bytesRead === 0) {
                                    throw new FS.ErrnoError(6)
                                }
                                if (result === null || result === undefined) break;
                                bytesRead++;
                                buffer[offset + i] = result
                            }
                            if (bytesRead) {
                                stream.node.timestamp = Date.now()
                            }
                            return bytesRead
                        },
                        write: function(stream, buffer, offset, length, pos) {
                            for (var i = 0; i < length; i++) {
                                try {
                                    output(buffer[offset + i])
                                } catch (e) {
                                    throw new FS.ErrnoError(29)
                                }
                            }
                            if (length) {
                                stream.node.timestamp = Date.now()
                            }
                            return i
                        }
                    });
                    return FS.mkdev(path, mode, dev)
                },
                forceLoadFile: function(obj) {
                    if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
                    var success = true;
                    if (typeof XMLHttpRequest !== "undefined") {
                        throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.")
                    } else if (read_) {
                        try {
                            obj.contents = intArrayFromString(read_(obj.url), true);
                            obj.usedBytes = obj.contents.length
                        } catch (e) {
                            success = false
                        }
                    } else {
                        throw new Error("Cannot load without read() or XMLHttpRequest.")
                    }
                    if (!success) setErrNo(29);
                    return success
                },
                createLazyFile: function(parent, name, url, canRead, canWrite) {
                    function LazyUint8Array() {
                        this.lengthKnown = false;
                        this.chunks = []
                    }
                    LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
                        if (idx > this.length - 1 || idx < 0) {
                            return undefined
                        }
                        var chunkOffset = idx % this.chunkSize;
                        var chunkNum = idx / this.chunkSize | 0;
                        return this.getter(chunkNum)[chunkOffset]
                    };
                    LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
                        this.getter = getter
                    };
                    LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
                        var xhr = new XMLHttpRequest;
                        xhr.open("HEAD", url, false);
                        xhr.send(null);
                        if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                        var datalength = Number(xhr.getResponseHeader("Content-length"));
                        var header;
                        var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
                        var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
                        var chunkSize = 1024 * 1024;
                        if (!hasByteServing) chunkSize = datalength;
                        var doXHR = function(from, to) {
                            if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                            if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
                            var xhr = new XMLHttpRequest;
                            xhr.open("GET", url, false);
                            if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                            if (typeof Uint8Array != "undefined") xhr.responseType = "arraybuffer";
                            if (xhr.overrideMimeType) {
                                xhr.overrideMimeType("text/plain; charset=x-user-defined")
                            }
                            xhr.send(null);
                            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                            if (xhr.response !== undefined) {
                                return new Uint8Array(xhr.response || [])
                            } else {
                                return intArrayFromString(xhr.responseText || "", true)
                            }
                        };
                        var lazyArray = this;
                        lazyArray.setDataGetter(function(chunkNum) {
                            var start = chunkNum * chunkSize;
                            var end = (chunkNum + 1) * chunkSize - 1;
                            end = Math.min(end, datalength - 1);
                            if (typeof lazyArray.chunks[chunkNum] === "undefined") {
                                lazyArray.chunks[chunkNum] = doXHR(start, end)
                            }
                            if (typeof lazyArray.chunks[chunkNum] === "undefined") throw new Error("doXHR failed!");
                            return lazyArray.chunks[chunkNum]
                        });
                        if (usesGzip || !datalength) {
                            chunkSize = datalength = 1;
                            datalength = this.getter(0).length;
                            chunkSize = datalength;
                            out("LazyFiles on gzip forces download of the whole file when length is accessed")
                        }
                        this._length = datalength;
                        this._chunkSize = chunkSize;
                        this.lengthKnown = true
                    };
                    if (typeof XMLHttpRequest !== "undefined") {
                        if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
                        var lazyArray = new LazyUint8Array;
                        Object.defineProperties(lazyArray, {
                            length: {
                                get: function() {
                                    if (!this.lengthKnown) {
                                        this.cacheLength()
                                    }
                                    return this._length
                                }
                            },
                            chunkSize: {
                                get: function() {
                                    if (!this.lengthKnown) {
                                        this.cacheLength()
                                    }
                                    return this._chunkSize
                                }
                            }
                        });
                        var properties = {
                            isDevice: false,
                            contents: lazyArray
                        }
                    } else {
                        var properties = {
                            isDevice: false,
                            url: url
                        }
                    }
                    var node = FS.createFile(parent, name, properties, canRead, canWrite);
                    if (properties.contents) {
                        node.contents = properties.contents
                    } else if (properties.url) {
                        node.contents = null;
                        node.url = properties.url
                    }
                    Object.defineProperties(node, {
                        usedBytes: {
                            get: function() {
                                return this.contents.length
                            }
                        }
                    });
                    var stream_ops = {};
                    var keys = Object.keys(node.stream_ops);
                    keys.forEach(function(key) {
                        var fn = node.stream_ops[key];
                        stream_ops[key] = function forceLoadLazyFile() {
                            if (!FS.forceLoadFile(node)) {
                                throw new FS.ErrnoError(29)
                            }
                            return fn.apply(null, arguments)
                        }
                    });
                    stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
                        if (!FS.forceLoadFile(node)) {
                            throw new FS.ErrnoError(29)
                        }
                        var contents = stream.node.contents;
                        if (position >= contents.length) return 0;
                        var size = Math.min(contents.length - position, length);
                        if (contents.slice) {
                            for (var i = 0; i < size; i++) {
                                buffer[offset + i] = contents[position + i]
                            }
                        } else {
                            for (var i = 0; i < size; i++) {
                                buffer[offset + i] = contents.get(position + i)
                            }
                        }
                        return size
                    };
                    node.stream_ops = stream_ops;
                    return node
                },
                createPreloadedFile: function(parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) {
                    Browser.init();
                    var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
                    var dep = getUniqueRunDependency("cp " + fullname);

                    function processData(byteArray) {
                        function finish(byteArray) {
                            if (preFinish) preFinish();
                            if (!dontCreateFile) {
                                FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn)
                            }
                            if (onload) onload();
                            removeRunDependency(dep)
                        }
                        var handled = false;
                        Module["preloadPlugins"].forEach(function(plugin) {
                            if (handled) return;
                            if (plugin["canHandle"](fullname)) {
                                plugin["handle"](byteArray, fullname, finish, function() {
                                    if (onerror) onerror();
                                    removeRunDependency(dep)
                                });
                                handled = true
                            }
                        });
                        if (!handled) finish(byteArray)
                    }
                    addRunDependency(dep);
                    if (typeof url == "string") {
                        Browser.asyncLoad(url, function(byteArray) {
                            processData(byteArray)
                        }, onerror)
                    } else {
                        processData(url)
                    }
                },
                indexedDB: function() {
                    return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
                },
                DB_NAME: function() {
                    return "EM_FS_" + window.location.pathname
                },
                DB_VERSION: 20,
                DB_STORE_NAME: "FILE_DATA",
                saveFilesToDB: function(paths, onload, onerror) {
                    onload = onload || function() {};
                    onerror = onerror || function() {};
                    var indexedDB = FS.indexedDB();
                    try {
                        var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION)
                    } catch (e) {
                        return onerror(e)
                    }
                    openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
                        out("creating db");
                        var db = openRequest.result;
                        db.createObjectStore(FS.DB_STORE_NAME)
                    };
                    openRequest.onsuccess = function openRequest_onsuccess() {
                        var db = openRequest.result;
                        var transaction = db.transaction([FS.DB_STORE_NAME], "readwrite");
                        var files = transaction.objectStore(FS.DB_STORE_NAME);
                        var ok = 0,
                            fail = 0,
                            total = paths.length;

                        function finish() {
                            if (fail == 0) onload();
                            else onerror()
                        }
                        paths.forEach(function(path) {
                            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
                            putRequest.onsuccess = function putRequest_onsuccess() {
                                ok++;
                                if (ok + fail == total) finish()
                            };
                            putRequest.onerror = function putRequest_onerror() {
                                fail++;
                                if (ok + fail == total) finish()
                            }
                        });
                        transaction.onerror = onerror
                    };
                    openRequest.onerror = onerror
                },
                loadFilesFromDB: function(paths, onload, onerror) {
                    onload = onload || function() {};
                    onerror = onerror || function() {};
                    var indexedDB = FS.indexedDB();
                    try {
                        var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION)
                    } catch (e) {
                        return onerror(e)
                    }
                    openRequest.onupgradeneeded = onerror;
                    openRequest.onsuccess = function openRequest_onsuccess() {
                        var db = openRequest.result;
                        try {
                            var transaction = db.transaction([FS.DB_STORE_NAME], "readonly")
                        } catch (e) {
                            onerror(e);
                            return
                        }
                        var files = transaction.objectStore(FS.DB_STORE_NAME);
                        var ok = 0,
                            fail = 0,
                            total = paths.length;

                        function finish() {
                            if (fail == 0) onload();
                            else onerror()
                        }
                        paths.forEach(function(path) {
                            var getRequest = files.get(path);
                            getRequest.onsuccess = function getRequest_onsuccess() {
                                if (FS.analyzePath(path).exists) {
                                    FS.unlink(path)
                                }
                                FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
                                ok++;
                                if (ok + fail == total) finish()
                            };
                            getRequest.onerror = function getRequest_onerror() {
                                fail++;
                                if (ok + fail == total) finish()
                            }
                        });
                        transaction.onerror = onerror
                    };
                    openRequest.onerror = onerror
                }
            };
            var SYSCALLS = {
                mappings: {},
                DEFAULT_POLLMASK: 5,
                umask: 511,
                calculateAt: function(dirfd, path) {
                    if (path[0] !== "/") {
                        var dir;
                        if (dirfd === -100) {
                            dir = FS.cwd()
                        } else {
                            var dirstream = FS.getStream(dirfd);
                            if (!dirstream) throw new FS.ErrnoError(8);
                            dir = dirstream.path
                        }
                        path = PATH.join2(dir, path)
                    }
                    return path
                },
                doStat: function(func, path, buf) {
                    try {
                        var stat = func(path)
                    } catch (e) {
                        if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
                            return -54
                        }
                        throw e
                    }
                    HEAP32[buf >> 2] = stat.dev;
                    HEAP32[buf + 4 >> 2] = 0;
                    HEAP32[buf + 8 >> 2] = stat.ino;
                    HEAP32[buf + 12 >> 2] = stat.mode;
                    HEAP32[buf + 16 >> 2] = stat.nlink;
                    HEAP32[buf + 20 >> 2] = stat.uid;
                    HEAP32[buf + 24 >> 2] = stat.gid;
                    HEAP32[buf + 28 >> 2] = stat.rdev;
                    HEAP32[buf + 32 >> 2] = 0;
                    tempI64 = [stat.size >>> 0, (tempDouble = stat.size, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 40 >> 2] = tempI64[0], HEAP32[buf + 44 >> 2] = tempI64[1];
                    HEAP32[buf + 48 >> 2] = 4096;
                    HEAP32[buf + 52 >> 2] = stat.blocks;
                    HEAP32[buf + 56 >> 2] = stat.atime.getTime() / 1e3 | 0;
                    HEAP32[buf + 60 >> 2] = 0;
                    HEAP32[buf + 64 >> 2] = stat.mtime.getTime() / 1e3 | 0;
                    HEAP32[buf + 68 >> 2] = 0;
                    HEAP32[buf + 72 >> 2] = stat.ctime.getTime() / 1e3 | 0;
                    HEAP32[buf + 76 >> 2] = 0;
                    tempI64 = [stat.ino >>> 0, (tempDouble = stat.ino, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 80 >> 2] = tempI64[0], HEAP32[buf + 84 >> 2] = tempI64[1];
                    return 0
                },
                doMsync: function(addr, stream, len, flags, offset) {
                    var buffer = HEAPU8.slice(addr, addr + len);
                    FS.msync(stream, buffer, offset, len, flags)
                },
                doMkdir: function(path, mode) {
                    path = PATH.normalize(path);
                    if (path[path.length - 1] === "/") path = path.substr(0, path.length - 1);
                    FS.mkdir(path, mode, 0);
                    return 0
                },
                doMknod: function(path, mode, dev) {
                    switch (mode & 61440) {
                        case 32768:
                        case 8192:
                        case 24576:
                        case 4096:
                        case 49152:
                            break;
                        default:
                            return -28
                    }
                    FS.mknod(path, mode, dev);
                    return 0
                },
                doReadlink: function(path, buf, bufsize) {
                    if (bufsize <= 0) return -28;
                    var ret = FS.readlink(path);
                    var len = Math.min(bufsize, lengthBytesUTF8(ret));
                    var endChar = HEAP8[buf + len];
                    stringToUTF8(ret, buf, bufsize + 1);
                    HEAP8[buf + len] = endChar;
                    return len
                },
                doAccess: function(path, amode) {
                    if (amode & ~7) {
                        return -28
                    }
                    var node;
                    var lookup = FS.lookupPath(path, {
                        follow: true
                    });
                    node = lookup.node;
                    if (!node) {
                        return -44
                    }
                    var perms = "";
                    if (amode & 4) perms += "r";
                    if (amode & 2) perms += "w";
                    if (amode & 1) perms += "x";
                    if (perms && FS.nodePermissions(node, perms)) {
                        return -2
                    }
                    return 0
                },
                doDup: function(path, flags, suggestFD) {
                    var suggest = FS.getStream(suggestFD);
                    if (suggest) FS.close(suggest);
                    return FS.open(path, flags, 0, suggestFD, suggestFD).fd
                },
                doReadv: function(stream, iov, iovcnt, offset) {
                    var ret = 0;
                    for (var i = 0; i < iovcnt; i++) {
                        var ptr = HEAP32[iov + i * 8 >> 2];
                        var len = HEAP32[iov + (i * 8 + 4) >> 2];
                        var curr = FS.read(stream, HEAP8, ptr, len, offset);
                        if (curr < 0) return -1;
                        ret += curr;
                        if (curr < len) break
                    }
                    return ret
                },
                doWritev: function(stream, iov, iovcnt, offset) {
                    var ret = 0;
                    for (var i = 0; i < iovcnt; i++) {
                        var ptr = HEAP32[iov + i * 8 >> 2];
                        var len = HEAP32[iov + (i * 8 + 4) >> 2];
                        var curr = FS.write(stream, HEAP8, ptr, len, offset);
                        if (curr < 0) return -1;
                        ret += curr
                    }
                    return ret
                },
                varargs: undefined,
                get: function() {
                    SYSCALLS.varargs += 4;
                    var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
                    return ret
                },
                getStr: function(ptr) {
                    var ret = UTF8ToString(ptr);
                    return ret
                },
                getStreamFromFD: function(fd) {
                    var stream = FS.getStream(fd);
                    if (!stream) throw new FS.ErrnoError(8);
                    return stream
                },
                get64: function(low, high) {
                    return low
                }
            };

            function ___sys_access(path, amode) {
                try {
                    path = SYSCALLS.getStr(path);
                    return SYSCALLS.doAccess(path, amode)
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return -e.errno
                }
            }

            function ___sys_chdir(path) {
                try {
                    path = SYSCALLS.getStr(path);
                    FS.chdir(path);
                    return 0
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return -e.errno
                }
            }

            function ___sys_chmod(path, mode) {
                try {
                    path = SYSCALLS.getStr(path);
                    FS.chmod(path, mode);
                    return 0
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return -e.errno
                }
            }

            function ___sys_dup2(oldfd, suggestFD) {
                try {
                    var old = SYSCALLS.getStreamFromFD(oldfd);
                    if (old.fd === suggestFD) return suggestFD;
                    return SYSCALLS.doDup(old.path, old.flags, suggestFD)
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return -e.errno
                }
            }

            function ___sys_fcntl64(fd, cmd, varargs) {
                SYSCALLS.varargs = varargs;
                try {
                    var stream = SYSCALLS.getStreamFromFD(fd);
                    switch (cmd) {
                        case 0: {
                            var arg = SYSCALLS.get();
                            if (arg < 0) {
                                return -28
                            }
                            var newStream;
                            newStream = FS.open(stream.path, stream.flags, 0, arg);
                            return newStream.fd
                        }
                        case 1:
                        case 2:
                            return 0;
                        case 3:
                            return stream.flags;
                        case 4: {
                            var arg = SYSCALLS.get();
                            stream.flags |= arg;
                            return 0
                        }
                        case 12: {
                            var arg = SYSCALLS.get();
                            var offset = 0;
                            HEAP16[arg + offset >> 1] = 2;
                            return 0
                        }
                        case 13:
                        case 14:
                            return 0;
                        case 16:
                        case 8:
                            return -28;
                        case 9:
                            setErrNo(28);
                            return -1;
                        default: {
                            return -28
                        }
                    }
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return -e.errno
                }
            }

            function ___sys_fstat64(fd, buf) {
                try {
                    var stream = SYSCALLS.getStreamFromFD(fd);
                    return SYSCALLS.doStat(FS.stat, stream.path, buf)
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return -e.errno
                }
            }

            function ___sys_ftruncate64(fd, zero, low, high) {
                try {
                    var length = SYSCALLS.get64(low, high);
                    FS.ftruncate(fd, length);
                    return 0
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return -e.errno
                }
            }

            function ___sys_getcwd(buf, size) {
                try {
                    if (size === 0) return -28;
                    var cwd = FS.cwd();
                    var cwdLengthInBytes = lengthBytesUTF8(cwd);
                    if (size < cwdLengthInBytes + 1) return -68;
                    stringToUTF8(cwd, buf, size);
                    return buf
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return -e.errno
                }
            }

            function ___sys_getdents64(fd, dirp, count) {
                try {
                    var stream = SYSCALLS.getStreamFromFD(fd);
                    if (!stream.getdents) {
                        stream.getdents = FS.readdir(stream.path)
                    }
                    var struct_size = 280;
                    var pos = 0;
                    var off = FS.llseek(stream, 0, 1);
                    var idx = Math.floor(off / struct_size);
                    while (idx < stream.getdents.length && pos + struct_size <= count) {
                        var id;
                        var type;
                        var name = stream.getdents[idx];
                        if (name[0] === ".") {
                            id = 1;
                            type = 4
                        } else {
                            var child = FS.lookupNode(stream.node, name);
                            id = child.id;
                            type = FS.isChrdev(child.mode) ? 2 : FS.isDir(child.mode) ? 4 : FS.isLink(child.mode) ? 10 : 8
                        }
                        tempI64 = [id >>> 0, (tempDouble = id, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[dirp + pos >> 2] = tempI64[0], HEAP32[dirp + pos + 4 >> 2] = tempI64[1];
                        tempI64 = [(idx + 1) * struct_size >>> 0, (tempDouble = (idx + 1) * struct_size, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[dirp + pos + 8 >> 2] = tempI64[0], HEAP32[dirp + pos + 12 >> 2] = tempI64[1];
                        HEAP16[dirp + pos + 16 >> 1] = 280;
                        HEAP8[dirp + pos + 18 >> 0] = type;
                        stringToUTF8(name, dirp + pos + 19, 256);
                        pos += struct_size;
                        idx += 1
                    }
                    FS.llseek(stream, idx * struct_size, 0);
                    return pos
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return -e.errno
                }
            }

            function ___sys_getpid() {
                return 42
            }

            function ___sys_getrusage(who, usage) {
                try {
                    _memset(usage, 0, 136);
                    HEAP32[usage >> 2] = 1;
                    HEAP32[usage + 4 >> 2] = 2;
                    HEAP32[usage + 8 >> 2] = 3;
                    HEAP32[usage + 12 >> 2] = 4;
                    return 0
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return -e.errno
                }
            }

            function ___sys_getegid32() {
                return 0
            }

            function ___sys_getuid32() {
                return ___sys_getegid32()
            }

            function ___sys_ioctl(fd, op, varargs) {
                SYSCALLS.varargs = varargs;
                try {
                    var stream = SYSCALLS.getStreamFromFD(fd);
                    switch (op) {
                        case 21509:
                        case 21505: {
                            if (!stream.tty) return -59;
                            return 0
                        }
                        case 21510:
                        case 21511:
                        case 21512:
                        case 21506:
                        case 21507:
                        case 21508: {
                            if (!stream.tty) return -59;
                            return 0
                        }
                        case 21519: {
                            if (!stream.tty) return -59;
                            var argp = SYSCALLS.get();
                            HEAP32[argp >> 2] = 0;
                            return 0
                        }
                        case 21520: {
                            if (!stream.tty) return -59;
                            return -28
                        }
                        case 21531: {
                            var argp = SYSCALLS.get();
                            return FS.ioctl(stream, op, argp)
                        }
                        case 21523: {
                            if (!stream.tty) return -59;
                            return 0
                        }
                        case 21524: {
                            if (!stream.tty) return -59;
                            return 0
                        }
                        default:
                            abort("bad ioctl syscall " + op)
                    }
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return -e.errno
                }
            }

            function ___sys_mkdir(path, mode) {
                try {
                    path = SYSCALLS.getStr(path);
                    return SYSCALLS.doMkdir(path, mode)
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return -e.errno
                }
            }

            function syscallMmap2(addr, len, prot, flags, fd, off) {
                off <<= 12;
                var ptr;
                var allocated = false;
                if ((flags & 16) !== 0 && addr % 16384 !== 0) {
                    return -28
                }
                if ((flags & 32) !== 0) {
                    ptr = _memalign(16384, len);
                    if (!ptr) return -48;
                    _memset(ptr, 0, len);
                    allocated = true
                } else {
                    var info = FS.getStream(fd);
                    if (!info) return -8;
                    var res = FS.mmap(info, addr, len, off, prot, flags);
                    ptr = res.ptr;
                    allocated = res.allocated
                }
                SYSCALLS.mappings[ptr] = {
                    malloc: ptr,
                    len: len,
                    allocated: allocated,
                    fd: fd,
                    prot: prot,
                    flags: flags,
                    offset: off
                };
                return ptr
            }

            function ___sys_mmap2(addr, len, prot, flags, fd, off) {
                try {
                    return syscallMmap2(addr, len, prot, flags, fd, off)
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return -e.errno
                }
            }

            function syscallMunmap(addr, len) {
                if ((addr | 0) === -1 || len === 0) {
                    return -28
                }
                var info = SYSCALLS.mappings[addr];
                if (!info) return 0;
                if (len === info.len) {
                    var stream = FS.getStream(info.fd);
                    if (info.prot & 2) {
                        SYSCALLS.doMsync(addr, stream, len, info.flags, info.offset)
                    }
                    FS.munmap(stream);
                    SYSCALLS.mappings[addr] = null;
                    if (info.allocated) {
                        _free(info.malloc)
                    }
                }
                return 0
            }

            function ___sys_munmap(addr, len) {
                try {
                    return syscallMunmap(addr, len)
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return -e.errno
                }
            }

            function ___sys_open(path, flags, varargs) {
                SYSCALLS.varargs = varargs;
                try {
                    var pathname = SYSCALLS.getStr(path);
                    var mode = SYSCALLS.get();
                    var stream = FS.open(pathname, flags, mode);
                    return stream.fd
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return -e.errno
                }
            }

            function ___sys_poll(fds, nfds, timeout) {
                try {
                    var nonzero = 0;
                    for (var i = 0; i < nfds; i++) {
                        var pollfd = fds + 8 * i;
                        var fd = HEAP32[pollfd >> 2];
                        var events = HEAP16[pollfd + 4 >> 1];
                        var mask = 32;
                        var stream = FS.getStream(fd);
                        if (stream) {
                            mask = SYSCALLS.DEFAULT_POLLMASK;
                            if (stream.stream_ops.poll) {
                                mask = stream.stream_ops.poll(stream)
                            }
                        }
                        mask &= events | 8 | 16;
                        if (mask) nonzero++;
                        HEAP16[pollfd + 6 >> 1] = mask
                    }
                    return nonzero
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return -e.errno
                }
            }

            function ___sys_prlimit64(pid, resource, new_limit, old_limit) {
                try {
                    if (old_limit) {
                        HEAP32[old_limit >> 2] = -1;
                        HEAP32[old_limit + 4 >> 2] = -1;
                        HEAP32[old_limit + 8 >> 2] = -1;
                        HEAP32[old_limit + 12 >> 2] = -1
                    }
                    return 0
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return -e.errno
                }
            }

            function ___sys_read(fd, buf, count) {
                try {
                    var stream = SYSCALLS.getStreamFromFD(fd);
                    return FS.read(stream, HEAP8, buf, count)
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return -e.errno
                }
            }

            function ___sys_readlink(path, buf, bufsize) {
                try {
                    path = SYSCALLS.getStr(path);
                    return SYSCALLS.doReadlink(path, buf, bufsize)
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return -e.errno
                }
            }

            function ___sys_rename(old_path, new_path) {
                try {
                    old_path = SYSCALLS.getStr(old_path);
                    new_path = SYSCALLS.getStr(new_path);
                    FS.rename(old_path, new_path);
                    return 0
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return -e.errno
                }
            }

            function ___sys_rmdir(path) {
                try {
                    path = SYSCALLS.getStr(path);
                    FS.rmdir(path);
                    return 0
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return -e.errno
                }
            }

            function ___sys_stat64(path, buf) {
                try {
                    path = SYSCALLS.getStr(path);
                    return SYSCALLS.doStat(FS.stat, path, buf)
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return -e.errno
                }
            }

            function ___sys_ugetrlimit(resource, rlim) {
                try {
                    HEAP32[rlim >> 2] = -1;
                    HEAP32[rlim + 4 >> 2] = -1;
                    HEAP32[rlim + 8 >> 2] = -1;
                    HEAP32[rlim + 12 >> 2] = -1;
                    return 0
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return -e.errno
                }
            }

            function ___sys_umask(mask) {
                try {
                    var old = SYSCALLS.umask;
                    SYSCALLS.umask = mask;
                    return old
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return -e.errno
                }
            }

            function ___sys_unlink(path) {
                try {
                    path = SYSCALLS.getStr(path);
                    FS.unlink(path);
                    return 0
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return -e.errno
                }
            }

            function ___sys_wait4(pid, wstart, options, rusage) {
                try {
                    abort("cannot wait on child processes")
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return -e.errno
                }
            }

            function _abort() {
                abort()
            }

            function _tzset() {
                if (_tzset.called) return;
                _tzset.called = true;
                HEAP32[__get_timezone() >> 2] = (new Date).getTimezoneOffset() * 60;
                var currentYear = (new Date).getFullYear();
                var winter = new Date(currentYear, 0, 1);
                var summer = new Date(currentYear, 6, 1);
                HEAP32[__get_daylight() >> 2] = Number(winter.getTimezoneOffset() != summer.getTimezoneOffset());

                function extractZone(date) {
                    var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
                    return match ? match[1] : "GMT"
                }
                var winterName = extractZone(winter);
                var summerName = extractZone(summer);
                var winterNamePtr = allocateUTF8(winterName);
                var summerNamePtr = allocateUTF8(summerName);
                if (summer.getTimezoneOffset() < winter.getTimezoneOffset()) {
                    HEAP32[__get_tzname() >> 2] = winterNamePtr;
                    HEAP32[__get_tzname() + 4 >> 2] = summerNamePtr
                } else {
                    HEAP32[__get_tzname() >> 2] = summerNamePtr;
                    HEAP32[__get_tzname() + 4 >> 2] = winterNamePtr
                }
            }

            function _mktime(tmPtr) {
                _tzset();
                var date = new Date(HEAP32[tmPtr + 20 >> 2] + 1900, HEAP32[tmPtr + 16 >> 2], HEAP32[tmPtr + 12 >> 2], HEAP32[tmPtr + 8 >> 2], HEAP32[tmPtr + 4 >> 2], HEAP32[tmPtr >> 2], 0);
                var dst = HEAP32[tmPtr + 32 >> 2];
                var guessedOffset = date.getTimezoneOffset();
                var start = new Date(date.getFullYear(), 0, 1);
                var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
                var winterOffset = start.getTimezoneOffset();
                var dstOffset = Math.min(winterOffset, summerOffset);
                if (dst < 0) {
                    HEAP32[tmPtr + 32 >> 2] = Number(summerOffset != winterOffset && dstOffset == guessedOffset)
                } else if (dst > 0 != (dstOffset == guessedOffset)) {
                    var nonDstOffset = Math.max(winterOffset, summerOffset);
                    var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
                    date.setTime(date.getTime() + (trueOffset - guessedOffset) * 6e4)
                }
                HEAP32[tmPtr + 24 >> 2] = date.getDay();
                var yday = (date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24) | 0;
                HEAP32[tmPtr + 28 >> 2] = yday;
                return date.getTime() / 1e3 | 0
            }

            function _asctime_r(tmPtr, buf) {
                var date = {
                    tm_sec: HEAP32[tmPtr >> 2],
                    tm_min: HEAP32[tmPtr + 4 >> 2],
                    tm_hour: HEAP32[tmPtr + 8 >> 2],
                    tm_mday: HEAP32[tmPtr + 12 >> 2],
                    tm_mon: HEAP32[tmPtr + 16 >> 2],
                    tm_year: HEAP32[tmPtr + 20 >> 2],
                    tm_wday: HEAP32[tmPtr + 24 >> 2]
                };
                var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                var s = days[date.tm_wday] + " " + months[date.tm_mon] + (date.tm_mday < 10 ? "  " : " ") + date.tm_mday + (date.tm_hour < 10 ? " 0" : " ") + date.tm_hour + (date.tm_min < 10 ? ":0" : ":") + date.tm_min + (date.tm_sec < 10 ? ":0" : ":") + date.tm_sec + " " + (1900 + date.tm_year) + "\n";
                stringToUTF8(s, buf, 26);
                return buf
            }
            var _emscripten_get_now;
            if (ENVIRONMENT_IS_NODE) {
                _emscripten_get_now = function() {
                    var t = process["hrtime"]();
                    return t[0] * 1e3 + t[1] / 1e6
                }
            } else if (typeof dateNow !== "undefined") {
                _emscripten_get_now = dateNow
            } else _emscripten_get_now = function() {
                return performance.now()
            };
            var _emscripten_get_now_is_monotonic = true;

            function _clock_gettime(clk_id, tp) {
                var now;
                if (clk_id === 0) {
                    now = Date.now()
                } else if ((clk_id === 1 || clk_id === 4) && _emscripten_get_now_is_monotonic) {
                    now = _emscripten_get_now()
                } else {
                    setErrNo(28);
                    return -1
                }
                HEAP32[tp >> 2] = now / 1e3 | 0;
                HEAP32[tp + 4 >> 2] = now % 1e3 * 1e3 * 1e3 | 0;
                return 0
            }

            function _localtime_r(time, tmPtr) {
                _tzset();
                var date = new Date(HEAP32[time >> 2] * 1e3);
                HEAP32[tmPtr >> 2] = date.getSeconds();
                HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
                HEAP32[tmPtr + 8 >> 2] = date.getHours();
                HEAP32[tmPtr + 12 >> 2] = date.getDate();
                HEAP32[tmPtr + 16 >> 2] = date.getMonth();
                HEAP32[tmPtr + 20 >> 2] = date.getFullYear() - 1900;
                HEAP32[tmPtr + 24 >> 2] = date.getDay();
                var start = new Date(date.getFullYear(), 0, 1);
                var yday = (date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24) | 0;
                HEAP32[tmPtr + 28 >> 2] = yday;
                HEAP32[tmPtr + 36 >> 2] = -(date.getTimezoneOffset() * 60);
                var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
                var winterOffset = start.getTimezoneOffset();
                var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
                HEAP32[tmPtr + 32 >> 2] = dst;
                var zonePtr = HEAP32[__get_tzname() + (dst ? 4 : 0) >> 2];
                HEAP32[tmPtr + 40 >> 2] = zonePtr;
                return tmPtr
            }

            function _ctime_r(time, buf) {
                var stack = stackSave();
                var rv = _asctime_r(_localtime_r(time, stackAlloc(44)), buf);
                stackRestore(stack);
                return rv
            }

            function _dladdr(address, info) {
                abort("To use dlopen, you need to use Emscripten's linking support, see https://github.com/emscripten-core/emscripten/wiki/Linking")
            }

            function _dlclose(handle) {
                abort("To use dlopen, you need to use Emscripten's linking support, see https://github.com/emscripten-core/emscripten/wiki/Linking")
            }

            function _dlerror() {
                abort("To use dlopen, you need to use Emscripten's linking support, see https://github.com/emscripten-core/emscripten/wiki/Linking")
            }

            function _dlopen(filename, flag) {
                abort("To use dlopen, you need to use Emscripten's linking support, see https://github.com/emscripten-core/emscripten/wiki/Linking")
            }

            function _dlsym(handle, symbol) {
                abort("To use dlopen, you need to use Emscripten's linking support, see https://github.com/emscripten-core/emscripten/wiki/Linking")
            }

            function _longjmp(env, value) {
                _setThrew(env, value || 1);
                throw "longjmp"
            }

            function _emscripten_longjmp(a0, a1) {
                return _longjmp(a0, a1)
            }

            function _emscripten_longjmp_jmpbuf(a0, a1) {
                return _longjmp(a0, a1)
            }

            function _emscripten_memcpy_big(dest, src, num) {
                HEAPU8.copyWithin(dest, src, src + num)
            }

            function abortOnCannotGrowMemory(requestedSize) {
                abort("OOM")
            }

            function _emscripten_resize_heap(requestedSize) {
                requestedSize = requestedSize >>> 0;
                abortOnCannotGrowMemory(requestedSize)
            }
            var ENV = {};

            function getExecutableName() {
                return thisProgram || "./this.program"
            }

            function getEnvStrings() {
                if (!getEnvStrings.strings) {
                    var lang = (typeof navigator === "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
                    var env = {
                        "USER": "web_user",
                        "LOGNAME": "web_user",
                        "PATH": "/",
                        "PWD": "/",
                        "HOME": "/home/web_user",
                        "LANG": lang,
                        "_": getExecutableName()
                    };
                    for (var x in ENV) {
                        env[x] = ENV[x]
                    }
                    var strings = [];
                    for (var x in env) {
                        strings.push(x + "=" + env[x])
                    }
                    getEnvStrings.strings = strings
                }
                return getEnvStrings.strings
            }

            function _environ_get(__environ, environ_buf) {
                var bufSize = 0;
                getEnvStrings().forEach(function(string, i) {
                    var ptr = environ_buf + bufSize;
                    HEAP32[__environ + i * 4 >> 2] = ptr;
                    writeAsciiToMemory(string, ptr);
                    bufSize += string.length + 1
                });
                return 0
            }

            function _environ_sizes_get(penviron_count, penviron_buf_size) {
                var strings = getEnvStrings();
                HEAP32[penviron_count >> 2] = strings.length;
                var bufSize = 0;
                strings.forEach(function(string) {
                    bufSize += string.length + 1
                });
                HEAP32[penviron_buf_size >> 2] = bufSize;
                return 0
            }

            function _execve(path, argv, envp) {
                setErrNo(45);
                return -1
            }

            function _exit(status) {
                exit(status)
            }

            function _fd_close(fd) {
                try {
                    var stream = SYSCALLS.getStreamFromFD(fd);
                    FS.close(stream);
                    return 0
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return e.errno
                }
            }

            function _fd_fdstat_get(fd, pbuf) {
                try {
                    var stream = SYSCALLS.getStreamFromFD(fd);
                    var type = stream.tty ? 2 : FS.isDir(stream.mode) ? 3 : FS.isLink(stream.mode) ? 7 : 4;
                    HEAP8[pbuf >> 0] = type;
                    return 0
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return e.errno
                }
            }

            function _fd_read(fd, iov, iovcnt, pnum) {
                try {
                    var stream = SYSCALLS.getStreamFromFD(fd);
                    var num = SYSCALLS.doReadv(stream, iov, iovcnt);
                    HEAP32[pnum >> 2] = num;
                    return 0
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return e.errno
                }
            }

            function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
                try {
                    var stream = SYSCALLS.getStreamFromFD(fd);
                    var HIGH_OFFSET = 4294967296;
                    var offset = offset_high * HIGH_OFFSET + (offset_low >>> 0);
                    var DOUBLE_LIMIT = 9007199254740992;
                    if (offset <= -DOUBLE_LIMIT || offset >= DOUBLE_LIMIT) {
                        return -61
                    }
                    FS.llseek(stream, offset, whence);
                    tempI64 = [stream.position >>> 0, (tempDouble = stream.position, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[newOffset >> 2] = tempI64[0], HEAP32[newOffset + 4 >> 2] = tempI64[1];
                    if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
                    return 0
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return e.errno
                }
            }

            function _fd_write(fd, iov, iovcnt, pnum) {
                try {
                    var stream = SYSCALLS.getStreamFromFD(fd);
                    var num = SYSCALLS.doWritev(stream, iov, iovcnt);
                    HEAP32[pnum >> 2] = num;
                    return 0
                } catch (e) {
                    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
                    return e.errno
                }
            }

            function _fork() {
                setErrNo(6);
                return -1
            }

            function _getTempRet0() {
                return getTempRet0() | 0
            }

            function _getpwnam() {
                throw "getpwnam: TODO"
            }

            function _gettimeofday(ptr) {
                var now = Date.now();
                HEAP32[ptr >> 2] = now / 1e3 | 0;
                HEAP32[ptr + 4 >> 2] = now % 1e3 * 1e3 | 0;
                return 0
            }

            function _usleep(useconds) {
                var start = _emscripten_get_now();
                while (_emscripten_get_now() - start < useconds / 1e3) {}
            }

            function _nanosleep(rqtp, rmtp) {
                if (rqtp === 0) {
                    setErrNo(28);
                    return -1
                }
                var seconds = HEAP32[rqtp >> 2];
                var nanoseconds = HEAP32[rqtp + 4 >> 2];
                if (nanoseconds < 0 || nanoseconds > 999999999 || seconds < 0) {
                    setErrNo(28);
                    return -1
                }
                if (rmtp !== 0) {
                    HEAP32[rmtp >> 2] = 0;
                    HEAP32[rmtp + 4 >> 2] = 0
                }
                return _usleep(seconds * 1e6 + nanoseconds / 1e3)
            }

            function _setTempRet0($i) {
                setTempRet0($i | 0)
            }
            var __sigalrm_handler = 0;

            function _signal(sig, func) {
                if (sig == 14) {
                    __sigalrm_handler = func
                } else {}
                return 0
            }

            function __isLeapYear(year) {
                return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
            }

            function __arraySum(array, index) {
                var sum = 0;
                for (var i = 0; i <= index; sum += array[i++]) {}
                return sum
            }
            var __MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            var __MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

            function __addDays(date, days) {
                var newDate = new Date(date.getTime());
                while (days > 0) {
                    var leap = __isLeapYear(newDate.getFullYear());
                    var currentMonth = newDate.getMonth();
                    var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
                    if (days > daysInCurrentMonth - newDate.getDate()) {
                        days -= daysInCurrentMonth - newDate.getDate() + 1;
                        newDate.setDate(1);
                        if (currentMonth < 11) {
                            newDate.setMonth(currentMonth + 1)
                        } else {
                            newDate.setMonth(0);
                            newDate.setFullYear(newDate.getFullYear() + 1)
                        }
                    } else {
                        newDate.setDate(newDate.getDate() + days);
                        return newDate
                    }
                }
                return newDate
            }

            function _strftime(s, maxsize, format, tm) {
                var tm_zone = HEAP32[tm + 40 >> 2];
                var date = {
                    tm_sec: HEAP32[tm >> 2],
                    tm_min: HEAP32[tm + 4 >> 2],
                    tm_hour: HEAP32[tm + 8 >> 2],
                    tm_mday: HEAP32[tm + 12 >> 2],
                    tm_mon: HEAP32[tm + 16 >> 2],
                    tm_year: HEAP32[tm + 20 >> 2],
                    tm_wday: HEAP32[tm + 24 >> 2],
                    tm_yday: HEAP32[tm + 28 >> 2],
                    tm_isdst: HEAP32[tm + 32 >> 2],
                    tm_gmtoff: HEAP32[tm + 36 >> 2],
                    tm_zone: tm_zone ? UTF8ToString(tm_zone) : ""
                };
                var pattern = UTF8ToString(format);
                var EXPANSION_RULES_1 = {
                    "%c": "%a %b %d %H:%M:%S %Y",
                    "%D": "%m/%d/%y",
                    "%F": "%Y-%m-%d",
                    "%h": "%b",
                    "%r": "%I:%M:%S %p",
                    "%R": "%H:%M",
                    "%T": "%H:%M:%S",
                    "%x": "%m/%d/%y",
                    "%X": "%H:%M:%S",
                    "%Ec": "%c",
                    "%EC": "%C",
                    "%Ex": "%m/%d/%y",
                    "%EX": "%H:%M:%S",
                    "%Ey": "%y",
                    "%EY": "%Y",
                    "%Od": "%d",
                    "%Oe": "%e",
                    "%OH": "%H",
                    "%OI": "%I",
                    "%Om": "%m",
                    "%OM": "%M",
                    "%OS": "%S",
                    "%Ou": "%u",
                    "%OU": "%U",
                    "%OV": "%V",
                    "%Ow": "%w",
                    "%OW": "%W",
                    "%Oy": "%y"
                };
                for (var rule in EXPANSION_RULES_1) {
                    pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule])
                }
                var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

                function leadingSomething(value, digits, character) {
                    var str = typeof value === "number" ? value.toString() : value || "";
                    while (str.length < digits) {
                        str = character[0] + str
                    }
                    return str
                }

                function leadingNulls(value, digits) {
                    return leadingSomething(value, digits, "0")
                }

                function compareByDay(date1, date2) {
                    function sgn(value) {
                        return value < 0 ? -1 : value > 0 ? 1 : 0
                    }
                    var compare;
                    if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
                        if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
                            compare = sgn(date1.getDate() - date2.getDate())
                        }
                    }
                    return compare
                }

                function getFirstWeekStartDate(janFourth) {
                    switch (janFourth.getDay()) {
                        case 0:
                            return new Date(janFourth.getFullYear() - 1, 11, 29);
                        case 1:
                            return janFourth;
                        case 2:
                            return new Date(janFourth.getFullYear(), 0, 3);
                        case 3:
                            return new Date(janFourth.getFullYear(), 0, 2);
                        case 4:
                            return new Date(janFourth.getFullYear(), 0, 1);
                        case 5:
                            return new Date(janFourth.getFullYear() - 1, 11, 31);
                        case 6:
                            return new Date(janFourth.getFullYear() - 1, 11, 30)
                    }
                }

                function getWeekBasedYear(date) {
                    var thisDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
                    var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
                    var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
                    var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
                    var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
                    if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
                        if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
                            return thisDate.getFullYear() + 1
                        } else {
                            return thisDate.getFullYear()
                        }
                    } else {
                        return thisDate.getFullYear() - 1
                    }
                }
                var EXPANSION_RULES_2 = {
                    "%a": function(date) {
                        return WEEKDAYS[date.tm_wday].substring(0, 3)
                    },
                    "%A": function(date) {
                        return WEEKDAYS[date.tm_wday]
                    },
                    "%b": function(date) {
                        return MONTHS[date.tm_mon].substring(0, 3)
                    },
                    "%B": function(date) {
                        return MONTHS[date.tm_mon]
                    },
                    "%C": function(date) {
                        var year = date.tm_year + 1900;
                        return leadingNulls(year / 100 | 0, 2)
                    },
                    "%d": function(date) {
                        return leadingNulls(date.tm_mday, 2)
                    },
                    "%e": function(date) {
                        return leadingSomething(date.tm_mday, 2, " ")
                    },
                    "%g": function(date) {
                        return getWeekBasedYear(date).toString().substring(2)
                    },
                    "%G": function(date) {
                        return getWeekBasedYear(date)
                    },
                    "%H": function(date) {
                        return leadingNulls(date.tm_hour, 2)
                    },
                    "%I": function(date) {
                        var twelveHour = date.tm_hour;
                        if (twelveHour == 0) twelveHour = 12;
                        else if (twelveHour > 12) twelveHour -= 12;
                        return leadingNulls(twelveHour, 2)
                    },
                    "%j": function(date) {
                        return leadingNulls(date.tm_mday + __arraySum(__isLeapYear(date.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon - 1), 3)
                    },
                    "%m": function(date) {
                        return leadingNulls(date.tm_mon + 1, 2)
                    },
                    "%M": function(date) {
                        return leadingNulls(date.tm_min, 2)
                    },
                    "%n": function() {
                        return "\n"
                    },
                    "%p": function(date) {
                        if (date.tm_hour >= 0 && date.tm_hour < 12) {
                            return "AM"
                        } else {
                            return "PM"
                        }
                    },
                    "%S": function(date) {
                        return leadingNulls(date.tm_sec, 2)
                    },
                    "%t": function() {
                        return "\t"
                    },
                    "%u": function(date) {
                        return date.tm_wday || 7
                    },
                    "%U": function(date) {
                        var janFirst = new Date(date.tm_year + 1900, 0, 1);
                        var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7 - janFirst.getDay());
                        var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
                        if (compareByDay(firstSunday, endDate) < 0) {
                            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
                            var firstSundayUntilEndJanuary = 31 - firstSunday.getDate();
                            var days = firstSundayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
                            return leadingNulls(Math.ceil(days / 7), 2)
                        }
                        return compareByDay(firstSunday, janFirst) === 0 ? "01" : "00"
                    },
                    "%V": function(date) {
                        var janFourthThisYear = new Date(date.tm_year + 1900, 0, 4);
                        var janFourthNextYear = new Date(date.tm_year + 1901, 0, 4);
                        var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
                        var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
                        var endDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
                        if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
                            return "53"
                        }
                        if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
                            return "01"
                        }
                        var daysDifference;
                        if (firstWeekStartThisYear.getFullYear() < date.tm_year + 1900) {
                            daysDifference = date.tm_yday + 32 - firstWeekStartThisYear.getDate()
                        } else {
                            daysDifference = date.tm_yday + 1 - firstWeekStartThisYear.getDate()
                        }
                        return leadingNulls(Math.ceil(daysDifference / 7), 2)
                    },
                    "%w": function(date) {
                        return date.tm_wday
                    },
                    "%W": function(date) {
                        var janFirst = new Date(date.tm_year, 0, 1);
                        var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7 - janFirst.getDay() + 1);
                        var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
                        if (compareByDay(firstMonday, endDate) < 0) {
                            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
                            var firstMondayUntilEndJanuary = 31 - firstMonday.getDate();
                            var days = firstMondayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
                            return leadingNulls(Math.ceil(days / 7), 2)
                        }
                        return compareByDay(firstMonday, janFirst) === 0 ? "01" : "00"
                    },
                    "%y": function(date) {
                        return (date.tm_year + 1900).toString().substring(2)
                    },
                    "%Y": function(date) {
                        return date.tm_year + 1900
                    },
                    "%z": function(date) {
                        var off = date.tm_gmtoff;
                        var ahead = off >= 0;
                        off = Math.abs(off) / 60;
                        off = off / 60 * 100 + off % 60;
                        return (ahead ? "+" : "-") + String("0000" + off).slice(-4)
                    },
                    "%Z": function(date) {
                        return date.tm_zone
                    },
                    "%%": function() {
                        return "%"
                    }
                };
                for (var rule in EXPANSION_RULES_2) {
                    if (pattern.indexOf(rule) >= 0) {
                        pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_2[rule](date))
                    }
                }
                var bytes = intArrayFromString(pattern, false);
                if (bytes.length > maxsize) {
                    return 0
                }
                writeArrayToMemory(bytes, s);
                return bytes.length - 1
            }

            function _sysconf(name) {
                switch (name) {
                    case 30:
                        return 16384;
                    case 85:
                        var maxHeapSize = HEAPU8.length;
                        return maxHeapSize / 16384;
                    case 132:
                    case 133:
                    case 12:
                    case 137:
                    case 138:
                    case 15:
                    case 235:
                    case 16:
                    case 17:
                    case 18:
                    case 19:
                    case 20:
                    case 149:
                    case 13:
                    case 10:
                    case 236:
                    case 153:
                    case 9:
                    case 21:
                    case 22:
                    case 159:
                    case 154:
                    case 14:
                    case 77:
                    case 78:
                    case 139:
                    case 80:
                    case 81:
                    case 82:
                    case 68:
                    case 67:
                    case 164:
                    case 11:
                    case 29:
                    case 47:
                    case 48:
                    case 95:
                    case 52:
                    case 51:
                    case 46:
                    case 79:
                        return 200809;
                    case 27:
                    case 246:
                    case 127:
                    case 128:
                    case 23:
                    case 24:
                    case 160:
                    case 161:
                    case 181:
                    case 182:
                    case 242:
                    case 183:
                    case 184:
                    case 243:
                    case 244:
                    case 245:
                    case 165:
                    case 178:
                    case 179:
                    case 49:
                    case 50:
                    case 168:
                    case 169:
                    case 175:
                    case 170:
                    case 171:
                    case 172:
                    case 97:
                    case 76:
                    case 32:
                    case 173:
                    case 35:
                        return -1;
                    case 176:
                    case 177:
                    case 7:
                    case 155:
                    case 8:
                    case 157:
                    case 125:
                    case 126:
                    case 92:
                    case 93:
                    case 129:
                    case 130:
                    case 131:
                    case 94:
                    case 91:
                        return 1;
                    case 74:
                    case 60:
                    case 69:
                    case 70:
                    case 4:
                        return 1024;
                    case 31:
                    case 42:
                    case 72:
                        return 32;
                    case 87:
                    case 26:
                    case 33:
                        return 2147483647;
                    case 34:
                    case 1:
                        return 47839;
                    case 38:
                    case 36:
                        return 99;
                    case 43:
                    case 37:
                        return 2048;
                    case 0:
                        return 2097152;
                    case 3:
                        return 65536;
                    case 28:
                        return 32768;
                    case 44:
                        return 32767;
                    case 75:
                        return 16384;
                    case 39:
                        return 1e3;
                    case 89:
                        return 700;
                    case 71:
                        return 256;
                    case 40:
                        return 255;
                    case 2:
                        return 100;
                    case 180:
                        return 64;
                    case 25:
                        return 20;
                    case 5:
                        return 16;
                    case 6:
                        return 6;
                    case 73:
                        return 4;
                    case 84: {
                        if (typeof navigator === "object") return navigator["hardwareConcurrency"] || 1;
                        return 1
                    }
                }
                setErrNo(28);
                return -1
            }

            function _time(ptr) {
                var ret = Date.now() / 1e3 | 0;
                if (ptr) {
                    HEAP32[ptr >> 2] = ret
                }
                return ret
            }
            var FSNode = function(parent, name, mode, rdev) {
                if (!parent) {
                    parent = this
                }
                this.parent = parent;
                this.mount = parent.mount;
                this.mounted = null;
                this.id = FS.nextInode++;
                this.name = name;
                this.mode = mode;
                this.node_ops = {};
                this.stream_ops = {};
                this.rdev = rdev
            };
            var readMode = 292 | 73;
            var writeMode = 146;
            Object.defineProperties(FSNode.prototype, {
                read: {
                    get: function() {
                        return (this.mode & readMode) === readMode
                    },
                    set: function(val) {
                        val ? this.mode |= readMode : this.mode &= ~readMode
                    }
                },
                write: {
                    get: function() {
                        return (this.mode & writeMode) === writeMode
                    },
                    set: function(val) {
                        val ? this.mode |= writeMode : this.mode &= ~writeMode
                    }
                },
                isFolder: {
                    get: function() {
                        return FS.isDir(this.mode)
                    }
                },
                isDevice: {
                    get: function() {
                        return FS.isChrdev(this.mode)
                    }
                }
            });
            FS.FSNode = FSNode;
            FS.staticInit();
            Module["FS_createPath"] = FS.createPath;
            Module["FS_createDataFile"] = FS.createDataFile;
            Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
            Module["FS_createLazyFile"] = FS.createLazyFile;
            Module["FS_createDevice"] = FS.createDevice;
            Module["FS_unlink"] = FS.unlink;
            var ASSERTIONS = false;

            function intArrayFromString(stringy, dontAddNull, length) {
                var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
                var u8array = new Array(len);
                var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
                if (dontAddNull) u8array.length = numBytesWritten;
                return u8array
            }
            __ATINIT__.push({
                func: function() {
                    ___wasm_call_ctors()
                }
            });
            var asmLibraryArg = {
                "__sys_access": ___sys_access,
                "__sys_chdir": ___sys_chdir,
                "__sys_chmod": ___sys_chmod,
                "__sys_dup2": ___sys_dup2,
                "__sys_fcntl64": ___sys_fcntl64,
                "__sys_fstat64": ___sys_fstat64,
                "__sys_ftruncate64": ___sys_ftruncate64,
                "__sys_getcwd": ___sys_getcwd,
                "__sys_getdents64": ___sys_getdents64,
                "__sys_getpid": ___sys_getpid,
                "__sys_getrusage": ___sys_getrusage,
                "__sys_getuid32": ___sys_getuid32,
                "__sys_ioctl": ___sys_ioctl,
                "__sys_mkdir": ___sys_mkdir,
                "__sys_mmap2": ___sys_mmap2,
                "__sys_munmap": ___sys_munmap,
                "__sys_open": ___sys_open,
                "__sys_poll": ___sys_poll,
                "__sys_prlimit64": ___sys_prlimit64,
                "__sys_read": ___sys_read,
                "__sys_readlink": ___sys_readlink,
                "__sys_rename": ___sys_rename,
                "__sys_rmdir": ___sys_rmdir,
                "__sys_stat64": ___sys_stat64,
                "__sys_ugetrlimit": ___sys_ugetrlimit,
                "__sys_umask": ___sys_umask,
                "__sys_unlink": ___sys_unlink,
                "__sys_wait4": ___sys_wait4,
                "abort": _abort,
                "asctime_r": _asctime_r,
                "clock_gettime": _clock_gettime,
                "ctime_r": _ctime_r,
                "dladdr": _dladdr,
                "dlclose": _dlclose,
                "dlerror": _dlerror,
                "dlopen": _dlopen,
                "dlsym": _dlsym,
                "emscripten_longjmp": _emscripten_longjmp,
                "emscripten_longjmp_jmpbuf": _emscripten_longjmp_jmpbuf,
                "emscripten_memcpy_big": _emscripten_memcpy_big,
                "emscripten_resize_heap": _emscripten_resize_heap,
                "environ_get": _environ_get,
                "environ_sizes_get": _environ_sizes_get,
                "execve": _execve,
                "exit": _exit,
                "fd_close": _fd_close,
                "fd_fdstat_get": _fd_fdstat_get,
                "fd_read": _fd_read,
                "fd_seek": _fd_seek,
                "fd_write": _fd_write,
                "fork": _fork,
                "getTempRet0": _getTempRet0,
                "getpwnam": _getpwnam,
                "gettimeofday": _gettimeofday,
                "invoke_i": invoke_i,
                "invoke_ii": invoke_ii,
                "invoke_iii": invoke_iii,
                "invoke_iiii": invoke_iiii,
                "invoke_iiiii": invoke_iiiii,
                "invoke_iiiiii": invoke_iiiiii,
                "invoke_iiiiiii": invoke_iiiiiii,
                "invoke_iiiiiiii": invoke_iiiiiiii,
                "invoke_iiiiiiiii": invoke_iiiiiiiii,
                "invoke_iiiiiiiiii": invoke_iiiiiiiiii,
                "invoke_iiiiiiiiiii": invoke_iiiiiiiiiii,
                "invoke_iiiiiiiiiiii": invoke_iiiiiiiiiiii,
                "invoke_iij": invoke_iij,
                "invoke_ij": invoke_ij,
                "invoke_v": invoke_v,
                "invoke_vi": invoke_vi,
                "invoke_vii": invoke_vii,
                "invoke_viii": invoke_viii,
                "localtime_r": _localtime_r,
                "memory": wasmMemory,
                "mktime": _mktime,
                "nanosleep": _nanosleep,
                "setTempRet0": _setTempRet0,
                "signal": _signal,
                "strftime": _strftime,
                "sysconf": _sysconf,
                "time": _time,
                "tzset": _tzset
            };
            var asm = createWasm();
            var ___wasm_call_ctors = Module["___wasm_call_ctors"] = function() {
                return (___wasm_call_ctors = Module["___wasm_call_ctors"] = Module["asm"]["__wasm_call_ctors"]).apply(null, arguments)
            };
            var _malloc = Module["_malloc"] = function() {
                return (_malloc = Module["_malloc"] = Module["asm"]["malloc"]).apply(null, arguments)
            };
            var _PL_initialise = Module["_PL_initialise"] = function() {
                return (_PL_initialise = Module["_PL_initialise"] = Module["asm"]["PL_initialise"]).apply(null, arguments)
            };
            var _PL_halt = Module["_PL_halt"] = function() {
                return (_PL_halt = Module["_PL_halt"] = Module["asm"]["PL_halt"]).apply(null, arguments)
            };
            var _PL_toplevel = Module["_PL_toplevel"] = function() {
                return (_PL_toplevel = Module["_PL_toplevel"] = Module["asm"]["PL_toplevel"]).apply(null, arguments)
            };
            var _PL_unregister_blob_type = Module["_PL_unregister_blob_type"] = function() {
                return (_PL_unregister_blob_type = Module["_PL_unregister_blob_type"] = Module["asm"]["PL_unregister_blob_type"]).apply(null, arguments)
            };
            var _PL_unregister_atom = Module["_PL_unregister_atom"] = function() {
                return (_PL_unregister_atom = Module["_PL_unregister_atom"] = Module["asm"]["PL_unregister_atom"]).apply(null, arguments)
            };
            var _PL_agc_hook = Module["_PL_agc_hook"] = function() {
                return (_PL_agc_hook = Module["_PL_agc_hook"] = Module["asm"]["PL_agc_hook"]).apply(null, arguments)
            };
            var _PL_register_atom = Module["_PL_register_atom"] = function() {
                return (_PL_register_atom = Module["_PL_register_atom"] = Module["asm"]["PL_register_atom"]).apply(null, arguments)
            };
            var _PL_register_foreign_in_module = Module["_PL_register_foreign_in_module"] = function() {
                return (_PL_register_foreign_in_module = Module["_PL_register_foreign_in_module"] = Module["asm"]["PL_register_foreign_in_module"]).apply(null, arguments)
            };
            var _PL_unify_uint64 = Module["_PL_unify_uint64"] = function() {
                return (_PL_unify_uint64 = Module["_PL_unify_uint64"] = Module["asm"]["PL_unify_uint64"]).apply(null, arguments)
            };
            var _PL_rewind_foreign_frame = Module["_PL_rewind_foreign_frame"] = function() {
                return (_PL_rewind_foreign_frame = Module["_PL_rewind_foreign_frame"] = Module["asm"]["PL_rewind_foreign_frame"]).apply(null, arguments)
            };
            var _PL_cons_functor = Module["_PL_cons_functor"] = function() {
                return (_PL_cons_functor = Module["_PL_cons_functor"] = Module["asm"]["PL_cons_functor"]).apply(null, arguments)
            };
            var _PL_unify_nil = Module["_PL_unify_nil"] = function() {
                return (_PL_unify_nil = Module["_PL_unify_nil"] = Module["asm"]["PL_unify_nil"]).apply(null, arguments)
            };
            var _PL_open_foreign_frame = Module["_PL_open_foreign_frame"] = function() {
                return (_PL_open_foreign_frame = Module["_PL_open_foreign_frame"] = Module["asm"]["PL_open_foreign_frame"]).apply(null, arguments)
            };
            var _PL_close_foreign_frame = Module["_PL_close_foreign_frame"] = function() {
                return (_PL_close_foreign_frame = Module["_PL_close_foreign_frame"] = Module["asm"]["PL_close_foreign_frame"]).apply(null, arguments)
            };
            var _PL_discard_foreign_frame = Module["_PL_discard_foreign_frame"] = function() {
                return (_PL_discard_foreign_frame = Module["_PL_discard_foreign_frame"] = Module["asm"]["PL_discard_foreign_frame"]).apply(null, arguments)
            };
            var _PL_open_query = Module["_PL_open_query"] = function() {
                return (_PL_open_query = Module["_PL_open_query"] = Module["asm"]["PL_open_query"]).apply(null, arguments)
            };
            var _PL_next_solution = Module["_PL_next_solution"] = function() {
                return (_PL_next_solution = Module["_PL_next_solution"] = Module["asm"]["PL_next_solution"]).apply(null, arguments)
            };
            var _PL_cut_query = Module["_PL_cut_query"] = function() {
                return (_PL_cut_query = Module["_PL_cut_query"] = Module["asm"]["PL_cut_query"]).apply(null, arguments)
            };
            var _PL_raise_exception = Module["_PL_raise_exception"] = function() {
                return (_PL_raise_exception = Module["_PL_raise_exception"] = Module["asm"]["PL_raise_exception"]).apply(null, arguments)
            };
            var _PL_predicate = Module["_PL_predicate"] = function() {
                return (_PL_predicate = Module["_PL_predicate"] = Module["asm"]["PL_predicate"]).apply(null, arguments)
            };
            var _PL_cons_functor_v = Module["_PL_cons_functor_v"] = function() {
                return (_PL_cons_functor_v = Module["_PL_cons_functor_v"] = Module["asm"]["PL_cons_functor_v"]).apply(null, arguments)
            };
            var _PL_warning = Module["_PL_warning"] = function() {
                return (_PL_warning = Module["_PL_warning"] = Module["asm"]["PL_warning"]).apply(null, arguments)
            };
            var _PL_exception = Module["_PL_exception"] = function() {
                return (_PL_exception = Module["_PL_exception"] = Module["asm"]["PL_exception"]).apply(null, arguments)
            };
            var _PL_new_term_refs = Module["_PL_new_term_refs"] = function() {
                return (_PL_new_term_refs = Module["_PL_new_term_refs"] = Module["asm"]["PL_new_term_refs"]).apply(null, arguments)
            };
            var _PL_new_term_ref = Module["_PL_new_term_ref"] = function() {
                return (_PL_new_term_ref = Module["_PL_new_term_ref"] = Module["asm"]["PL_new_term_ref"]).apply(null, arguments)
            };
            var _PL_reset_term_refs = Module["_PL_reset_term_refs"] = function() {
                return (_PL_reset_term_refs = Module["_PL_reset_term_refs"] = Module["asm"]["PL_reset_term_refs"]).apply(null, arguments)
            };
            var _PL_copy_term_ref = Module["_PL_copy_term_ref"] = function() {
                return (_PL_copy_term_ref = Module["_PL_copy_term_ref"] = Module["asm"]["PL_copy_term_ref"]).apply(null, arguments)
            };
            var _PL_new_atom = Module["_PL_new_atom"] = function() {
                return (_PL_new_atom = Module["_PL_new_atom"] = Module["asm"]["PL_new_atom"]).apply(null, arguments)
            };
            var _PL_new_atom_nchars = Module["_PL_new_atom_nchars"] = function() {
                return (_PL_new_atom_nchars = Module["_PL_new_atom_nchars"] = Module["asm"]["PL_new_atom_nchars"]).apply(null, arguments)
            };
            var _PL_new_atom_mbchars = Module["_PL_new_atom_mbchars"] = function() {
                return (_PL_new_atom_mbchars = Module["_PL_new_atom_mbchars"] = Module["asm"]["PL_new_atom_mbchars"]).apply(null, arguments)
            };
            var _PL_new_functor = Module["_PL_new_functor"] = function() {
                return (_PL_new_functor = Module["_PL_new_functor"] = Module["asm"]["PL_new_functor"]).apply(null, arguments)
            };
            var _PL_functor_name = Module["_PL_functor_name"] = function() {
                return (_PL_functor_name = Module["_PL_functor_name"] = Module["asm"]["PL_functor_name"]).apply(null, arguments)
            };
            var _PL_functor_arity = Module["_PL_functor_arity"] = function() {
                return (_PL_functor_arity = Module["_PL_functor_arity"] = Module["asm"]["PL_functor_arity"]).apply(null, arguments)
            };
            var _PL_new_atom_wchars = Module["_PL_new_atom_wchars"] = function() {
                return (_PL_new_atom_wchars = Module["_PL_new_atom_wchars"] = Module["asm"]["PL_new_atom_wchars"]).apply(null, arguments)
            };
            var _PL_unify_wchars = Module["_PL_unify_wchars"] = function() {
                return (_PL_unify_wchars = Module["_PL_unify_wchars"] = Module["asm"]["PL_unify_wchars"]).apply(null, arguments)
            };
            var _PL_unify_wchars_diff = Module["_PL_unify_wchars_diff"] = function() {
                return (_PL_unify_wchars_diff = Module["_PL_unify_wchars_diff"] = Module["asm"]["PL_unify_wchars_diff"]).apply(null, arguments)
            };
            var _PL_atom_chars = Module["_PL_atom_chars"] = function() {
                return (_PL_atom_chars = Module["_PL_atom_chars"] = Module["asm"]["PL_atom_chars"]).apply(null, arguments)
            };
            var _PL_atom_nchars = Module["_PL_atom_nchars"] = function() {
                return (_PL_atom_nchars = Module["_PL_atom_nchars"] = Module["asm"]["PL_atom_nchars"]).apply(null, arguments)
            };
            var _PL_atom_wchars = Module["_PL_atom_wchars"] = function() {
                return (_PL_atom_wchars = Module["_PL_atom_wchars"] = Module["asm"]["PL_atom_wchars"]).apply(null, arguments)
            };
            var _PL_is_integer = Module["_PL_is_integer"] = function() {
                return (_PL_is_integer = Module["_PL_is_integer"] = Module["asm"]["PL_is_integer"]).apply(null, arguments)
            };
            var _PL_get_chars = Module["_PL_get_chars"] = function() {
                return (_PL_get_chars = Module["_PL_get_chars"] = Module["asm"]["PL_get_chars"]).apply(null, arguments)
            };
            var _PL_unify_float = Module["_PL_unify_float"] = function() {
                return (_PL_unify_float = Module["_PL_unify_float"] = Module["asm"]["PL_unify_float"]).apply(null, arguments)
            };
            var _PL_unify_chars = Module["_PL_unify_chars"] = function() {
                return (_PL_unify_chars = Module["_PL_unify_chars"] = Module["asm"]["PL_unify_chars"]).apply(null, arguments)
            };
            var _PL_compare = Module["_PL_compare"] = function() {
                return (_PL_compare = Module["_PL_compare"] = Module["asm"]["PL_compare"]).apply(null, arguments)
            };
            var _PL_same_compound = Module["_PL_same_compound"] = function() {
                return (_PL_same_compound = Module["_PL_same_compound"] = Module["asm"]["PL_same_compound"]).apply(null, arguments)
            };
            var _PL_cons_list = Module["_PL_cons_list"] = function() {
                return (_PL_cons_list = Module["_PL_cons_list"] = Module["asm"]["PL_cons_list"]).apply(null, arguments)
            };
            var _PL_get_bool = Module["_PL_get_bool"] = function() {
                return (_PL_get_bool = Module["_PL_get_bool"] = Module["asm"]["PL_get_bool"]).apply(null, arguments)
            };
            var _PL_get_atom = Module["_PL_get_atom"] = function() {
                return (_PL_get_atom = Module["_PL_get_atom"] = Module["asm"]["PL_get_atom"]).apply(null, arguments)
            };
            var _PL_get_atom_chars = Module["_PL_get_atom_chars"] = function() {
                return (_PL_get_atom_chars = Module["_PL_get_atom_chars"] = Module["asm"]["PL_get_atom_chars"]).apply(null, arguments)
            };
            var _PL_get_atom_nchars = Module["_PL_get_atom_nchars"] = function() {
                return (_PL_get_atom_nchars = Module["_PL_get_atom_nchars"] = Module["asm"]["PL_get_atom_nchars"]).apply(null, arguments)
            };
            var _PL_get_list_nchars = Module["_PL_get_list_nchars"] = function() {
                return (_PL_get_list_nchars = Module["_PL_get_list_nchars"] = Module["asm"]["PL_get_list_nchars"]).apply(null, arguments)
            };
            var _PL_get_list_chars = Module["_PL_get_list_chars"] = function() {
                return (_PL_get_list_chars = Module["_PL_get_list_chars"] = Module["asm"]["PL_get_list_chars"]).apply(null, arguments)
            };
            var _PL_get_wchars = Module["_PL_get_wchars"] = function() {
                return (_PL_get_wchars = Module["_PL_get_wchars"] = Module["asm"]["PL_get_wchars"]).apply(null, arguments)
            };
            var _PL_get_nchars = Module["_PL_get_nchars"] = function() {
                return (_PL_get_nchars = Module["_PL_get_nchars"] = Module["asm"]["PL_get_nchars"]).apply(null, arguments)
            };
            var _PL_quote = Module["_PL_quote"] = function() {
                return (_PL_quote = Module["_PL_quote"] = Module["asm"]["PL_quote"]).apply(null, arguments)
            };
            var _PL_get_integer = Module["_PL_get_integer"] = function() {
                return (_PL_get_integer = Module["_PL_get_integer"] = Module["asm"]["PL_get_integer"]).apply(null, arguments)
            };
            var _PL_get_long = Module["_PL_get_long"] = function() {
                return (_PL_get_long = Module["_PL_get_long"] = Module["asm"]["PL_get_long"]).apply(null, arguments)
            };
            var _PL_get_int64 = Module["_PL_get_int64"] = function() {
                return (_PL_get_int64 = Module["_PL_get_int64"] = Module["asm"]["PL_get_int64"]).apply(null, arguments)
            };
            var _PL_get_intptr = Module["_PL_get_intptr"] = function() {
                return (_PL_get_intptr = Module["_PL_get_intptr"] = Module["asm"]["PL_get_intptr"]).apply(null, arguments)
            };
            var _PL_get_float = Module["_PL_get_float"] = function() {
                return (_PL_get_float = Module["_PL_get_float"] = Module["asm"]["PL_get_float"]).apply(null, arguments)
            };
            var _PL_clear_exception = Module["_PL_clear_exception"] = function() {
                return (_PL_clear_exception = Module["_PL_clear_exception"] = Module["asm"]["PL_clear_exception"]).apply(null, arguments)
            };
            var _PL_get_pointer = Module["_PL_get_pointer"] = function() {
                return (_PL_get_pointer = Module["_PL_get_pointer"] = Module["asm"]["PL_get_pointer"]).apply(null, arguments)
            };
            var _PL_get_name_arity = Module["_PL_get_name_arity"] = function() {
                return (_PL_get_name_arity = Module["_PL_get_name_arity"] = Module["asm"]["PL_get_name_arity"]).apply(null, arguments)
            };
            var _PL_get_compound_name_arity = Module["_PL_get_compound_name_arity"] = function() {
                return (_PL_get_compound_name_arity = Module["_PL_get_compound_name_arity"] = Module["asm"]["PL_get_compound_name_arity"]).apply(null, arguments)
            };
            var _PL_get_functor = Module["_PL_get_functor"] = function() {
                return (_PL_get_functor = Module["_PL_get_functor"] = Module["asm"]["PL_get_functor"]).apply(null, arguments)
            };
            var _PL_get_module = Module["_PL_get_module"] = function() {
                return (_PL_get_module = Module["_PL_get_module"] = Module["asm"]["PL_get_module"]).apply(null, arguments)
            };
            var _PL_get_arg = Module["_PL_get_arg"] = function() {
                return (_PL_get_arg = Module["_PL_get_arg"] = Module["asm"]["PL_get_arg"]).apply(null, arguments)
            };
            var _PL_get_list = Module["_PL_get_list"] = function() {
                return (_PL_get_list = Module["_PL_get_list"] = Module["asm"]["PL_get_list"]).apply(null, arguments)
            };
            var _PL_get_head = Module["_PL_get_head"] = function() {
                return (_PL_get_head = Module["_PL_get_head"] = Module["asm"]["PL_get_head"]).apply(null, arguments)
            };
            var _PL_get_tail = Module["_PL_get_tail"] = function() {
                return (_PL_get_tail = Module["_PL_get_tail"] = Module["asm"]["PL_get_tail"]).apply(null, arguments)
            };
            var _PL_get_nil = Module["_PL_get_nil"] = function() {
                return (_PL_get_nil = Module["_PL_get_nil"] = Module["asm"]["PL_get_nil"]).apply(null, arguments)
            };
            var _PL_skip_list = Module["_PL_skip_list"] = function() {
                return (_PL_skip_list = Module["_PL_skip_list"] = Module["asm"]["PL_skip_list"]).apply(null, arguments)
            };
            var _PL_is_variable = Module["_PL_is_variable"] = function() {
                return (_PL_is_variable = Module["_PL_is_variable"] = Module["asm"]["PL_is_variable"]).apply(null, arguments)
            };
            var _PL_is_atom = Module["_PL_is_atom"] = function() {
                return (_PL_is_atom = Module["_PL_is_atom"] = Module["asm"]["PL_is_atom"]).apply(null, arguments)
            };
            var _PL_is_blob = Module["_PL_is_blob"] = function() {
                return (_PL_is_blob = Module["_PL_is_blob"] = Module["asm"]["PL_is_blob"]).apply(null, arguments)
            };
            var _PL_is_float = Module["_PL_is_float"] = function() {
                return (_PL_is_float = Module["_PL_is_float"] = Module["asm"]["PL_is_float"]).apply(null, arguments)
            };
            var _PL_is_compound = Module["_PL_is_compound"] = function() {
                return (_PL_is_compound = Module["_PL_is_compound"] = Module["asm"]["PL_is_compound"]).apply(null, arguments)
            };
            var _PL_is_callable = Module["_PL_is_callable"] = function() {
                return (_PL_is_callable = Module["_PL_is_callable"] = Module["asm"]["PL_is_callable"]).apply(null, arguments)
            };
            var _PL_is_functor = Module["_PL_is_functor"] = function() {
                return (_PL_is_functor = Module["_PL_is_functor"] = Module["asm"]["PL_is_functor"]).apply(null, arguments)
            };
            var _PL_is_list = Module["_PL_is_list"] = function() {
                return (_PL_is_list = Module["_PL_is_list"] = Module["asm"]["PL_is_list"]).apply(null, arguments)
            };
            var _PL_is_pair = Module["_PL_is_pair"] = function() {
                return (_PL_is_pair = Module["_PL_is_pair"] = Module["asm"]["PL_is_pair"]).apply(null, arguments)
            };
            var _PL_is_atomic = Module["_PL_is_atomic"] = function() {
                return (_PL_is_atomic = Module["_PL_is_atomic"] = Module["asm"]["PL_is_atomic"]).apply(null, arguments)
            };
            var _PL_is_number = Module["_PL_is_number"] = function() {
                return (_PL_is_number = Module["_PL_is_number"] = Module["asm"]["PL_is_number"]).apply(null, arguments)
            };
            var _PL_is_string = Module["_PL_is_string"] = function() {
                return (_PL_is_string = Module["_PL_is_string"] = Module["asm"]["PL_is_string"]).apply(null, arguments)
            };
            var _PL_unify_string_chars = Module["_PL_unify_string_chars"] = function() {
                return (_PL_unify_string_chars = Module["_PL_unify_string_chars"] = Module["asm"]["PL_unify_string_chars"]).apply(null, arguments)
            };
            var _PL_unify_string_nchars = Module["_PL_unify_string_nchars"] = function() {
                return (_PL_unify_string_nchars = Module["_PL_unify_string_nchars"] = Module["asm"]["PL_unify_string_nchars"]).apply(null, arguments)
            };
            var _PL_put_variable = Module["_PL_put_variable"] = function() {
                return (_PL_put_variable = Module["_PL_put_variable"] = Module["asm"]["PL_put_variable"]).apply(null, arguments)
            };
            var _PL_put_atom = Module["_PL_put_atom"] = function() {
                return (_PL_put_atom = Module["_PL_put_atom"] = Module["asm"]["PL_put_atom"]).apply(null, arguments)
            };
            var _PL_put_bool = Module["_PL_put_bool"] = function() {
                return (_PL_put_bool = Module["_PL_put_bool"] = Module["asm"]["PL_put_bool"]).apply(null, arguments)
            };
            var _PL_put_atom_chars = Module["_PL_put_atom_chars"] = function() {
                return (_PL_put_atom_chars = Module["_PL_put_atom_chars"] = Module["asm"]["PL_put_atom_chars"]).apply(null, arguments)
            };
            var _PL_put_atom_nchars = Module["_PL_put_atom_nchars"] = function() {
                return (_PL_put_atom_nchars = Module["_PL_put_atom_nchars"] = Module["asm"]["PL_put_atom_nchars"]).apply(null, arguments)
            };
            var _PL_put_string_chars = Module["_PL_put_string_chars"] = function() {
                return (_PL_put_string_chars = Module["_PL_put_string_chars"] = Module["asm"]["PL_put_string_chars"]).apply(null, arguments)
            };
            var _PL_put_string_nchars = Module["_PL_put_string_nchars"] = function() {
                return (_PL_put_string_nchars = Module["_PL_put_string_nchars"] = Module["asm"]["PL_put_string_nchars"]).apply(null, arguments)
            };
            var _PL_put_chars = Module["_PL_put_chars"] = function() {
                return (_PL_put_chars = Module["_PL_put_chars"] = Module["asm"]["PL_put_chars"]).apply(null, arguments)
            };
            var _PL_put_list_ncodes = Module["_PL_put_list_ncodes"] = function() {
                return (_PL_put_list_ncodes = Module["_PL_put_list_ncodes"] = Module["asm"]["PL_put_list_ncodes"]).apply(null, arguments)
            };
            var _PL_put_list_nchars = Module["_PL_put_list_nchars"] = function() {
                return (_PL_put_list_nchars = Module["_PL_put_list_nchars"] = Module["asm"]["PL_put_list_nchars"]).apply(null, arguments)
            };
            var _PL_put_list_chars = Module["_PL_put_list_chars"] = function() {
                return (_PL_put_list_chars = Module["_PL_put_list_chars"] = Module["asm"]["PL_put_list_chars"]).apply(null, arguments)
            };
            var _PL_put_int64 = Module["_PL_put_int64"] = function() {
                return (_PL_put_int64 = Module["_PL_put_int64"] = Module["asm"]["PL_put_int64"]).apply(null, arguments)
            };
            var _PL_put_integer = Module["_PL_put_integer"] = function() {
                return (_PL_put_integer = Module["_PL_put_integer"] = Module["asm"]["PL_put_integer"]).apply(null, arguments)
            };
            var _PL_put_pointer = Module["_PL_put_pointer"] = function() {
                return (_PL_put_pointer = Module["_PL_put_pointer"] = Module["asm"]["PL_put_pointer"]).apply(null, arguments)
            };
            var _PL_put_float = Module["_PL_put_float"] = function() {
                return (_PL_put_float = Module["_PL_put_float"] = Module["asm"]["PL_put_float"]).apply(null, arguments)
            };
            var _PL_put_functor = Module["_PL_put_functor"] = function() {
                return (_PL_put_functor = Module["_PL_put_functor"] = Module["asm"]["PL_put_functor"]).apply(null, arguments)
            };
            var _PL_put_list = Module["_PL_put_list"] = function() {
                return (_PL_put_list = Module["_PL_put_list"] = Module["asm"]["PL_put_list"]).apply(null, arguments)
            };
            var _PL_put_nil = Module["_PL_put_nil"] = function() {
                return (_PL_put_nil = Module["_PL_put_nil"] = Module["asm"]["PL_put_nil"]).apply(null, arguments)
            };
            var _PL_put_term = Module["_PL_put_term"] = function() {
                return (_PL_put_term = Module["_PL_put_term"] = Module["asm"]["PL_put_term"]).apply(null, arguments)
            };
            var _PL_unify_atom = Module["_PL_unify_atom"] = function() {
                return (_PL_unify_atom = Module["_PL_unify_atom"] = Module["asm"]["PL_unify_atom"]).apply(null, arguments)
            };
            var _PL_unify_compound = Module["_PL_unify_compound"] = function() {
                return (_PL_unify_compound = Module["_PL_unify_compound"] = Module["asm"]["PL_unify_compound"]).apply(null, arguments)
            };
            var _PL_unify_functor = Module["_PL_unify_functor"] = function() {
                return (_PL_unify_functor = Module["_PL_unify_functor"] = Module["asm"]["PL_unify_functor"]).apply(null, arguments)
            };
            var _PL_unify_atom_chars = Module["_PL_unify_atom_chars"] = function() {
                return (_PL_unify_atom_chars = Module["_PL_unify_atom_chars"] = Module["asm"]["PL_unify_atom_chars"]).apply(null, arguments)
            };
            var _PL_unify_atom_nchars = Module["_PL_unify_atom_nchars"] = function() {
                return (_PL_unify_atom_nchars = Module["_PL_unify_atom_nchars"] = Module["asm"]["PL_unify_atom_nchars"]).apply(null, arguments)
            };
            var _PL_unify_list_ncodes = Module["_PL_unify_list_ncodes"] = function() {
                return (_PL_unify_list_ncodes = Module["_PL_unify_list_ncodes"] = Module["asm"]["PL_unify_list_ncodes"]).apply(null, arguments)
            };
            var _PL_unify_list_nchars = Module["_PL_unify_list_nchars"] = function() {
                return (_PL_unify_list_nchars = Module["_PL_unify_list_nchars"] = Module["asm"]["PL_unify_list_nchars"]).apply(null, arguments)
            };
            var _PL_unify_list_chars = Module["_PL_unify_list_chars"] = function() {
                return (_PL_unify_list_chars = Module["_PL_unify_list_chars"] = Module["asm"]["PL_unify_list_chars"]).apply(null, arguments)
            };
            var _PL_unify_integer = Module["_PL_unify_integer"] = function() {
                return (_PL_unify_integer = Module["_PL_unify_integer"] = Module["asm"]["PL_unify_integer"]).apply(null, arguments)
            };
            var _PL_unify_int64 = Module["_PL_unify_int64"] = function() {
                return (_PL_unify_int64 = Module["_PL_unify_int64"] = Module["asm"]["PL_unify_int64"]).apply(null, arguments)
            };
            var _PL_unify_pointer = Module["_PL_unify_pointer"] = function() {
                return (_PL_unify_pointer = Module["_PL_unify_pointer"] = Module["asm"]["PL_unify_pointer"]).apply(null, arguments)
            };
            var _PL_unify_bool = Module["_PL_unify_bool"] = function() {
                return (_PL_unify_bool = Module["_PL_unify_bool"] = Module["asm"]["PL_unify_bool"]).apply(null, arguments)
            };
            var _PL_unify_arg = Module["_PL_unify_arg"] = function() {
                return (_PL_unify_arg = Module["_PL_unify_arg"] = Module["asm"]["PL_unify_arg"]).apply(null, arguments)
            };
            var _PL_unify_list = Module["_PL_unify_list"] = function() {
                return (_PL_unify_list = Module["_PL_unify_list"] = Module["asm"]["PL_unify_list"]).apply(null, arguments)
            };
            var _PL_unify_term = Module["_PL_unify_term"] = function() {
                return (_PL_unify_term = Module["_PL_unify_term"] = Module["asm"]["PL_unify_term"]).apply(null, arguments)
            };
            var _PL_unify_blob = Module["_PL_unify_blob"] = function() {
                return (_PL_unify_blob = Module["_PL_unify_blob"] = Module["asm"]["PL_unify_blob"]).apply(null, arguments)
            };
            var _PL_put_blob = Module["_PL_put_blob"] = function() {
                return (_PL_put_blob = Module["_PL_put_blob"] = Module["asm"]["PL_put_blob"]).apply(null, arguments)
            };
            var _PL_get_blob = Module["_PL_get_blob"] = function() {
                return (_PL_get_blob = Module["_PL_get_blob"] = Module["asm"]["PL_get_blob"]).apply(null, arguments)
            };
            var _PL_blob_data = Module["_PL_blob_data"] = function() {
                return (_PL_blob_data = Module["_PL_blob_data"] = Module["asm"]["PL_blob_data"]).apply(null, arguments)
            };
            var _PL_term_type = Module["_PL_term_type"] = function() {
                return (_PL_term_type = Module["_PL_term_type"] = Module["asm"]["PL_term_type"]).apply(null, arguments)
            };
            var _PL_unify = Module["_PL_unify"] = function() {
                return (_PL_unify = Module["_PL_unify"] = Module["asm"]["PL_unify"]).apply(null, arguments)
            };
            var _PL_strip_module = Module["_PL_strip_module"] = function() {
                return (_PL_strip_module = Module["_PL_strip_module"] = Module["asm"]["PL_strip_module"]).apply(null, arguments)
            };
            var _PL_context = Module["_PL_context"] = function() {
                return (_PL_context = Module["_PL_context"] = Module["asm"]["PL_context"]).apply(null, arguments)
            };
            var _PL_module_name = Module["_PL_module_name"] = function() {
                return (_PL_module_name = Module["_PL_module_name"] = Module["asm"]["PL_module_name"]).apply(null, arguments)
            };
            var _PL_new_module = Module["_PL_new_module"] = function() {
                return (_PL_new_module = Module["_PL_new_module"] = Module["asm"]["PL_new_module"]).apply(null, arguments)
            };
            var _PL_pred = Module["_PL_pred"] = function() {
                return (_PL_pred = Module["_PL_pred"] = Module["asm"]["PL_pred"]).apply(null, arguments)
            };
            var _PL_predicate_info = Module["_PL_predicate_info"] = function() {
                return (_PL_predicate_info = Module["_PL_predicate_info"] = Module["asm"]["PL_predicate_info"]).apply(null, arguments)
            };
            var _PL_call_predicate = Module["_PL_call_predicate"] = function() {
                return (_PL_call_predicate = Module["_PL_call_predicate"] = Module["asm"]["PL_call_predicate"]).apply(null, arguments)
            };
            var _PL_call = Module["_PL_call"] = function() {
                return (_PL_call = Module["_PL_call"] = Module["asm"]["PL_call"]).apply(null, arguments)
            };
            var _PL_foreign_context = Module["_PL_foreign_context"] = function() {
                return (_PL_foreign_context = Module["_PL_foreign_context"] = Module["asm"]["PL_foreign_context"]).apply(null, arguments)
            };
            var _PL_foreign_context_address = Module["_PL_foreign_context_address"] = function() {
                return (_PL_foreign_context_address = Module["_PL_foreign_context_address"] = Module["asm"]["PL_foreign_context_address"]).apply(null, arguments)
            };
            var _PL_foreign_control = Module["_PL_foreign_control"] = function() {
                return (_PL_foreign_control = Module["_PL_foreign_control"] = Module["asm"]["PL_foreign_control"]).apply(null, arguments)
            };
            var _PL_foreign_context_predicate = Module["_PL_foreign_context_predicate"] = function() {
                return (_PL_foreign_context_predicate = Module["_PL_foreign_context_predicate"] = Module["asm"]["PL_foreign_context_predicate"]).apply(null, arguments)
            };
            var _PL_throw = Module["_PL_throw"] = function() {
                return (_PL_throw = Module["_PL_throw"] = Module["asm"]["PL_throw"]).apply(null, arguments)
            };
            var _PL_register_extensions_in_module = Module["_PL_register_extensions_in_module"] = function() {
                return (_PL_register_extensions_in_module = Module["_PL_register_extensions_in_module"] = Module["asm"]["PL_register_extensions_in_module"]).apply(null, arguments)
            };
            var _PL_register_extensions = Module["_PL_register_extensions"] = function() {
                return (_PL_register_extensions = Module["_PL_register_extensions"] = Module["asm"]["PL_register_extensions"]).apply(null, arguments)
            };
            var _PL_register_foreign = Module["_PL_register_foreign"] = function() {
                return (_PL_register_foreign = Module["_PL_register_foreign"] = Module["asm"]["PL_register_foreign"]).apply(null, arguments)
            };
            var _free = Module["_free"] = function() {
                return (_free = Module["_free"] = Module["asm"]["free"]).apply(null, arguments)
            };
            var _memset = Module["_memset"] = function() {
                return (_memset = Module["_memset"] = Module["asm"]["memset"]).apply(null, arguments)
            };
            var _PL_handle_signals = Module["_PL_handle_signals"] = function() {
                return (_PL_handle_signals = Module["_PL_handle_signals"] = Module["asm"]["PL_handle_signals"]).apply(null, arguments)
            };
            var _realloc = Module["_realloc"] = function() {
                return (_realloc = Module["_realloc"] = Module["asm"]["realloc"]).apply(null, arguments)
            };
            var _PL_permission_error = Module["_PL_permission_error"] = function() {
                return (_PL_permission_error = Module["_PL_permission_error"] = Module["asm"]["PL_permission_error"]).apply(null, arguments)
            };
            var _PL_domain_error = Module["_PL_domain_error"] = function() {
                return (_PL_domain_error = Module["_PL_domain_error"] = Module["asm"]["PL_domain_error"]).apply(null, arguments)
            };
            var _PL_type_error = Module["_PL_type_error"] = function() {
                return (_PL_type_error = Module["_PL_type_error"] = Module["asm"]["PL_type_error"]).apply(null, arguments)
            };
            var _testSetjmp = Module["_testSetjmp"] = function() {
                return (_testSetjmp = Module["_testSetjmp"] = Module["asm"]["testSetjmp"]).apply(null, arguments)
            };
            var _saveSetjmp = Module["_saveSetjmp"] = function() {
                return (_saveSetjmp = Module["_saveSetjmp"] = Module["asm"]["saveSetjmp"]).apply(null, arguments)
            };
            var _PL_uninstantiation_error = Module["_PL_uninstantiation_error"] = function() {
                return (_PL_uninstantiation_error = Module["_PL_uninstantiation_error"] = Module["asm"]["PL_uninstantiation_error"]).apply(null, arguments)
            };
            var _PL_representation_error = Module["_PL_representation_error"] = function() {
                return (_PL_representation_error = Module["_PL_representation_error"] = Module["asm"]["PL_representation_error"]).apply(null, arguments)
            };
            var _PL_get_integer_ex = Module["_PL_get_integer_ex"] = function() {
                return (_PL_get_integer_ex = Module["_PL_get_integer_ex"] = Module["asm"]["PL_get_integer_ex"]).apply(null, arguments)
            };
            var _PL_get_long_ex = Module["_PL_get_long_ex"] = function() {
                return (_PL_get_long_ex = Module["_PL_get_long_ex"] = Module["asm"]["PL_get_long_ex"]).apply(null, arguments)
            };
            var _PL_get_int64_ex = Module["_PL_get_int64_ex"] = function() {
                return (_PL_get_int64_ex = Module["_PL_get_int64_ex"] = Module["asm"]["PL_get_int64_ex"]).apply(null, arguments)
            };
            var _PL_get_float_ex = Module["_PL_get_float_ex"] = function() {
                return (_PL_get_float_ex = Module["_PL_get_float_ex"] = Module["asm"]["PL_get_float_ex"]).apply(null, arguments)
            };
            var _PL_get_pointer_ex = Module["_PL_get_pointer_ex"] = function() {
                return (_PL_get_pointer_ex = Module["_PL_get_pointer_ex"] = Module["asm"]["PL_get_pointer_ex"]).apply(null, arguments)
            };
            var ___errno_location = Module["___errno_location"] = function() {
                return (___errno_location = Module["___errno_location"] = Module["asm"]["__errno_location"]).apply(null, arguments)
            };
            var _PL_raise = Module["_PL_raise"] = function() {
                return (_PL_raise = Module["_PL_raise"] = Module["asm"]["PL_raise"]).apply(null, arguments)
            };
            var _PL_abort_hook = Module["_PL_abort_hook"] = function() {
                return (_PL_abort_hook = Module["_PL_abort_hook"] = Module["asm"]["PL_abort_hook"]).apply(null, arguments)
            };
            var _PL_abort_unhook = Module["_PL_abort_unhook"] = function() {
                return (_PL_abort_unhook = Module["_PL_abort_unhook"] = Module["asm"]["PL_abort_unhook"]).apply(null, arguments)
            };
            var _PL_dispatch_hook = Module["_PL_dispatch_hook"] = function() {
                return (_PL_dispatch_hook = Module["_PL_dispatch_hook"] = Module["asm"]["PL_dispatch_hook"]).apply(null, arguments)
            };
            var _PL_record = Module["_PL_record"] = function() {
                return (_PL_record = Module["_PL_record"] = Module["asm"]["PL_record"]).apply(null, arguments)
            };
            var _PL_recorded = Module["_PL_recorded"] = function() {
                return (_PL_recorded = Module["_PL_recorded"] = Module["asm"]["PL_recorded"]).apply(null, arguments)
            };
            var _PL_erase = Module["_PL_erase"] = function() {
                return (_PL_erase = Module["_PL_erase"] = Module["asm"]["PL_erase"]).apply(null, arguments)
            };
            var _PL_duplicate_record = Module["_PL_duplicate_record"] = function() {
                return (_PL_duplicate_record = Module["_PL_duplicate_record"] = Module["asm"]["PL_duplicate_record"]).apply(null, arguments)
            };
            var _PL_set_prolog_flag = Module["_PL_set_prolog_flag"] = function() {
                return (_PL_set_prolog_flag = Module["_PL_set_prolog_flag"] = Module["asm"]["PL_set_prolog_flag"]).apply(null, arguments)
            };
            var _PL_action = Module["_PL_action"] = function() {
                return (_PL_action = Module["_PL_action"] = Module["asm"]["PL_action"]).apply(null, arguments)
            };
            var _PL_query = Module["_PL_query"] = function() {
                return (_PL_query = Module["_PL_query"] = Module["asm"]["PL_query"]).apply(null, arguments)
            };
            var _PL_close_query = Module["_PL_close_query"] = function() {
                return (_PL_close_query = Module["_PL_close_query"] = Module["asm"]["PL_close_query"]).apply(null, arguments)
            };
            var _PL_current_query = Module["_PL_current_query"] = function() {
                return (_PL_current_query = Module["_PL_current_query"] = Module["asm"]["PL_current_query"]).apply(null, arguments)
            };
            var _PL_is_acyclic = Module["_PL_is_acyclic"] = function() {
                return (_PL_is_acyclic = Module["_PL_is_acyclic"] = Module["asm"]["PL_is_acyclic"]).apply(null, arguments)
            };
            var _PL_instantiation_error = Module["_PL_instantiation_error"] = function() {
                return (_PL_instantiation_error = Module["_PL_instantiation_error"] = Module["asm"]["PL_instantiation_error"]).apply(null, arguments)
            };
            var _PL_existence_error = Module["_PL_existence_error"] = function() {
                return (_PL_existence_error = Module["_PL_existence_error"] = Module["asm"]["PL_existence_error"]).apply(null, arguments)
            };
            var _PL_resource_error = Module["_PL_resource_error"] = function() {
                return (_PL_resource_error = Module["_PL_resource_error"] = Module["asm"]["PL_resource_error"]).apply(null, arguments)
            };
            var _PL_syntax_error = Module["_PL_syntax_error"] = function() {
                return (_PL_syntax_error = Module["_PL_syntax_error"] = Module["asm"]["PL_syntax_error"]).apply(null, arguments)
            };
            var _PL_get_atom_ex = Module["_PL_get_atom_ex"] = function() {
                return (_PL_get_atom_ex = Module["_PL_get_atom_ex"] = Module["asm"]["PL_get_atom_ex"]).apply(null, arguments)
            };
            var _PL_get_intptr_ex = Module["_PL_get_intptr_ex"] = function() {
                return (_PL_get_intptr_ex = Module["_PL_get_intptr_ex"] = Module["asm"]["PL_get_intptr_ex"]).apply(null, arguments)
            };
            var _PL_get_size_ex = Module["_PL_get_size_ex"] = function() {
                return (_PL_get_size_ex = Module["_PL_get_size_ex"] = Module["asm"]["PL_get_size_ex"]).apply(null, arguments)
            };
            var _PL_get_bool_ex = Module["_PL_get_bool_ex"] = function() {
                return (_PL_get_bool_ex = Module["_PL_get_bool_ex"] = Module["asm"]["PL_get_bool_ex"]).apply(null, arguments)
            };
            var _PL_get_char_ex = Module["_PL_get_char_ex"] = function() {
                return (_PL_get_char_ex = Module["_PL_get_char_ex"] = Module["asm"]["PL_get_char_ex"]).apply(null, arguments)
            };
            var _PL_unify_list_ex = Module["_PL_unify_list_ex"] = function() {
                return (_PL_unify_list_ex = Module["_PL_unify_list_ex"] = Module["asm"]["PL_unify_list_ex"]).apply(null, arguments)
            };
            var _PL_unify_nil_ex = Module["_PL_unify_nil_ex"] = function() {
                return (_PL_unify_nil_ex = Module["_PL_unify_nil_ex"] = Module["asm"]["PL_unify_nil_ex"]).apply(null, arguments)
            };
            var _PL_get_list_ex = Module["_PL_get_list_ex"] = function() {
                return (_PL_get_list_ex = Module["_PL_get_list_ex"] = Module["asm"]["PL_get_list_ex"]).apply(null, arguments)
            };
            var _PL_get_nil_ex = Module["_PL_get_nil_ex"] = function() {
                return (_PL_get_nil_ex = Module["_PL_get_nil_ex"] = Module["asm"]["PL_get_nil_ex"]).apply(null, arguments)
            };
            var _PL_unify_bool_ex = Module["_PL_unify_bool_ex"] = function() {
                return (_PL_unify_bool_ex = Module["_PL_unify_bool_ex"] = Module["asm"]["PL_unify_bool_ex"]).apply(null, arguments)
            };
            var _PL_get_file_name = Module["_PL_get_file_name"] = function() {
                return (_PL_get_file_name = Module["_PL_get_file_name"] = Module["asm"]["PL_get_file_name"]).apply(null, arguments)
            };
            var _PL_is_ground = Module["_PL_is_ground"] = function() {
                return (_PL_is_ground = Module["_PL_is_ground"] = Module["asm"]["PL_is_ground"]).apply(null, arguments)
            };
            var _PL_chars_to_term = Module["_PL_chars_to_term"] = function() {
                return (_PL_chars_to_term = Module["_PL_chars_to_term"] = Module["asm"]["PL_chars_to_term"]).apply(null, arguments)
            };
            var _PL_wchars_to_term = Module["_PL_wchars_to_term"] = function() {
                return (_PL_wchars_to_term = Module["_PL_wchars_to_term"] = Module["asm"]["PL_wchars_to_term"]).apply(null, arguments)
            };
            var _PL_record_external = Module["_PL_record_external"] = function() {
                return (_PL_record_external = Module["_PL_record_external"] = Module["asm"]["PL_record_external"]).apply(null, arguments)
            };
            var _PL_recorded_external = Module["_PL_recorded_external"] = function() {
                return (_PL_recorded_external = Module["_PL_recorded_external"] = Module["asm"]["PL_recorded_external"]).apply(null, arguments)
            };
            var _PL_erase_external = Module["_PL_erase_external"] = function() {
                return (_PL_erase_external = Module["_PL_erase_external"] = Module["asm"]["PL_erase_external"]).apply(null, arguments)
            };
            var _PL_sigaction = Module["_PL_sigaction"] = function() {
                return (_PL_sigaction = Module["_PL_sigaction"] = Module["asm"]["PL_sigaction"]).apply(null, arguments)
            };
            var _PL_get_signum_ex = Module["_PL_get_signum_ex"] = function() {
                return (_PL_get_signum_ex = Module["_PL_get_signum_ex"] = Module["asm"]["PL_get_signum_ex"]).apply(null, arguments)
            };
            var _PL_signal = Module["_PL_signal"] = function() {
                return (_PL_signal = Module["_PL_signal"] = Module["asm"]["PL_signal"]).apply(null, arguments)
            };
            var _PL_cleanup_fork = Module["_PL_cleanup_fork"] = function() {
                return (_PL_cleanup_fork = Module["_PL_cleanup_fork"] = Module["asm"]["PL_cleanup_fork"]).apply(null, arguments)
            };
            var _PL_is_initialised = Module["_PL_is_initialised"] = function() {
                return (_PL_is_initialised = Module["_PL_is_initialised"] = Module["asm"]["PL_is_initialised"]).apply(null, arguments)
            };
            var _PL_set_resource_db_mem = Module["_PL_set_resource_db_mem"] = function() {
                return (_PL_set_resource_db_mem = Module["_PL_set_resource_db_mem"] = Module["asm"]["PL_set_resource_db_mem"]).apply(null, arguments)
            };
            var _PL_on_halt = Module["_PL_on_halt"] = function() {
                return (_PL_on_halt = Module["_PL_on_halt"] = Module["asm"]["PL_on_halt"]).apply(null, arguments)
            };
            var _PL_exit_hook = Module["_PL_exit_hook"] = function() {
                return (_PL_exit_hook = Module["_PL_exit_hook"] = Module["asm"]["PL_exit_hook"]).apply(null, arguments)
            };
            var _PL_cleanup = Module["_PL_cleanup"] = function() {
                return (_PL_cleanup = Module["_PL_cleanup"] = Module["asm"]["PL_cleanup"]).apply(null, arguments)
            };
            var _PL_get_file_nameW = Module["_PL_get_file_nameW"] = function() {
                return (_PL_get_file_nameW = Module["_PL_get_file_nameW"] = Module["asm"]["PL_get_file_nameW"]).apply(null, arguments)
            };
            var _fflush = Module["_fflush"] = function() {
                return (_fflush = Module["_fflush"] = Module["asm"]["fflush"]).apply(null, arguments)
            };
            var __get_tzname = Module["__get_tzname"] = function() {
                return (__get_tzname = Module["__get_tzname"] = Module["asm"]["_get_tzname"]).apply(null, arguments)
            };
            var __get_daylight = Module["__get_daylight"] = function() {
                return (__get_daylight = Module["__get_daylight"] = Module["asm"]["_get_daylight"]).apply(null, arguments)
            };
            var __get_timezone = Module["__get_timezone"] = function() {
                return (__get_timezone = Module["__get_timezone"] = Module["asm"]["_get_timezone"]).apply(null, arguments)
            };
            var stackSave = Module["stackSave"] = function() {
                return (stackSave = Module["stackSave"] = Module["asm"]["stackSave"]).apply(null, arguments)
            };
            var stackRestore = Module["stackRestore"] = function() {
                return (stackRestore = Module["stackRestore"] = Module["asm"]["stackRestore"]).apply(null, arguments)
            };
            var stackAlloc = Module["stackAlloc"] = function() {
                return (stackAlloc = Module["stackAlloc"] = Module["asm"]["stackAlloc"]).apply(null, arguments)
            };
            var _setThrew = Module["_setThrew"] = function() {
                return (_setThrew = Module["_setThrew"] = Module["asm"]["setThrew"]).apply(null, arguments)
            };
            var _memalign = Module["_memalign"] = function() {
                return (_memalign = Module["_memalign"] = Module["asm"]["memalign"]).apply(null, arguments)
            };
            var dynCall_iij = Module["dynCall_iij"] = function() {
                return (dynCall_iij = Module["dynCall_iij"] = Module["asm"]["dynCall_iij"]).apply(null, arguments)
            };
            var dynCall_ij = Module["dynCall_ij"] = function() {
                return (dynCall_ij = Module["dynCall_ij"] = Module["asm"]["dynCall_ij"]).apply(null, arguments)
            };
            var dynCall_jii = Module["dynCall_jii"] = function() {
                return (dynCall_jii = Module["dynCall_jii"] = Module["asm"]["dynCall_jii"]).apply(null, arguments)
            };
            var dynCall_iiiji = Module["dynCall_iiiji"] = function() {
                return (dynCall_iiiji = Module["dynCall_iiiji"] = Module["asm"]["dynCall_iiiji"]).apply(null, arguments)
            };
            var dynCall_jiji = Module["dynCall_jiji"] = function() {
                return (dynCall_jiji = Module["dynCall_jiji"] = Module["asm"]["dynCall_jiji"]).apply(null, arguments)
            };
            var __growWasmMemory = Module["__growWasmMemory"] = function() {
                return (__growWasmMemory = Module["__growWasmMemory"] = Module["asm"]["__growWasmMemory"]).apply(null, arguments)
            };

            function invoke_iii(index, a1, a2) {
                var sp = stackSave();
                try {
                    return wasmTable.get(index)(a1, a2)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0 && e !== "longjmp") throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_ii(index, a1) {
                var sp = stackSave();
                try {
                    return wasmTable.get(index)(a1)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0 && e !== "longjmp") throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_vi(index, a1) {
                var sp = stackSave();
                try {
                    wasmTable.get(index)(a1)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0 && e !== "longjmp") throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_iiii(index, a1, a2, a3) {
                var sp = stackSave();
                try {
                    return wasmTable.get(index)(a1, a2, a3)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0 && e !== "longjmp") throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
                var sp = stackSave();
                try {
                    return wasmTable.get(index)(a1, a2, a3, a4, a5)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0 && e !== "longjmp") throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_vii(index, a1, a2) {
                var sp = stackSave();
                try {
                    wasmTable.get(index)(a1, a2)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0 && e !== "longjmp") throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_viii(index, a1, a2, a3) {
                var sp = stackSave();
                try {
                    wasmTable.get(index)(a1, a2, a3)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0 && e !== "longjmp") throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_i(index) {
                var sp = stackSave();
                try {
                    return wasmTable.get(index)()
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0 && e !== "longjmp") throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_iiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
                var sp = stackSave();
                try {
                    return wasmTable.get(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0 && e !== "longjmp") throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_iiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
                var sp = stackSave();
                try {
                    return wasmTable.get(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0 && e !== "longjmp") throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_iiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
                var sp = stackSave();
                try {
                    return wasmTable.get(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0 && e !== "longjmp") throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_iiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
                var sp = stackSave();
                try {
                    return wasmTable.get(index)(a1, a2, a3, a4, a5, a6, a7, a8)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0 && e !== "longjmp") throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
                var sp = stackSave();
                try {
                    return wasmTable.get(index)(a1, a2, a3, a4, a5, a6, a7)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0 && e !== "longjmp") throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_iiiiiii(index, a1, a2, a3, a4, a5, a6) {
                var sp = stackSave();
                try {
                    return wasmTable.get(index)(a1, a2, a3, a4, a5, a6)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0 && e !== "longjmp") throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_iiiii(index, a1, a2, a3, a4) {
                var sp = stackSave();
                try {
                    return wasmTable.get(index)(a1, a2, a3, a4)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0 && e !== "longjmp") throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_v(index) {
                var sp = stackSave();
                try {
                    wasmTable.get(index)()
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0 && e !== "longjmp") throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_iij(index, a1, a2, a3) {
                var sp = stackSave();
                try {
                    return dynCall_iij(index, a1, a2, a3)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0 && e !== "longjmp") throw e;
                    _setThrew(1, 0)
                }
            }

            function invoke_ij(index, a1, a2) {
                var sp = stackSave();
                try {
                    return dynCall_ij(index, a1, a2)
                } catch (e) {
                    stackRestore(sp);
                    if (e !== e + 0 && e !== "longjmp") throw e;
                    _setThrew(1, 0)
                }
            }
            Module["intArrayFromString"] = intArrayFromString;
            Module["cwrap"] = cwrap;
            Module["setValue"] = setValue;
            Module["getValue"] = getValue;
            Module["allocate"] = allocate;
            Module["UTF8ToString"] = UTF8ToString;
            Module["stringToUTF8"] = stringToUTF8;
            Module["lengthBytesUTF8"] = lengthBytesUTF8;
            Module["addRunDependency"] = addRunDependency;
            Module["removeRunDependency"] = removeRunDependency;
            Module["FS_createPath"] = FS.createPath;
            Module["FS_createDataFile"] = FS.createDataFile;
            Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
            Module["FS_createLazyFile"] = FS.createLazyFile;
            Module["FS_createDevice"] = FS.createDevice;
            Module["FS_unlink"] = FS.unlink;
            Module["FS"] = FS;
            Module["ALLOC_NORMAL"] = ALLOC_NORMAL;
            var calledRun;

            function ExitStatus(status) {
                this.name = "ExitStatus";
                this.message = "Program terminated with exit(" + status + ")";
                this.status = status
            }
            dependenciesFulfilled = function runCaller() {
                if (!calledRun) run();
                if (!calledRun) dependenciesFulfilled = runCaller
            };

            function run(args) {
                args = args || arguments_;
                if (runDependencies > 0) {
                    return
                }
                preRun();
                if (runDependencies > 0) return;

                function doRun() {
                    if (calledRun) return;
                    calledRun = true;
                    Module["calledRun"] = true;
                    if (ABORT) return;
                    initRuntime();
                    preMain();
                    readyPromiseResolve(Module);
                    if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
                    postRun()
                }
                if (Module["setStatus"]) {
                    Module["setStatus"]("Running...");
                    setTimeout(function() {
                        setTimeout(function() {
                            Module["setStatus"]("")
                        }, 1);
                        doRun()
                    }, 1)
                } else {
                    doRun()
                }
            }
            Module["run"] = run;

            function exit(status, implicit) {
                if (implicit && noExitRuntime && status === 0) {
                    return
                }
                if (noExitRuntime) {} else {
                    EXITSTATUS = status;
                    exitRuntime();
                    if (Module["onExit"]) Module["onExit"](status);
                    ABORT = true
                }
                quit_(status, new ExitStatus(status))
            }
            if (Module["preInit"]) {
                if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];
                while (Module["preInit"].length > 0) {
                    Module["preInit"].pop()()
                }
            }
            run();

            function Prolog(module, args) {
                this.module = module;
                this.args = args;
                this.bindings = {};
                this._bind();
                this._initialise()
            }
            Prolog.prototype._bind = function() {
                this.bindings.PL_atom_chars = this.module.cwrap("PL_atom_chars", "number", ["number"]);
                this.bindings.PL_functor_arity = this.module.cwrap("PL_functor_arity", "number", ["number"]);
                this.bindings.PL_functor_name = this.module.cwrap("PL_functor_name", "number", ["number"]);
                this.bindings.PL_get_functor = this.module.cwrap("PL_get_functor", "number", ["number", "number"]);
                this.bindings.PL_get_chars = this.module.cwrap("PL_get_chars", "number", ["number", "number", "number"]);
                this.bindings.PL_get_arg = this.module.cwrap("PL_get_arg", "number", ["number", "number", "number"]);
                this.bindings.PL_get_integer = this.module.cwrap("PL_get_integer", "number", ["number", "number"]);
                this.bindings.PL_put_chars = this.module.cwrap("PL_put_chars", "number", ["number", "number", "number", "number"]);
                this.bindings.PL_unify = this.module.cwrap("PL_unify", "number", ["number", "number"]);
                this.bindings.PL_is_string = this.module.cwrap("PL_is_string", "number", ["number"]);
                this.bindings.PL_initialise = this.module.cwrap("PL_initialise", "number", ["number", "number"]);
                this.bindings.PL_new_atom = this.module.cwrap("PL_new_atom", "number", ["string"]);
                this.bindings.PL_new_functor = this.module.cwrap("PL_new_functor", "number", ["number", "number"]);
                this.bindings.PL_new_term_ref = this.module.cwrap("PL_new_term_ref", "number", []);
                this.bindings.PL_put_functor = this.module.cwrap("PL_put_functor", "number", ["number", "number"]);
                this.bindings.PL_chars_to_term = this.module.cwrap("PL_chars_to_term", "number", ["string", "number"]);
                this.bindings.PL_call = this.module.cwrap("PL_call", "number", ["number", "number"]);
                this.bindings.PL_unify_arg = this.module.cwrap("PL_unify_arg", "number", ["number", "number", "number"])
            };
            Prolog.prototype._initialise = function() {
                var argv = this.args.map(function(arg) {
                    return this.module.allocate(this.module.intArrayFromString(arg), "i8", this.module.ALLOC_NORMAL)
                }, this);
                var ptr = this.module._malloc(argv.length * 4);
                argv.forEach(function(arg, i) {
                    this.module.setValue(ptr + i * 4, arg, "*")
                }, this);
                if (!this.bindings.PL_initialise(4, ptr)) {
                    throw new Error("SWI-Prolog initialisation failed.")
                }
                this.call_string("assert(user:file_search_path(library, 'wasm-preload/library')).")
            };
            Prolog.prototype.call_string = function(query) {
                var ref = this.new_term_ref();
                if (!this.chars_to_term(query, ref)) {
                    throw new Error("Query has a syntax error: " + query)
                }
                return !!this.call(ref, 0)
            };
            Prolog.prototype.functor_arity = function(functor) {
                return this.bindings.PL_functor_arity(functor)
            };
            Prolog.prototype.functor_name = function(functor) {
                return this.bindings.PL_functor_name(functor)
            };
            Prolog.prototype.get_functor = function(term) {
                var ptr = this.module._malloc(4);
                if (this.bindings.PL_get_functor(term, ptr)) {
                    var functor = this.module.getValue(ptr, "i32");
                    this.module._free(ptr);
                    return functor
                } else {
                    this.module._free(ptr);
                    return null
                }
            };
            Prolog.prototype.get_integer = function(term) {
                var ptr = this.module._malloc(4);
                if (this.bindings.PL_get_integer(term, ptr)) {
                    var number = this.module.getValue(ptr, "i32");
                    this.module._free(ptr);
                    return number
                } else {
                    this.module._free(ptr);
                    return null
                }
            };
            Prolog.prototype.put_chars_string = function(term, string) {
                var len = this.module.lengthBytesUTF8(string) + 1;
                var ptr = this.module._malloc(len);
                this.module.stringToUTF8(string, ptr, len);
                var ret = !!this.bindings.PL_put_chars(term, 5 | 4096, len - 1, ptr);
                this.module._free(ptr);
                return ret
            };
            Prolog.prototype.unify = function(term1, term2) {
                return !!this.bindings.PL_unify(term1, term2)
            };
            Prolog.prototype.is_string = function(term) {
                return !!this.bindings.PL_is_string(term)
            };
            Prolog.prototype.atom_chars = function(atom) {
                var ptr = this.bindings.PL_atom_chars(atom);
                if (ptr === 0) {
                    return null
                } else {
                    return this.module.Pointer_stringify(ptr)
                }
            };
            Prolog.prototype.call = function(term, module) {
                return this.bindings.PL_call(term, module)
            };
            Prolog.prototype.chars_to_term = function(query, t) {
                return this.bindings.PL_chars_to_term(query, t)
            };
            Prolog.prototype.get_chars = function(term) {
                var ptr = this.module._malloc(4);
                var flags = 1 | 2 | 4 | 8 | 16 | 32 | 128 | 4096 | 512;
                if (this.bindings.PL_get_chars(term, ptr, flags)) {
                    return this.module.UTF8ToString(this.module.getValue(ptr, "i32"))
                } else {
                    return null
                }
            };
            Prolog.prototype.get_arg = function(index, term, arg) {
                return this.bindings.PL_get_arg(index, term, arg)
            };
            Prolog.prototype.new_atom = function(string) {
                return this.bindings.PL_new_atom(string)
            };
            Prolog.prototype.new_functor = function(atom, arity) {
                return this.bindings.PL_new_functor(atom, arity)
            };
            Prolog.prototype.new_term_ref = function() {
                return this.bindings.PL_new_term_ref()
            };
            Prolog.prototype.put_functor = function(term, functor) {
                return this.bindings.PL_put_functor(term, functor)
            };
            Prolog.prototype.unify_arg = function(index, term, arg) {
                return this.bindings.PL_unify_arg(index, term, arg)
            };
            Module.onRuntimeInitialized = function() {
                Module.prolog = new Prolog(Module, Module.arguments)
            };


            return SWIPL.ready
        }
    );
})();
if (typeof exports === 'object' && typeof module === 'object')
    module.exports = SWIPL;
else if (typeof define === 'function' && define['amd'])
    define([], function() {
        return SWIPL;
    });
else if (typeof exports === 'object')
    exports["SWIPL"] = SWIPL;