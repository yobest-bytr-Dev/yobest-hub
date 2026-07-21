import { useEffect, useState, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Center } from '@react-three/drei'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export interface ModelStats { vertices: number; faces: number; meshes: number }
export interface AnimationInfo { name: string; duration: number; index: number }
export interface DetectedMesh { index: number; name: string; color: string }
export interface MeshAssignment { meshIndex: number; color: string; textureCanvas?: string }

function hexColor(c: THREE.Color) { return '#' + c.getHexString() }

function countGeometry(scene: THREE.Object3D): ModelStats {
  let vertices = 0, faces = 0, meshes = 0
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      meshes++
      const geo = child.geometry
      if (geo.index) faces += geo.index.count / 3
      else if (geo.attributes.position) faces += geo.attributes.position.count / 3
      if (geo.attributes.position) vertices += geo.attributes.position.count
    }
  })
  return { vertices, faces, meshes }
}

interface Props {
  url: string
  onLoaded?: () => void
  onStats?: (s: ModelStats) => void
  onAnimations?: (a: AnimationInfo[]) => void
  onMeshesDetected?: (m: DetectedMesh[]) => void
  wireframe?: boolean
  materialColor?: string
  onError?: (msg: string) => void
  animIndex?: number
  animPlaying?: boolean
  animSpeed?: number
  meshAssignments?: MeshAssignment[]
}

export default function ModelComponent({
  url, onLoaded, onStats, onAnimations, onMeshesDetected,
  wireframe = false, materialColor, onError,
  animIndex, animPlaying = false, animSpeed = 1, meshAssignments,
}: Props) {
  const [loadedScene, setLoadedScene] = useState<THREE.Group | null>(null)
  const [loading, setLoading] = useState(true)
  const { camera } = useThree()
  const statsSentRef = useRef(false)
  const meshesSentRef = useRef(false)
  const currentUrlRef = useRef('')
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const actionsRef = useRef<THREE.AnimationAction[]>([])
  const currentActionRef = useRef<THREE.AnimationAction | null>(null)
  const prevAssignmentsRef = useRef('')

  useEffect(() => { camera.position.set(0, 0.5, 4.5) }, [camera])

  useEffect(() => {
    if (!url) return
    currentUrlRef.current = url
    statsSentRef.current = false
    meshesSentRef.current = false
    setLoading(true)
    setLoadedScene(null)

    const loader = new GLTFLoader()
    loader.load(url, (gltf) => {
      if (currentUrlRef.current !== url) return
      const scene = gltf.scene
      setLoadedScene(scene)
      setLoading(false)
      if (gltf.animations.length > 0 && onAnimations) {
        const mixer = new THREE.AnimationMixer(scene)
        mixerRef.current = mixer
        const actions = gltf.animations.map((clip) => {
          const action = mixer.clipAction(clip)
          action.setLoop(THREE.LoopRepeat, Infinity)
          return action
        })
        actionsRef.current = actions
        onAnimations(gltf.animations.map((clip, i) => ({
          name: clip.name || `Animation ${i + 1}`, duration: clip.duration, index: i,
        })))
      }
    }, undefined, (err) => {
      if (currentUrlRef.current !== url) return
      setLoading(false)
      onError?.('Failed to load 3D model')
    })

    return () => {
      currentUrlRef.current = ''
      if (mixerRef.current) { mixerRef.current.stopAllAction(); mixerRef.current = null }
      actionsRef.current = []
      currentActionRef.current = null
    }
  }, [url, onError])

  useEffect(() => {
    if (!loadedScene) return
    if (!statsSentRef.current) {
      statsSentRef.current = true
      onStats?.(countGeometry(loadedScene))
      onLoaded?.()
    }
    if (!meshesSentRef.current && onMeshesDetected) {
      meshesSentRef.current = true
      const meshes: DetectedMesh[] = []
      let idx = 0
      loadedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = Array.isArray(child.material) ? child.material[0] : child.material
          const color = mat instanceof THREE.MeshStandardMaterial ? hexColor(mat.color) : '#cccccc'
          meshes.push({ index: idx, name: child.name || `Mesh ${idx + 1}`, color })
          idx++
        }
      })
      onMeshesDetected(meshes)
    }
  }, [loadedScene, onStats, onLoaded, onMeshesDetected])

  useEffect(() => {
    if (!loadedScene) return
    loadedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mats = Array.isArray(child.material) ? child.material : [child.material]
        for (const mat of mats) mat.wireframe = wireframe
      }
    })
  }, [loadedScene, wireframe])

  useEffect(() => {
    if (!loadedScene || !materialColor) return
    if (meshAssignments && meshAssignments.length > 0) return
    loadedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mats = Array.isArray(child.material) ? child.material : [child.material]
        for (const mat of mats) {
          if (mat instanceof THREE.MeshStandardMaterial) mat.color.set(materialColor)
        }
      }
    })
  }, [loadedScene, materialColor, meshAssignments])

  useEffect(() => {
    if (!loadedScene) return
    const assignKey = JSON.stringify(meshAssignments)
    if (assignKey === prevAssignmentsRef.current) return
    prevAssignmentsRef.current = assignKey
    if (!meshAssignments || meshAssignments.length === 0) {
      loadedScene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.map = null; child.material.color.set('#ffffff'); child.material.needsUpdate = true
        }
      })
      return
    }
    let meshIdx = 0
    loadedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const assign = meshAssignments.find((a) => a.meshIndex === meshIdx)
        if (assign && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.map = null; child.material.color.set(assign.color); child.material.needsUpdate = true
        }
        meshIdx++
      }
    })
  }, [loadedScene, meshAssignments])

  useEffect(() => {
    const actions = actionsRef.current
    if (actions.length === 0) return
    if (currentActionRef.current) { currentActionRef.current.stop(); currentActionRef.current = null }
    if (animIndex != null && animIndex >= 0 && animIndex < actions.length) {
      const action = actions[animIndex]
      currentActionRef.current = action
      if (animPlaying) action.reset().play()
    }
  }, [animIndex, animPlaying])

  useEffect(() => {
    if (currentActionRef.current) currentActionRef.current.setEffectiveTimeScale(animSpeed)
  }, [animSpeed])

  useFrame((_, delta) => {
    if (mixerRef.current && currentActionRef.current && animPlaying) mixerRef.current.update(delta)
  })

  if (loading || !loadedScene) return null
  return <Center><primitive object={loadedScene} scale={1.5} /></Center>
}
