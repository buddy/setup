export enum SUPPORTED_PLATFORM {
  LINUX = 'linux',
  DARWIN = 'darwin',
  WIN32 = 'win32',
}

export enum SUPPORTED_ARCHITECTURE {
  X64 = 'x64',
  ARM64 = 'arm64',
}

export interface PlatformInfo {
  platform: SUPPORTED_PLATFORM
  architecture: SUPPORTED_ARCHITECTURE
  downloadPrefix: string
  fileExtension: string
}
