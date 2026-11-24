import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  environmentGlbFile,
  resolveDataRoot,
  stickmanHeroGlbFile,
} from '@ai-video-studio/storage';
import {
  studioAssetsRegistrySchema,
  studioAssetsStatusResponseSchema,
  type EnvironmentId,
  type StudioAssetsStatusResponse,
} from '@ai-video-studio/validation';
import { access, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

@Injectable()
export class AssetsStatusService {
  constructor(private readonly config: ConfigService) {}

  private storageRoot(): string {
    const configured = this.config.get<string>('STORAGE_ROOT') ?? './data';
    return resolveDataRoot(process.cwd(), configured);
  }

  private apiBase(): string {
    const configured = this.config.get<string>('API_PUBLIC_URL')?.trim();
    if (configured) return configured.replace(/\/$/, '');
    const host = this.config.get<string>('API_HOST') ?? '127.0.0.1';
    const port = this.config.get<string>('API_PORT') ?? '3001';
    return `http://${host}:${port}`;
  }

  async getStatus(): Promise<StudioAssetsStatusResponse> {
    const root = this.storageRoot();
    const registryPath = join(root, 'studio', 'assets.v1.json');
    let registry;
    try {
      const raw = await readFile(registryPath, 'utf8');
      registry = studioAssetsRegistrySchema.parse(JSON.parse(raw));
    } catch {
      registry = studioAssetsRegistrySchema.parse({ version: 1, items: [] });
    }

    const items = await Promise.all(
      registry.items.map(async (item) => {
        let installed = false;
        let bytes: number | null = null;
        if (item.path) {
          const abs = join(root, item.path);
          try {
            await access(abs);
            const st = await stat(abs);
            installed = true;
            bytes = st.size;
          } catch {
            installed = false;
          }
        } else if (item.kind === 'environment' && item.environmentId === 'studio_grid') {
          installed = true;
        }

        let httpUrl: string | null = null;
        if (item.kind === 'character' && installed) {
          httpUrl = `${this.apiBase()}/v1/assets/stickman-hero.glb`;
        } else if (
          item.kind === 'environment' &&
          item.environmentId &&
          item.environmentId !== 'studio_grid' &&
          installed
        ) {
          httpUrl = `${this.apiBase()}/v1/assets/environments/${item.environmentId}.glb`;
        }

        return {
          ...item,
          installed,
          bytes,
          httpUrl,
        };
      }),
    );

    return studioAssetsStatusResponseSchema.parse({
      registryVersion: registry.version,
      items,
    });
  }

  async headHeroAvailable(): Promise<boolean> {
    try {
      await access(stickmanHeroGlbFile(this.storageRoot()));
      return true;
    } catch {
      return false;
    }
  }

  async headEnvironmentAvailable(environmentId: EnvironmentId): Promise<boolean> {
    if (environmentId === 'studio_grid') return true;
    try {
      await access(environmentGlbFile(this.storageRoot(), environmentId));
      return true;
    } catch {
      return false;
    }
  }
}