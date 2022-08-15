<template>
  <div
    class="container"
    :class="bgWeather">
    <h1 class="screen_out">
      날씨 정보
    </h1>
    <div class="inner_contain">
      <header v-if="location.length > 0">
        <span class="screen_out">현재 설정된 지역 : </span>
        <button class="btn_region">
          <div
            class="material-icons"
            aria-hidden="true">
            location_on
          </div>
          <div class="txt_location">
            {{ location }}
          </div>
        </button>
      </header>

      <div
        class="select"
        v-if="0">
        <ul
          class="list_select">
          <li
            v-for="region in regions"
            :key="region.key"
            @click="click_si(region)">
            {{ region.key }}
          </li>
        </ul>
        <ul
          class="list_select"
          v-if="arrGu.length">
          <li
            v-for="region in arrGu"
            :key="region.key"
            @click="click_gu(region)">
            {{ region.key }}
          </li>
        </ul>
        <ul
          class="list_select"
          v-if="arrDong.length">
          <li
            v-for="region in arrDong"
            :key="region.key"
            @click="click_dong(region)">
            {{ region.key }}
          </li>
        </ul>
      </div>

      <Loader v-if="isLoadingTotalWeather" />
      <template v-else>
        <main>
          <div v-if="errorMessageCurrent">
            {{ errorMessageCurrent }}
          </div>
          <div
            v-else
            class="group_current">
            <div
              class="ico_weather"
              :class="`ico_weather${icoOverallWeather}`">
            </div>
            <div class="group_txt">
              <h2 class="screen_out">
                현재 날씨
              </h2>
              <div class="txt_temp">
                <span class="screen_out">기온 : </span>
                {{ weathersCurrent.cateT1H }}℃
              </div>
              
              <div
                v-if="currentRainAmount.length > 0"
                class="txt_rainfall">
                강수량 : 80.0mm{{ currentRainAmount }}
              </div>
              <div class="txt_current">
                {{ overallWeather }}
              </div>
              <div class="txt_wind">
                바람 : {{ weathersCurrent.cateWSD }}m/s {{ weathersCurrent.cateVEC }}
              </div>
              <div class="txt_humi">
                습도 : {{ weathersCurrent.cateREH }}%
              </div>
            </div>
          </div>
          <div class="info_refresh">
            <button
              type="button"
              class="btn_refresh"
              @click="updateWeather()">
              날씨 정보 새로고침
              <span
                class="material-icons">
                autorenew
              </span>
            </button>
          </div>
        
          <div v-if="errorMessageShortTerm">
            {{ errorMessageShortTerm }}
          </div>
          <div
            v-else
            class="box_weather">
            <div
              class="info_clamp">
              <div class="txt_clamp1">
                날짜
              </div>
              <div class="txt_clamp2">
                시간
              </div>
              <div class="txt_clamp3">
                날씨
              </div>
              <div class="txt_clamp4">
                기온
              </div>
              <div class="txt_clamp5">
                습도
              </div>
              <div class="txt_clamp6">
                바람
              </div>
              <div class="txt_clamp7">
                강수량
              </div>
            </div>
            <div
              class="info_weather">
              <ul class="list_weather">
                <li
                  v-for="weather in weathersShortTerm"
                  :key="weather.targetTime">
                  <!-- 날짜 -->
                  <div
                    class="txt_date">
                    {{ weather.targetDate }}
                  </div>
                  <!-- 시간 -->
                  <div
                    class="txt_time">
                    {{ weather.targetTime }}
                  </div>
                  <div
                    class="ico_weather"
                    :class="`ico_weather${weather.icoWeather}`">
                  </div>
                  <!-- 날씨 -->
                  <div
                    class="txt_weather">
                    {{ weather.commonWeather }}
                  </div>
                  <!-- 기온 -->
                  <div
                    class="txt_temp">
                    {{ weather.cateT1H }}℃
                  </div>
                  <!-- 습도 -->
                  <div
                    class="txt_humi">
                    {{ weather.cateREH }}%
                  </div>
                  <!-- 바람 -->
                  <div
                    class="txt_wind">
                    {{ weather.cateWSD }}m/s {{ weather.cateVEC }}
                  </div>
                  <!-- 강수량 -->
                  <div
                    class="txt_rainfall">
                    {{ weather.cateRN1 }}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </main>

        <footer>
          <p class="info_data">
            본 페이지는 기상청에서 제공하는 데이터로 여러 정보들을 나타내고 있습니다.<br />
            모든 예보는 발표 시간에 따라 수시로 변동될 수 있으니 참고 바랍니다.
          </p>
          <small>
            <address>문의 및 오류 신고 : jude.sh@daum.net</address>
            <a
              href="https://github.com/jude-ui"
              target="_blank"
              class="link_author">
              (c) {{ date.year }}. jude
            </a>
          </small>
        </footer>
      </template>
    </div>
    <!-- // inner_contain -->
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import Loader from '~/components/Loader'

