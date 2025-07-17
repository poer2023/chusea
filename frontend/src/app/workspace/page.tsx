'use client';

import { WritingWorkspace } from '@/components/writing-workspace/WritingWorkspace';

export default function WritingWorkspacePage() {
  return (
    <div className="h-screen overflow-hidden">
      <WritingWorkspace 
        documentId="workspace-demo"
        initialContent="<h1>Welcome to the AI Writing Workspace</h1><p>This is a demo of the new Holy Grail layout with integrated AI assistance. Try selecting some text and use the chat panel with slash commands like /rewrite, /expand, or /cite.</p>"
      />
    </div>
  );
}