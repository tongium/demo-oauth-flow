import { createMemo, createSignal, Show, For } from 'solid-js'

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

    const dataType = createMemo(() => {
        const data = props.data
        if (data === null) return 'null'
        if (Array.isArray(data)) return 'array'
        return typeof data
    })

    const arrayEntries = createMemo(() => {
        if (dataType() !== 'array') return [] as unknown[]
        return props.data as unknown[]
    })

    const objectEntries = createMemo(() => {
        if (dataType() !== 'object') return [] as [string, unknown][]
        return Object.entries(props.data as Record<string, unknown>)
    })

    const isEmpty = createMemo(() => {
        if (dataType() === 'array') return arrayEntries().length === 0
        if (dataType() === 'object') return objectEntries().length === 0
        return true
    })
    
    const toggleCollapse = (e: MouseEvent) => {
        e.stopPropagation()
        setIsCollapsed(!isCollapsed())
    }

    return (
        <Show when={dataType() === 'array' || dataType() === 'object'} fallback={
            <>
                <Show when={dataType() === 'null'}>
                    <span class='text-fuchsia-300 font-mono'>null</span>
                </Show>
                <Show when={dataType() === 'string'}>
                    <span class='text-emerald-300 font-mono'>"{props.data as string}"</span>
                </Show>
                <Show when={dataType() === 'number'}>
                    <span class='text-sky-300 font-mono'>{props.data as number}</span>
                </Show>
                <Show when={dataType() === 'boolean'}>
                    <span class='text-amber-300 font-mono'>{(props.data as boolean) ? 'true' : 'false'}</span>
                </Show>
            </>
        }>
        <div class="font-mono text-[13px] leading-6 group/item">
            <div 
                data-testid='json-viewer-toggle'
                class={`flex items-center gap-2 cursor-pointer transition-colors ${isEmpty() ? 'cursor-default' : 'hover:text-zinc-100'}`}
                onClick={isEmpty() ? undefined : toggleCollapse}
            >
                {/* Expand/Collapse Toggle */}
                {!isEmpty() && (
                    <span class={`text-[10px] w-3 transition-transform duration-200 text-zinc-500 ${isCollapsed() ? '-rotate-90' : ''}`}>
                        ▼
                    </span>
                )}
                
                <Show when={isCollapsed() && !isEmpty()} fallback={
                    <>
                        <span class='text-zinc-600'>{dataType() === 'array' ? '[' : '{'}</span>
                        {isEmpty() && <span class='text-zinc-600'>{dataType() === 'array' ? ']' : '}'}</span>}
                    </>
                }>
                    <span class='text-zinc-600'>
                        {dataType() === 'array'
                            ? `[...] ${arrayEntries().length} items`
                            : `{...} ${objectEntries().length} keys`}
                    </span>
                </Show>
            </div>

            {/* Nested Content */}
            <Show when={!isCollapsed() && !isEmpty()}>
                <div class='pl-5 border-l border-zinc-800/40 my-1 ml-1.5 space-y-0.5'>
                    {dataType() === 'array' ? (
                        <For each={arrayEntries()}>
                            {(item) => (
                                <div class="py-0.5 text-zinc-200">
                                    <JsonViewer data={item} depth={depth + 1} />
                                </div>
                            )}
                        </For>
                    ) : (
                        <For each={objectEntries()}>
                            {([key, value]) => (
                                <div class='flex py-0.5 gap-2 items-start'>
                                    <span class='text-violet-300'>"{key}"</span>
                                    <span class='text-zinc-700'>:</span>
                                    <JsonViewer data={value} depth={depth + 1} />
                                </div>
                            )}
                        </For>
                    )}
                </div>
                <div class="text-zinc-600 ml-5">{dataType() === 'array' ? ']' : '}'}</div>
            </Show>
            
        </div>
        </Show>
    )
}
