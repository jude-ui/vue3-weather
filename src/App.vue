<template>
  <Weather />
</template>

<script>
import Weather from '~/components/Weather'

export default {
  components: {
    Weather
  },
  created() {
    this.$store.commit('weather/createDateGroup') // 날짜 객체 생성
    console.log(process.env.NODE_ENV)
  },
}
</script>