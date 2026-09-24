import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { hardware, type BluetoothDeviceSeed } from '@/content/system'

export type WiFiStatus = 'connected' | 'connecting' | 'disconnected'
export type BluetoothStatus = 'connected' | 'connecting' | 'disconnected' | 'off'
export type FocusMode = 'off' | 'dnd' | 'work' | 'personal' | 'sleep'

export interface WiFiNetwork {
  name: string
  signalStrength: number
  isSecure: boolean
  isConnected: boolean
}

export interface BluetoothDevice extends BluetoothDeviceSeed {
  isConnected: boolean
}

/**
 * The pretend hardware behind the menu bar and Control Center: Wi-Fi,
 * Bluetooth, battery, sound, display and Focus. A light simulation drains the
 * battery and wobbles the Wi-Fi bars; the shell starts and stops it.
 */
export const useSystemStatusStore = defineStore('systemStatus', () => {
  const networks = ref<WiFiNetwork[]>(
    hardware.wifi.map((n, i) => ({ ...n, isConnected: i === 0 })),
  )
  const wifiStatus = ref<WiFiStatus>('connected')
  const wifiSignalStrength = ref(networks.value[0]?.signalStrength ?? 3)
  const currentWifiNetwork = computed(() => networks.value.find((n) => n.isConnected) ?? null)

  const batteryLevel = ref(hardware.battery.level)
  const isCharging = ref(false)
  const batteryTimeRemaining = ref(hardware.battery.timeRemaining)
  const powerSavingMode = ref(false)

  const volumeLevel = ref(75)
  const isMuted = ref(false)
  const outputDevice = ref(hardware.outputDevice)

  const bluetoothStatus = ref<BluetoothStatus>('connected')
  const bluetoothDevices = ref<BluetoothDevice[]>([
    ...hardware.bluetoothConnected.map((d) => ({ ...d, isConnected: true })),
    ...hardware.bluetoothAvailable.map((d) => ({ ...d, isConnected: false })),
  ])
  const connectedBluetoothDevices = computed(() => bluetoothDevices.value.filter((d) => d.isConnected))

  const brightnessLevel = ref(100)
  const focusMode = ref<FocusMode>('off')
  const airDropEnabled = ref(true)

  /** 0–3 bars, the way the macOS Wi-Fi glyph draws them. */
  const wifiBars = computed(() =>
    wifiStatus.value === 'connected' ? Math.max(1, Math.min(3, wifiSignalStrength.value)) : 0,
  )
  const effectiveVolume = computed(() => (isMuted.value ? 0 : volumeLevel.value))

  let pending: ReturnType<typeof setTimeout>[] = []
  const later = (fn: () => void, ms: number) => pending.push(setTimeout(fn, ms))

  function toggleWifi() {
    if (wifiStatus.value !== 'disconnected') {
      wifiStatus.value = 'disconnected'
      for (const n of networks.value) n.isConnected = false
      return
    }
    wifiStatus.value = 'connecting'
    later(() => {
      const first = networks.value[0]
      if (first) first.isConnected = true
      wifiSignalStrength.value = first?.signalStrength ?? 3
      wifiStatus.value = 'connected'
    }, 1500)
  }

  function connectToWifi(name: string) {
    const target = networks.value.find((n) => n.name === name)
    if (!target || target.isConnected) return
    wifiStatus.value = 'connecting'
    for (const n of networks.value) n.isConnected = false
    later(() => {
      target.isConnected = true
      wifiSignalStrength.value = target.signalStrength
      wifiStatus.value = 'connected'
    }, 1800)
  }

  function toggleBluetooth() {
    if (bluetoothStatus.value === 'off') {
      bluetoothStatus.value = 'connecting'
      later(() => {
        bluetoothStatus.value = connectedBluetoothDevices.value.length ? 'connected' : 'disconnected'
      }, 1200)
    } else {
      bluetoothStatus.value = 'off'
      for (const d of bluetoothDevices.value) d.isConnected = false
    }
  }

  function toggleBluetoothDevice(name: string) {
    const device = bluetoothDevices.value.find((d) => d.name === name)
    if (!device || bluetoothStatus.value === 'off') return
    device.isConnected = !device.isConnected
    bluetoothStatus.value = connectedBluetoothDevices.value.length ? 'connected' : 'disconnected'
  }

  const setVolumeLevel = (level: number) => {
    volumeLevel.value = Math.max(0, Math.min(100, level))
    if (volumeLevel.value > 0) isMuted.value = false
  }
  const toggleMute = () => (isMuted.value = !isMuted.value)
  const setBrightnessLevel = (level: number) =>
    (brightnessLevel.value = Math.max(10, Math.min(100, level)))
  const setFocusMode = (mode: FocusMode) => (focusMode.value = mode)
  const toggleAirDrop = () => (airDropEnabled.value = !airDropEnabled.value)
  const togglePowerSaving = () => (powerSavingMode.value = !powerSavingMode.value)
  const toggleCharging = () => (isCharging.value = !isCharging.value)

  // ── Simulation ──────────────────────────────────────────────────────────
  let timers: ReturnType<typeof setInterval>[] = []

  function formatHours(hours: number) {
    const h = Math.floor(hours)
    const m = Math.floor((hours - h) * 60)
    return `${h}:${m.toString().padStart(2, '0')}`
  }

  function tickBattery() {
    if (!isCharging.value && batteryLevel.value > 0) {
      const drain =
        (powerSavingMode.value ? 0.02 : 0.05) +
        (bluetoothStatus.value === 'connected' ? 0.01 : 0) +
        (wifiStatus.value === 'connected' ? 0.01 : 0) +
        Math.random() * 0.02
      batteryLevel.value = Math.max(0, batteryLevel.value - drain)
      // Ticks every 30s, so 120 ticks per hour.
      batteryTimeRemaining.value = formatHours(batteryLevel.value / (drain * 120))
      if (batteryLevel.value <= 20) powerSavingMode.value = true
    } else if (isCharging.value && batteryLevel.value < 100) {
      batteryLevel.value = Math.min(100, batteryLevel.value + Math.random() * 0.3 + 0.1)
      batteryTimeRemaining.value =
        batteryLevel.value >= 100
          ? 'Fully charged'
          : `${formatHours((100 - batteryLevel.value) / 0.4 / 120)} until full`
    }
  }

  function tickWifi() {
    if (wifiStatus.value !== 'connected' || !currentWifiNetwork.value) return
    const base = currentWifiNetwork.value.signalStrength
    wifiSignalStrength.value = Math.round(Math.max(1, Math.min(4, base + (Math.random() - 0.5) * 0.8)))
  }

  function tickRandomEvents() {
    // Very rarely someone "plugs in" the charger.
    if (Math.random() < 0.01) toggleCharging()
  }

  function startSimulation() {
    if (timers.length) return
    timers = [
      setInterval(tickBattery, 30_000),
      setInterval(tickWifi, 8_000),
      setInterval(tickRandomEvents, 60_000),
    ]
  }

  function stopSimulation() {
    timers.forEach(clearInterval)
    timers = []
    pending.forEach(clearTimeout)
    pending = []
  }

  return {
    networks,
    wifiStatus,
    wifiSignalStrength,
    wifiBars,
    currentWifiNetwork,
    toggleWifi,
    connectToWifi,
    batteryLevel,
    isCharging,
    batteryTimeRemaining,
    powerSavingMode,
    togglePowerSaving,
    toggleCharging,
    volumeLevel,
    isMuted,
    effectiveVolume,
    outputDevice,
    setVolumeLevel,
    toggleMute,
    bluetoothStatus,
    bluetoothDevices,
    connectedBluetoothDevices,
    toggleBluetooth,
    toggleBluetoothDevice,
    brightnessLevel,
    setBrightnessLevel,
    focusMode,
    setFocusMode,
    airDropEnabled,
    toggleAirDrop,
    startSimulation,
    stopSimulation,
  }
})
