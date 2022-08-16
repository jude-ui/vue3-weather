import axios from 'axios'

// const dateObj = new Date('January 1, 2022 00:40:00')
const dateObj = new Date()

export default {
  namespaced: true,
  state: () => ({
    si: '서울특별시',
    gu: '종로구',
    dong: '청운효자동',
    tempSi: '',
    tempGu: '',
    tempDong: '',
    location: '',
    posRegion: {x: 60, y: 127},
    tempPosRegion: {},
    arrGu: [],
    arrDong: [],
    active_region: false,
    isLoadingCurrent: false,
    isLoadingShortTerm: false,
    isLoadingTotalWeather: false,
    overallWeather: '',
    icoOverallWeather: '',
    errorMessageCurrent: '',
    errorMessageShortTerm: '',
    weathersShortTerm: [],
    weathersCurrent: {},
    currentRainAmount: '',
    bgWeather: '',
    currentBaseToday: '',
    shortTermBaseToday: '',
    currentBaseTime: '',
    shortTermBaseTime: '',
    date: {},
    zeroPlus(number) {
      const zeroPlus = `0${number}`
      return number < 10 ? zeroPlus : number
    },
    getDay(payload) {
      const arr = ['일', '월', '화', '수', '목', '금', '토']
      return arr[payload]
    }
  }),
  mutations: {
    updateState(state, payload) {
      Object.keys(payload).map(key => {
        state[key] = payload[key]
      })
    },
    saveStorage(state) {
      localStorage.setItem('si', JSON.stringify(state.si))
      localStorage.setItem('gu', JSON.stringify(state.gu))
      localStorage.setItem('dong', JSON.stringify(state.dong))
      localStorage.setItem('posRegion', JSON.stringify(state.posRegion))
      localStorage.setItem('bgWeather', JSON.stringify(state.bgWeather))
    },
    getLocation(state) {
      state.location = `${state.si} ${state.gu} ${state.dong}`
    },
    weatherBgApply(state) {
      const weather = state.overallWeather
      if (weather.indexOf('낙뢰') > -1) {
        state.bgWeather = 'bg_weather9'
      } else {
        if (weather.indexOf('맑음') > -1) {
          state.bgWeather = 'bg_weather1'
        } else if (weather.indexOf('구름많음') > -1) {
          state.bgWeather = 'bg_weather2'
        } else if (weather.indexOf('흐림') > -1) {
          state.bgWeather = 'bg_weather3'
        } else if (weather.indexOf('비') > -1) {
          state.bgWeather = 'bg_weather4'
        } else if (weather.indexOf('비/눈') > -1 || weather.indexOf('빗방울날림') > -1) {
          state.bgWeather = 'bg_weather8'
        } else if (weather.indexOf('눈') > -1) {
          state.bgWeather = 'bg_weather6'
        } else if (weather.indexOf('빗방울') > -1) {
          state.bgWeather = 'bg_weather5'
        } else if (weather.indexOf('눈날림') > -1) {
          state.bgWeather = 'bg_weather7'
        } else {
          state.bgWeather = ''
        }
      }
    },
    weatherImgMatch(state) {
      state.weathersShortTerm = state.weathersShortTerm.map(el => {
        const weather = el.commonWeather
        if (weather.indexOf('낙뢰') > -1) {
          el.icoWeather = 6
        } else {
          if (weather.indexOf('맑음') > -1) {
            el.icoWeather = 1
          } else if (weather.indexOf('구름많음') > -1) {
            el.icoWeather = 2
          } else if (weather.indexOf('흐림') > -1) {
            el.icoWeather = 3
          } else if (weather.indexOf('비') > -1) {
            el.icoWeather = 4
          } else if (weather.indexOf('빗방울') > -1 || weather.indexOf('비/눈') > -1 || weather.indexOf('빗방울날림') > -1) {
            el.icoWeather = 5
          } else if (weather.indexOf('눈') > -1 || weather.indexOf('눈날림') > -1) {
            el.icoWeather = 7
          } else {
            el.icoWeather = ''
          }
        }
        return el
      })
    },
    calcOverallWeather(state) {
      state.overallWeather = state.weathersShortTerm[0].commonWeather
    },
    calcIcoOverallWeather(state) {
      state.icoOverallWeather = state.weathersShortTerm[0].icoWeather
    },
    rainCheck(state) {
      // 강수량 체크
      state.weathersShortTerm = state.weathersShortTerm.map(el => {
        if(el.catePTY > 0 && el.cateRN1 === '강수없음') {
          // 비 또는 눈이며, 강수없음일 경우 1mm 미만으로 처리
          el.cateRN1 = '1mm 미만'
        } else if (el.cateRN1 === '강수없음'){
          // 비 또는 눈이 아니면서 강수없음일 경우 0.0mm 로 처리
          el.cateRN1 = '0.0mm'
        }
        return el
      })
    },
    eachCommonWeather(state) {
      // 날씨 상태 최종 문구
      state.weathersShortTerm = state.weathersShortTerm.map(el => {
        const lgt = el.cateLGT > 0 ? ', 낙뢰' : '' // 낙뢰 체크
        if(el.isStatePTY){
          el.commonWeather = `${el.catePTY}${lgt}`
        } else {
          el.commonWeather = `${el.cateSKY}${lgt}`
        }
        return el
      })
    },
    currentAmountOfRain(state) {
      const firstPTY = state.weathersShortTerm[0].isStatePTY
      if (firstPTY) {
        state.currentRainAmount = state.weathersShortTerm[0].cateRN1
      } else {
        state.currentRainAmount = ''
      }
    },
    isStatePTY(state) {
      // 비 또는 눈 체크
      state.weathersShortTerm = state.weathersShortTerm.map(el => {
        if(el.catePTY >= 1 && el.catePTY <= 7){
          el.isStatePTY = true
        } else {
          el.isStatePTY = false
        }
        return el
      })
    },
    modifyCateVEC(state, payload) {
      // 풍향 체크 및 치환
      payload = payload.map(el => {
        const value = (parseInt(el.cateVEC, 10) + 22.5 * 0.5) / 22.5
        const direction = Math.round(value)
        // 16방위 기상청 풍향값 활용 가이드 참고하여 값 간략화하여 표현
        // 15 ~ 16 , 0 ~ 1 : 북
        // 1 ~ 3 : 북동
        // 3 ~ 5 : 동
        // 5 ~ 7 : 남동
        // 7 ~ 9 : 남
        // 9 ~ 11 : 남서
        // 11 ~ 13 : 서
        // 13 ~ 15 : 북서
        if ((direction > 15 && direction <= 16)
            || direction >= 0 && direction <= 1) {
          el.cateVEC = '북'
        } else if(direction > 1 && direction <= 3) {
          el.cateVEC = '북동'
        } else if (direction > 3 && direction <= 5) {
          el.cateVEC = '동'
        } else if (direction > 5 && direction <= 7) {
          el.cateVEC = '남동'
        } else if (direction > 7 && direction <= 9) {
          el.cateVEC = '남'
        } else if (direction > 9 && direction <= 11) {
          el.cateVEC = '남서'
        } else if (direction > 11 && direction <= 13) {
          el.cateVEC = '서'
        } else if (direction > 13 && direction <= 15) {
          el.cateVEC = '북서'
        } else {
          el.cateVEC = '알 수 없음'
        }
        return el
      })
    },
    modifyCateSKY(state) {
      // 운량 체크 및 치환
      return state.weathersShortTerm.map(el => {
        switch (el.cateSKY) {
          case '1':
            el.cateSKY = '맑음'
            break
          case '3':
            el.cateSKY = '구름많음'
            break
          case '4':
            el.cateSKY = '흐림'
            break
          default:
            el.cateSKY = '알 수 없음'
            break
        }
        return el
      })
    },
    modifyCatePTY(state) {
      // 눈/비 체크 및 치환
      return state.weathersShortTerm.map(el => {
        switch (el.catePTY) {
          case '0':
            el.catePTY = '없음'
            break
          case '1':
            el.catePTY = '비'
            break
          case '2':
            el.catePTY = '비/눈'
            break
          case '3':
            el.catePTY = '눈'
            break
          case '5':
            el.catePTY = '빗방울'
            break
          case '6':
            el.catePTY = '빗방울날림'
            break
          case '7':
            el.catePTY = '눈날림'
            break
          default:
            el.catePTY = '알 수 없음'
            break
        }
        return el
      })
    },
    getSimpleTime(state) {
      state.weathersShortTerm = state.weathersShortTerm.map(el => {
        let str;
        // console.log(el.targetTime);
        // 예를들어 '1700' 일 경우 앞에 2자리만 get
        // parseInt 로 숫자로 변경하여 앞에 0 제거
        str = parseInt(el.targetTime.slice(0,2), 10)
        if (str >= 0 && str < 12) {
          // 값이 0 ~ 11 까지는 오전
          str = `오전 ${str}시`
        } else {
          if (str === 12) {
            // 낮 12시
            str = `오후 12시`
          } else {
            // 값이 13 ~ 23 까지는 오후 - 12
            str = `오후 ${str - 12}시`
          }
        }
        el.targetTime = str
        return el
      })
    },
    getSimpleDate(state) {
      state.weathersShortTerm = state.weathersShortTerm.map(el => {
        const bar = '/'
        let str;
        if (el.targetDate.slice(-4).indexOf('0') === 0) {
          // 1~9월 이면
          str = el.targetDate.slice(-3)
          str = [str.slice(0,1), bar, str.slice(-2)].join('')
        } else {
          // 10~12월 이면
          str = el.targetDate.slice(-4)
          str = [str.slice(0,2), bar, str.slice(-2)].join('')  
        }
        if (el.targetDate.slice(-2) == state.date.date) {
          // 오늘이면
          el.targetDate = `${str}(${state.getDay(state.date.day)})`
        } else {
          // 오늘이 아니면(내일)
          el.targetDate = `${str}(${state.getDay(state.date.dayOfTomorrow)})`
        }
        return el
      })
    },
    createDateGroup(state) {
      const year = dateObj.getFullYear()
      const _month = dateObj.getMonth() + 1
      const month = _month < 10 ? `0${_month}` : _month
      const date = state.zeroPlus(dateObj.getDate())
      const hours = state.zeroPlus(dateObj.getHours())
      const minutes = state.zeroPlus(dateObj.getMinutes())
      const day = dateObj.getDay()

      const yesterday = new Date(dateObj.setDate(dateObj.getDate() - 1))
      const yearOfYesterday = yesterday.getFullYear()
      const monthOfYesterday = state.zeroPlus(yesterday.getMonth() + 1)
      const dateOfYesterday = state.zeroPlus(yesterday.getDate())
      const dayOfTomorrow = new Date(dateObj.setDate(dateObj.getDate() + 2)).getDay()

      let prevHours;
      if (dateObj.getHours() === 0) {
        prevHours = 23
      } else {
        prevHours = state.zeroPlus(dateObj.getHours() - 1)
      }
      
      state.date = {
        year,
        month,
        date,
        hours,
        minutes,
        yearOfYesterday,
        monthOfYesterday,
        dateOfYesterday,
        prevHours,
        day,
        dayOfTomorrow,
        today: `${year + month + date}`
      }
    },
    baseToday(state, payload) {
      // 현재 날씨 baseDate API 받는 시간에 맞춰 계산
      const minutes = state.date.minutes
      const hours = state.date.hours
      let baseYear;
      let baseMonth;
      let baseDate;
      let apiGetMinutes;
      
      if (payload === 'current') {
        apiGetMinutes = 40
      } else if (payload === 'shortTerm') {
        apiGetMinutes = 30
      }

      // API 받은 후
      baseYear = state.date.year
      baseMonth = state.date.month
      baseDate = state.date.date

      if (minutes >= 0 && minutes < apiGetMinutes && hours === '00') { // API 받기 전 00시일 경우
        // 이전 날로 설정
        baseYear = state.date.yearOfYesterday
        baseMonth = state.date.monthOfYesterday
        baseDate = state.date.dateOfYesterday
      }
      state[`${payload}BaseToday`] = `${baseYear}${baseMonth}${baseDate}`
    },
    baseTime(state, payload) {
      // 현재 날씨 baseTime API 받는 시간에 맞춰 계산 (매시각 40분)
      const minutes = state.date.minutes
      const hours = state.date.hours
      let baseHours;
      let baseMinutes;

      let apiGetMinutes;
      if (payload === 'current') {
        apiGetMinutes = 30
        baseMinutes = '00'
      } else if (payload === 'shortTerm') {
        apiGetMinutes = 30
        baseMinutes = '30'
      }

      if (minutes >= 0 && minutes < apiGetMinutes) {
        // ex. 14시 ~ 14시 40분 사이에는 13시 데이터를 사용
        baseHours = state.date.prevHours
      } else {
        // ex. 14시 40분부터 14시 데이터를
        baseHours = hours
      }
      state[`${payload}BaseTime`] = `${baseHours}${baseMinutes}`
    }
  },
  actions: {
    // 현재 날씨
    async initWeatherCurrent({state, commit}, payload) {
      try {
        if (state.isLoadingCurrent) return
        console.log('Current - Start');
        commit('updateState', {
          isLoadingCurrent: true,
          errorMessageCurrent: ''
        })
        const { data } = await _fetchWeatherCurrent(payload)
        // console.log('현재 날씨 원본 데이터', data);
        
        const weatherData = data.response.body.items.item
        
        const map = {}
        weatherData.forEach(info => {
          const step = {
            today: info.baseDate,
            baseTime: info.baseTime,
            nx: info.nx,
            ny: info.ny
          }
          step["cate" + info.category] = info.obsrValue

          if (map["currentWeather"] == undefined) {
            // 최초엔 undefined 체크로 만들어놓은 step 객체를 assign
            map["currentWeather"] = step
          } else {
            // 기준이 되는 키값에 객체 병합
            Object.assign(map["currentWeather"], step)
          }
        })

        commit('modifyCateVEC', Object.values(map)) // 풍향값 치환
        state.weathersCurrent = Object.values(map)[0]
        // console.log('최종 현재 날씨 데이터', state.weathersCurrent)
      } catch (message) {
        console.log('현재 날씨 데이터 에러', message)
        commit('updateState', {
          errorMessageCurrent: `현재 날씨 데이터 에러: ${message}`
        })
      } finally {
        console.log('Current - Done');
        commit('updateState', {isLoadingCurrent: false})
      }
    },

    // 추후 6시간 날씨
    async initWeatherShortTerm({state, commit}, payload) {
      try {
        if (state.isLoadingShortTerm) return
        console.log('ShortTerm - Start');
        commit('updateState', {
          isLoadingShortTerm: true,
          errorMessageShortTerm: ''
        })
        const { data } = await _fetchWeatherShortTerm(payload)
        const weatherData = data.response.body.items.item
        // console.log('초단기 원본 데이터', weatherData)

        const map = {}
        weatherData.forEach(info => {
          const step = {
            today: info.baseDate,
            baseTime: info.baseTime,
            targetDate: info.fcstDate,
            targetTime: info.fcstTime,
            nx: info.nx,
            ny: info.ny
          }
          step["cate" + info.category] = info.fcstValue
          
          // 시간이 기준이 되는 배열이 필요하기 때문에, 시간을 키값으로 하는 날씨 데이터를 만듦
          if (map[info.fcstTime] == undefined) {
            // 최초엔 undefined 체크로 만들어놓은 step 객체를 assign
            map[info.fcstTime] = step
          } else {
            // 기준이 되는 키값에 객체 병합
            Object.assign(map[info.fcstTime], step)
          }
        })
        state.weathersShortTerm = Object.values(map)
        if (state.date.minutes >= 0 && state.date.minutes < 30) {
          state.weathersShortTerm.shift()
        }
        commit('getLocation') // 최종 지역 location 할당
        commit('getSimpleTime') // 시간값 치환
        commit('getSimpleDate') // 날짜값 치환
        commit('rainCheck') // 강수량값 문자열 재수정
        commit('modifyCateVEC', state.weathersShortTerm) // 풍향값 치환
        commit('modifyCateSKY') // 운량값 치환
        commit('isStatePTY') // 눈, 비 있는지 isStatePTY 값 생성
        commit('modifyCatePTY') // 강수형태값 치환

        commit('eachCommonWeather') // 최종 날씨 문구 각 데이터에 추가
        commit('calcOverallWeather') // 현재 날씨 > state 할당
        commit('weatherBgApply') // 날씨에 따른 bg 적용
        commit('currentAmountOfRain') // 비일 경우 state.test에 강수량값 할당
        commit('weatherImgMatch') // 현재 날씨 분기
        commit('calcIcoOverallWeather') // 현재 날씨 아이콘 치환
        
        // console.log('최종 초단기 데이터', state.weathersShortTerm)
      } catch (message) {
        console.log('초단기 날씨 데이터 에러', message);
        commit('updateState', {
          errorMessageShortTerm: `초단기 날씨 데이터 에러: ${message}`
        })
      } finally {
        console.log('ShortTerm - Done');
        commit('updateState', {isLoadingShortTerm: false})
      }
    },
    async fetchWeather({state, commit, dispatch}) {
      commit('baseToday', 'current')
      commit('baseTime', 'current')
      await dispatch('initWeatherCurrent', {
        baseDate: state.currentBaseToday,
        baseTime: state.currentBaseTime,
        nX: state.posRegion.x,
        nY: state.posRegion.y,
      })

      commit('baseToday', 'shortTerm')
      commit('baseTime', 'shortTerm')
      await dispatch('initWeatherShortTerm', {
        baseDate: state.shortTermBaseToday,
        baseTime: state.shortTermBaseTime,
        nX: state.posRegion.x,
        nY: state.posRegion.y,
      })
    },
    
    async updateWeather({ state, commit, dispatch}, payload) {
      if (state.isLoadingTotalWeather) return

      if (payload === 'search') {
        state.si = state.tempSi
        state.gu = state.tempGu
        state.dong = state.tempDong
        state.posRegion = state.tempPosRegion
      }
      if (state.active_region) {
        state.active_region = false
      }

      // 날씨 조회
      commit('updateState', { isLoadingTotalWeather: true})
      console.log('조회', state.posRegion.x, state.posRegion.y)
      await dispatch('fetchWeather') // 날씨 조회
      console.log('조회 완료');
      commit('updateState', { isLoadingTotalWeather: false})
      commit('saveStorage') // 지역 이름 및 좌표값, bg 설정 등 로컬 스토리지에 반영
    },
  },
}

// 초단기 실황 데이터(현재 날씨)
function _fetchWeatherCurrent(payload) {
  const { WEATHER_API_KEY } = process.env
  const { baseDate, baseTime, nX, nY } = payload
  const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${WEATHER_API_KEY}%3D%3D&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nX}&ny=${nY}`

  return new Promise((resolve, reject) => {
    axios.get(url)
      .then(res => {
        if(res.data.response.header.resultCode !== '00') {
          reject(res.data.response.header.resultMsg)
        }
        resolve(res)
      })
      .catch(err => {
        reject(err.message)
      })
  })
}

// 초단기 예보 데이터(추후 5 or 6시간)
function _fetchWeatherShortTerm(payload) {
  const { WEATHER_API_KEY } = process.env
  const { baseDate, baseTime, nX, nY } = payload
  const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst?serviceKey=${WEATHER_API_KEY}%3D%3D&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nX}&ny=${nY}`

  return new Promise((resolve, reject) => {
    axios.get(url)
      .then(res => {
        if(res.data.response.header.resultCode !== '00') {
          reject(res.data.response.header.resultMsg)
        }
        resolve(res)
      })
      .catch(err => {
        reject(err.message)
      })
  })
}