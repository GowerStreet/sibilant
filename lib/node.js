var util = require("util"),
    path = require("path"),
    fs = require("fs");
var sibilant = (function(args) {
  /* src/node.sibilant:3:14 */

  var args = Array.prototype.slice.call(arguments, 0);

  return sibilant.entry.apply(this, args);
}),
    error = (function(str) {
  /* src/node.sibilant:4:14 */

  throw str
}),
    inspect = util.inspect;
module.exports = sibilant;
sibilant.dir = process.cwd();
sibilant.dependencies = {  };
sibilant.relativeDirAndFile = (function sibilant$relativeDirAndFile$(fileName) {
  /* sibilant.relative-dir-and-file src/node.sibilant:12:0 */

  return [ path.dirname(fileName), fileName ].map((function() {
    /* src/node.sibilant:14:15 */
  
    return path.relative(process.cwd(), arguments[0]);
  }));
});
var relativeDirAndFile = sibilant.relativeDirAndFile;
sibilant.recordDependency = (function sibilant$recordDependency$(from, to) {
  /* sibilant.record-dependency src/node.sibilant:17:0 */

  sibilant.dependencies[from] = (function() {
    return (typeof sibilant.dependencies[from] !== "undefined") ? sibilant.dependencies[from] : []
  }).call(this);
  return sibilant.dependencies[from].push(to);
});
sibilant.flatDependencies = (function sibilant$flatDependencies$() {
  /* sibilant.flat-dependencies src/node.sibilant:23:0 */

  return flatten(values(sibilant.dependencies));
});
sibilant.entry = (function sibilant$entry$(source, options) {
  /* sibilant.entry src/node.sibilant:28:0 */

  (function() {
    if (("object" === typeof source && source !== null && source.constructor.name !== "Array")) {
      options = source;
      return source = undefined;
    }
  }).call(this);
  options = (function() {
    return (typeof options !== "undefined") ? options : {  }
  }).call(this);
  (function() {
    if (typeof source === "string") {
      return options.source = source;
    }
  }).call(this);
  var map = options.map,
      source = options.source,
      file = options.file,
      quoteKeys = options.quoteKeys,
      json = options.json;
  map = (function() {
    return (typeof map !== "undefined") ? map : false
  }).call(this);
  quoteKeys = (function() {
    return (typeof quoteKeys !== "undefined") ? quoteKeys : json
  }).call(this);
  (function() {
    if (((typeof file !== "undefined" && file !== null) && !((typeof source !== "undefined" && source !== null)))) {
      var relativeDirAndF$1 = relativeDirAndFile(file),
          relativeDir = relativeDirAndF$1[0],
          relativeFile = relativeDirAndF$1[1],
          relativeDirAndF$1 = undefined;
      return source = (sibilant.sourceCache[relativeFile] || sibilant.stripShebang(fs.readFileSync(file, "utf8")));
    }
  }).call(this);
  (function() {
    if (file) {
      var relativeDirAndF$2 = relativeDirAndFile(file),
          relativeDir = relativeDirAndF$2[0],
          relativeFile = relativeDirAndF$2[1],
          relativeDirAndF$2 = undefined;
      return sibilant.sourceCache[relativeFile] = source;
    }
  }).call(this);
  return withFile(file, (function() {
    /* src/node.sibilant:54:7 */
  
    var quoteState = sibilant.quoteHashKeys;
    (function() {
      if (quoteKeys) {
        return sibilant.quoteHashKeys = true;
      }
    }).call(this);
    var ast = restructure(parse(source)),
        output = transpile(ast),
        sourcemap = (function() {
      if (map) {
        return _sourcemapper(output);
      }
    }).call(this),
        js = outputFormatter(output),
        dependencies = sibilant.flatDependencies();
    (function() {
      if (quoteKeys) {
        return sibilant.quoteHashKeys = quoteState;
      }
    }).call(this);
    return {
      ast: ast,
      output: output,
      js: js,
      map: sourcemap,
      dependencies: dependencies
    };
  }));
});
sibilant.transpileFile = (function sibilant$transpileFile$(fileName) {
  /* sibilant.transpile-file src/node.sibilant:74:0 */

  return withFile(fileName, (function() {
    /* src/node.sibilant:77:16 */
  
    var source = sibilant.stripShebang(fs.readFileSync(fileName, "utf8")),
        relativeDirAndF$3 = relativeDirAndFile(file),
        relativeDir = relativeDirAndF$3[0],
        relativeFile = relativeDirAndF$3[1],
        relativeDirAndF$3 = undefined;
    sibilant.sourceCache[relativeFile] = source;
    return transpile(restructure(parse(source)));
  }));
});
var withFile = (function withFile$(fileName, fn) {
  /* with-file src/node.sibilant:88:0 */

  return (function() {
    if (fileName) {
      return withDirAndFile.apply(this, sibilant.relativeDirAndFile(fileName).concat([ (function() {
        /* src/node.sibilant:90:74 */
      
        return fn(fileName);
      }) ]));
    } else {
      return fn();
    }
  }).call(this);
});
sibilant.sourcemapFile = (function sibilant$sourcemapFile$(fileName) {
  /* sibilant.sourcemap-file src/node.sibilant:93:0 */

  return withFile(fileName, (function() {
    /* src/node.sibilant:95:16 */
  
    return sourcemap(sibilant.stripShebang(fs.readFileSync(arguments[0], "utf8")));
  }));
});
require.extensions[".sibilant"] = (function(module, filename) {
  /* src/node.sibilant:102:5 */

  return module._compile(sibilant({ file: filename }).js, filename);
});
require.extensions[".son"] = (function(module, filename) {
  /* src/node.sibilant:108:5 */

  var content = sibilant({
    file: filename,
    json: true
  }).js,
      json = (function() {
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error("could not parse:\n", content);
      throw e
    }
  }).call(this);
  return module.exports = json;
});
sibilant.packageInfo = (function sibilant$packageInfo$() {
  /* sibilant.package-info src/node.sibilant:118:0 */

  return JSON.parse(fs.readFileSync((__dirname + "/../package.json"), "utf8"));
});
sibilant.versionString = (function sibilant$versionString$() {
  /* sibilant.version-string src/node.sibilant:124:0 */

  var package = sibilant.packageInfo();
  return (package.name + " version " + package.version + "\n(at " + path.join(__dirname, "..") + ")");
});
sibilant.include = (function sibilant$include$(file) {
  /* sibilant.include src/node.sibilant:130:0 */

  (function() {
    if (!(file.match((new RegExp("\\.(sibilant|son)$", undefined))))) {
      return file = (file + ".sibilant");
    }
  }).call(this);
  (function() {
    if (file.match((new RegExp("^\\.\\.?/", undefined)))) {
      return file = path.resolve(sibilant.dir, file);
    }
  }).call(this);
  var resolvedFile = (function() {
    try {
      return require.resolve(file);
    } catch (e) {
      return error(("Failed to resolve file for inclusion: " + file));
    }
  }).call(this);
  sibilant.recordDependency(sibilant.file, file);
  return sibilant({ file: resolvedFile }).output;
});