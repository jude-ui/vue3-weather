<template>
  <template v-if="active_region">
    <div
      class="dimmed_layer"
      v-if="1"></div>
    <div
      class="region_layer"
      v-if="1">
      <div class="inner_layer">
        <div class="layer_head">
          <strong class="tit_region">지역 선택</strong>
          <div class="group_navi">
            <button
              type="button"
              class="btn_navi">
              {{ txtSi }}
            </button>
            <span class="txt_divide">&gt;</span>
            <button
              type="button"
              class="btn_navi">
              {{ txtGu }}
            </button>
            <span class="txt_divide">&gt;</span>
            <button
              type="button"
              class="btn_navi">
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
              @click="click_si(region, idx)">
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
                class="btn_region"
                @click="backToSi()">
                상위
              </button>
            </li>
            <li
              v-for="(region, idx) in arrGu"
              :key="region.key"
              :class="{on: idx === guTargetIdx}"
              @click="click_gu(region, idx)">
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
                class="btn_region"
                @click="backToGu()">
                상위
              </button>
            </li>
            <li
              v-for="(region, idx) in arrDong"
              :key="region.key"
              :class="{on: idx === dongTargetIdx}"
              @click="click_dong(region, idx)">
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
            @click="updateWeather()">
            조회
          </button>
        </div>
        <div class="layer_foot">
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
      'arrGu',
      'arrDong',
      'active_region',
      'posRegion',
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
    backToSi() {
      this.activeGu = false
      this.activeSi = true
      this.siTargetIdx = -1
      this.txtGu = '구/군'
      this.txtSi = '시/도'
      
      this.updateState({ si: '' })
    },
    backToGu() {
      this.activeDong = false
      this.activeGu = true
      this.guTargetIdx = -1
      this.dongTargetIdx = -1
      this.txtGu = '구/군'
      this.txtDong = '읍/면/동'
      
      this.updateState({
        gu: '',
        dong: ''
      })
    },
    click_si(region, idx) {
      if (this.isLoadingTotalWeather) return
      // 시 데이터 클릭
      this.siTargetIdx = idx
      this.activeSi = false
      this.activeGu = true
      
      this.updateState({
        si: region.key, // 선택한 시 데이터
        arrGu: region.children.map(el => ({
          key: el.key,
          children: el.children
        }))
      })
      this.txtSi = this.si
    },
    click_gu(region, idx) {
      if (this.isLoadingTotalWeather) return
      // 구 데이터 클릭
      this.guTargetIdx = idx
      this.activeGu = false
      this.activeDong = true
      
      this.updateState({
        gu: region.key, // 선택한 구 데이터
        arrDong: region.children.map(el => ({
          key: el.key,
          value: el.value
        })),
      })
      this.txtGu = this.gu
    },
    click_dong(region, idx) {
      if (this.isLoadingTotalWeather) return
      // 동 데이터 클릭
      this.dongTargetIdx = idx

      this.updateState({
        dong: region.key, // 선택한 동 데이터
        posRegion: region.value // 최종 동 좌표값 할당
      })
      this.txtDong = this.dong
      console.log(this.posRegion.x, this.posRegion.y)
    },
  }
}
</script>