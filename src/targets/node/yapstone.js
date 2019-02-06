/**
 * @description
 * HTTP code snippet generator for native Node.js.
 *
 * @author
 * @AhmadNassri
 *
 * for any questions or issues regarding the generated code snippet, please open an issue mentioning the author.
 */

'use strict'

var util = require('util')
var camelcase = require('camelcase')
var CodeBuilder = require('../../helpers/code-builder')

module.exports = function (source, options) {
  var opts = util._extend({
    indent: '  '
  }, options)

  var code = new CodeBuilder(opts.indent)

  var reqOpts = {
    method: source.method,
    hostname: source.uriObj.hostname,
    port: source.uriObj.port,
    path: source.uriObj.path,
    headers: source.allHeaders
  }

  var customOptions = source.comment.split('---')

  var apiName = camelcase(customOptions[1] + '-api', {pascalCase: true})

  code.push("import * as Yapstone from 'yapstone-js';")

  code.blank()
      .push('// Setup')
      .push('const client = Yapstone.ApiClient.instance;')
      .push('const Bearer = client.authentications["Bearer"];')
      .push('Bearer.apiKey = "YOUR API KEY";')
      .blank()
      .push('const api = new Yapstone.%s();', apiName)
      .push('async function %s() {', customOptions[0])
      .push(1, 'const applicantId = "test";')
      .push(1, 'return await api')
      .push(2, '.%s(applicantId)', customOptions[0])
      .push(2, '.catch(e => {')
      .push(2, 'console.error(e);')
      .push(2, '});')
      .push('};')
      .blank()
      .push('console.log(%s());', customOptions[0])

  switch (source.postData.mimeType) {
    case 'application/x-www-form-urlencoded':
      if (source.postData.paramsObj) {
        code.unshift('var qs = require("querystring");')
        code.push('req.write(qs.stringify(%s));', util.inspect(source.postData.paramsObj, {
          depth: null
        }))
      }
      break

    case 'application/json':
      if (source.postData.jsonObj) {
        code.push('req.write(JSON.stringify(%s));', util.inspect(source.postData.jsonObj, {
          depth: null
        }))
      }
      break

    default:
      if (source.postData.text) {
        code.push('req.write(%s);', JSON.stringify(source.postData.text, null, opts.indent))
      }
  }

  return code.join()
}

module.exports.info = {
  key: 'yapstone',
  title: 'HTTP',
  link: 'http://nodejs.org/api/http.html#http_http_request_options_callback',
  description: 'Yapstone JS interface for Node.js'
}
