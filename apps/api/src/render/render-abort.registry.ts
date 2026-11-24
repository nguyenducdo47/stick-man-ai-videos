import { Injectable } from '@nestjs/common';

@Injectable()
export class RenderAbortRegistry {
  private readonly controllers = new Map<string, AbortController>();

  key(projectPublicId: string, locale: string): string {
    return `${projectPublicId}:${locale}`;
  }

  register(key: string): AbortController {
    this.clear(key);
    const controller = new AbortController();
    this.controllers.set(key, controller);
    return controller;
  }

  abort(key: string): boolean {
    const ctrl = this.controllers.get(key);
    if (!ctrl) return false;
    ctrl.abort();
    this.controllers.delete(key);
    return true;
  }

  clear(key: string): void {
    const existing = this.controllers.get(key);
    if (existing) {
      this.controllers.delete(key);
    }
  }
}