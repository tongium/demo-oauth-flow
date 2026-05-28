import { createSignal } from 'solid-js'

interface CopyTextInputProps {
    id: string
    value: string
    label: string
    multiline?: boolean
}

/**
 * Minimalist Copy-on-Click Input
 * Features a monochromatic tech style with a subtle "copied" indicator.
 */
export default function CopyTextInput(props: CopyTextInputProps) {
    const [copied, setCopied] = createSignal(false)

    const copyToClipboard = () => {
        if (!props.value) return
        navigator.clipboard.writeText(props.value).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    const containerClass = props.multiline
        ? 'w-full cursor-pointer px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-300 focus:border-zinc-600 transition-all overflow-auto break-all font-mono text-[13px] leading-relaxed'
        : 'w-full cursor-pointer px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-300 focus:border-zinc-600 transition-all overflow-x-auto whitespace-nowrap text-ellipsis font-mono text-[13px]'

    return (
        <div class='group flex flex-col gap-1.5'>
            <label for={props.id} class='text-[13px] font-medium text-zinc-400'>
                {props.label}
            </label>
            <div class='relative'>
                <div
                    data-testid={props.id}
                    id={props.id}
                    class={containerClass}
                    onClick={copyToClipboard}
                    role='button'
                    tabindex='0'
                >
                    {props.value || '—'}
                </div>
                <div class={`absolute top-2 right-2 px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-bold uppercase tracking-wider transition-opacity duration-200 pointer-events-none ${copied() ? 'opacity-100 text-zinc-100' : 'opacity-0 text-zinc-500 group-hover:opacity-100'}`}>
                    {copied() ? 'Copied' : 'Copy'}
                </div>
            </div>
        </div>
    )
}
