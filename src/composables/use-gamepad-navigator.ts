import { ref, Ref, computed, onMounted } from 'vue';

export interface ControlElement {
  click(): void;
  hover(): void;
  leave(): void;
  isHover(): boolean;
}

export function useGamepadNavigator<T extends ControlElement>() {
  const controlElements = ref<T[]>([]) as Ref<T[]>;

  /** 加入控制元件 */
  function mountElement(el: T | null) {
    if (!el) return;

    controlElements.value.push(el);
  }

  /** hover 元件 */
  function hoverElement(index:number){
    controlElements.value.forEach(el => el.leave())
    controlElements.value?.[index]?.hover()
  }

  /** 目前hover元件的index */
  const currentIndex = computed(() => controlElements.value.findIndex(({isHover}) => isHover()))

  /** 上一个元件 */
  function prev(){
    if(currentIndex.value < 0){
      hoverElement(0)
    }

    let targetIndex = currentIndex.value - 1
    if(targetIndex < 0){
      targetIndex += controlElements.value.length
    }

    return hoverElement(targetIndex)
  }

  /** 下一个元件 */
  function next(){
    if(currentIndex.value < 0){
      return hoverElement(0)
    }

    const targetIndex = (currentIndex.value + 1) % controlElements.value.length;
    return hoverElement(targetIndex);
  }

  /** 点击目前hover元件 */
  function click(){
    if (currentIndex.value < 0) {
      hoverElement(0);
      return controlElements.value?.[0]?.click();
    }

    const targetIndex = currentIndex.value;
    hoverElement(targetIndex);
    return controlElements.value[targetIndex].click();
  }

  /** 自动hover第一个元件 */
  onMounted(() => {
    controlElements.value?.[0]?.hover();
  });

  return {
    mountElement,
    next,
    prev,
    click,
  }
}