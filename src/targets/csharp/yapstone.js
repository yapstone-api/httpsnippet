"use strict";

var camelcase = require("camelcase");
var util = require("util");
var CodeBuilder = require("../../helpers/code-builder");

module.exports = function(source, options) {
  var code = new CodeBuilder();

  code
    .push("// Setup")
    .push("using Yapstone.Api;")
    .push("using Yapstone.Client;")
    .push("using Yapstone.Model;")
    // .blank()
    // .push('Configuration.Default.ApiKey.Add("Authorization", "%s");', "YOUR_API_KEY")
    // .push('Configuration.Default.ApiKeyPrefix.Add("Authorization", "Bearer");')
    .blank();

  var lastSwaggerUri = source["_swaggerSettings"].path
    .split("/")
    .filter(function(el) {
      return !el.includes("{");
    })
    .pop();

  var swaggerMethod = source["_swaggerSettings"].originalMethod;
  var operationId = camelcase(swaggerMethod.operationId, { pascalCase: true });

  var apiName = camelcase(lastSwaggerUri + "-api", { pascalCase: true });
  var paramNames = [];

  code.push("var api = new %s();", apiName);

  // Deal with path parameters
  if (source["_swaggerSettings"].pathParams.length > 0) {
    paramNames = paramNames.concat(
      source["_swaggerSettings"].pathParams.map(function(param) {
        code.push('var %s = "%s";', param.name, param.value);

        if (param.name != null) {
          return param.name;
        }
      })
    );
  }

  // Deal with body params
  // if (source.postData.mimeType === "application/json") {
  //   paramNames = paramNames.concat(
  //     swaggerMethod.parameters.map(function(param) {
  //       if (param.in === "body") {
  //         code.push(
  //           "var %s = new %s();",
  //           param.name,
  //           camelcase(param.name, { pascalCase: true })
  //         );
  //         return param.name;
  //       }
  //     })
  //   );
  // }

  if (source.postData.mimeType === "application/json") {
    if (source.postData.jsonObj) {
      code.push(
        "var %s = new %s();",
        "requestBody",
        camelcase("requestBody", { pascalCase: true })
      );
    }
    paramNames.push("requestBody");
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
  link: "http://restsharp.org/",
  description: "Yapstone API Client for .NET"
};
