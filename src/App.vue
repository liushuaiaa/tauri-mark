<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AppSidebar from './components/AppSidebar.vue'
import { sidebarCollapsed } from './stores/sidebar'
import { useRoute } from 'vue-router'

const route = useRoute()
const showSidebar = computed(() => route.name !== 'editor')

const canvasRef = ref<HTMLCanvasElement | null>(null)
const cursorRef = ref<HTMLDivElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let animFrame = 0
const stars: { x: number; y: number; vx: number; vy: number; alpha: number; size: number; hue: number }[] = []
let mouseX = -100
let mouseY = -100
let lastStarTime = 0

function onMouseMove(e: MouseEvent) {
  mouseX = e.clientX
  mouseY = e.clientY
  if (cursorRef.value) {
    cursorRef.value.style.left = (mouseX - 16) + 'px'
    cursorRef.value.style.top = (mouseY - 16) + 'px'
  }
  for (let i = 0; i < 4; i++) {
    stars.push({
      x: mouseX + (Math.random() - 0.5) * 20,
      y: mouseY + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * -3 - 1,
      alpha: 1,
      size: Math.random() * 3 + 1.5,
      hue: Math.random() * 60 + 30 // gold range
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

  // Periodic stars at mouse position while hovering
  if (mouseX >= 0 && timestamp - lastStarTime > 30) {
    lastStarTime = timestamp
    for (let i = 0; i < 2; i++) {
      stars.push({
        x: mouseX + (Math.random() - 0.5) * 30,
        y: mouseY + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * -2 - 0.5,
        alpha: 0.9,
        size: Math.random() * 2 + 1,
        hue: Math.random() * 60 + 30
      })
    }
  }

  for (let i = stars.length - 1; i >= 0; i--) {
    const s = stars[i]
    s.x += s.vx
    s.y += s.vy
    s.alpha -= 0.025

    if (s.alpha <= 0) {
      stars.splice(i, 1)
      continue
    }

    ctx.save()
    ctx.globalAlpha = s.alpha
    ctx.fillStyle = `hsl(${s.hue}, 100%, 70%)`
    ctx.shadowColor = `hsl(${s.hue}, 100%, 70%)`
    ctx.shadowBlur = 6
    ctx.beginPath()
    const spikes = 4
    const outer = s.size
    const inner = s.size * 0.4
    for (let j = 0; j < spikes * 2; j++) {
      const r = j % 2 === 0 ? outer : inner
      const angle = (j * Math.PI) / spikes - Math.PI / 2
      const px = s.x + Math.cos(angle) * r
      const py = s.y + Math.sin(angle) * r
      if (j === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
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

onMounted(() => {
  if (!canvasRef.value) return
  ctx = canvasRef.value.getContext('2d')
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  window.addEventListener('mousemove', onMouseMove)
  animFrame = requestAnimationFrame(drawStars)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
  window.removeEventListener('mousemove', onMouseMove)
  cancelAnimationFrame(animFrame)
})
</script>

<template>
  <div class="app-root">
    <el-container class="app-layout">
      <AppSidebar v-if="showSidebar" />
      <div
        v-if="showSidebar && !sidebarCollapsed"
        class="overlay"
        @click="sidebarCollapsed = true"
      />
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
  <div ref="cursorRef" class="custom-cursor" />
  <canvas ref="canvasRef" class="star-canvas" />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html, body, #app, .app-root {
  height: 100%;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}
* {
  cursor: none !important;
}
.app-root {
  height: 100%;
  position: relative;
}
.el-main {
  padding: 0;
  overflow-y: auto;
}
.overlay {
  position: absolute;
  top: 0;
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
.custom-cursor {
  position: fixed;
  width: 32px;
  height: 32px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M16 2 C10 2 4 8 4 16 C4 24 10 30 16 30 C16 22 22 16 30 10 C22 10 16 2 16 2Z' fill='%2340b040' stroke='%23207020' stroke-width='1'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-size: contain;
  pointer-events: none;
  z-index: 2147483646;
  left: -9999px;
  top: -9999px;
}
</style>
