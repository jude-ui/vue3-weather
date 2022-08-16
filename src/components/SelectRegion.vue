<template>
  <template v-if="active_region">
    <div
      class="dimmed_layer"
      v-if="1"></div>
    <div
      @click.self="closePopup()"
      class="region_layer"
      v-if="1">
      <div class="inner_layer">
        <div class="layer_head">
          <strong class="tit_region">지역 선택</strong>
          <div class="group_navi">
            <button
              @click="backToSi()"
              type="button"
              class="btn_navi"
              :class="{on: siTargetIdx > -1}"
              :disabled="siTargetIdx < 0">
              {{ txtSi }}
            </button>
            <span class="txt_divide">&gt;</span>
            <button
              @click="backToGu()"
              type="button"
              class="btn_navi"
              :class="{on: guTargetIdx > -1}"
              :disabled="guTargetIdx < 0">
              {{ txtGu }}
            </button>
            <span class="txt_divide">&gt;</span>
            <button
              type="button"
              class="btn_navi"
              :class="{on: dongTargetIdx > -1}"
              :disabled="dongTargetIdx < 0">
              {{ txtDong }}
            </button>
          </div>
        </div>
        <div class="layer_body">
          <ul
            v-if="activeSi"
            class="list_region">
            <li
              v-for="(region, idx) in regions"
              :key="region.key"
              :class="{on: idx === siTargetIdx}"
              @click="selectSi(region, idx)">
              <button
                type="button"
                class="btn_region">
                {{ region.key }}
              </button>
            </li>
          </ul>
          <ul
            v-if="activeGu"
            class="list_region">
            <li>
              <button
                class="btn_region fst"
                @click="backToSi()">
                ↑ 상위
              </button>
            </li>
            <li
              v-for="(region, idx) in arrGu"
              :key="region.key"
              :class="{on: idx === guTargetIdx}"
              @click="selectGu(region, idx)">
              <button
                type="button"
                class="btn_region">
                {{ region.key }}
              </button>
            </li>
          </ul>
          <ul
            v-if="activeDong"
            class="list_region">
            <li>
              <button
                class="btn_region fst"
                @click="backToGu()">
                ↑ 상위
              </button>
            </li>
            <li
              v-for="(region, idx) in arrDong"
              :key="region.key"
              :class="{on: idx === dongTargetIdx}"
              @click="selectDong(region, idx)">
              <button
                type="button"
                class="btn_region">
                {{ region.key }}
              </button>
            </li>
          </ul>
          <button
            type="button"
            class="btn_select"
            :disabled="dongTargetIdx < 0"
            @click="updateWeather('search')">
            조회
          </button>
        </div>
        <div class="layer_foot">
          <button
            @click="closePopup()"
            type="button"
            class="btn_close">
            닫기
          </button>
        </div>
      </div>
    </div>
  </template>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'

export default {
  data() {
    return {
      siTargetIdx: -1,
      guTargetIdx: -1,
      dongTargetIdx: -1,
      txtSi: '시/도',
      txtGu: '구/군',
      txtDong: '읍/면/동',
      activeSi: true,
      activeGu: false,
      activeDong: false,
    }
  },
  created() {
    this.sortRegion()
  },
  computed: {
    ...mapState('weather', [
      'si',
      'gu',
      'dong',
      'tempSi',
      'tempGu',
      'tempDong',
      'arrGu',
      'arrDong',
      'active_region',
      'posRegion',
      'tempPosRegion',
    ]),
    ...mapState('region', [
      'regions'
    ]),
  },
  methods: {
    ...mapMutations('weather', [
      'updateState'
    ]),
    ...mapMutations('region', [
      'sortRegion'
    ]),
    ...mapActions('weather', [
      'updateWeather',
    ]),
    

    selectSi(region, idx) {
      // 시 데이터 클릭
      if (this.isLoadingTotalWeather) return

      // 지역 선택 클래스 처리
      this.siTargetIdx = idx
      this.activeSi = false
      this.activeGu = true
      
      // 임시 데이터에 지역 저장 및 지역 목록 데이터 처리
      this.updateState({
        tempSi: region.key, // 선택한 시 데이터
        arrGu: region.children.map(el => ({
          key: el.key,
          children: el.children
        }))
      })
      this.txtSi = this.tempSi
    },
    selectGu(region, idx) {
      if (this.isLoadingTotalWeather) return
      // 구 데이터 클릭
      this.guTargetIdx = idx
      this.activeGu = false
      this.activeDong = true
      
      this.updateState({
        tempGu: region.key, // 선택한 구 데이터
        arrDong: region.children.map(el => ({
          key: el.key,
          value: el.value
        })),
      })
      this.txtGu = this.tempGu
    },
    selectDong(region, idx) {
      if (this.isLoadingTotalWeather) return
      // 동 데이터 클릭
      this.dongTargetIdx = idx

      this.updateState({
        tempDong: region.key, // 선택한 동 데이터
        tempPosRegion: region.value // 최종 동 좌표값 할당
      })
      this.txtDong = this.tempDong
      console.log(this.posRegion.x, this.posRegion.y)
    },

    backToSi() {
      this.txtSi = '시/도'
      this.txtGu = '구/군'
      this.txtDong = '읍/면/동'
      this.activeSi = true
      this.activeGu = false
      this.activeDong = false
      this.siTargetIdx = -1
      this.guTargetIdx = -1
      this.dongTargetIdx = -1
    },
    backToGu() {
      this.txtGu = '구/군'
      this.txtDong = '읍/면/동'
      this.activeDong = false
      this.activeGu = true
      this.guTargetIdx = -1
      this.dongTargetIdx = -1
    },

    closePopup() {
      this.txtSi = '시/도'
      this.txtGu = '구/군'
      this.txtDong = '읍/면/동'
      this.siTargetIdx = -1
      this.guTargetIdx = -1
      this.dongTargetIdx = -1
      this.activeSi = true
      this.activeGu = false
      this.activeDong = false
      
      
      this.updateState({
        arrGu: [],
        arrDong: [],
        tempSi: '',
        tempGu: '',
        tempDong: '',
        tempPosRegion: {},
        active_region: false,
      })
    }
  }
}
</script>