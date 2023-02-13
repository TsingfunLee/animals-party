import { defineStore } from 'pinia';

interface State {
  isLoading: boolean,
  isEntering: boolean,
  isLeaving: boolean,
  /** loading 樣式，預留未來可以切換多種樣式 */
  type: string,
}

export const useLoadingStore = defineStore('loading', {
  state: (): State => ({
    isLoading: false,
    isEntering: false,
    isLeaving: false,

    type: ''
  }),
})