/**
 * @description
 * HTTP code snippet generator for native Node.js.
 *
 * @author
 * @AhmadNassri
 *
 * for any questions or issues regarding the generated code snippet, please open an issue mentioning the author.
 */

"use strict";

var util = require("util");
var camelcase = require("camelcase");
var CodeBuilder = require("../../helpers/code-builder");

module.exports = function(source, options) {
  var opts = util._extend(
    {
      indent: "  "
    },
    options
  );

  var code = new CodeBuilder(opts.indent);

  var reqOpts = {
    method: source.method,
    hostname: source.uriObj.hostname,
    port: source.uriObj.port,
    path: source.uriObj.path,
    headers: source.allHeaders
  };

  var lastSwaggerUri = source["_swaggerSettings"].path
    .split("/")
    .filter(function(el) {
      return !el.includes("{");
    })
    .pop();

  var swaggerMethod = source["_swaggerSettings"].originalMethod;
  var operationId = swaggerMethod.operationId;

  var apiName = camelcase(lastSwaggerUri + "-api", { pascalCase: true });
  var paramNames = [];

  code.push("import * as Yapstone from 'yapstone-js';");

  code
    .blank()
    // .push('// Setup')
    .push("const client = Yapstone.ApiClient.instance;")
    // .push('const Bearer = client.authentications["Bearer"];')
    // .push('Bearer.apiKey = "YOUR_API_KEY";')
    // .blank()
    .push("const api = new Yapstone.%s();", apiName)
    .blank()
    .push("async function %s() {", operationId);

  // Deal with path parameters
  if (source["_swaggerSettings"].pathParams.length > 0) {
    paramNames = paramNames.concat(
      source["_swaggerSettings"].pathParams.map(function(param) {
        code.push(1, 'const %s = "%s";', param.name, param.value);

        if (param.name != null) {
          return param.name;
        }
      })
    );
  }

  // Deal with body params
  if (source.postData.mimeType === "application/json") {
    if (source.postData.jsonObj) {
      code.push(
        1,
        "const %s = %s;",
        "requestBody",
        util.inspect(source.postData.jsonObj, {
          depth: null
        })
      );
    }
    paramNames.push("requestBody");
  }

  code.blank().push(1, "return await api");

  var filteredParamNames = paramNames.filter(function(el) {
    return el != null;
  });

  if (filteredParamNames.length > 0) {
    code.push(2, ".%s(%s)", operationId, filteredParamNames.join(", "));
  } else {
    code.push(2, ".%s()", operationId);
  }

  code
    .push(2, ".catch(err => {")
    .push(3, "console.error(err);")
    .push(2, "});")
    .push("};")
    .blank()
    .push("console.log(%s());", operationId);

  return code.join();
};

module.exports.info = {
  key: "yapstone",
  title: "HTTP",
  link: "http://nodejs.org/api/http.html#http_http_request_options_callback",
  description: "Yapstone JS interface for Node.js"
};
