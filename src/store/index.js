import { createStore } from 'vuex'
import weather from './weather'
import region from './region'

export default createStore({
  modules: {
    weather,
    region
  }
})