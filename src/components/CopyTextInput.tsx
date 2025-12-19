import { createSignal } from 'solid-js'

interface CopyTextInputProps {
    id: string
    value: string
    label: string
    multiline?: boolean
}

export default (props: CopyTextInputProps) => {
    const [copied, setCopied] = createSignal(false)

    const copy = () => {
        navigator.clipboard.writeText(props.value).then(() => {
            setCopied(true)
            // Reset after 2 seconds
            setTimeout(() => setCopied(false), 2000)
        })
    }

    const textClass = props.multiline
        ? 'w-full cursor-pointer px-4 py-2 bg-gray-700 border text-gray-300 border-gray-600 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition duration-200 ease-in-out overflow-auto break-all font-mono text-sm'
        : 'w-full cursor-pointer px-4 py-2 bg-gray-700 border text-gray-300 border-gray-600 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition duration-200 ease-in-out overflow-x-auto whitespace-nowrap text-ellipsis font-mono text-sm'

    return (
        <div class='group relative my-2'>
            <label for={props.id} class='block text-sm py-1 font-medium text-gray-300 text-left'>
                {props.label}
            </label>
            <div class='relative'>
                <div
                    data-testid={props.id}
                    id={props.id}
                    class={textClass}
                    onClick={copy}
                    role='button'
                    tabindex='0'
                >
                    {props.value}
                </div>
                <span class='absolute text-xs top-2 right-2 bg-gray-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-gray-400 whitespace-nowrap pointer-events-none'>
                    {copied() ? '✓ Copied!' : 'Click to Copy'}
                </span>
            </div>
        </div>
    )
}
