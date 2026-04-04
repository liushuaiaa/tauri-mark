<template>
  <div class="app-root" :class="{ 'cursor-hidden': cursorEnabled }">
    <TitleBar
      :show-weather="!isLoginPage"
      :show-cursor-switch="!isLoginPage"
      :show-minimize="!isLoginPage"
      :show-maximize="!isLoginPage"
    />
    <el-container class="app-layout">
      <AppSidebar v-if="showSidebar" />
      <div
        v-if="showSidebar && !sidebarCollapsed"
        class="overlay"
        @click="sidebarCollapsed = true"
      />
      <el-main>
        <router-view v-slot="{ Component }">
          <Transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </el-main>
    </el-container>
  </div>
  <div ref="cursorRef" class="custom-cursor" :class="{ 'cursor-hidden': !cursorEnabled }" />
  <canvas ref="canvasRef" class="star-canvas" :class="{ 'cursor-hidden': !cursorEnabled }" />
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AppSidebar from './components/AppSidebar.vue'
import TitleBar from './components/TitleBar.vue'
import { sidebarCollapsed } from './stores/sidebar'
import { cursorEnabled } from './stores/cursor'
import { useRoute } from 'vue-router'

const route = useRoute()
const showSidebar = computed(() => route.name !== 'editor' && route.name !== 'day' && route.name !== 'login')
const isLoginPage = computed(() => route.name === 'login')

const canvasRef = ref<HTMLCanvasElement | null>(null)
const cursorRef = ref<HTMLDivElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let animFrame = 0

const stars: {
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  size: number
  hue: number
  rotation: number
}[] = []
let mouseX = -100
let mouseY = -100
let lastStarTime = 0
let isMouseMoving = false
let mouseMoveTimeout: number | null = null
let trailHue = 120 // start with green

function onMouseMove(e: MouseEvent) {
  if (!cursorEnabled.value) return
  mouseX = e.clientX
  mouseY = e.clientY
  if (cursorRef.value) {
    cursorRef.value.style.left = mouseX - 18 + 'px'
    cursorRef.value.style.top = mouseY - 18 + 'px'
  }
  isMouseMoving = true
  if (mouseMoveTimeout !== null) {
    clearTimeout(mouseMoveTimeout)
  }
  mouseMoveTimeout = window.setTimeout(() => {
    isMouseMoving = false
    mouseMoveTimeout = null
  }, 100)

  // Cycle hue: green (120) -> red (0) -> yellow (60) -> green again
  trailHue = (trailHue - 2) % 360
  if (trailHue < 0) trailHue += 360

  if (isMouseMoving) {
    stars.push({
      x: mouseX + 14 + Math.random() * 16,
      y: mouseY + 18 + Math.random() * 10,
      vx: Math.random() * 0.5 + 0.2,
      vy: Math.random() * 0.3 + 0.1,
      alpha: 1,
      size: Math.random() * 1.5 + 2,
      hue: (trailHue + Math.random() * 30 - 15 + 360) % 360,
      rotation: Math.random() * Math.PI * 2,
    })
  }
}

