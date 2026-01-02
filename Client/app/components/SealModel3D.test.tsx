import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SealModel3D from './SealModel3D';

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="canvas">{children}</div>,
  useFrame: vi.fn(),
  useLoader: vi.fn(() => ({
    scene: { clone: () => ({}) },
  })),
}));

// Mock @react-three/drei
vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  PerspectiveCamera: () => <div data-testid="camera" />,
  Environment: () => <div data-testid="environment" />,
  useGLTF: () => ({
    scene: { clone: () => ({}) },
    nodes: {},
    materials: {},
  }),
}));

// Mock three
vi.mock('three', () => ({
  GLTFLoader: vi.fn(),
  Box3: vi.fn(() => ({
    setFromObject: vi.fn(),
    getCenter: vi.fn(() => ({ x: 0, y: 0, z: 0 })),
    getSize: vi.fn(() => ({ x: 1, y: 1, z: 1 })),
  })),
  Vector3: vi.fn(() => ({ x: 0, y: 0, z: 0 })),
}));

describe('SealModel3D', () => {
  it('renders 3D canvas', () => {
    render(<SealModel3D modelPath="/models/seal.glb" />);

    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });

  it('renders orbit controls for interaction', () => {
    render(<SealModel3D modelPath="/models/seal.glb" />);

    expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
  });

  it('renders with custom camera position', () => {
    render(<SealModel3D modelPath="/models/seal.glb" cameraPosition={[5, 5, 5]} />);

    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });
});
