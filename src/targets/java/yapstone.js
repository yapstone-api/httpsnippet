"use strict";

var util = require("util");
var CodeBuilder = require("../../helpers/code-builder");
var pluralize = require("pluralize");
var camelcase = require("camelcase");
var capitalize = require("capitalize");

module.exports = function(source, options) {
  var opts = util._extend(
    {
      indent: "  "
    },
    options
  );

  var code = new CodeBuilder(opts.indent);

  code.push("import org.yapstone.ApiException;");

  var lastSwaggerUri = pluralize(
    source["_swaggerSettings"].path
      .split("/")
      .filter(function(el) {
        return !el.includes("{");
      })
      .pop()
  );

  var api = camelcase(lastSwaggerUri + "-api", {
    pascalCase: true
  });
  var paramNames = [];
  var operationId = source["_swaggerSettings"].originalMethod.operationId;

  code.push("import org.yapstone.api.%s;", api).blank();

  code.push("%s api = new %s();", api, api);

  // Deal with header parameters
  if (source["_swaggerSettings"].requiredHeaderParams.length > 0) {
    paramNames = paramNames.concat(
      source["_swaggerSettings"].requiredHeaderParams.map(function(param) {
        code.push(
          '%s %s = "%s";',
          capitalize(param.type),
          camelcase(param.name),
          param.value
        );

        if (param.name != null) {
          return camelcase(param.name);
        }
      })
    );
  }

  // Deal with body params
  if (source.postData.mimeType === "application/json") {
    if (
      source.postData.jsonObj &&
      source["_swaggerSettings"].originalMethod.requestBody.content
    ) {
      var requestBodyType = source["_swaggerSettings"].originalMethod
        .requestBody.content["application/json"].schema.title
        ? camelcase(
            source["_swaggerSettings"].originalMethod.requestBody.content[
              "application/json"
            ].schema.title
          )
        : "requestBody";

      var camelizedRequestBodyType = camelcase(requestBodyType, {
        pascalCase: true
      });

      code.push(
        "%s %s = new %s();",
        camelizedRequestBodyType,
        requestBodyType,
        camelizedRequestBodyType
      );
    }
    paramNames.push(requestBodyType);
  }

  // Deal with path params
  if (source["_swaggerSettings"].pathParams.length > 0) {
    paramNames = paramNames.concat(
      source["_swaggerSettings"].pathParams.map(function(param) {
        code.push(
          '%s %s = "%s";',
          capitalize(param.type),
          camelcase(param.name),
          param.value
        );

        if (param.name != null) {
          return camelcase(param.name);
        }
      })
    );
  }

  var filteredParamNames = paramNames.filter(function(el) {
    return el != null;
  });

  if (filteredParamNames.length > 0) {
    code
      .blank()
      .push(
        "var result = api.%s(%s);",
        operationId,
        filteredParamNames.join(", ")
      );
  } else {
    code.blank().push("var result = api.%s();", operationId);
  }

  return code.join();
};

module.exports.info = {
  key: "yapstone",
  title: "Yapstone",
  link: "http://square.github.io/okhttp/",
  description: "An HTTP Request Client Library"
};
