export const appEvent = {
  // event names
  ORDER_CANCEL_EDIT: 'order.cancelEdit',

  on(name: string, listener: Resta.AppEventListener) {
    document.addEventListener(appEvent._getName(name), listener)
    return appEvent.off.bind(appEvent, name, listener)
  },
  off(name: string, listener: Resta.AppEventListener) {
    document.removeEventListener(appEvent._getName(name), listener)
  },
  fire<T>(name: string, data?: T) {
    const event = new CustomEvent(appEvent._getName(name), { detail: data })
    document.dispatchEvent(event)
  },
  _getName(name: string) {
    return `Resta.${name}`
  },
}