export default {
  components: {
    Loader
  },
  created() {
    this.getRegion()
    this.updateWeather()
    this.sortRegion()
  },
  computed: {
    ...mapState('weather', [
      'si',
      'gu',
      'dong',
      'location',
      'posRegion',
      'arrGu',
      'arrDong',
      'errorMessageCurrent',
      'errorMessageShortTerm',
      'weathersCurrent',
      'weathersShortTerm',
      'date',
      'zeroPlus',
      'overallWeather',
      'icoOverallWeather',
      'isLoadingCurrent',
      'isLoadingShortTerm',
      'isLoadingTotalWeather',
      'currentRainAmount',
      'bgWeather',
    ]),
    ...mapState('region', [
      'regions'
    ]),
  },
  methods: {
    ...mapMutations('weather', [
      'updateState',
      'saveStorage',
    ]),
    ...mapMutations('region', [
      'sortRegion'
    ]),
    getRegion() {
      const storageSi = localStorage.getItem('si')
      const storageGu = localStorage.getItem('gu')
      const storageDong = localStorage.getItem('dong')
      const storagePosRegion = localStorage.getItem('posRegion')
      const storageBgWeather = localStorage.getItem('bgWeather')
      if (storageSi && storageGu && storageDong && storagePosRegion) {
        this.updateState({
          si: JSON.parse(storageSi),
          gu: JSON.parse(storageGu),
          dong: JSON.parse(storageDong),
          posRegion: JSON.parse(storagePosRegion),
          bgWeather: JSON.parse(storageBgWeather),
        })
      }
    },
    click_si(region) {
      if (this.isLoadingTotalWeather) return
      // 시 데이터 클릭
      if (this.arrDong.length > 0) this.updateState({arrDong: []})
      this.updateState({
        si: region.key, // 선택한 시 데이터
        gu: '',
        dong: '',
        arrGu: region.children.map(el => ({
          key: el.key,
          children: el.children
        }))
      })
    },
    click_gu(region) {
      if (this.isLoadingTotalWeather) return
      // 구 데이터 클릭
      this.updateState({
        gu: region.key, // 선택한 구 데이터
        dong: '',
        arrDong: region.children.map(el => ({
          key: el.key,
          value: el.value
        })),
      })
    },
    click_dong(region) {
      if (this.isLoadingTotalWeather) return
      // 동 데이터 클릭
      this.updateState({
        dong: region.key, // 선택한 동 데이터
        posRegion: region.value // 최종 동 좌표값 할당
      })
      console.log(this.posRegion.x, this.posRegion.y)
    },
    alertRegionSet() {
      if (!this.gu && !this.dong) {
        console.log('gu, dong 둘다 없음');
      } else if(!this.dong) {
        console.log('dong만 없음');
      }
    },
    async updateWeather() {
      if (this.isLoadingTotalWeather) return

      if (!this.dong) {
        this.alertRegionSet() // 경고
        return
      }
      // 날씨 조회
      this.updateState({ isLoadingTotalWeather: true})
      console.log('조회', this.posRegion.x, this.posRegion.y)
      await this.$store.dispatch('weather/fetchWeather') // 날씨 조회
      console.log('조회 완료');
      this.updateState({ isLoadingTotalWeather: false})
      this.saveStorage() // 지역 이름 및 좌표값, bg 설정 등 로컬 스토리지에 반영
    },
    
  }
}
</script>
