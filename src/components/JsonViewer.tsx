import { createSignal, Show, For } from 'solid-js'

/**
 * Minimalist Interactive JSON Viewer
 * 
 * Features:
 * - Collapsible objects and arrays
 * - Monochromatic zinc color palette
 * - Clear indentation and structure
 */

export interface JsonViewerProps {
    data: unknown;
    depth?: number;
    label?: string;
}

export default function JsonViewer(props: JsonViewerProps) {
    const [isCollapsed, setIsCollapsed] = createSignal(false)
    const depth = props.depth ?? 0
    
    // Simple values display
    if (props.data === null) return <span class='text-zinc-600 font-mono'>null</span>
    
    const type = typeof props.data
    if (type === 'string') return <span class='text-zinc-300 font-mono'>"{props.data as string}"</span>
    if (type === 'number') return <span class='text-zinc-400 font-mono'>{props.data as number}</span>
    if (type === 'boolean') return <span class='text-zinc-500 font-mono'>{(props.data as boolean) ? 'true' : 'false'}</span>

    // Handle Objects and Arrays
    const isArray = Array.isArray(props.data)
    const entries = isArray ? (props.data as unknown[]) : Object.entries(props.data as Record<string, unknown>)
    const isEmpty = entries.length === 0
    
    const toggleCollapse = (e: MouseEvent) => {
        e.stopPropagation()
        setIsCollapsed(!isCollapsed())
    }

    return (
        <div class="font-mono text-[13px] group/item">
            <div 
                class={`flex items-center gap-2 cursor-pointer transition-colors ${isEmpty ? 'cursor-default' : 'hover:text-zinc-100'}`}
                onClick={isEmpty ? undefined : toggleCollapse}
            >
                {/* Expand/Collapse Toggle */}
                {!isEmpty && (
                    <span class={`text-[10px] w-3 transition-transform duration-200 text-zinc-600 ${isCollapsed() ? '-rotate-90' : ''}`}>
                        ▼
                    </span>
                )}
                
                <span class='text-zinc-600'>{isArray ? '[' : '{'}</span>
                
                {/* Collapsed Preview */}
                <Show when={isCollapsed() && !isEmpty}>
                    <span class="text-[11px] text-zinc-500 italic bg-zinc-800/50 px-1 rounded">
                        {isArray ? `${entries.length} items` : '...'}
                    </span>
                </Show>
                
                {isEmpty && <span class='text-zinc-600'>{isArray ? ']' : '}'}</span>}
            </div>

            {/* Nested Content */}
            <Show when={!isCollapsed() && !isEmpty}>
                <div class='pl-4 border-l border-zinc-800/50 my-1 ml-1.5 space-y-1'>
                    {isArray ? (
                        <For each={entries as unknown[]}>
                            {(item) => (
                                <div class="py-0.5">
                                    <JsonViewer data={item} depth={depth + 1} />
                                </div>
                            )}
                        </For>
                    ) : (
                        <For each={entries as [string, unknown][]}>
                            {([key, value]) => (
                                <div class='flex py-0.5 gap-2'>
                                    <span class='text-zinc-500'>"{key}"</span>
                                    <span class='text-zinc-700'>:</span>
                                    <JsonViewer data={value} depth={depth + 1} />
                                </div>
                            )}
                        </For>
                    )}
                </div>
                <div class="text-zinc-600 ml-5">{isArray ? ']' : '}'}</div>
            </Show>
            
            {!isCollapsed() && isEmpty === false && isCollapsed() === false && (
                <Show when={false} /> /* placeholder */
            )}
            
            {isCollapsed() && !isEmpty && (
                <span class='text-zinc-600 ml-5'>{isArray ? ']' : '}'}</span>
            )}
        </div>
    )
}
