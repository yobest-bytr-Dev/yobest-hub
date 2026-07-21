import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { Suspense, Component, type ReactNode, useCallback } from 'react'
import ModelComponent from './ModelComponent'
import type { ModelStats, AnimationInfo, DetectedMesh, MeshAssignment } from './ModelComponent'
import { Loader2 } from 'lucide-react'

class ErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() { return this.state.hasError ? this.props.fallback : this.props.children }
}

function ModelError() {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
          </svg>
        </div>
        <p className="text-white/50 text-sm font-medium">Failed to load 3D model</p>
        <p className="text-white/25 text-xs mt-1">The file may be too large or unavailable</p>
      </div>
    </div>
  )
}

function LoadingPlaceholder() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#1a1a2e" wireframe />
    </mesh>
  )
}

interface ModelViewerProps {
  modelUrl: string | null
  onModelLoaded?: () => void
  onStats?: (stats: ModelStats) => void
  onAnimations?: (anims: AnimationInfo[]) => void
  onMeshesDetected?: (meshes: DetectedMesh[]) => void
  wireframe?: boolean
  autoRotate?: boolean
  materialColor?: string
  animIndex?: number
  animPlaying?: boolean
  animSpeed?: number
  meshAssignments?: MeshAssignment[]
}

export type { ModelStats, AnimationInfo, DetectedMesh, MeshAssignment }

export default function ModelViewer({
  modelUrl, onModelLoaded, onStats, onAnimations, onMeshesDetected,
  wireframe = false, autoRotate = true, materialColor,
  animIndex, animPlaying, animSpeed, meshAssignments,
}: ModelViewerProps) {
  const handleModelError = useCallback(() => {}, [])

  return (
    <div className="w-full h-full bg-black relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(30,30,30,1)_0%,_rgba(5,5,5,1)_70%,_rgba(0,0,0,1)_100%)]" />
      <div className="relative w-full h-full">
        <ErrorBoundary fallback={<ModelError />}>
          <Canvas camera={{ position: [0, 0.5, 4.5], fov: 45 }} gl={{ preserveDrawingBuffer: true }}>
            <ambientLight intensity={0.4} />
            <spotLight position={[5, 8, 5]} angle={0.15} penumbra={1} castShadow intensity={1.2} />
            <spotLight position={[-5, 5, -5]} angle={0.2} penumbra={1} intensity={0.6} color="#e8e0ff" />
            <pointLight position={[0, -3, 0]} intensity={0.3} color="#a0a0ff" />
            {modelUrl ? (
              <ModelComponent
                key={modelUrl} url={modelUrl} onLoaded={onModelLoaded}
                onStats={onStats} onAnimations={onAnimations} onMeshesDetected={onMeshesDetected}
                wireframe={wireframe} materialColor={materialColor} onError={handleModelError}
                animIndex={animIndex} animPlaying={animPlaying} animSpeed={animSpeed}
                meshAssignments={meshAssignments}
              />
            ) : (
              <LoadingPlaceholder />
            )}
            <ContactShadows position={[0, -1.5, 0]} opacity={0.3} scale={10} blur={2} far={4} />
            <OrbitControls
              minDistance={2} maxDistance={8} enableZoom enablePan={false}
              autoRotate={autoRotate} autoRotateSpeed={0.5}
              maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 6}
            />
            <Environment preset="studio" />
          </Canvas>
        </ErrorBoundary>
      </div>
    </div>
  )
}
