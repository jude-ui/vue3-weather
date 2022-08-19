exports.handler = async function (event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      name: 'jude',
      age: 85,
      email: 'jude.sh@daum.net'
    })
  }
}