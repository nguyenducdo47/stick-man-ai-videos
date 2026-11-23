'use client';

import type { ProjectResponse } from '@ai-video-studio/validation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiFetch } from '@/lib/api';

export function ProjectScriptPanel({ project }: { project: ProjectResponse }) {
  const queryClient = useQueryClient();
  const [scriptDraft, setScriptDraft] = useState(project.scriptDraft ?? '');

  useEffect(() => {
    setScriptDraft(project.scriptDraft ?? '');
  }, [project.scriptDraft]);

  const save = useMutation({
    mutationFn: () =>
      apiFetch<ProjectResponse>(`/v1/projects/${project.publicId}`, {
        method: 'PATCH',
        body: JSON.stringify({ scriptDraft }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['project', project.publicId] });
    },
  });

  return (
    <Card className="mb-8 border-zinc-800 bg-zinc-900/40">
      <CardHeader>
        <CardTitle className="text-base">Script draft</CardTitle>
      </CardHeader>
      <CardContent>
        <Label htmlFor="script-draft" className="sr-only">
          Script
        </Label>
        <Textarea
          id="script-draft"
          rows={6}
          value={scriptDraft}
          onChange={(e) => setScriptDraft(e.target.value)}
          placeholder="Write or paste a script manually. AI generation arrives in Phase 2."
          className="border-zinc-700 bg-zinc-950 font-mono text-sm"
        />
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          disabled={save.isPending}
          onClick={() => save.mutate()}
          variant="secondary"
        >
          {save.isPending ? 'Saving…' : 'Save script'}
        </Button>
      </CardFooter>
    </Card>
  );
}