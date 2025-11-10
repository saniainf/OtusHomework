import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

const LOCAL_KEY = 'counter.count'

export const useCounterStore = defineStore('counter', () => {
  const count = useLocalStorage(LOCAL_KEY, 0)
  const doubleCount = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  function incrementBy(amount) {
    const value = typeof amount === 'number' ? amount : Number(amount)
    if (!Number.isFinite(value)) {
      console.warn('[counter] incrementBy ignored invalid amount:', amount)
      return
    }
    count.value += value
  }

  function reset() {
    count.value = 0
  }

  return { count, doubleCount, increment, decrement, incrementBy, reset }
})
