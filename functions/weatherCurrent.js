const axios = require('axios')
const https = require('https')

exports.handler = async function(event) {
  console.log(event);
  const payload = JSON.parse(event.body)
  const { baseDate, baseTime, nX, nY } = payload
  const { WEATHER_API_KEY } = process.env
  const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${WEATHER_API_KEY}%3D%3D&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nX}&ny=${nY}`

  try {
    const { data } = await axios.get(url, {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      })
    })
    
    if (data.response.header.resultCode !== '00') {
      return {
        statusCode: 400,
        body: data.response.header.resultMsg
      }
    }
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    }
  } catch (error) {
    return {
      statusCode: error.response.status,
      body: error.message
    }
  }
}