function drawStars(timestamp: number) {
  if (!ctx || !canvasRef.value) {
    animFrame = requestAnimationFrame(drawStars)
    return
  }
  const canvas = canvasRef.value
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (!cursorEnabled.value) {
    animFrame = requestAnimationFrame(drawStars)
    return
  }

  // Periodic leaf particles at mouse position while hovering
  if (mouseX >= 0 && timestamp - lastStarTime > 80 && isMouseMoving) {
    lastStarTime = timestamp
    stars.push({
      x: mouseX + 10 + Math.random() * 12,
      y: mouseY + 14 + Math.random() * 8,
      vx: Math.random() * 0.4 + 0.15,
      vy: Math.random() * 0.25 + 0.08,
      alpha: 0.85,
      size: Math.random() * 1.5 + 2,
      hue: (trailHue + Math.random() * 30 - 15 + 360) % 360,
      rotation: Math.random() * Math.PI * 2,
    })
  }

  for (let i = stars.length - 1; i >= 0; i--) {
    const s = stars[i]
    s.x += s.vx
    s.y += s.vy
    s.rotation += 0.015
    s.alpha -= 0.012

    if (s.alpha <= 0) {
      stars.splice(i, 1)
      continue
    }

    ctx.save()
    ctx.globalAlpha = s.alpha
    ctx.fillStyle = `hsl(${s.hue}, 90%, 55%)`
    ctx.shadowColor = `hsl(${s.hue}, 90%, 55%)`
    ctx.shadowBlur = 6
    ctx.translate(s.x, s.y)
    ctx.rotate(s.rotation)
    // Draw maple leaf shape (枫叶)
    ctx.beginPath()
    const size = s.size
    //枫叶轮廓 - 11个尖角
    const points = [
      [0, -size], // 顶部
      [-size * 0.3, -size * 0.7],
      [-size * 0.5, -size * 0.85],
      [-size * 0.7, -size * 0.6],
      [-size * 0.85, -size * 0.7],
      [-size * 0.7, -size * 0.3],
      [-size, -size * 0.15],
      [-size * 0.7, 0],
      [-size * 0.85, size * 0.4],
      [-size * 0.5, size * 0.3],
      [-size * 0.3, size * 0.5],
      [0, size * 0.9], // 底部
      [size * 0.3, size * 0.5],
      [size * 0.5, size * 0.3],
      [size * 0.85, size * 0.4],
      [size * 0.7, 0],
      [size, -size * 0.15],
      [size * 0.7, -size * 0.3],
      [size * 0.85, -size * 0.7],
      [size * 0.7, -size * 0.6],
      [size * 0.5, -size * 0.85],
      [size * 0.3, -size * 0.7],
    ]
    ctx.moveTo(points[0][0], points[0][1])
    for (let j = 1; j < points.length; j++) {
      ctx.lineTo(points[j][0], points[j][1])
    }
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  animFrame = requestAnimationFrame(drawStars)
}

function resizeCanvas() {
  if (!canvasRef.value) return
  canvasRef.value.width = window.innerWidth
  canvasRef.value.height = window.innerHeight
}

function onMouseEnter() {
  isMouseMoving = true
}

function onContextMenu(e: MouseEvent) {
  // 生产环境禁用右键
  if (import.meta.env.PROD) {
    e.preventDefault()
  }
}

onMounted(() => {
  if (!canvasRef.value) return
  ctx = canvasRef.value.getContext('2d')
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseenter', onMouseEnter)
  document.addEventListener('contextmenu', onContextMenu)
  animFrame = requestAnimationFrame(drawStars)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseenter', onMouseEnter)
  document.removeEventListener('contextmenu', onContextMenu)
  cancelAnimationFrame(animFrame)
})
</script>

<style>
.app-root {
  height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
}
.app-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
}
.el-main {
  flex: 1;
  padding: 0;
  overflow-y: auto;
}
.overlay {
  position: fixed;
  top: 40px;
  left: 260px;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
}
.star-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none !important;
  z-index: 2147483647;
}
.star-canvas.cursor-hidden,
.custom-cursor.cursor-hidden {
  display: none;
}
.custom-cursor {
  position: fixed;
  width: 40px;
  height: 40px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cdefs%3E%3ClinearGradient id='leafGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%2366cc66'/%3E%3Cstop offset='40%25' stop-color='%2355b855'/%3E%3Cstop offset='100%25' stop-color='%2344a048'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M20 3 C15 4 8 8 6 15 C4 22 6 30 12 35 C14 37 17 38 20 38 C22 36 25 30 26 24 C27 18 26 12 24 7 C23 5 21 4 20 3Z' fill='url(%23leafGrad)'/%3E%3Cpath d='M20 5 L20 36' stroke='%23448850' stroke-width='1' fill='none' opacity='0.8'/%3E%3Cpath d='M20 12 C17 14 14 16 12 18' stroke='%23448850' stroke-width='0.7' fill='none' opacity='0.7'/%3E%3Cpath d='M20 12 C23 14 26 16 28 18' stroke='%23448850' stroke-width='0.7' fill='none' opacity='0.7'/%3E%3Cpath d='M20 20 C17 22 14 25 11 28' stroke='%23448850' stroke-width='0.6' fill='none' opacity='0.6'/%3E%3Cpath d='M20 20 C23 22 26 25 29 28' stroke='%23448850' stroke-width='0.6' fill='none' opacity='0.6'/%3E%3Cpath d='M20 28 C18 30 16 32 14 34' stroke='%23448850' stroke-width='0.5' fill='none' opacity='0.5'/%3E%3Cpath d='M20 28 C22 30 24 32 26 34' stroke='%23448850' stroke-width='0.5' fill='none' opacity='0.5'/%3E%3Cpath d='M19 37 C18 38 17 39 18 40' stroke='%23554430' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-size: contain;
  pointer-events: none;
  z-index: 2147483646;
  left: -9999px;
  top: -9999px;
  transform: rotate(-45deg);
}

</style>
